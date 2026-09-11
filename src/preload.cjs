const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('webPilot', Object.freeze({
  getState: () => ipcRenderer.invoke('pilot:get-state'),
  chooseWorkspace: () => ipcRenderer.invoke('pilot:choose-workspace'),
  selectWorkspace: workspace => ipcRenderer.invoke('pilot:select-workspace', workspace),
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
