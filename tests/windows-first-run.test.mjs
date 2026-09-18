import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const execute = promisify(execFile);
const helper = fileURLToPath(new URL('../resources/runtime-control/windows-first-run.py', import.meta.url));
async function run(script) {
  return execute('python3', ['-B', '-c', `
import contextlib,io,json,pathlib,re,runpy,tempfile
h=runpy.run_path(${JSON.stringify(helper)},run_name='test_helper')
with tempfile.TemporaryDirectory() as directory:
 root=pathlib.Path(directory)
 calls=[]
 def profile(value):
  if not re.fullmatch(r'tunnel_[A-Za-z0-9_-]{16,100}',value): raise ValueError('bad id')
  return {'tunnel_id':value}
 def write(path,data): path.write_bytes(data if isinstance(data,bytes) else data.encode())
 def configure(tunnel,key):
  calls.append('configure')
  write(root/'key',b'encrypted-fixture')
  write(root/'profile',json.dumps(profile(tunnel)))
 c={'CONFIG':root/'config','KEY_FILE':root/'key','PROFILE':root/'profile',
    'make_profile':profile,'operation_lock':contextlib.nullcontext,
    'managed_process':lambda name: {'running':True,'owned':True},
    'stop':lambda: calls.append('stop'),'configure_tunnel':configure,'write_private':write}
 c['CONFIG'].write_text('{}')
 secret='sk-fixture_only_1234567890'
 supplied={'tunnel_id':'tunnel_fixture1234567890123456','api_key':secret}
${script.split('\n').map(line => ' '+line).join('\n')}
`], { timeout: 10000, maxBuffer: 128 * 1024 });
}
test('Windows input cancellation and invalid values leave services and old settings intact', async () => {
  const result = await run(`
c['KEY_FILE'].write_bytes(b'old-protected-key')
c['PROFILE'].write_bytes(b'old-profile')
def cancel(message,hidden=False):
 if hidden: raise h['Cancelled']()
 return supplied['tunnel_id']
try: h['configure'](c,cancel)
except h['Cancelled']: pass
else: raise AssertionError('not cancelled')
for values in [dict(supplied,tunnel_id='bad'),dict(supplied,api_key='bad')]:
 try: h['configure'](c,supplied=values)
 except ValueError: pass
 else: raise AssertionError('invalid accepted')
assert calls==[]
assert c['KEY_FILE'].read_bytes()==b'old-protected-key'
assert c['PROFILE'].read_bytes()==b'old-profile'
print('unchanged')`);
  assert.equal(result.stdout.trim(), 'unchanged');
});
test('private stdin and partial manual entry configure through existing protected storage', async () => {
  const { stdout, stderr } = await run(`
def forbidden(*args,**kwargs): raise AssertionError('unexpected prompt')
data=h['read_input'](io.StringIO(json.dumps(supplied)))
assert h['configure'](c,forbidden,data)=={'configured':True}
assert calls==['stop','configure']
assert secret.encode() not in c['KEY_FILE'].read_bytes()
assert secret not in c['PROFILE'].read_text()
def only_key(message,hidden=False):
 assert hidden
 return secret
assert h['configure'](c,only_key,{'tunnel_id':supplied['tunnel_id']})=={'configured':True}
print('protected')`);
  assert.equal(stdout.trim(), 'protected');
  assert.doesNotMatch(stdout + stderr, /sk-fixture/);
});
test('foreign processes prevent configuration and a failed write restores both private files', async () => {
  const { stdout } = await run(`
c['managed_process']=lambda name: {'running':True,'owned':False}
try: h['configure'](c,supplied=supplied)
except RuntimeError: pass
else: raise AssertionError('foreign accepted')
assert not calls
c['managed_process']=lambda name: {'running':True,'owned':True}
c['KEY_FILE'].write_bytes(b'old-key')
c['PROFILE'].write_bytes(b'old-profile')
def fail(tunnel,key):
 c['KEY_FILE'].write_bytes(b'changed-key')
 raise OSError('fixture failed write')
c['configure_tunnel']=fail
try: h['configure'](c,supplied=supplied)
except OSError: pass
else: raise AssertionError('failure ignored')
assert calls==['stop']
assert c['KEY_FILE'].read_bytes()==b'old-key'
assert c['PROFILE'].read_bytes()==b'old-profile'
print('restored')`);
  assert.equal(stdout.trim(), 'restored');
});
test('native Windows prompts use Unicode, hidden password and safe cancellation/failure outcomes', async () => {
  const { stdout } = await run(`
import base64,subprocess
from unittest.mock import patch
captured=[]
def dialog(args,**kwargs):
 script=base64.b64decode(args[-1]).decode('utf-16-le')
 assert '-STA' in args and '-EncodedCommand' in args
 assert secret not in script and 'TopMost = $true' in script
 assert '$field.UseSystemPasswordChar = $true' in script
 captured.append(script)
 return subprocess.CompletedProcess(args,0,stdout=json.dumps({'value':secret}),stderr='')
with patch.object(subprocess,'CREATE_NO_WINDOW',0,create=True),patch('subprocess.run',dialog):
 assert h['prompt']('Русский текст',True)==secret
def cancel(*args,**kwargs): return subprocess.CompletedProcess(args,0,stdout='{"cancelled":true}',stderr='')
with patch.object(subprocess,'CREATE_NO_WINDOW',0,create=True),patch('subprocess.run',cancel):
 try: h['prompt']('fixture',True)
 except h['Cancelled']: pass
 else: raise AssertionError('missing cancellation')
for raw in ['[]','{"api_key":12}','{"extra":"value"}','x'*8193]:
 try: h['read_input'](io.StringIO(raw))
 except ValueError: pass
 else: raise AssertionError('unbounded input')
print('safe')`);
  assert.equal(stdout.trim(), 'safe');
});
