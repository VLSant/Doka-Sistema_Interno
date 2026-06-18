import React from 'react';

/**
 * Doka ProgressTracker — horizontal stepper for a shipment journey.
 * `steps`: [{label, sub?}]. `current` = index of the active step (0-based).
 * Completed steps fill orange; the active step pulses subtly.
 */
export function ProgressTracker({ steps = [], current = 0, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', ...style }}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const reached = done || active;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none', width: 96, textAlign: 'center' }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--brand-primary)' : active ? 'var(--surface-card)' : 'var(--neutral-100)',
                border: active ? '2px solid var(--brand-primary)' : done ? '2px solid var(--brand-primary)' : '2px solid var(--border-default)',
                color: done ? '#fff' : active ? 'var(--brand-primary)' : 'var(--text-subtle)',
                boxShadow: active ? '0 0 0 4px var(--orange-50)' : 'none',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              }}>
                {done
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  : i + 1}
              </span>
              <span style={{ marginTop: 8, fontFamily: 'var(--font-sans)', fontWeight: reached ? 700 : 600, fontSize: 'var(--text-xs)', color: reached ? 'var(--text-strong)' : 'var(--text-subtle)' }}>{step.label}</span>
              {step.sub && <span style={{ marginTop: 2, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{step.sub}</span>}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: 'var(--neutral-200)', marginTop: 13, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, width: i < current ? '100%' : '0%', background: 'var(--brand-primary)', borderRadius: 2, transition: 'width var(--dur-slow) var(--ease-standard)' }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
