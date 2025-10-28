const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle messages from renderer (voice commands)
ipcMain.on('send-to-chrome', (event, command) => {
  console.log('📤 Sending command to Chrome:', command);

  // Write command to file for native-host to pick up
  const commandFile = path.join(__dirname, 'logs', 'pending-command.json');
  fs.mkdirSync(path.dirname(commandFile), { recursive: true });
  fs.writeFileSync(commandFile, JSON.stringify(command));

  console.log('✅ Command written for Chrome');
});
