/* Doka Operations Dashboard — main dashboard view. */
(function () {
  const { Card, StatCard, StatusPill, Badge, Button } = window.DokaDesignSystem_7dbee8;
  const Icon = window.Icon;
  const { shipments, volume } = window.DOKA_DATA;

  function VolumeChart() {
    const max = Math.max(...volume.map((d) => d.v));
    const W = 520, H = 180, pad = 8;
    const bw = (W - pad * 2) / volume.length;
    return (
      <svg viewBox={`0 0 ${W} ${H + 28}`} style={{ width: '100%', height: 'auto' }}>
        {[0.25, 0.5, 0.75, 1].map((g, i) => (
          <line key={i} x1={0} x2={W} y1={H - H * g} y2={H - H * g} stroke="var(--neutral-150)" strokeWidth="1" />
        ))}
        {volume.map((d, i) => {
          const h = (d.v / max) * (H - 16);
          const x = pad + i * bw;
          const today = i === volume.length - 4;
          return (
            <g key={i}>
              <rect x={x + bw * 0.18} y={H - h} width={bw * 0.64} height={h} rx="6"
                fill={today ? 'var(--orange-500)' : 'var(--purple-200)'} />
              <text x={x + bw / 2} y={H + 18} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="11" fontWeight="600" fill="var(--text-muted)">{d.d}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  function StatusBreakdown() {
    const rows = [
      { label: 'In transit', status: 'transit', pct: 38, count: 412 },
      { label: 'Out for delivery', status: 'out', pct: 22, count: 238 },
      { label: 'Delivered', status: 'delivered', pct: 32, count: 806 },
      { label: 'Delayed', status: 'delayed', pct: 6, count: 21 },
      { label: 'Exceptions', status: 'exception', pct: 2, count: 7 },
    ];
    const color = { transit: 'var(--status-transit)', out: 'var(--orange-500)', delivered: 'var(--status-delivered)', delayed: 'var(--status-delayed)', exception: 'var(--status-exception)' };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', height: 12, borderRadius: 'var(--radius-pill)', overflow: 'hidden', gap: 2 }}>
          {rows.map((r) => <div key={r.label} style={{ width: r.pct + '%', background: color[r.status] }} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((r) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color[r.status] }} />
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: 'var(--text-body)' }}>{r.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-strong)', fontWeight: 600 }}>{r.count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function SectionHead({ title, action }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--text-strong)' }}>{title}</h3>
        {action}
      </div>
    );
  }

  function DashboardView({ onOpen }) {
    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatCard label="On-time rate" value="96.4" unit="%" delta="2.1%" deltaDir="up" tone="success" icon={<Icon name="clock" />} />
          <StatCard label="Active shipments" value="1,284" delta="8%" deltaDir="up" tone="brand" icon={<Icon name="package" />} />
          <StatCard label="Out for delivery" value="238" delta="12%" deltaDir="up" tone="info" icon={<Icon name="truck" />} />
          <StatCard label="Avg. delay" value="14" unit="min" delta="3%" deltaDir="down" tone="warning" icon={<Icon name="alert" />} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
          <Card padding="lg">
            <SectionHead title="Daily shipment volume" action={<Badge tone="brand" soft>This week</Badge>} />
            <VolumeChart />
          </Card>
          <Card padding="lg">
            <SectionHead title="Status breakdown" />
            <StatusBreakdown />
          </Card>
        </div>

        <Card padding="lg">
          <SectionHead title="Recent shipments" action={<Button variant="ghost" size="sm" rightIcon={<Icon name="arrowRight" size={16} />} onClick={() => onOpen && onOpen('shipments')}>View all</Button>} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {shipments.slice(0, 5).map((s, i) => (
              <div key={s.id} onClick={() => onOpen && onOpen('detail', s)} style={{
                display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr auto', alignItems: 'center', gap: 16,
                padding: '12px 8px', borderTop: i === 0 ? 'none' : '1px solid var(--neutral-100)', cursor: 'pointer', borderRadius: 8,
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--neutral-50)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{s.id}</span>
                  {s.priority && <Badge tone="purple">Priority</Badge>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body)' }}>
                  <span>{s.origin}</span>
                  <Icon name="arrowRight" size={14} color="var(--text-subtle)" />
                  <span>{s.dest}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>{s.eta}</span>
                <StatusPill status={s.status} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  window.DokaDashboardView = DashboardView;
})();
