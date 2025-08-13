"use client";

import React from 'react';

type Leader = {
  userId: number;
  name: string;
  equippedFlag?: number;
  pixelsPainted?: number;
  lastLatitude?: number;
  lastLongitude?: number;
  discord?: string;
};

type ApiResp = { ok: boolean; status?: number; data?: Leader[]; error?: string; target?: string };

export default function AlliancePage() {
  const [id, setId] = React.useState<string>("170136");
  const [range, setRange] = React.useState<'today' | 'week' | 'month'>("today");
  const [loading, setLoading] = React.useState(false);
  const [res, setRes] = React.useState<ApiResp | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRes(null);
    try {
      const r = await fetch(`/api/alliance?id=${encodeURIComponent(id)}&range=${encodeURIComponent(range)}`, { cache: 'no-store' });
      const j = await r.json();
      setRes(j);
    } catch (e: any) {
      setRes({ ok: false, error: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  };

  const leaders = Array.isArray(res?.data) ? res!.data : [];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e2e8f0', fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <nav style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/icon.png" alt="WPlace" width={28} height={28} style={{ width: 28, height: 28, borderRadius: 8 }} />
            <strong>Alliance Leaderboard</strong>
          </div>
          <a href="/" style={{ color: '#93c5fd', textDecoration: 'none' }}>Status</a>
        </div>
      </nav>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
        <header style={{ textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #f1f5f9, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Query Alliance Leaderboard</h1>
          <p style={{ color: '#94a3b8', marginTop: 6 }}>Enter an alliance id to fetch the current leaderboard from the backend.</p>
        </header>

        <form onSubmit={submit} style={{ display: 'grid', gap: 12, background: 'linear-gradient(135deg, #0d0d0d, #161616)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Alliance ID</span>
              <input type="text" value={id} onChange={(e)=>setId(e.target.value)} placeholder="170136" required style={{ background: '#111', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.5rem' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Range</span>
              <select value={range} onChange={(e)=>setRange(e.target.value as any)} style={{ background: '#111', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.5rem' }}>
                <option value="today">today</option>
                <option value="week">week</option>
                <option value="month">month</option>
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button disabled={loading} type="submit" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.55rem 0.9rem', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {loading ? 'Loading…' : 'Fetch Leaderboard'}
            </button>
            {res?.target && <a href={res.target} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#93c5fd' }}>Open backend URL</a>}
          </div>
        </form>

        <section style={{ marginTop: 16 }}>
          {!res ? (
            <div style={{ color: '#94a3b8', fontSize: 14 }}>No query yet.</div>
          ) : res.error ? (
            <div style={{ color: '#f87171', fontSize: 14 }}>{res.error}</div>
          ) : (
            <div style={{ background: 'linear-gradient(135deg, #0d0d0d, #161616)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong style={{ color: res.ok ? '#10b981' : '#ef4444' }}>{res.ok ? 'Success' : 'Failed'}</strong>
                {typeof res.status === 'number' && <span style={{ fontSize: 12, color: '#94a3b8' }}>HTTP {res.status}</span>}
              </div>
              {leaders.length === 0 ? (
                <div style={{ color: '#94a3b8' }}>No data.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>#</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>User</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Discord</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Pixels</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Last Lat</th>
                      <th style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Last Lng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaders.map((p, i) => (
                      <tr key={p.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '8px' }}>{i + 1}</td>
                        <td style={{ padding: '8px' }}>{p.name} <span style={{ color: '#64748b' }}>#{p.userId}</span></td>
                        <td style={{ padding: '8px' }}>{p.discord ?? '—'}</td>
                        <td style={{ padding: '8px' }}>{p.pixelsPainted ?? 0}</td>
                        <td style={{ padding: '8px' }}>{p.lastLatitude?.toFixed ? p.lastLatitude.toFixed(6) : '—'}</td>
                        <td style={{ padding: '8px' }}>{p.lastLongitude?.toFixed ? p.lastLongitude.toFixed(6) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <pre style={{ marginTop: 10, padding: '0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0', overflowX: 'auto' }}>{JSON.stringify(res.data, null, 2)}</pre>
            </div>
          )}
        </section>

        <footer style={{ textAlign: 'center', marginTop: 40, color: '#8b93a3' }}>
          <a href="/terms" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a>
        </footer>
      </main>
    </div>
  );
}
