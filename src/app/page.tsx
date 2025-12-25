import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-pattern">
      <div className="glass-panel p-8 md:p-12 max-w-lg w-full text-center fade-in">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-600 mb-2">
            Data Murid
          </h1>
          <p className="text-gray-600">
            Sistem Pencatatan dan Validasi Data Siswa
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/admin" className="group">
            <div className="p-6 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/50 transition-all cursor-pointer h-full flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                A
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Admin</h3>
                <p className="text-sm text-blue-700/80">Input & Kelola Data</p>
              </div>
            </div>
          </Link>

          <Link href="/student" className="group">
            <div className="p-6 rounded-xl border border-pink-100 bg-pink-50/50 hover:bg-pink-100/50 transition-all cursor-pointer h-full flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                S
              </div>
              <div>
                <h3 className="text-lg font-semibold text-pink-900">Murid</h3>
                <p className="text-sm text-pink-700/80">Cek & Validasi Data</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            © 2025 Sekolah Mawar Indah. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  )
}
