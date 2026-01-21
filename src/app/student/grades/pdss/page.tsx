'use client'

import React, { useState, useEffect } from 'react'

interface PDSSGrade {
    id: string
    total_semua_mapel: number | null
    total_3_mapel_utama: number | null
    total_mapel_pilihan: number | null
    peringkat: number | null
    status: string | null
    tahun_ajaran: string | null
    semester: string | null
    keterangan: string | null
}

interface Student {
    id: string
    nama: string
    nisn: string
    rombel: string
}

export default function StudentPDSSGradesPage() {
    const [pdssData, setPdssData] = useState<PDSSGrade | null>(null)
    const [studentData, setStudentData] = useState<Student | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [hasData, setHasData] = useState(false)

    useEffect(() => {
        fetchPDSSGrades()
    }, [])

    const fetchPDSSGrades = async () => {
        try {
            setLoading(true)
            const nisn = localStorage.getItem('student_nisn')

            if (!nisn) {
                setError('NISN tidak ditemukan. Silakan login ulang.')
                return
            }

            const res = await fetch(`/api/students/grades/pdss?nisn=${nisn}`)
            const result = await res.json()

            if (!res.ok) throw new Error(result.error || 'Failed to fetch PDSS grades')

            if (result.has_data) {
                setPdssData(result.grade)
                setStudentData(result.student)
                setHasData(true)
            } else {
                setPdssData(null)
                setStudentData(result.student) // Still get student info if possible
                setHasData(false)
            }
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
                    <p className="text-slate-400">Memuat data nilai PDSS...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-panel p-8 max-w-md w-full text-center border-red-500/20">
                    <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Data</h3>
                    <p className="text-slate-400">{error}</p>
                </div>
            </div>
        )
    }

    // Determine Status Color
    const getStatusColor = (status: string | null) => {
        if (!status) return 'text-slate-400 border-slate-500/50 bg-slate-500/10'

        switch (status) {
            case 'Eligible':
                return 'text-green-400 border-green-500/50 bg-green-500/10'
            case 'Tidak Eligible':
                // Safe color: Blue or Orange. User said "not red".
                return 'text-blue-400 border-blue-500/50 bg-blue-500/10'
            case 'Mengundurkan Diri':
                // Neutral/Action color.
                return 'text-slate-300 border-slate-500/50 bg-slate-500/10'
            default:
                return 'text-slate-400 border-slate-500/50 bg-slate-500/10'
        }
    }

    if (!hasData || !pdssData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-panel p-8 max-w-md w-full text-center">
                    <div className="mb-6 opacity-50">
                        <svg className="w-20 h-20 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Belum Diumumkan</h3>
                    <p className="text-slate-400 mb-6">
                        Data PDSS Anda belum tersedia atau belum dipublikasikan oleh sekolah.
                        Silakan cek kembali secara berkala.
                    </p>
                    {studentData && (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-sm">
                            <p className="text-slate-300"><span className="text-slate-500 block text-xs uppercase mb-1">Login Sebagai</span> {studentData.nama}</p>
                            <p className="text-slate-400 font-mono mt-1">{studentData.nisn}</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const statusColor = getStatusColor(pdssData.status)

    return (
        <div className="space-y-4 pb-4">
            <div className="glass-panel p-4 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.115 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                    </svg>
                </div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                                Nilai PDSS
                            </h2>
                            <p className="text-slate-300 text-xs">
                                Hasil Pemeringkatan Siswa (Eligibel SNBP)
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {pdssData.status && (
                                <div className={`px-3 py-1 rounded-full font-bold border text-xs uppercase tracking-wider ${statusColor}`}>
                                    {pdssData.status === 'Eligible' ? 'Eligibel' :
                                        pdssData.status === 'Tidak Eligible' ? 'Tidak Eligibel' :
                                            pdssData.status}
                                </div>
                            )}
                            {pdssData.tahun_ajaran && (
                                <div className="text-[10px] text-slate-400">
                                    TA {pdssData.tahun_ajaran}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Student Info Card */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex flex-col md:flex-row gap-3 md:items-center">
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Nama Siswa</p>
                            <p className="text-white font-semibold text-sm max-w-xs md:max-w-none truncate" title={studentData?.nama}>{studentData?.nama || '-'}</p>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">NISN</p>
                            <p className="text-white font-mono text-sm">{studentData?.nisn || '-'}</p>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Kelas</p>
                            <p className="text-white text-sm">{studentData?.rombel || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Score Card */}
            <div className="glass-panel p-4 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent flex items-center justify-between group hover:border-emerald-500/50 transition-all">
                <div>
                    <p className="text-emerald-400 font-bold mb-0.5 group-hover:text-emerald-300 transition-colors text-sm">Total Nilai</p>
                    <p className="text-[10px] text-slate-400">Semua Mata Pelajaran</p>
                </div>
                <div>
                    <span className="text-4xl font-bold text-white">
                        {pdssData.total_semua_mapel?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>

            {/* Score Breakdown Cards */}
            <h3 className="text-base font-bold text-white flex items-center gap-2 mt-4">
                <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
                Rincian Nilai
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 3 Mapel Utama */}
                <div className="glass-panel p-4 hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm">3 Mapel Utama</h4>
                                <p className="text-[10px] text-slate-400">B.Indo, Mat Umum, B.Ing</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <span className="text-3xl font-bold text-blue-400">
                            {pdssData.total_3_mapel_utama?.toFixed(1) || '-'}
                        </span>
                    </div>
                </div>

                {/* Mapel Pilihan */}
                <div className="glass-panel p-4 hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm">Mapel Pilihan</h4>
                                <p className="text-[10px] text-slate-400">Semester 3-5</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <span className="text-3xl font-bold text-purple-400">
                            {pdssData.total_mapel_pilihan?.toFixed(1) || '-'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Keterangan / Message Alert */}
            {pdssData.keterangan && (
                <div className={`rounded-xl p-4 border ${pdssData.status === 'Eligible' ? 'bg-green-500/10 border-green-500/20 text-green-200' : 'bg-blue-500/10 border-blue-500/20 text-blue-200'} flex items-start gap-3`}>
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Pesan / Catatan Sekolah</p>
                        <p className="text-sm font-medium leading-relaxed">{pdssData.keterangan}</p>
                    </div>
                </div>
            )}

            {/* Ranking Card */}
            <div className="glass-panel p-4 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent flex items-center justify-between group hover:border-yellow-500/50 transition-all">
                <div>
                    <p className="text-yellow-400 font-bold group-hover:text-yellow-300 transition-colors text-sm">Peringkat PDSS</p>
                </div>
                <div>
                    <span className="text-4xl font-black text-white drop-shadow-lg">
                        #{pdssData.peringkat || '-'}
                    </span>
                </div>
            </div>

            {/* Important Note about PDSS Ranking */}
            <div className="rounded-xl p-4 border bg-amber-500/10 border-amber-500/20 text-amber-200 flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">Catatan Penting</p>
                    <p className="text-sm font-medium leading-relaxed">
                        Peringkat PDSS berdasarkan jumlah nilai yang diunggah di PDSS tanpa menggunakan nilai mapel Bahasa Daerah semester 1 s.d. 5.
                    </p>
                </div>
            </div>

        </div>
    )
}

