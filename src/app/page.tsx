import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 bg-slate-950 text-white selection:bg-orange-500 selection:text-white">

      {/* Dynamic Background Blobs - Slower & Larger */}
      <div className="absolute top-0 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/20 rounded-full blur-[80px] md:blur-[120px] mix-blend-screen animate-blob" style={{ animationDuration: '10s' }} />
      <div className="absolute bottom-0 right-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-orange-600/20 rounded-full blur-[80px] md:blur-[120px] mix-blend-screen animate-blob animation-delay-2000" style={{ animationDuration: '10s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-purple-600/10 rounded-full blur-[100px] md:blur-[140px] mix-blend-screen animate-blob animation-delay-4000" style={{ animationDuration: '12s' }} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" style={{ opacity: 0.08 }}></div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center text-center py-8 md:py-20">

        {/* Hero Section - Responsive Spacing */}
        <div className="space-y-8 md:space-y-10 animate-enter mb-12 md:mb-24 px-2">
          <div className="mb-8 flex justify-center">
            <Image
              src="/sman1pati.png"
              alt="Logo SMAN 1 Pati"
              width={120}
              height={120}
              className="drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-3 md:space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-extrabold tracking-tight leading-snug bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent drop-shadow-2xl py-6">
              SMA Negeri 1 Pati
            </h1>

            <p className="text-lg md:text-3xl text-slate-400 font-light max-w-3xl mx-auto leading-relaxed px-4">
              <span className="text-orange-400 font-normal border-b border-orange-500/30 pb-1">Jl. P. Sudirman No. 24 Pati</span>
            </p>
            <p className="text-sm md:text-lg text-slate-500 font-light mt-2 md:mt-4">
              Pusat Layanan Data Terpadu & Verifikasi Siswa Digital
            </p>
          </div>
        </div>

        {/* Action Cards - Grid for Desktop, Stack for Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full max-w-xl md:max-w-4xl perspective-1000 mb-12 md:mb-20 px-4">

          {/* Admin Card */}
          <Link href="/admin" className="group h-full">
            <div className="relative h-full p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-white/5 bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.08] transition-all duration-500 ease-out transform group-hover:-translate-y-2 md:group-hover:-translate-y-3 group-hover:shadow-[0_20px_40px_rgba(59,130,246,0.2)] flex flex-col items-center text-center gap-6 md:gap-8 overflow-hidden group-hover:border-blue-500/30">

              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/0 via-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-transparent transition-all duration-700" />

              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-900/50 to-slate-900 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-2xl shadow-blue-900/20 group-hover:scale-110 group-hover:shadow-blue-500/20 transition-all duration-500">
                <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>

              <div className="relative z-10 space-y-2 md:space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">Admin Portal</h3>
                <p className="text-slate-400 text-sm md:text-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                  Kelola sistem, verifikasi siswa, dan manajemen data terpusat.
                </p>
              </div>

              <div className="mt-auto opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500 md:delay-100">
                <span className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 rounded-full bg-blue-500/10 text-blue-300 font-medium text-xs md:text-sm border border-blue-500/20">
                  Masuk Sistem &rarr;
                </span>
              </div>
            </div>
          </Link>

          {/* Student Card */}
          <Link href="/student" className="group h-full">
            <div className="relative h-full p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-white/5 bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.08] transition-all duration-500 ease-out transform group-hover:-translate-y-2 md:group-hover:-translate-y-3 group-hover:shadow-[0_20px_40px_rgba(249,115,22,0.2)] flex flex-col items-center text-center gap-6 md:gap-8 overflow-hidden group-hover:border-orange-500/30">

              <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/0 via-orange-600/0 to-orange-600/0 group-hover:from-orange-600/10 group-hover:to-transparent transition-all duration-700" />

              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-900/50 to-slate-900 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-2xl shadow-orange-900/20 group-hover:scale-110 group-hover:shadow-orange-500/20 transition-all duration-500">
                <svg className="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
              </div>

              <div className="relative z-10 space-y-2 md:space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-orange-300 transition-colors">Portal Siswa</h3>
                <p className="text-slate-400 text-sm md:text-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                  Cek validitas data diri, unduh laporan, dan update profil.
                </p>
              </div>

              <div className="mt-auto opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500 md:delay-100">
                <span className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 rounded-full bg-orange-500/10 text-orange-300 font-medium text-xs md:text-sm border border-orange-500/20">
                  Akses Data &rarr;
                </span>
              </div>
            </div>
          </Link>

        </div>

        {/* Footer info */}
        <div className="text-center pt-8 text-slate-600 text-xs md:text-sm font-medium animate-enter delay-200 border-t border-white/5 w-full max-w-xl">
          <p>&copy; 2025 SMA Negeri 1 Pati. Developed by Tim IT SMAN 1 Pati.</p>
        </div>
      </div>
    </main>
  )
}
