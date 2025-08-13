"use client";

import React, { useEffect, useState } from "react";

// Convert Go-style duration strings (e.g., "3h52m2.010474413s", "45m13s", "532ms") to a nicer short form
function prettyUptime(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '—';
  // Match all unit-number pairs (h, m, s, ms, us/µs, ns)
  const re = /(\d+(?:\.\d+)?)(h|m|s|ms|us|µs|ns)/g;
  let match: RegExpExecArray | null;
  let totalMs = 0;
  while ((match = re.exec(raw)) !== null) {
    const val = parseFloat(match[1]);
    const unit = match[2];
    if (Number.isNaN(val)) continue;
    switch (unit) {
      case 'h': totalMs += val * 3600000; break;
      case 'm': totalMs += val * 60000; break;
      case 's': totalMs += val * 1000; break;
      case 'ms': totalMs += val; break;
      case 'us':
      case 'µs': totalMs += val / 1000; break;
      case 'ns': totalMs += val / 1_000_000; break;
    }
  }
  if (totalMs <= 0) return raw; // fallback if we couldn't parse

  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!days && (seconds || (!hours && !minutes))) parts.push(`${seconds}s`);

  // Limit to 3 components for readability (e.g., 3h 52m 2s)
  return parts.slice(0, 3).join(' ');
}

const urls = [
  { name: "Frontend", url: "https://wplace.live/" },
  { name: "Backend", url: "https://backend.wplace.live/" },
];

type ServiceState = {
  name: string;
  url: string;
  isDown: boolean;
  downSince: number | null;
  statusCode: number | null;
  responseTime: number;
  dns?: { addresses?: Array<{ address: string; family: number }>; error?: string };
  tls?: { daysRemaining?: number | null; validFrom?: string; validTo?: string; issuer?: string; subject?: string; error?: string };
  health?: { up?: boolean; database?: boolean; uptime?: string };
};

