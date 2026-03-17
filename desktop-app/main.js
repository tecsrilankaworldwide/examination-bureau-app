const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');
const fixPath = require('fix-path');

// Fix PATH on macOS
fixPath();

const store = new Store();
let mainWindow;
let backendProcess;
let mongoProcess;
let frontendProcess;

// Paths
const isDev = process.env.NODE_ENV === 'development';
const resourcesPath = process.resourcesPath || path.join(__dirname, '../');
const backendPath = path.join(resourcesPath, 'backend');
const mongoPath = path.join(resourcesPath, 'portable_mongodb');
const frontendPath = path.join(resourcesPath, 'frontend', 'build');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'Grade 5 Scholarship Exam Platform',
    show: false
  });

  // Show splash/loading screen
  mainWindow.loadFile(path.join(__dirname, 'loading.html'));
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Start services
  startServices();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startMongoDB() {
  return new Promise((resolve, reject) => {
    const mongoDataPath = path.join(mongoPath, 'data');
    const mongoBin = process.platform === 'win32' ? 
      path.join(mongoPath, 'mongod.exe') : 
      path.join(mongoPath, 'mongod');

    console.log('Starting MongoDB...');
    mongoProcess = spawn(mongoBin, [
      '--dbpath', mongoDataPath,
      '--port', '27017',
      '--bind_ip', '127.0.0.1'
    ]);

    mongoProcess.stdout.on('data', (data) => {
      console.log(`MongoDB: ${data}`);
      if (data.includes('Waiting for connections')) {
        resolve();
      }
    });

    mongoProcess.stderr.on('data', (data) => {
      console.error(`MongoDB Error: ${data}`);
    });

    mongoProcess.on('error', (error) => {
      console.error('Failed to start MongoDB:', error);
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => resolve(), 10000);
  });
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const serverPath = path.join(backendPath, 'server.py');

    console.log('Starting Backend...');
    backendProcess = spawn(pythonCmd, [serverPath], {
      cwd: backendPath,
      env: {
        ...process.env,
        MONGO_URL: 'mongodb://127.0.0.1:27017',
        DB_NAME_EXAM: 'exam_bureau_db',
        SECRET_KEY: 'exam-bureau-desktop-2024',
        CORS_ORIGINS: 'http://localhost:3000',
        PORT: '8001'
      }
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
      if (data.includes('Application startup complete')) {
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start Backend:', error);
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => resolve(), 10000);
  });
}

async function startServices() {
  try {
    // Start MongoDB
    await startMongoDB();
    console.log('✓ MongoDB started');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start Backend
    await startBackend();
    console.log('✓ Backend started');

    // Wait for backend to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Load application (served by backend or static)
    mainWindow.loadURL('http://localhost:8001/');

    // If backend serves static files, use that
    // Otherwise, you'd need to serve frontend separately

  } catch (error) {
    console.error('Failed to start services:', error);
    dialog.showErrorBox(
      'Startup Error',
      'Failed to start application services. Please check logs.'
    );
    app.quit();
  }
}

function stopServices() {
  console.log('Stopping services...');

  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }

  if (mongoProcess) {
    mongoProcess.kill();
    mongoProcess = null;
  }

  if (frontendProcess) {
    frontendProcess.kill();
    frontendProcess = null;
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  stopServices();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopServices();
});

// IPC handlers
ipcMain.handle('get-version', () => {
  return app.getVersion();
});

ipcMain.handle('restart-services', async () => {
  stopServices();
  await new Promise(resolve => setTimeout(resolve, 2000));
  await startServices();
  return true;
});
