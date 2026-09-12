import path from 'node:path';

function pathApi(platform) {
  return platform === 'win32' ? path.win32 : path.posix;
}

export function runtimeFolderCandidates(input, platform = process.platform) {
  const api = pathApi(platform);
  const names = platform === 'darwin'
    ? ['', 'mac-codex-local']
    : platform === 'win32'
      ? ['', 'windows-codex-local', 'codex-local']
      : ['', 'codex-local'];
  return [...new Set(names.map(name => name ? api.join(input, name) : input))];
}

export function runtimeLayout(folder, platform = process.platform) {
  const api = pathApi(platform);
  return {
    control: api.join(folder, 'control.py'),
    python: platform === 'win32'
      ? api.join(folder, '.venv', 'Scripts', 'python.exe')
      : api.join(folder, '.venv', 'bin', 'python3'),
  };
}

export function isAbsolutePlatformPath(value, platform = process.platform) {
  return typeof value === 'string' && pathApi(platform).isAbsolute(value);
}
