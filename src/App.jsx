import React, { useEffect, useState } from 'react';

function Logo() {
  return <div className="brand"><span className="brand-mark">S</span><span>StockDesk</span></div>;
}

function Home({ onLogin, onCreate }) {
  return (
    <div className="landing">
      <header className="topbar">
        <Logo />
        <div className="top-actions">
          <button className="btn ghost" onClick={onLogin}>Sign In</button>
          <button className="btn primary" onClick={onCreate}>Create Account</button>
        </div>
      </header>
      <main className="hero">
        <div className="hero-copy">
          <div className="eyebrow">OFFLINE INVENTORY MANAGEMENT</div>
          <h1>Know your numbers.<br /><span>Grow your business.</span></h1>
          <p>StockDesk gives shop owners a clear view of products, stock, sales, expenses, profit and loss. Your business data stays on your computer and works without the internet.</p>
          <div className="hero-actions">
            <button className="btn primary large" onClick={onCreate}>Create your account <span>→</span></button>
            <button className="text-btn" onClick={onLogin}>Already have an account? Sign in</button>
          </div>
          <div className="trust-row"><span>● 100% Offline</span><span>● Local SQLite database</span><span>● No monthly database fee</span></div>
        </div>
        <div className="hero-card">
          <div className="window-top"><span></span><span></span><span></span><b>Dashboard</b></div>
          <div className="preview-content">
            <div className="mini-sidebar"><div className="mini-logo">S</div><i></i><i></i><i></i><i></i><i></i></div>
            <div className="mini-main">
              <small>OVERVIEW</small><h3>Good morning, Admin</h3>
              <div className="mini-stats"><div><small>Products</small><strong>248</strong></div><div><small>Stock Value</small><strong>₨ 1.24M</strong></div><div><small>Today Sales</small><strong>₨ 48,650</strong></div></div>
              <div className="mini-chart"><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            </div>
          </div>
        </div>
      </main>
      <section className="benefits">
        <div className="section-intro"><div className="eyebrow">BUILT FOR BETTER DECISIONS</div><h2>Turn daily transactions into business insight.</h2><p>Recording sales is useful. Understanding what those sales mean is where things get interesting.</p></div>
        <div className="benefit-grid">
          <div className="benefit"><span className="benefit-number">01</span><div className="benefit-icon">↗</div><h3>Track sales clearly</h3><p>See daily, weekly and monthly sales so you know when your business is performing well.</p></div>
          <div className="benefit"><span className="benefit-number">02</span><div className="benefit-icon">◒</div><h3>Understand profit & loss</h3><p>Compare buying costs with selling prices and monitor real profitability.</p></div>
          <div className="benefit"><span className="benefit-number">03</span><div className="benefit-icon">▥</div><h3>Watch your inventory</h3><p>Know what you have, what is running low and how much money is tied up in stock.</p></div>
          <div className="benefit"><span className="benefit-number">04</span><div className="benefit-icon">⌁</div><h3>Make smarter decisions</h3><p>Use trends and reports to identify strong products, slow-moving stock and better margins.</p></div>
        </div>
      </section>
      <section className="analytics-section">
        <div className="analytics-copy"><div className="eyebrow">BUSINESS ANALYTICS</div><h2>See the direction of your business, not just today's sales.</h2><p>StockDesk turns recorded transactions into easy-to-read charts and summaries. Follow sales trends, compare profit performance and understand where your money is going.</p>
          <div className="analytics-points"><div><b>Sales trends</b><span>Compare performance across days, weeks and months.</span></div><div><b>Profit monitoring</b><span>See whether revenue is actually becoming profit.</span></div><div><b>Inventory value</b><span>Understand how much capital is sitting in stock.</span></div></div>
        </div>
        <div className="analytics-card"><div className="analytics-head"><div><b>Sales & profit</b><small>Illustrative dashboard preview</small></div><span>This year ▾</span></div><div className="analytics-bars">{[42,58,51,69,63,78,88,74,94,82,97,91].map((h,i)=><div className="bar-wrap" key={i}><div className="bar" style={{height:h+'%'}}></div><small>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}</small></div>)}</div><div className="analytics-legend"><span><i></i>Sales</span><span><i></i>Profit</span></div></div>
      </section>
      <section className="workflow"><div className="eyebrow">ONE SIMPLE WORKFLOW</div><h2>From transaction to insight.</h2><div className="workflow-grid"><div><strong>01</strong><h3>Record</h3><p>Add products, purchases and sales as your business operates.</p></div><div><strong>02</strong><h3>Monitor</h3><p>Keep an eye on stock, costs, revenue and activity.</p></div><div><strong>03</strong><h3>Analyze</h3><p>Use reports and charts to understand performance.</p></div><div><strong>04</strong><h3>Grow</h3><p>Use real numbers to improve pricing, stock and margins.</p></div></div></section>
      <section className="cta"><div><div className="eyebrow">READY WHEN YOU ARE</div><h2>Start with a cleaner way to manage your business.</h2><p>No cloud subscription. No internet dependency. Just your business data, stored locally.</p></div><button className="btn light large" onClick={onCreate}>Create your account →</button></section>
      <footer><Logo /><span>Offline inventory management for growing businesses.</span></footer>
    </div>
  );
}

