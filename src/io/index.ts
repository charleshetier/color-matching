const electron = (window as any)['require']('electron') as typeof Electron;
export const ipcRenderer = electron.ipcRenderer;
export const remote = electron.remote;