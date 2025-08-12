
"use client";

import React, { useEffect, useState } from "react";

const urls = [
  { name: "Frontend", url: "https://wplace.live/" },
  { name: "Backend", url: "https://backend.wplace.live/" }
];

export default function Home() {
  const [status, setStatus] = useState<{ 
    name: string; 
    url: string; 
    isDown: boolean; 
    downSince: number | null;
    statusCode: number | null;
    responseTime: number;
  }[]>(
    urls.map((u) => ({ 
      ...u, 
      downSince: null, 
      isDown: false, 
      statusCode: null, 
      responseTime: 0 
    }))
  );
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Actualizar el tiempo actual cada segundo para que el contador funcione
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Cargar estado desde localStorage al inicializar
  useEffect(() => {
    const savedStatus = localStorage.getItem('wplace-status');
    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus);
        setStatus(parsed);
      } catch (e) {
        console.log('Error loading saved status');
      }
    }
  }, []);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('wplace-status', JSON.stringify(status));
  }, [status]);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(urls),
        cache: 'no-store'
      })
      const data = await res.json()
      const results: Array<{ name: string; url: string; statusCode: number; responseTime: number; isDown: boolean }> = data.results || []
      setStatus((prev) => prev.map((item) => {
        const r = results.find((x) => x.url === item.url)
        if (!r) return item
        return {
          ...item,
          isDown: r.isDown,
          downSince: r.isDown ? (item.isDown ? item.downSince : Date.now()) : null,
          statusCode: r.statusCode,
          responseTime: r.responseTime,
        }
      }))
    } catch (e) {
      // fallback: marcar todos como caída temporal
      setStatus((prev) => prev.map((item) => ({
        ...item,
        isDown: true,
        downSince: item.isDown ? item.downSince : Date.now(),
        statusCode: 0,
        responseTime: 0,
      })))
    }
  };

  useEffect(() => {
    // Verificación inicial (después de cargar desde localStorage)
    const timer = setTimeout(() => {
      checkStatus();
    }, 1000);
    
    // Verificación periódica
    const interval = setInterval(() => {
  checkStatus();
    }, 30000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1c",
        color: "#e2e8f0",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Navigation Bar */}
      <nav style={{
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
        padding: "1rem 0",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "white",
              }}>
                W
              </div>
              <span style={{ fontSize: "1.25rem", fontWeight: "600" }}>WPlace Status</span>
              <div style={{
                background: "linear-gradient(135deg, #059669, #047857)",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "600",
                padding: "0.25rem 0.5rem",
                borderRadius: "6px",
                letterSpacing: "0.05em",
              }}>
                v1.5
              </div>
            </div>
                        <div style={{ fontSize: "0.875rem", color: "#94a3b8", textAlign: "right" }}>
              <div>Last updated: Today at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
        {/* Hero Section */}
        <header style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "800",
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #f1f5f9, #cbd5e1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.025em",
            }}
          >
            WPlace Status Dashboard
          </h1>
          <p style={{ fontSize: "1.25rem", color: "#94a3b8", marginBottom: "2rem" }}>
            Real-time status of WPlace
          </p>
          
          {/* Overall Status Indicator */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 2rem",
              background: status.some(s => s.isDown) 
                ? "linear-gradient(135deg, #dc2626, #b91c1c)" 
                : "linear-gradient(135deg, #059669, #047857)",
              color: "white",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "1.1rem",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.9)",
              animation: status.some(s => s.isDown) ? "none" : "pulse 2s infinite",
            }} />
            {status.some(s => s.isDown) 
              ? "Service Issues Detected" 
              : "All Systems Operational"}
          </div>
        </header>

        {/* Services Grid */}
        <main>
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {status.map((s, i) => (
              <div
                key={s.url}
                style={{
                  background: "linear-gradient(135deg, #1e293b, #334155)",
                  borderRadius: "16px",
                  padding: "2rem",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)";
                }}
              >
                {/* Gradient Overlay */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: s.isDown 
                    ? "linear-gradient(90deg, #dc2626, #f59e0b)" 
                    : "linear-gradient(90deg, #10b981, #3b82f6)",
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
                      <h2
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "700",
                          color: "#f1f5f9",
                          margin: 0,
                        }}
                      >
                        {s.name}
                      </h2>
                      <div style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        background: "rgba(148, 163, 184, 0.1)",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                      }}>
                        HTTP Monitor
                      </div>
                    </div>
                    
                    {/* Response Details */}
                    <div style={{ 
                      display: "flex", 
                      gap: "1rem", 
                      marginBottom: "1rem",
                      flexWrap: "wrap"
                    }}>
                      <div style={{
                        background: "rgba(148, 163, 184, 0.1)",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(148, 163, 184, 0.2)"
                      }}>
                        <span style={{ 
                          color: "#94a3b8", 
                          fontSize: "0.75rem", 
                          display: "block",
                          marginBottom: "0.25rem"
                        }}>
                          Status Code
                        </span>
                        <span style={{ 
                          color: s.statusCode === 200 ? "#10b981" : 
                                s.statusCode === 0 ? "#dc2626" :
                                s.statusCode && s.statusCode < 400 ? "#f59e0b" :
                                s.statusCode ? "#dc2626" : "#64748b",
                          fontSize: "1rem",
                          fontWeight: "600"
                        }}>
                          {s.statusCode === 0 ? "Network Error" : 
                           s.statusCode ? `HTTP ${s.statusCode}` : 
                           "Checking..."}
                        </span>
                      </div>
                      
                      <div style={{
                        background: "rgba(148, 163, 184, 0.1)",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(148, 163, 184, 0.2)"
                      }}>
                        <span style={{ 
                          color: "#94a3b8", 
                          fontSize: "0.75rem", 
                          display: "block",
                          marginBottom: "0.25rem"
                        }}>
                          Response Time
                        </span>
                        <span style={{ 
                          color: s.responseTime === 0 ? "#64748b" :
                                s.responseTime < 500 ? "#10b981" : 
                                s.responseTime < 1000 ? "#f59e0b" : "#dc2626",
                          fontSize: "1rem",
                          fontWeight: "600"
                        }}>
                          {s.responseTime === 0 ? "Checking..." : `${s.responseTime}ms`}
                        </span>
                      </div>
                    </div>
                    
                    {s.isDown && (
                      <div style={{ marginBottom: "1rem" }}>
                        <p style={{ color: "#f87171", fontSize: "1rem", margin: "0 0 0.5rem 0", fontWeight: "500" }}>
                          ⚠️ Service disruption detected
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
                    <div
                      style={{
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                        background: s.statusCode === 200
                          ? "linear-gradient(135deg, #059669, #047857)" 
                          : s.statusCode === 0 || s.statusCode === 502 || s.statusCode === 503 || (s.statusCode && s.statusCode >= 500)
                          ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                          : s.statusCode && s.statusCode >= 400
                          ? "linear-gradient(135deg, #f59e0b, #d97706)"
                          : "linear-gradient(135deg, #6b7280, #4b5563)",
                        color: "white",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {s.statusCode === 200 ? "Online" : 
                       s.statusCode === 404 ? "Not Found" :
                       s.statusCode === 502 ? "Bad Gateway" :
                       s.statusCode === 503 ? "Service Unavailable" :
                       s.statusCode === 0 ? "Connection Failed" :
                       s.statusCode && s.statusCode >= 500 ? "Server Error" :
                       s.statusCode && s.statusCode >= 400 ? "Client Error" :
                       s.statusCode ? "Response OK" : "Checking..."}
                    </div>
                    
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#3b82f6",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#60a5fa"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#3b82f6"}
                    >
                      Visit Service →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Statistics Section */}
        <section style={{ marginTop: "4rem", textAlign: "center" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "2rem",
            marginBottom: "3rem"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #1e293b, #334155)",
              padding: "2rem",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.1)",
            }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981", marginBottom: "0.5rem" }}>
                {status.filter(s => !s.isDown).length}/{status.length}
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Services Online</div>
            </div>
            
            <div style={{
              background: "linear-gradient(135deg, #1e293b, #334155)",
              padding: "2rem",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.1)",
            }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "0.5rem" }}>
                99.9%
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Uptime SLA</div>
            </div>
            
            <div style={{
              background: "linear-gradient(135deg, #1e293b, #334155)",
              padding: "2rem",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.1)",
            }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b", marginBottom: "0.5rem" }}>
                30s
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Check Interval</div>
            </div>
          </div>
        </section>

        <footer style={{ 
          textAlign: "center", 
          marginTop: "4rem", 
          paddingTop: "2rem",
          borderTop: "1px solid rgba(148, 163, 184, 0.1)",
          color: "#64748b" 
        }}>
          <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            © 2025 <span style={{ color: "#3b82f6", fontWeight: "600" }}>Izan</span>. All rights reserved.
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            Built with <span style={{ color: "#3b82f6", fontWeight: "600" }}>Next.js</span> • 
            Designed & developed with <span style={{ color: "#ef4444" }}>❤️</span>
          </p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
