/* Doka Tracking Portal — public shipment tracking page. */
(function () {
  const { Button, Input, StatusPill, Badge, ProgressTracker, Avatar, Card } = window.DokaDesignSystem_7dbee8;
  const Icon = window.Icon;

  const TIMELINE = [
    { time: '14:05', date: 'Jun 16', title: 'Out for delivery', place: 'São Paulo · GRU hub', active: true },
    { time: '11:40', date: 'Jun 16', title: 'Arrived at destination hub', place: 'São Paulo · GRU hub' },
    { time: '06:18', date: 'Jun 16', title: 'In transit', place: 'BR-116 · en route' },
    { time: '21:50', date: 'Jun 15', title: 'Departed origin hub', place: 'Curitiba · CWB hub' },
    { time: '17:32', date: 'Jun 15', title: 'Picked up', place: 'Curitiba · CWB' },
  ];

  function Result() {
    return (
      <Card padding="none" style={{ overflow: 'hidden' }}>
        {/* header band */}
        <div style={{ background: 'var(--purple-600)', padding: '22px 26px', color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.14)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="package" size={24} color="#fff" />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em' }}>DK-8847-2291-BR</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Mercado Verde · 1 package · 12.4 kg</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StatusPill status="out" />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, marginTop: 8 }}>Arrives today</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'rgba(255,255,255,0.75)' }}>Estimated 15:30–16:00</div>
          </div>
        </div>

        <div style={{ padding: '28px 26px' }}>
          <ProgressTracker current={2} steps={[
            { label: 'Picked up', sub: 'Jun 15' },
            { label: 'In transit', sub: 'Jun 16' },
            { label: 'Out for delivery', sub: '14:05' },
            { label: 'Delivered', sub: '~15:30' },
          ]} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 0, borderTop: '1px solid var(--border-subtle)' }}>
          {/* timeline */}
          <div style={{ padding: '22px 26px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, marginBottom: 18, color: 'var(--text-strong)' }}>Tracking history</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {TIMELINE.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: e.active ? 'var(--orange-500)' : 'var(--neutral-300)', border: e.active ? '3px solid var(--orange-100)' : 'none', marginTop: 4, flex: 'none' }} />
                    {i < TIMELINE.length - 1 && <span style={{ width: 2, flex: 1, background: 'var(--neutral-200)', margin: '2px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: 18 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: e.active ? 'var(--orange-700)' : 'var(--text-strong)' }}>{e.title}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--text-muted)' }}>{e.place}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-subtle)', marginTop: 2 }}>{e.date} · {e.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* sidebar: map + driver + details */}
          <div style={{ padding: '22px 26px', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ height: 150, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--purple-50), var(--orange-50))', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--purple-400)' }}>
              <Icon name="map" size={20} /><span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>Live map</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name="João Pedro" status="online" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: 'var(--text-strong)' }}>João Pedro</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)' }}>Your driver · 4.9 ★</div>
              </div>
              <Badge tone="success" dot>Nearby</Badge>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <DetailRow label="Recipient" value="Ana Ribeiro" />
              <DetailRow label="Address" value="R. Augusta 1200, SP" />
              <DetailRow label="Service" value="Express · Signature" />
            </div>
            <Button variant="outline" fullWidth leftIcon={<Icon name="bell" size={16} />}>Notify me on delivery</Button>
          </div>
        </div>
      </Card>
    );
  }

  function DetailRow({ label, value }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--neutral-100)' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', textAlign: 'right' }}>{value}</span>
      </div>
    );
  }

  function TrackingPortal() {
    const [code, setCode] = React.useState('DK-8847-2291-BR');
    const [tracked, setTracked] = React.useState(true);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* nav */}
        <header style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>
          <img src="../../assets/logos/doka-logo-full.png" height="30" alt="Doka" />
          <div style={{ flex: 1 }} />
          <nav style={{ display: 'flex', gap: 26, alignItems: 'center', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: 'var(--text-body)' }}>
            <span>Track</span><span>Send</span><span>Business</span><span>Support</span>
            <Button variant="outline" size="sm">Sign in</Button>
          </nav>
        </header>

        {/* hero */}
        <div style={{ background: 'linear-gradient(180deg, var(--orange-50), var(--surface-page))', padding: '48px 32px 36px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <Badge tone="brand" soft>Real-time tracking</Badge>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--text-strong)', marginTop: 14 }}>
              Where's my package?
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--text-muted)', marginTop: 10 }}>Enter your Doka tracking code to follow every step.</p>
            <div style={{ display: 'flex', gap: 10, maxWidth: 520, margin: '24px auto 0' }}>
              <div style={{ flex: 1 }}>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="DK-0000-0000-BR" leftIcon={<Icon name="search" size={18} />} size="lg" />
              </div>
              <Button size="lg" onClick={() => setTracked(true)} leftIcon={<Icon name="truck" size={18} />}>Track</Button>
            </div>
          </div>
        </div>

        {/* result */}
        <div style={{ flex: 1, padding: '0 32px 48px' }}>
          <div style={{ maxWidth: 920, margin: '-12px auto 0' }}>
            {tracked && <Result />}
          </div>
        </div>
      </div>
    );
  }

  window.DokaTrackingPortal = TrackingPortal;
})();
