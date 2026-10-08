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
          <h1>Run your inventory.<br /><span>Keep your data yours.</span></h1>
          <p>A clean desktop system for products, stock, sales, purchases and business reports. Everything works locally, without an internet connection.</p>
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
      <section className="features">
        <div><span>01</span><h3>Products & Stock</h3><p>Track quantities, buying prices, selling prices and low-stock items.</p></div>
        <div><span>02</span><h3>Sales & Purchases</h3><p>Record transactions and keep your inventory calculations consistent.</p></div>
        <div><span>03</span><h3>Profit & Reports</h3><p>See daily, weekly and monthly business performance in one place.</p></div>
      </section>
    </div>
  );
}

function Auth({ mode, setMode, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [business, setBusiness] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
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