function Auth({ mode, setMode, onSuccess }) {
  const [form, setForm] = useState({ businessName:'', ownerName:'', phone:'', address:'', currency:'PKR', username:'', password:'' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password) return setError('Username and password are required.');
    if (mode === 'create') {
      if (!form.businessName.trim()) return setError('Business name is required.');
      if (!form.ownerName.trim()) return setError('Owner name is required.');
      if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    }

    if (!window.inventoryAPI) {
      setError('This page is not running inside the StockDesk desktop app. Open the Electron application to use the local database.');
      return;
    }

    setBusy(true);
    try {
      const result = mode === 'create'
        ? await window.inventoryAPI.createAccount({
            businessName: form.businessName.trim(),
            ownerName: form.ownerName.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            currency: form.currency,
            username: form.username.trim(),
            password: form.password
          })
        : await window.inventoryAPI.login({ username: form.username.trim(), password: form.password });

      if (!result?.ok) {
        setError(mode === 'create'
          ? (result?.error || 'Unable to create the local account.')
          : 'Incorrect username or password.');
      } else {
        onSuccess(result.username, result.businessName);
      }
    } catch (error) {
      console.error('Local database error:', error);
      setError('The local database could not be reached. Please restart the StockDesk desktop app and try again.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="auth-page">
    <div className="auth-brand"><Logo /></div>
    <div className="auth-shell">
      <div className="auth-side"><div className="eyebrow">STOCKDESK</div><h1>{mode === 'create' ? 'Set up your workspace.' : 'Welcome back.'}</h1><p>{mode === 'create' ? 'Create the local administrator account and save your business information on this computer.' : 'Sign in to your local inventory dashboard.'}</p><div className="offline-badge">● Offline-first · SQLite storage</div></div>
      <form className="auth-card" onSubmit={submit}>
        <h2>{mode === 'create' ? 'Create account' : 'Sign in'}</h2>
        <p className="muted">{mode === 'create' ? 'Your business information and login are stored locally.' : 'Enter your local account credentials.'}</p>
        {mode === 'create' && <>
          <label>Business name<input value={form.businessName} onChange={e=>update('businessName',e.target.value)} placeholder="e.g. Khan General Store" autoFocus /></label>
          <label>Owner name<input value={form.ownerName} onChange={e=>update('ownerName',e.target.value)} placeholder="Full name" /></label>
          <label>Phone number<input value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="Optional" /></label>
          <label>Business address<input value={form.address} onChange={e=>update('address',e.target.value)} placeholder="Optional" /></label>
          <label>Currency<select className="currency-select" value={form.currency} onChange={e=>update('currency',e.target.value)}><option value="PKR">PKR - Pakistani Rupee</option><option value="USD">USD - US Dollar</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - Pound Sterling</option></select></label>
        </>}
        <label>Username<input value={form.username} onChange={e=>update('username',e.target.value)} placeholder="Choose a username" autoFocus={mode==='login'} /></label>
        <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e=>update('password',e.target.value)} placeholder={mode==='create' ? 'At least 8 characters' : 'Enter your password'} /><button type="button" className="password-toggle" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? '◉' : '◌'}</button></div></label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'create' ? 'Create Account' : 'Sign In'}</button>
        <button type="button" className="back-link" onClick={()=>setMode(mode === 'create' ? 'login' : 'home')}>← Back</button>
      </form>
    </div>
  </div>;
}

