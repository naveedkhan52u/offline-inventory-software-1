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
  ['Overview','⌂'], ['Products','▦'], ['Stock','↕'], ['Purchases','＋'], ['Sales','₨'], ['Billing','▣'],
  ['Profit & Loss','◒'], ['Staff','♙'], ['Dashboard Analytics','◫'], ['Reports','▤'],
  ['Backup & Restore','↥'], ['Barcode/QR','▥'], ['Installation','⌘'], ['Settings','⚙']
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

function Billing({ currency = 'PKR', businessName = '' }) {
  const [products, setProducts] = useState([]);
  const [businessInfo, setBusinessInfo] = useState({});
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [overallDiscount, setOverallDiscount] = useState('0');
  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0,10));
  const [printAfterSave, setPrintAfterSave] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [lastBill, setLastBill] = useState(null);
  const money = value => new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(Number(value||0));
  const loadProducts = async () => { const r = await window.inventoryAPI.listProducts(); if (r?.ok) setProducts(r.products||[]); else setError(r?.error||'Unable to load products.'); };
  const loadBills = async () => { const r = await window.inventoryAPI.listSales({}); if (r?.ok) setBills((r.sales||[]).filter(x=>String(x.notes||'').includes('Generated from Billing section'))); };
  useEffect(() => { loadProducts(); loadBills(); window.inventoryAPI.getBusinessSettings().then(r => { if (r?.ok) setBusinessInfo(r.business || {}); }).catch(() => {}); }, []);
  const filtered = products.filter(p => String(p.name||'').toLowerCase().includes(search.trim().toLowerCase()) || String(p.sku||'').toLowerCase().includes(search.trim().toLowerCase()) || String(p.barcode||'').toLowerCase().includes(search.trim().toLowerCase()));
  const addProduct = product => { setError(''); setMessage(''); setItems(current => { const found=current.find(x=>Number(x.productId)===Number(product.id)); if(found) return current.map(x=>Number(x.productId)===Number(product.id)?{...x,quantity:String(Number(x.quantity||0)+1)}:x); return [...current,{productId:product.id,name:product.name,quantity:'1',unitPrice:String(product.selling_price??0),discount:'0',available:Number(product.stock_quantity||0)}]; }); setSearch(''); };
  const updateItem = (id,key,value) => setItems(current=>current.map(x=>Number(x.productId)===Number(id)?{...x,[key]:value}:x));
  const removeItem = id => setItems(current=>current.filter(x=>Number(x.productId)!==Number(id)));
  const moneyRound = value => Math.round((Number(value||0)+Number.EPSILON)*100)/100;
  const subtotal = moneyRound(items.reduce((sum,x)=>sum+Math.max(0,Number(x.quantity)||0)*Math.max(0,Number(x.unitPrice)||0),0));
  const itemDiscountTotal = moneyRound(items.reduce((sum,x)=>sum+Math.max(0,Number(x.discount)||0),0));
  const globalDiscount = Math.max(0,Number(overallDiscount)||0);
  const total = moneyRound(subtotal-itemDiscountTotal-globalDiscount);
  const lineAmount = item => moneyRound(Math.max(0,Number(item.quantity)||0)*Math.max(0,Number(item.unitPrice)||0)-Math.max(0,Number(item.discount)||0));
  const buildReceipt = sale => {
    const esc = value => String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(sale.saleNumber)}</title><style>@page{size:80mm auto;margin:4mm}*{box-sizing:border-box}body{font:12px Arial,sans-serif;color:#111;width:100%;margin:0}h1{font-size:18px;text-align:center;margin:0 0 5px;overflow-wrap:anywhere}p{margin:4px 0}hr{border:0;border-top:1px dashed #777;margin:9px 0}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:5px 1px;border-bottom:1px dotted #bbb;vertical-align:top;font-size:11px}th:last-child,td:last-child{text-align:right}.total{font-size:16px;font-weight:bold;text-align:right;margin-top:10px}.center{text-align:center}.small{font-size:10px}</style></head><body><h1>${esc(businessInfo.business_name||businessName||'Shop')}</h1><p class="center">${esc(businessInfo.address||'')}</p><p class="center">${esc(businessInfo.phone||'')}</p><p class="center">${esc(businessInfo.email||'')}</p><p class="center">${esc(businessInfo.tax_number||'')}</p><p class="center">Bill: ${esc(sale.saleNumber)}</p><p>Date: ${esc(sale.saleDate||billDate)}</p><hr><table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Discount</th><th>Amount</th></tr></thead><tbody>${sale.items.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.quantity)}</td><td>${esc(money(x.unitPrice))}</td><td>${esc(money(x.discount||0))}</td><td>${esc(money(x.lineTotal??(Number(x.quantity)*Number(x.unitPrice)-Number(x.discount||0))))}</td></tr>`).join('')}</tbody></table><hr><p>Subtotal: ${esc(currency)} ${esc(money(sale.subtotal??sale.items.reduce((sum,x)=>sum+Number(x.quantity)*Number(x.unitPrice),0)))}</p><p>Product discounts: -${esc(currency)} ${esc(money(sale.itemDiscountTotal??sale.items.reduce((sum,x)=>sum+Number(x.discount||0),0)))}</p><p>Overall discount: -${esc(currency)} ${esc(money(sale.overallDiscount||0))}</p><div class="total">Total: ${esc(currency)} ${esc(money(sale.total))}</div><hr><p class="center small">${esc(businessInfo.receipt_footer||'Thank you for shopping with us.')}</p></body></html>`;
  };
  const saveBill = async event => {
    event.preventDefault(); setError(''); setMessage('');
    if(!items.length) return setError('Add at least one product to the bill.');
    if(items.some(x=>!Number.isInteger(Number(x.quantity))||Number(x.quantity)<1||!Number.isFinite(Number(x.unitPrice))||Number(x.unitPrice)<0||!Number.isFinite(Number(x.discount||0))||Number(x.discount||0)<0)) return setError('Enter a valid quantity, price, and product discount for every product.');
    if(items.some(x=>Number(x.discount||0)>Number(x.quantity)*Number(x.unitPrice))) return setError('A product discount cannot exceed that product line amount.');
    if(!Number.isFinite(Number(overallDiscount))||Number(overallDiscount)<0) return setError('Enter a valid overall discount.');
    if(itemDiscountTotal+globalDiscount>subtotal) return setError('Total discounts cannot exceed the bill subtotal.');
    for(const x of items){const current=products.find(p=>Number(p.id)===Number(x.productId));if(!current)return setError('A selected product no longer exists.');if(Number(x.quantity)>Number(current.stock_quantity||0))return setError('Not enough stock for '+x.name+'. Available: '+Number(current.stock_quantity||0)+'.');}
    setBusy(true);
    try{
      const result=await window.inventoryAPI.createSale({customerName:'Walk-in customer',customerPhone:'',saleDate:billDate,discount:globalDiscount,paidAmount:Math.round((total+Number.EPSILON)*100)/100,paymentMethod:'Cash',notes:'Generated from Billing section',items:items.map(x=>({productId:Number(x.productId),quantity:Number(x.quantity),unitPrice:Number(x.unitPrice),discount:Number(x.discount||0)}))});
      if(!result?.ok){setError(result?.error||'Unable to save bill.');return;}
      const netLines=items.map(x=>({...x,lineTotal:lineAmount(x)}));
      const netBeforeOverall=moneyRound(netLines.reduce((sum,x)=>sum+x.lineTotal,0));
      let allocatedOverall=0;
      netLines.forEach((x,index)=>{const share=index===netLines.length-1?moneyRound(globalDiscount-allocatedOverall):netBeforeOverall>0?moneyRound(globalDiscount*x.lineTotal/netBeforeOverall):0;x.overallDiscountShare=share;x.lineTotal=moneyRound(x.lineTotal-share);allocatedOverall=moneyRound(allocatedOverall+share);});
      const saved={saleNumber:result.saleNumber,saleDate:billDate,items:netLines,subtotal,itemDiscountTotal,overallDiscount:globalDiscount,total};
      setLastBill(saved);setMessage('Bill '+result.saleNumber+' saved. Inventory, sales, analytics and reports have been updated.');setItems([]);setOverallDiscount('0');await Promise.all([loadProducts(),loadBills()]);
      if(printAfterSave){const printed=await window.inventoryAPI.printBill({html:buildReceipt(saved)});if(!printed?.ok)setError('Bill saved, but automatic printing failed: '+(printed?.error||'Check the printer and try Print last bill.'));else setMessage('Bill '+result.saleNumber+' saved and sent to the default printer.');}
    }catch(e){setError('The bill could not be saved or printed.');}
    finally{setBusy(false);}
  };
  return <div className="billing-page">
    <div className="sales-toolbar"><div><h2>Create bill</h2><p>Admin-only billing. Saved bills also become sales and reduce stock automatically.</p></div><label className="billing-print-toggle"><input type="checkbox" checked={printAfterSave} onChange={e=>setPrintAfterSave(e.target.checked)}/> Print automatically after saving</label></div>
    {message&&<div className="product-message">{message}</div>}{error&&<div className="form-error product-error">{error}</div>}
    <form onSubmit={saveBill}>
      <section className="panel billing-paper">
        <header className="billing-shop-header"><div><div className="eyebrow">OFFICIAL BILL</div><h2>{businessInfo.business_name||businessName||'Your Shop'}</h2><p>{[businessInfo.address,businessInfo.phone,businessInfo.email].filter(Boolean).join(' · ')||'Billing and sales receipt'}</p></div><label>Bill date<input type="date" required value={billDate} onChange={e=>setBillDate(e.target.value)}/></label></header>
        <div className="billing-product-picker"><label className="billing-search-label">Find products<input autoComplete="off" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();const q=search.trim().toLowerCase();const exact=filtered.find(p=>[p.name,p.sku,p.barcode].some(v=>String(v||'').trim().toLowerCase()===q));if(exact)addProduct(exact);else if(filtered.length===1)addProduct(filtered[0]);}}} placeholder="Type product name, SKU or barcode, then press Enter"/></label>
          {search.trim()&&<div className="billing-search-results">{filtered.length?filtered.map(p=><button type="button" key={p.id} onClick={()=>addProduct(p)}><span>{p.name}</span><small>{currency} {money(p.selling_price)} · Stock {p.stock_quantity}</small></button>):<div className="billing-no-results">No matching products found.</div>}</div>}
        </div>
        <div className="billing-lines-heading"><h3>Bill items</h3><span>{items.length} product lines</span></div>
        <div className="table-wrap"><table className="product-table billing-items-table"><thead><tr><th>Product name</th><th>Quantity</th><th>Price per unit</th><th>Product discount</th><th>Amount</th><th></th></tr></thead><tbody>{items.map(item=><tr key={item.productId}><td><strong>{item.name}</strong><small className="purchase-subline">Available stock: {products.find(p=>Number(p.id)===Number(item.productId))?.stock_quantity??item.available}</small></td><td><input aria-label={'Quantity for '+item.name} className="billing-qty-input" type="number" min="1" step="1" required value={item.quantity} onChange={e=>updateItem(item.productId,'quantity',e.target.value)}/></td><td><input aria-label={'Price for '+item.name} className="billing-price-input" type="number" min="0" step="0.01" required value={item.unitPrice} onChange={e=>updateItem(item.productId,'unitPrice',e.target.value)}/></td><td><input aria-label={'Discount for '+item.name} className="billing-discount-input" type="number" min="0" max={Math.max(0,Number(item.quantity||0)*Number(item.unitPrice||0))} step="0.01" value={item.discount||'0'} onChange={e=>updateItem(item.productId,'discount',e.target.value)}/></td><td><strong>{currency} {money(lineAmount(item))}</strong></td><td><button type="button" className="purchase-remove-line" onClick={()=>removeItem(item.productId)} title="Remove product">×</button></td></tr>)}</tbody></table></div>
        {!items.length&&<div className="billing-empty"><span>▣</span><h3>Your bill is empty</h3><p>Search for a product above and select it to add it to this bill.</p></div>}
        <div className="billing-discount-summary"><div><span>Subtotal</span><strong>{currency} {money(subtotal)}</strong></div><div><span>Product discounts</span><strong>− {currency} {money(itemDiscountTotal)}</strong></div><label>Overall discount <small>Applies to the bill total, not individual products</small><input type="number" min="0" max={Math.max(0,subtotal-itemDiscountTotal)} step="0.01" value={overallDiscount} onChange={e=>setOverallDiscount(e.target.value)} /></label><div className="billing-discount-total"><span>Final total</span><strong>{currency} {money(total)}</strong></div></div><footer className="billing-footer"><div className="billing-total"><span>Total amount</span><strong>{currency} {money(total)}</strong></div><button type="submit" className="btn primary billing-save-button" disabled={busy||!items.length}>{busy?'Saving bill…':'Save bill'+(printAfterSave?' & Print':'')}</button></footer>
      </section>
    </form>
    <section className="panel billing-history-panel"><div className="panel-head"><div><h2>Billing history</h2><p>{bills.length} saved bill{bills.length===1?'':'s'} · most recent first</p></div><button type="button" className="btn ghost" onClick={loadBills}>Refresh</button></div>{bills.length?<div className="table-wrap"><table className="product-table billing-items-table"><thead><tr><th>Bill number</th><th>Date</th><th>Products</th><th>Quantities</th><th>Total amount</th><th>Receipt</th></tr></thead><tbody>{bills.map(b=> <tr key={b.id}><td><strong>{b.sale_number}</strong></td><td>{b.sale_date}</td><td>{b.items.map(x=>x.product_name).join(', ')}</td><td>{b.items.reduce((sum,x)=>sum+Number(x.quantity||0),0)}</td><td><strong>{currency} {money(b.total)}</strong></td><td><button type="button" className="purchase-detail-button" onClick={()=>{const saved={saleNumber:b.sale_number,saleDate:b.sale_date,total:Number(b.total||0),subtotal:Number(b.subtotal||0),itemDiscountTotal:b.items.reduce((sum,x)=>sum+Number(x.discount||0),0),overallDiscount:Number(b.bill_discount||0),items:b.items.map(x=>({name:x.product_name,quantity:x.quantity,unitPrice:x.unit_price,discount:Number(x.discount||0),lineTotal:Number(x.line_total||0)}))};setLastBill(saved);setError('');setMessage('Selected '+b.sale_number+' for receipt printing.');}}>View / reprint</button></td></tr>)}</tbody></table></div>:<div className="billing-empty"><span>▣</span><h3>No bills saved yet</h3><p>Your saved billing transactions will appear here.</p></div>}</section>
    {lastBill&&<section className="panel billing-last-bill"><div><h3>Last saved bill</h3><p>{lastBill.saleNumber} · {lastBill.saleDate} · {currency} {money(lastBill.total)}</p></div><button type="button" className="btn ghost" onClick={async()=>{const r=await window.inventoryAPI.printBill({html:buildReceipt(lastBill)});if(!r?.ok)setError(r?.error||'Unable to print bill.');else setMessage('Bill sent to the default printer.');}}>Print last bill</button></section>}
    <p className="sales-footnote">Bills are saved as completed cash sales so the product quantities, Sales, Overview, Dashboard Analytics, Profit & Loss, and Reports stay consistent. Check stock before saving; all billing transactions are stored locally.</p>
  </div>;
}

