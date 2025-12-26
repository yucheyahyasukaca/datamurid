'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { useDebounce } from '@/hooks/useDebounce'
import * as XLSX from 'xlsx'

export default function AdminDashboard() {
    // Filter State
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)
    const [selectedRombel, setSelectedRombel] = useState('')

    // Data State
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [totalStudents, setTotalStudents] = useState(0)

    // Stats State
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        pending: 0
    })

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    const [rombelOptions, setRombelOptions] = useState<string[]>([])

    // Security Warning
    const [showSecurityWarning, setShowSecurityWarning] = useState(false)

    useEffect(() => {
        const hasSeenWarning = localStorage.getItem('admin_security_warning_seen_v2')
        if (!hasSeenWarning) {
            setTimeout(() => setShowSecurityWarning(true), 1000)
        }

        fetchRombels() // Fetch rombels once
    }, [])

    useEffect(() => {
        setCurrentPage(1) // Reset to page 1 on filter change
    }, [debouncedSearchTerm, selectedRombel])

    useEffect(() => {
        fetchStudents()
        fetchStats()
    }, [currentPage, debouncedSearchTerm, selectedRombel])

    const handleCloseSecurityWarning = () => {
        localStorage.setItem('admin_security_warning_seen_v2', 'true')
        setShowSecurityWarning(false)
    }

    const fetchRombels = async () => {
        const { data, error } = await supabase
            .from('students')
            .select('rombel')

        if (data) {
            const unique = Array.from(new Set(data.map(d => d.rombel).filter(Boolean))).sort() as string[]
            setRombelOptions(unique)
        }
    }

    const fetchStats = async () => {
        try {
            // Parallel requests for counts
            const [totalRes, verifiedRes, pendingRes] = await Promise.all([
                supabase.from('students').select('*', { count: 'exact', head: true }), // Total
                supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_verified', true), // Verified
                supabase.from('students').select('*', { count: 'exact', head: true }).eq('is_verified', false) // Pending
            ])

            setStats({
                total: totalRes.count || 0,
                verified: verifiedRes.count || 0,
                pending: pendingRes.count || 0
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const fetchStudents = async () => {
        try {
            setLoading(true)

            let query = supabase
                .from('students')
                .select('*', { count: 'exact' })
                .order('nama', { ascending: true })

            // Apply Filters
            if (debouncedSearchTerm) {
                query = query.or(`nama.ilike.%${debouncedSearchTerm}%,nisn.ilike.%${debouncedSearchTerm}%,nipd.ilike.%${debouncedSearchTerm}%`)
            }

            if (selectedRombel) {
                query = query.eq('rombel', selectedRombel)
            }

            // Apply Pagination
            const from = (currentPage - 1) * itemsPerPage
            const to = from + itemsPerPage - 1

            const { data, error, count } = await query.range(from, to)

            if (error) throw error

            setStudents(data || [])
            setTotalStudents(count || 0)

        } catch (error) {
            console.error('Error fetching students:', error)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(totalStudents / itemsPerPage)

    const handleExport = async () => {
        setLoading(true)
        try {
            // Fetch ALL data matching filters for export
            let query = supabase.from('students').select('*')
            if (debouncedSearchTerm) query = query.or(`nama.ilike.%${debouncedSearchTerm}%,nisn.ilike.%${debouncedSearchTerm}%,nipd.ilike.%${debouncedSearchTerm}%`)
            if (selectedRombel) query = query.eq('rombel', selectedRombel)

            const { data, error } = await query

            if (error) throw error
            if (!data) return

            const cleanData = data.map(({ is_verified, verified_at, created_at, password, ...rest }) => rest)

            const ws = XLSX.utils.json_to_sheet(cleanData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Data Murid")
            XLSX.writeFile(wb, `Data_Murid_SMAN1Pati_${new Date().toISOString().slice(0, 10)}.xlsx`)

        } catch (error: any) {
            showNotification('error', 'Gagal export data: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const [resetModal, setResetModal] = useState({
        show: false,
        studentId: '',
        studentName: '',
        newPassword: ''
    })
    const [resetLoading, setResetLoading] = useState(false)

    const openResetModal = (student: any) => {
        setResetModal({
            show: true,
            studentId: student.id,
            studentName: student.nama,
            newPassword: ''
        })
    }

    // ... (Keep existing state)
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: '',
        onClose: () => { }
    })

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

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!resetModal.newPassword) return

        try {
            setResetLoading(true)
            const response = await fetch('/api/admin/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: resetModal.studentId,
                    newPassword: resetModal.newPassword
                })
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.error || 'Gagal mereset password')

            setResetModal({ ...resetModal, show: false })
            showNotification('success', `Password untuk ${resetModal.studentName} berhasil direset!`)
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setResetLoading(false)
        }
    }

    // Custom Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: () => { }
    })

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmModal({
            show: true,
            title,
            message,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, show: false }))
                onConfirm()
            }
        })
    }

    const handleResetVerification = async (student: any) => {
        showConfirm(
            'Konfirmasi Pembatalan',
            `Apakah Anda yakin ingin membatalkan verifikasi untuk siswa ${student.nama}? Siswa akan bisa mengubah datanya kembali.`,
            async () => {
                try {
                    // Get Access Token
                    const { data: { session } } = await supabase.auth.getSession()
                    if (!session?.access_token) {
                        showNotification('error', 'Sesi login tidak valid. Silakan login ulang.')
                        return
                    }

                    const response = await fetch('/api/admin/reset-verification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ studentId: student.id })
                    })

                    if (!response.ok) {
                        const result = await response.json()
                        throw new Error(result.error || 'Gagal mereset verifikasi')
                    }

                    showNotification('success', `Status verifikasi ${student.nama} berhasil direset!`)
                    fetchStudents() // Refresh data
                    fetchStats() // Refresh stats
                } catch (error: any) {
                    showNotification('error', error.message)
                }
            }
        )
    }

    return (
        <div className="space-y-8">

            {/* Header & Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">Data Murid</h2>
                    <p className="text-slate-400 text-sm">Kelola data siswa dan validasi status dengan mudah.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExport}
                        className="group relative inline-flex items-center justify-center flex-1 md:flex-none px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-emerald-600/20 border border-emerald-500/50 rounded-xl hover:bg-emerald-600/40 hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export Excel
                    </button>
                    <Link
                        href="/admin/students/new"
                        className="group relative inline-flex items-center justify-center flex-1 md:flex-none px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                    >
                        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        <span>Tambah Murid</span>
                    </Link>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-auto md:flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input
                        type="text"
                        placeholder="Cari nama, NISN, atau NIPD..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64 relative">
                    <select
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                        value={selectedRombel}
                        onChange={(e) => setSelectedRombel(e.target.value)}
                    >
                        <option value="" style={{ backgroundColor: '#0f172a', color: 'white' }}>Semua Rombel</option>
                        {rombelOptions.map(rombel => (
                            <option key={rombel} value={rombel} style={{ backgroundColor: '#0f172a', color: 'white' }}>{rombel}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">Total Murid</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                    <div className="text-xs text-slate-500 mt-2">
                        Data terdaftar di sistem
                    </div>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">Sudah Verifikasi</p>
                    <p className="text-3xl font-bold text-green-400">{stats.verified}</p>
                    <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${stats.total > 0 ? (stats.verified / stats.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">Belum Verifikasi</p>
                    <p className="text-3xl font-bold text-orange-400">{stats.pending}</p>
                    <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Data Table & Mobile Cards */}
            <div className="glass-panel overflow-hidden border border-white/10">
                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/80 transition-colors">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">No</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Nama</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Rombel</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">NIPD</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">NISN</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">L/P</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Sedang memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : students.length > 0 ? (
                                students.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="px-6 py-4 font-medium text-white">{student.nama}</td>
                                        <td className="px-6 py-4 text-slate-400">{student.rombel || '-'}</td>
                                        <td className="px-6 py-4">{student.nipd || '-'}</td>
                                        <td className="px-6 py-4 font-mono text-slate-400">{student.nisn}</td>
                                        <td className="px-6 py-4">{student.jk}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${student.is_verified
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                }`}>
                                                {student.is_verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/admin/students/${student.id}`} className="text-blue-400 hover:text-blue-300 transition-colors p-1" title="Edit Data">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                </Link>
                                                <button
                                                    onClick={() => openResetModal(student)}
                                                    className="text-orange-400 hover:text-orange-300 transition-colors p-1"
                                                    title="Reset Password"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                                </button>
                                                {student.is_verified && (
                                                    <button
                                                        onClick={() => handleResetVerification(student)}
                                                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                                                        title="Batal Verifikasi"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        Data tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden space-y-4 p-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">
                            <div className="flex justify-center items-center gap-2">
                                <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Sedang memuat data...
                            </div>
                        </div>
                    ) : students.length > 0 ? (
                        students.map((student) => (
                            <div key={student.id} className="bg-slate-800/50 rounded-xl p-4 border border-white/5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-white text-lg">{student.nama}</h3>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded-full border ${student.is_verified
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                }`}>
                                                {student.is_verified ? 'Verified' : 'Pending'}
                                            </span>
                                            <span className="text-slate-500">|</span>
                                            <span className="text-slate-400">{student.rombel || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-300">
                                        {student.jk}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm border-t border-white/5 pt-3">
                                    <div>
                                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">NISN</p>
                                        <p className="font-mono text-slate-300">{student.nisn}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">NIPD</p>
                                        <p className="font-mono text-slate-300">{student.nipd || '-'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Link
                                        href={`/admin/students/${student.id}`}
                                        className="flex-1 py-2.5 px-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => openResetModal(student)}
                                        className="flex-1 py-2.5 px-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg text-orange-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                        Reset Pass
                                    </button>
                                </div>
                                {student.is_verified && (
                                    <div className="pt-2">
                                        <button
                                            onClick={() => handleResetVerification(student)}
                                            className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Batal Verifikasi
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            Data tidak ditemukan.
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && students.length > 0 && (
                    <div className="p-4 border-t border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <div className="text-slate-400">
                            Menampilkan <span className="font-semibold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, totalStudents)}</span> dari <span className="font-semibold text-white">{totalStudents}</span> data
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-slate-800 border border-white/10 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>

                            {/* Simple Page Indicator */}
                            <div className="px-4 py-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-medium">
                                Halaman {currentPage} / {totalPages || 1}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-slate-800 border border-white/10 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Security Warning Modal */}
            {showSecurityWarning && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-enter">
                    <div className="glass-panel w-full max-w-2xl p-0 overflow-hidden shadow-2xl transform scale-100 transition-all relative border border-white/10 flex flex-col md:flex-row">

                        {/* Visual Side (Left/Top) */}
                        <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-8 flex flex-col justify-center items-center text-center md:w-2/5 relative overflow-hidden border-r border-white/5">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner relative z-10 border border-orange-500/20">
                                <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <h3 className="text-white font-bold text-lg relative z-10 uppercase tracking-widest text-xs">Area Terbatas</h3>
                            <h2 className="text-orange-400 font-bold text-xl relative z-10 mt-1">Administrator</h2>
                        </div>

                        {/* Content Side (Right/Bottom) */}
                        <div className="p-8 md:w-3/5 bg-slate-900/50">
                            <h4 className="text-xl font-bold text-white mb-3">Mohon Perhatian Bapak/Ibu Guru</h4>

                            <div className="space-y-4 text-slate-300 text-sm leading-relaxed mb-8">
                                <p>
                                    Anda sedang mengakses <span className="text-orange-300 font-medium">Data Induk Siswa</span> yang bersifat sangat rahasia.
                                </p>
                                <p>
                                    Kebocoran akun admin dapat berakibat fatal (penyalahgunaan data oleh pihak luar). Mohon untuk menjaga integritas data sekolah kita dengan:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs ml-1">
                                    <li>Tidak meninggalkan laptop dalam keadaan login.</li>
                                    <li>Tidak membagikan password admin kepada siswa/pihak lain.</li>
                                    <li>Segera lapor jika ada aktivitas mencurigakan.</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleCloseSecurityWarning}
                                className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-500 hover:to-red-500 transition-all shadow-lg shadow-orange-900/20 active:scale-[0.98] border border-orange-500/20"
                            >
                                Saya Paham & Bertanggung Jawab 🛡️
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

            {/* Reset Password Modal */}
            {
                resetModal.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-enter">
                        <div className="glass-panel w-full max-w-md p-6 shadow-2xl transform scale-100 transition-all relative">
                            <button
                                onClick={() => setResetModal({ ...resetModal, show: false })}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            <h3 className="text-xl font-bold text-white mb-1">Reset Password Murid</h3>
                            <p className="text-slate-400 text-xs mb-6">Atur ulang password untuk <strong>{resetModal.studentName}</strong>.</p>

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Password Baru</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                                        placeholder="Masukkan password baru"
                                        value={resetModal.newPassword}
                                        onChange={(e) => setResetModal({ ...resetModal, newPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Sarankan password yang kuat.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={resetLoading}
                                    className="w-full mt-2 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-xl font-bold text-white text-sm transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
                                >
                                    {resetLoading ? 'Menyimpan...' : 'Reset Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                    <div className="glass-panel w-full max-w-sm p-6 shadow-2xl transform scale-100 transition-all relative border border-white/10">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/20">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{confirmModal.title}</h3>
                            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                                {confirmModal.message}
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                                    className="flex-1 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm border border-transparent hover:border-white/10"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => confirmModal.onConfirm()}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm transition-all shadow-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-500/20"
                                >
                                    Ya, Lanjutkan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
