/* Doka Operations Dashboard — shipments list view (tabs + table + filters). */
(function () {
  const { Card, Tabs, StatusPill, Badge, Tag, Button, Select, IconButton, Checkbox } = window.DokaDesignSystem_7dbee8;
  const Icon = window.Icon;
  const { shipments } = window.DOKA_DATA;

  function ShipmentsView({ onOpen }) {
    const [tab, setTab] = React.useState('all');
    const [hub, setHub] = React.useState('all');
    const counts = {
      all: shipments.length,
      transit: shipments.filter((s) => s.status === 'transit' || s.status === 'out').length,
      delivered: shipments.filter((s) => s.status === 'delivered').length,
      issues: shipments.filter((s) => s.status === 'delayed' || s.status === 'exception').length,
    };
    const rows = shipments.filter((s) => {
      if (tab === 'transit') return s.status === 'transit' || s.status === 'out';
      if (tab === 'delivered') return s.status === 'delivered';
      if (tab === 'issues') return s.status === 'delayed' || s.status === 'exception';
      return true;
    });

    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card padding="none">
          <div style={{ padding: '4px 18px 0' }}>
            <Tabs value={tab} onChange={setTab} tabs={[
              { key: 'all', label: 'All', count: counts.all },
              { key: 'transit', label: 'In transit', count: counts.transit },
              { key: 'delivered', label: 'Delivered', count: counts.delivered },
              { key: 'issues', label: 'Issues', count: counts.issues },
            ]} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px' }}>
            <div style={{ width: 180 }}>
              <Select value={hub} onChange={setHub} options={[{ value: 'all', label: 'All hubs' }, { value: 'cwb', label: 'Curitiba · CWB' }, { value: 'gru', label: 'São Paulo · GRU' }]} size="sm" />
            </div>
            <Tag icon={<Icon name="calendar" size={14} />} onRemove={() => {}}>Today</Tag>
            <Tag onRemove={() => {}}>Priority only</Tag>
            <div style={{ flex: 1 }} />
            <Button variant="outline" size="sm" leftIcon={<Icon name="filter" size={15} />}>Filters</Button>
            <Button variant="outline" size="sm" leftIcon={<Icon name="download" size={15} />}>Export</Button>
          </div>

          {/* Table */}
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '32px 1.3fr 1.6fr 1.1fr 1fr 1fr 40px', gap: 14,
              padding: '11px 18px', background: 'var(--neutral-50)',
              fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
            }}>
              <span></span><span>Tracking</span><span>Route</span><span>Driver</span><span>ETA</span><span>Status</span><span></span>
            </div>
            {rows.map((s, i) => (
              <div key={s.id} onClick={() => onOpen && onOpen('detail', s)} style={{
                display: 'grid', gridTemplateColumns: '32px 1.3fr 1.6fr 1.1fr 1fr 1fr 40px', gap: 14, alignItems: 'center',
                padding: '13px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--neutral-100)', cursor: 'pointer',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--neutral-50)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <span onClick={(e) => e.stopPropagation()}><Checkbox /></span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{s.id}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'var(--text-muted)' }}>{s.customer}{s.priority ? ' · Priority' : ''}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body)' }}>
                  <span>{s.origin}</span><Icon name="arrowRight" size={13} color="var(--text-subtle)" /><span>{s.dest}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-body)' }}>{s.driver}</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--text-muted)' }}>{s.eta}</span>
                <StatusPill status={s.status} size="sm" />
                <span onClick={(e) => e.stopPropagation()}><IconButton aria-label="More" variant="ghost" size="sm"><Icon name="more" size={18} /></IconButton></span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  window.DokaShipmentsView = ShipmentsView;
})();
