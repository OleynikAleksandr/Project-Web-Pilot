const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('webPilot', Object.freeze({
  openSettings: () => ipcRenderer.invoke('pilot:open-settings'),
  closeSettings: () => ipcRenderer.invoke('pilot:close-settings'),
  setSidebarWidth: width => ipcRenderer.invoke('pilot:set-sidebar-width', width),
  setTheme: theme => ipcRenderer.invoke('pilot:set-theme', theme),
  setHideToolCalls: value => ipcRenderer.invoke('pilot:set-hide-tool-calls', value),
  configureWindowsTunnel: () => ipcRenderer.invoke('pilot:configure-windows-tunnel'),
  refreshWindowsRuntime: () => ipcRenderer.invoke('pilot:refresh-windows-runtime'),
  copyWorkspacePath: workspace => ipcRenderer.invoke('pilot:copy-workspace-path', workspace),
  renameProject: (workspace, name) => ipcRenderer.invoke('pilot:rename-project', { workspace, name }),
  renameSession: (workspace, sessionId, name) => ipcRenderer.invoke('pilot:rename-session', { workspace, sessionId, name }),
  acceptPlan: () => ipcRenderer.invoke('pilot:accept-plan'),
  archiveProject: workspace => ipcRenderer.invoke('pilot:archive-project', workspace),
  archiveSession: (workspace, sessionId) => ipcRenderer.invoke('pilot:archive-session', { workspace, sessionId }),
  openArchive: workspace => ipcRenderer.invoke('pilot:open-archive-window', workspace),
  getState: () => ipcRenderer.invoke('pilot:get-state'),
  beginCreate: () => ipcRenderer.invoke('pilot:begin-create'),
  chooseParent: name => ipcRenderer.invoke('pilot:choose-parent', { name }),
  previewNew: name => ipcRenderer.invoke('pilot:preview-new', { name }),
  refreshSetup: () => ipcRenderer.invoke('pilot:refresh-setup'),
  cancelSetup: () => ipcRenderer.invoke('pilot:cancel-setup'),
  applySetup: (token, gitName, gitEmail) => ipcRenderer.invoke('pilot:apply-setup', { token, gitName, gitEmail }),
  setFirstSessionExperience: experience => ipcRenderer.invoke('pilot:set-first-session-experience', experience),
  chooseWorkspace: () => ipcRenderer.invoke('pilot:choose-workspace'),
  selectWorkspace: workspace => ipcRenderer.invoke('pilot:select-workspace', workspace),
  selectSession: (workspace, sessionId) => ipcRenderer.invoke('pilot:select-session', { workspace, sessionId }),
  setExpanded: (workspace, expanded) => ipcRenderer.invoke('pilot:set-expanded', { workspace, expanded }),
  newSession: (workspace, experience) => ipcRenderer.invoke('pilot:new-session', { workspace, experience }),
  returnToChat: () => ipcRenderer.invoke('pilot:return-chat'),
  retry: () => ipcRenderer.invoke('pilot:retry'),
  reload: () => ipcRenderer.invoke('pilot:reload'),
  chooseRuntime: () => ipcRenderer.invoke('pilot:choose-runtime'),
  onState: callback => {
    if (typeof callback !== 'function') throw new TypeError('Expected a callback');
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('pilot:state-changed', listener);
    return () => ipcRenderer.removeListener('pilot:state-changed', listener);
  },
}));
