'use client'

import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function StudentDashboard() {
    const router = useRouter()
    const [studentData, setStudentData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showSecurityWarning, setShowSecurityWarning] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: '',
        onClose: () => { }
    })

    // Change Request State
    const [changeRequest, setChangeRequest] = useState<any>(null)
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [requestReason, setRequestReason] = useState('')
    const [requestLoading, setRequestLoading] = useState(false)

    useEffect(() => {
        // ... (existing auth check) ...
        const storedNisn = localStorage.getItem('student_nisn')

        // Check if user has seen warning
        const hasSeenWarning = localStorage.getItem('security_warning_seen_v2')
        if (!hasSeenWarning) {
            // Show with a slight delay for better UX
            setTimeout(() => setShowSecurityWarning(true), 1500)
        }

        if (!storedNisn) {
            router.push('/login')
            return
        }

        fetchStudentData(storedNisn)
    }, [])

    const handleCloseSecurityWarning = () => {
        localStorage.setItem('security_warning_seen_v2', 'true')
        setShowSecurityWarning(false)
    }

    // ... (rest of the component) ...

    {/* Notification Modal */ }

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

                // Fetch Change Request Status
                try {
                    const reqStatusRes = await fetch(`/api/requests/student/status?nisn=${nisn}`)
                    const reqStatus = await reqStatusRes.json()
                    if (reqStatus.data) {
                        setChangeRequest(reqStatus.data)
                    }
                } catch (e) {
                    console.error("Failed to fetch request status", e)
                }
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
        document.cookie = "student_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        router.replace('/login')
    }

    const handleExport = () => {
        if (!studentData) return

        // Filter out internal/sensitive fields
        const { id, created_at, updated_at, is_verified, verified_at, user_id, password, ...cleanData } = studentData

        const ws = XLSX.utils.json_to_sheet([cleanData])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Data Saya")
        XLSX.writeFile(wb, `${studentData.nama}_Data.xlsx`)
    }

    const showNotification = (type: 'success' | 'error', message: string, onClose: () => void = () => { }) => {
        setNotification({
            show: true,
            type,
            message,
            onClose: () => {
                setNotification(prev => ({ ...prev, show: false }))
                onClose()
            }
        })
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showNotification('error', 'Password baru dan konfirmasi tidak cocok!')
            return
        }

        try {
            setPasswordLoading(true)
            const response = await fetch('/api/students/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nisn: studentData.nisn,
                    oldPassword: passwordForm.oldPassword,
                    newPassword: passwordForm.newPassword
                })
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.error || 'Gagal mengubah password')

            setShowPasswordModal(false)
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })

            showNotification('success', 'Password berhasil diubah! Silakan login ulang.', () => {
                handleLogout()
            })

        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setPasswordLoading(false)
        }
    }

    const handleValidateClick = () => {
        setShowModal(true)
    }

    const confirmValidation = async () => {
        try {
            if (!studentData) return

            // Use Server-side API to bypass RLS
            const response = await fetch('/api/students/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: studentData.id })
            })

            const result = await response.json()

            if (!response.ok) throw new Error(result.error || 'Gagal verifikasi')

            setIsVerified(true)
            setShowModal(false)
            showNotification('success', 'Data berhasil dikonfirmasi!')
        } catch (error: any) {
            showNotification('error', 'Gagal konfirmasi: ' + error.message)
        }
    }

    const handleRequestChange = async () => {
        if (!requestReason.trim()) {
            showNotification('error', 'Mohon isi alasan perbaikan data.')
            return
        }
        setRequestLoading(true)
        try {
            const res = await fetch('/api/requests/student/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nisn: studentData.nisn,
                    reason: requestReason
                })
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)

            setChangeRequest(json.data)
            setShowRequestModal(false)
            showNotification('success', 'Permintaan terkirim! Menunggu persetujuan admin.')
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setRequestLoading(false)
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
            <div className="relative group overflow-hidden rounded-3xl p-8 min-h-[220px] flex flex-col justify-center">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                            Halo, <br className="md:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                                {studentData.nama}
                            </span>
                        </h1>
                        <p className="text-blue-200/80 text-sm md:text-lg max-w-xl leading-relaxed">
                            Akses data akademikmu dengan mudah, aman, dan transparan. <br className="hidden md:block" />
                            Silakan periksa kelengkapan datamu di bawah ini.
                        </p>

                        <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="group relative flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98] backdrop-blur-md"
                            >
                                <div className="p-1 rounded bg-indigo-500/20 text-indigo-300 mr-2 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                </div>
                                <span>Ganti Password</span>
                            </button>

                            <button
                                onClick={handleExport}
                                className="group relative flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/20 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <div className="p-1 rounded bg-emerald-400/20 text-emerald-100 mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                </div>
                                <span>Download Excel</span>
                            </button>
                        </div>
                    </div>

                    <div className="hidden">
                        {/* Old button placement removed */}
                    </div>
                </div>
            </div>

            {/* Progress Tracker Card */}
            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Progress Circle & Text */}
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-gradient-to-b from-orange-400 to-red-500 rounded-full"></span>
                                    Kelengkapan Data
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Selesaikan misi untuk melengkapi profilmu!</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-3xl font-black ${(isVerified && studentData.no_hp) ? 'text-green-400' : 'text-orange-400'
                                    }`}>
                                    {isVerified && studentData.no_hp ? '100%' : (isVerified || studentData.no_hp ? '50%' : '0%')}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out relative ${(isVerified && studentData.no_hp)
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-400 w-full'
                                    : (isVerified || studentData.no_hp ? 'bg-gradient-to-r from-orange-500 to-amber-400 w-1/2' : 'w-0')
                                    }`}
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')] opacity-30 animate-pulse"></div>
                                <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 blur-[2px]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="w-full md:w-1/2 space-y-3">
                        {/* Task 1: Verification */}
                        <div className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isVerified
                            ? 'bg-green-500/10 border-green-500/20'
                            : 'bg-slate-800/50 border-white/5 hover:border-orange-500/30'
                            }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isVerified ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'
                                }`}>
                                {isVerified ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    <span className="font-bold text-xs">1</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold ${isVerified ? 'text-green-400' : 'text-white'}`}>
                                    Validasi Data Diri
                                </h4>
                                {!isVerified && <p className="text-xs text-slate-400">Pastikan data di bawah sesuai.</p>}
                            </div>
                            {!isVerified && (
                                <button
                                    onClick={() => document.getElementById('validation-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white transition-colors"
                                >
                                    Cek
                                </button>
                            )}
                        </div>

                        {/* Task 2: Contact Info */}
                        <div className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${studentData.no_hp
                            ? 'bg-green-500/10 border-green-500/20'
                            : 'bg-slate-800/50 border-white/5 hover:border-orange-500/30'
                            }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${studentData.no_hp ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'
                                }`}>
                                {studentData.no_hp ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    <span className="font-bold text-xs">2</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold ${studentData.no_hp ? 'text-green-400' : 'text-white'}`}>
                                    Update Nomor HP & Email
                                </h4>
                                {!studentData.no_hp && <p className="text-xs text-slate-400">Agar info sekolah tersampaikan.</p>}
                            </div>
                            {!studentData.no_hp && (
                                <button
                                    onClick={() => router.push('/student/contact')}
                                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-xs font-semibold text-white transition-colors shadow-lg shadow-orange-500/20"
                                >
                                    Isi Sekarang
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Main Data Panel */}
            <div className="glass-panel overflow-hidden border border-white/10 shadow-2xl">
                <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 flex flex-row justify-between items-center gap-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <h2 className="font-bold text-white text-xl flex items-center gap-3">
                            <span className="w-2 h-8 rounded-full bg-blue-500"></span>
                            Detail Data Murid
                        </h2>
                        <p className="text-slate-400 text-xs mt-1 ml-5">Informasi resmi dari database sekolah</p>
                    </div>

                    <div className={`relative z-10 text-[10px] md:text-xs px-4 py-1.5 rounded-full font-bold border flex items-center gap-2 backdrop-blur-md ${isVerified ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
                        {isVerified ? (
                            <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                TERVERIFIKASI
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                                BELUM VALIDASI
                            </>
                        )}
                    </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 relative">
                    {/* Decorative Divider */}
                    <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

                    {Object.entries(studentData)
                        .filter(([key]) => !['id', 'created_at', 'updated_at', 'is_verified', 'verified_at', 'user_id', 'password'].includes(key))
                        .map(([key, value]) => (
                            <div key={key} className="group relative pl-4 transition-all hover:translate-x-1">
                                <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-slate-700 group-hover:bg-blue-500 transition-colors rounded-full"></div>
                                <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1 group-hover:text-blue-400 transition-colors">
                                    {key.replace(/_/g, ' ')}
                                </label>
                                <div className="font-medium text-white text-base md:text-lg break-words leading-relaxed">
                                    {String(value || '-')}
                                </div>
                            </div>
                        ))}
                </div>

            </div>

            {/* Request Change Section / Status Banner */}
            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 relative overflow-hidden mt-6">
                <h3 className="text-lg font-bold text-white mb-4">Status Data</h3>
                {changeRequest && changeRequest.status === 'REQUESTED' && (
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-200">
                        <strong className="block mb-1 text-blue-400">Permintaan Perbaikan Terkirim</strong>
                        <p className="text-sm">Admin sedang meninjau permintaan Anda. Mohon tunggu persetujuan untuk mengedit data.</p>
                    </div>
                )}
                {changeRequest && changeRequest.status === 'EDITING' && (
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-200 flex justify-between items-center">
                        <div>
                            <strong className="block mb-1 text-green-400">Permintaan Disetujui</strong>
                            <p className="text-sm">Silakan edit data Anda sekarang.</p>
                        </div>
                        <button
                            onClick={() => router.push('/student/edit')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg"
                        >
                            Edit Data
                        </button>
                    </div>
                )}
                {changeRequest && changeRequest.status === 'REVIEW' && (
                    <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl text-purple-200">
                        <strong className="block mb-1 text-purple-400">Menunggu Validasi</strong>
                        <p className="text-sm mb-3">Data perubahan telah disimpan. Admin akan memvalidasi data Anda segera.</p>

                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg mt-3 text-blue-200">
                            <strong className="block mb-2 text-blue-300 text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Langkah Validasi
                            </strong>
                            <div className="space-y-2 text-xs">
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-400 font-bold mt-0.5">1.</span>
                                    <span>Bawa <span className="font-semibold text-white">dokumen asli</span> terkait perubahan data (misal: jika ubah NIK/alamat, bawa <span className="font-semibold text-white">Kartu Keluarga</span>)</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-400 font-bold mt-0.5">2.</span>
                                    <span>Datang ke <span className="font-semibold text-white">Bagian Dapodik</span> di <span className="font-semibold text-white">Ruang Kurikulum</span></span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-400 font-bold mt-0.5">3.</span>
                                    <span>Validasi dilakukan pada <span className="font-semibold text-white">jam kerja</span> (Senin-Jumat, 07.30-15.00)</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {changeRequest && changeRequest.status === 'REJECTED' && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-200 mb-4">
                        <strong className="block mb-1 text-red-400">Permintaan Ditolak</strong>
                        <p className="text-sm">Catatan Admin: {changeRequest.admin_notes || 'Tidak ada catatan.'}</p>
                        <button
                            onClick={() => setChangeRequest(null)}
                            className="mt-2 text-xs underline hover:text-white"
                        >
                            Tutup
                        </button>
                    </div>
                )}

                {/* Main Action Buttons if no active request logic blocking */}
                {(!changeRequest || changeRequest.status === 'APPROVED' || changeRequest.status === 'REJECTED') && (
                    <div id="validation-section" className="mt-6 flex flex-col md:flex-row gap-4 justify-center">
                        {!isVerified ? (
                            <>
                                <button
                                    onClick={handleValidateClick}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-bold text-white shadow-lg shadow-orange-500/20 hover:-translate-y-1 transition text-center"
                                >
                                    Saya Konfirmasi Data Benar
                                </button>
                                <button
                                    onClick={() => setShowRequestModal(true)}
                                    className="flex-1 px-6 py-4 bg-slate-800 border border-white/10 hover:bg-slate-700 rounded-xl font-bold text-slate-300 hover:text-white transition text-center"
                                >
                                    Saya Perlu Perbaikan Data
                                </button>
                            </>
                        ) : (
                            <div className="w-full text-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <p className="text-green-400 font-bold">Data Terverifikasi</p>
                                <p className="text-slate-400 text-xs mt-1">Jika ada perubahan mendesak, silakan hubungi admin sekolah.</p>
                                <button
                                    onClick={() => setShowRequestModal(true)}
                                    className="mt-3 px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
                                >
                                    Ajukan Perubahan (Khusus)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-enter">
                    <div className="glass-panel w-full max-w-md p-6 shadow-2xl relative">
                        <h3 className="text-xl font-bold text-white mb-4">Ajukan Perbaikan Data</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Jelaskan bagian mana yang salah dan perlu diperbaiki. Admin akan membuka akses edit setelah disetujui.
                        </p>
                        <textarea
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[100px]"
                            placeholder="Contoh: Nama ibu salah ejaan, Tanggal lahir tidak sesuai akta..."
                            value={requestReason}
                            onChange={(e) => setRequestReason(e.target.value)}
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleRequestChange}
                                disabled={requestLoading}
                                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg"
                            >
                                {requestLoading ? 'Mengirim...' : 'Kirim Permintaan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal (Validation) */}
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

            {/* Security Warning Modal */}
            {showSecurityWarning && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-enter">
                    <div className="glass-panel w-full max-w-lg p-0 overflow-hidden shadow-2xl transform scale-100 transition-all relative border border-white/10 flex flex-col md:flex-row">

                        {/* Visual Side (Left/Top) */}
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-800 p-8 flex flex-col justify-center items-center text-center md:w-2/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner relative z-10">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <h3 className="text-white font-bold text-lg relative z-10">Privacy First! 🔐</h3>
                        </div>

                        {/* Content Side (Right/Bottom) */}
                        <div className="p-8 md:w-3/5 bg-slate-900/50">
                            <h4 className="text-xl font-bold text-white mb-3">Jaga Kunci 'Rumah' Digitalmu!</h4>

                            <div className="space-y-3 text-slate-300 text-sm leading-relaxed mb-6">
                                <p>
                                    Hai Generasi Emas! 👋<br />
                                    Data di sini adalah <span className="text-white font-semibold">aset berhargamu</span>. Sekolah tidak dapat bertanggung jawab atas penyalahgunaan data akibat kelalaian (seperti meminjamkan akun).
                                </p>
                                <div className="bg-blue-500/10 border-l-2 border-blue-500 p-3 rounded-r-lg text-xs">
                                    <strong className="text-blue-300 block mb-1">Tips Aman:</strong>
                                    ✅ Ganti password secara berkala.<br />
                                    ✅ Jangan bagikan password ke siapapun!
                                </div>
                            </div>

                            <button
                                onClick={handleCloseSecurityWarning}
                                className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg active:scale-[0.98]"
                            >
                                Siap, Saya Mengerti 🚀
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {notification.show && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                    <div className="glass-panel w-full max-w-sm p-6 text-center shadow-2xl transform scale-100 transition-all relative border border-white/10">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {notification.type === 'success' ? (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">
                            {notification.type === 'success' ? 'Berhasil!' : 'Gagal'}
                        </h3>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                            {notification.message}
                        </p>

                        <button
                            onClick={() => notification.onClose()}
                            className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all shadow-lg ${notification.type === 'success'
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-500/25'
                                : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/25'
                                }`}
                        >
                            {notification.type === 'success' ? 'Mengerti' : 'Coba Lagi'}
                        </button>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            {
                showPasswordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-enter">
                        <div className="glass-panel w-full max-w-md p-6 shadow-2xl transform scale-100 transition-all relative">
                            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            <h3 className="text-xl font-bold text-white mb-1">Ganti Password</h3>
                            <p className="text-slate-400 text-xs mb-6">Amankan akun Anda dengan password yang kuat.</p>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Password Lama / Tanggal Lahir</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                                        placeholder="Masukkan password saat ini"
                                        value={passwordForm.oldPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Password Baru</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                                        placeholder="Minimal 6 karakter"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Konfirmasi Password Baru</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                                        placeholder="Ulangi password baru"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {passwordLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
