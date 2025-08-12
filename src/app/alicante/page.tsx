export default function Alicante() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-6 py-14">
        {/* Columna izquierda: texto y CTA */}
        <div className="flex flex-col items-center md:items-start">
          <h1
            className="text-white text-center md:text-left mb-6 drop-shadow-2xl"
            style={{
              fontFamily: 'Montserrat, Arial, Helvetica, sans-serif',
              fontSize: '7vw',
              fontWeight: 900,
              letterSpacing: '-2px',
              textTransform: 'uppercase',
              background: 'linear-gradient(90deg, #00c3ff 0%, #ffff1c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 8px 32px rgba(0,0,0,0.7)',
            }}
          >
            ¡Hola!
          </h1>
          <span
            className="text-white text-xl font-semibold text-center md:text-left"
            style={{ fontFamily: 'Montserrat, Arial, Helvetica, sans-serif' }}
          >
            Únete al servidor de Discord de <span className="font-bold text-[#00c3ff]">Wplace Alicante</span>!
          </span>
          <a
            href="https://discord.gg/NXYSNuscXR"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block px-8 py-4 rounded-full bg-gradient-to-r from-[#00c3ff] to-[#ffff1c] text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-200"
          >
            Unirse a Discord 🚀
          </a>
        </div>

        {/* Columna derecha: widget */}
        <div className="justify-self-center md:justify-self-end">
          <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <iframe
              src="https://discord.com/widget?id=1404763764238319616&theme=dark"
              width="350"
              height="500"
              style={{ border: '0', borderRadius: 12, width: '350px', height: '500px' }}
              frameBorder={0}
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