function Sales({ currency = 'PKR' }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', saleDate: new Date().toISOString().slice(0, 10),
    discount: '0', paidAmount: '0', paymentMethod: 'Cash', notes: '',
    items: [{ productId: '', quantity: '1', unitPrice: '' }]
  });

  const load = async () => {
    try {
      const [productResult, salesResult] = await Promise.all([
        window.inventoryAPI.listProducts(),
        window.inventoryAPI.listSales({ status: statusFilter, from: fromDate, to: toDate, search })
      ]);
      if (productResult?.ok) setProducts(productResult.products || []);
      else setError(productResult?.error || 'Unable to load products.');
      if (salesResult?.ok) setSales(salesResult.sales || []);
      else setError(salesResult?.error || 'Unable to load sales.');
    } catch (e) { setError('Sales data could not be loaded from the local database.'); }
  };

  useEffect(() => { load(); }, [statusFilter, fromDate, toDate, search]);

  const money = value => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(value || 0));
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const collected = sales.reduce((sum, sale) => sum + Number(sale.paid_amount || 0), 0);
  const outstanding = sales.reduce((sum, sale) => sum + Math.max(0, Number(sale.total || 0) - Number(sale.paid_amount || 0)), 0);
  const estimatedProfit = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + Number(item.line_profit || 0), 0) - Number(sale.discount || 0), 0);
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateItem = (index, key, value) => setForm(prev => ({ ...prev, items: prev.items.map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  const addLine = () => setForm(prev => ({ ...prev, items: [...prev.items, { productId: '', quantity: '1', unitPrice: '' }] }));
  const removeLine = index => setForm(prev => ({ ...prev, items: prev.items.length === 1 ? prev.items : prev.items.filter((_, i) => i !== index) }));
  const lineTotal = item => Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unitPrice) || 0);
  const subtotal = form.items.reduce((sum, item) => sum + lineTotal(item), 0);
  const discount = Math.max(0, Number(form.discount) || 0);
  const total = Math.max(0, subtotal - discount);

  const chooseProduct = (index, productId) => {
    const product = products.find(p => String(p.id) === String(productId));
    setForm(prev => ({ ...prev, items: prev.items.map((item, i) => i === index ? { ...item, productId, unitPrice: product ? String(product.selling_price ?? 0) : '' } : item) }));
  };

  const resetForm = () => setForm({
    customerName: '', customerPhone: '', saleDate: new Date().toISOString().slice(0, 10),
    discount: '0', paidAmount: '0', paymentMethod: 'Cash', notes: '',
    items: [{ productId: '', quantity: '1', unitPrice: '' }]
  });

  const submit = async event => {
    event.preventDefault(); setError(''); setMessage('');
    if (form.items.some(item => !item.productId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || !Number.isFinite(Number(item.unitPrice)) || Number(item.unitPrice) < 0)) return setError('Choose a product and enter a valid whole-number quantity and selling price for every line.');
    if (discount > subtotal) return setError('Discount cannot exceed the sale subtotal.');
    const paidAmount = Number(form.paidAmount);
    if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > total + 0.005) return setError('Amount paid must be between zero and the final sale total.');
    setBusy(true);
    try {
      const result = await window.inventoryAPI.createSale({
        customerName: form.customerName, customerPhone: form.customerPhone, saleDate: form.saleDate,
        discount, paidAmount, paymentMethod: form.paymentMethod, notes: form.notes,
        items: form.items.map(item => ({ productId: Number(item.productId), quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) }))
      });
      if (!result?.ok) setError(result?.error || 'Unable to save sale.');
      else {
        setMessage('Sale ' + result.saleNumber + ' saved. Stock quantities have been updated.');
        setShowForm(false); resetForm(); await load();
      }
    } catch (e) { setError('The local database could not save this sale.'); }
    finally { setBusy(false); }
  };

  return <div className="sales-page">
    <section className="sales-summary">
      <div><span>Sales total</span><strong>{currency} {money(totalSales)}</strong><small>Matching records after discounts</small></div>
      <div><span>Payments collected</span><strong>{currency} {money(collected)}</strong><small>Recorded payments received</small></div>
      <div><span>Customer balances</span><strong>{currency} {money(outstanding)}</strong><small>Outstanding on listed sales</small></div>
      <div><span>Estimated gross profit</span><strong>{currency} {money(estimatedProfit)}</strong><small>Uses saved buying costs, less discounts</small></div>
    </section>
    <div className="sales-toolbar">
      <div><h2>Sales</h2><p>Create sales, reduce stock automatically, and track payments and profit.</p></div>
      <button className="btn primary" onClick={() => { setShowForm(value => !value); setError(''); setMessage(''); }}>＋ New sale</button>
    </div>
    {message && <div className="product-message">{message}</div>}
    {error && <div className="form-error product-error">{error}</div>}
    {showForm && <form className="panel sales-form" onSubmit={submit}>
      <div className="panel-head"><div><h2>Record a sale</h2><p>Products are deducted from inventory only when the sale is saved.</p></div><button type="button" className="icon-close" onClick={() => setShowForm(false)}>×</button></div>
      <div className="sales-header-fields">
        <label>Customer name<input value={form.customerName} onChange={e=>update('customerName',e.target.value)} placeholder="Walk-in customer if blank" maxLength="160" /></label>
        <label>Customer phone<input value={form.customerPhone} onChange={e=>update('customerPhone',e.target.value)} placeholder="Optional phone number" maxLength="50" /></label>
        <label>Sale date *<input type="date" required value={form.saleDate} onChange={e=>update('saleDate',e.target.value)} /></label>
        <label>Payment method<select value={form.paymentMethod} onChange={e=>update('paymentMethod',e.target.value)}>{['Cash','Card','Bank transfer','Mobile wallet','Other'].map(method=><option key={method}>{method}</option>)}</select></label>
      </div>
      <div className="sales-lines-heading"><div><h3>Items sold</h3><p>Available stock is shown beside each product.</p></div><button type="button" className="btn ghost" onClick={addLine} disabled={!products.length}>＋ Add item</button></div>
      {!products.length && <div className="purchase-notice">Add products in the Products section before recording a sale.</div>}
      <div className="sales-lines">
        {form.items.map((item,index)=>{
          const product=products.find(p=>String(p.id)===String(item.productId));
          const available=Number(product?.stock_quantity||0);
          return <div className="sales-line" key={index}>
            <label>Product *<select required value={item.productId} onChange={e=>chooseProduct(index,e.target.value)}><option value="">Select product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} · available {p.stock_quantity}</option>)}</select>{product&&<small className={available<=Number(product.low_stock_threshold||0)?'sales-stock-warning':''}>{available} units available</small>}</label>
            <label>Quantity *<input type="number" min="1" step="1" required value={item.quantity} onChange={e=>updateItem(index,'quantity',e.target.value)} /></label>
            <label>Unit price *<input type="number" min="0" step="0.01" required value={item.unitPrice} onChange={e=>updateItem(index,'unitPrice',e.target.value)} /></label>
            <div className="sales-line-total"><span>Line total</span><strong>{currency} {money(lineTotal(item))}</strong></div>
            <button type="button" className="purchase-remove-line" disabled={form.items.length===1} onClick={()=>removeLine(index)} title="Remove item">×</button>
          </div>;
        })}
      </div>
      <div className="sales-bottom-fields">
        <label>Discount amount<input type="number" min="0" max={subtotal} step="0.01" value={form.discount} onChange={e=>update('discount',e.target.value)} /><small>Deducted from the subtotal.</small></label>
        <label>Amount paid now *<input type="number" required min="0" max={total} step="0.01" value={form.paidAmount} onChange={e=>update('paidAmount',e.target.value)} /><small>Enter 0 for an unpaid sale.</small></label>
        <label>Notes (optional)<textarea rows="3" value={form.notes} onChange={e=>update('notes',e.target.value)} placeholder="Order reference or delivery notes" maxLength="1000" /></label>
        <div className="sales-totals"><div><span>Subtotal</span><strong>{currency} {money(subtotal)}</strong></div><div><span>Discount</span><strong>− {currency} {money(discount)}</strong></div><div><span>Sale total</span><strong>{currency} {money(total)}</strong></div><div><span>Balance due</span><strong>{currency} {money(Math.max(0,total-(Number(form.paidAmount)||0)))}</strong></div></div>
      </div>
      <div className="product-form-actions"><button type="button" className="btn ghost" onClick={()=>{setShowForm(false);setError('');}}>Cancel</button><button className="btn primary" disabled={busy||!products.length}>{busy?'Saving…':'Save sale & update stock'}</button></div>
    </form>}
    <section className="panel sales-table-panel">
      <div className="panel-head"><div><h2>Sales history</h2><p>Latest 1,000 records · {sales.length} shown</p></div></div>
      <div className="sales-filters">
        <div className="product-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search sale no., customer, phone..." /></div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option><option>Paid</option><option>Partial</option><option>Unpaid</option></select>
        <label>From<input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} /></label>
        <label>To<input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} /></label>
      </div>
      {sales.length ? <div className="table-wrap"><table className="product-table sales-table"><thead><tr><th>Sale no.</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Paid</th><th>Balance due</th><th>Payment</th><th>Status</th><th>Details</th></tr></thead><tbody>
        {sales.map(sale=><React.Fragment key={sale.id}><tr><td><strong>{sale.sale_number}</strong></td><td>{sale.sale_date}</td><td><strong>{sale.customer_name}</strong><small className="purchase-subline">{sale.customer_phone||''}</small></td><td>{sale.items.reduce((sum,item)=>sum+Number(item.quantity||0),0)} units / {sale.items.length} lines</td><td>{currency} {money(sale.total)}</td><td>{currency} {money(sale.paid_amount)}</td><td>{currency} {money(Math.max(0,Number(sale.total)-Number(sale.paid_amount)))}</td><td>{sale.payment_method}</td><td><span className={'stock-badge '+(sale.payment_status==='Paid'?'ok':sale.payment_status==='Partial'?'partial':'low')}>{sale.payment_status}</span></td><td><button className="purchase-detail-button" onClick={()=>setSales(current=>current.map(s=>s.id===sale.id?{...s,detailsOpen:!s.detailsOpen}:s))}>{sale.detailsOpen?'Hide':'View receipt'}</button></td></tr>
          {sale.detailsOpen&&<tr className="purchase-detail-row"><td colSpan="10"><div className="sales-receipt">
            <div className="sales-receipt-head"><div><h3>StockDesk · Sales receipt</h3><p>{sale.sale_number} · {sale.sale_date}</p></div><button className="btn ghost" onClick={()=>window.print()}>Print receipt</button></div>
            <div className="sales-receipt-meta"><span><b>Customer:</b> {sale.customer_name}</span>{sale.customer_phone&&<span><b>Phone:</b> {sale.customer_phone}</span>}<span><b>Payment:</b> {sale.payment_method} · {sale.payment_status}</span>{sale.notes&&<span><b>Notes:</b> {sale.notes}</span>}</div>
            <table><thead><tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr></thead><tbody>{sale.items.map(item=><tr key={item.id}><td>{item.product_name}</td><td>{item.quantity}</td><td>{currency} {money(item.unit_price)}</td><td>{currency} {money(item.line_total)}</td></tr>)}</tbody></table>
            <div className="sales-receipt-totals"><span>Subtotal: {currency} {money(sale.subtotal)}</span><span>Discount: {currency} {money(sale.discount)}</span><b>Total: {currency} {money(sale.total)}</b><span>Paid: {currency} {money(sale.paid_amount)}</span><span>Balance due: {currency} {money(Math.max(0,Number(sale.total)-Number(sale.paid_amount)))}</span></div>
          </div></td></tr>}
        </React.Fragment>)}
      </tbody></table></div> : <div className="products-empty"><div>₨</div><h3>No sales records found</h3><p>{products.length?'Record your first sale to update stock and track revenue.':'Add products first, then record a sale.'}</p><button className="btn primary" onClick={()=>setShowForm(true)} disabled={!products.length}>New sale</button></div>}
    </section>
    <p className="sales-footnote">Sales reduce stock and create stock movement records in the same transaction. Item costs are saved at sale time for profit reporting. Existing sales cannot yet be edited, deleted, or settled with later payments.</p>
  </div>;
}

