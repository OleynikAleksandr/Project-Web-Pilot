#!/usr/bin/env python3
"""Install and run Codex Local Mac without modifying global MCP configuration."""
from __future__ import annotations

import argparse
import asyncio
import contextlib
import fcntl
import getpass
import hashlib
import io
import json
import os
from pathlib import Path
import platform
import re
import secrets
import shutil
import signal
import socket
import subprocess
import sys
import time
import urllib.request
import zipfile

ROOT=Path(__file__).resolve().parent
VENV=ROOT/'.venv'
PYTHON=VENV/'bin/python'
CLIENT=ROOT/'tools/tunnel-client'
STATE=Path(os.environ.get('CODEX_LOCAL_MAC_STATE_DIR') or Path.home()/'Library/Application Support/CodexLocalMac')
PRIVATE=STATE/'private'
CONFIG=PRIVATE/'bridge_config.json'
PROFILE_DIR=PRIVATE/'tunnel-profile'
PROFILE=PROFILE_DIR/'mac-local.yaml'
KEY_FILE=PRIVATE/'tunnel-key'
RUNTIME_CONTRACT=2
DEFAULT_MCP_PORT=17842
DEFAULT_TUNNEL_PORT=17843
ENDPOINTS=PRIVATE/'runtime-endpoints.json'


def private_write(path: Path, content: str):
    path.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
    path.parent.chmod(0o700)
    temporary=path.with_name(path.name+'.'+secrets.token_hex(8)+'.tmp')
    try:
        fd=os.open(temporary,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        with os.fdopen(fd,'w',encoding='utf-8') as handle:
            handle.write(content)
        os.replace(temporary,path)
    finally:
        temporary.unlink(missing_ok=True)




def _valid_port(value):
    return isinstance(value,int) and 1024 <= value <= 65535

def load_endpoints():
    data={'mcp_port':DEFAULT_MCP_PORT,'tunnel_port':DEFAULT_TUNNEL_PORT}
    if ENDPOINTS.is_file():
        try:
            parsed=json.loads(ENDPOINTS.read_text())
            if _valid_port(parsed.get('mcp_port')): data['mcp_port']=parsed['mcp_port']
            if _valid_port(parsed.get('tunnel_port')): data['tunnel_port']=parsed['tunnel_port']
        except Exception:
            pass
    if data['mcp_port']==data['tunnel_port']:
        data['tunnel_port']=DEFAULT_TUNNEL_PORT if DEFAULT_TUNNEL_PORT!=data['mcp_port'] else data['mcp_port']+1
    return data

def port_available(port):
    sock=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    try:
        sock.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,0)
        sock.bind(('127.0.0.1',port))
        return True
    except OSError:
        return False
    finally:
        sock.close()

def choose_free_port(preferred,reserved=()):
    reserved=set(reserved)
    if preferred not in reserved and port_available(preferred):
        return preferred
    for _ in range(20):
        sock=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
        try:
            sock.bind(('127.0.0.1',0)); candidate=sock.getsockname()[1]
        finally:
            sock.close()
        if candidate not in reserved and port_available(candidate):
            return candidate
    raise RuntimeError('Не удалось выбрать свободный loopback-порт.')

def persist_endpoints(mcp_port,tunnel_port):
    if not (_valid_port(mcp_port) and _valid_port(tunnel_port)) or mcp_port==tunnel_port:
        raise ValueError('Некорректные runtime endpoints')
    if CONFIG.is_file():
        config=json.loads(CONFIG.read_text())
        config['port']=mcp_port
        private_write(CONFIG,json.dumps(config,ensure_ascii=False,indent=2)+'\n')
    if PROFILE.is_file():
        profile=json.loads(PROFILE.read_text())
        profile.setdefault('health',{})['listen_addr']=f'127.0.0.1:{tunnel_port}'
        profile.setdefault('mcp',{})['server_urls']=[{'channel':'main','url':f'http://127.0.0.1:{mcp_port}/mcp'}]
        private_write(PROFILE,json.dumps(profile,ensure_ascii=False,indent=2)+'\n')
    private_write(ENDPOINTS,json.dumps({'schema_version':1,'mcp_port':mcp_port,'tunnel_port':tunnel_port},indent=2)+'\n')
    return {'mcp_port':mcp_port,'tunnel_port':tunnel_port}

