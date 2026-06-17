/* Doka Operations Dashboard — shipment detail slide-over. */
(function () {
  const { StatusPill, Badge, Button, ProgressTracker, Avatar, IconButton } = window.DokaDesignSystem_7dbee8;
  const Icon = window.Icon;

  function Field({ label, value, mono }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--text-strong)' }}>{value}</span>
      </div>
    );
  }

  function ShipmentDetail({ shipment, onClose }) {
    if (!shipment) return null;
    const s = shipment;
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--scrim)', backdropFilter: 'var(--blur-sm)', WebkitBackdropFilter: 'var(--blur-sm)' }} />
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 460, background: 'var(--surface-card)',
          boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column',
          animation: 'doka-slide 0.32s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <style>{`@keyframes doka-slide{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}`}</style>
          {/* header */}
          <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <StatusPill status={s.status} />
                {s.priority && <Badge tone="purple">Priority</Badge>}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--text-strong)' }}>{s.id}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.customer}</div>
            </div>
            <IconButton aria-label="Close" variant="ghost" onClick={onClose}><Icon name="x" /></IconButton>
          </div>

          <div style={{ padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <ProgressTracker current={s.progress} steps={[
              { label: 'Picked up', sub: '09:12' },
              { label: 'In transit', sub: '11:40' },
              { label: 'Out', sub: '14:05' },
              { label: 'Delivered' },
            ]} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <Field label="Origin" value={s.origin} />
              <Field label="Destination" value={s.dest} />
              <Field label="ETA" value={s.eta} />
              <Field label="Weight" value={s.weight} mono />
            </div>

            {/* driver */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <Avatar name={s.driver} status="online" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: 'var(--text-strong)' }}>{s.driver}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)' }}>Assigned driver</div>
              </div>
              <IconButton aria-label="Call" variant="soft"><Icon name="phone" size={17} /></IconButton>
              <IconButton aria-label="Locate" variant="soft"><Icon name="pin" size={17} /></IconButton>
            </div>

            {/* map placeholder */}
            <div style={{ height: 150, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--purple-50), var(--orange-50))', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-muted)' }}>
              <Icon name="map" size={20} color="var(--purple-400)" />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>Live map view</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: 18, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
            <Button variant="outline" fullWidth leftIcon={<Icon name="route" size={16} />}>Reroute</Button>
            <Button fullWidth leftIcon={<Icon name="check" size={16} />}>Mark delivered</Button>
          </div>
        </div>
      </div>
    );
  }

  window.DokaShipmentDetail = ShipmentDetail;
})();
