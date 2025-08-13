"use client";

import React from "react";

type PixelResponse = {
  ok: boolean;
  status?: number;
  data?: any;
  error?: string;
  target?: string;
};

export default function PixelPage() {
  const [a, setA] = React.useState<number | "">(439);
  const [b, setB] = React.useState<number | "">(899);
  const [x, setX] = React.useState<number | "">(68);
  const [y, setY] = React.useState<number | "">(498);
  const [url, setUrl] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [res, setRes] = React.useState<PixelResponse | null>(null);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (!url) return;
    try {
      const u = new URL(url);
      const m = u.pathname.match(/\/(?:s\d+\/)?pixel\/(\d+)\/(\d+)/i);
      if (m) {
        setA(Number(m[1]));
        setB(Number(m[2]));
      }
      const xp = u.searchParams.get('x');
      const yp = u.searchParams.get('y');
      if (xp != null) setX(Number(xp));
      if (yp != null) setY(Number(yp));
      setError("");
    } catch {
      // ignore parse errors; keep manual fields
    }
  }, [url]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (a === '' || b === '' || x === '' || y === '') {
      setError('Please fill a, b, x and y (or paste a valid backend URL).');
      return;
    }
    setLoading(true);
    setRes(null);
    try {
      const r = await fetch('/api/pixel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), a: Number(a), b: Number(b), x: Number(x), y: Number(y) }),
      });
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
            <strong>Pixel Lookup</strong>
          </div>
          <a href="/" style={{ color: '#93c5fd', textDecoration: 'none' }}>Status</a>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        <header style={{ textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #f1f5f9, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Query a Pixel</h1>
          <p style={{ color: '#94a3b8', marginTop: 6 }}>Paste a backend URL or fill a/b/x/y.</p>
        </header>

        <form onSubmit={submit} style={{ display: 'grid', gap: 12, background: 'linear-gradient(135deg, #0d0d0d, #161616)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1rem' }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Paste backend URL (optional)</span>
              <input
                type="url"
                placeholder="https://backend.wplace.live/s0/pixel/439/899?x=68&y=498"
                value={url}
                onChange={(e)=>setUrl(e.target.value)}
                style={{ background: '#0f0f0f', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.55rem' }}
              />
            </label>
            {error && <div style={{ color: '#f87171', fontSize: 13 }}>{error}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>a (path)</span>
              <input type="number" value={a} onChange={(e)=>setA(e.target.value===''? '' : Number(e.target.value))} required placeholder="439" style={{ background: '#111', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.5rem' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>b (path)</span>
              <input type="number" value={b} onChange={(e)=>setB(e.target.value===''? '' : Number(e.target.value))} required placeholder="899" style={{ background: '#111', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.5rem' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>x</span>
              <input type="number" value={x} onChange={(e)=>setX(e.target.value===''? '' : Number(e.target.value))} required placeholder="68" style={{ background: '#111', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.5rem' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>y</span>
              <input type="number" value={y} onChange={(e)=>setY(e.target.value===''? '' : Number(e.target.value))} required placeholder="498" style={{ background: '#111', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.5rem' }} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button disabled={loading} type="submit" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.55rem 0.9rem', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {loading ? 'Fetching…' : 'Lookup Pixel'}
            </button>
            {res?.target && (
              <a href={res.target} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#93c5fd' }}>Open backend URL</a>
            )}
          </div>
        </form>

        {/* Result */}
        <section style={{ marginTop: 16 }}>
          {!res ? (
            <div style={{ color: '#94a3b8', fontSize: 14 }}>No query yet. Fill the form above and click Lookup.</div>
          ) : (
            <div style={{ background: 'linear-gradient(135deg, #0d0d0d, #161616)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ color: res.ok ? '#10b981' : '#ef4444' }}>{res.ok ? 'Success' : 'Failed'}</strong>
                {typeof res.status === 'number' && (
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>HTTP {res.status}</span>
                )}
              </div>
              {res.error ? (
                <div style={{ color: '#fca5a5' }}>{res.error}</div>
              ) : (
                <ResultView data={res.data} />
              )}
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

function Badge({ children, tone = 'neutral' as 'neutral' | 'green' | 'red' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'red' }) {
  const map = {
    neutral: { bg: 'rgba(255,255,255,0.06)', fg: '#cbd5e1', br: '1px solid rgba(255,255,255,0.1)' },
    green: { bg: 'rgba(16,185,129,0.15)', fg: '#10b981', br: '1px solid rgba(16,185,129,0.25)' },
    red: { bg: 'rgba(239,68,68,0.15)', fg: '#ef4444', br: '1px solid rgba(248,113,113,0.25)' },
  } as const;
  const s = map[tone];
  return <span style={{ fontSize: 12, padding: '0.2rem 0.5rem', borderRadius: 999, background: s.bg, color: s.fg, border: s.br }}>{children}</span>;
}

function ResultView({ data }: { data: any }) {
  if (!data || typeof data !== 'object') {
    return <div style={{ color: '#94a3b8' }}>No data.</div>;
  }

  const paintedBy = (data as any).paintedBy || {};
  const region = (data as any).region || {};
  const allianceName = paintedBy.allianceName || paintedBy.alliance || '';

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Badge tone="neutral">Pixel: {String((data as any)?.x ?? '?')}, {String((data as any)?.y ?? '?')}</Badge>
        {region?.name && (
          <Badge tone="neutral">{region.name} #{region.number ?? ''}</Badge>
        )}
        {region?.countryId && (
          <Badge tone="neutral">Country: {region.countryId}</Badge>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ color: '#94a3b8' }}>Painted by:</span>
        <Badge tone="neutral">{paintedBy?.name ?? 'Unknown'}</Badge>
        {paintedBy?.id != null && <Badge tone="neutral">#{paintedBy.id}</Badge>}
        {allianceName && <Badge tone="green">{allianceName}</Badge>}
        {paintedBy?.discord && <Badge tone="neutral">{paintedBy.discord}</Badge>}
      </div>

      <pre style={{ margin: 0, padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0', overflowX: 'auto' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
