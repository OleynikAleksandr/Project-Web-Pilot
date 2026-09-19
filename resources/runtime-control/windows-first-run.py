#!/usr/bin/env python3
"""Private Windows tunnel setup. Only non-secret results leave this worker."""
import base64
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


def prompt_script(message, hidden=False):
    message64 = base64.b64encode(message.encode('utf-8')).decode('ascii')
    return r'''
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$form = New-Object System.Windows.Forms.Form
$form.Text = 'Project Web Pilot'
$form.ClientSize = New-Object System.Drawing.Size(510, 190)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.TopMost = $true
$label = New-Object System.Windows.Forms.Label
$label.Location = New-Object System.Drawing.Point(16, 16)
$label.Size = New-Object System.Drawing.Size(478, 70)
$label.Text = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(''' + "'" + message64 + "'" + r'''))
$field = New-Object System.Windows.Forms.TextBox
$field.Location = New-Object System.Drawing.Point(16, 91)
$field.Size = New-Object System.Drawing.Size(478, 25)
$field.MaxLength = 4096
$field.UseSystemPasswordChar = ''' + ('$true' if hidden else '$false') + r'''
$confirm = New-Object System.Windows.Forms.Button
$confirm.Text = 'OK'
$confirm.Location = New-Object System.Drawing.Point(274, 140)
$confirm.Size = New-Object System.Drawing.Size(105, 30)
$confirm.DialogResult = [System.Windows.Forms.DialogResult]::OK
$cancel = New-Object System.Windows.Forms.Button
$cancel.Text = 'Cancel'
$cancel.Location = New-Object System.Drawing.Point(389, 140)
$cancel.Size = New-Object System.Drawing.Size(105, 30)
$cancel.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
$form.Controls.AddRange(@($label, $field, $confirm, $cancel))
$form.AcceptButton = $confirm
$form.CancelButton = $cancel
$form.Add_Shown({$form.Activate(); $field.Focus()})
try {
    if ($form.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        @{value=$field.Text} | ConvertTo-Json -Compress
    } else { @{cancelled=$true} | ConvertTo-Json -Compress }
} finally { $field.Clear(); $form.Dispose() }
'''


def prompt(message, hidden=False):
    encoded = base64.b64encode(prompt_script(message, hidden).encode('utf-16-le')).decode('ascii')
    try:
        result = subprocess.run(['powershell.exe', '-NoLogo', '-NoProfile', '-STA',
                                 '-EncodedCommand', encoded], capture_output=True, text=True,
                                encoding='utf-8', timeout=900, creationflags=subprocess.CREATE_NO_WINDOW)
        if result.returncode:
            raise PromptFailure()
        value = json.loads(result.stdout.lstrip('\ufeff'))
        if value.get('cancelled') is True:
            raise Cancelled()
        if not isinstance(value.get('value'), str):
            raise PromptFailure()
        return value['value'].strip()
    except (OSError, subprocess.TimeoutExpired, ValueError) as error:
        raise PromptFailure() from error


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
    supplied = supplied if supplied is not None else {}
    tunnel_id = supplied.get('tunnel_id')
    if tunnel_id is None:
        tunnel_id = ask('Вставьте ID туннеля этого Windows-компьютера из OpenAI Platform → Tunnels.')
    key = supplied.get('api_key')
    if key is None:
        key = ask('Вставьте личный ключ с правами Tunnels: Read и Use. Ключ будет защищён средствами Windows.', hidden=True)
    if not isinstance(tunnel_id, str) or not isinstance(key, str):
        raise ValueError('Invalid input')
    tunnel_id, key = tunnel_id.strip(), key.strip()
    if len(tunnel_id) > 150 or len(key) > 4096:
        raise ValueError('Invalid input')
    # Validate everything before stopping a service or replacing private files.
    control['make_profile'](tunnel_id)
    if not key.startswith('sk-') or len(key) < 20 or any(c.isspace() for c in key):
        raise ValueError('Invalid input')
    if not control['CONFIG'].is_file():
        raise RuntimeError('Components are not prepared')
    with control['operation_lock']():
        for name in ('mcp', 'tunnel'):
            process = control['managed_process'](name)
            if process['running'] and not process['owned']:
                raise RuntimeError('Runtime belongs to another process')
        saved = {name: control[name].read_bytes() if control[name].is_file() else None
                 for name in ('KEY_FILE', 'PROFILE')}
        control['stop']()
        try:
            control['configure_tunnel'](tunnel_id, key)
        except Exception:
            for name, data in saved.items():
                if data is None:
                    control[name].unlink(missing_ok=True)
                else:
                    control['write_private'](control[name], data)
            raise
    return {'configured': True}


def main():
    if sys.platform != 'win32':
        raise RuntimeError('Windows only')
    supplied = read_input(sys.stdin) if sys.argv[1:] == ['--stdin'] else None
    try:
        if sys.argv[1:] == ['--tunnel-id']:
            result = collect_tunnel_id()
        else:
            control = runpy.run_path(str(Path(__file__).with_name('windows-control.py')), run_name='web_pilot_control')
            result = configure(control, supplied=supplied)
    except Cancelled:
        result = {'cancelled': True}
    print(json.dumps(result))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        code = ('WINDOWS_TUNNEL_ID_INVALID' if isinstance(error, TunnelIdError) else
                'WINDOWS_TUNNEL_PROMPT_FAILED' if isinstance(error, PromptFailure) else
                'WINDOWS_TUNNEL_INVALID_DATA' if isinstance(error, ValueError) else
                'WINDOWS_TUNNEL_SETUP_FAILED')
        print(json.dumps({'ok': False, 'code': code}), file=sys.stderr)
        raise SystemExit(1)
