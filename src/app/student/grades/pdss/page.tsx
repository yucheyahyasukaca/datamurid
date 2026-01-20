'use client'

import React, { useState, useEffect } from 'react'

interface PDSSGrade {
    id: string
    total_semua_mapel: number | null
    total_3_mapel_utama: number | null
    total_mapel_pilihan: number | null
    peringkat: number | null
    tahun_ajaran: string | null
    semester: string | null
    keterangan: string | null
}

export default function StudentPDSSGradesPage() {
    const [pdssData, setPdssData] = useState<PDSSGrade | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

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

            setPdssData(result.grade || null)
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

    if (!pdssData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-panel p-8 max-w-md w-full text-center">
                    <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 className="text-xl font-bold text-white mb-2">Belum Ada Data Nilai PDSS</h3>
                    <p className="text-slate-400">Nilai PDSS Anda belum tersedia.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="glass-panel p-6 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                    </svg>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            Nilai PDSS
                        </h2>
                        {pdssData.tahun_ajaran && (
                            <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-slate-300">
                                {pdssData.tahun_ajaran}
                            </div>
                        )}
                    </div>
                    <p className="text-slate-300 max-w-lg">
                        Akumulasi nilai rapor dari Semester 1 sampai dengan Semester 5.
                        Data ini digunakan untuk seleksi SNBP.
                    </p>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ranking Card */}
                <div className="glass-panel p-6 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent flex items-center justify-between">
                    <div>
                        <p className="text-yellow-400 font-semibold mb-1">Peringkat PDSS</p>
                        <p className="text-xs text-slate-400">Ranking Paralel</p>
                    </div>
                    <div className="text-right">
                        <span className="text-5xl font-bold text-white">
                            #{pdssData.peringkat || '-'}
                        </span>
                    </div>
                </div>

                {/* Total Score Card */}
                <div className="glass-panel p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent flex items-center justify-between">
                    <div>
                        <p className="text-emerald-400 font-semibold mb-1">Total Nilai</p>
                        <p className="text-xs text-slate-400">Semua Mata Pelajaran</p>
                    </div>
                    <div className="text-right">
                        <span className="text-5xl font-bold text-white">
                            {pdssData.total_semua_mapel?.toFixed(1) || '-'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Score Breakdown Cards */}
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-8">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
                Rincian Nilai
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 3 Mapel Utama */}
                <div className="glass-panel p-6 hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">3 Mapel Utama</h4>
                                <p className="text-xs text-slate-400">B.Indo, Mat Umum, B.Ing</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-4">
                        <span className="text-4xl font-bold text-blue-400">
                            {pdssData.total_3_mapel_utama?.toFixed(1) || '-'}
                        </span>
                    </div>
                </div>

                {/* Mapel Pilihan */}
                <div className="glass-panel p-6 hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Mapel Pilihan</h4>
                                <p className="text-xs text-slate-400">Semester 3-5</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-4">
                        <span className="text-4xl font-bold text-purple-400">
                            {pdssData.total_mapel_pilihan?.toFixed(1) || '-'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="glass-panel p-6 border border-white/5 bg-white/5">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <p className="text-sm text-slate-400 mb-1">Semester</p>
                        <p className="text-white font-medium">{pdssData.semester || 'Semester 1-5'}</p>
                    </div>
                    <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                        <p className="text-sm text-slate-400 mb-1">Catatan</p>
                        <p className="text-white">{pdssData.keterangan || '-'}</p>
                    </div>
                </div>
            </div>

        </div>
    )
}
