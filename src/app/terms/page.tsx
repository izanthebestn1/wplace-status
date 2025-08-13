export default function Terms() {
  const sectionStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0d0d0d, #161616)',
    borderRadius: 12,
    padding: '1rem 1.25rem',
  border: '1px solid rgba(255,255,255,0.06)'
  }

  return (
  <div suppressHydrationWarning data-darkreader-ignore style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e2e8f0', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <nav style={{
    background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '1rem 0', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="menu-spacer" style={{ width: 48, height: 1, display: 'none' }} />
          <img src="/icon.png" alt="WPlace" width={28} height={28} style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover' }} />
          <a href="/" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>WPlace Status</a>
          <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 12 }}>Last updated: 2025-08-13</span>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12, background: 'linear-gradient(135deg, #f1f5f9, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Terms of Service</h1>
        <p style={{ color: '#94a3b8', marginBottom: 20 }}>These Terms govern your use of this independent status and tools site (the "Service"). By using it, you accept these Terms.</p>

        <div style={{ display: 'grid', gap: 12 }}>
          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>1) Non‑affiliation and third‑party terms</h2>
            <p style={{ color: '#cbd5e1' }}>This Service is not affiliated with, sponsored by, or endorsed by <a href="https://wplace.live/" target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>wplace.live</a> or its operators. Their trademarks, logos, and content remain the property of their respective owners and are referenced only nominatively.</p>
            <p style={{ color: '#cbd5e1', marginTop: 8 }}>You must comply with the terms, policies, and rate limits of any third‑party service you interact with (including wplace.live). If these Terms ever conflict with third‑party terms, the third‑party terms prevail for your use of their services.</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>2) Purpose and scope</h2>
            <p style={{ color: '#cbd5e1' }}>This Service shows status information and provides utility lookups (e.g., pixel data) strictly for informational, non‑commercial use. Information may be cached briefly and may be inaccurate, delayed, or incomplete.</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>3) Acceptable use and limits</h2>
            <ul style={{ color: '#cbd5e1', margin: 0, paddingLeft: '1.2rem' }}>
              <li>Do not disrupt, scrape at high rates, or overload any third‑party service.</li>
              <li>Automated use must respect robots, rate limits, and fair‑use policies of third parties.</li>
              <li>Do not misrepresent affiliation, sponsorship, or endorsement.</li>
              <li>We may throttle, block, or disable features to protect third parties or comply with requests.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>4) Intermediary/proxy and caching</h2>
            <p style={{ color: '#cbd5e1' }}>Some tools act as a passive proxy to third‑party endpoints and may temporarily cache responses to improve performance. We do not modify third‑party data. Upon verified request from a rightsholder, we will clear caches and disable affected functionality.</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>5) Intellectual property of third parties</h2>
            <p style={{ color: '#cbd5e1' }}>All third‑party content displayed via the Service is the property of its owners. Use of names/logos is nominative fair use for identification. We will address takedown requests that are reasonable and properly documented.</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>6) Privacy and logs</h2>
            <p style={{ color: '#cbd5e1' }}>We do not sell personal data. Minimal technical logs may be kept (e.g., IP, timestamps, errors) to operate and secure the Service. If third‑party responses include public profile information (e.g., names or alliances), we display what their API returns.</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>7) No warranties</h2>
            <p style={{ color: '#cbd5e1' }}>The Service is provided “as is” and “as available,” without warranties of any kind. Use at your own risk.</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>8) Limitation of liability</h2>
            <p style={{ color: '#cbd5e1' }}>To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for your use of third‑party services contrary to their terms.</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>9) Changes and suspension</h2>
            <p style={{ color: '#cbd5e1' }}>We may modify or suspend features at any time, including to comply with third‑party requests or policies.</p>
          </section>

          {/* Section 10 removed per request */}

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>10) Takedown requests</h2>
            <p style={{ color: '#cbd5e1' }}>If you are a rightsholder or service operator and believe any feature or content here infringes your rights or terms, contact us with details and proof of authority. We will review promptly and, if appropriate, remove or disable access.</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>11) Ownership of this site</h2>
            <p style={{ color: '#cbd5e1' }}>Except for third‑party assets as noted, this site’s code and original content are © 2025 Izan. All rights reserved.</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>12) Contact</h2>
            <p style={{ color: '#cbd5e1' }}>For questions or requests, contact: <a href="https://guns.lol/izan" target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>guns.lol/izan</a>.</p>
          </section>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href="/" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>← Back to Status</a>
        </div>
      </main>

  <footer style={{ textAlign: 'center', marginTop: 10, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#8b93a3' }}>
        <p style={{ margin: 0, fontSize: 14 }}>© 2025 <a href="https://guns.lol/izan" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Izan</a>. All rights reserved.</p>
      </footer>
    </div>
  )
}