def reconcile_endpoints():
    ports=load_endpoints()
    mcp=managed_process('mcp'); tunnel=managed_process('tunnel')
    mcp_port=ports['mcp_port']; tunnel_port=ports['tunnel_port']
    if not mcp['owned'] and not port_available(mcp_port):
        mcp_port=choose_free_port(DEFAULT_MCP_PORT,{tunnel_port})
    if not tunnel['owned'] and not port_available(tunnel_port):
        tunnel_port=choose_free_port(DEFAULT_TUNNEL_PORT,{mcp_port})
    if (mcp_port,tunnel_port)!=(ports['mcp_port'],ports['tunnel_port']) or not ENDPOINTS.is_file():
        persist_endpoints(mcp_port,tunnel_port)
    return {'mcp_port':mcp_port,'tunnel_port':tunnel_port}


def environment():
    env=os.environ.copy()
    env['CODEX_LOCAL_MAC_STATE_DIR']=str(STATE)
    env['PYTHONDONTWRITEBYTECODE']='1'
    # Desktop launchers do not inherit the interactive shell's Homebrew PATH.
    extra=[]
    if os.environ.get('WEB_PILOT_UV'): extra.append(str(Path(os.environ['WEB_PILOT_UV']).resolve().parent))
    env['PATH']=os.pathsep.join([str(VENV/'bin'),*extra,'/opt/homebrew/bin','/usr/local/bin',str(Path.home()/'.local/bin'),env.get('PATH',''),'/usr/bin','/bin','/usr/sbin','/sbin'])
    return env


@contextlib.contextmanager
def operation_lock():
    STATE.mkdir(parents=True,exist_ok=True,mode=0o700)
    STATE.chmod(0o700)
    with (STATE/'control.lock').open('a') as handle:
        try:
            fcntl.flock(handle,fcntl.LOCK_EX|fcntl.LOCK_NB)
        except BlockingIOError:
            raise RuntimeError('Другая операция установки/запуска ещё выполняется.') from None
        try:
            yield
        finally:
            fcntl.flock(handle,fcntl.LOCK_UN)


def download(url):
    request=urllib.request.Request(url,headers={'User-Agent':'CodexLocalMac/0.1'})
    with urllib.request.urlopen(request,timeout=60) as response:
        return response.read()


def install_tunnel_client():
    CLIENT.parent.mkdir(parents=True,exist_ok=True)
    if CLIENT.is_file():
        result=subprocess.run([str(CLIENT),'--version'],capture_output=True,text=True,timeout=10)
        if result.returncode==0:
            return result.stdout.strip()
        raise RuntimeError('Установленный tunnel-client не запускается: '+result.stderr[:300])
    release=json.loads(download('https://api.github.com/repos/openai/tunnel-client/releases/latest'))
    arch={'arm64':'arm64','x86_64':'amd64'}.get(platform.machine())
    if arch is None:
        raise RuntimeError('Неподдерживаемая архитектура Mac')
    name=f"tunnel-client-{release['tag_name']}-darwin-{arch}.zip"
    assets={a['name']:a['browser_download_url'] for a in release['assets']}
    for key in (name,'SHA256SUMS.txt'):
        if key not in assets or not assets[key].startswith('https://github.com/openai/tunnel-client/releases/download/'):
            raise RuntimeError('Не найден официальный архив tunnel-client для этого Mac')
    archive=download(assets[name])
    lines=download(assets['SHA256SUMS.txt']).decode().splitlines()
    expected=next((line.split()[0].lower() for line in lines if line.split()[-1].lstrip('*')==name),None)
    digest=hashlib.sha256(archive).hexdigest()
    if expected is None or digest!=expected:
        raise RuntimeError('SHA-256 архива tunnel-client не совпадает')
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        binary=next((n for n in z.namelist() if Path(n).name=='tunnel-client'),None)
        if binary is None:
            raise RuntimeError('В архиве нет tunnel-client')
        CLIENT.write_bytes(z.read(binary)); CLIENT.chmod(0o755)
        for n in z.namelist():
            if Path(n).name in ('LICENSE','NOTICE') or Path(n).name.endswith('-licenses.txt'):
                (CLIENT.parent/Path(n).name).write_bytes(z.read(n))
    (CLIENT.parent/'release.json').write_text(json.dumps({'release':release['tag_name'],'archive_sha256':digest,'url':assets[name]},indent=2)+'\n')
    return subprocess.check_output([str(CLIENT),'--version'],text=True,timeout=10).strip()


