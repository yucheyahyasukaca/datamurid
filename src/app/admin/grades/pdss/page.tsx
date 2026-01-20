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
            tahun_ajaran: grade.tahun_ajaran || '2024/2025',
            semester: grade.semester || '',
            keterangan: grade.keterangan || ''
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({
            student_id: '',
            total_semua_mapel: '',
            total_3_mapel_utama: '',
            total_mapel_pilihan: '',
            peringkat: '',
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
                'Tahun Ajaran': '2024/2025',
                'Semester': '',
                'Keterangan': ''
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
                'Jumlah Nilai Semua Mapel (SMT 1 - 5)': g.total_semua_mapel,
                'Jumlah 3 Mapel Utama': g.total_3_mapel_utama,
                'Jumlah Mapel Pilihan (SMT 3-5)': g.total_mapel_pilihan,
                'Peringkat di PDSS': g.peringkat,
                'Tahun Ajaran': g.tahun_ajaran,
                'Semester': g.semester,
                'Keterangan': g.keterangan
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
                        <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                        </svg>
                        Import Excel
                    </button>
                    <button
                        onClick={handleExport}
                        className="group relative inline-flex items-center justify-center flex-1 md:flex-none px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-emerald-600/20 border border-emerald-500/50 rounded-xl hover:bg-emerald-600/40 hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Export Excel
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="group relative inline-flex items-center justify-center flex-1 md:flex-none px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Tambah Nilai
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
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
                <div className="w-full md:w-48">
                    <select
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-all"
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

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">Total Siswa</p>
                    <p className="text-3xl font-bold text-white">{totalGrades}</p>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">Rata-rata Total</p>
                    <p className="text-3xl font-bold text-emerald-400">
                        {grades.length > 0
                            ? (grades.reduce((sum, g) => sum + (g.total_semua_mapel || 0), 0) / grades.filter(g => g.total_semua_mapel).length).toFixed(1)
                            : '0'}
                    </p>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">Tertinggi</p>
                    <p className="text-3xl font-bold text-blue-400">
                        {grades.length > 0 ? Math.max(...grades.map(g => g.total_semua_mapel || 0)).toFixed(1) : '0'}
                    </p>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">Terendah</p>
                    <p className="text-3xl font-bold text-orange-400">
                        {grades.length > 0 ? Math.min(...grades.filter(g => g.total_semua_mapel).map(g => g.total_semua_mapel || 0)).toFixed(1) : '0'}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden border border-white/10">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20 border-b border-white/5">
                            <tr>
                                <th className="px-4 py-4">No</th>
                                <th className="px-4 py-4">Nama</th>
                                <th className="px-4 py-4">NISN</th>
                                <th className="px-4 py-4">Kelas</th>
                                <th className="px-4 py-4 text-center">Jml. Semua Mapel</th>
                                <th className="px-4 py-4 text-center">Jml. 3 Mapel Utama</th>
                                <th className="px-4 py-4 text-center">Jml. Mapel Pilihan</th>
                                <th className="px-4 py-4 text-center">Peringkat</th>
                                <th className="px-4 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 9 }).map((_, j) => (
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
                                        <td className="px-4 py-4 text-slate-300">{grade.students.rombel}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="font-bold text-lg text-emerald-400">{grade.total_semua_mapel || '-'}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center font-bold text-slate-300">{grade.total_3_mapel_utama || '-'}</td>
                                        <td className="px-4 py-4 text-center font-bold text-slate-300">{grade.total_mapel_pilihan || '-'}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40">
                                                #{grade.peringkat || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(grade)}
                                                    className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({ show: true, gradeId: grade.id, studentName: grade.students.nama })}
                                                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                                                    title="Hapus"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                                        Data tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4 p-4">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-white/5 space-y-4 animate-pulse">
                                <div className="h-5 bg-slate-700/50 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                            </div>
                        ))
                    ) : grades.length > 0 ? (
                        grades.map((grade) => (
                            <div key={grade.id} className="bg-slate-800/50 rounded-xl p-4 border border-white/5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-white">{grade.students.nama}</h3>
                                        <p className="text-xs text-slate-400">{grade.students.nisn} • {grade.students.rombel}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-emerald-400">{grade.total_semua_mapel || '-'}</span>
                                        <p className="text-xs text-blue-400 font-bold">Rank #{grade.peringkat || '-'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-white/5 p-2 rounded">
                                        <p className="text-slate-500 text-xs">Jml 3 Mapel Utama</p>
                                        <p className="text-white font-bold">{grade.total_3_mapel_utama || '-'}</p>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded">
                                        <p className="text-slate-500 text-xs">Jml Mapel Pilihan</p>
                                        <p className="text-white font-bold">{grade.total_mapel_pilihan || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-white/5">
                                    <button
                                        onClick={() => openEditModal(grade)}
                                        className="flex-1 py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-medium transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm({ show: true, gradeId: grade.id, studentName: grade.students.nama })}
                                        className="flex-1 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500">Data tidak ditemukan.</div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && grades.length > 0 && (
                    <div className="p-4 border-t border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <div className="text-slate-400">
                            Menampilkan <span className="font-semibold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, totalGrades)}</span> dari <span className="font-semibold text-white">{totalGrades}</span> data
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-slate-800 border border-white/10 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <div className="px-4 py-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-medium">
                                Halaman {currentPage} / {totalPages || 1}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-slate-800 border border-white/10 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                    <div className="glass-panel w-full max-w-4xl p-6 shadow-2xl relative border border-white/10 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-6">
                            {modalMode === 'create' ? 'Tambah Nilai PDSS' : 'Edit Nilai PDSS'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Student Selection */}
                            <div>
                                <label className="text-sm font-semibold text-slate-300 mb-2 block">Siswa *</label>
                                <select
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                    value={formData.student_id}
                                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                    required
                                >
                                    <option value="">Pilih Siswa</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.nama} ({s.nisn})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Scores */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Nilai Akumulasi (Semester 1-5)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="glass-panel p-4 md:col-span-2">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Jumlah Nilai Semua Mapel</p>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                            placeholder="Nilai Total"
                                            value={formData.total_semua_mapel}
                                            onChange={(e) => setFormData({ ...formData, total_semua_mapel: e.target.value })}
                                        />
                                    </div>
                                    <div className="glass-panel p-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Jumlah 3 Mapel Utama</p>
                                        <p className="text-xs text-slate-500 mb-2">(B.Indonesia, Matematika Umum, B.Inggris)</p>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                            placeholder="Nilai 3 Mapel"
                                            value={formData.total_3_mapel_utama}
                                            onChange={(e) => setFormData({ ...formData, total_3_mapel_utama: e.target.value })}
                                        />
                                    </div>
                                    <div className="glass-panel p-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Jumlah Mapel Pilihan</p>
                                        <p className="text-xs text-slate-500 mb-2">(Semester 3-5)</p>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                            placeholder="Nilai Mapel Pilihan"
                                            value={formData.total_mapel_pilihan}
                                            onChange={(e) => setFormData({ ...formData, total_mapel_pilihan: e.target.value })}
                                        />
                                    </div>
                                    <div className="glass-panel p-4 md:col-span-2">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Peringkat PDSS</p>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                            placeholder="Peringkat"
                                            value={formData.peringkat}
                                            onChange={(e) => setFormData({ ...formData, peringkat: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Informasi Tambahan</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="glass-panel p-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Tahun Ajaran</p>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                            placeholder="YYYY/YYYY"
                                            value={formData.tahun_ajaran}
                                            onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })}
                                        />
                                    </div>
                                    <div className="glass-panel p-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Keterangan</p>
                                        <textarea
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                            placeholder="Catatan tambahan..."
                                            rows={2}
                                            value={formData.keterangan}
                                            onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                    <div className="glass-panel w-full max-w-md p-6 shadow-2xl relative border border-white/10">
                        <button
                            onClick={() => setShowImportModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>

                        <h3 className="text-xl font-bold text-white mb-6">Import Data PDSS</h3>

                        <div className="space-y-6">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                <p className="text-sm text-blue-200 mb-3">
                                    Gunakan template Excel yang sesual format. Download template jika belum punya.
                                </p>
                                <button
                                    onClick={downloadTemplate}
                                    className="text-sm font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                    Download Template
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">File Excel</label>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleImport}
                                    disabled={importing || !importFile}
                                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                >
                                    {importing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Mengimport...
                                        </>
                                    ) : (
                                        'Import Sekarang'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification.show && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in z-50 ${notification.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-100' : 'bg-red-500/20 border border-red-500/50 text-red-100'
                    }`}>
                    {notification.type === 'success' ? (
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    )}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                    <div className="glass-panel w-full max-w-md p-6 shadow-2xl relative border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-2">Hapus Data?</h3>
                        <p className="text-slate-400 mb-6">
                            Apakah Anda yakin ingin menghapus data nilai PDSS untuk siswa <span className="font-bold text-white">{deleteConfirm.studentName}</span>? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ show: false, gradeId: '', studentName: '' })}
                                className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all font-medium"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
