const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('webPilot', Object.freeze({
  getState: () => ipcRenderer.invoke('pilot:get-state'),
  beginCreate: () => ipcRenderer.invoke('pilot:begin-create'),
  chooseParent: name => ipcRenderer.invoke('pilot:choose-parent', { name }),
  previewNew: name => ipcRenderer.invoke('pilot:preview-new', { name }),
  refreshSetup: () => ipcRenderer.invoke('pilot:refresh-setup'),
  cancelSetup: () => ipcRenderer.invoke('pilot:cancel-setup'),
  applySetup: (token, gitName, gitEmail) => ipcRenderer.invoke('pilot:apply-setup', { token, gitName, gitEmail }),
  chooseWorkspace: () => ipcRenderer.invoke('pilot:choose-workspace'),
  selectWorkspace: workspace => ipcRenderer.invoke('pilot:select-workspace', workspace),
  selectSession: (workspace, sessionId) => ipcRenderer.invoke('pilot:select-session', { workspace, sessionId }),
  setExpanded: (workspace, expanded) => ipcRenderer.invoke('pilot:set-expanded', { workspace, expanded }),
  newChat: () => ipcRenderer.invoke('pilot:new-chat'),
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