def setup(workspace: Path):
    if sys.platform!='darwin':
        raise RuntimeError('Этот вариант предназначен только для macOS')
    workspace=workspace.expanduser().resolve()
    if not workspace.is_dir():
        raise ValueError('Рабочая папка не существует')
    uv=os.environ.get('WEB_PILOT_UV') or shutil.which('uv')
    if not PYTHON.is_file():
        if uv:
            subprocess.run([uv,'venv','--python','3.13',str(VENV)],check=True)
        else:
            if sys.version_info<(3,13):
                raise RuntimeError('Для установки требуется Python 3.13+ или uv')
            subprocess.run([sys.executable,'-m','venv',str(VENV)],check=True)
    installer=[uv,'pip','install','--python',str(PYTHON)] if uv else [str(PYTHON),'-m','pip','install']
    subprocess.run([*installer,'-r',str(ROOT/'requirements.txt')],check=True)
    if not CONFIG.exists():
        private_write(CONFIG,json.dumps({'repo':str(workspace),'token':secrets.token_urlsafe(32),'port':load_endpoints()['mcp_port']},indent=2)+'\n')
    version=install_tunnel_client()
    return {'installed':True,'tunnel_client_version':version,'workspace':json.loads(CONFIG.read_text())['repo'],
            'next':'Запустите START.command. Для ChatGPT затем настройте свой tunnel: control.py configure-tunnel.'}


def configure_tunnel(tunnel_id: str, key: str):
    if not re.fullmatch(r'tunnel_[A-Za-z0-9_-]{16,100}',tunnel_id):
        raise ValueError('Нужен настоящий tunnel_id из вашего аккаунта OpenAI')
    if len(key)<16 or any(c.isspace() for c in key):
        raise ValueError('Ключ tunnel пустой или содержит пробелы')
    if managed_process('tunnel')['running']:
        raise RuntimeError('Сначала остановите текущий tunnel командой stop; конфигурация работающего процесса не меняется.')
    ports=load_endpoints()
    profile={'config_version':1,'control_plane':{'base_url':'https://api.openai.com','tunnel_id':tunnel_id,'api_key':'env:CODEX_LOCAL_MAC_TUNNEL_API_KEY'},
             'health':{'listen_addr':f"127.0.0.1:{ports['tunnel_port']}"},'admin_ui':{'open_browser':False},
             'log':{'level':'info','format':'json'},'mcp':{'server_urls':[{'channel':'main','url':f"http://127.0.0.1:{ports['mcp_port']}/mcp"}]}}
    private_write(KEY_FILE,key+'\n')
    private_write(PROFILE,json.dumps(profile,indent=2)+'\n')
    return {'configured':True,'tunnel_id':tunnel_id,'next':'Запустите START.command и проверьте ready=true перед подключением плагина.'}


def pid_identity(pid):
    if not isinstance(pid,int) or pid<=1:
        return None
    result=subprocess.run(['/bin/ps','-p',str(pid),'-o','lstart=','-o','command='],capture_output=True,text=True,timeout=3)
    return result.stdout.strip() if result.returncode==0 and result.stdout.strip() else None


