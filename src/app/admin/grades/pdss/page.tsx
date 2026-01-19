export default function AdminPdssGradesPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] glass-panel p-12 text-center rounded-2xl border border-white/10">
            <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] border border-purple-500/20">
                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
            </div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-3">
                Manajemen Nilai PDSS
            </h2>
            <p className="text-slate-400 text-lg max-w-md mb-8">
                Fitur manajemen nilai PDSS sedang dalam tahap pengembangan. Anda akan dapat mengelola data rapor dan prestasi siswa di sini.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-white/10 text-slate-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                Coming Soon
            </div>
        </div>
    )
}
