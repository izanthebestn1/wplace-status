"use client";

import React, { useEffect, useState } from "react";

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
};

export default function Home() {
  const [status, setStatus] = useState<ServiceState[]>(
    urls.map((u) => ({ ...u, isDown: false, downSince: null, statusCode: null, responseTime: 0 }))
  );
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [daily, setDaily] = useState<Record<string, Array<{ date: string; total: number; up: number; ratio: number | null }>>>({});

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
  const results: Array<{ name: string; url: string; statusCode: number; responseTime: number; isDown: boolean; tls?: { daysRemaining?: number | null } }>
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
          // keep tls days for quick display
          // @ts-ignore
          tls: r.tls
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
    } catch {
      setStatus((prev) => prev.map((item) => ({
        ...item,
        isDown: true,
        downSince: item.isDown ? item.downSince : Date.now(),
        statusCode: 0,
        responseTime: 0,
      })));
    }
  };

  useEffect(() => {
    const t = setTimeout(() => checkStatus(), 500);
    const i = setInterval(() => checkStatus(), 30000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, []);

  const anyDown = status.some((s) => s.isDown);
  const sorted = [...status].sort((a, b) => Number(b.isDown) - Number(a.isDown) || (b.responseTime - a.responseTime));

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1c", color: "#e2e8f0", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Nav */}
      <nav style={{
        background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
        padding: "1rem 0", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <img src="/favicon.png" alt="WPlace" width={32} height={32} style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
              <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>WPlace Status</span>
              <div style={{ background: "linear-gradient(135deg, #059669, #047857)", color: "white", fontSize: 12, fontWeight: 700, padding: "0.25rem 0.5rem", borderRadius: 6, letterSpacing: "0.05em" }}>v1.6</div>
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}</div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header style={{ textAlign: "center", padding: "2.5rem 2rem 1rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #f1f5f9, #cbd5e1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em" }}>WPlace Status Dashboard</h1>
        <p style={{ marginTop: 10, color: "#94a3b8" }}>Real-time status of WPlace</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "0.75rem 1.25rem", background: anyDown ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "linear-gradient(135deg, #059669, #047857)", color: "white", borderRadius: 10, fontWeight: 700, marginTop: 14 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.9)", animation: anyDown ? "none" : "pulse 2s infinite" }} />
          {anyDown ? "Service Issues Detected" : "All Systems Operational"}
        </div>
      </header>

      {/* Services */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 2rem 2rem" }}>
        <div style={{ display: "grid", gap: "1rem" }}>
          {sorted.map((s) => (
            <div key={s.url} style={{ background: "linear-gradient(135deg, #0b1220, #172036)", borderRadius: 12, padding: "1.1rem 1.25rem", border: "1px solid rgba(148,163,184,0.1)", position: "relative", overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.25)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.isDown ? "linear-gradient(90deg, #dc2626, #f59e0b)" : "linear-gradient(90deg, #10b981, #3b82f6)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0" }}>{s.name}</h2>
                  <span style={{ fontSize: 12, color: "#7c8aa0", background: "rgba(148,163,184,0.08)", padding: "0.2rem 0.5rem", borderRadius: 6 }}>Server-side Monitor</span>
                </div>
                <div style={{ padding: "0.5rem 1rem", borderRadius: 8, fontWeight: 700, fontSize: 12, color: "white",
                  background: s.statusCode === 200 ? "linear-gradient(135deg, #059669, #047857)"
                    : s.statusCode === 0 || s.statusCode === 502 || s.statusCode === 503 || (s.statusCode && s.statusCode >= 500) ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                    : s.statusCode && s.statusCode >= 400 ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "linear-gradient(135deg, #6b7280, #4b5563)" }}>
                  {s.statusCode === 200 ? "Online"
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
                <div style={{ background: "rgba(148,163,184,0.08)", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)" }}>
                  <span style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Status Code</span>
                  <span style={{ color: s.statusCode === 200 ? "#10b981" : s.statusCode === 0 ? "#dc2626" : s.statusCode && s.statusCode < 400 ? "#f59e0b" : s.statusCode ? "#dc2626" : "#64748b", fontSize: 14, fontWeight: 700 }}>
                    {s.statusCode === 0 ? "Network Error" : s.statusCode ? `HTTP ${s.statusCode}` : "Checking..."}
                  </span>
                </div>
                <div style={{ background: "rgba(148,163,184,0.08)", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)" }}>
                  <span style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>Response Time</span>
                  <span style={{ color: s.responseTime === 0 ? "#64748b" : s.responseTime < 500 ? "#10b981" : s.responseTime < 1000 ? "#f59e0b" : "#dc2626", fontSize: 14, fontWeight: 700 }}>
                    {s.responseTime === 0 ? "Checking..." : `${s.responseTime}ms`}
                  </span>
                </div>
                {'tls' in s && (s as any).tls && typeof (s as any).tls?.daysRemaining !== 'undefined' && (
                  <div style={{ background: "rgba(148,163,184,0.08)", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)" }}>
                    <span style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>SSL</span>
                    <span style={{ color: ((s as any).tls?.daysRemaining ?? 0) > 14 ? "#10b981" : ((s as any).tls?.daysRemaining ?? 0) > 3 ? "#f59e0b" : "#dc2626", fontSize: 14, fontWeight: 700 }}>
                      {typeof (s as any).tls?.daysRemaining === 'number' ? `${(s as any).tls?.daysRemaining} days left` : 'Unknown'}
                    </span>
                  </div>
                )}
                {s.isDown && (
                  <div style={{ background: "rgba(239,68,68,0.12)", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                    ⚠️ Service disruption detected
                  </div>
                )}
                <div style={{ marginLeft: "auto" }}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Visit Service →</a>
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
            </div>
          ))}
        </div>
      </main>

      {/* Quick Stats */}
      <section style={{ marginTop: 24, padding: "0 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div style={{ background: "linear-gradient(135deg, #0b1220, #172036)", padding: 18, borderRadius: 12, border: "1px solid rgba(148,163,184,0.1)" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981", marginBottom: 6 }}>{status.filter((s) => !s.isDown).length}/{status.length}</div>
              <div style={{ color: "#94a3b8", fontSize: 14 }}>Services Online</div>
            </div>
            <div style={{ background: "linear-gradient(135deg, #0b1220, #172036)", padding: 18, borderRadius: 12, border: "1px solid rgba(148,163,184,0.1)" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", marginBottom: 6 }}>30s</div>
              <div style={{ color: "#94a3b8", fontSize: 14 }}>Check Interval</div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ textAlign: "center", marginTop: 40, padding: "24px 0", borderTop: "1px solid rgba(148, 163, 184, 0.1)", color: "#64748b" }}>
        <p style={{ margin: 0, fontSize: 14 }}>© 2025 <a href="https://guns.lol/izan" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>Izan</a>. All rights reserved.</p>
        <p style={{ margin: "6px 0 0", fontSize: 14 }}>Built with <span style={{ color: "#3b82f6", fontWeight: 600 }}>Next.js</span> • Designed & developed with <span style={{ color: "#ef4444" }}>❤️</span></p>
      </footer>

      <style jsx global>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
