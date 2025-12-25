export default function GradesPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] glass-panel p-12 text-center animate-enter">
            <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">Data Nilai</h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto mb-8">
                Fitur ini sedang dalam tahap pengembangan lebih lanjut oleh Tim IT SMA Negeri 1 Pati.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-white/10 text-slate-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Coming Soon
            </div>
        </div>
    )
}
