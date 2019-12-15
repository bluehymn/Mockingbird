import { app, BrowserWindow, Menu, shell } from 'electron';
const path = require('path');
const url = require('url');

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 768,
    minWidth: 1280,
    minHeight: 768,
    title: `Mockingbird`,
    icon: path.join(__dirname, '/icon_512x512x32.png'),
    webPreferences: { nodeIntegration: true }
  });

  // load the dist folder from Angular
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `./index.html`),
      protocol: 'file:',
      slashes: true
    })
  );

  // The following is optional and will open the DevTools:
  // win.webContents.openDevTools()

  win.on('closed', () => {
    win = null;
  });

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'About',
        submenu: [
          {
            label: 'Github',
            click: function() {
              shell.openExternal('https://github.com/bluehymn/Mockingbird');
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'Ctrl+R',
            click: () => {
              win.webContents.reload();
            }
          },
          {
            label: 'Devtools',
            accelerator: 'Ctrl+Shift+I',
            click: () => {
              win.webContents.openDevTools();
            }
          }
        ]
      }
    ])
  );
}

app.on('ready', createWindow);

// on macOS, closing the window doesn't quit the app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// initialize the app's main window
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
