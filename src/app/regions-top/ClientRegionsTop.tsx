"use client";

import React from 'react';

// Global regions leaderboard item
type RegionItem = {
  id: number;
  name: string;
  cityId?: number;
  number?: number;
  countryId?: number;
  pixelsPainted?: number;
};

type ApiResp = { ok: boolean; status?: number; data?: RegionItem[]; error?: string; target?: string };

export default function ClientRegionsTop() {
  const [loading, setLoading] = React.useState(false);
  const [res, setRes] = React.useState<ApiResp | null>(null);
  const rows = Array.isArray(res?.data) ? res!.data : [];

  const fetchRegions = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setRes(null);
    try {
      const r = await fetch('/api/regions-top', { cache: 'no-store' });
      const j = await r.json();
      setRes(j);
    } catch (e: any) {
      setRes({ ok: false, error: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning data-darkreader-ignore style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e2e8f0', fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <nav style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="menu-spacer" style={{ width: 48, height: 1, display: 'none' }} />
            <img src="/icon.png" alt="WPlace" width={28} height={28} style={{ width: 28, height: 28, borderRadius: 8 }} />
            <strong>Regions Leaderboard</strong>
          </div>
          <a href="/region-top" style={{ color: '#93c5fd', textDecoration: 'none' }}>Region players</a>
        </div>
      </nav>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
        <header style={{ textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #f1f5f9, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Top regions (global)</h1>
          <p style={{ color: '#94a3b8', marginTop: 6 }}>Aggregated global regions leaderboard fetched from the backend.</p>
        </header>

        <form onSubmit={fetchRegions} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <button disabled={loading} type="submit" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.55rem 0.9rem', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            {loading ? 'Loading…' : 'Fetch Regions Top'}
          </button>
          {res?.target && <a href={res.target} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#93c5fd' }}>Open backend URL</a>}
        </form>

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
            {rows.length === 0 ? (
              <div style={{ color: '#94a3b8' }}>No data.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>#</th>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Region</th>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Number</th>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Country</th>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Pixels</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id + '-' + i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '8px' }}>{i + 1}</td>
                      <td style={{ padding: '8px' }}>{r.name}</td>
                      <td style={{ padding: '8px' }}>{r.number ?? '—'}</td>
                      <td style={{ padding: '8px' }}>{r.countryId ?? '—'}</td>
                      <td style={{ padding: '8px' }}>{r.pixelsPainted ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <pre style={{ marginTop: 10, padding: '0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0', overflowX: 'auto' }}>{JSON.stringify(res?.data ?? [], null, 2)}</pre>
          </div>
        )}

        <footer style={{ textAlign: 'center', marginTop: 40, color: '#8b93a3' }}>
          <a href="/terms" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a>
        </footer>
      </main>
    </div>
  );
}
