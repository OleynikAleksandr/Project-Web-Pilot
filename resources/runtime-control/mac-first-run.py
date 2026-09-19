#!/usr/bin/env python3
"""Native first-run prompts. Secrets stay in this worker and the private runtime store."""
import json
from pathlib import Path
import re
import runpy
import subprocess
import sys

class Cancelled(Exception):
    pass

class PromptFailure(Exception):
    pass

def prompt(message, hidden=False):
    script = ('text returned of (display dialog ' + json.dumps(message, ensure_ascii=False) +
              ' with title "Project Web Pilot" default answer ""' +
              (' with hidden answer' if hidden else '') +
              ' buttons {"Отмена", "Продолжить"} default button "Продолжить" cancel button "Отмена")')
    try:
        result = subprocess.run(['/usr/bin/osascript', '-e', script],
                                capture_output=True, text=True, timeout=900)
    except (OSError, subprocess.TimeoutExpired) as error:
        raise PromptFailure() from error
    if result.returncode:
        if '-128' in result.stderr:
            raise Cancelled()
        raise PromptFailure()
    return result.stdout.strip()

class TunnelIdError(ValueError):
    pass


def collect_tunnel_id(ask=prompt):
    value = ask('Шаг 1 из 2. Вставьте ID туннеля из OpenAI Platform → Tunnels. Он начинается с tunnel_. Подтвердите ввод; инструкция API key откроется следующим шагом.')
    if not isinstance(value, str) or len(value) > 150 or not re.fullmatch(r'tunnel_[A-Za-z0-9_-]{16,100}', value.strip()):
        raise TunnelIdError('Invalid tunnel ID')
    return {'tunnel_id': value.strip()}


def read_input(stream):
    raw = stream.read(8193)
    if len(raw) > 8192:
        raise ValueError('Invalid input')
    value = json.loads(raw)
    if not isinstance(value, dict) or set(value) - {'tunnel_id', 'api_key'}:
        raise ValueError('Invalid input')
    if any(not isinstance(v, str) for v in value.values()):
        raise ValueError('Invalid input')
    return value


def configure(control, ask=prompt, supplied=None):
    # Collect both values before taking the runtime lock or modifying any file.
    supplied = supplied if supplied is not None else {}
    tunnel_id = supplied.get('tunnel_id')
    if tunnel_id is None:
        tunnel_id = ask('Вставьте tunnel_id, полученный в OpenAI Platform → Tunnels.')
    key = supplied.get('api_key')
    if key is None:
        key = ask('Вставьте личный ключ OpenAI с правами Tunnels: Read и Use. Он сохранится только на этом компьютере.', hidden=True)
    if not isinstance(tunnel_id, str) or not isinstance(key, str):
        raise ValueError('Invalid input')
    if len(tunnel_id) > 150 or len(key) > 4096:
        raise ValueError('Проверьте длину введённых данных.')
    with control['operation_lock']():
        control['configure_tunnel'](tunnel_id, key)
    return {'configured': True}

def main():
    if sys.platform != 'darwin':
        raise RuntimeError('Нативная настройка доступна только на macOS.')
    supplied = read_input(sys.stdin) if sys.argv[1:] == ['--stdin'] else None
    try:
        if sys.argv[1:] == ['--tunnel-id']:
            result = collect_tunnel_id()
        else:
            control = runpy.run_path(str(Path(__file__).with_name('mac-control.py')), run_name='web_pilot_control')
            result = configure(control, supplied=supplied)
    except Cancelled:
        result = {'cancelled': True}
    print(json.dumps(result))

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Never surface captured native dialog stdout, keys, or command arguments.
        code = ('MAC_TUNNEL_ID_INVALID' if isinstance(error, TunnelIdError) else
                'MAC_TUNNEL_PROMPT_FAILED' if isinstance(error, PromptFailure) else
                'MAC_TUNNEL_INVALID_DATA' if isinstance(error, ValueError) else
                'MAC_TUNNEL_SETUP_FAILED')
        print(json.dumps({'ok': False, 'code': code}), file=sys.stderr)
        raise SystemExit(1)
