const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

// Disables security warnings
// TODO add configurations cases
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS=true;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 900, height: 680, webPreferences: { nodeIntegration: true } });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  if (isDev) {

    const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer');

    installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));

        installExtension(REDUX_DEVTOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));

    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension(path.join(__dirname, '../tools/react-dev-tools'));
    // BrowserWindow.addDevToolsExtension(path.join(__dirname, '../tools/redux-dev-tools'));
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => mainWindow = null);

  const { session } = require('electron')

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': (isDev ? ['img-src blob: \'self\' \'unsafe-inline\' http://localhost:3000'] : ['default-src \'self\' blob:'])
      }
    })
  })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});