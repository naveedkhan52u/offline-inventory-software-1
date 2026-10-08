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

function Dashboard({ username, businessName, onLogout }) {
  const [active, setActive] = useState('Overview');

  return <div className="dashboard">
    <aside className="sidebar">
      <Logo />
      <div className="nav-label">MAIN MENU</div>
      {NAV.map(([name,icon])=><button className={active===name?'nav-item active':'nav-item'} key={name} onClick={()=>setActive(name)}><span>{icon}</span>{name}</button>)}
      <div className="sidebar-bottom"><button className="nav-item"><span>⚙</span>Settings</button><button className="nav-item logout" onClick={onLogout}><span>↪</span>Sign out</button></div>
    </aside>
    <main className="dash-main">
      <header className="dash-header"><div><div className="eyebrow">{active === 'Overview' ? 'OVERVIEW' : 'MODULE'}</div><h1>{active === 'Overview' ? 'Good morning, Admin' : active}</h1><p>{active === 'Overview' ? businessName || 'Your business' : 'This section is prepared for the next development phase.'}</p></div><div className="user-pill"><span className="avatar">{username?.[0]?.toUpperCase() || 'A'}</span><div><b>{username || 'Admin'}</b><small>Administrator</small></div></div></header>
      {active === 'Overview' ? <><section className="stat-grid"><Stat label="Total Products" value="0" note="Products module coming next" icon="▦"/><Stat label="Stock Value" value="₨ 0" note="Stock module coming next" icon="◈"/><Stat label="Today Sales" value="₨ 0" note="Sales module coming next" icon="↗"/><Stat label="Low Stock" value="0" note="Stock alerts coming next" icon="!"/></section><section className="dash-grid"><div className="panel large-panel"><div className="panel-head"><div><h2>Sales overview</h2><p>Analytics will use real local data later.</p></div><span className="period">Coming later</span></div><div className="empty-chart"><div className="chart-line"></div><span>No business transactions recorded yet</span></div></div><div className="panel"><div className="panel-head"><div><h2>Module roadmap</h2><p>Development order</p></div></div><div className="quick-list">{NAV.slice(1).map(([name])=><button key={name} onClick={()=>setActive(name)}>{name}<span>→</span></button>)}</div></div></section></> : <div className="panel section-placeholder"><div className="placeholder-icon">⌁</div><h2>{active}</h2><p>The navigation section is in place. Its database tables and features will be implemented separately.</p></div>}
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
