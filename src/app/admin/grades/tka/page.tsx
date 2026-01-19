'use client'

import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import * as XLSX from 'xlsx'

interface TKAGrade {
    id: string
    student_id: string
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

export default function AdminTKAGradesPage() {
    // Filter State
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)
    const [kelasFilter, setKelasFilter] = useState('')
    const [subjectFilter, setSubjectFilter] = useState('')

    // Data State
    const [grades, setGrades] = useState<TKAGrade[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [subjects, setSubjects] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [totalGrades, setTotalGrades] = useState(0)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    // Modal States
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [editingGrade, setEditingGrade] = useState<TKAGrade | null>(null)
    const [formData, setFormData] = useState({
        student_id: '',
        bahasa_indonesia_nilai: '',
        bahasa_indonesia_kategori: '',
        matematika_nilai: '',
        matematika_kategori: '',
        bahasa_inggris_nilai: '',
        bahasa_inggris_kategori: '',
        total_wajib: '',
        mapel_pilihan_1: '',
        mapel_pilihan_1_nilai: '',
        mapel_pilihan_1_kategori: '',
        mapel_pilihan_2: '',
        mapel_pilihan_2_nilai: '',
        mapel_pilihan_2_kategori: '',
        total_nilai: '',
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
    }, [debouncedSearchTerm, kelasFilter, subjectFilter])

    useEffect(() => {
        fetchGrades()
    }, [currentPage, debouncedSearchTerm, kelasFilter, subjectFilter])

    useEffect(() => {
        fetchStudents()
        fetchSubjects()
    }, [])

    const fetchGrades = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.append('page', currentPage.toString())
            params.append('limit', itemsPerPage.toString())
            if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
            if (kelasFilter) params.append('kelas', kelasFilter)
            if (subjectFilter) params.append('mapel', subjectFilter)

            const res = await fetch(`/api/admin/grades/tka?${params.toString()}`)
            const result = await res.json()

            if (!res.ok) throw new Error(result.error || 'Failed to fetch TKA grades')

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

    const fetchSubjects = async () => {
        try {
            const res = await fetch('/api/admin/grades/tka/subjects')
            const result = await res.json()
            if (res.ok) {
                setSubjects(result.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch subjects:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = '/api/admin/grades/tka'
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
            if (!res.ok) throw new Error(result.error || 'Failed to save TKA grade')

            showNotification('success', `Nilai TKA berhasil ${modalMode === 'create' ? 'ditambahkan' : 'diperbarui'}!`)
            setShowModal(false)
            resetForm()
            fetchGrades()
        } catch (error: any) {
            showNotification('error', error.message)
        }
    }

    const handleDelete = async () => {
        try {
            const res = await fetch('/api/admin/grades/tka', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: deleteConfirm.gradeId })
            })

            if (!res.ok) throw new Error('Failed to delete grade')

            showNotification('success', 'Nilai TKA berhasil dihapus!')
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

    const openEditModal = (grade: TKAGrade) => {
        setModalMode('edit')
        setEditingGrade(grade)
        setFormData({
            student_id: grade.student_id,
            matematika_nilai: grade.matematika_nilai?.toString() || '',
            matematika_kategori: grade.matematika_kategori || '',
            bahasa_indonesia_nilai: grade.bahasa_indonesia_nilai?.toString() || '',
            bahasa_indonesia_kategori: grade.bahasa_indonesia_kategori || '',
            bahasa_inggris_nilai: grade.bahasa_inggris_nilai?.toString() || '',
            bahasa_inggris_kategori: grade.bahasa_inggris_kategori || '',
            total_wajib: grade.total_wajib?.toString() || '',
            mapel_pilihan_1: grade.mapel_pilihan_1 || '',
            mapel_pilihan_1_nilai: grade.mapel_pilihan_1_nilai?.toString() || '',
            mapel_pilihan_1_kategori: grade.mapel_pilihan_1_kategori || '',
            mapel_pilihan_2: grade.mapel_pilihan_2 || '',
            mapel_pilihan_2_nilai: grade.mapel_pilihan_2_nilai?.toString() || '',
            mapel_pilihan_2_kategori: grade.mapel_pilihan_2_kategori || '',
            total_nilai: grade.total_nilai?.toString() || '',
            tahun_ajaran: grade.tahun_ajaran || '2024/2025',
            semester: grade.semester || '',
            keterangan: grade.keterangan || ''
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({
            student_id: '',
            bahasa_indonesia_nilai: '',
            bahasa_indonesia_kategori: '',
            matematika_nilai: '',
            matematika_kategori: '',
            bahasa_inggris_nilai: '',
            bahasa_inggris_kategori: '',
            total_wajib: '',
            mapel_pilihan_1: '',
            mapel_pilihan_1_nilai: '',
            mapel_pilihan_1_kategori: '',
            mapel_pilihan_2: '',
            mapel_pilihan_2_nilai: '',
            mapel_pilihan_2_kategori: '',
            total_nilai: '',
            tahun_ajaran: '2024/2025',
            semester: '',
            keterangan: ''
        })
        setEditingGrade(null)
    }

    const downloadTemplate = () => {
        // Create template with headers
        const template = [
            {
                'Nama': '',
                'NISN': '',
                'Kelas': '',
                'Bahasa Indonesia': '',
                'Bahasa Indonesia Kategori': '',
                'Matematika': '',
                'Matematika Kategori': '',
                'Bahasa Inggris': '',
                'Bahasa Inggris Kategori': '',
                'Total Wajib': '',
                'Mata Pelajaran Pilihan 1': '',
                'Pilihan 1 Nilai': '',
                'Pilihan 1 Kategori': '',
                'Mata Pelajaran Pilihan 2': '',
                'Pilihan 2 Nilai': '',
                'Pilihan 2 Kategori': '',
                'Total': '',
                'Tahun Ajaran': '2024/2025',
                'Semester': '',
                'Keterangan': ''
            }
        ]

        const ws = XLSX.utils.json_to_sheet(template)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Template TKA")
        XLSX.writeFile(wb, "Template_Import_TKA.xlsx")

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

            const res = await fetch('/api/admin/grades/tka/import', {
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
            if (subjectFilter) params.append('mapel', subjectFilter)

            const res = await fetch(`/api/admin/grades/tka?${params.toString()}`)
            const result = await res.json()

            if (!res.ok) throw new Error(result.error || 'Gagal mengambil data')

            const exportData = (result.data || []).map((g: TKAGrade) => ({
                'Nama': g.students.nama,
                'NISN': g.students.nisn,
                'Kelas': g.students.rombel,
                'Mat - Nilai': g.matematika_nilai,
                'Mat - Kategori': g.matematika_kategori,
                'B.Ind - Nilai': g.bahasa_indonesia_nilai,
                'B.Ind - Kategori': g.bahasa_indonesia_kategori,
                'B.Ing - Nilai': g.bahasa_inggris_nilai,
                'B.Ing - Kategori': g.bahasa_inggris_kategori,
                'Pilihan 1': g.mapel_pilihan_1,
                'Pilihan 1 - Nilai': g.mapel_pilihan_1_nilai,
                'Pilihan 1 - Kategori': g.mapel_pilihan_1_kategori,
                'Pilihan 2': g.mapel_pilihan_2,
                'Pilihan 2 - Nilai': g.mapel_pilihan_2_nilai,
                'Pilihan 2 - Kategori': g.mapel_pilihan_2_kategori,
                'Total': g.total_nilai,
                'Tahun Ajaran': g.tahun_ajaran,
                'Semester': g.semester,
                'Keterangan': g.keterangan
            }))

            const ws = XLSX.utils.json_to_sheet(exportData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Data Nilai TKA")
            XLSX.writeFile(wb, `Data_Nilai_TKA_${new Date().toISOString().slice(0, 10)}.xlsx`)

            showNotification('success', 'Data berhasil di-export!')
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(totalGrades / itemsPerPage)

    const kategoriOptions = ['Istimewa', 'Memadai', 'Baik', 'Kurang']

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                        Data Nilai TKA
                    </h2>
                    <p className="text-slate-400 text-sm">Kelola data nilai Tes Kemampuan Akademik siswa.</p>
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
                <div className="w-full md:w-48">
                    <select
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                    >
                        <option value="">Semua Mapel</option>
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
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
                            ? (grades.reduce((sum, g) => sum + (g.total_nilai || 0), 0) / grades.filter(g => g.total_nilai).length).toFixed(1)
                            : '0'}
                    </p>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">Tertinggi</p>
                    <p className="text-3xl font-bold text-blue-400">
                        {grades.length > 0 ? Math.max(...grades.map(g => g.total_nilai || 0)).toFixed(1) : '0'}
                    </p>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">Terendah</p>
                    <p className="text-3xl font-bold text-orange-400">
                        {grades.length > 0 ? Math.min(...grades.filter(g => g.total_nilai).map(g => g.total_nilai || 0)).toFixed(1) : '0'}
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
                                <th className="px-4 py-4">B.Ind</th>
                                <th className="px-4 py-4">Mat</th>
                                <th className="px-4 py-4">B.Ing</th>
                                <th className="px-4 py-4">Tot.Wajib</th>
                                <th className="px-4 py-4">Pilihan 1</th>
                                <th className="px-4 py-4">Pilihan 2</th>
                                <th className="px-4 py-4">Total</th>
                                <th className="px-4 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 12 }).map((_, j) => (
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
                                        {/* B. Indonesia */}
                                        <td className="px-4 py-4">
                                            <div className="text-center">
                                                <div className="font-bold text-white">{grade.bahasa_indonesia_nilai || '-'}</div>
                                                <div className="text-xs text-slate-400">{grade.bahasa_indonesia_kategori || '-'}</div>
                                            </div>
                                        </td>
                                        {/* Matematika */}
                                        <td className="px-4 py-4">
                                            <div className="text-center">
                                                <div className="font-bold text-white">{grade.matematika_nilai || '-'}</div>
                                                <div className="text-xs text-slate-400">{grade.matematika_kategori || '-'}</div>
                                            </div>
                                        </td>
                                        {/* B. Inggris */}
                                        <td className="px-4 py-4">
                                            <div className="text-center">
                                                <div className="font-bold text-white">{grade.bahasa_inggris_nilai || '-'}</div>
                                                <div className="text-xs text-slate-400">{grade.bahasa_inggris_kategori || '-'}</div>
                                            </div>
                                        </td>
                                        {/* Total Wajib */}
                                        <td className="px-4 py-4">
                                            <span className="font-bold text-lg text-blue-400">{grade.total_wajib || '-'}</span>
                                        </td>
                                        {/* Pilihan 1 */}
                                        <td className="px-4 py-4">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-500">{grade.mapel_pilihan_1 || '-'}</div>
                                                <div className="font-bold text-white">{grade.mapel_pilihan_1_nilai || '-'}</div>
                                                <div className="text-xs text-slate-400">{grade.mapel_pilihan_1_kategori || '-'}</div>
                                            </div>
                                        </td>
                                        {/* Pilihan 2 */}
                                        <td className="px-4 py-4">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-500">{grade.mapel_pilihan_2 || '-'}</div>
                                                <div className="font-bold text-white">{grade.mapel_pilihan_2_nilai || '-'}</div>
                                                <div className="text-xs text-slate-400">{grade.mapel_pilihan_2_kategori || '-'}</div>
                                            </div>
                                        </td>
                                        {/* Total */}
                                        <td className="px-4 py-4">
                                            <span className="font-bold text-xl text-emerald-400">{grade.total_nilai || '-'}</span>
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
                                    <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
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
                                    <span className="text-2xl font-bold text-emerald-400">{grade.total_nilai || '-'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="text-center">
                                        <p className="text-slate-500 text-xs">Mat</p>
                                        <p className="text-white font-bold">{grade.matematika_nilai || '-'}</p>
                                        <p className="text-xs text-slate-400">{grade.matematika_kategori || '-'}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-500 text-xs">B.Ind</p>
                                        <p className="text-white font-bold">{grade.bahasa_indonesia_nilai || '-'}</p>
                                        <p className="text-xs text-slate-400">{grade.bahasa_indonesia_kategori || '-'}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-500 text-xs">B.Ing</p>
                                        <p className="text-white font-bold">{grade.bahasa_inggris_nilai || '-'}</p>
                                        <p className="text-xs text-slate-400">{grade.bahasa_inggris_kategori || '-'}</p>
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

            {/* Modal and other components continue... (Due to length limit, I'll create this in the next part) */}

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
                            {modalMode === 'create' ? 'Tambah Nilai TKA' : 'Edit Nilai TKA'}
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

                            {/* Mandatory Subjects */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Mata Pelajaran Wajib</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Matematika */}
                                    <div className="glass-panel p-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Matematika</p>
                                        <div className="space-y-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                placeholder="Nilai"
                                                value={formData.matematika_nilai}
                                                onChange={(e) => setFormData({ ...formData, matematika_nilai: e.target.value })}
                                            />
                                            <select
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                value={formData.matematika_kategori}
                                                onChange={(e) => setFormData({ ...formData, matematika_kategori: e.target.value })}
                                            >
                                                <option value="">Kategori</option>
                                                {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Bahasa Indonesia */}
                                    <div className="glass-panel p-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Bahasa Indonesia</p>
                                        <div className="space-y-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                placeholder="Nilai"
                                                value={formData.bahasa_indonesia_nilai}
                                                onChange={(e) => setFormData({ ...formData, bahasa_indonesia_nilai: e.target.value })}
                                            />
                                            <select
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                value={formData.bahasa_indonesia_kategori}
                                                onChange={(e) => setFormData({ ...formData, bahasa_indonesia_kategori: e.target.value })}
                                            >
                                                <option value="">Kategori</option>
                                                {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Bahasa Inggris */}
                                    <div className="glass-panel p-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Bahasa Inggris</p>
                                        <div className="space-y-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                placeholder="Nilai"
                                                value={formData.bahasa_inggris_nilai}
                                                onChange={(e) => setFormData({ ...formData, bahasa_inggris_nilai: e.target.value })}
                                            />
                                            <select
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                value={formData.bahasa_inggris_kategori}
                                                onChange={(e) => setFormData({ ...formData, bahasa_inggris_kategori: e.target.value })}
                                            >
                                                <option value="">Kategori</option>
                                                {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Wajib */}
                                <div className="glass-panel p-4 mt-4 bg-blue-500/10 border-blue-500/20">
                                    <label className="text-sm font-semibold text-blue-400 mb-2 block">Total Wajib (B.Indonesia + Matematika + B.Inggris)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-slate-900/50 border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Total Nilai Wajib"
                                        value={formData.total_wajib}
                                        onChange={(e) => setFormData({ ...formData, total_wajib: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Elective Subjects */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Mata Pelajaran Pilihan</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Pilihan 1 */}
                                    <div className="glass-panel p-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Pilihan 1</p>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                placeholder="Nama Mata Pelajaran"
                                                value={formData.mapel_pilihan_1}
                                                onChange={(e) => setFormData({ ...formData, mapel_pilihan_1: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                placeholder="Nilai"
                                                value={formData.mapel_pilihan_1_nilai}
                                                onChange={(e) => setFormData({ ...formData, mapel_pilihan_1_nilai: e.target.value })}
                                            />
                                            <select
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                value={formData.mapel_pilihan_1_kategori}
                                                onChange={(e) => setFormData({ ...formData, mapel_pilihan_1_kategori: e.target.value })}
                                            >
                                                <option value="">Kategori</option>
                                                {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Pilihan 2 */}
                                    <div className="glass-panel p-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Pilihan 2</p>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                placeholder="Nama Mata Pelajaran"
                                                value={formData.mapel_pilihan_2}
                                                onChange={(e) => setFormData({ ...formData, mapel_pilihan_2: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                placeholder="Nilai"
                                                value={formData.mapel_pilihan_2_nilai}
                                                onChange={(e) => setFormData({ ...formData, mapel_pilihan_2_nilai: e.target.value })}
                                            />
                                            <select
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                                value={formData.mapel_pilihan_2_kategori}
                                                onChange={(e) => setFormData({ ...formData, mapel_pilihan_2_kategori: e.target.value })}
                                            >
                                                <option value="">Kategori</option>
                                                {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Total & Additional Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Total Nilai</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                        placeholder="Total"
                                        value={formData.total_nilai}
                                        onChange={(e) => setFormData({ ...formData, total_nilai: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Semester</label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    >
                                        <option value="">Pilih Semester</option>
                                        <option value="Ganjil">Ganjil</option>
                                        <option value="Genap">Genap</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Tahun Ajaran</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                        placeholder="e.g., 2024/2025"
                                        value={formData.tahun_ajaran}
                                        onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-300 mb-2 block">Keterangan (Opsional)</label>
                                <textarea
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
                                    rows={3}
                                    placeholder="Catatan tambahan..."
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    {modalMode === 'create' ? 'Tambah Nilai' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                    <div className="glass-panel w-full max-w-2xl p-6 shadow-2xl relative border border-white/10">
                        <button
                            onClick={() => {
                                setShowImportModal(false)
                                setImportFile(null)
                                setImportResult(null)
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-6">Import Data TKA dari Excel</h3>

                        {!importResult ? (
                            <div className="space-y-6">
                                {/* Instructions */}
                                <div className="glass-panel p-4 border border-blue-500/20 bg-blue-500/10">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-sm font-bold text-blue-400">Format Excel yang diperlukan:</h4>
                                        <button
                                            onClick={downloadTemplate}
                                            className="px-3 py-1 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-all"
                                        >
                                            <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                            </svg>
                                            Download Template
                                        </button>
                                    </div>
                                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                                        <li>Nama (untuk referensi, opsional)</li>
                                        <li>NISN (wajib - untuk mapping ke siswa)</li>
                                        <li>Kelas (untuk referensi, opsional)</li>
                                        <li>Matematika, Matematika Kategori</li>
                                        <li>Bahasa Indonesia, Bahasa Indonesia Kategori</li>
                                        <li>Bahasa Inggris, Bahasa Inggris Kategori</li>
                                        <li>Mata Pelajaran Pilihan 1, Pilihan 1 Nilai, Pilihan 1 Kategori</li>
                                        <li>Mata Pelajaran Pilihan 2, Pilihan 2 Nilai, Pilihan 2 Kategori</li>
                                        <li>Total (opsional)</li>
                                        <li>Tahun Ajaran, Semester, Keterangan (opsional)</li>
                                    </ul>
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                                        Pilih File Excel (.xlsx)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="excel-file-input"
                                        />
                                        <label
                                            htmlFor="excel-file-input"
                                            className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
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
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowImportModal(false)
                                            setImportFile(null)
                                        }}
                                        className="flex-1 py-3 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleImport}
                                        disabled={!importFile || importing}
                                        className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {importing ? 'Mengimport...' : 'Import Data'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Results Summary */}
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

                                {/* Failed Records */}
                                {importResult.details?.failed && importResult.details.failed.length > 0 && (
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

                                {/* Action Button */}
                                <button
                                    onClick={() => {
                                        setShowImportModal(false)
                                        setImportFile(null)
                                        setImportResult(null)
                                    }}
                                    className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Tutup
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                    <div className="glass-panel w-full max-w-sm p-6 shadow-2xl border border-white/10">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Hapus Nilai TKA?</h3>
                            <p className="text-slate-300 text-sm mb-6">
                                Apakah Anda yakin ingin menghapus nilai TKA untuk <strong>{deleteConfirm.studentName}</strong>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteConfirm({ show: false, gradeId: '', studentName: '' })}
                                    className="flex-1 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-500/20"
                                >
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification.show && (
                <div className="fixed bottom-4 right-4 z-[90] animate-enter">
                    <div className={`glass-panel px-6 py-4 shadow-2xl border flex items-center gap-3 ${notification.type === 'success'
                        ? 'border-green-500/50 bg-green-500/10'
                        : 'border-red-500/50 bg-red-500/10'
                        }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {notification.type === 'success' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            )}
                        </div>
                        <span className="text-white font-medium">{notification.message}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
