import React, { useEffect, useState } from 'react';

const hashPassword = async (value) => {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [business, setBusiness] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!username.trim() || !password) return setError('Username and password are required.');
    if (mode === 'create' && !business.trim()) return setError('Business name is required.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    const passwordHash = await hashPassword(password);
    if (mode === 'create') {
      const result = await window.inventoryAPI.createAccount({ username: username.trim(), passwordHash });
      if (!result.ok) setError(result.error);
      else onSuccess(username.trim(), business.trim());
    } else {
      const result = await window.inventoryAPI.login({ username: username.trim(), passwordHash });
      if (!result.ok) setError('Incorrect username or password.');
      else onSuccess(result.username);
    }
    setBusy(false);
  };

  return <div className="auth-page">
    <div className="auth-brand"><Logo /></div>
    <div className="auth-shell">
      <div className="auth-side"><div className="eyebrow">STOCKDESK</div><h1>{mode === 'create' ? 'Set up your workspace.' : 'Welcome back.'}</h1><p>{mode === 'create' ? 'Create the local admin account for this shop. Your inventory stays on this computer.' : 'Sign in to your local inventory dashboard.'}</p><div className="offline-badge">● Offline-first · SQLite storage</div></div>
      <form className="auth-card" onSubmit={submit}>
        <h2>{mode === 'create' ? 'Create account' : 'Sign in'}</h2>
        <p className="muted">{mode === 'create' ? 'This account will be the local administrator.' : 'Enter your local account credentials.'}</p>
        {mode === 'create' && <label>Business name<input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="e.g. Khan General Store" /></label>}
        <label>Username<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Choose a username" autoFocus /></label>
        <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" /><button type="button" className="password-toggle" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? '◉' : '◌'}</button></div></label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'create' ? 'Create Account' : 'Sign In'}</button>
        <button type="button" className="back-link" onClick={()=>setMode(mode === 'create' ? 'login' : 'home')}>← Back</button>
      </form>
    </div>
  </div>;
}

function Dashboard({ username, onLogout }) {
  const [active, setActive] = useState('Overview');
  const nav = [['Overview','⌂'],['Products','▦'],['Stock','↕'],['Sales','₨'],['Purchases','＋'],['Suppliers','◇'],['Staff','♙'],['Profit & Loss','◒'],['Reports','▤']];

  return <div className="dashboard">
    <aside className="sidebar"><Logo /><div className="nav-label">MAIN MENU</div>{nav.map(([name,icon])=><button className={active===name?'nav-item active':'nav-item'} key={name} onClick={()=>setActive(name)}><span>{icon}</span>{name}</button>)}<div className="sidebar-bottom"><button className="nav-item"><span>⚙</span>Settings</button><button className="nav-item logout" onClick={onLogout}><span>↪</span>Sign out</button></div></aside>
    <main className="dash-main">
      <header className="dash-header"><div><div className="eyebrow">OVERVIEW</div><h1>{active === 'Overview' ? 'Good morning, Admin' : active}</h1><p>{active === 'Overview' ? 'Here is what is happening with your business today.' : 'This section is ready for the next development phase.'}</p></div><div className="user-pill"><span className="avatar">{username?.[0]?.toUpperCase() || 'A'}</span><div><b>{username || 'Admin'}</b><small>Administrator</small></div></div></header>
      {active === 'Overview' ? <><section className="stat-grid"><Stat label="Total Products" value="0" note="Add your first product" icon="▦"/><Stat label="Stock Value" value="₨ 0" note="Current inventory value" icon="◈"/><Stat label="Today Sales" value="₨ 0" note="No sales recorded" icon="↗"/><Stat label="Low Stock" value="0" note="Everything looks clear" icon="!" /></section><section className="dash-grid"><div className="panel large-panel"><div className="panel-head"><div><h2>Sales overview</h2><p>Weekly sales performance</p></div><span className="period">This week ▾</span></div><div className="empty-chart"><div className="chart-line"></div><span>No sales data yet</span></div></div><div className="panel"><div className="panel-head"><div><h2>Quick actions</h2><p>Common tasks</p></div></div><div className="quick-list"><button>＋ Add product <span>→</span></button><button>＋ Record purchase <span>→</span></button><button>↗ Create sale <span>→</span></button><button>▤ View reports <span>→</span></button></div></div></section></> : <div className="panel section-placeholder"><div className="placeholder-icon">⌁</div><h2>{active}</h2><p>The interface is prepared. We will connect this module to the local SQLite database next.</p></div>}
    </main>
  </div>;
}

function Stat({label,value,note,icon}) { return <div className="stat"><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>; }

export default function App() {
  const [screen, setScreen] = useState('home');
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => { window.inventoryAPI?.authStatus().then(r=>setHasUser(r.hasUser)); }, []);

  const showAuth = (mode) => { setAuthMode(mode); setScreen('auth'); };
  const success = (name) => { setUsername(name); setHasUser(true); setScreen('dashboard'); };

  if (screen === 'dashboard') return <Dashboard username={username} onLogout={()=>setScreen('home')} />;
  if (screen === 'auth') return <Auth mode={authMode} setMode={(m)=>m==='home'?setScreen('home'):setAuthMode(m)} onSuccess={success} />;
  return <Home onLogin={()=>showAuth('login')} onCreate={()=>showAuth('create')} />;
}