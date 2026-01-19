'use client'

import React, { useState, useEffect } from 'react'

interface TKAGrade {
    id: string
    bahasa_indonesia_nilai: number | null
    bahasa_indonesia_kategori: string | null
    matematika_nilai: number | null
    matematika_kategori: string | null
    bahasa_inggris_nilai: number | null
    bahasa_inggris_kategori: string | null
    total_wajib: number | null
    mapel_pilihan_1: string | null
    mapel_pilihan_1_nilai: number | null
    mapel_pilihan_1_kategori: string | null
    mapel_pilihan_2: string | null
    mapel_pilihan_2_nilai: number | null
    mapel_pilihan_2_kategori: string | null
    total_nilai: number | null
    tahun_ajaran: string | null
    semester: string | null
    keterangan: string | null
}

export default function StudentTKAGradesPage() {
    const [tkaData, setTkaData] = useState<TKAGrade | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchTKAGrades()
    }, [])

    const fetchTKAGrades = async () => {
        try {
            setLoading(true)
            const nisn = localStorage.getItem('student_nisn')

            if (!nisn) {
                setError('NISN tidak ditemukan. Silakan login ulang.')
                return
            }

            const res = await fetch(`/api/students/grades/tka?nisn=${nisn}`)
            const result = await res.json()

            if (!res.ok) throw new Error(result.error || 'Failed to fetch TKA grades')

            setTkaData(result.grade || null)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const getCategoryColor = (kategori: string | null) => {
        if (!kategori) return 'text-slate-400'
        switch (kategori.toLowerCase()) {
            case 'istimewa': return 'text-purple-400'
            case 'baik': return 'text-green-400'
            case 'memadai': return 'text-blue-400'
            case 'kurang': return 'text-orange-400'
            default: return 'text-slate-400'
        }
    }

    const getCategoryBadgeColor = (kategori: string | null) => {
        if (!kategori) return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        switch (kategori.toLowerCase()) {
            case 'istimewa': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            case 'baik': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'memadai': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'kurang': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
                    <p className="text-slate-400">Memuat data nilai TKA...</p>
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

    if (!tkaData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-panel p-8 max-w-md w-full text-center">
                    <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 className="text-xl font-bold text-white mb-2">Belum Ada Data Nilai TKA</h3>
                    <p className="text-slate-400">Nilai TKA Anda belum tersedia. Silakan hubungi admin jika ada pertanyaan.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="glass-panel p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Nilai TKA
                    </h2>
                    {tkaData.tahun_ajaran && (
                        <div className="text-right">
                            <p className="text-sm text-slate-400">Tahun Ajaran</p>
                            <p className="text-white font-semibold">{tkaData.tahun_ajaran}</p>
                        </div>
                    )}
                </div>
                <p className="text-slate-300">Tes Kemampuan Akademik - Hasil Penilaian Anda</p>
            </div>

            {/* Total Scores - Hero Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Wajib */}
                <div className="glass-panel p-6 border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-blue-400 font-semibold mb-1">Total Mata Pelajaran Wajib</p>
                            <p className="text-xs text-slate-400">B. Indonesia + Matematika + B. Inggris</p>
                        </div>
                        <svg className="w-12 h-12 text-blue-400/30" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-bold text-white">
                            {tkaData.total_wajib?.toFixed(1) || '0'}
                        </span>
                        <span className="text-2xl text-slate-400 mb-2">/300</span>
                    </div>
                </div>

                {/* Total Keseluruhan */}
                <div className="glass-panel p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-emerald-400 font-semibold mb-1">Total Nilai Keseluruhan</p>
                            <p className="text-xs text-slate-400">Semua Mata Pelajaran</p>
                        </div>
                        <svg className="w-12 h-12 text-emerald-400/30" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-bold text-white">
                            {tkaData.total_nilai?.toFixed(1) || '0'}
                        </span>
                        <span className="text-2xl text-slate-400 mb-2">/500</span>
                    </div>
                </div>
            </div>

            {/* Mata Pelajaran Wajib */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                    Mata Pelajaran Wajib
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Bahasa Indonesia */}
                    <div className="glass-panel p-6 hover:border-blue-500/30 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-white">Bahasa Indonesia</h4>
                            <svg className="w-6 h-6 text-blue-400/50 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                            </svg>
                        </div>
                        <div className="space-y-3">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-white mb-1">
                                    {tkaData.bahasa_indonesia_nilai?.toFixed(1) || '-'}
                                </p>
                                <p className="text-sm text-slate-400">Nilai</p>
                            </div>
                            <div className="flex justify-center">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getCategoryBadgeColor(tkaData.bahasa_indonesia_kategori)}`}>
                                    {tkaData.bahasa_indonesia_kategori || 'Belum Ada'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Matematika */}
                    <div className="glass-panel p-6 hover:border-purple-500/30 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-white">Matematika</h4>
                            <svg className="w-6 h-6 text-purple-400/50 group-hover:text-purple-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                        </div>
                        <div className="space-y-3">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-white mb-1">
                                    {tkaData.matematika_nilai?.toFixed(1) || '-'}
                                </p>
                                <p className="text-sm text-slate-400">Nilai</p>
                            </div>
                            <div className="flex justify-center">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getCategoryBadgeColor(tkaData.matematika_kategori)}`}>
                                    {tkaData.matematika_kategori || 'Belum Ada'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bahasa Inggris */}
                    <div className="glass-panel p-6 hover:border-indigo-500/30 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-white">Bahasa Inggris</h4>
                            <svg className="w-6 h-6 text-indigo-400/50 group-hover:text-indigo-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                            </svg>
                        </div>
                        <div className="space-y-3">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-white mb-1">
                                    {tkaData.bahasa_inggris_nilai?.toFixed(1) || '-'}
                                </p>
                                <p className="text-sm text-slate-400">Nilai</p>
                            </div>
                            <div className="flex justify-center">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getCategoryBadgeColor(tkaData.bahasa_inggris_kategori)}`}>
                                    {tkaData.bahasa_inggris_kategori || 'Belum Ada'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mata Pelajaran Pilihan */}
            {(tkaData.mapel_pilihan_1 || tkaData.mapel_pilihan_2) && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></span>
                        Mata Pelajaran Pilihan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pilihan 1 */}
                        {tkaData.mapel_pilihan_1 && (
                            <div className="glass-panel p-6 hover:border-emerald-500/30 transition-all duration-300">
                                <div className="mb-4">
                                    <p className="text-sm text-slate-400 mb-1">Pilihan 1</p>
                                    <h4 className="font-semibold text-white text-lg">{tkaData.mapel_pilihan_1}</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-white mb-1">
                                            {tkaData.mapel_pilihan_1_nilai?.toFixed(1) || '-'}
                                        </p>
                                        <p className="text-sm text-slate-400">Nilai</p>
                                    </div>
                                    <div className="flex justify-center">
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getCategoryBadgeColor(tkaData.mapel_pilihan_1_kategori)}`}>
                                            {tkaData.mapel_pilihan_1_kategori || 'Belum Ada'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pilihan 2 */}
                        {tkaData.mapel_pilihan_2 && (
                            <div className="glass-panel p-6 hover:border-cyan-500/30 transition-all duration-300">
                                <div className="mb-4">
                                    <p className="text-sm text-slate-400 mb-1">Pilihan 2</p>
                                    <h4 className="font-semibold text-white text-lg">{tkaData.mapel_pilihan_2}</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-white mb-1">
                                            {tkaData.mapel_pilihan_2_nilai?.toFixed(1) || '-'}
                                        </p>
                                        <p className="text-sm text-slate-400">Nilai</p>
                                    </div>
                                    <div className="flex justify-center">
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getCategoryBadgeColor(tkaData.mapel_pilihan_2_kategori)}`}>
                                            {tkaData.mapel_pilihan_2_kategori || 'Belum Ada'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Keterangan */}
            {tkaData.keterangan && (
                <div className="glass-panel p-6 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                        </svg>
                        <div>
                            <p className="text-amber-400 font-semibold mb-1">Keterangan</p>
                            <p className="text-slate-300">{tkaData.keterangan}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="glass-panel p-6">
                <h4 className="text-white font-semibold mb-4">Keterangan Kategori</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            Istimewa
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                            Baik
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Memadai
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            Kurang
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
