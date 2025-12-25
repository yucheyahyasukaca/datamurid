'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import * as XLSX from 'xlsx'

export default function AdminDashboard() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRombel, setSelectedRombel] = useState('')
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch Data from Supabase
    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('nama', { ascending: true })

            if (error) throw error
            setStudents(data || [])
        } catch (error) {
            console.error('Error fetching students:', error)
        } finally {
            setLoading(false)
        }
    }

    // Get unique Rombel options from Real Data
    const rombelOptions = useMemo(() => {
        const rombels = students.map(s => s.rombel).filter(Boolean) // Filter out null/undefined
        return Array.from(new Set(rombels)).sort()
    }, [students])

    // Filter Logic
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = (student.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.nipd || '').includes(searchTerm) ||
                (student.nisn || '').includes(searchTerm)
            const matchesRombel = selectedRombel ? student.rombel === selectedRombel : true

            return matchesSearch && matchesRombel
        })
    }, [searchTerm, selectedRombel, students])

    // Stats Calculation based on Real Filtered Data
    const stats = useMemo(() => {
        return {
            total: filteredStudents.length,
            verified: filteredStudents.filter(s => s.is_verified).length,
            pending: filteredStudents.filter(s => !s.is_verified).length
        }
    }, [filteredStudents])

    // Export Handler
    const handleExport = () => {
        const dataToExport = filteredStudents.length > 0 ? filteredStudents : students
        const ws = XLSX.utils.json_to_sheet(dataToExport)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Data Murid")
        XLSX.writeFile(wb, `Data_Murid_SMAN1Pati_${new Date().toISOString().slice(0, 10)}.xlsx`)
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
                        {selectedRombel ? `Dalam kelas ${selectedRombel}` : 'Semua kelas'}
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

            {/* Main Data Table */}
            <div className="glass-panel overflow-hidden border border-white/10">
                <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/80 transition-colors">
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
                                            <svg className="w-5 h-5 animate-spin data-text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Sedang memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">{index + 1}</td>
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
                                            <button className="text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
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
                <div className="p-4 border-t border-white/5 bg-white/5 text-xs text-center text-slate-500 rounded-b-xl relative z-20">
                    {loading ? 'Memuat data...' : `Menampilkan ${filteredStudents.length} dari ${students.length} data`}
                </div>
            </div>
        </div>
    )
}