export default function Home() {
  const [status, setStatus] = useState<ServiceState[]>(
    urls.map((u) => ({ ...u, isDown: false, downSince: null, statusCode: null, responseTime: 0 }))
  );
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [daily, setDaily] = useState<Record<string, Array<{ date: string; total: number; up: number; ratio: number | null }>>>({});
  const [history, setHistory] = useState<Record<string, Array<{ timestamp: number; statusCode: number; responseTime: number; isDown: boolean }>>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Persist state (optional UX)
  useEffect(() => {
    const saved = localStorage.getItem("wplace-status");
    if (saved) {
      try {
        setStatus(JSON.parse(saved));
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("wplace-status", JSON.stringify(status));
  }, [status]);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(urls),
        cache: "no-store",
      });
      const data = await res.json();
  const results: Array<{ name: string; url: string; statusCode: number; responseTime: number; isDown: boolean; dns?: { addresses?: Array<{ address: string; family: number }>; error?: string }; tls?: { daysRemaining?: number | null; validFrom?: string; validTo?: string; issuer?: string; subject?: string; error?: string }; health?: { up?: boolean; database?: boolean; uptime?: string } }>
        = data.results || [];
      setStatus((prev) => prev.map((item) => {
        const r = results.find((x) => x.url === item.url);
        if (!r) return item;
        return {
          ...item,
          isDown: r.isDown,
          downSince: r.isDown ? (item.isDown ? item.downSince : Date.now()) : null,
          statusCode: r.statusCode,
          responseTime: r.responseTime,
          dns: r.dns,
          tls: r.tls,
          health: r.health,
        };
      }));
      setLastUpdated(Date.now());
  // fetch daily summary after recording history server-side
      try {
        const params = urls.map(u => `u=${encodeURIComponent(u.url)}`).join('&');
        const dRes = await fetch(`/api/daily?days=30&${params}`, { cache: 'no-store' });
        const dJson = await dRes.json();
        setDaily(dJson.summary || {});
      } catch {}
      // fetch latest history for each url (best-effort)
      try {
        const entries = await Promise.all(urls.map(async (u) => {
          try {
            const hRes = await fetch(`/api/history?url=${encodeURIComponent(u.url)}`, { cache: 'no-store' });
            const hJson = await hRes.json();
            const arr = Array.isArray(hJson.data) ? hJson.data : [];
            return [u.url, arr] as const;
          } catch {
            return [u.url, []] as const;
          }
        }));
        const map: Record<string, Array<{ timestamp: number; statusCode: number; responseTime: number; isDown: boolean }>> = {};
        for (const [k, v] of entries) map[k] = v;
        setHistory(map);
      } catch {}
    } catch {
      setStatus((prev) => prev.map((item) => ({
        ...item,
        isDown: true,
        downSince: item.isDown ? item.downSince : Date.now(),
        statusCode: 0,
        responseTime: 0,
      })));
      // still try to refresh daily squares from any existing history
      try {
        const params = urls.map(u => `u=${encodeURIComponent(u.url)}`).join('&');
        const dRes = await fetch(`/api/daily?days=30&${params}`, { cache: 'no-store' });
        const dJson = await dRes.json();
        setDaily(dJson.summary || {});
      } catch {}
    }
  };

  useEffect(() => {
    const t = setTimeout(() => checkStatus(), 300);
    // Poll every 18s to reduce request volume
    const i = setInterval(() => checkStatus(), 18000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, []);

  const anyDown = status.some((s) => s.isDown);
  // Keep a stable, predictable order for cards (avoid jumping based on latency or status)
  const nameOrder = ["Frontend", "Backend"] as const;
  const fixedOrder = [...status].sort((a, b) => nameOrder.indexOf(a.name as any) - nameOrder.indexOf(b.name as any));

  return (
  <div suppressHydrationWarning data-darkreader-ignore style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e2e8f0", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Nav */}
      <nav style={{
        background: "rgba(10,10,10,0.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "1rem 0", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {/* Spacer to avoid hamburger overlap on small screens */}
              <div className="menu-spacer" style={{ width: 48, height: 1, display: 'none' }} />
              <img src="/icon.png" alt="WPlace" width={32} height={32} style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
              <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>WPlace Status</span>
              <div style={{ background: "linear-gradient(135deg, #059669, #047857)", color: "white", fontSize: 12, fontWeight: 700, padding: "0.25rem 0.5rem", borderRadius: 6, letterSpacing: "0.05em" }}>v1.6</div>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 14, minWidth: 130, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}</div>
          </div>
        </div>
      </nav>

  {/* Terms gate overlay removed per request */}

      {/* Header */}
      <header style={{ textAlign: "center", padding: "2.5rem 2rem 1rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #f1f5f9, #cbd5e1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em" }}>WPlace Status Dashboard</h1>
  <p style={{ marginTop: 10, color: "#94a3b8" }}>Real-time status of WPlace (Response Time and Uptime)</p>
  <div className="header-pills" style={{ marginTop: 12, display: 'inline-flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', minHeight: 44 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: anyDown ? '#ef4444' : '#10b981', background: anyDown ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${anyDown ? 'rgba(248,113,113,0.25)' : 'rgba(16,185,129,0.25)'}`, padding: '0.25rem 0.6rem', borderRadius: 999 }}>
            {anyDown ? 'Service Issues Detected' : 'All Systems Operational'}
          </span>
          {fixedOrder.map(s => (
            <span key={'pill-'+s.url} style={{ fontSize: 12, color: s.isDown ? '#ef4444' : '#10b981', background: s.isDown ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${s.isDown ? 'rgba(248,113,113,0.25)' : 'rgba(16,185,129,0.25)'}`, padding: '0.25rem 0.6rem', borderRadius: 999 }}>
              {s.name}: {s.isDown ? 'Down' : 'Up'}
            </span>
          ))}
          <span style={{ fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.25rem 0.6rem', borderRadius: 999 }}>
            Online: {status.filter(s=>!s.isDown).length}/{status.length}
          </span>
        </div>
      </header>


      {/* Services */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 2rem 2rem" }}>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
          {fixedOrder.map((s) => (
            <div key={s.url} style={{ background: "linear-gradient(135deg, #0d0d0d, #161616)", borderRadius: 12, padding: "1rem 1.1rem", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.25)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.isDown ? "linear-gradient(90deg, #dc2626, #f59e0b)" : "linear-gradient(90deg, #10b981, #3b82f6)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0" }}>{s.name}</h2>
                  <span style={{ fontSize: 12, color: "#9aa7bb", background: "rgba(255,255,255,0.06)", padding: "0.2rem 0.5rem", borderRadius: 6 }}>Server-side Monitor</span>
                </div>
                <div style={{ padding: "0.5rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: 12, color: "white",
                  background: (s.name === 'Backend' && (s as any).health?.up === true) || s.statusCode === 200 ? "linear-gradient(135deg, #059669, #047857)"
                    : s.statusCode === 0 || s.statusCode === 502 || s.statusCode === 503 || (s.statusCode && s.statusCode >= 500) ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                    : s.statusCode && s.statusCode >= 400 ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "linear-gradient(135deg, #6b7280, #4b5563)" }}>
                  {(s.name === 'Backend' && (s as any).health?.up === true) ? "Online"
                    : s.statusCode === 200 ? "Online"
                    : s.statusCode === 404 ? "Not Found"
                    : s.statusCode === 502 ? "Bad Gateway"
                    : s.statusCode === 503 ? "Service Unavailable"
                    : s.statusCode === 0 ? "Connection Failed"
                    : s.statusCode && s.statusCode >= 500 ? "Server Error"
                    : s.statusCode && s.statusCode >= 400 ? "Client Error"
                    : s.statusCode ? "Response OK" : "Checking..."}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <div style={{ background: "rgba(255,255,255,0.06)", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Status Code</span>
                  <span style={{ color: (s.name === 'Backend' && (s as any).health?.up === true) || s.statusCode === 200 ? "#10b981" : s.statusCode === 0 ? "#dc2626" : s.statusCode && s.statusCode < 400 ? "#f59e0b" : s.statusCode ? "#dc2626" : "#64748b", fontSize: 14, fontWeight: 700 }}>
                    {(s.name === 'Backend' && (s as any).health?.up === true) ? "Healthy" : (s.statusCode === 0 ? "Network Error" : s.statusCode ? `HTTP ${s.statusCode}` : "Checking...")}
                  </span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Response Time</span>
                  <span style={{ color: s.responseTime === 0 ? "#64748b" : s.responseTime < 500 ? "#10b981" : s.responseTime < 1000 ? "#f59e0b" : "#dc2626", fontSize: 14, fontWeight: 700 }}>
                    {s.responseTime === 0 ? "Checking..." : `${s.responseTime}ms`}
                  </span>
                </div>
                {/* SSL and DNS boxes removed by request */}
                {/* Backend-only health metrics */}
                {s.name === 'Backend' && (s as any).health && (
                  <>
                    <div style={{ background: "rgba(255,255,255,0.06)", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                      <span style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Database</span>
                      <span style={{ color: (s as any).health?.database ? '#10b981' : '#ef4444', fontSize: 14, fontWeight: 700 }}>
                        {(s as any).health?.database ? 'Connected' : 'Down'}
                      </span>
                    </div>
          <div style={{ background: "rgba(255,255,255,0.06)", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                      <span style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Uptime</span>
                      <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700 }}>
            {prettyUptime((s as any).health?.uptime)}
                      </span>
                    </div>
                  </>
                )}
  {(() => {
    const alert = (s.name === 'Backend' ? !(s as any).health?.up : s.isDown);
    return alert ? (
      <div style={{ background: "rgba(239,68,68,0.12)", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", minHeight: 36 }}>
        ⚠️ Backend currently unreachable{typeof s.downSince === 'number' ? ` • ${Math.floor((Date.now() - s.downSince) / 1000)}s` : ''}
      </div>
    ) : (
      <div style={{ height: 36 }} aria-hidden="true" />
    );
  })()}
                <div style={{ marginLeft: "auto", display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setExpanded(e => ({ ...e, [s.url]: !e[s.url] }))}
                    style={{ background: 'linear-gradient(135deg, #232323, #1a1a1a)', color: '#e5e7eb', fontWeight: 700, border: '1px solid rgba(255,255,255,0.08)', padding: '0.4rem 0.7rem', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}
                    aria-expanded={!!expanded[s.url]}
                  >{expanded[s.url] ? 'Hide details' : 'Details'}</button>
                </div>
              </div>

              {/* Daily Heat Strip (today to 29 days back) */}
              <div style={{ marginTop: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(daily[s.url] || []).map((d, idx) => {
                  // color scale: unknown=gray, 0% up=red, mid=amber, 100%=green. Today first.
                  let bg = '#334155';
                  if (d.ratio === null) bg = '#334155';
                  else if (d.ratio >= 0.99) bg = '#16a34a';
                  else if (d.ratio >= 0.9) bg = '#84cc16';
                  else if (d.ratio >= 0.5) bg = '#f59e0b';
                  else bg = '#ef4444';
                  return (
                    <div key={d.date + idx} title={`${d.date}\n${d.ratio === null ? 'Unknown' : Math.round(d.ratio*100)+'% up'} (${d.up}/${d.total})`}
                      style={{ width: 10, height: 10, borderRadius: 2, background: bg, opacity: d.ratio === null ? 0.5 : 1 }} />
                  )
                })}
              </div>
              {/* 7d & 30d uptime summary */}
              <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {(() => {
                  const arr = daily[s.url] || [];
                  // 7d
                  let up7 = 0, total7 = 0;
                  for (const d of arr.slice(0, 7)) { up7 += d.up; total7 += d.total; }
                  const r7 = total7 > 0 ? up7 / total7 : null;
                  // 30d
                  let up30 = 0, total30 = 0;
                  for (const d of arr) { up30 += d.up; total30 += d.total; }
                  const r30 = total30 > 0 ? up30 / total30 : null;
                  return (
                    <>
                      <span>7d uptime: {r7 === null ? '—' : (r7 * 100).toFixed(r7 >= 0.999 ? 3 : 2) + '%'}</span>
                      <span>30d uptime: {r30 === null ? '—' : (r30 * 100).toFixed(r30 >= 0.999 ? 3 : 2) + '%'}</span>
                    </>
                  );
                })()}
              </div>

              {/* Details panel */}
              {expanded[s.url] && (
                <div style={{ marginTop: 12, padding: '0.9rem 1rem', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr' }}>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Recent Checks</div>
                      <div style={{ color: '#e2e8f0', fontSize: 13 }}>
                        {(history[s.url] || []).length ? (
                          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                            {(history[s.url] || []).slice(-10).reverse().map((h, idx) => (
                              <li key={(h.timestamp || 0) + '-' + idx}>
                                {new Date(h.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                — HTTP {h.statusCode} — {h.responseTime}ms — {h.isDown ? 'DOWN' : 'UP'}
                              </li>
                            ))}
                          </ul>
                        ) : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

  {/* Incidents */}
  <IncidentsSection />

  <footer style={{ textAlign: "center", marginTop: 40, padding: "24px 0", borderTop: "1px solid rgba(255,255,255,0.06)", color: "#8b93a3" }}>
        <p style={{ margin: 0, fontSize: 14 }}>Crafted by <a href="https://guns.lol/izan" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>Izan</a> (<a href="https://discord.com/users/675360310453993473" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>@izanthebestn1</a>) — 2025</p>
        <p style={{ margin: "6px 0 0", fontSize: 14 }}>Built with <span style={{ color: "#3b82f6", fontWeight: 600 }}>Next.js</span> • Designed & developed with <span style={{ color: "#ef4444" }}>❤️</span></p>
        <p style={{ margin: "6px 0 0", fontSize: 14 }}>
          <a href="/terms" style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 600 }}>Terms of Service</a>
        </p>
      </footer>

      <style jsx global>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        /* Show spacer under 640px to prevent hamburger overlap */
        @media (max-width: 640px) {
          .menu-spacer { display: block !important; }
          .header-pills { min-height: 72px !important; }
        }
      `}</style>
    </div>
  );
}

type Inc = {
  id: string;
  title: string;
  description?: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  createdAt: number;
  updatedAt: number;
  affectedUrls?: string[];
};

function IncidentsSection() {
  const [incidents, setIncidents] = React.useState<Inc[]>([]);
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/incidents', { cache: 'no-store' });
        const json = await res.json();
        if (mounted) setIncidents(Array.isArray(json.incidents) ? json.incidents : []);
      } catch {}
    };
    load();
    const i = setInterval(load, 60000);
    return () => { mounted = false; clearInterval(i); };
  }, []);

  const colorFor = (sev: Inc['severity']) => sev === 'critical' ? '#ef4444' : sev === 'major' ? '#f59e0b' : '#10b981';

  return (
    <section style={{ marginTop: 12, padding: '0 2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h3 style={{ margin: '0 0 8px', color: '#e2e8f0', fontSize: '1rem', fontWeight: 700 }}>Incidents</h3>
  <div style={{ background: 'linear-gradient(135deg, #0d0d0d, #161616)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '0.9rem 1rem' }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
            {/* Pinned: Latest official update (from Discord announcements) */}
            <li style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr auto' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#e2e8f0' }}>Official update <span style={{ color: '#94a3b8', fontWeight: 600 }}>(from Discord announcements)</span></span>
                  <span style={{ fontSize: 12, color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)', padding: '0.1rem 0.4rem', borderRadius: 999 }}>major</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', padding: '0.1rem 0.4rem', borderRadius: 999 }}>informational</span>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: 13, marginTop: 4, lineHeight: 1.6 }}>
                  <p style={{ margin: '0 0 6px' }}>Dear community, we've already seen the current Nginx internal server code 500 issue, and we're already working on a solution as quickly as possible. @Wplace and I have been coding non-stop for 24 hours to address all current issues. We addressed the session issue previously, along with minor changes that will help in the future, and we believe it will no longer occur. We migrated the server to higher capacity, and now, when we had a break from the session issue, the current server couldn't handle the number of requests during this peak period.</p>
                  <p style={{ margin: '0 0 6px' }}>We've upgraded our servers four times, and even then, they couldn't handle the number of users we were experiencing. We apologize again for the inconvenience, and we're currently migrating to an environment with even more capacity. Unfortunately, this isn't a quick process, but it will be resolved soon.</p>
                  <p style={{ margin: 0 }}>We will migrate to a multi-server architecture soon, but it's not currently possible because we need to implement changes to our code. We don't plan to keep you waiting any longer. We will now migrate to another provider with greater capacity to gain the breathing room to migrate to a more scalable solution.</p>
                </div>
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'right' }}>Aug 10, 2025 • 16:25 • CX [BAPO]</div>
            </li>
            {(incidents.length === 0) ? (
              <li style={{ color: '#94a3b8', fontSize: 14 }}>No additional incidents reported.</li>
            ) : (
              incidents.map((inc) => (
                <li key={inc.id} style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr auto' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{inc.title}</span>
                      <span style={{ fontSize: 12, color: colorFor(inc.severity), border: `1px solid ${colorFor(inc.severity)}40`, padding: '0.1rem 0.4rem', borderRadius: 999, background: 'transparent' }}>{inc.severity}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', padding: '0.1rem 0.4rem', borderRadius: 999 }}>{inc.status}</span>
                    </div>
                    {inc.description && <div style={{ color: '#cbd5e1', fontSize: 13, marginTop: 4 }}>{inc.description}</div>}
                    {inc.affectedUrls?.length ? (
                      <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Affected: {inc.affectedUrls.join(', ')}</div>
                    ) : null}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'right' }}>
                    Updated {new Date(inc.updatedAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
