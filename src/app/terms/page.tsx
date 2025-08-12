export default function Terms() {
  const sectionStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0d0d0d, #161616)',
    borderRadius: 12,
    padding: '1rem 1.25rem',
  border: '1px solid rgba(255,255,255,0.06)'
  }

  return (
  <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e2e8f0', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <nav style={{
    background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '1rem 0', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/icon.png" alt="WPlace" width={28} height={28} style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover' }} />
          <a href="/" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>WPlace Status</a>
          <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 12 }}>Last updated: 2025-08-12</span>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12, background: 'linear-gradient(135deg, #f1f5f9, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Terms of Service
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 20 }}>
          These Terms of Service ("Terms") govern your use of this status page (the "Service"). By accessing or using the Service, you agree to these Terms.
        </p>

        <div style={{ display: 'grid', gap: 12 }}>
          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>1. Non-affiliation</h2>
            <p style={{ color: '#cbd5e1' }}>
              This is not an official <a href="https://wplace.live/" target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>wplace.live</a> page. <b>wplace.live</b> owns the rights to its trademarks and icons. All trademarks are the property of their respective owners.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>2. Purpose and scope</h2>
            <p style={{ color: '#cbd5e1' }}>
              The Service provides general availability information for selected endpoints. It is provided for convenience only and is not guaranteed to be accurate, complete, or available at all times.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>3. Acceptable use</h2>
            <ul style={{ color: '#cbd5e1', margin: 0, paddingLeft: '1.2rem' }}>
              <li>Do not attempt to disrupt or overload monitored services.</li>
              <li>Do not use the Service to misrepresent affiliation, sponsorship, or endorsement.</li>
              <li>Respect third-party terms and applicable laws.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>4. No warranties</h2>
            <p style={{ color: '#cbd5e1' }}>
              The Service is provided "as is" and "as available" without warranties of any kind, express or implied. Use at your own risk.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>5. Limitation of liability</h2>
            <p style={{ color: '#cbd5e1' }}>
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or revenues, arising from your use of the Service.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>6. Intellectual property</h2>
            <p style={{ color: '#cbd5e1' }}>
              Except for third-party marks and assets as noted, the Service’s code and content are © 2025 Izan. All rights reserved.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>7. Changes</h2>
            <p style={{ color: '#cbd5e1' }}>
              We may update these Terms from time to time. Material changes will be indicated by updating the “Last updated” date above.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>8. Contact</h2>
            <p style={{ color: '#cbd5e1' }}>
              For questions regarding these Terms, contact: <a href="https://guns.lol/izan" target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }}>guns.lol/izan</a>.
            </p>
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