const NAV = [
  ['Overview','⌂'], ['Products','▦'], ['Stock','↕'], ['Purchases','＋'], ['Sales','₨'],
  ['Profit & Loss','◒'], ['Staff','♙'], ['Dashboard Analytics','◫'], ['Reports','▤'],
  ['Backup & Restore','↥'], ['Barcode/QR','▥'], ['Installation','⌘']
];

function Products({ currency = 'PKR' }) {
  const emptyForm = { name:'', category:'', sku:'', barcode:'', buyingPrice:'', sellingPrice:'', stock:'', lowStock:'5' };
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const result = await window.inventoryAPI.listProducts();
      if (result?.ok) setProducts(result.products || []);
      else setError(result?.error || 'Unable to load products.');
    } catch (e) { setError('Unable to load products from the local database.'); }
  };

  useEffect(() => { load(); }, []);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const reset = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!form.name.trim()) return setError('Product name is required.');
    const buyingPrice = Number(form.buyingPrice);
    const sellingPrice = Number(form.sellingPrice);
    const stock = Number(form.stock);
    const lowStock = Number(form.lowStock);
    if (![buyingPrice, sellingPrice, stock, lowStock].every(Number.isFinite) || buyingPrice < 0 || sellingPrice < 0 || stock < 0 || lowStock < 0) {
      return setError('Prices, stock and low-stock level must be valid non-negative numbers.');
    }
    setBusy(true);
    try {
      const payload = { ...form, name:form.name.trim(), category:form.category.trim(), sku:form.sku.trim(), barcode:form.barcode.trim(), buyingPrice, sellingPrice, stock, lowStock };
      const result = editingId
        ? await window.inventoryAPI.updateProduct(editingId, payload)
        : await window.inventoryAPI.createProduct(payload);
      if (!result?.ok) setError(result?.error || 'Unable to save product.');
      else { setMessage(editingId ? 'Product updated successfully.' : 'Product added successfully.'); reset(); await load(); }
    } catch (e) { setError('The local database could not save this product.'); }
    finally { setBusy(false); }
  };

  const edit = (p) => {
    setEditingId(p.id);
    setForm({ name:p.name || '', category:p.category || '', sku:p.sku || '', barcode:p.barcode || '', buyingPrice:String(p.buying_price ?? ''), sellingPrice:String(p.selling_price ?? ''), stock:String(p.stock_quantity ?? ''), lowStock:String(p.low_stock_threshold ?? '5') });
    setShowForm(true); setMessage(''); setError('');
  };

  const remove = async (p) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setError(''); setMessage('');
    try {
      const result = await window.inventoryAPI.deleteProduct(p.id);
      if (!result?.ok) setError(result?.error || 'Unable to delete product.');
      else { setMessage('Product deleted successfully.'); await load(); }
    } catch (e) { setError('The local database could not delete this product.'); }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()];
  const filtered = products.filter(p => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [p.name,p.category,p.sku,p.barcode].some(v => String(v || '').toLowerCase().includes(q));
    return matchesSearch && (category === 'All' || p.category === category);
  });
  const money = (v) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(v || 0));
  const totalStockValue = products.reduce((sum,p) => sum + Number(p.buying_price || 0) * Number(p.stock_quantity || 0), 0);
  const lowStockCount = products.filter(p => Number(p.stock_quantity) <= Number(p.low_stock_threshold)).length;

  return <div className="products-page">
    <div className="products-summary">
      <div><span>Total products</span><strong>{products.length}</strong></div>
      <div><span>Stock value</span><strong>{currency} {money(totalStockValue)}</strong></div>
      <div><span>Low stock</span><strong>{lowStockCount}</strong></div>
      <div><span>Showing</span><strong>{filtered.length}</strong></div>
    </div>
    <div className="products-toolbar">
      <div className="product-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, SKU or barcode..." /></div>
      <select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select>
      <button className="btn primary" onClick={()=>{setEditingId(null);setForm(emptyForm);setShowForm(true);setError('');setMessage('');}}>+ Add Product</button>
    </div>
    {message && <div className="product-message">{message}</div>}
    {error && <div className="form-error product-error">{error}</div>}
    {showForm && <form className="panel product-form" onSubmit={submit}>
      <div className="panel-head"><div><h2>{editingId ? 'Edit product' : 'Add product'}</h2><p>Product information is stored locally in SQLite.</p></div><button type="button" className="icon-close" onClick={reset}>×</button></div>
      <div className="product-fields">
        <label>Product name *<input value={form.name} onChange={e=>update('name',e.target.value)} placeholder="e.g. Coca Cola 1.5L" autoFocus /></label>
        <label>Category<input value={form.category} onChange={e=>update('category',e.target.value)} placeholder="e.g. Beverages" /></label>
        <label>SKU<input value={form.sku} onChange={e=>update('sku',e.target.value)} placeholder="e.g. COKE-15" /></label>
        <label>Barcode / QR value<input value={form.barcode} onChange={e=>update('barcode',e.target.value)} placeholder="Enter or scan later" /></label>
        <label>Buying price<input type="number" min="0" step="0.01" value={form.buyingPrice} onChange={e=>update('buyingPrice',e.target.value)} placeholder="0.00" /></label>
        <label>Selling price<input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={e=>update('sellingPrice',e.target.value)} placeholder="0.00" /></label>
        <label>Current stock<input type="number" min="0" step="1" value={form.stock} onChange={e=>update('stock',e.target.value)} placeholder="0" /></label>
        <label>Low-stock alert at<input type="number" min="0" step="1" value={form.lowStock} onChange={e=>update('lowStock',e.target.value)} placeholder="5" /></label>
      </div>
      <div className="product-form-actions"><button type="button" className="btn ghost" onClick={reset}>Cancel</button><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save Changes' : 'Add Product'}</button></div>
    </form>}
    <div className="panel product-table-panel">
      <div className="panel-head"><div><h2>Products</h2><p>{filtered.length} product{filtered.length===1?'':'s'} found</p></div></div>
      {filtered.length ? <div className="table-wrap"><table className="product-table"><thead><tr><th>Product</th><th>Category</th><th>SKU / Barcode</th><th>Buying</th><th>Selling</th><th>Stock</th><th>Unit profit</th><th>Status</th><th></th></tr></thead><tbody>
        {filtered.map(p => { const profit=Number(p.selling_price||0)-Number(p.buying_price||0); const low=Number(p.stock_quantity||0)<=Number(p.low_stock_threshold||0); return <tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.category || '—'}</td><td><small>{p.sku || p.barcode || '—'}</small></td><td>{currency} {money(p.buying_price)}</td><td>{currency} {money(p.selling_price)}</td><td><b>{p.stock_quantity}</b></td><td>{currency} {money(profit)}</td><td><span className={low?'stock-badge low':'stock-badge ok'}>{low?'Low stock':'In stock'}</span></td><td><div className="row-actions"><button onClick={()=>edit(p)}>Edit</button><button className="danger" onClick={()=>remove(p)}>Delete</button></div></td></tr> })}
      </tbody></table></div> : <div className="products-empty"><div>▦</div><h3>{products.length ? 'No matching products' : 'No products yet'}</h3><p>{products.length ? 'Try another search or category.' : 'Add your first product to start building your inventory.'}</p>{!products.length && <button className="btn primary" onClick={()=>setShowForm(true)}>Add your first product</button>}</div>}
    </div>
  </div>;
}

