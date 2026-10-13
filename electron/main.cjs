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

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL DEFAULT 'Walk-in customer',
      customer_phone TEXT NOT NULL DEFAULT '',
      sale_date TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      paid_amount REAL NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL DEFAULT 'Cash',
      payment_status TEXT NOT NULL DEFAULT 'Unpaid',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      unit_cost REAL NOT NULL DEFAULT 0,
      line_total REAL NOT NULL,
      line_profit REAL NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date DESC);
    CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL, job_title TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', monthly_salary REAL NOT NULL DEFAULT 0,
      hire_date TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Active', notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS staff_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, staff_id INTEGER NOT NULL REFERENCES staff(id), staff_name TEXT NOT NULL,
      payment_date TEXT NOT NULL, amount REAL NOT NULL, payment_method TEXT NOT NULL DEFAULT 'Cash',
      period_label TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_staff_payments_date ON staff_payments(payment_date DESC);
    CREATE TABLE IF NOT EXISTS business_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT, expense_date TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL,
      amount REAL NOT NULL, payment_method TEXT NOT NULL DEFAULT 'Cash', notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_business_expenses_date ON business_expenses(expense_date DESC);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Keep the database compatible with the earlier prototype schema.
  const columns = db.prepare('PRAGMA table_info(users)').all().map(column => column.name);
  if (!db.prepare('PRAGMA table_info(staff_payments)').all().some(column => column.name === 'payment_type')) {
    db.exec("ALTER TABLE staff_payments ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'Salary'");
  }
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

  ipcMain.handle('sales:list', (_event, filters = {}) => {
    try {
      const conditions = [];
      const params = [];
      if (filters.status && filters.status !== 'All') { conditions.push('payment_status = ?'); params.push(String(filters.status)); }
      if (filters.from) { conditions.push('date(sale_date) >= date(?)'); params.push(String(filters.from)); }
      if (filters.to) { conditions.push('date(sale_date) <= date(?)'); params.push(String(filters.to)); }
      if (filters.search) {
        conditions.push('(sale_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)');
        const query = '%' + String(filters.search).trim() + '%';
        params.push(query, query, query);
      }
      const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
      const sales = db.prepare(`SELECT * FROM sales ${where} ORDER BY date(sale_date) DESC, id DESC LIMIT 1000`).all(...params);
      const itemQuery = db.prepare('SELECT id, product_id, product_name, quantity, unit_price, unit_cost, line_total, line_profit FROM sale_items WHERE sale_id = ? ORDER BY id');
      return { ok: true, sales: sales.map(sale => ({ ...sale, items: itemQuery.all(sale.id) })) };
    } catch (error) {
      return { ok: false, error: 'Unable to load sales records.' };
    }
  });

  ipcMain.handle('sales:create', (_event, data) => {
    const customerName = String(data?.customerName || '').trim() || 'Walk-in customer';
    const customerPhone = String(data?.customerPhone || '').trim();
    const saleDate = String(data?.saleDate || '').trim();
    const discount = Number(data?.discount);
    const paidAmount = Number(data?.paidAmount);
    const paymentMethod = String(data?.paymentMethod || 'Cash');
    const notes = String(data?.notes || '').trim();
    const items = Array.isArray(data?.items) ? data.items : [];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(saleDate) || Number.isNaN(Date.parse(saleDate + 'T00:00:00'))) return { ok: false, error: 'Choose a valid sale date.' };
    if (!Number.isFinite(discount) || discount < 0) return { ok: false, error: 'Discount must be zero or more.' };
    if (!Number.isFinite(paidAmount) || paidAmount < 0) return { ok: false, error: 'Paid amount must be zero or more.' };
    if (!['Cash', 'Card', 'Bank transfer', 'Mobile wallet', 'Other'].includes(paymentMethod)) return { ok: false, error: 'Choose a valid payment method.' };
    if (!items.length) return { ok: false, error: 'Add at least one product to this sale.' };
    try {
      const createSale = db.transaction(() => {
        const preparedItems = items.map(item => {
          const productId = Number(item.productId);
          const quantity = Number(item.quantity);
          if (!Number.isInteger(productId) || productId < 1) throw new Error('Choose a valid product for every line.');
          if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Each sale quantity must be a whole number greater than zero.');
          const product = db.prepare('SELECT id, name, selling_price, buying_price, stock_quantity FROM products WHERE id = ?').get(productId);
          if (!product) throw new Error('One of the selected products no longer exists.');
          const unitPrice = item.unitPrice === undefined || item.unitPrice === null || item.unitPrice === '' ? Number(product.selling_price || 0) : Number(item.unitPrice);
          if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error('Selling prices must be valid non-negative numbers.');
          return { product, productId, quantity, unitPrice, unitCost: Number(product.buying_price || 0), lineTotal: Math.round((quantity * unitPrice + Number.EPSILON) * 100) / 100 };
        });
        const quantities = new Map();
        for (const item of preparedItems) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
        for (const [productId, quantity] of quantities) {
          const product = preparedItems.find(item => item.productId === productId).product;
          if (Number(product.stock_quantity || 0) < quantity) throw new Error('Not enough stock for ' + product.name + '. Available: ' + Number(product.stock_quantity || 0) + ', requested: ' + quantity + '.');
        }
        const subtotal = Math.round((preparedItems.reduce((sum, item) => sum + item.lineTotal, 0) + Number.EPSILON) * 100) / 100;
        if (discount > subtotal) throw new Error('Discount cannot exceed the sale subtotal.');
        const total = Math.round((subtotal - discount + Number.EPSILON) * 100) / 100;
        if (paidAmount > total + 0.005) throw new Error('Paid amount cannot exceed the final sale total.');
        const paymentStatus = paidAmount <= 0 ? 'Unpaid' : paidAmount + 0.005 >= total ? 'Paid' : 'Partial';
        const saleNumber = 'SAL-' + new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14) + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
        const sale = db.prepare('INSERT INTO sales (sale_number, customer_name, customer_phone, sale_date, subtotal, discount, total, paid_amount, payment_method, payment_status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(saleNumber, customerName, customerPhone, saleDate, subtotal, discount, total, paidAmount, paymentMethod, paymentStatus, notes);
        const insertItem = db.prepare('INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, unit_cost, line_total, line_profit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        const updateProduct = db.prepare('UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        const insertMovement = db.prepare("INSERT INTO stock_movements (product_id, product_name, movement_type, quantity_change, previous_quantity, new_quantity, reason, notes) VALUES (?, ?, 'removal', ?, ?, ?, 'Sale / issued', ?)");
        for (const item of preparedItems) {
          const lineProfit = Math.round((item.quantity * (item.unitPrice - item.unitCost) + Number.EPSILON) * 100) / 100;
          insertItem.run(sale.lastInsertRowid, item.productId, item.product.name, item.quantity, item.unitPrice, item.unitCost, item.lineTotal, lineProfit);
        }
        for (const [productId, quantity] of quantities) {
          const product = preparedItems.find(item => item.productId === productId).product;
          const previous = Number(product.stock_quantity || 0);
          const next = previous - quantity;
          updateProduct.run(quantity, productId);
          insertMovement.run(productId, product.name, -quantity, previous, next, saleNumber + (customerName ? ' · ' + customerName : ''));
        }
        return { id: sale.lastInsertRowid, saleNumber, subtotal, discount, total, paidAmount, paymentStatus };
      });
      return { ok: true, ...createSale() };
    } catch (error) {
      return { ok: false, error: error.message || 'Unable to save this sale.' };
    }
  });

  ipcMain.handle('staff:list', (_event, f = {}) => {
    try {
      const c = [], p = [];
      if (f.status && f.status !== 'All') { c.push('status = ?'); p.push(String(f.status)); }
      if (f.search) { const q = '%' + String(f.search).trim() + '%'; c.push('(full_name LIKE ? OR job_title LIKE ? OR phone LIKE ? OR email LIKE ?)'); p.push(q,q,q,q); }
      const where = c.length ? 'WHERE ' + c.join(' AND ') : '';
      const month = /^\\d{4}-\\d{2}$/.test(String(f.month||'')) ? String(f.month) : new Date().toISOString().slice(0,7);
      return { ok:true, staff:db.prepare(`SELECT * FROM staff ${where} ORDER BY full_name COLLATE NOCASE`).all(...p),
        payments:db.prepare('SELECT * FROM staff_payments ORDER BY date(payment_date) DESC,id DESC LIMIT 500').all(),
        monthlyBalances:db.prepare("SELECT staff_id,staff_name,period_label,SUM(CASE WHEN payment_type='Advance' THEN amount ELSE 0 END) AS advances,SUM(CASE WHEN payment_type='Salary' THEN amount ELSE 0 END) AS salary_paid,SUM(amount) AS total_paid FROM staff_payments WHERE period_label=? GROUP BY staff_id,staff_name,period_label").all(month),
        selectedMonth:month,
        paidThisMonth:db.prepare("SELECT SUM(amount) AS paid FROM staff_payments WHERE strftime('%Y-%m',payment_date)=strftime('%Y-%m','now','localtime')").get() };
    } catch(e) { return {ok:false,error:'Unable to load staff records.'}; }
  });
  ipcMain.handle('staff:save', (_event,d) => {
    const id=d?.id?Number(d.id):null, name=String(d?.fullName||'').trim(), role=String(d?.jobTitle||'').trim();
    const phone=String(d?.phone||'').trim(), email=String(d?.email||'').trim(), date=String(d?.hireDate||'').trim();
    const status=String(d?.status||'Active'), notes=String(d?.notes||'').trim(), salary=Number(d?.monthlySalary);
    if(!name) return {ok:false,error:'Staff name is required.'};
    if(!Number.isFinite(salary)||salary<0) return {ok:false,error:'Monthly salary must be zero or more.'};
    if(!['Active','Inactive'].includes(status)) return {ok:false,error:'Invalid staff status.'};
    if(date && (!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date+'T00:00:00')))) return {ok:false,error:'Enter a valid joining date.'};
    try {
      if(id) { const r=db.prepare('UPDATE staff SET full_name=?,job_title=?,phone=?,email=?,monthly_salary=?,hire_date=?,status=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(name,role,phone,email,salary,date,status,notes,id); if(!r.changes)return {ok:false,error:'Staff member not found.'}; }
      else db.prepare('INSERT INTO staff(full_name,job_title,phone,email,monthly_salary,hire_date,status,notes) VALUES(?,?,?,?,?,?,?,?)').run(name,role,phone,email,salary,date,status,notes);
      return {ok:true};
    } catch(e) { return {ok:false,error:'Unable to save staff details.'}; }
  });
  ipcMain.handle('staff:payment:create', (_event,d) => {
    const id=Number(d?.staffId), date=String(d?.paymentDate||'').trim(), amount=Number(d?.amount);
    const method=String(d?.paymentMethod||'Cash'), period=String(d?.periodLabel||'').trim(), notes=String(d?.notes||'').trim(), paymentType=String(d?.paymentType||'Salary');
    if(!Number.isInteger(id)||id<1)return {ok:false,error:'Choose a staff member.'};
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date+'T00:00:00')))return {ok:false,error:'Choose a valid payment date.'};
    if(!Number.isFinite(amount)||amount<=0)return {ok:false,error:'Salary payment must be greater than zero.'};
    if(!['Cash','Bank transfer','Mobile wallet','Cheque','Other'].includes(method))return {ok:false,error:'Choose a valid payment method.'};
    if(!['Salary','Advance'].includes(paymentType))return {ok:false,error:'Choose Salary or Advance payment type.'};
    if(!/^\\d{4}-\\d{2}$/.test(period))return {ok:false,error:'Choose the salary month this payment belongs to.'};
    try { const s=db.prepare('SELECT id,full_name FROM staff WHERE id=?').get(id); if(!s)return {ok:false,error:'Staff member not found.'};
      db.prepare('INSERT INTO staff_payments(staff_id,staff_name,payment_date,amount,payment_method,period_label,notes,payment_type) VALUES(?,?,?,?,?,?,?,?)').run(s.id,s.full_name,date,amount,method,period,notes,paymentType); return {ok:true};
    } catch(e) { return {ok:false,error:'Unable to save salary payment.'}; }
  });
  ipcMain.handle('expenses:list', (_event,f={}) => {
    try { const c=[],p=[]; if(f.from){c.push('date(expense_date)>=date(?)');p.push(String(f.from));} if(f.to){c.push('date(expense_date)<=date(?)');p.push(String(f.to));}
      if(f.search){const q='%'+String(f.search).trim()+'%';c.push('(category LIKE ? OR description LIKE ? OR notes LIKE ?)');p.push(q,q,q);}
      const w=c.length?'WHERE '+c.join(' AND '):'';return {ok:true,expenses:db.prepare(`SELECT * FROM business_expenses ${w} ORDER BY date(expense_date) DESC,id DESC LIMIT 1000`).all(...p)};
    } catch(e) { return {ok:false,error:'Unable to load expenses.'}; }
  });
  ipcMain.handle('expenses:create', (_event,d) => {
    const date=String(d?.expenseDate||'').trim(), cat=String(d?.category||'').trim(), desc=String(d?.description||'').trim();
    const amount=Number(d?.amount), method=String(d?.paymentMethod||'Cash'), notes=String(d?.notes||'').trim();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date+'T00:00:00')))return {ok:false,error:'Choose a valid expense date.'};
    if(!cat||!desc)return {ok:false,error:'Category and description are required.'};
    if(!Number.isFinite(amount)||amount<=0)return {ok:false,error:'Expense amount must be greater than zero.'};
    try { const r=db.prepare('INSERT INTO business_expenses(expense_date,category,description,amount,payment_method,notes) VALUES(?,?,?,?,?,?)').run(date,cat,desc,amount,method,notes);return {ok:true,id:r.lastInsertRowid}; }
    catch(e) { return {ok:false,error:'Unable to save expense.'}; }
  });
  ipcMain.handle('expenses:delete', (_event,id) => { try { const r=db.prepare('DELETE FROM business_expenses WHERE id=?').run(Number(id));return r.changes?{ok:true}:{ok:false,error:'Expense not found.'}; } catch(e){return {ok:false,error:'Unable to delete expense.'};} });
  ipcMain.handle('profit-loss:summary', (_event,f={}) => {
    const from=String(f.from||new Date().toISOString().slice(0,7)+'-01'), to=String(f.to||new Date().toISOString().slice(0,10));
    if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)||from>to)return {ok:false,error:'Choose a valid reporting date range.'};
    try {
      const s=db.prepare("SELECT COUNT(*) AS count,COALESCE(SUM(total),0) AS revenue FROM sales WHERE date(sale_date) BETWEEN date(?) AND date(?)").get(from,to);
      const c=db.prepare("SELECT COALESCE(SUM(quantity*unit_cost),0) AS cogs FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE date(sale_date) BETWEEN date(?) AND date(?))").get(from,to);
      const e=db.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM business_expenses WHERE date(expense_date) BETWEEN date(?) AND date(?)").get(from,to);
      const p=db.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM staff_payments WHERE date(payment_date) BETWEEN date(?) AND date(?)").get(from,to);
      const b=db.prepare('SELECT currency FROM business WHERE id=1').get(), revenue=Number(s.revenue||0), cogs=Number(c.cogs||0), operating=Number(e.total||0), salary=Number(p.total||0), gross=revenue-cogs;
      return {ok:true,from,to,currency:b?.currency||'PKR',salesCount:Number(s.count||0),revenue,costOfGoodsSold:cogs,grossProfit:gross,businessExpenses:operating,salaryExpenses:salary,netProfit:gross-operating-salary};
    } catch(e) { return {ok:false,error:'Unable to calculate profit and loss.'}; }
  });


  ipcMain.handle('analytics:overview', (_event, options = {}) => {
    const period = ['7d','30d','12m'].includes(options.period) ? options.period : '30d';
    const startExpr = period === '12m' ? "date('now','localtime','start of month','-11 months')" : period === '7d' ? "date('now','localtime','-6 days')" : "date('now','localtime','-29 days')";
    try {
      const sales = db.prepare("SELECT COUNT(*) AS count, COALESCE(SUM(total),0) AS revenue, COALESCE(SUM(paid_amount),0) AS collected, COALESCE(SUM(total-paid_amount),0) AS outstanding FROM sales WHERE date(sale_date) BETWEEN " + startExpr + " AND date('now','localtime')").get();
      const costs = db.prepare("SELECT COALESCE(SUM(si.quantity*si.unit_cost),0) AS cogs FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE date(s.sale_date) BETWEEN " + startExpr + " AND date('now','localtime')").get();
      const purchases = db.prepare("SELECT COUNT(*) AS count,COALESCE(SUM(subtotal),0) AS total,COALESCE(SUM(paid_amount),0) AS paid,COALESCE(SUM(subtotal-paid_amount),0) AS outstanding FROM purchases WHERE date(purchase_date) BETWEEN " + startExpr + " AND date('now','localtime')").get();
      const expenses = db.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM business_expenses WHERE date(expense_date) BETWEEN " + startExpr + " AND date('now','localtime')").get();
      const payroll = db.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM staff_payments WHERE date(payment_date) BETWEEN " + startExpr + " AND date('now','localtime')").get();
      const inventory = db.prepare("SELECT COUNT(*) AS products,COALESCE(SUM(stock_quantity),0) AS units,COALESCE(SUM(stock_quantity*buying_price),0) AS stock_cost,COALESCE(SUM(stock_quantity*selling_price),0) AS stock_retail,COALESCE(SUM(CASE WHEN stock_quantity<=low_stock_threshold THEN 1 ELSE 0 END),0) AS low_stock,COALESCE(SUM(CASE WHEN stock_quantity=0 THEN 1 ELSE 0 END),0) AS out_of_stock FROM products").get();
      const business = db.prepare('SELECT currency FROM business WHERE id=1').get();
      const netProfit = Number(sales.revenue||0)-Number(costs.cogs||0)-Number(expenses.total||0)-Number(payroll.total||0);
      const series = period === '12m'
        ? db.prepare("WITH RECURSIVE periods(d,n) AS (SELECT date('now','localtime','start of month','-11 months'),0 UNION ALL SELECT date(d,'+1 month'),n+1 FROM periods WHERE n<11) SELECT strftime('%Y-%m',periods.d) AS label,COALESCE((SELECT SUM(total) FROM sales WHERE strftime('%Y-%m',sale_date)=strftime('%Y-%m',periods.d)),0) AS revenue,COALESCE((SELECT SUM(si.quantity*si.unit_cost) FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE strftime('%Y-%m',s.sale_date)=strftime('%Y-%m',periods.d)),0) AS cogs,COALESCE((SELECT SUM(amount) FROM business_expenses WHERE strftime('%Y-%m',expense_date)=strftime('%Y-%m',periods.d)),0) AS expenses,COALESCE((SELECT SUM(amount) FROM staff_payments WHERE strftime('%Y-%m',payment_date)=strftime('%Y-%m',periods.d)),0) AS salaries FROM periods ORDER BY periods.d").all()
        : db.prepare("WITH RECURSIVE periods(d,n) AS (SELECT " + startExpr + ",0 UNION ALL SELECT date(d,'+1 day'),n+1 FROM periods WHERE d<date('now','localtime')) SELECT strftime('%Y-%m-%d',periods.d) AS label,COALESCE((SELECT SUM(total) FROM sales WHERE date(sale_date)=periods.d),0) AS revenue,COALESCE((SELECT SUM(si.quantity*si.unit_cost) FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE date(s.sale_date)=periods.d),0) AS cogs,COALESCE((SELECT SUM(amount) FROM business_expenses WHERE date(expense_date)=periods.d),0) AS expenses,COALESCE((SELECT SUM(amount) FROM staff_payments WHERE date(payment_date)=periods.d),0) AS salaries FROM periods ORDER BY periods.d").all();
      const topProducts = db.prepare("SELECT si.product_name AS name,SUM(si.quantity) AS units,SUM(si.line_total) AS revenue,SUM(si.line_profit) AS gross_profit FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE date(s.sale_date) BETWEEN " + startExpr + " AND date('now','localtime') GROUP BY si.product_id,si.product_name ORDER BY revenue DESC LIMIT 8").all();
      const categoryMix = db.prepare("SELECT COALESCE(NULLIF(p.category,''),'Uncategorized') AS name,SUM(si.quantity) AS units,SUM(si.line_total) AS revenue FROM sale_items si JOIN sales s ON s.id=si.sale_id LEFT JOIN products p ON p.id=si.product_id WHERE date(s.sale_date) BETWEEN " + startExpr + " AND date('now','localtime') GROUP BY COALESCE(NULLIF(p.category,''),'Uncategorized') ORDER BY revenue DESC LIMIT 8").all();
      const recentSales = db.prepare('SELECT sale_number,customer_name,sale_date,total,paid_amount,payment_status FROM sales ORDER BY date(sale_date) DESC,id DESC LIMIT 8').all();
      const recentPurchases = db.prepare('SELECT purchase_number,supplier_name,purchase_date,subtotal,paid_amount,payment_status FROM purchases ORDER BY date(purchase_date) DESC,id DESC LIMIT 8').all();
      const staff = db.prepare("SELECT COUNT(*) AS total,COALESCE(SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END),0) AS active,COALESCE(SUM(CASE WHEN status='Active' THEN monthly_salary ELSE 0 END),0) AS monthly_payroll FROM staff").get();
      const movementCount = db.prepare("SELECT COUNT(*) AS total FROM stock_movements WHERE date(created_at) BETWEEN " + startExpr + " AND date('now','localtime')").get();
      return {ok:true,period,currency:business?.currency||'PKR',inventory:{...inventory,products:Number(inventory.products||0),units:Number(inventory.units||0),stock_cost:Number(inventory.stock_cost||0),stock_retail:Number(inventory.stock_retail||0),low_stock:Number(inventory.low_stock||0),out_of_stock:Number(inventory.out_of_stock||0)},sales:{...sales,count:Number(sales.count||0),revenue:Number(sales.revenue||0),collected:Number(sales.collected||0),outstanding:Number(sales.outstanding||0)},costOfGoodsSold:Number(costs.cogs||0),grossProfit:Number(sales.revenue||0)-Number(costs.cogs||0),expenses:Number(expenses.total||0),salaryExpenses:Number(payroll.total||0),netProfit,salesCount:Number(sales.count||0),purchases:{...purchases},staff:{...staff},stockMovements:Number(movementCount.total||0),series,topProducts,categoryMix,recentSales,recentPurchases};
    } catch(error) { return {ok:false,error:'Unable to calculate dashboard analytics.'}; }
  });

  ipcMain.handle('reports:generate', (_event, filters = {}) => {
    const from=String(filters.from||new Date().toISOString().slice(0,7)+'-01'), to=String(filters.to||new Date().toISOString().slice(0,10));
    if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)||from>to) return {ok:false,error:'Choose a valid reporting date range.'};
    try {
      const sales=db.prepare("SELECT id,sale_number,sale_date,customer_name,subtotal,discount,total,paid_amount,total-paid_amount AS due,payment_method,payment_status FROM sales WHERE date(sale_date) BETWEEN date(?) AND date(?) ORDER BY date(sale_date) DESC,id DESC").all(from,to);
      const saleItems=db.prepare("SELECT s.sale_number,si.product_name,si.quantity,si.unit_price,si.unit_cost,si.line_total,si.line_profit FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE date(s.sale_date) BETWEEN date(?) AND date(?) ORDER BY date(s.sale_date) DESC,s.id DESC,si.id").all(from,to);
      const purchases=db.prepare("SELECT purchase_number,purchase_date,supplier_name,invoice_number,subtotal,paid_amount,subtotal-paid_amount AS due,payment_status FROM purchases WHERE date(purchase_date) BETWEEN date(?) AND date(?) ORDER BY date(purchase_date) DESC,id DESC").all(from,to);
      const expenses=db.prepare("SELECT expense_date,category,description,amount,payment_method,notes FROM business_expenses WHERE date(expense_date) BETWEEN date(?) AND date(?) ORDER BY date(expense_date) DESC,id DESC").all(from,to);
      const salaries=db.prepare("SELECT payment_date,staff_name,period_label,amount,payment_method,notes FROM staff_payments WHERE date(payment_date) BETWEEN date(?) AND date(?) ORDER BY date(payment_date) DESC,id DESC").all(from,to);
      const movements=db.prepare("SELECT created_at,product_name,movement_type,quantity_change,previous_quantity,new_quantity,reason,notes FROM stock_movements WHERE date(created_at) BETWEEN date(?) AND date(?) ORDER BY datetime(created_at) DESC,id DESC LIMIT 5000").all(from,to);
      const inv=db.prepare("SELECT COUNT(*) AS product_count,COALESCE(SUM(stock_quantity),0) AS units,COALESCE(SUM(stock_quantity*buying_price),0) AS stock_cost,COALESCE(SUM(stock_quantity*selling_price),0) AS stock_retail,COALESCE(SUM(CASE WHEN stock_quantity<=low_stock_threshold THEN 1 ELSE 0 END),0) AS low_stock FROM products").get();
      const revenue=sales.reduce((a,x)=>a+Number(x.total||0),0),collected=sales.reduce((a,x)=>a+Number(x.paid_amount||0),0),cogs=saleItems.reduce((a,x)=>a+Number(x.quantity||0)*Number(x.unit_cost||0),0),purchaseTotal=purchases.reduce((a,x)=>a+Number(x.subtotal||0),0),purchasePaid=purchases.reduce((a,x)=>a+Number(x.paid_amount||0),0),expenseTotal=expenses.reduce((a,x)=>a+Number(x.amount||0),0),salaryTotal=salaries.reduce((a,x)=>a+Number(x.amount||0),0);
      const business=db.prepare('SELECT currency FROM business WHERE id=1').get();
      return {ok:true,from,to,currency:business?.currency||'PKR',summary:{salesCount:sales.length,revenue,collected,salesDue:revenue-collected,costOfGoodsSold:cogs,grossProfit:revenue-cogs,purchaseCount:purchases.length,purchaseTotal,purchasePaid,purchaseDue:purchaseTotal-purchasePaid,expenseTotal,salaryTotal,netProfit:revenue-cogs-expenseTotal-salaryTotal,inventory:{product_count:Number(inv.product_count||0),units:Number(inv.units||0),stock_cost:Number(inv.stock_cost||0),stock_retail:Number(inv.stock_retail||0),low_stock:Number(inv.low_stock||0)}},sales,saleItems,purchases,expenses,salaries,movements};
    } catch(error) { return {ok:false,error:'Unable to generate the requested report.'}; }
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
