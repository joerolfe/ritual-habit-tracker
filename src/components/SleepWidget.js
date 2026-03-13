import React, { useState } from 'react';

function calcDuration(bedtime, wake) {
  if (!bedtime || !wake) return null;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ''}`;
}

export default function SleepWidget({ dateKey, sleep, onSetSleep }) {
  const [showModal, setShowModal] = useState(false);
  const entry = sleep[dateKey] || {};
  const duration = calcDuration(entry.bedtime, entry.wake);

  const update = (field, val) => {
    onSetSleep(dateKey, { ...entry, [field]: val });
  };

  return (
    <>
      <div
        className="sleep-widget"
        onClick={() => setShowModal(true)}
        style={{ cursor: 'pointer' }}
      >
        <div className="sleep-header">
          <span className="widget-label">SLEEP</span>
          <span style={{ fontSize: 16 }}>🌙</span>
        </div>
        <div className="sleep-duration" style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 4 }}>
          {duration || 'Not set'}
        </div>
        <span style={{ fontSize: 11, color: '#888888', marginTop: 'auto' }}>Tap to log</span>
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)', zIndex: 500,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#111111', borderRadius: '20px 20px 0 0',
              padding: 24, width: '100%', maxWidth: 480,
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 20 }}>🌙 Sleep Log</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bedtime</label>
                <input
                  type="time"
                  className="sleep-time-input"
                  value={entry.bedtime || ''}
                  onChange={e => update('bedtime', e.target.value)}
                  style={{ background: '#1A1A1A', border: 'none', borderRadius: 12, padding: '12px 14px', fontSize: 20, fontWeight: 700, color: '#fff', width: '100%', textAlign: 'center', colorScheme: 'dark', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <span style={{ color: '#555', fontSize: 18, fontWeight: 300 }}>→</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wake up</label>
                <input
                  type="time"
                  className="sleep-time-input"
                  value={entry.wake || ''}
                  onChange={e => update('wake', e.target.value)}
                  style={{ background: '#1A1A1A', border: 'none', borderRadius: 12, padding: '12px 14px', fontSize: 20, fontWeight: 700, color: '#fff', width: '100%', textAlign: 'center', colorScheme: 'dark', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
            </div>
            {duration && (
              <div style={{ textAlign: 'center', fontSize: 15, color: '#00BCD4', fontWeight: 600, marginBottom: 16 }}>
                {duration} sleep logged ✓
              </div>
            )}
            <button
              onClick={() => setShowModal(false)}
              style={{ width: '100%', background: '#00BCD4', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, color: '#000', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
