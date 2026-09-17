import path from 'node:path';

function pathApi(platform) {
  return platform === 'win32' ? path.win32 : path.posix;
}

export function defaultRuntimeFolder(homeDir, platform = process.platform) {
  const api = pathApi(platform);
  if (platform === 'darwin') return api.join(homeDir, 'VSCODE', 'Codex Local Mac', 'mac-codex-local');
  if (platform === 'win32') return api.join(homeDir, 'VSCODE', 'Codex Local Windows', 'windows-codex-local');
  return api.join(homeDir, 'VSCODE', 'Codex Local', 'codex-local');
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
  if (typeof value !== 'string') return false;
  if (platform === 'win32') return /^[A-Za-z]:[\\/]/.test(value) || /^\\\\[^\\]/.test(value);
  return pathApi(platform).isAbsolute(value);
}

export function nodeExecutableCandidates({
  platform = process.platform,
  environment = process.env,
  execPath = process.execPath,
  electron = Boolean(process.versions.electron),
} = {}) {
  if (platform === 'darwin') {
    return [...new Set(['/opt/homebrew/bin/node', '/usr/local/bin/node', ...(!electron ? [execPath] : [])])];
  }
  if (platform === 'win32') {
    const api = path.win32;
    const candidates = [];
    for (const root of [environment.ProgramFiles, environment['ProgramFiles(x86)']]) {
      if (typeof root === 'string' && root) candidates.push(api.join(root, 'nodejs', 'node.exe'));
    }
    if (!electron && isAbsolutePlatformPath(execPath, platform)) candidates.push(execPath);
    candidates.push('node.exe');
    return [...new Set(candidates)];
  }
  return [...new Set([...(!electron ? [execPath] : []), 'node'])];
}

export function executableCandidateAllowed(value, platform = process.platform) {
  return isAbsolutePlatformPath(value, platform) || (typeof value === 'string' && /^[A-Za-z0-9_.-]+$/.test(value));
}

export function bundledWindowsRuntimeFolder(dataDir, platform = process.platform) {
  return platform === 'win32' ? path.win32.join(dataDir, 'runtime', 'Windows-Codex-Local') : null;
}

export function bundledMacNode(resourcesPath) {
  return path.posix.join(resourcesPath, 'mac-tools', 'node', 'bin', 'node');
}