function Stock({ currency = 'PKR' }) {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  const [movementType, setMovementType] = useState('All');
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [form, setForm] = useState({ productId: '', operation: 'add', quantity: '1', reason: 'Purchase received', notes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const load = async () => {
    try {
      const [productResult, movementResult] = await Promise.all([
        window.inventoryAPI.listProducts(),
        window.inventoryAPI.listStockMovements({ type: movementType, from: fromDate, to: toDate })
      ]);
      if (productResult?.ok) setProducts(productResult.products || []);
      else setError(productResult?.error || 'Unable to load products.');
      if (movementResult?.ok) setMovements(movementResult.movements || []);
      else setError(movementResult?.error || 'Unable to load stock history.');
    } catch (e) {
      setError('Stock data could not be loaded from the local database.');
    }
  };

  useEffect(() => { load(); }, [movementType, fromDate, toDate]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const money = value => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(value || 0));
  const totalUnits = products.reduce((sum, product) => sum + Number(product.stock_quantity || 0), 0);
  const stockValue = products.reduce((sum, product) => sum + Number(product.buying_price || 0) * Number(product.stock_quantity || 0), 0);
  const lowStock = products.filter(product => Number(product.stock_quantity || 0) > 0 && Number(product.stock_quantity || 0) <= Number(product.low_stock_threshold ?? 5)).length;
  const outOfStock = products.filter(product => Number(product.stock_quantity || 0) <= 0).length;
  const filteredProducts = products.filter(product => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [product.name, product.category, product.sku, product.barcode].some(value => String(value || '').toLowerCase().includes(query));
    const quantity = Number(product.stock_quantity || 0);
    const matchesStock = stockFilter === 'All' || (stockFilter === 'Low stock' && quantity > 0 && quantity <= Number(product.low_stock_threshold ?? 5)) || (stockFilter === 'Out of stock' && quantity <= 0) || (stockFilter === 'In stock' && quantity > Number(product.low_stock_threshold ?? 5));
    return matchesSearch && matchesStock;
  });

  const submitAdjustment = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!form.productId) return setError('Choose a product first.');
    const quantity = Number(form.quantity);
    if (!Number.isInteger(quantity) || quantity < 0 || (form.operation !== 'set' && quantity < 1)) return setError('Enter a valid whole-number quantity.');
    setBusy(true);
    try {
      const result = await window.inventoryAPI.adjustStock({
        productId: Number(form.productId),
        operation: form.operation,
        quantity,
        reason: form.reason,
        notes: form.notes
      });
      if (!result?.ok) setError(result?.error || 'Stock adjustment failed.');
      else {
        setMessage('Stock updated for ' + result.name + ': ' + result.previous + ' → ' + result.next + ' units.');
        setForm({ productId: '', operation: 'add', quantity: '1', reason: 'Purchase received', notes: '' });
        setShowAdjustment(false);
        await load();
      }
    } catch (e) {
      setError('The stock adjustment could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="stock-page">
    <section className="stock-summary">
      <div><span>Total units on hand</span><strong>{money(totalUnits)}</strong><small>Across all saved products</small></div>
      <div><span>Inventory value</span><strong>{currency} {money(stockValue)}</strong><small>Based on buying prices</small></div>
      <div><span>Low stock</span><strong>{money(lowStock)}</strong><small>At or below threshold</small></div>
      <div><span>Out of stock</span><strong>{money(outOfStock)}</strong><small>Zero units available</small></div>
    </section>
    <div className="stock-toolbar">
      <div><h2>Stock on hand</h2><p>Manage quantities and track every change to your inventory.</p></div>
      <button className="btn primary" onClick={() => { setShowAdjustment(value => !value); setError(''); setMessage(''); }}>↕ Adjust stock</button>
    </div>
    {message && <div className="product-message">{message}</div>}
    {error && <div className="form-error product-error">{error}</div>}
    {showAdjustment && <form className="panel stock-adjust-form" onSubmit={submitAdjustment}>
      <div className="panel-head"><div><h2>Stock adjustment</h2><p>Every adjustment updates the product quantity and creates a permanent movement record.</p></div><button type="button" className="icon-close" onClick={() => setShowAdjustment(false)}>×</button></div>
      <div className="stock-adjust-fields">
        <label>Product *<select required value={form.productId} onChange={event=>update('productId',event.target.value)}><option value="">Select a product</option>{products.map(product=><option key={product.id} value={product.id}>{product.name} · current: {product.stock_quantity}</option>)}</select></label>
        <label>Adjustment type *<select value={form.operation} onChange={event=>update('operation',event.target.value)}><option value="add">Add stock</option><option value="remove">Remove stock</option><option value="set">Set exact quantity</option></select></label>
        <label>{form.operation === 'set' ? 'New total quantity *' : 'Quantity *'}<input type="number" required min={form.operation === 'set' ? 0 : 1} step="1" value={form.quantity} onChange={event=>update('quantity',event.target.value)} /></label>
        <label>Reason *<select required value={form.reason} onChange={event=>update('reason',event.target.value)}>{['Purchase received','Sale / issued','Damaged goods','Lost / missing','Returned by customer','Returned to supplier','Stock count correction','Opening stock','Other'].map(reason=><option key={reason}>{reason}</option>)}</select></label>
        <label className="stock-notes-field">Notes (optional)<input value={form.notes} onChange={event=>update('notes',event.target.value)} placeholder="Reference, explanation, or batch details" maxLength="500" /></label>
      </div>
      <div className="stock-adjust-hint">Stock cannot be reduced below zero. Use “Set exact quantity” to reconcile a physical stock count.</div>
      <div className="product-form-actions"><button type="button" className="btn ghost" onClick={() => setShowAdjustment(false)}>Cancel</button><button className="btn primary" disabled={busy || products.length===0}>{busy ? 'Saving…' : 'Save adjustment'}</button></div>
    </form>}
    <section className="panel stock-table-panel">
      <div className="panel-head"><div><h2>Current stock</h2><p>{filteredProducts.length} of {products.length} products</p></div></div>
      <div className="stock-filters"><div className="product-search"><span>⌕</span><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search product, SKU, barcode..." /></div><select value={stockFilter} onChange={event=>setStockFilter(event.target.value)}><option>All</option><option>In stock</option><option>Low stock</option><option>Out of stock</option></select></div>
      {filteredProducts.length ? <div className="table-wrap"><table className="product-table stock-table"><thead><tr><th>Product</th><th>SKU / Barcode</th><th>Category</th><th>Buying price</th><th>On hand</th><th>Low-stock level</th><th>Stock value</th><th>Status</th><th></th></tr></thead><tbody>
        {filteredProducts.map(product => {
          const quantity = Number(product.stock_quantity || 0);
          const threshold = Number(product.low_stock_threshold ?? 5);
          const status = quantity <= 0 ? 'Out of stock' : quantity <= threshold ? 'Low stock' : 'In stock';
          return <tr key={product.id}><td><strong>{product.name}</strong></td><td><small>{product.sku || product.barcode || '—'}</small></td><td>{product.category || '—'}</td><td>{currency} {money(product.buying_price)}</td><td><b>{money(quantity)}</b></td><td>{money(threshold)}</td><td>{currency} {money(quantity * Number(product.buying_price || 0))}</td><td><span className={'stock-badge ' + (status === 'In stock' ? 'ok' : 'low')}>{status}</span></td><td><button className="stock-adjust-row" onClick={() => { setForm({ productId:String(product.id), operation:'add', quantity:'1', reason:'Purchase received', notes:'' }); setShowAdjustment(true); setError(''); setMessage(''); }}>Adjust</button></td></tr>;
        })}
      </tbody></table></div> : <div className="products-empty"><div>↕</div><h3>{products.length ? 'No matching stock records' : 'No products to track yet'}</h3><p>{products.length ? 'Try changing your search or stock filter.' : 'Add products first, then manage their stock here.'}</p></div>}
    </section>
    <section className="panel stock-history-panel">
      <div className="panel-head"><div><h2>Stock movement history</h2><p>Latest 500 saved adjustments, newest first</p></div><span className="period">{movements.length} records</span></div>
      <div className="stock-history-filters">
        <label>From<input type="date" value={fromDate} onChange={event=>setFromDate(event.target.value)} /></label>
        <label>To<input type="date" value={toDate} onChange={event=>setToDate(event.target.value)} /></label>
        <label>Movement<select value={movementType} onChange={event=>setMovementType(event.target.value)}><option>All</option><option value="addition">Addition</option><option value="removal">Removal</option><option value="correction">Correction</option></select></label>
      </div>
      {movements.length ? <div className="table-wrap"><table className="product-table stock-history-table"><thead><tr><th>Date & time</th><th>Product</th><th>Movement</th><th>Change</th><th>Before</th><th>After</th><th>Reason</th><th>Notes</th></tr></thead><tbody>
        {movements.map(item=><tr key={item.id}><td>{item.created_at}</td><td><strong>{item.product_name}</strong></td><td><span className={'stock-badge ' + (item.quantity_change > 0 ? 'ok' : 'low')}>{item.movement_type}</span></td><td><b className={item.quantity_change > 0 ? 'stock-change-positive' : 'stock-change-negative'}>{item.quantity_change > 0 ? '+' : ''}{item.quantity_change}</b></td><td>{item.previous_quantity}</td><td>{item.new_quantity}</td><td>{item.reason}</td><td><small>{item.notes || '—'}</small></td></tr>)}
      </tbody></table></div> : <div className="products-empty stock-history-empty"><div>↕</div><h3>No stock movements recorded</h3><p>Adjust a product's stock to create the first history record. Existing stock is kept as-is.</p></div>}
    </section>
  </div>;
}

function Dashboard({ username, businessName, onLogout }) {
  const [active, setActive] = useState('Overview');
  const [summary, setSummary] = useState({
    currency: 'PKR',
    totalProducts: 0,
    stockValue: 0,
    potentialMargin: 0,
    lowStockCount: 0,
    lowStockProducts: [],
    categories: [],
    recentProducts: []
  });
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    if (active !== 'Overview' || !window.inventoryAPI?.getDashboardSummary) return undefined;
    let mounted = true;
    const loadSummary = async () => {
      try {
        const result = await window.inventoryAPI.getDashboardSummary();
        if (mounted && result?.ok) {
          setSummary(result);
          setSummaryError('');
        } else if (mounted) {
          setSummaryError('Dashboard data could not be loaded from the local database.');
        }
      } catch (error) {
        if (mounted) setSummaryError('Dashboard data could not be loaded from the local database.');
      }
    };
    loadSummary();
    const refreshId = setInterval(loadSummary, 10000);
    return () => {
      mounted = false;
      clearInterval(refreshId);
    };
  }, [active]);

  const money = (value) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(value || 0));
  const currency = summary.currency || 'PKR';
  const maxCategoryProducts = Math.max(1, ...summary.categories.map(item => Number(item.products || 0)));

  return <div className="dashboard">
    <aside className="sidebar">
      <Logo />
      <div className="nav-label">MAIN MENU</div>
      {NAV.map(([name,icon])=><button className={active===name?'nav-item active':'nav-item'} key={name} onClick={()=>setActive(name)}><span>{icon}</span>{name}</button>)}
      <div className="sidebar-bottom"><button className="nav-item"><span>⚙</span>Settings</button><button className="nav-item logout" onClick={onLogout}><span>↪</span>Sign out</button></div>
    </aside>
    <main className="dash-main">
      <header className="dash-header"><div><div className="eyebrow">{active === 'Overview' ? 'LIVE LOCAL DATA' : 'MODULE'}</div><h1>{active === 'Overview' ? 'Good morning, Admin' : active}</h1><p>{active === 'Overview' ? (businessName || 'Your business') + ' · Dashboard refreshes every 10 seconds' : 'This section is prepared for the next development phase.'}</p></div><div className="user-pill"><span className="avatar">{username?.[0]?.toUpperCase() || 'A'}</span><div><b>{username || 'Admin'}</b><small>Administrator</small></div></div></header>
      {active === 'Products' ? <Products currency={currency} /> : active === 'Stock' ? <Stock currency={currency} /> : active === 'Overview' ? <>
        {summaryError && <div className="form-error">{summaryError}</div>}
        <section className="stat-grid">
          <Stat label="Total Products" value={money(summary.totalProducts)} note="Saved in your local database" icon="▦"/>
          <Stat label="Stock Value" value={currency + ' ' + money(summary.stockValue)} note="Current quantity × buying price" icon="◈"/>
          <Stat label="Potential Stock Margin" value={currency + ' ' + money(summary.potentialMargin)} note="If current stock sells at listed prices" icon="↗"/>
          <Stat label="Low Stock Items" value={money(summary.lowStockCount)} note="At or below each product's threshold" icon="!"/>
        </section>
        <section className="dash-grid overview-grid">
          <div className="panel large-panel">
            <div className="panel-head"><div><h2>Inventory by category</h2><p>Based on products currently saved in StockDesk</p></div><span className="period">Live data</span></div>
            {summary.categories.length ? <div className="category-chart">{summary.categories.map(item=><div className="category-row" key={item.name}><div className="category-label"><span>{item.name}</span><b>{item.products} product{Number(item.products)===1?'':'s'}</b></div><div className="category-track"><div className="category-fill" style={{width: (Number(item.products || 0) / maxCategoryProducts * 100) + '%'}} /></div><small>{money(item.units)} units</small></div>)}</div> : <div className="overview-empty"><div>▦</div><h3>No inventory data yet</h3><p>Add products to see your inventory summary here.</p><button className="btn primary" onClick={()=>setActive('Products')}>Add products</button></div>}
          </div>
          <div className="panel">
            <div className="panel-head"><div><h2>Low stock alerts</h2><p>Products that need attention</p></div><span className="alert-count">{summary.lowStockCount}</span></div>
            {summary.lowStockProducts.length ? <div className="overview-list">{summary.lowStockProducts.map(product=><div className="overview-list-item" key={product.id}><div><b>{product.name}</b><small>{product.category || 'Uncategorized'}</small></div><span className="stock-badge low">{money(product.stock_quantity)} left</span></div>)}</div> : <div className="overview-empty compact"><div>✓</div><h3>No low-stock alerts</h3><p>All saved products are above their thresholds.</p></div>}
            <button className="overview-link" onClick={()=>setActive('Products')}>Manage products <span>→</span></button>
          </div>
        </section>
        <section className="panel recent-panel">
          <div className="panel-head"><div><h2>Recently updated products</h2><p>Latest inventory records from your local database</p></div><button className="overview-link" onClick={()=>setActive('Products')}>View products →</button></div>
          {summary.recentProducts.length ? <div className="recent-product-list">{summary.recentProducts.map(product=><div className="recent-product-row" key={product.id}><div className="recent-product-icon">▦</div><div className="recent-product-name"><b>{product.name}</b><small>{product.category || 'Uncategorized'}</small></div><div className="recent-product-stock"><b>{money(product.stock_quantity)}</b><small>units in stock</small></div><span className={Number(product.stock_quantity) <= 0 ? 'stock-badge low' : 'stock-badge ok'}>{Number(product.stock_quantity) <= 0 ? 'Out of stock' : 'Recorded'}</span></div>)}</div> : <div className="recent-empty">Product activity will appear here after you add products.</div>}
        </section>
        <p className="dashboard-data-note">Sales, purchases, and realized profit will appear here after those transaction modules are implemented. This dashboard currently reports saved inventory data only.</p>
      </> : <div className="panel section-placeholder"><div className="placeholder-icon">⌁</div><h2>{active}</h2><p>The navigation section is in place. Its database tables and features will be implemented separately.</p></div>}
    </main>
  </div>;
}

function Stat({label,value,note,icon}) { return <div className="stat"><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>; }

export default function App() {
  const [screen, setScreen] = useState('home');
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    if (window.inventoryAPI) window.inventoryAPI.authStatus().catch(() => null);
  }, []);

  const showAuth = (mode) => { setAuthMode(mode); setScreen('auth'); };
  const success = (name, business) => { setUsername(name); setBusinessName(business || ''); setScreen('dashboard'); };

  if (screen === 'dashboard') return <Dashboard username={username} businessName={businessName} onLogout={()=>{setUsername('');setBusinessName('');setScreen('home');}} />;
  if (screen === 'auth') return <Auth mode={authMode} setMode={(m)=>m==='home'?setScreen('home'):setAuthMode(m)} onSuccess={success} />;
  return <Home onLogin={()=>showAuth('login')} onCreate={()=>showAuth('create')} />;
}
