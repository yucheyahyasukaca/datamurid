'use client'

import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import * as XLSX from 'xlsx'

interface PDSSGrade {
    id: string
    student_id: string
    total_semua_mapel: number | null
    total_3_mapel_utama: number | null
    total_mapel_pilihan: number | null
    peringkat: number | null
    status: string | null
    is_published: boolean
    tahun_ajaran: string | null
    semester: string | null
    keterangan: string | null
    students: {
        nama: string
        nisn: string
        rombel: string
    }
}

interface Student {
    id: string
    nama: string
    nisn: string
    rombel: string
}

export default function AdminPDSSGradesPage() {
    // Filter State
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)
    const [kelasFilter, setKelasFilter] = useState('')

    // Data State
    const [grades, setGrades] = useState<PDSSGrade[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [totalGrades, setTotalGrades] = useState(0)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    // Modal States
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [editingGrade, setEditingGrade] = useState<PDSSGrade | null>(null)
    const [formData, setFormData] = useState({
        student_id: '',
        total_semua_mapel: '',
        total_3_mapel_utama: '',
        total_mapel_pilihan: '',
        peringkat: '',
        status: 'Eligible',
        is_published: false,
        tahun_ajaran: '2024/2025',
        semester: '',
        keterangan: ''
    })

    // Delete Confirmation
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; gradeId: string; studentName: string }>({
        show: false,
        gradeId: '',
        studentName: ''
    })

    // Bulk Action Confirmation
    const [bulkConfirm, setBulkConfirm] = useState<{ show: boolean; action: 'publish_all' | 'unpublish_all' | null }>({
        show: false,
        action: null
    })

    // Import Modal
    const [showImportModal, setShowImportModal] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState<any>(null)

    // Notification
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    })

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message })
        setTimeout(() => setNotification({ show: false, type: 'success', message: '' }), 3000)
    }

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearchTerm, kelasFilter])

    useEffect(() => {
        fetchGrades()
    }, [currentPage, debouncedSearchTerm, kelasFilter])

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchGrades = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.append('page', currentPage.toString())
            params.append('limit', itemsPerPage.toString())
            if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
            if (kelasFilter) params.append('kelas', kelasFilter)

            const res = await fetch(`/api/admin/grades/pdss?${params.toString()}`)
            const result = await res.json()

            if (!res.ok) throw new Error(result.error || 'Failed to fetch PDSS grades')

            setGrades(result.data || [])
            setTotalGrades(result.total || 0)
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/admin/students?limit=-1')
            const result = await res.json()
            if (res.ok) {
                setStudents(result.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch students:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = '/api/admin/grades/pdss'
            const method = modalMode === 'create' ? 'POST' : 'PUT'

            const payload = modalMode === 'edit' && editingGrade
                ? { ...formData, id: editingGrade.id }
                : formData

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Failed to save PDSS grade')

            showNotification('success', `Nilai PDSS berhasil ${modalMode === 'create' ? 'ditambahkan' : 'diperbarui'}!`)
            setShowModal(false)
            resetForm()
            fetchGrades()
        } catch (error: any) {
            showNotification('error', error.message)
        }
    }

    const handleDelete = async () => {
        try {
            const res = await fetch('/api/admin/grades/pdss', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: deleteConfirm.gradeId })
            })

            if (!res.ok) throw new Error('Failed to delete grade')

            showNotification('success', 'Nilai PDSS berhasil dihapus!')
            setDeleteConfirm({ show: false, gradeId: '', studentName: '' })
            fetchGrades()
        } catch (error: any) {
            showNotification('error', error.message)
        }
    }

    const handleBulkAction = async () => {
        if (!bulkConfirm.action) return

        try {
            const res = await fetch('/api/admin/grades/pdss/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: bulkConfirm.action })
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Gagal melakukan aksi')

            showNotification('success', result.message)
            setBulkConfirm({ show: false, action: null })
            fetchGrades()
        } catch (error: any) {
            showNotification('error', error.message)
        }
    }

    const openCreateModal = () => {
        setModalMode('create')
        resetForm()
        setShowModal(true)
    }

    const openEditModal = (grade: PDSSGrade) => {
        setModalMode('edit')
        setEditingGrade(grade)
        setFormData({
            student_id: grade.student_id,
            total_semua_mapel: grade.total_semua_mapel?.toString() || '',
            total_3_mapel_utama: grade.total_3_mapel_utama?.toString() || '',
            total_mapel_pilihan: grade.total_mapel_pilihan?.toString() || '',
            peringkat: grade.peringkat?.toString() || '',
            status: grade.status || 'Eligible',
            is_published: grade.is_published || false,
            tahun_ajaran: grade.tahun_ajaran || '2024/2025',
            semester: grade.semester || '',
            keterangan: grade.keterangan || ''
        })
        setShowModal(true)
    }

    const handleToggleVisibility = async (grade: PDSSGrade) => {
        try {
            const newVisibility = !grade.is_published

            // Optimistic update
            setGrades(prev => prev.map(g => g.id === grade.id ? { ...g, is_published: newVisibility } : g))

            const res = await fetch('/api/admin/grades/pdss', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: grade.id, is_published: newVisibility })
            })

            if (!res.ok) {
                // Revert if failed
                setGrades(prev => prev.map(g => g.id === grade.id ? { ...g, is_published: !newVisibility } : g))
                throw new Error('Failed to update visibility')
            }

            showNotification('success', `Data berhasil ${newVisibility ? 'ditampilkan' : 'disembunyikan'} dari siswa`)
        } catch (error: any) {
            showNotification('error', error.message)
        }
    }

    const resetForm = () => {
        setFormData({
            student_id: '',
            total_semua_mapel: '',
            total_3_mapel_utama: '',
            total_mapel_pilihan: '',
            peringkat: '',
            status: 'Eligible',
            is_published: false,
            tahun_ajaran: '2024/2025',
            semester: '',
            keterangan: ''
        })
        setEditingGrade(null)
    }

    const downloadTemplate = () => {
        const template = [
            {
                'Nama': '',
                'NISN': '',
                'Kelas': '',
                'Jumlah Nilai Semua Mapel (SMT 1 - 5)': '',
                'Jumlah 3 Mapel Utama (B.Indo, Mat Umum, B.Ing)': '',
                'Jumlah Mapel Pilihan (SMT 3-5)': '',
                'Peringkat di PDSS': '',
                'Status': 'Eligible',
                'Keterangan (Pesan/Petunjuk)': '',
                'Tahun Ajaran': '2024/2025'
            }
        ]

        const ws = XLSX.utils.json_to_sheet(template)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Template PDSS")
        XLSX.writeFile(wb, "Template_Import_PDSS.xlsx")

        showNotification('success', 'Template berhasil didownload!')
    }

    const handleImport = async () => {
        if (!importFile) {
            showNotification('error', 'Pilih file Excel terlebih dahulu')
            return
        }

        try {
            setImporting(true)
            const formData = new FormData()
            formData.append('file', importFile)

            const res = await fetch('/api/admin/grades/pdss/import', {
                method: 'POST',
                body: formData
            })

            const result = await res.json()

            if (!res.ok) throw new Error(result.error || 'Gagal import data')

            setImportResult(result)
            showNotification('success', `Berhasil import ${result.success} data, gagal ${result.failed} data`)

            if (result.success > 0) {
                fetchGrades()
            }
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setImporting(false)
        }
    }

    const handleExport = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.append('limit', '-1')
            if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
            if (kelasFilter) params.append('kelas', kelasFilter)

            const res = await fetch(`/api/admin/grades/pdss?${params.toString()}`)
            const result = await res.json()

            if (!res.ok) throw new Error(result.error || 'Gagal mengambil data')

            const exportData = (result.data || []).map((g: PDSSGrade) => ({
                'Nama': g.students.nama,
                'NISN': g.students.nisn,
                'Kelas': g.students.rombel,
                'Jumlah Nilai Semua Mapel (SMT 1-5)': g.total_semua_mapel,
                'Jumlah 3 Mapel Utama': g.total_3_mapel_utama,
                'Jumlah Mapel Pilihan (SMT 3-5)': g.total_mapel_pilihan,
                'Peringkat di PDSS': g.peringkat,
                'Status': g.status,
                'Keterangan (Pesan/Petunjuk)': g.keterangan,
                'Tahun Ajaran': g.tahun_ajaran,
                'Published': g.is_published ? 'Ya' : 'Tidak'
            }))

            const ws = XLSX.utils.json_to_sheet(exportData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Data Nilai PDSS")
            XLSX.writeFile(wb, `Data_Nilai_PDSS_${new Date().toISOString().slice(0, 10)}.xlsx`)

            showNotification('success', 'Data berhasil di-export!')
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string | null) => {
        if (!status) return <span className="text-slate-400">-</span>

        switch (status) {
            case 'Eligible':
                return <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/40">Eligibel</span>
            case 'Tidak Eligible':
                return <span className="px-2 py-1 rounded-md text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">Tidak Eligibel</span>
            case 'Mengundurkan Diri':
                return <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">Mengundurkan Diri</span>
            default:
                return <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/40">{status}</span>
        }
    }

    const totalPages = Math.ceil(totalGrades / itemsPerPage)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                        Data Nilai PDSS
                    </h2>
                    <p className="text-slate-400 text-sm">Kelola data nilai PDSS siswa (Kumulatif SMT 1-5).</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="group relative inline-flex items-center justify-center flex-1 md:flex-none px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-purple-600/20 border border-purple-500/50 rounded-xl hover:bg-purple-600/40 hover:-translate-y-0.5"
                    >
                        Import
                    </button>
                    <button
                        onClick={handleExport}
                        className="group relative inline-flex items-center justify-center flex-1 md:flex-none px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-emerald-600/20 border border-emerald-500/50 rounded-xl hover:bg-emerald-600/40 hover:-translate-y-0.5"
                    >
                        Export
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="group relative inline-flex items-center justify-center flex-1 md:flex-none px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                    >
                        + Tambah
                    </button>
                </div>
            </div>

            {/* Bulk Actions & Search */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Cari nama siswa atau NISN..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setBulkConfirm({ show: true, action: 'publish_all' })}
                        className="px-4 py-2.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-all whitespace-nowrap"
                    >
                        Tampilkan Semua
                    </button>
                    <button
                        onClick={() => setBulkConfirm({ show: true, action: 'unpublish_all' })}
                        className="px-4 py-2.5 text-xs font-bold text-slate-400 bg-slate-500/10 border border-slate-500/30 rounded-lg hover:bg-slate-500/20 transition-all whitespace-nowrap"
                    >
                        Sembunyikan Semua
                    </button>
                    <select
                        className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        value={kelasFilter}
                        onChange={(e) => setKelasFilter(e.target.value)}
                    >
                        <option value="">Semua Kelas</option>
                        {Array.from(new Set(students.map(s => s.rombel).filter(Boolean)))
                            .sort()
                            .map(kelas => (
                                <option key={kelas} value={kelas}>{kelas}</option>
                            ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden border border-white/10">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20 border-b border-white/5">
                            <tr>
                                <th className="px-4 py-4">No</th>
                                <th className="px-4 py-4">Nama</th>
                                <th className="px-4 py-4">NISN</th>
                                <th className="px-4 py-4 text-center">Total Nilai</th>
                                <th className="px-4 py-4 text-center">Peringkat</th>
                                <th className="px-4 py-4 text-center">Status</th>
                                <th className="px-4 py-4 text-center">Tampil</th>
                                <th className="px-4 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <td key={j} className="px-4 py-4">
                                                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : grades.length > 0 ? (
                                grades.map((grade, idx) => (
                                    <tr key={grade.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-4">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                        <td className="px-4 py-4 font-medium text-white">{grade.students.nama}</td>
                                        <td className="px-4 py-4 font-mono text-slate-400 text-xs">{grade.students.nisn}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="font-bold text-emerald-400">{grade.total_semua_mapel || '-'}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40">
                                                #{grade.peringkat || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {getStatusBadge(grade.status)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleVisibility(grade)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${grade.is_published ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                            >
                                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${grade.is_published ? 'translate-x-5' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openEditModal(grade)} className="text-blue-400 p-1 hover:text-blue-300"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                                                <button onClick={() => setDeleteConfirm({ show: true, gradeId: grade.id, studentName: grade.students.nama })} className="text-red-400 p-1 hover:text-red-300"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500">Data tidak ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-white/5 bg-black/20">
                <p className="text-sm text-slate-400">
                    Menampilkan <span className="font-bold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-white">{Math.min(currentPage * itemsPerPage, totalGrades)}</span> dari <span className="font-bold text-white">{totalGrades}</span> data
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                        Sebelumnya
                    </button>
                    <span className="px-3 py-1.5 text-slate-400 text-sm">
                        Hal {currentPage} dari {totalPages || 1}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                        Selanjutnya
                    </button>
                </div>
            </div>

            {/* Confirms Modals... */}
            {bulkConfirm.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                    <div className="glass-panel w-full max-w-sm p-6 shadow-2xl relative border border-white/10 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <h3 className="text-xl font-bold text-white mb-2">Konfirmasi Aksi Massal</h3>
                        <p className="text-slate-400 mb-6">
                            Apakah Anda yakin ingin <span className="text-white font-bold">{bulkConfirm.action === 'publish_all' ? 'MENAMPILKAN' : 'MENYEMBUNYIKAN'}</span> semua data nilai PDSS untuk siswa?
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setBulkConfirm({ show: false, action: null })} className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5">Batal</button>
                            <button onClick={handleBulkAction} className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30">Ya, Lanjutkan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                    <div className="glass-panel w-full max-w-4xl p-6 shadow-2xl relative border border-white/10 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <h3 className="text-2xl font-bold text-white mb-6">{modalMode === 'create' ? 'Tambah Nilai PDSS' : 'Edit Nilai PDSS'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ... same form fields as before ... */}
                            <div>
                                <label className="text-sm font-semibold text-slate-300 mb-2 block">Siswa *</label>
                                <select className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white" value={formData.student_id} onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} required>
                                    <option value="">Pilih Siswa</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.nama} ({s.nisn})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="glass-panel p-4 md:col-span-2">
                                    <p className="text-sm font-semibold text-slate-300 mb-3">Jumlah Nilai Semua Mapel</p>
                                    <input type="number" step="0.01" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Nilai Total" value={formData.total_semua_mapel} onChange={(e) => setFormData({ ...formData, total_semua_mapel: e.target.value })} />
                                </div>
                                <div className="glass-panel p-4">
                                    <p className="text-sm font-semibold text-slate-300 mb-3">Jumlah 3 Mapel Utama</p>
                                    <input type="number" step="0.01" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Nilai 3 Mapel" value={formData.total_3_mapel_utama} onChange={(e) => setFormData({ ...formData, total_3_mapel_utama: e.target.value })} />
                                </div>
                                <div className="glass-panel p-4">
                                    <p className="text-sm font-semibold text-slate-300 mb-3">Jumlah Mapel Pilihan</p>
                                    <input type="number" step="0.01" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Nilai Mapel Pilihan" value={formData.total_mapel_pilihan} onChange={(e) => setFormData({ ...formData, total_mapel_pilihan: e.target.value })} />
                                </div>
                                <div className="glass-panel p-4">
                                    <p className="text-sm font-semibold text-slate-300 mb-3">Peringkat PDSS</p>
                                    <input type="number" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Peringkat" value={formData.peringkat} onChange={(e) => setFormData({ ...formData, peringkat: e.target.value })} />
                                </div>
                                <div className="glass-panel p-4">
                                    <p className="text-sm font-semibold text-slate-300 mb-3">Status</p>
                                    <select className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Eligible">Eligible</option>
                                        <option value="Tidak Eligible">Tidak Eligible</option>
                                        <option value="Mengundurkan Diri">Mengundurkan Diri</option>
                                    </select>
                                </div>
                                <div className="glass-panel p-4">
                                    <p className="text-sm font-semibold text-slate-300 mb-3">Tampilkan di Siswa?</p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_published: !formData.is_published })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.is_published ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <span className="text-sm text-slate-300">{formData.is_published ? 'Ya, Tampilkan' : 'Tidak, Sembunyikan'}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Informasi Lainnya</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="glass-panel p-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Tahun Ajaran</p>
                                        <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white" value={formData.tahun_ajaran} onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })} />
                                    </div>
                                    <div className="glass-panel p-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Keterangan</p>
                                        <textarea className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white" rows={2} value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5">Batal</button>
                                <button type="submit" className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }

            {/* Import Modal with Progress & Details */}
            {
                showImportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                        <div className="glass-panel w-full max-w-md p-6 shadow-2xl relative border border-white/10 overflow-hidden flex flex-col max-h-[80vh]">
                            <button onClick={() => { if (!importing) setShowImportModal(false) }} className={`absolute top-4 right-4 text-slate-400 hover:text-white ${importing ? 'opacity-0 cursor-default' : ''}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <h3 className="text-xl font-bold text-white mb-6">Import Data PDSS</h3>

                            <div className="overflow-y-auto pr-2 custom-scrollbar">
                                {!importing && !importResult && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                            <p className="text-sm text-blue-200 mb-3 leading-relaxed">
                                                Gunakan template terbaru. Pastikan kolom <span className="font-bold">Nama</span> atau <span className="font-bold">NISN</span> sesuai data siswa.
                                            </p>
                                            <button onClick={downloadTemplate} className="text-sm font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1">Download Template</button>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300">File Excel</label>
                                            <input type="file" accept=".xlsx, .xls" onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400" />
                                        </div>
                                        <div className="pt-4">
                                            <button onClick={handleImport} disabled={!importFile} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center disabled:opacity-50 hover:shadow-lg hover:shadow-blue-500/30 transition-all">Import Sekarang</button>
                                        </div>
                                    </div>
                                )}

                                {/* Progress Indicator */}
                                {importing && (
                                    <div className="py-8 text-center space-y-4">
                                        <div className="relative w-full h-4 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="absolute top-0 left-0 h-full bg-blue-500 animate-progress-indeterminate rounded-full w-1/3"></div>
                                        </div>
                                        <p className="text-blue-300 font-medium animate-pulse">Sedang memproses data... Mohon tunggu.</p>
                                        <p className="text-xs text-slate-500">Jangan tutup halaman ini.</p>
                                    </div>
                                )}

                                {/* Result Report */}
                                {!importing && importResult && (
                                    <div className="space-y-6 animate-slide-in">
                                        <div className="text-center">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${importResult.success > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {importResult.success > 0 ? (
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                ) : (
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                )}
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-1">Import Selesai</h4>
                                            <p className="text-slate-400 text-sm">
                                                Berhasil: <span className="text-emerald-400 font-bold">{importResult.success}</span> | Gagal: <span className="text-red-400 font-bold">{importResult.failed}</span>
                                            </p>
                                        </div>

                                        {importResult.failed > 0 && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl overflow-hidden">
                                                <div className="px-4 py-2 bg-red-500/20 border-b border-red-500/20">
                                                    <p className="text-xs font-bold text-red-200 uppercase tracking-wider">Detail Error</p>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto p-4 space-y-2 text-left">
                                                    {importResult.errors.map((err: any, idx: number) => (
                                                        <div key={idx} className="text-xs text-red-300 border-b border-red-500/10 pb-2 last:border-0 last:pb-0">
                                                            <span className="font-bold block mb-0.5">Baris {err.row} ({err.name || 'Tanpa Nama'}):</span>
                                                            {err.error}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button onClick={() => { setImportResult(null); setImportFile(null); setShowImportModal(false); }} className="w-full px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all">
                                            Tutup
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                deleteConfirm.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                        <div className="glass-panel w-full max-w-sm p-6 shadow-2xl relative border border-white/10 text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            <h3 className="text-xl font-bold text-white mb-2">Hapus Data?</h3>
                            <p className="text-slate-400 mb-6">Apakah Anda yakin ingin menghapus nilai PDSS untuk siswa <span className="text-white font-bold">{deleteConfirm.studentName}</span>?</p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setDeleteConfirm({ show: false, gradeId: '', studentName: '' })} className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5">Batal</button>
                                <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30">Hapus</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Notification */}
            {
                notification.show && (
                    <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in z-50 ${notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' : 'bg-red-500/20 border-red-500/50 text-red-100'}`}>
                        <span className="font-medium">{notification.message}</span>
                    </div>
                )
            }
        </div >
    )
}
