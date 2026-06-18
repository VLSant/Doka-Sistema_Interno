/* Doka Operations Dashboard — app shell (sidebar + topbar). */
(function () {
  const { Avatar, Badge, IconButton } = window.DokaDesignSystem_7dbee8;
  const Icon = window.Icon;

  function NavItem({ icon, label, active, badge, onClick }) {
    const [hover, setHover] = React.useState(false);
    return (
      <button onClick={onClick}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px',
          border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)', textAlign: 'left',
          fontFamily: 'var(--font-sans)', fontWeight: active ? 700 : 600, fontSize: 'var(--text-base)',
          color: active ? 'var(--orange-700)' : hover ? 'var(--text-strong)' : 'var(--text-body)',
          background: active ? 'var(--orange-50)' : hover ? 'var(--neutral-100)' : 'transparent',
          transition: 'background var(--dur-fast), color var(--dur-fast)',
        }}>
        <Icon name={icon} size={19} color={active ? 'var(--orange-600)' : 'currentColor'} />
        <span style={{ flex: 1 }}>{label}</span>
        {badge != null && <Badge tone={active ? 'brand' : 'neutral'}>{badge}</Badge>}
      </button>
    );
  }

  function Sidebar({ view, setView }) {
    const nav = [
      { key: 'dashboard', icon: 'home', label: 'Dashboard' },
      { key: 'shipments', icon: 'package', label: 'Shipments', badge: 1284 },
      { key: 'routes', icon: 'route', label: 'Routes' },
      { key: 'fleet', icon: 'truck', label: 'Fleet' },
      { key: 'hubs', icon: 'warehouse', label: 'Hubs' },
      { key: 'team', icon: 'users', label: 'Team' },
    ];
    return (
      <aside style={{
        width: 'var(--sidebar-w)', flex: 'none', height: '100%', background: 'var(--surface-card)',
        borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', padding: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 8px 18px' }}>
          <img src="../../assets/logos/doka-logo-full.png" height="30" alt="Doka" />
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {nav.map((n) => <NavItem key={n.key} {...n} active={view === n.key} onClick={() => setView(n.key)} />)}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <NavItem icon="chart" label="Reports" />
          <NavItem icon="settings" label="Settings" />
          <div style={{ marginTop: 12, padding: 12, background: 'var(--purple-50)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Avatar name="Marina Alves" size="sm" status="online" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Marina Alves</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)' }}>Ops · CMNL</div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  function Topbar({ title, subtitle, onSearch }) {
    return (
      <header style={{
        height: 'var(--topbar-h)', flex: 'none', display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-card)',
      }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--text-strong)', lineHeight: 1.1 }}>{title}</h1>
          {subtitle && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--text-muted)' }}>{subtitle}</div>}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 14px', width: 280,
          background: 'var(--neutral-100)', borderRadius: 'var(--radius-pill)',
        }}>
          <Icon name="search" size={17} color="var(--text-muted)" />
          <input placeholder="Search tracking code, customer…" onChange={onSearch} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--text-strong)' }} />
        </div>
        <IconButton aria-label="Notifications" variant="ghost"><Icon name="bell" /></IconButton>
        <IconButton aria-label="New shipment" variant="primary"><Icon name="plus" /></IconButton>
      </header>
    );
  }

  window.DokaShell = { Sidebar, Topbar };
})();
