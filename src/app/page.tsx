import Link from 'next/link'
import Image from 'next/image'
import ChatWidget from '@/components/ChatWidget'

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 bg-[#030712] text-white selection:bg-blue-500 selection:text-white">

      {/* Dynamic Background Blobs */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDuration: '20s' }} />
      <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" style={{ animationDuration: '20s' }} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Radial Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#030712]/80"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center py-12">

        {/* Hero Section */}
        <div className="space-y-8 animate-enter px-4">

          <div className="mb-8 flex justify-center relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
            <Image
              src="/sman1pati.png"
              alt="Logo SMAN 1 Pati"
              width={160}
              height={160}
              className="relative drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400 drop-shadow-sm py-6">
              SMA Negeri 1 Pati
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
              Portal digital terpadu untuk manajemen data siswa dan administrasi sekolah modern.
            </p>
          </div>

          {/* Single Main CTA Button */}
          <div className="pt-8 pb-12">
            <Link href="/login" className="group relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-600 rounded-full blur opacity-40 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative flex items-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-full font-bold text-lg md:text-xl hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl">
                <span>Masuk Aplikasi</span>
                <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </div>
            </Link>
          </div>

        </div>

        {/* Footer info */}
        <div className="absolute bottom-4 md:bottom-8 left-0 right-0 text-center">
          <p className="text-slate-600 text-xs md:text-sm font-medium">
            &copy; {new Date().getFullYear()} Tim IT SMAN 1 Pati. All rights reserved.
          </p>
        </div>

      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />

    </main>
  )
}
