import Link from 'next/link'
import Image from 'next/image'
import ChatWidget from '@/components/ChatWidget'

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">

      {/* Modern Dynamic Background - Aurora & Mesh Gradients */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Deep Space Base */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black opacity-80"></div>

        {/* Animated Blobs / Aurora Effect */}
        <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen animate-blob filter brightness-110 opacity-60"></div>
        <div className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] bg-indigo-600/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000 filter brightness-110 opacity-60"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[45vw] h-[45vw] bg-blue-600/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-4000 filter brightness-110 opacity-60"></div>

        {/* Subtle Grain Texture for texture */}
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>

        {/* Grid Pattern with fade out */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] mask-image-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center text-center py-12 px-4 md:px-0">

        {/* Hero Section */}
        <div className="space-y-10 animate-fade-in-up">

          {/* Logo with Glow */}
          <div className="mb-8 flex justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full scale-110"></div>
            <div className="relative transform transition-transform duration-500 hover:scale-105 will-change-transform">
              <Image
                src="/sman1pati.png"
                alt="Logo SMAN 1 Pati"
                width={180}
                height={180}
                className="relative drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                priority
              />
            </div>
          </div>

          <div className="space-y-6 w-full mx-auto">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-sm select-none py-6 pb-8">
              SMA Negeri 1 Pati
            </h1>

            <p className="text-lg md:text-2xl text-slate-400 font-light max-w-3xl mx-auto leading-relaxed tracking-wide">
              Portal digital terpadu untuk <span className="text-slate-200 font-medium">manajemen data siswa</span> dan <span className="text-slate-200 font-medium">administrasi sekolah modern</span>.
            </p>
          </div>

          {/* Main CTA Button */}
          <div className="pt-10 pb-16 flex flex-col items-center gap-6">
            <Link href="/login" className="group relative inline-flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-500/30 rounded-full transition-transform active:scale-95">
              {/* Button Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>

              {/* Button Content */}
              <div className="relative flex items-center gap-4 bg-slate-950 text-white px-10 py-5 md:px-12 md:py-6 rounded-full font-bold text-lg md:text-xl border border-white/10 hover:bg-slate-900 transition-all duration-300">
                <span>Masuk Aplikasi</span>
                <div className="bg-white/10 rounded-full p-1 group-hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </div>
              </div>
            </Link>

            <p className="text-slate-500 text-xs md:text-sm font-medium tracking-widest uppercase opacity-60">
              Sistem Informasi Akademik Terintegrasi
            </p>
          </div>

        </div>

        {/* Footer info */}
        <div className="absolute bottom-4 left-0 right-0 text-center opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-slate-500 text-xs font-medium">
            &copy; {new Date().getFullYear()} Tim IT SMAN 1 Pati. Built with ❤️ for Students.
          </p>
        </div>

      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />

    </main>
  )
}
