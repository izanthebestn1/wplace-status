export default function Alicante() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] px-4">
      <h1
        className="text-white text-center mb-10 drop-shadow-2xl"
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
      <div className="flex flex-col items-center gap-6 mt-2">
        <span className="text-white text-xl font-semibold text-center" style={{fontFamily: 'Montserrat, Arial, Helvetica, sans-serif'}}>
          Únete al servidor de Discord de <span className="font-bold text-[#00c3ff]">Wplace Alicante</span>!
        </span>
        <a
          href="https://discord.gg/NXYSNuscXR"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 rounded-full bg-gradient-to-r from-[#00c3ff] to-[#ffff1c] text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-200"
        >
          Unirse a Discord 🚀
        </a>
      </div>
    </div>
  );
}
