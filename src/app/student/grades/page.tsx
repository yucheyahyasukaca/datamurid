'use client'

import { useRouter } from 'next/navigation'

export default function StudentGradesMenuPage() {
    const router = useRouter()

    const gradeTypes = [
        {
            id: 'tka',
            title: 'Nilai TKA',
            subtitle: 'Tes Kemampuan Akademik',
            description: 'Lihat hasil tes kemampuan akademik kamu',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            ),
            gradient: 'from-blue-600 to-indigo-600',
            bgGlow: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            hoverGlow: 'group-hover:bg-blue-500/20'
        },
        {
            id: 'pdss',
            title: 'Nilai PDSS',
            subtitle: 'Penelusuran Data Siswa Sekolah',
            description: 'Lihat nilai rapor dan prestasi kamu',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
            ),
            gradient: 'from-purple-600 to-pink-600',
            bgGlow: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
            hoverGlow: 'group-hover:bg-purple-500/20'
        }
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-3">
                    Data Nilai Saya
                </h2>
                <p className="text-slate-400 text-sm md:text-base">
                    Pilih jenis nilai yang ingin kamu lihat
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {gradeTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => router.push(`/student/grades/${type.id}`)}
                        className="group relative glass-panel p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 text-left overflow-hidden"
                    >
                        {/* Background Glow Effect */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${type.bgGlow} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${type.hoverGlow} transition-all duration-300`}></div>

                        {/* Icon */}
                        <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                            <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
                            <div className="relative text-white">
                                {type.icon}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative">
                            <h3 className="text-2xl font-bold text-white mb-1">
                                {type.title}
                            </h3>
                            <p className="text-sm text-slate-400 mb-3 font-medium">
                                {type.subtitle}
                            </p>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {type.description}
                            </p>
                        </div>

                        {/* Arrow Icon */}
                        <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>

                        {/* Decorative Border */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${type.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    </button>
                ))}
            </div>

            {/* Info Card */}
            <div className="max-w-4xl mx-auto glass-panel p-6 rounded-xl border border-white/5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-1">Informasi</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Nilai TKA adalah hasil tes kemampuan akademik yang kamu ikuti. Nilai PDSS mencakup rapor dan prestasi akademik selama bersekolah.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
