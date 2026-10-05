// Platform wiring is shared by the real app and first-run integration fixtures.
export function startupSupported(platform, fixture = false) {
  return !fixture && ['darwin', 'win32'].includes(platform);
}

export function startupPlatformOptions({ platform, setup, bootstrap, ensureRuntime, control, inspectGit, installGit }) {
  if (!startupSupported(platform)) throw new Error('Unsupported startup platform');
  const windows = platform === 'win32';
  return {
    platform,
    probeNode: () => setup.node(),
    prepareComponents: windows ? () => ensureRuntime() : undefined,
    probeGit: windows ? async () => {
      const current = await bootstrap.inspect();
      if (!current.installed) return false;
      setup.setRuntimeEnvironment(await bootstrap.workflowEnvironment());
      return true;
    } : inspectGit,
    installGit: windows ? async () => { throw new Error('Windows components are prepared automatically'); } : installGit,
    inspectRuntime: async () => {
      const current = await bootstrap.inspect();
      return current.installed ? control('status') : null;
    },
    prepareRuntime: async () => {
      // macOS installs and starts its services here, after Git: the system Python they need comes with it.
      // On Windows the components step has already done this.
      if (!windows) await ensureRuntime();
      let status = await control('status');
      if (!status.mcp.ready || (status.tunnel.configured && !status.tunnel.ready))
        status = await control('start', { mcpOnly: !status.tunnel.configured });
      return status;
    },
    configureTunnel: async credentials => {
      await ensureRuntime();
      return bootstrap.configureTunnel(credentials);
    },
  };
}
