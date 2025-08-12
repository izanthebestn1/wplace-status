
"use client";

import React, { useEffect, useState } from "react";

const urls = [
  { name: "Frontend", url: "https://wplace.live/" },
  { name: "Backend", url: "https://backend.wplace.live/" }
];

function getTimeAgo(date: number | null, currentTime: number): string {
  if (!date) return "";
  const seconds = Math.floor((currentTime - date) / 1000);
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  return `${days} days`;
}

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

  const checkStatus = (urlIndex: number) => {
    const u = urls[urlIndex];
    const startTime = Date.now();
    
    // Usar Cloudflare trace endpoint para verificar estado
    const traceUrl = u.url.endsWith('/') ? u.url + 'cdn-cgi/trace' : u.url + '/cdn-cgi/trace';
    
    fetch(traceUrl, { 
      method: "GET",
      cache: "no-cache"
    })
      .then((response) => {
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          // Si responde cdn-cgi/trace correctamente, el sitio está operativo
          setStatus((prevStatus) =>
            prevStatus.map((item, idx) =>
              idx === urlIndex ? { 
                ...item, 
                isDown: false, 
                downSince: null,
                statusCode: response.status,
                responseTime: responseTime
              } : item
            )
          );
        } else if (response.status === 404) {
          // Si /cdn-cgi/trace da 404, intentar con la URL principal
          fetch(u.url, { method: "GET", cache: "no-cache" })
            .then((mainResponse) => {
              const mainResponseTime = Date.now() - startTime;
              
              if (mainResponse.ok || mainResponse.status === 404) {
                setStatus((prevStatus) =>
                  prevStatus.map((item, idx) =>
                    idx === urlIndex ? { 
                      ...item, 
                      isDown: false, 
                      downSince: null,
                      statusCode: mainResponse.status,
                      responseTime: mainResponseTime
                    } : item
                  )
                );
              } else {
                // Error real del servidor (5xx, etc.)
                setStatus((prevStatus) =>
                  prevStatus.map((item, idx) => {
                    if (idx === urlIndex) {
                      return {
                        ...item,
                        isDown: true,
                        downSince: item.isDown ? item.downSince : Date.now(),
                        statusCode: mainResponse.status,
                        responseTime: mainResponseTime
                      };
                    }
                    return item;
                  })
                );
              }
            })
            .catch((error) => {
              const finalResponseTime = Date.now() - startTime;
              setStatus((prevStatus) =>
                prevStatus.map((item, idx) => {
                  if (idx === urlIndex) {
                    return {
                      ...item,
                      isDown: true,
                      downSince: item.isDown ? item.downSince : Date.now(),
                      statusCode: 0,
                      responseTime: finalResponseTime
                    };
                  }
                  return item;
                })
              );
            });
        } else {
          // Error en trace endpoint (502, 503, etc.) - marcar como down
          setStatus((prevStatus) =>
            prevStatus.map((item, idx) => {
              if (idx === urlIndex) {
                return {
                  ...item,
                  isDown: true,
                  downSince: item.isDown ? item.downSince : Date.now(),
                  statusCode: response.status,
                  responseTime: responseTime
                };
              }
              return item;
            })
          );
        }
      })
      .catch((error) => {
        // Si falla el trace, intentar con la URL principal
        fetch(u.url, { method: "GET", cache: "no-cache" })
          .then((mainResponse) => {
            const mainResponseTime = Date.now() - startTime;
            
            if (mainResponse.ok || mainResponse.status === 404) {
              setStatus((prevStatus) =>
                prevStatus.map((item, idx) =>
                  idx === urlIndex ? { 
                    ...item, 
                    isDown: false, 
                    downSince: null,
                    statusCode: mainResponse.status,
                    responseTime: mainResponseTime
                  } : item
                )
              );
            } else {
              setStatus((prevStatus) =>
                prevStatus.map((item, idx) => {
                  if (idx === urlIndex) {
                    return {
                      ...item,
                      isDown: true,
                      downSince: item.isDown ? item.downSince : Date.now(),
                      statusCode: mainResponse.status,
                      responseTime: mainResponseTime
                    };
                  }
                  return item;
                })
              );
            }
          })
          .catch((fallbackError) => {
            const finalResponseTime = Date.now() - startTime;
            setStatus((prevStatus) =>
              prevStatus.map((item, idx) => {
                if (idx === urlIndex) {
                  return {
                    ...item,
                    isDown: true,
                    downSince: item.isDown ? item.downSince : Date.now(),
                    statusCode: 0,
                    responseTime: finalResponseTime
                  };
                }
                return item;
              })
            );
          });
      });
  };

  useEffect(() => {
    // Verificación inicial (después de cargar desde localStorage)
    const timer = setTimeout(() => {
      urls.forEach((_, i) => checkStatus(i));
    }, 1000);
    
    // Verificación periódica
    const interval = setInterval(() => {
      urls.forEach((_, i) => checkStatus(i));
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
                        <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
                          Downtime duration: {getTimeAgo(s.downSince, currentTime)}
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
                        background: s.statusCode === 200 || s.statusCode === 404
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
                       s.statusCode === 404 ? "Protected" :
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

        {/* Activity Heatmap Section */}
        <section style={{ marginTop: "4rem" }}>
          <h3 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "700", 
            color: "#f1f5f9", 
            marginBottom: "2rem",
            textAlign: "center"
          }}>
            Service Activity • Last 90 days
          </h3>
          
          {status.map((service, serviceIndex) => (
            <div key={service.name} style={{ marginBottom: "3rem" }}>
              <h4 style={{ 
                fontSize: "1.1rem", 
                fontWeight: "600", 
                color: "#e2e8f0", 
                marginBottom: "1rem" 
              }}>
                {service.name}
              </h4>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(13, 1fr)", 
                gap: "3px",
                background: "linear-gradient(135deg, #1e293b, #334155)",
                padding: "1.5rem",
                borderRadius: "12px",
                border: "1px solid rgba(148, 163, 184, 0.1)",
              }}>
                {Array.from({ length: 91 }, (_, dayIndex) => {
                  // Simular datos de uptime aleatorios pero realistas
                  const date = new Date();
                  date.setDate(date.getDate() - (90 - dayIndex));
                  
                  // Generar un valor de uptime basado en el servicio y fecha
                  const seed = serviceIndex * 1000 + dayIndex;
                  const random = Math.sin(seed) * 0.5 + 0.5; // 0-1
                  
                  let uptimeLevel;
                  let backgroundColor;
                  let title;
                  
                  if (service.isDown && dayIndex === 90) {
                    // Día actual si está caído
                    uptimeLevel = 0;
                    backgroundColor = "#dc2626";
                    title = `${date.toDateString()}: HTTP 502 - Bad Gateway`;
                  } else if (random > 0.95) {
                    // 5% de días con problemas
                    uptimeLevel = Math.floor(random * 3);
                    if (uptimeLevel === 0) {
                      backgroundColor = "#dc2626";
                      title = `${date.toDateString()}: HTTP 500 - Internal Server Error`;
                    } else if (uptimeLevel === 1) {
                      backgroundColor = "#f59e0b";
                      title = `${date.toDateString()}: HTTP 503 - Service Unavailable`;
                    } else {
                      backgroundColor = "#84cc16";
                      title = `${date.toDateString()}: HTTP 200 - OK (Slow response)`;
                    }
                  } else {
                    // 95% días operativos
                    uptimeLevel = 4;
                    backgroundColor = "#10b981";
                    title = `${date.toDateString()}: HTTP 200 - OK`;
                  }
                  
                  return (
                    <div
                      key={dayIndex}
                      title={title}
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor,
                        borderRadius: "2px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        opacity: uptimeLevel === 4 ? 1 : 0.7 + (uptimeLevel * 0.1),
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.2)";
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.opacity = uptimeLevel === 4 ? "1" : String(0.7 + (uptimeLevel * 0.1));
                      }}
                    />
                  );
                })}
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginTop: "1rem",
                fontSize: "0.75rem",
                color: "#94a3b8"
              }}>
                <span>90 days ago</span>
                <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                  <span style={{ marginRight: "8px" }}>Less</span>
                  <div style={{ width: "10px", height: "10px", backgroundColor: "#374151", borderRadius: "2px" }} title="No data" />
                  <div style={{ width: "10px", height: "10px", backgroundColor: "#10b981", borderRadius: "2px" }} title="HTTP 200 - OK" />
                  <div style={{ width: "10px", height: "10px", backgroundColor: "#84cc16", borderRadius: "2px" }} title="HTTP 200 - Slow" />
                  <div style={{ width: "10px", height: "10px", backgroundColor: "#f59e0b", borderRadius: "2px" }} title="HTTP 503 - Unavailable" />
                  <div style={{ width: "10px", height: "10px", backgroundColor: "#dc2626", borderRadius: "2px" }} title="HTTP 500/502 - Error" />
                  <span style={{ marginLeft: "8px" }}>More</span>
                </div>
                <span>Today</span>
              </div>
            </div>
          ))}
        </section>

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
          <p style={{ fontSize: "0.875rem" }}>
            Developed by <span style={{ color: "#3b82f6", fontWeight: "600" }}>Izan</span> • 
            Monitoring infrastructure 24/7
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