def managed_process(name):
    file=STATE/(name+'.pid.json')
    if not file.is_file():
        return {'running':False,'owned':False,'pid':None,'stale_cleaned':False}
    try:
        data=json.loads(file.read_text())
    except Exception:
        file.unlink(missing_ok=True)
        return {'running':False,'owned':False,'pid':None,'stale_cleaned':True}
    pid=data.get('pid'); actual=pid_identity(pid); expected=data.get('identity')
    if actual!=expected:
        # PID disappeared or was reused. The record is ours; the process is not. Never signal it.
        file.unlink(missing_ok=True)
        return {'running':False,'owned':False,'pid':None,'stale_cleaned':True}
    return {'running':True,'owned':True,'pid':pid,'stale_cleaned':False}


def launch(name,argv,env):
    STATE.mkdir(parents=True,exist_ok=True,mode=0o700)
    out=STATE/(name+'.out.log'); err=STATE/(name+'.err.log')
    for file in (out,err):
        file.touch(mode=0o600,exist_ok=True);file.chmod(0o600)
    with out.open('ab') as stdout,err.open('ab') as stderr:
        process=subprocess.Popen(argv,cwd=str(ROOT),env=env,stdin=subprocess.DEVNULL,
                                 stdout=stdout,stderr=stderr,start_new_session=True,close_fds=True)
    identity=pid_identity(process.pid)
    if identity is None or process.poll() is not None:
        raise RuntimeError(f'{name} завершился при старте; см. {err}')
    private_write(STATE/(name+'.pid.json'),json.dumps({'pid':process.pid,'identity':identity},indent=2)+'\n')
    return process.pid


def port_open(port):
    try:
        with socket.create_connection(('127.0.0.1',port),timeout=0.3):
            return True
    except OSError:
        return False


async def mcp_probe_async(port):
    from mcp import ClientSession
    from mcp.client.streamable_http import streamable_http_client
    async with streamable_http_client(f'http://127.0.0.1:{port}/mcp') as (read,write,_):
        async with ClientSession(read,write) as session:
            result=await session.initialize()
            return result.serverInfo.name=='Codex Local Mac'


def mcp_ready(port):
    if not port_open(port):
        return False
    try:
        return asyncio.run(asyncio.wait_for(mcp_probe_async(port),timeout=3))
    except Exception:
        return False


def tunnel_ready(port):
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{port}/readyz',timeout=1) as response:
            return response.status==200 and response.read().decode().strip().strip('"')=='ready'
    except Exception:
        return False


def status():
    ports=load_endpoints()
    mcp=managed_process('mcp'); tunnel=managed_process('tunnel')
    mcp['ready']=bool(mcp['owned'] and mcp_ready(ports['mcp_port']))
    tunnel['ready']=bool(tunnel['owned'] and tunnel_ready(ports['tunnel_port']))
    tunnel['configured']=PROFILE.is_file() and KEY_FILE.is_file()
    return {'runtime_contract':RUNTIME_CONTRACT,'package_root':str(ROOT),'mcp':mcp,'tunnel':tunnel,
            'mcp_url':f"http://127.0.0.1:{ports['mcp_port']}/mcp",
            'tunnel_ui':f"http://127.0.0.1:{ports['tunnel_port']}/ui",
            'endpoints':ports,'state_directory':str(STATE)}


