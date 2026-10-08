const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

let db;

function createDatabase() {
  const dataDir = path.join(app.getPath('userData'), 'data');
  const fs = require('fs');
  fs.mkdirSync(dataDir, { recursive: true });
  db = new Database(path.join(dataDir, 'inventory.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#f6f8fb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createDatabase();
  ipcMain.handle('auth:status', () => ({
    hasUser: !!db.prepare('SELECT id FROM users LIMIT 1').get()
  }));
  ipcMain.handle('auth:create', (_event, { username, passwordHash }) => {
    try {
      db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.code === 'SQLITE_CONSTRAINT_UNIQUE' ? 'Username already exists.' : 'Unable to create account.' };
    }
  });
  ipcMain.handle('auth:login', (_event, { username, passwordHash }) => {
    const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username);
    return { ok: !!user && user.password_hash === passwordHash, username: user?.username || null };
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});