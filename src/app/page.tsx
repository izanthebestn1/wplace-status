
"use client";

import React, { useEffect, useState } from "react";

const urls = [
  { name: "Backend", url: "https://backend.wplace.live/" },
  { name: "Frontend", url: "https://wplace.live/" }
];

function getTimeAgo(date: number | null): string {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  return `${days} days`;
}

export default function Home() {
  const [status, setStatus] = useState<{ name: string; url: string; isDown: boolean; downSince: number | null }[]>(
    urls.map((u) => ({ ...u, downSince: null, isDown: false }))
  );

  useEffect(() => {
    urls.forEach((u, i) => {
      fetch(u.url, { method: "HEAD" })
        .then(() => {
          setStatus((s) =>
            s.map((item, idx) =>
              idx === i ? { ...item, isDown: false, downSince: null } : item
            )
          );
        })
        .catch(() => {
          setStatus((s) =>
            s.map((item, idx) => {
              if (idx === i) {
                return item.isDown
                  ? item
                  : { ...item, isDown: true, downSince: Date.now() };
              }
              return item;
            })
          );
        });
    });
    const interval = setInterval(() => {
      urls.forEach((u, i) => {
        fetch(u.url, { method: "HEAD" })
          .then(() => {
            setStatus((s) =>
              s.map((item, idx) =>
                idx === i ? { ...item, isDown: false, downSince: null } : item
              )
            );
          })
          .catch(() => {
            setStatus((s) =>
              s.map((item, idx) => {
                if (idx === i) {
                  return item.isDown
                    ? item
                    : { ...item, isDown: true, downSince: Date.now() };
                }
                return item;
              })
            );
          });
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "2rem",
          fontWeight: "bold",
          letterSpacing: "1px",
        }}
      >
        Service Status
      </h1>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {status.map((s, i) => (
          <div
            key={s.url}
            style={{
              background: "#222",
              borderRadius: "1rem",
              padding: "2rem",
              minWidth: "250px",
              boxShadow: "0 0 20px #0008",
              textAlign: "center",
              border: s.isDown ? "2px solid #f55" : "2px solid #0f5",
            }}
          >
            <h2
              style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}
            >
              {s.name}
            </h2>
            <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
              {s.isDown ? "❌ Down" : "✅ Online"}
            </p>
            {s.isDown && (
              <p style={{ color: "#f55", fontSize: "1rem", marginBottom: "1rem" }}>
                Down for {getTimeAgo(s.downSince)}
              </p>
            )}
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#09f",
                textDecoration: "underline",
                marginTop: "1rem",
                display: "inline-block",
                fontWeight: "500",
              }}
            >
              Go to {s.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