def start(mcp_only=False):
    if not PYTHON.is_file() or not CONFIG.is_file():
        raise RuntimeError('Сначала выполните SETUP.command')
    env=environment(); ports=reconcile_endpoints()
    mcp=managed_process('mcp')
    if not mcp['owned']:
        # A foreign listener is never stopped; reconcile_endpoints has already moved us away from it.
        launch('mcp',[str(PYTHON),'-B',str(ROOT/'mcp/bridge_mcp.py'),'--config',str(CONFIG),'--port',str(ports['mcp_port'])],env)
    deadline=time.monotonic()+20
    while not mcp_ready(ports['mcp_port']):
        if time.monotonic()>deadline or not managed_process('mcp')['owned']:
            raise RuntimeError(f'MCP не прошёл инициализацию; см. {STATE}/mcp.err.log')
        time.sleep(0.3)
    if mcp_only or not (PROFILE.is_file() and KEY_FILE.is_file()):
        result=status()
        result['next']='Локальный MCP готов. Настройте личный tunnel для ChatGPT.' if not result['tunnel']['configured'] else 'Запущен только локальный MCP.'
        return result
    if not CLIENT.is_file():
        raise RuntimeError('Отсутствует tunnel-client; повторите SETUP.command')
    # MCP may have moved; make sure the existing profile follows the actual endpoint before tunnel start.
    persist_endpoints(ports['mcp_port'],ports['tunnel_port'])
    tunnel=managed_process('tunnel')
    if not tunnel['owned']:
        if not port_available(ports['tunnel_port']):
            ports['tunnel_port']=choose_free_port(DEFAULT_TUNNEL_PORT,{ports['mcp_port']})
            persist_endpoints(ports['mcp_port'],ports['tunnel_port'])
        env['CODEX_LOCAL_MAC_TUNNEL_API_KEY']=KEY_FILE.read_text().strip()
        launch('tunnel',[str(CLIENT),'run','--profile','mac-local','--profile-dir',str(PROFILE_DIR)],env)
    deadline=time.monotonic()+40
    while not tunnel_ready(ports['tunnel_port']):
        if time.monotonic()>deadline or not managed_process('tunnel')['owned']:
            raise RuntimeError(f'Tunnel ещё не ready; см. {STATE}/tunnel.err.log. Локальный MCP продолжает работать.')
        time.sleep(0.5)
    return status()


def stop_one(name):
    process=managed_process(name)
    if process['running'] and not process['owned']:
        raise RuntimeError(f'Отказ остановки {name}: PID используется другим процессом.')
    if process['owned']:
        pid=process['pid']
        # Re-read identity immediately before sending the signal.
        record=json.loads((STATE/(name+'.pid.json')).read_text())
        if pid_identity(pid)!=record['identity']:
            raise RuntimeError('Процесс изменился перед остановкой')
        try:
            os.killpg(pid,signal.SIGTERM)
        except ProcessLookupError:
            pass
        deadline=time.monotonic()+5
        while pid_identity(pid)==record['identity'] and time.monotonic()<deadline:
            time.sleep(0.1)
        if pid_identity(pid)==record['identity']:
            os.killpg(pid,signal.SIGKILL)
    (STATE/(name+'.pid.json')).unlink(missing_ok=True)
    return {'stopped':True,'service':name}


def main():
    parser=argparse.ArgumentParser(description='Codex Local Mac: установка, запуск и подключение ChatGPT')
    sub=parser.add_subparsers(dest='command',required=True)
    setup_parser=sub.add_parser('setup');setup_parser.add_argument('--workspace',type=Path,default=Path.home())
    start_parser=sub.add_parser('start');start_parser.add_argument('--mcp-only',action='store_true')
    sub.add_parser('status');sub.add_parser('stop')
    configure=sub.add_parser('configure-tunnel');configure.add_argument('--tunnel-id')
    args=parser.parse_args()
    if args.command!='setup' and PYTHON.is_file() and Path(sys.prefix).resolve()!=VENV.resolve():
        os.execve(str(PYTHON),[str(PYTHON),'-B',str(Path(__file__).resolve()),*sys.argv[1:]],environment())
    try:
        with operation_lock():
            if args.command=='setup':
                result=setup(args.workspace)
            elif args.command=='configure-tunnel':
                tunnel_id=args.tunnel_id or input('Ваш tunnel_id: ').strip()
                key=getpass.getpass('Runtime key tunnel (ввод скрыт, в чат не отправляется): ').strip()
                result=configure_tunnel(tunnel_id,key)
            elif args.command=='start':
                result=start(args.mcp_only)
            elif args.command=='stop':
                result={'services':[stop_one('tunnel'),stop_one('mcp')]}
            else:
                result=status()
        print(json.dumps(result,ensure_ascii=False,indent=2))
    except Exception as error:
        print(json.dumps({'ok':False,'error':str(error)},ensure_ascii=False),file=sys.stderr)
        raise SystemExit(1)


if __name__=='__main__':
    main()