function DashboardAnalytics({ currency = 'PKR' }) {
  const [period,setPeriod]=useState('30d'),[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[updated,setUpdated]=useState('');
  const money=v=>new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(Number(v||0));
  const load=async()=>{try{const r=await window.inventoryAPI.getAnalyticsOverview({period});if(r?.ok){setData(r);setError('');setUpdated(new Date().toLocaleTimeString());}else setError(r?.error||'Analytics unavailable.');}catch(e){setError('Could not load analytics from the local database.');}finally{setLoading(false);}};
  useEffect(()=>{setLoading(true);load();const id=setInterval(load,15000);return()=>clearInterval(id);},[period]);
  const d=data||{},curr=d.currency||currency,series=d.series||[],maxRevenue=Math.max(1,...series.map(x=>Number(x.revenue||0))),maxCost=Math.max(1,...series.map(x=>Number(x.cogs||0)+Number(x.expenses||0)+Number(x.salaries||0)));
  const card=(label,value,note,icon)=> <div className="analytics-kpi" key={label}><span className="analytics-kpi-icon">{icon}</span><small>{label}</small><strong>{value}</strong><p>{note}</p></div>;
  return <div className="analytics-page">
    <div className="finance-toolbar"><div><h2>Dashboard Analytics</h2><p>Business performance calculated from your local SQLite transactions.</p></div><div className="analytics-toolbar-right"><select value={period} onChange={e=>setPeriod(e.target.value)}><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="12m">Last 12 months</option></select><button className="btn ghost" onClick={load}>↻ Refresh</button></div></div>
    <div className="analytics-status"><span className="analytics-live-dot"></span>{loading?'Loading local records…':'Live local data'}{updated&&<span>Last updated {updated} · refreshes every 15 seconds</span>}</div>
    {error&&<div className="form-error product-error">{error}</div>}
    <section className="analytics-kpi-grid">
      {card('Sales revenue',curr+' '+money(d.sales?.revenue),'Total completed sales value','₨')}
      {card('Cash collected',curr+' '+money(d.sales?.collected),'Payments received against sales','↓')}
      {card('Outstanding customer dues',curr+' '+money(d.sales?.outstanding),'Sales still unpaid or partly paid','◷')}
      {card('Gross profit',curr+' '+money(d.grossProfit),'Revenue less cost of sold goods','↗')}
      {card('Estimated net profit',curr+' '+money(d.netProfit),'After recorded expenses and salary payments','◒')}
      {card('Purchases',curr+' '+money(d.purchases?.total),'Supplier purchases recorded in period','＋')}
      {card('Inventory at cost',curr+' '+money(d.inventory?.stock_cost),'Current stock × buying price','▦')}
      {card('Inventory retail value',curr+' '+money(d.inventory?.stock_retail),'Potential sales value of current stock','◈')}
    </section>
    <section className="analytics-chart-grid">
      <div className="panel analytics-panel"><div className="panel-head"><div><h2>Revenue trend</h2><p>{period==='12m'?'Monthly sales revenue':'Daily sales revenue'}</p></div><span className="period">{series.length} periods</span></div>
        {series.some(x=>Number(x.revenue)>0)?<div className="analytics-bars">{series.map(x=><div className="analytics-bar-column" key={x.label} title={x.label+': '+curr+' '+money(x.revenue)}><div className="analytics-bar-space"><div className="analytics-bar" style={{height:Math.max(Number(x.revenue)>0?3:0,Number(x.revenue)/maxRevenue*100)+'%'}}></div></div><small>{period==='12m'?x.label.slice(2):x.label.slice(5)}</small></div>)}</div>:<div className="analytics-empty">Sales trend will appear after sales are recorded.</div>}
      </div>
      <div className="panel analytics-panel"><div className="panel-head"><div><h2>Cost breakdown</h2><p>Selected reporting period</p></div></div>
        <div className="analytics-breakdown"><div><span><i className="analytics-dot revenue"></i>Cost of goods sold</span><b>{curr} {money(d.costOfGoodsSold)}</b></div><div><span><i className="analytics-dot expense"></i>Business expenses</span><b>{curr} {money(d.expenses)}</b></div><div><span><i className="analytics-dot salary"></i>Salary payments</span><b>{curr} {money(d.salaryExpenses)}</b></div><div><span><i className="analytics-dot inventory"></i>Purchase spend</span><b>{curr} {money(d.purchases?.total)}</b></div></div>
        <div className="analytics-stock-summary"><div><span>Products</span><b>{money(d.inventory?.products)}</b></div><div><span>Units in stock</span><b>{money(d.inventory?.units)}</b></div><div><span>Low stock</span><b>{money(d.inventory?.low_stock)}</b></div><div><span>Out of stock</span><b>{money(d.inventory?.out_of_stock)}</b></div></div>
      </div>
    </section>
    <section className="analytics-chart-grid">
      <div className="panel analytics-panel"><div className="panel-head"><div><h2>Top-selling products</h2><p>Ranked by sales revenue</p></div></div>{d.topProducts?.length?<div className="analytics-ranked-list">{d.topProducts.map((p,i)=><div className="analytics-ranked-row" key={p.name+i}><span className="analytics-rank">{i+1}</span><div className="analytics-ranked-info"><b>{p.name}</b><small>{money(p.units)} units sold</small><div className="analytics-rank-track"><i style={{width:(Number(p.revenue)/Math.max(1,...d.topProducts.map(q=>Number(q.revenue)))*100)+'%'}}/></div></div><strong>{curr} {money(p.revenue)}</strong></div>)}</div>:<div className="analytics-empty">Product rankings will appear after sales are recorded.</div>}</div>
      <div className="panel analytics-panel"><div className="panel-head"><div><h2>Sales by category</h2><p>Sales revenue grouped by product category</p></div></div>{d.categoryMix?.length?<div className="analytics-ranked-list">{d.categoryMix.map((p,i)=><div className="analytics-ranked-row" key={p.name}><span className="analytics-rank">{i+1}</span><div className="analytics-ranked-info"><b>{p.name}</b><small>{money(p.units)} units sold</small><div className="analytics-rank-track"><i style={{width:(Number(p.revenue)/Math.max(1,...d.categoryMix.map(q=>Number(q.revenue)))*100)+'%'}}/></div></div><strong>{curr} {money(p.revenue)}</strong></div>)}</div>:<div className="analytics-empty">Category analysis will appear after sales are recorded.</div>}</div>
    </section>
    <section className="analytics-chart-grid">
      <div className="panel analytics-panel"><div className="panel-head"><div><h2>Recent sales</h2><p>Latest saved sales records</p></div></div>{d.recentSales?.length?<div className="analytics-recent-list">{d.recentSales.map(x=><div key={x.sale_number}><div><b>{x.sale_number}</b><small>{x.customer_name} · {x.sale_date}</small></div><div className="analytics-recent-value"><b>{curr} {money(x.total)}</b><small>{x.payment_status}</small></div></div>)}</div>:<div className="analytics-empty">No sales recorded yet.</div>}</div>
      <div className="panel analytics-panel"><div className="panel-head"><div><h2>Recent purchases</h2><p>Latest saved supplier purchases</p></div></div>{d.recentPurchases?.length?<div className="analytics-recent-list">{d.recentPurchases.map(x=><div key={x.purchase_number}><div><b>{x.purchase_number}</b><small>{x.supplier_name} · {x.purchase_date}</small></div><div className="analytics-recent-value"><b>{curr} {money(x.subtotal)}</b><small>{x.payment_status}</small></div></div>)}</div>:<div className="analytics-empty">No purchases recorded yet.</div>}</div>
    </section>
    <div className="analytics-footnote">Net profit is an operational estimate: sales revenue minus cost of sold goods, recorded operating expenses, and salary payments. Purchase spend and inventory value are shown separately to avoid treating all stock purchases as immediate expenses.</div>
  </div>;
}

function Reports({ currency = 'PKR' }) {
  const today=new Date().toISOString().slice(0,10),month=today.slice(0,7)+'-01';
  const [from,setFrom]=useState(month),[to,setTo]=useState(today),[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[tab,setTab]=useState('Summary');
  const money=v=>new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(Number(v||0));
  const load=async()=>{setLoading(true);setError('');try{const r=await window.inventoryAPI.generateReports({from,to});if(r?.ok)setData(r);else{setData(null);setError(r?.error||'Unable to generate report.');}}catch(e){setError('Report data could not be loaded.');}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const d=data?.summary||{},curr=data?.currency||currency;
  const exportCsv=()=>{if(!data)return;const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const rows=[['StockDesk report',data.from,data.to],[],['Financial summary','Amount'],['Sales revenue',d.revenue],['Sales collected',d.collected],['Customer dues',d.salesDue],['Cost of goods sold',d.costOfGoodsSold],['Gross profit',d.grossProfit],['Purchase total',d.purchaseTotal],['Purchase paid',d.purchasePaid],['Supplier dues',d.purchaseDue],['Operating expenses',d.expenseTotal],['Salary payments',d.salaryTotal],['Estimated net profit',d.netProfit],[],['Sales','Sale number','Date','Customer','Subtotal','Discount','Total','Paid','Due','Method','Status'],...data.sales.map(x=>['',x.sale_number,x.sale_date,x.customer_name,x.subtotal,x.discount,x.total,x.paid_amount,x.due,x.payment_method,x.payment_status]),[],['Purchases','Purchase number','Date','Supplier','Invoice','Total','Paid','Due','Status'],...data.purchases.map(x=>['',x.purchase_number,x.purchase_date,x.supplier_name,x.invoice_number,x.subtotal,x.paid_amount,x.due,x.payment_status]),[],['Expenses','Date','Category','Description','Amount','Method','Notes'],...data.expenses.map(x=>['',x.expense_date,x.category,x.description,x.amount,x.payment_method,x.notes]),[],['Salary payments','Date','Staff','Salary period','Payment type','Amount','Method','Notes'],...data.salaries.map(x=>['',x.payment_date,x.staff_name,x.period_label,x.payment_type||'Salary',x.amount,x.payment_method,x.notes]),[],['Stock movements','Date','Product','Type','Quantity change','Previous stock','New stock','Reason','Notes'],...data.movements.map(x=>[x.created_at,x.product_name,x.movement_type,x.quantity_change,x.previous_quantity,x.new_quantity,x.reason,x.notes])];const blob=new Blob(['\ufeff'+rows.map(row=>row.map(q).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='StockDesk-report-'+data.from+'-to-'+data.to+'.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);};
  const summaryRows=[['Sales revenue',d.revenue],['Cash collected',d.collected],['Customer outstanding balance',d.salesDue],['Cost of goods sold',d.costOfGoodsSold],['Gross profit',d.grossProfit],['Total purchases',d.purchaseTotal],['Supplier payments',d.purchasePaid],['Supplier outstanding balance',d.purchaseDue],['Operating expenses',d.expenseTotal],['Salary payments',d.salaryTotal],['Estimated net profit / loss',d.netProfit]];
  const switchTab=['Summary','Sales','Purchases','Expenses','Salary','Stock movements'];
  return <div className="reports-page">
    <div className="finance-toolbar"><div><h2>Reports</h2><p>Generate date-filtered financial, sales, purchasing, expense, payroll, and inventory activity reports.</p></div><div className="reports-actions"><button className="btn ghost" onClick={()=>window.print()}>Print report</button><button className="btn primary" disabled={!data} onClick={exportCsv}>Export CSV</button></div></div>
    <section className="panel reports-filter"><label>Start date<input type="date" max={to} value={from} onChange={e=>setFrom(e.target.value)}/></label><label>End date<input type="date" min={from} max={today} value={to} onChange={e=>setTo(e.target.value)}/></label><button className="btn primary" onClick={load} disabled={loading}>{loading?'Generating…':'Generate report'}</button><span>All values use {curr}</span></section>
    {error&&<div className="form-error product-error">{error}</div>}
    {data&&<><section className="reports-summary-grid"><div><small>Sales</small><strong>{d.salesCount}</strong><span>{curr} {money(d.revenue)} revenue</span></div><div><small>Purchases</small><strong>{d.purchaseCount}</strong><span>{curr} {money(d.purchaseTotal)} total</span></div><div><small>Gross profit</small><strong>{curr} {money(d.grossProfit)}</strong><span>Revenue less sold-goods cost</span></div><div className={Number(d.netProfit)>=0?'finance-net-positive':'finance-net-negative'}><small>Estimated net profit/loss</small><strong>{curr} {money(d.netProfit)}</strong><span>After tracked expenses and payroll</span></div></section>
    <section className="panel reports-panel"><div className="reports-tabs">{switchTab.map(x=><button key={x} className={tab===x?'reports-tab active':'reports-tab'} onClick={()=>setTab(x)}>{x}</button>)}</div>
      {tab==='Summary'&&<div className="table-wrap"><table className="product-table reports-table"><thead><tr><th>Financial metric</th><th>Amount ({curr})</th></tr></thead><tbody>{summaryRows.map(([label,value])=><tr key={label}><td>{label}</td><td><strong>{money(value)}</strong></td></tr>)}</tbody></table><div className="reports-inventory-strip"><div><small>Current product count</small><b>{money(d.inventory?.product_count)}</b></div><div><small>Units in stock</small><b>{money(d.inventory?.units)}</b></div><div><small>Stock value at cost</small><b>{curr} {money(d.inventory?.stock_cost)}</b></div><div><small>Stock retail value</small><b>{curr} {money(d.inventory?.stock_retail)}</b></div><div><small>Low-stock products</small><b>{money(d.inventory?.low_stock)}</b></div></div></div>}
      {tab==='Sales'&&<div className="table-wrap"><table className="product-table reports-table"><thead><tr><th>Date</th><th>Sale no.</th><th>Customer</th><th>Subtotal</th><th>Discount</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th></tr></thead><tbody>{data.sales.map(x=><tr key={x.id}><td>{x.sale_date}</td><td>{x.sale_number}</td><td>{x.customer_name}</td><td>{money(x.subtotal)}</td><td>{money(x.discount)}</td><td>{money(x.total)}</td><td>{money(x.paid_amount)}</td><td>{money(x.due)}</td><td>{x.payment_status}</td></tr>)}</tbody></table>{!data.sales.length&&<div className="analytics-empty">No sales for this date range.</div>}<h3 className="reports-subheading">Sold product details</h3><div className="table-wrap"><table className="product-table reports-table"><thead><tr><th>Sale</th><th>Product</th><th>Qty</th><th>Unit price</th><th>Unit cost</th><th>Revenue</th><th>Gross profit</th></tr></thead><tbody>{data.saleItems.map((x,i)=><tr key={x.sale_number+'-'+i}><td>{x.sale_number}</td><td>{x.product_name}</td><td>{x.quantity}</td><td>{money(x.unit_price)}</td><td>{money(x.unit_cost)}</td><td>{money(x.line_total)}</td><td>{money(x.line_profit)}</td></tr>)}</tbody></table></div></div>}
      {tab==='Purchases'&&<div className="table-wrap"><table className="product-table reports-table"><thead><tr><th>Date</th><th>Purchase no.</th><th>Supplier</th><th>Invoice</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th></tr></thead><tbody>{data.purchases.map(x=><tr key={x.purchase_number}><td>{x.purchase_date}</td><td>{x.purchase_number}</td><td>{x.supplier_name}</td><td>{x.invoice_number||'—'}</td><td>{money(x.subtotal)}</td><td>{money(x.paid_amount)}</td><td>{money(x.due)}</td><td>{x.payment_status}</td></tr>)}</tbody></table>{!data.purchases.length&&<div className="analytics-empty">No purchases for this date range.</div>}</div>}
      {tab==='Expenses'&&<div className="table-wrap"><table className="product-table reports-table"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Method</th><th>Amount</th><th>Notes</th></tr></thead><tbody>{data.expenses.map((x,i)=><tr key={x.expense_date+'-'+i}><td>{x.expense_date}</td><td>{x.category}</td><td>{x.description}</td><td>{x.payment_method}</td><td>{money(x.amount)}</td><td>{x.notes}</td></tr>)}</tbody></table>{!data.expenses.length&&<div className="analytics-empty">No operating expenses for this date range.</div>}</div>}
      {tab==='Salary'&&<div className="table-wrap"><table className="product-table reports-table"><thead><tr><th>Date</th><th>Staff member</th><th>Salary month</th><th>Payment type</th><th>Method</th><th>Amount</th><th>Notes</th></tr></thead><tbody>{data.salaries.map((x,i)=><tr key={x.payment_date+'-'+i}><td>{x.payment_date}</td><td>{x.staff_name}</td><td>{x.period_label||'—'}</td><td><span className={'stock-badge ' + (x.payment_type === 'Advance' ? 'low' : 'ok')}>{x.payment_type || 'Salary'}</span></td><td>{x.payment_method}</td><td>{money(x.amount)}</td><td>{x.notes}</td></tr>)}</tbody></table>{!data.salaries.length&&<div className="analytics-empty">No salary payments for this date range.</div>}</div>}
      {tab==='Stock movements'&&<div className="table-wrap"><table className="product-table reports-table"><thead><tr><th>Date/time</th><th>Product</th><th>Movement</th><th>Change</th><th>Previous</th><th>New stock</th><th>Reason</th><th>Notes</th></tr></thead><tbody>{data.movements.map((x,i)=><tr key={x.created_at+'-'+i}><td>{x.created_at}</td><td>{x.product_name}</td><td>{x.movement_type}</td><td>{x.quantity_change>0?'+':''}{x.quantity_change}</td><td>{x.previous_quantity}</td><td>{x.new_quantity}</td><td>{x.reason}</td><td>{x.notes}</td></tr>)}</tbody></table>{!data.movements.length&&<div className="analytics-empty">No stock movements for this date range.</div>}</div>}
    </section><p className="analytics-footnote">Reports include transaction records within the selected date range. Current inventory valuation reflects today's stock, not historical stock on the report end date. Net profit is an estimate based on recorded sales, saved item costs, operating expenses, and salary payments.</p></>}
  </div>;
}

function ProfitLoss({ currency = 'PKR' }) {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today.slice(0, 7) + '-01');
  const [to, setTo] = useState(today);
  const [data, setData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ expenseDate: today, category: 'Rent', description: '', amount: '', paymentMethod: 'Cash', notes: '' });
  const money = value => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(value || 0));
  const load = async () => {
    try {
      const [summary, list] = await Promise.all([
        window.inventoryAPI.getProfitLossSummary({ from, to }),
        window.inventoryAPI.listExpenses({ from, to, search })
      ]);
      if (summary?.ok) setData(summary); else setError(summary?.error || 'Unable to calculate report.');
      if (list?.ok) setExpenses(list.expenses || []); else setError(list?.error || 'Unable to load expenses.');
    } catch (e) { setError('Profit and loss data could not be loaded.'); }
  };
  useEffect(() => { load(); }, [from, to, search]);
  const change = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const saveExpense = async event => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const result = await window.inventoryAPI.createExpense(form);
      if (!result?.ok) setError(result?.error || 'Unable to save expense.');
      else { setMessage('Expense saved.'); setShowForm(false); setForm({ expenseDate: today, category: 'Rent', description: '', amount: '', paymentMethod: 'Cash', notes: '' }); await load(); }
    } catch (e) { setError('Unable to save expense.'); }
    finally { setBusy(false); }
  };
  const deleteExpense = async id => {
    if (!window.confirm('Delete this expense record? This cannot be undone.')) return;
    const result = await window.inventoryAPI.deleteExpense(id);
    if (result?.ok) { setMessage('Expense deleted.'); await load(); } else setError(result?.error || 'Unable to delete expense.');
  };
  const d = data || { currency, revenue: 0, costOfGoodsSold: 0, grossProfit: 0, businessExpenses: 0, salaryExpenses: 0, netProfit: 0, salesCount: 0 };
  const curr = d.currency || currency;
  const positive = Number(d.netProfit) >= 0;
  return <div className="finance-page">
    <div className="finance-toolbar"><div><h2>Profit &amp; Loss</h2><p>Live calculations from sales, sold product costs, operating expenses, and salary payments.</p></div><button className="btn ghost" onClick={() => window.print()}>Print report</button></div>
    <section className="finance-filter panel"><label>From date<input type="date" max={to} value={from} onChange={e => setFrom(e.target.value)} /></label><label>To date<input type="date" min={from} max={today} value={to} onChange={e => setTo(e.target.value)} /></label><span>{from} to {to}</span></section>
    {message && <div className="product-message">{message}</div>}{error && <div className="form-error product-error">{error}</div>}
    <section className="finance-stat-grid">
      <div><span>Sales revenue</span><strong>{curr} {money(d.revenue)}</strong><small>{d.salesCount} sales in selected period</small></div>
      <div><span>Cost of goods sold</span><strong>{curr} {money(d.costOfGoodsSold)}</strong><small>Buying cost of sold products</small></div>
      <div><span>Gross profit</span><strong>{curr} {money(d.grossProfit)}</strong><small>Revenue less sold product costs</small></div>
      <div className={positive ? 'finance-net-positive' : 'finance-net-negative'}><span>Net profit / loss</span><strong>{curr} {money(d.netProfit)}</strong><small>{positive ? 'Net profit' : 'Net loss'} for this period</small></div>
    </section>
    <section className="panel finance-breakdown"><div className="panel-head"><div><h2>Profit and loss statement</h2><p>Calculated from local transaction records, not sample figures.</p></div></div>
      <div className="finance-statement"><div><span>Sales revenue (after discounts)</span><b>{curr} {money(d.revenue)}</b></div><div><span>Less: cost of goods sold</span><b>− {curr} {money(d.costOfGoodsSold)}</b></div><div className="finance-subtotal"><span>Gross profit</span><b>{curr} {money(d.grossProfit)}</b></div><div><span>Operating expenses</span><b>− {curr} {money(d.businessExpenses)}</b></div><div><span>Staff salary payments</span><b>− {curr} {money(d.salaryExpenses)}</b></div><div className="finance-total"><span>NET {positive ? 'PROFIT' : 'LOSS'}</span><b>{curr} {money(d.netProfit)}</b></div></div>
      <p className="finance-note">Purchases increase inventory and are not immediately counted as an expense. Product costs are counted when products sell. Salary payments count on their payment dates.</p>
    </section>
    <section className="panel finance-breakdown"><div className="panel-head"><div><h2>Business expenses</h2><p>Track rent, utilities, transport, repairs, and other running costs.</p></div><button className="btn primary" onClick={() => setShowForm(v => !v)}>＋ Add expense</button></div>
      {showForm && <form className="staff-form-grid" onSubmit={saveExpense}>
        <label>Date *<input type="date" required max={today} value={form.expenseDate} onChange={e => change('expenseDate', e.target.value)} /></label>
        <label>Category *<select value={form.category} onChange={e => change('category', e.target.value)}>{['Rent','Utilities','Transport','Repairs','Internet & Phone','Office supplies','Marketing','Taxes & Fees','Other'].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Description *<input required maxLength="180" value={form.description} onChange={e => change('description', e.target.value)} /></label>
        <label>Amount *<input type="number" required min="0.01" step="0.01" value={form.amount} onChange={e => change('amount', e.target.value)} /></label>
        <label>Payment method<select value={form.paymentMethod} onChange={e => change('paymentMethod', e.target.value)}>{['Cash','Bank transfer','Mobile wallet','Card','Other'].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Notes<input maxLength="500" value={form.notes} onChange={e => change('notes', e.target.value)} /></label>
        <div className="product-form-actions"><button type="button" className="btn ghost" onClick={() => setShowForm(false)}>Cancel</button><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save expense'}</button></div>
      </form>}
      <div className="finance-expense-search"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expense category or description..." /></div>
      {expenses.length ? <div className="table-wrap"><table className="product-table finance-table"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Method</th><th>Amount</th><th>Action</th></tr></thead><tbody>{expenses.map(x => <tr key={x.id}><td>{x.expense_date}</td><td>{x.category}</td><td><strong>{x.description}</strong><small className="purchase-subline">{x.notes || ''}</small></td><td>{x.payment_method}</td><td>{curr} {money(x.amount)}</td><td><button className="purchase-remove-line" onClick={() => deleteExpense(x.id)}>×</button></td></tr>)}</tbody></table></div> : <div className="products-empty"><div>₨</div><h3>No expenses in this period</h3><p>Add expenses to include them in net profit.</p></div>}
    </section>
    <p className="finance-note">This is an operational estimate, not a tax filing or formal accounting statement.</p>
  </div>;
}

function Staff({ currency = 'PKR' }) {
  const today = new Date().toISOString().slice(0, 10);
  const empty = { fullName: '', jobTitle: '', phone: '', email: '', monthlySalary: '0', hireDate: today, status: 'Active', notes: '' };
  const [staff, setStaff] = useState([]), [payments, setPayments] = useState([]), [paidMonth, setPaidMonth] = useState(0), [monthlyBalances, setMonthlyBalances] = useState([]), [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const [form, setForm] = useState(empty), [editing, setEditing] = useState(null), [show, setShow] = useState(false), [showPay, setShowPay] = useState(false);
  const [payForm, setPayForm] = useState({ staffId: '', paymentDate: today, amount: '', paymentMethod: 'Cash', paymentType: 'Salary', periodLabel: today.slice(0, 7), notes: '' });
  const [search, setSearch] = useState(''), [status, setStatus] = useState('All'), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const money = value => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(value || 0));
  const load = async () => {
    try { const r = await window.inventoryAPI.listStaff({ search, status, month: selectedMonth }); if (r?.ok) { setStaff(r.staff || []); setPayments(r.payments || []); setMonthlyBalances(r.monthlyBalances || []); setPaidMonth(Number(r.paidThisMonth?.paid || 0)); } else setError(r?.error || 'Unable to load staff.'); }
    catch (e) { setError('Staff records could not be loaded.'); }
  };
  useEffect(() => { load(); }, [search, status, selectedMonth]);
  const change = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const remainingForStaff = (staffId, month) => {
     const member = staff.find(x => Number(x.id) === Number(staffId));
     if (!member || !/^\d{4}-\d{2}$/.test(String(month || ''))) return '';
     const rows = payments.filter(x => Number(x.staff_id) === Number(staffId) && String(x.period_label || '') === month);
     const alreadyPaid = rows.reduce((sum, x) => sum + Number(x.amount || 0), 0);
     return Math.max(0, Number(member.monthly_salary || 0) - alreadyPaid).toFixed(2);
   };
   const changePay = (k, v) => setPayForm(p => {
     const next = { ...p, [k]: v };
     if (['staffId', 'periodLabel', 'paymentType'].includes(k)) next.amount = remainingForStaff(next.staffId, next.periodLabel);
     return next;
   });
  const edit = p => { setForm({ fullName: p.full_name, jobTitle: p.job_title || '', phone: p.phone || '', email: p.email || '', monthlySalary: String(p.monthly_salary || 0), hireDate: p.hire_date || '', status: p.status, notes: p.notes || '' }); setEditing(p.id); setShow(true); setError(''); };
  const cancel = () => { setForm(empty); setEditing(null); setShow(false); };
  const save = async e => { e.preventDefault(); setBusy(true); setError(''); setMessage(''); try { const r = await window.inventoryAPI.saveStaff({ ...form, id: editing, monthlySalary: Number(form.monthlySalary) }); if (!r?.ok) setError(r?.error || 'Unable to save staff.'); else { setMessage(editing ? 'Staff details updated.' : 'Staff member added.'); cancel(); await load(); } } catch (e) { setError('Unable to save staff.'); } finally { setBusy(false); } };
  const savePay = async e => { e.preventDefault(); setBusy(true); setError(''); setMessage(''); try { const r = await window.inventoryAPI.createStaffPayment({ ...payForm, staffId: Number(payForm.staffId), amount: Number(payForm.amount) }); if (!r?.ok) setError(r?.error || 'Unable to record salary payment.'); else { setMessage(payForm.paymentType === 'Advance' ? 'Salary advance recorded and assigned to the selected month.' : 'Salary payment recorded for the selected month.'); setShowPay(false); setPayForm({ staffId: '', paymentDate: today, amount: '', paymentMethod: 'Cash', paymentType: 'Salary', periodLabel: selectedMonth, notes: '' }); await load(); } } catch (e) { setError('Unable to save salary payment.'); } finally { setBusy(false); } };
  const active = staff.filter(p => p.status === 'Active');
  const payroll = active.reduce((sum, p) => sum + Number(p.monthly_salary || 0), 0);
  return <div className="staff-page">
    <div className="finance-toolbar"><div><h2>Staff</h2><p>Manage employee details, monthly salaries, and salary payments.</p></div><div className="staff-toolbar-actions"><button className="btn ghost" onClick={() => { setShowPay(v => !v); setPayForm(p => ({ ...p, periodLabel: selectedMonth })); setError(''); }}>＋ Record salary</button><button className="btn primary" onClick={() => { setForm(empty); setEditing(null); setShow(v => !v); setError(''); }}>＋ Add staff</button></div></div>
    {message && <div className="product-message">{message}</div>}{error && <div className="form-error product-error">{error}</div>}
    <section className="finance-stat-grid"><div><span>Active staff</span><strong>{active.length}</strong><small>Active in filtered list</small></div><div><span>Expected monthly payroll</span><strong>{currency} {money(payroll)}</strong><small>Monthly salaries of active staff</small></div><div><span>Salary paid this month</span><strong>{currency} {money(paidMonth)}</strong><small>Actual recorded payments</small></div><div><span>Recent salary payments</span><strong>{payments.length}</strong><small>Latest 300 records</small></div></section>
    {show && <form className="panel staff-form-card" onSubmit={save}><div className="panel-head"><div><h2>{editing ? 'Edit staff member' : 'Add staff member'}</h2><p>Salary uses your business currency.</p></div><button type="button" className="icon-close" onClick={cancel}>×</button></div><div className="staff-form-grid">
      <label>Full name *<input required maxLength="160" value={form.fullName} onChange={e => change('fullName', e.target.value)} /></label><label>Job title / role<input maxLength="120" value={form.jobTitle} onChange={e => change('jobTitle', e.target.value)} /></label><label>Phone number<input maxLength="50" value={form.phone} onChange={e => change('phone', e.target.value)} /></label><label>Email address<input type="email" maxLength="180" value={form.email} onChange={e => change('email', e.target.value)} /></label><label>Monthly salary *<input type="number" required min="0" step="0.01" value={form.monthlySalary} onChange={e => change('monthlySalary', e.target.value)} /></label><label>Joining date<input type="date" value={form.hireDate} onChange={e => change('hireDate', e.target.value)} /></label><label>Status<select value={form.status} onChange={e => change('status', e.target.value)}><option>Active</option><option>Inactive</option></select></label><label>Notes<input maxLength="1000" value={form.notes} onChange={e => change('notes', e.target.value)} /></label>
    </div><div className="product-form-actions"><button type="button" className="btn ghost" onClick={cancel}>Cancel</button><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Save staff member'}</button></div></form>}
    {showPay && <form className="panel staff-form-card" onSubmit={savePay}><div className="panel-head"><div><h2>{payForm.paymentType === 'Advance' ? 'Record salary advance' : 'Record salary payment'}</h2><p>Choose which salary month this payment reduces. Advances are tracked separately from regular salary payments.</p></div><button type="button" className="icon-close" onClick={() => setShowPay(false)}>×</button></div><div className="staff-form-grid">
      <label>Staff member *<select required value={payForm.staffId} onChange={e => changePay('staffId', e.target.value)}><option value="">Select staff</option>{active.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></label><label>Payment date *<input type="date" required max={today} value={payForm.paymentDate} onChange={e => changePay('paymentDate', e.target.value)} /></label><label>Amount paid *<input type="number" required min="0.01" step="0.01" value={payForm.amount} onChange={e => changePay('amount', e.target.value)} /><small>{payForm.staffId ? `Suggested amount after previous payments: ${currency} ${money(remainingForStaff(payForm.staffId, payForm.periodLabel))}. You can edit this amount.` : "Select a staff member to calculate the suggested amount."}</small></label><label>Salary month *<input required type="month" value={payForm.periodLabel} onChange={e => changePay('periodLabel', e.target.value)} /></label><label>Payment type *<select required value={payForm.paymentType} onChange={e => changePay('paymentType', e.target.value)}><option value="Salary">Regular salary payment</option><option value="Advance">Advance salary</option></select></label><label>Payment method<select value={payForm.paymentMethod} onChange={e => changePay('paymentMethod', e.target.value)}>{['Cash','Bank transfer','Mobile wallet','Cheque','Other'].map(x => <option key={x}>{x}</option>)}</select></label><label>Notes<input maxLength="500" value={payForm.notes} onChange={e => changePay('notes', e.target.value)} /></label>
    </div><div className="product-form-actions"><button type="button" className="btn ghost" onClick={() => setShowPay(false)}>Cancel</button><button className="btn primary" disabled={busy || !active.length}>{busy ? 'Saving…' : 'Save salary payment'}</button></div></form>}
    <section className="panel finance-breakdown"><div className="panel-head"><div><h2>Monthly salary and advance tracker</h2><p>Track advances, regular payments, and remaining salary due for each month.</p></div><label className="staff-month-picker">Salary month<input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} /></label></div><div className="table-wrap"><table className="product-table staff-table"><thead><tr><th>Staff member</th><th>Monthly salary</th><th>Advance taken</th><th>Regular salary paid</th><th>Total paid</th><th>Remaining salary due</th><th>Status</th></tr></thead><tbody>{staff.map(p => { const b = monthlyBalances.find(x => Number(x.staff_id) === Number(p.id)) || {}; const advances = Number(b.advances || 0), regular = Number(b.salary_paid || 0), total = Number(b.total_paid || 0), due = Number(p.monthly_salary || 0) - total; return <tr key={p.id}><td><strong>{p.full_name}</strong><small className="purchase-subline">{p.job_title || "Staff member"}</small></td><td>{currency} {money(p.monthly_salary)}</td><td>{currency} {money(advances)}</td><td>{currency} {money(regular)}</td><td>{currency} {money(total)}</td><td><strong className={due > 0 ? "staff-due-positive" : due < 0 ? "staff-due-negative" : ""}>{currency} {money(due)}</strong></td><td><span className={"stock-badge " + (due > 0 ? "low" : "ok")}>{due > 0 ? "Balance due" : due < 0 ? "Overpaid" : "Settled"}</span></td></tr>; })}</tbody></table></div>{!staff.length && <div className="analytics-empty">Add staff members to track monthly salary balances.</div>}<p className="finance-note">Remaining salary = monthly salary − regular salary payments − advances assigned to this month. Negative balance means overpaid.</p></section><section className="panel finance-breakdown"><div className="panel-head"><div><h2>Staff directory</h2><p>{staff.length} matching staff members</p></div></div><div className="staff-filters"><div className="product-search"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, role, phone or email..." /></div><select value={status} onChange={e => setStatus(e.target.value)}><option>All</option><option>Active</option><option>Inactive</option></select></div>
      {staff.length ? <div className="table-wrap"><table className="product-table staff-table"><thead><tr><th>Staff member</th><th>Contact</th><th>Joining date</th><th>Monthly salary</th><th>Status</th><th>Action</th></tr></thead><tbody>{staff.map(p => <tr key={p.id}><td><strong>{p.full_name}</strong><small className="purchase-subline">{p.job_title || 'Staff member'}</small></td><td>{p.phone || '—'}<small className="purchase-subline">{p.email || ''}</small></td><td>{p.hire_date || '—'}</td><td>{currency} {money(p.monthly_salary)}</td><td><span className={'stock-badge ' + (p.status === 'Active' ? 'ok' : 'low')}>{p.status}</span></td><td><button className="purchase-detail-button" onClick={() => edit(p)}>Edit</button></td></tr>)}</tbody></table></div> : <div className="products-empty"><div>♙</div><h3>No staff records found</h3><p>Add staff to track contact details and salary costs.</p></div>}
    </section>
    <section className="panel finance-breakdown"><div className="panel-head"><div><h2>Salary payment history</h2><p>Latest {payments.length} recorded payments</p></div></div>{payments.length ? <div className="table-wrap"><table className="product-table staff-table"><thead><tr><th>Date</th><th>Staff member</th><th>Salary period</th><th>Payment type</th><th>Method</th><th>Amount</th><th>Notes</th></tr></thead><tbody>{payments.map(p => <tr key={p.id}><td>{p.payment_date}</td><td>{p.staff_name}</td><td>{p.period_label || '—'}</td><td><span className={'stock-badge ' + (p.payment_type === 'Advance' ? 'low' : 'ok')}>{p.payment_type || 'Salary'}</span></td><td>{p.payment_method}</td><td>{currency} {money(p.amount)}</td><td>{p.notes || '—'}</td></tr>)}</tbody></table></div> : <div className="products-empty"><div>₨</div><h3>No salary payments yet</h3><p>Record a payment when salary is paid.</p></div>}</section>
    <p className="finance-note">Advances are part of the selected month’s salary, not extra salary expense. The tracker subtracts advances and regular payments from the monthly salary. Profit & Loss counts each payment on its actual payment date.</p>
  </div>;
}

function Purchases({ currency = 'PKR' }) {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    supplierName: '', supplierPhone: '', invoiceNumber: '',
    purchaseDate: new Date().toISOString().slice(0, 10), paidAmount: '0', notes: '',
    items: [{ productId: '', quantity: '1', unitCost: '' }]
  });

  const load = async () => {
    try {
      const [productResult, purchaseResult] = await Promise.all([
        window.inventoryAPI.listProducts(),
        window.inventoryAPI.listPurchases({ status: statusFilter, from: fromDate, to: toDate, search })
      ]);
      if (productResult?.ok) setProducts(productResult.products || []);
      else setError(productResult?.error || 'Unable to load products.');
      if (purchaseResult?.ok) setPurchases(purchaseResult.purchases || []);
      else setError(purchaseResult?.error || 'Unable to load purchases.');
    } catch (e) {
      setError('Purchase data could not be loaded from the local database.');
    }
  };

  useEffect(() => { load(); }, [statusFilter, fromDate, toDate, search]);

  const money = value => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(value || 0));
  const totalSpend = purchases.reduce((sum, purchase) => sum + Number(purchase.subtotal || 0), 0);
  const outstanding = purchases.reduce((sum, purchase) => sum + Math.max(0, Number(purchase.subtotal || 0) - Number(purchase.paid_amount || 0)), 0);
  const unpaidCount = purchases.filter(purchase => purchase.payment_status !== 'Paid').length;
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateItem = (index, key, value) => setForm(prev => ({ ...prev, items: prev.items.map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  const addLine = () => setForm(prev => ({ ...prev, items: [...prev.items, { productId: '', quantity: '1', unitCost: '' }] }));
  const removeLine = index => setForm(prev => ({ ...prev, items: prev.items.length === 1 ? prev.items : prev.items.filter((_, i) => i !== index) }));
  const lineTotal = item => Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unitCost) || 0);
  const draftTotal = form.items.reduce((sum, item) => sum + lineTotal(item), 0);

  const chooseProduct = (index, productId) => {
    const product = products.find(p => String(p.id) === String(productId));
    setForm(prev => ({ ...prev, items: prev.items.map((item, i) => i === index ? { ...item, productId, unitCost: product ? String(product.buying_price ?? 0) : '' } : item) }));
  };

  const resetForm = () => setForm({
    supplierName: '', supplierPhone: '', invoiceNumber: '',
    purchaseDate: new Date().toISOString().slice(0, 10), paidAmount: '0', notes: '',
    items: [{ productId: '', quantity: '1', unitCost: '' }]
  });

  const submit = async event => {
    event.preventDefault();
    setError(''); setMessage('');
    if (!form.supplierName.trim()) return setError('Supplier name is required.');
    if (!form.items.length || form.items.some(item => !item.productId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || !Number.isFinite(Number(item.unitCost)) || Number(item.unitCost) < 0)) return setError('Choose a product and enter a valid quantity and unit cost for every line.');
    const paidAmount = Number(form.paidAmount);
    if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > draftTotal + 0.005) return setError('Paid amount must be between zero and the purchase total.');
    setBusy(true);
    try {
      const result = await window.inventoryAPI.createPurchase({
        supplierName: form.supplierName,
        supplierPhone: form.supplierPhone,
        invoiceNumber: form.invoiceNumber,
        purchaseDate: form.purchaseDate,
        paidAmount,
        notes: form.notes,
        items: form.items.map(item => ({ productId: Number(item.productId), quantity: Number(item.quantity), unitCost: Number(item.unitCost) }))
      });
      if (!result?.ok) setError(result?.error || 'Unable to save purchase.');
      else {
        setMessage('Purchase ' + result.purchaseNumber + ' saved. Stock quantities have been updated.');
        setShowForm(false);
        resetForm();
        await load();
      }
    } catch (e) {
      setError('The local database could not save this purchase.');
    } finally { setBusy(false); }
  };

  return <div className="purchases-page">
    <section className="purchase-summary">
      <div><span>Purchase records</span><strong>{purchases.length}</strong><small>Matching your current filters</small></div>
      <div><span>Total purchase value</span><strong>{currency} {money(totalSpend)}</strong><small>Recorded purchase totals</small></div>
      <div><span>Outstanding balance</span><strong>{currency} {money(outstanding)}</strong><small>Unpaid amounts in this list</small></div>
      <div><span>Payment pending</span><strong>{unpaidCount}</strong><small>Partial or unpaid purchases</small></div>
    </section>
    <div className="purchase-toolbar">
      <div><h2>Purchases</h2><p>Record supplier purchases, track payment, and automatically increase stock.</p></div>
      <button className="btn primary" onClick={() => { setShowForm(value => !value); setError(''); setMessage(''); }}>＋ Record purchase</button>
    </div>
    {message && <div className="product-message">{message}</div>}
    {error && <div className="form-error product-error">{error}</div>}
    {showForm && <form className="panel purchase-form" onSubmit={submit}>
      <div className="panel-head"><div><h2>New purchase</h2><p>Saving this record adds the purchased quantities to Stock and Products.</p></div><button type="button" className="icon-close" onClick={() => setShowForm(false)}>×</button></div>
      <div className="purchase-header-fields">
        <label>Supplier name *<input required value={form.supplierName} onChange={e=>update('supplierName',e.target.value)} placeholder="Supplier or company name" maxLength="160" /></label>
        <label>Supplier phone<input value={form.supplierPhone} onChange={e=>update('supplierPhone',e.target.value)} placeholder="Phone number" maxLength="50" /></label>
        <label>Invoice / reference<input value={form.invoiceNumber} onChange={e=>update('invoiceNumber',e.target.value)} placeholder="Supplier invoice number" maxLength="100" /></label>
        <label>Purchase date *<input type="date" required value={form.purchaseDate} onChange={e=>update('purchaseDate',e.target.value)} /></label>
      </div>
      <div className="purchase-lines-heading"><div><h3>Purchased items</h3><p>Choose products already saved in the Products section.</p></div><button type="button" className="btn ghost" onClick={addLine} disabled={!products.length}>＋ Add item</button></div>
      {!products.length && <div className="purchase-notice">Add products in the Products section before recording purchases.</div>}
      <div className="purchase-lines">
        {form.items.map((item,index)=><div className="purchase-line" key={index}>
          <label>Product *<select required value={item.productId} onChange={e=>chooseProduct(index,e.target.value)}><option value="">Select product</option>{products.map(product=><option key={product.id} value={product.id}>{product.name} · stock {product.stock_quantity}</option>)}</select></label>
          <label>Quantity *<input type="number" min="1" step="1" required value={item.quantity} onChange={e=>updateItem(index,'quantity',e.target.value)} /></label>
          <label>Unit cost *<input type="number" min="0" step="0.01" required value={item.unitCost} onChange={e=>updateItem(index,'unitCost',e.target.value)} /></label>
          <div className="purchase-line-total"><span>Line total</span><strong>{currency} {money(lineTotal(item))}</strong></div>
          <button type="button" className="purchase-remove-line" disabled={form.items.length===1} onClick={()=>removeLine(index)} title="Remove item">×</button>
        </div>)}
      </div>
      <div className="purchase-bottom-fields">
        <label>Amount paid now *<input type="number" required min="0" max={draftTotal} step="0.01" value={form.paidAmount} onChange={e=>update('paidAmount',e.target.value)} /><small>Enter 0 if the supplier has not been paid.</small></label>
        <label>Notes (optional)<textarea rows="3" value={form.notes} onChange={e=>update('notes',e.target.value)} placeholder="Payment reference, delivery notes, etc." maxLength="1000" /></label>
        <div className="purchase-totals"><div><span>Purchase total</span><strong>{currency} {money(draftTotal)}</strong></div><div><span>Paid now</span><strong>{currency} {money(form.paidAmount)}</strong></div><div><span>Balance due</span><strong>{currency} {money(Math.max(0,draftTotal-(Number(form.paidAmount)||0)))}</strong></div></div>
      </div>
      <div className="product-form-actions"><button type="button" className="btn ghost" onClick={()=>{setShowForm(false);setError('');}}>Cancel</button><button className="btn primary" disabled={busy||!products.length}>{busy?'Saving…':'Save purchase & update stock'}</button></div>
    </form>}
    <section className="panel purchase-table-panel">
      <div className="panel-head"><div><h2>Purchase history</h2><p>Latest 1,000 records · {purchases.length} shown</p></div></div>
      <div className="purchase-filters">
        <div className="product-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search purchase no., supplier, invoice..." /></div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option><option>Paid</option><option>Partial</option><option>Unpaid</option></select>
        <label>From<input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} /></label>
        <label>To<input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} /></label>
      </div>
      {purchases.length ? <div className="table-wrap"><table className="product-table purchase-table"><thead><tr><th>Purchase no.</th><th>Date</th><th>Supplier</th><th>Invoice</th><th>Items</th><th>Total</th><th>Paid</th><th>Balance due</th><th>Status</th><th>Details</th></tr></thead><tbody>
        {purchases.map(purchase=><React.Fragment key={purchase.id}><tr><td><strong>{purchase.purchase_number}</strong></td><td>{purchase.purchase_date}</td><td><strong>{purchase.supplier_name}</strong><small className="purchase-subline">{purchase.supplier_phone||''}</small></td><td>{purchase.invoice_number||'—'}</td><td>{purchase.items.reduce((sum,item)=>sum+Number(item.quantity||0),0)} units / {purchase.items.length} lines</td><td>{currency} {money(purchase.subtotal)}</td><td>{currency} {money(purchase.paid_amount)}</td><td>{currency} {money(Math.max(0,Number(purchase.subtotal)-Number(purchase.paid_amount)))}</td><td><span className={'stock-badge '+(purchase.payment_status==='Paid'?'ok':purchase.payment_status==='Partial'?'partial':'low')}>{purchase.payment_status}</span></td><td><button className="purchase-detail-button" onClick={()=>setPurchases(current=>current.map(p=>p.id===purchase.id?{...p,detailsOpen:!p.detailsOpen}:p))}>{purchase.detailsOpen?'Hide':'View items'}</button></td></tr>
          {purchase.detailsOpen && <tr className="purchase-detail-row"><td colSpan="10"><div className="purchase-detail-content"><div><b>Supplier:</b> {purchase.supplier_name} {purchase.supplier_phone&&'· '+purchase.supplier_phone}</div>{purchase.notes&&<div><b>Notes:</b> {purchase.notes}</div>}<table><thead><tr><th>Product</th><th>Qty</th><th>Unit cost</th><th>Line total</th></tr></thead><tbody>{purchase.items.map(item=><tr key={item.id}><td>{item.product_name}</td><td>{item.quantity}</td><td>{currency} {money(item.unit_cost)}</td><td>{currency} {money(item.line_total)}</td></tr>)}</tbody></table></div></td></tr>}
        </React.Fragment>)}
      </tbody></table></div> : <div className="products-empty"><div>＋</div><h3>No purchase records found</h3><p>{products.length?'Record your first supplier purchase to keep costs and stock up to date.':'Add products first, then record a purchase.'}</p><button className="btn primary" onClick={()=>setShowForm(true)} disabled={!products.length}>Record purchase</button></div>}
    </section>
    <p className="purchase-footnote">Purchases immediately increase stock and are added to stock movement history. The unit buying price on each product is updated to the latest recorded purchase cost. Payment balances are tracked per purchase; payment settlement and editing existing purchase records are not enabled yet.</p>
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
  const [displayBusinessName, setDisplayBusinessName] = useState(businessName || '');
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
      <div className="sidebar-bottom"><button className={active === 'Settings' ? 'nav-item active' : 'nav-item'} onClick={() => setActive('Settings')}><span>⚙</span>Settings</button><button className="nav-item logout" onClick={onLogout}><span>↪</span>Sign out</button></div>
    </aside>
    <main className="dash-main">
      <header className="dash-header"><div><div className="eyebrow">{active === 'Overview' ? 'LIVE LOCAL DATA' : 'MODULE'}</div><h1>{active === 'Overview' ? 'Good morning, Admin' : active}</h1><p>{active === 'Overview' ? (displayBusinessName || 'Your business') + ' · Dashboard refreshes every 10 seconds' : 'This section is prepared for the next development phase.'}</p></div><div className="user-pill"><span className="avatar">{username?.[0]?.toUpperCase() || 'A'}</span><div><b>{username || 'Admin'}</b><small>Administrator</small></div></div></header>
      {active === 'Products' ? <Products currency={currency} /> : active === 'Stock' ? <Stock currency={currency} /> : active === 'Purchases' ? <Purchases currency={currency} /> : active === 'Sales' ? <Sales currency={currency} /> : active === 'Billing' ? <Billing currency={currency} businessName={displayBusinessName} /> : active === 'Profit & Loss' ? <ProfitLoss currency={currency} /> : active === 'Staff' ? <Staff currency={currency} /> : active === 'Dashboard Analytics' ? <DashboardAnalytics currency={currency} /> : active === 'Reports' ? <Reports currency={currency} /> : active === 'Settings' ? <Settings username={username} onSaved={business => { setDisplayBusinessName(business.business_name || ''); setSummary(current => ({ ...current, currency: business.currency || 'PKR' })); }} /> : active === 'Overview' ? <>
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


function Settings({ username = '', onSaved = () => {} }) {
  const [form, setForm] = useState({ businessName:'', ownerName:'', phone:'', address:'', currency:'PKR', email:'', taxNumber:'', receiptFooter:'Thank you for shopping with us.' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await window.inventoryAPI.getBusinessSettings();
        if (!mounted) return;
        if (result?.ok) {
          const b = result.business || {};
          setForm({ businessName:b.business_name||'', ownerName:b.owner_name||'', phone:b.phone||'', address:b.address||'', currency:b.currency||'PKR', email:b.email||'', taxNumber:b.tax_number||'', receiptFooter:b.receipt_footer||'Thank you for shopping with us.' });
        } else setError(result?.error || 'Unable to load business settings.');
      } catch (e) { if (mounted) setError('Unable to load business settings from the local database.'); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);
  const save = async event => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      const result = await window.inventoryAPI.saveBusinessSettings(form);
      if (!result?.ok) { setError(result?.error || 'Unable to save business settings.'); return; }
      const b = result.business || {};
      setForm({ businessName:b.business_name||'', ownerName:b.owner_name||'', phone:b.phone||'', address:b.address||'', currency:b.currency||'PKR', email:b.email||'', taxNumber:b.tax_number||'', receiptFooter:b.receipt_footer||'Thank you for shopping with us.' });
      onSaved(b);
      setMessage('Business settings saved. Updated details will be used by the dashboard and new bills.');
    } catch (e) { setError('Unable to save business settings to the local database.'); }
    finally { setSaving(false); }
  };
  if (loading) return <section className="panel settings-panel"><div className="settings-loading">Loading business settings…</div></section>;
  return <div className="settings-page">
    <section className="settings-intro"><div className="settings-intro-icon">⚙</div><div><div className="eyebrow">ADMIN CONFIGURATION</div><h2>Business settings</h2><p>Manage your shop identity, contact details, currency, and receipt information. Changes are stored on this computer.</p></div></section>
    {error && <div className="form-error product-error">{error}</div>}
    {message && <div className="product-message">{message}</div>}
    <form className="panel settings-panel" onSubmit={save}>
      <div className="panel-head"><div><h2>Business profile</h2><p>These details appear in the dashboard and on newly generated bills.</p></div><span className="period">Local database</span></div>
      <div className="settings-fields">
        <label>Business / shop name *<input required maxLength="120" value={form.businessName} onChange={e=>update('businessName',e.target.value)} placeholder="e.g. Khan General Store"/></label>
        <label>Owner name *<input required maxLength="120" value={form.ownerName} onChange={e=>update('ownerName',e.target.value)} placeholder="Business owner name"/></label>
        <label>Phone number<input type="tel" maxLength="40" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="+92…"/></label>
        <label>Email address<input type="email" maxLength="160" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="shop@example.com"/></label>
        <label className="settings-address-field">Business address<textarea rows="3" maxLength="500" value={form.address} onChange={e=>update('address',e.target.value)} placeholder="Shop number, street, city"/></label>
        <label>Business currency *<select required value={form.currency} onChange={e=>update('currency',e.target.value)}><option value="PKR">PKR — Pakistani Rupee</option><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option><option value="GBP">GBP — Pound Sterling</option></select></label>
        <label>Tax / registration number<input maxLength="100" value={form.taxNumber} onChange={e=>update('taxNumber',e.target.value)} placeholder="Optional tax or registration ID"/></label>
        <label className="settings-address-field">Bill / receipt footer<textarea rows="2" maxLength="240" value={form.receiptFooter} onChange={e=>update('receiptFooter',e.target.value)} placeholder="Thank you for shopping with us."/></label>
      </div>
      <div className="settings-save-row"><div><strong>Save changes to this computer</strong><small>Existing products, sales, purchases, and staff records will not be deleted.</small></div><button className="btn primary settings-save-button" disabled={saving}>{saving?'Saving…':'Save business settings'}</button></div>
    </form>
    <section className="panel settings-account-panel"><div className="panel-head"><div><h2>Administrator account</h2><p>Login identity for this local StockDesk installation.</p></div></div><div className="settings-account-row"><div><span>Username</span><strong>{username || 'Administrator'}</strong></div><div><span>Storage</span><strong>Local SQLite database</strong></div><div><span>Connectivity</span><strong><span className="stock-badge ok">Works offline</span></strong></div></div><p className="settings-security-note">Your login password is stored as a secure hash. Account password changes are not part of this business-profile form.</p></section>
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
