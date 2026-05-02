'use client'

import React, { useState, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { useDebounce } from '@/hooks/useDebounce'

interface GraduationRecord {
    id: string
    nisn: string
    nama: string | null
    tanggal_lahir: string | null
    no_ujian: string | null
    kota: string | null
    agama: string | null
    kelas: string | null
    status: 'LULUS' | 'TIDAK LULUS'
}

export default function AdminKelulusanPage() {
    const [releaseTimeInput, setReleaseTimeInput] = useState('')
    const [savedReleaseTime, setSavedReleaseTime] = useState<string | null>(null)
    const [savingTime, setSavingTime] = useState(false)

    const [records, setRecords] = useState<GraduationRecord[]>([])
    const [total, setTotal] = useState(0)
    const [stats, setStats] = useState({ lulus: 0, tidak_lulus: 0 })
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [kelasFilter, setKelasFilter] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const itemsPerPage = 20

    const [showImportModal, setShowImportModal] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState<any>(null)

    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    })

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message })
        setTimeout(() => setNotification({ show: false, type: 'success', message: '' }), 3000)
    }

    const fetchReleaseTime = useCallback(async () => {
        const res = await fetch('/api/admin/settings/graduation-time')
        const result = await res.json()
        if (result.releaseTime) {
            setSavedReleaseTime(result.releaseTime)
            const dt = new Date(result.releaseTime)
            const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16)
            setReleaseTimeInput(local)
        }
    }, [])

    const fetchRecords = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', currentPage.toString())
            params.append('limit', itemsPerPage.toString())
            if (debouncedSearch) params.append('search', debouncedSearch)
            if (kelasFilter) params.append('kelas', kelasFilter)

            const res = await fetch(`/api/admin/grades/kelulusan?${params}`)
            const result = await res.json()
            if (!res.ok) throw new Error(result.error)
            setRecords(result.data || [])
            setTotal(result.total || 0)
            setStats(result.stats || { lulus: 0, tidak_lulus: 0 })
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setLoading(false)
        }
    }, [currentPage, debouncedSearch, kelasFilter])

    useEffect(() => { fetchReleaseTime() }, [fetchReleaseTime])
    useEffect(() => { fetchRecords() }, [fetchRecords])
    useEffect(() => { setCurrentPage(1) }, [debouncedSearch, kelasFilter])

    const handleSaveTime = async () => {
        if (!releaseTimeInput) return
        setSavingTime(true)
        try {
            const isoTime = new Date(releaseTimeInput).toISOString()
            const res = await fetch('/api/admin/settings/graduation-time', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ releaseTime: isoTime })
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error)
            setSavedReleaseTime(isoTime)
            showNotification('success', 'Waktu rilis berhasil disimpan!')
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setSavingTime(false)
        }
    }

    const getReleaseStatus = () => {
        if (!savedReleaseTime) return { label: 'Belum diset', color: 'text-slate-400' }
        const now = new Date()
        const release = new Date(savedReleaseTime)
        if (now >= release) {
            return { label: `Sudah aktif sejak ${release.toLocaleString('id-ID')}`, color: 'text-green-400' }
        }
        return { label: `Akan rilis pada ${release.toLocaleString('id-ID')}`, color: 'text-yellow-400' }
    }

    const downloadTemplate = () => {
        const template = [{
            'No': 1,
            'Nama': 'Contoh Nama Siswa',
            'Tanggal Lahir': '01 Januari 2007',
            'No. Peserta': '0012345678',
            'Kota': 'Pati',
            'No. Ujian': '12345',
            'Agama': 'Islam',
            'Kelas': 'XII F-1',
            'Status': 'LULUS'
        }]
        const ws = XLSX.utils.json_to_sheet(template)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Template Kelulusan')
        XLSX.writeFile(wb, 'Template_Import_Kelulusan.xlsx')
        showNotification('success', 'Template berhasil didownload!')
    }

    const handleImport = async () => {
        if (!importFile) return
        setImporting(true)
        try {
            const fd = new FormData()
            fd.append('file', importFile)
            const res = await fetch('/api/admin/grades/kelulusan/import', {
                method: 'POST',
                body: fd
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error)
            setImportResult(result)
            showNotification('success', `Import selesai: ${result.success} berhasil, ${result.failed} gagal`)
            if (result.success > 0) fetchRecords()
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setImporting(false)
        }
    }

    const totalPages = Math.ceil(total / itemsPerPage)
    const releaseStatus = getReleaseStatus()
    const kelasOptions = Array.from(new Set(records.map(r => r.kelas).filter(Boolean))).sort() as string[]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                        Info Kelulusan
                    </h2>
                    <p className="text-slate-400 text-sm">Kelola data pengumuman kelulusan siswa.</p>
                </div>
                <button
                    onClick={() => { setShowImportModal(true); setImportResult(null); setImportFile(null) }}
                    className="inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-amber-600/20 border border-amber-500/50 rounded-xl hover:bg-amber-600/40 hover:-translate-y-0.5 transition-all"
                >
                    <svg className="w-5 h-5 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    Import Excel
                </button>
            </div>

            {/* Release Time Panel */}
            <div className="glass-panel p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Waktu Rilis Pengumuman</h3>
                        <p className={`text-xs font-medium ${releaseStatus.color}`}>{releaseStatus.label}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <input
                        type="datetime-local"
                        value={releaseTimeInput}
                        onChange={(e) => setReleaseTimeInput(e.target.value)}
                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                    <button
                        onClick={handleSaveTime}
                        disabled={savingTime || !releaseTimeInput}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {savingTime ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">Total Siswa</p>
                    <p className="text-3xl font-bold text-white">{total}</p>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">LULUS</p>
                    <p className="text-3xl font-bold text-green-400">{stats.lulus}</p>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">TIDAK LULUS</p>
                    <p className="text-3xl font-bold text-red-400">{stats.tidak_lulus}</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Cari nama atau NISN..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                        value={kelasFilter}
                        onChange={(e) => setKelasFilter(e.target.value)}
                    >
                        <option value="">Semua Kelas</option>
                        {kelasOptions.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden border border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20 border-b border-white/5">
                            <tr>
                                <th className="px-4 py-4">No</th>
                                <th className="px-4 py-4">Nama</th>
                                <th className="px-4 py-4">NISN</th>
                                <th className="px-4 py-4">No. Ujian</th>
                                <th className="px-4 py-4">Kelas</th>
                                <th className="px-4 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="px-4 py-4">
                                                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : records.length > 0 ? (
                                records.map((record, idx) => (
                                    <tr key={record.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-4 text-slate-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                        <td className="px-4 py-4 font-medium text-white">{record.nama || '-'}</td>
                                        <td className="px-4 py-4 font-mono text-slate-400 text-xs">{record.nisn}</td>
                                        <td className="px-4 py-4 text-slate-300">{record.no_ujian || '-'}</td>
                                        <td className="px-4 py-4 text-slate-300">{record.kelas || '-'}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                record.status === 'LULUS'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Belum ada data kelulusan. Import Excel untuk memulai.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && records.length > 0 && (
                    <div className="p-4 border-t border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <div className="text-slate-400">
                            Menampilkan <span className="font-semibold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, total)}</span> dari <span className="font-semibold text-white">{total}</span> data
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-slate-800 border border-white/10 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <div className="px-4 py-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-medium">
                                Halaman {currentPage} / {totalPages || 1}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg bg-slate-800 border border-white/10 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-2xl p-6 shadow-2xl relative border border-white/10">
                        <button
                            onClick={() => setShowImportModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <h3 className="text-2xl font-bold text-white mb-6">Import Data Kelulusan</h3>

                        {!importResult ? (
                            <div className="space-y-6">
                                <div className="glass-panel p-4 border border-amber-500/20 bg-amber-500/10">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-sm font-bold text-amber-400">Format Excel yang diperlukan:</h4>
                                        <button
                                            onClick={downloadTemplate}
                                            className="px-3 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-all"
                                        >
                                            Download Template
                                        </button>
                                    </div>
                                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                                        <li>No (opsional)</li>
                                        <li>Nama</li>
                                        <li>Tanggal Lahir</li>
                                        <li><strong>No. Peserta</strong> (wajib — digunakan untuk matching siswa)</li>
                                        <li>Kota</li>
                                        <li>No. Ujian</li>
                                        <li>Agama</li>
                                        <li>Kelas</li>
                                        <li><strong>Status</strong> (wajib — nilai: LULUS atau TIDAK LULUS)</li>
                                    </ul>
                                    <p className="text-xs text-orange-400 mt-3 font-medium">
                                        ⚠ Upload baru akan menghapus semua data kelulusan sebelumnya.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-3">Pilih File Excel (.xlsx)</label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="kelulusan-file-input"
                                    />
                                    <label
                                        htmlFor="kelulusan-file-input"
                                        className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
                                    >
                                        <div className="text-center">
                                            <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                            </svg>
                                            <p className="text-sm text-slate-300 font-medium">
                                                {importFile ? importFile.name : 'Klik untuk pilih file atau drag & drop'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">File .xlsx atau .xls</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowImportModal(false)}
                                        className="flex-1 py-3 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleImport}
                                        disabled={!importFile || importing}
                                        className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {importing ? 'Mengimport...' : 'Import Data'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="glass-panel p-4 text-center">
                                        <p className="text-sm text-slate-400 mb-1">Total</p>
                                        <p className="text-2xl font-bold text-white">{importResult.total}</p>
                                    </div>
                                    <div className="glass-panel p-4 text-center border border-green-500/20 bg-green-500/10">
                                        <p className="text-sm text-green-400 mb-1">Berhasil</p>
                                        <p className="text-2xl font-bold text-green-400">{importResult.success}</p>
                                    </div>
                                    <div className="glass-panel p-4 text-center border border-red-500/20 bg-red-500/10">
                                        <p className="text-sm text-red-400 mb-1">Gagal</p>
                                        <p className="text-2xl font-bold text-red-400">{importResult.failed}</p>
                                    </div>
                                </div>
                                {importResult.details?.failed?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-red-400 mb-3">Data yang Gagal:</h4>
                                        <div className="max-h-60 overflow-y-auto space-y-2">
                                            {importResult.details.failed.map((fail: any, idx: number) => (
                                                <div key={idx} className="glass-panel p-3 border border-red-500/20 bg-red-500/5">
                                                    <p className="text-xs text-slate-300">
                                                        <span className="font-semibold">Baris {fail.row}</span>
                                                        {fail.nisn && <span> • NISN: {fail.nisn}</span>}
                                                    </p>
                                                    <p className="text-xs text-red-400 mt-1">{fail.reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={() => { setShowImportModal(false); setImportResult(null); setImportFile(null) }}
                                    className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all"
                                >
                                    Tutup
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification.show && (
                <div className="fixed bottom-4 right-4 z-[90]">
                    <div className={`glass-panel px-6 py-4 shadow-2xl border flex items-center gap-3 ${
                        notification.type === 'success'
                            ? 'border-green-500/50 bg-green-500/10'
                            : 'border-red-500/50 bg-red-500/10'
                    }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            {notification.type === 'success'
                                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            }
                        </div>
                        <span className="text-white font-medium">{notification.message}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
