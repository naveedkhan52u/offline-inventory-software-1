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

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      sku TEXT NOT NULL DEFAULT '',
      barcode TEXT NOT NULL DEFAULT '',
      buying_price REAL NOT NULL DEFAULT 0,
      selling_price REAL NOT NULL DEFAULT 0,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      movement_type TEXT NOT NULL,
      quantity_change INTEGER NOT NULL,
      previous_quantity INTEGER NOT NULL,
      new_quantity INTEGER NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_number TEXT NOT NULL UNIQUE,
      supplier_name TEXT NOT NULL,
      supplier_phone TEXT NOT NULL DEFAULT '',
      invoice_number TEXT NOT NULL DEFAULT '',
      purchase_date TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      paid_amount REAL NOT NULL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT 'Unpaid',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_cost REAL NOT NULL,
      line_total REAL NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date DESC);
    CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);

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
  
  ipcMain.handle('dashboard:summary', () => {
    const products = db.prepare('SELECT id, name, category, buying_price, selling_price, stock_quantity, low_stock_threshold, created_at, updated_at FROM products').all();
    const business = db.prepare('SELECT currency FROM business WHERE id = 1').get();
    const totalProducts = products.length;
    const stockValue = products.reduce((sum, product) => sum + Number(product.buying_price || 0) * Number(product.stock_quantity || 0), 0);
    const potentialMargin = products.reduce((sum, product) => sum + (Number(product.selling_price || 0) - Number(product.buying_price || 0)) * Number(product.stock_quantity || 0), 0);
    const lowStockProducts = products
      .filter(product => Number(product.stock_quantity || 0) <= Number(product.low_stock_threshold ?? 5))
      .sort((a, b) => Number(a.stock_quantity || 0) - Number(b.stock_quantity || 0))
      .slice(0, 6);
    const categories = db.prepare(`
      SELECT CASE WHEN TRIM(category) = '' THEN 'Uncategorized' ELSE category END AS name,
             COUNT(*) AS products,
             SUM(stock_quantity) AS units
      FROM products
      GROUP BY CASE WHEN TRIM(category) = '' THEN 'Uncategorized' ELSE category END
      ORDER BY products DESC, name COLLATE NOCASE ASC
      LIMIT 6
    `).all();
    const recentProducts = db.prepare('SELECT id, name, category, stock_quantity, updated_at FROM products ORDER BY updated_at DESC, created_at DESC, id DESC LIMIT 5').all();
    return {
      ok: true,
      currency: business?.currency || 'PKR',
      totalProducts,
      stockValue,
      potentialMargin,
      lowStockCount: products.filter(product => Number(product.stock_quantity || 0) <= Number(product.low_stock_threshold ?? 5)).length,
      lowStockProducts,
      categories,
      recentProducts
    };
  });

  ipcMain.handle('stock:movements', (_event, filters = {}) => {
    try {
      const conditions = [];
      const params = [];
      if (filters.productId && Number.isInteger(Number(filters.productId))) {
        conditions.push('product_id = ?');
        params.push(Number(filters.productId));
      }
      if (filters.type && filters.type !== 'All') {
        conditions.push('movement_type = ?');
        params.push(String(filters.type));
      }
      if (filters.from) {
        conditions.push("date(created_at) >= date(?)");
        params.push(String(filters.from));
      }
      if (filters.to) {
        conditions.push("date(created_at) <= date(?)");
        params.push(String(filters.to));
      }
      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
      const movements = db.prepare(`SELECT * FROM stock_movements ${where} ORDER BY datetime(created_at) DESC, id DESC LIMIT 500`).all(...params);
      return { ok: true, movements };
    } catch (error) {
      return { ok: false, error: 'Unable to load stock movement history.' };
    }
  });

  ipcMain.handle('stock:adjust', (_event, data) => {
    const productId = Number(data?.productId);
    const operation = String(data?.operation || '');
    const quantity = Number(data?.quantity);
    const reason = String(data?.reason || '').trim();
    const notes = String(data?.notes || '').trim();
    if (!Number.isInteger(productId) || productId < 1) return { ok: false, error: 'Choose a valid product.' };
    if (!['add', 'remove', 'set'].includes(operation)) return { ok: false, error: 'Choose a valid stock adjustment type.' };
    if (!Number.isInteger(quantity) || quantity < 0 || (operation !== 'set' && quantity < 1)) return { ok: false, error: 'Enter a valid whole-number quantity.' };
    if (!reason) return { ok: false, error: 'Select a reason for this adjustment.' };
    try {
      const adjust = db.transaction(() => {
        const product = db.prepare('SELECT id, name, stock_quantity FROM products WHERE id = ?').get(productId);
        if (!product) throw new Error('Product not found.');
        const previous = Number(product.stock_quantity || 0);
        const next = operation === 'add' ? previous + quantity : operation === 'remove' ? previous - quantity : quantity;
        if (next < 0) throw new Error('Stock cannot become negative. Reduce the quantity or use a smaller removal.');
        const change = next - previous;
        if (change === 0) throw new Error('The new stock quantity is the same as the current quantity.');
        db.prepare('UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(next, productId);
        const movementType = operation === 'add' ? 'addition' : operation === 'remove' ? 'removal' : 'correction';
        db.prepare('INSERT INTO stock_movements (product_id, product_name, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .run(product.id, product.name, movementType, change, previous, next, reason, notes);
        return { id: product.id, name: product.name, previous, next, change };
      });
      const result = adjust();
      return { ok: true, ...result };
    } catch (error) {
      return { ok: false, error: error.message || 'Unable to adjust stock.' };
    }
  });

  ipcMain.handle('purchases:list', (_event, filters = {}) => {
    try {
      const conditions = [];
      const params = [];
      if (filters.status && filters.status !== 'All') {
        conditions.push('payment_status = ?');
        params.push(String(filters.status));
      }
      if (filters.from) {
        conditions.push('date(purchase_date) >= date(?)');
        params.push(String(filters.from));
      }
      if (filters.to) {
        conditions.push('date(purchase_date) <= date(?)');
        params.push(String(filters.to));
      }
      if (filters.search) {
        conditions.push('(purchase_number LIKE ? OR supplier_name LIKE ? OR invoice_number LIKE ?)');
        const query = '%' + String(filters.search).trim() + '%';
        params.push(query, query, query);
      }
      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
      const purchases = db.prepare(`SELECT * FROM purchases ${where} ORDER BY date(purchase_date) DESC, id DESC LIMIT 1000`).all(...params);
      const itemQuery = db.prepare('SELECT id, product_id, product_name, quantity, unit_cost, line_total FROM purchase_items WHERE purchase_id = ? ORDER BY id');
      return { ok: true, purchases: purchases.map(purchase => ({ ...purchase, items: itemQuery.all(purchase.id) })) };
    } catch (error) {
      return { ok: false, error: 'Unable to load purchase records.' };
    }
  });

  ipcMain.handle('purchases:create', (_event, data) => {
    const supplierName = String(data?.supplierName || '').trim();
    const supplierPhone = String(data?.supplierPhone || '').trim();
    const invoiceNumber = String(data?.invoiceNumber || '').trim();
    const purchaseDate = String(data?.purchaseDate || '').trim();
    const notes = String(data?.notes || '').trim();
    const paidAmount = Number(data?.paidAmount);
    const items = Array.isArray(data?.items) ? data.items : [];
    if (!supplierName) return { ok: false, error: 'Supplier name is required.' };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate) || Number.isNaN(Date.parse(purchaseDate + 'T00:00:00'))) return { ok: false, error: 'Choose a valid purchase date.' };
    if (!items.length) return { ok: false, error: 'Add at least one product to this purchase.' };
    if (!Number.isFinite(paidAmount) || paidAmount < 0) return { ok: false, error: 'Paid amount must be zero or more.' };
    try {
      const createPurchase = db.transaction(() => {
        let subtotal = 0;
        const preparedItems = items.map(item => {
          const productId = Number(item.productId);
          const quantity = Number(item.quantity);
          const unitCost = Number(item.unitCost);
          if (!Number.isInteger(productId) || productId < 1) throw new Error('Choose a valid product for every line.');
          if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Each purchase quantity must be a whole number greater than zero.');
          if (!Number.isFinite(unitCost) || unitCost < 0) throw new Error('Purchase costs must be valid non-negative numbers.');
          const product = db.prepare('SELECT id, name, buying_price, stock_quantity FROM products WHERE id = ?').get(productId);
          if (!product) throw new Error('One of the selected products no longer exists.');
          const lineTotal = Math.round((quantity * unitCost + Number.EPSILON) * 100) / 100;
          subtotal += lineTotal;
          return { product, productId, quantity, unitCost, lineTotal };
        });
        subtotal = Math.round((subtotal + Number.EPSILON) * 100) / 100;
        if (paidAmount > subtotal + 0.005) throw new Error('Paid amount cannot exceed the purchase total.');
        const paymentStatus = paidAmount <= 0 ? 'Unpaid' : paidAmount + 0.005 >= subtotal ? 'Paid' : 'Partial';
        const purchaseNumber = 'PUR-' + new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14) + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
        const purchase = db.prepare('INSERT INTO purchases (purchase_number, supplier_name, supplier_phone, invoice_number, purchase_date, subtotal, paid_amount, payment_status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(purchaseNumber, supplierName, supplierPhone, invoiceNumber, purchaseDate, subtotal, paidAmount, paymentStatus, notes);
        const insertItem = db.prepare('INSERT INTO purchase_items (purchase_id, product_id, product_name, quantity, unit_cost, line_total) VALUES (?, ?, ?, ?, ?, ?)');
        const updateProduct = db.prepare('UPDATE products SET stock_quantity = stock_quantity + ?, buying_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        const insertMovement = db.prepare("INSERT INTO stock_movements (product_id, product_name, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes) VALUES (?, ?, 'addition', ?, ?, ?, 'Purchase received', ?)");
        for (const item of preparedItems) {
          insertItem.run(purchase.lastInsertRowid, item.productId, item.product.name, item.quantity, item.unitCost, item.lineTotal);
          const previous = Number(item.product.stock_quantity || 0);
          const next = previous + item.quantity;
          updateProduct.run(item.quantity, item.unitCost, item.productId);
          insertMovement.run(item.productId, item.product.name, item.quantity, previous, next, purchaseNumber + (invoiceNumber ? ' · Invoice ' + invoiceNumber : ''));
        }
        return { id: purchase.lastInsertRowid, purchaseNumber, subtotal, paidAmount, paymentStatus };
      });
      return { ok: true, ...createPurchase() };
    } catch (error) {
      return { ok: false, error: error.message || 'Unable to save this purchase.' };
    }
  });

  ipcMain.handle('products:list', () => ({
    ok: true,
    products: db.prepare('SELECT * FROM products ORDER BY name COLLATE NOCASE ASC, id DESC').all()
  }));

  ipcMain.handle('products:create', (_event, data) => {
    try {
      const name = data?.name?.trim();
      if (!name) return { ok: false, error: 'Product name is required.' };
      const values = [
        name, data.category?.trim() || '', data.sku?.trim() || '', data.barcode?.trim() || '',
        Number(data.buyingPrice) || 0, Number(data.sellingPrice) || 0,
        Math.max(0, Math.floor(Number(data.stock) || 0)), Math.max(0, Math.floor(Number(data.lowStock) || 0))
      ];
      const create = db.transaction(() => {
        const result = db.prepare('INSERT INTO products (name, category, sku, barcode, buying_price, selling_price, stock_quantity, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(...values);
        if (values[6] > 0) {
          db.prepare("INSERT INTO stock_movements (product_id, product_name, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes) VALUES (?, ?, 'addition', ?, 0, ?, 'Opening stock', 'Initial quantity entered when product was created.')")
            .run(result.lastInsertRowid, name, values[6], values[6]);
        }
        return result;
      });
      const result = create();
      return { ok: true, id: result.lastInsertRowid };
    } catch (error) {
      return { ok: false, error: 'Unable to add product.' };
    }
  });

  ipcMain.handle('products:update', (_event, id, data) => {
    try {
      const name = data?.name?.trim();
      if (!name) return { ok: false, error: 'Product name is required.' };
      const nextQuantity = Math.max(0, Math.floor(Number(data.stock) || 0));
      const update = db.transaction(() => {
        const existing = db.prepare('SELECT id, name, stock_quantity FROM products WHERE id=?').get(id);
        if (!existing) return false;
        const previous = Number(existing.stock_quantity || 0);
        db.prepare('UPDATE products SET name=?, category=?, sku=?, barcode=?, buying_price=?, selling_price=?, stock_quantity=?, low_stock_threshold=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(
          name, data.category?.trim() || '', data.sku?.trim() || '', data.barcode?.trim() || '',
          Number(data.buyingPrice) || 0, Number(data.sellingPrice) || 0,
          nextQuantity, Math.max(0, Math.floor(Number(data.lowStock) || 0)), id
        );
        if (previous !== nextQuantity) {
          const change = nextQuantity - previous;
          db.prepare('INSERT INTO stock_movements (product_id, product_name, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
            Number(id), name, change > 0 ? 'addition' : 'removal', change, previous, nextQuantity,
            'Product details edited', 'Stock quantity changed from the Products section.'
          );
        }
        return true;
      });
      return update() ? { ok: true } : { ok: false, error: 'Product not found.' };
    } catch (error) {
      return { ok: false, error: 'Unable to update product.' };
    }
  });

  ipcMain.handle('products:delete', (_event, id) => {
    try {
      const remove = db.transaction(() => {
        const product = db.prepare('SELECT id, name, stock_quantity FROM products WHERE id=?').get(id);
        if (!product) return false;
        const quantity = Number(product.stock_quantity || 0);
        if (quantity > 0) {
          db.prepare("INSERT INTO stock_movements (product_id, product_name, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes) VALUES (?, ?, 'removal', ?, ?, 0, 'Product deleted', 'Remaining stock recorded when the product was removed from the product list.')")
            .run(product.id, product.name, -quantity, quantity);
        }
        db.prepare('DELETE FROM products WHERE id=?').run(id);
        return true;
      });
      return remove() ? { ok: true } : { ok: false, error: 'Product not found.' };
    } catch (error) {
      return { ok: false, error: 'Unable to delete product.' };
    }
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
