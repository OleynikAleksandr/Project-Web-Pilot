#!/usr/bin/env python3
"""Native first-run prompts. Secrets stay in this worker and the private runtime store."""
import json
from pathlib import Path
import runpy
import subprocess
import sys

class Cancelled(Exception):
    pass

def prompt(message, hidden=False):
    script = ('text returned of (display dialog ' + json.dumps(message) +
              ' with title "Project Web Pilot" default answer ""' +
              (' with hidden answer' if hidden else '') +
              ' buttons {"Отмена", "Продолжить"} default button "Продолжить" cancel button "Отмена")')
    result = subprocess.run(['/usr/bin/osascript', '-e', script],
                            capture_output=True, text=True, timeout=900)
    if result.returncode:
        if '-128' in result.stderr:
            raise Cancelled()
        raise RuntimeError('Не удалось открыть окно ввода подключения.')
    return result.stdout.strip()

def configure(control, ask=prompt):
    # Collect both values before taking the runtime lock or modifying any file.
    tunnel_id = ask('Вставьте tunnel_id, полученный в OpenAI Platform → Tunnels.')
    key = ask('Вставьте личный ключ OpenAI с правами Tunnels: Read и Use. Он сохранится только на этом компьютере.', hidden=True)
    if len(tunnel_id) > 150 or len(key) > 4096:
        raise RuntimeError('Проверьте длину введённых данных.')
    with control['operation_lock']():
        control['configure_tunnel'](tunnel_id, key)
    return {'configured': True}

def main():
    if sys.platform != 'darwin':
        raise RuntimeError('Нативная настройка доступна только на macOS.')
    control = runpy.run_path(str(Path(__file__).with_name('mac-control.py')), run_name='web_pilot_control')
    try:
        result = configure(control)
    except Cancelled:
        result = {'cancelled': True}
    print(json.dumps(result))

if __name__ == '__main__':
    try:
        main()
    except Exception:
        # Never surface captured native dialog stdout, keys, or command arguments.
        print(json.dumps({'ok': False, 'error': 'Не удалось сохранить подключение. Проверьте идентификатор и ключ.'}), file=sys.stderr)
        raise SystemExit(1)
