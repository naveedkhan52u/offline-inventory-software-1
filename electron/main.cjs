const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');

let db;

function createDatabase() {
  const dataDir = path.join(app.getPath('userData'), 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  db = new Database(path.join(dataDir, 'inventory.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      password_keylen INTEGER NOT NULL DEFAULT 64,
      password_cost INTEGER NOT NULL DEFAULT 16384,
      password_block_size INTEGER NOT NULL DEFAULT 8,
      password_parallelization INTEGER NOT NULL DEFAULT 1,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS business (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      business_name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      currency TEXT NOT NULL DEFAULT 'PKR',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Keep the database compatible with the earlier prototype schema.
  const columns = db.prepare('PRAGMA table_info(users)').all().map(column => column.name);
  if (!columns.includes('password_salt')) db.exec('ALTER TABLE users ADD COLUMN password_salt TEXT NOT NULL DEFAULT ""');
  if (!columns.includes('password_keylen')) db.exec('ALTER TABLE users ADD COLUMN password_keylen INTEGER NOT NULL DEFAULT 64');
  if (!columns.includes('password_cost')) db.exec('ALTER TABLE users ADD COLUMN password_cost INTEGER NOT NULL DEFAULT 16384');
  if (!columns.includes('password_block_size')) db.exec('ALTER TABLE users ADD COLUMN password_block_size INTEGER NOT NULL DEFAULT 8');
  if (!columns.includes('password_parallelization')) db.exec('ALTER TABLE users ADD COLUMN password_parallelization INTEGER NOT NULL DEFAULT 1');
  if (!columns.includes('role')) db.exec('ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT "admin"');
  if (!columns.includes('updated_at')) db.exec('ALTER TABLE users ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const cost = 16384;
  const blockSize = 8;
  const parallelization = 1;
  const keyLength = 64;
  const derivedKey = crypto.scryptSync(password, salt, keyLength, {
    N: cost,
    r: blockSize,
    p: parallelization,
    maxmem: 32 * 1024 * 1024
  });
  return {
    hash: derivedKey.toString('hex'),
    salt: salt.toString('hex'),
    keyLength,
    cost,
    blockSize,
    parallelization
  };
}

function verifyPassword(password, user) {
  if (!user.password_salt || !user.password_hash) return false;
  const derivedKey = crypto.scryptSync(password, Buffer.from(user.password_salt, 'hex'), user.password_keylen || 64, {
    N: user.password_cost || 16384,
    r: user.password_block_size || 8,
    p: user.password_parallelization || 1,
    maxmem: 32 * 1024 * 1024
  });
  const stored = Buffer.from(user.password_hash, 'hex');
  return stored.length === derivedKey.length && crypto.timingSafeEqual(stored, derivedKey);
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

  if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
  else win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
  createDatabase();

  ipcMain.handle('auth:status', () => ({
    hasUser: !!db.prepare('SELECT id FROM users LIMIT 1').get()
  }));

  ipcMain.handle('auth:create', (_event, data) => {
    try {
      const { businessName, ownerName, phone = '', address = '', currency = 'PKR', username, password } = data || {};
      if (!businessName?.trim() || !ownerName?.trim() || !username?.trim() || !password) {
        return { ok: false, error: 'Required account information is missing.' };
      }
      if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
      if (db.prepare('SELECT id FROM users LIMIT 1').get()) {
        return { ok: false, error: 'An account already exists on this computer.' };
      }

      const credentials = hashPassword(password);
      const create = db.transaction(() => {
        const userResult = db.prepare(`
          INSERT INTO users
            (username, password_hash, password_salt, password_keylen, password_cost, password_block_size, password_parallelization)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          username.trim(),
          credentials.hash,
          credentials.salt,
          credentials.keyLength,
          credentials.cost,
          credentials.blockSize,
          credentials.parallelization
        );

        db.prepare(`
          INSERT INTO business (id, business_name, owner_name, phone, address, currency)
          VALUES (1, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            business_name=excluded.business_name,
            owner_name=excluded.owner_name,
            phone=excluded.phone,
            address=excluded.address,
            currency=excluded.currency,
            updated_at=CURRENT_TIMESTAMP
        `).run(businessName.trim(), ownerName.trim(), phone.trim(), address.trim(), currency);

        return userResult;
      });

      create();
      return { ok: true, username: username.trim(), businessName: businessName.trim() };
    } catch (error) {
      return { ok: false, error: error.code === 'SQLITE_CONSTRAINT_UNIQUE' ? 'Username already exists.' : 'Unable to create account.' };
    }
  });

  ipcMain.handle('auth:login', (_event, data) => {
    const username = data?.username?.trim();
    const password = data?.password;
    if (!username || !password) return { ok: false };

    const user = db.prepare('SELECT id, username, password_hash, password_salt, password_keylen, password_cost, password_block_size, password_parallelization FROM users WHERE username = ? COLLATE NOCASE').get(username);
    if (!user || !verifyPassword(password, user)) return { ok: false };

    const business = db.prepare('SELECT business_name FROM business WHERE id = 1').get();
    return { ok: true, username: user.username, businessName: business?.business_name || '' };
  });
  
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (db) db.close();
  if (process.platform !== 'darwin') app.quit();
});
