'use client'

import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function StudentDashboard() {
    const router = useRouter()
    const [studentData, setStudentData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isVerified, setIsVerified] = useState(false)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        // Simple auth check via localStorage (Set during Login)
        const storedNisn = localStorage.getItem('student_nisn')

        if (!storedNisn) {
            router.push('/login')
            return
        }

        fetchStudentData(storedNisn)
    }, [])

    const fetchStudentData = async (nisn: string) => {
        try {
            setLoading(true)
            // Fetch via our secure API to ensure we get all data (bypassing RLS)
            const response = await fetch(`/api/students/detail?nisn=${nisn}`)
            const result = await response.json()

            if (!response.ok) throw new Error(result.error || 'Gagal mengambil data')

            if (result.data) {
                setStudentData(result.data)
                setIsVerified(result.data.is_verified)
            }
        } catch (error) {
            console.error('Error fetching student data:', error)
            // Handle error visually if needed
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('student_nisn')
        router.replace('/login')
    }

    const handleExport = () => {
        if (!studentData) return
        const ws = XLSX.utils.json_to_sheet([studentData])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Data Saya")
        XLSX.writeFile(wb, `${studentData.nama}_Data.xlsx`)
    }

    const handleValidateClick = () => {
        setShowModal(true)
    }

    const confirmValidation = async () => {
        try {
            if (!studentData) return

            const { error } = await supabase
                .from('students')
                .update({ is_verified: true, verified_at: new Date().toISOString() })
                .eq('id', studentData.id)

            if (error) throw error

            setIsVerified(true)
            setShowModal(false)
            alert('Data berhasil dikonfirmasi!')
        } catch (error: any) {
            alert('Gagal konfirmasi: ' + error.message)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <svg className="w-10 h-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-slate-400">Memuat data murid...</p>
                </div>
            </div>
        )
    }

    if (!studentData) {
        return (
            <div className="text-center p-10 text-white">
                <h2 className="text-xl font-bold">Data tidak ditemukan.</h2>
                <p className="text-slate-400 mt-2">Silakan hubungi admin sekolah.</p>
                <button onClick={() => router.push('/login')} className="mt-4 px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">Kembali ke Login</button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 relative">

            {/* Welcome Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-6 md:p-8 bg-gradient-to-r from-blue-900/40 to-transparent border-blue-500/20">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Halo, {studentData.nama}</h1>
                    <p className="text-sm md:text-base text-blue-200">Silakan periksa data diri Anda dengan teliti.</p>
                </div>

                <button
                    onClick={handleExport}
                    className="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full hover:from-emerald-400 hover:to-green-500 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5"
                >
                    <svg className="w-5 h-5 mr-2 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download Excel
                </button>
            </div>

            {/* DEBUG SECTION - TEMPORARY */}
            <div className="bg-black/50 p-4 m-4 rounded text-xs font-mono text-green-400 overflow-auto border border-green-500/30">
                <p className="mb-2 font-bold text-white">DEBUG INFO:</p>
                <p>Fetching NISN: {localStorage.getItem('student_nisn')}</p>
                <pre>{JSON.stringify(studentData, null, 2)}</pre>
            </div>

            {/* Main Data Panel */}
            <div className="glass-panel overflow-hidden">
                <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 flex flex-row justify-between items-center gap-3">
                    <h2 className="font-bold text-white text-lg">Detail Data Murid</h2>
                    <div className={`text-[10px] md:text-xs px-3 py-1 rounded-full font-bold border whitespace-nowrap ${isVerified ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-orange-500/20 border-orange-500/30 text-orange-400'}`}>
                        {isVerified ? 'SUDAH VALID' : 'BELUM VALIDASI'}
                    </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-y-8 gap-x-12">
                    {Object.entries(studentData)
                        .filter(([key]) => !['id', 'created_at', 'updated_at', 'is_verified', 'verified_at', 'user_id'].includes(key))
                        .map(([key, value]) => (
                            <div key={key} className="border-b border-white/5 pb-2 group hover:border-white/20 transition-colors">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1 group-hover:text-slate-300 transition-colors">
                                    {key.replace(/_/g, ' ')}
                                </label>
                                <div className="font-medium text-white text-base md:text-lg break-words">
                                    {String(value || '-')}
                                </div>
                            </div>
                        ))}
                </div>

                {/* Validation Action */}
                <div className="p-6 md:p-8 bg-black/20 border-t border-white/5 flex flex-col items-center justify-center gap-6 text-center">
                    {isVerified ? (
                        <div className="flex flex-col items-center gap-3 animate-enter">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shadow-lg shadow-green-500/20 mb-2">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">Terima Kasih!</h3>
                            <p className="text-slate-400 max-w-md text-sm md:text-base">
                                Anda telah menyatakan bahwa data ini benar pada {new Date().toLocaleDateString('id-ID')}.
                            </p>
                        </div>
                    ) : (
                        <div className="w-full max-w-lg">
                            <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl mb-8 backdrop-blur-sm relative overflow-hidden group hover:border-orange-500/40 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                                <strong className="block mb-2 text-lg text-orange-400">Penting:</strong>
                                <p className="text-orange-200/80 text-sm leading-relaxed">
                                    Pastikan data sudah sesuai dengan dokumen asli. <br />
                                    Jika ada kesalahan, segera hubungi tim dapodik di ruang kurikulum.
                                </p>
                            </div>

                            <button
                                onClick={handleValidateClick}
                                className="group relative w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-bold text-white text-lg shadow-2xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300"
                            >
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <svg className="w-6 h-6 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Saya Konfirmasi Data Benar</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-enter">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl transform scale-100 transition-all">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Konfirmasi Validasi</h3>
                                <p className="text-slate-400 text-sm">
                                    Apakah Anda yakin data ini sudah benar? <br />
                                    Data yang sudah divalidasi <span className="text-orange-400 font-semibold">tidak dapat diubah lagi</span>.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmValidation}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-orange-600/20"
                                >
                                    Ya, Data Benar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
