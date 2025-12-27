'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // State for filtering and pagination
    const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests/admin/list')
            const json = await res.json()
            if (json.data) {
                setRequests(json.data)
            }
        } catch (error) {
            console.error('Failed to fetch', error)
        } finally {
            setLoading(false)
        }
    }

    // Helper: Categorize status
    const getTabStatus = (status: string) => {
        if (['APPROVED'].includes(status)) return 'APPROVED'
        if (['REJECTED'].includes(status)) return 'REJECTED'
        return 'PENDING' // REQUESTED, EDITING, REVIEW
    }

    // derived data
    const filteredRequests = requests.filter(req => {
        // 1. Tab Filter
        const tabStatus = getTabStatus(req.status)
        if (tabStatus !== activeTab) return false

        // 2. Search Filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase()
            const name = req.students?.nama?.toLowerCase() || ''
            const nisn = req.students?.nisn || ''
            return name.includes(searchLower) || nisn.includes(searchLower)
        }

        return true
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
    const currentData = filteredRequests.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Statistics
    const stats = {
        pending: requests.filter(r => getTabStatus(r.status) === 'PENDING').length,
        approved: requests.filter(r => getTabStatus(r.status) === 'APPROVED').length,
        rejected: requests.filter(r => getTabStatus(r.status) === 'REJECTED').length
    }

    const handleTabChange = (tab: 'PENDING' | 'APPROVED' | 'REJECTED') => {
        setActiveTab(tab)
        setCurrentPage(1) // Reset page on tab change
    }

    const StatusBadge = ({ status }: { status: string }) => (
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
            ${status === 'REQUESTED' ? 'bg-blue-500/20 text-blue-400' :
                status === 'EDITING' ? 'bg-yellow-500/20 text-yellow-400' :
                    status === 'REVIEW' ? 'bg-purple-500/20 text-purple-400' :
                        status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
            }`}>
            {status === 'REQUESTED' ? 'Baru' :
                status === 'EDITING' ? 'Sedang Edit' :
                    status === 'REVIEW' ? 'Butuh Validasi' :
                        status === 'APPROVED' ? 'Selesai' :
                            'Ditolak'}
        </span>
    )

    if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Permintaan Perubahan Data</h1>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div onClick={() => handleTabChange('PENDING')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'PENDING' ? 'bg-orange-500/10 border-orange-500/50' : 'bg-slate-900 border-white/10 hover:border-white/20'}`}>
                    <div className="text-slate-400 text-sm mb-1">Perlu Proses</div>
                    <div className="text-2xl font-bold text-orange-400">{stats.pending}</div>
                </div>
                <div onClick={() => handleTabChange('APPROVED')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'APPROVED' ? 'bg-green-500/10 border-green-500/50' : 'bg-slate-900 border-white/10 hover:border-white/20'}`}>
                    <div className="text-slate-400 text-sm mb-1">Disetujui</div>
                    <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                </div>
                <div onClick={() => handleTabChange('REJECTED')} className={`cursor-pointer p-4 rounded-xl border transition-all ${activeTab === 'REJECTED' ? 'bg-red-500/10 border-red-500/50' : 'bg-slate-900 border-white/10 hover:border-white/20'}`}>
                    <div className="text-slate-400 text-sm mb-1">Ditolak</div>
                    <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                </div>
            </div>

            {/* Controls: Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Tabs */}
                <div className="flex space-x-1 p-1 bg-slate-900/50 rounded-lg border border-white/10 backdrop-blur-sm self-start overflow-x-auto max-w-full">
                    <button
                        onClick={() => handleTabChange('PENDING')}
                        className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${activeTab === 'PENDING'
                            ? 'bg-orange-500/20 text-orange-400 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Perlu Proses
                    </button>
                    <button
                        onClick={() => handleTabChange('APPROVED')}
                        className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${activeTab === 'APPROVED'
                            ? 'bg-green-500/20 text-green-400 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Disetujui
                    </button>
                    <button
                        onClick={() => handleTabChange('REJECTED')}
                        className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${activeTab === 'REJECTED'
                            ? 'bg-red-500/20 text-red-400 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Ditolak
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Cari Nama atau NISN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-sm"
                    />
                    <svg
                        className="absolute right-3 top-2.5 w-4 h-4 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="space-y-4">
                {/* Mobile View: Cards (Visible only on small screens) */}
                <div className="md:hidden space-y-4">
                    {currentData.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-white/10">
                            <div className="flex flex-col items-center gap-2">
                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p>Tidak ada permintaan {activeTab === 'PENDING' ? 'yang perlu diproses' : activeTab === 'APPROVED' ? 'yang disetujui' : 'yang ditolak'}</p>
                            </div>
                        </div>
                    ) : (
                        currentData.map((req) => (
                            <div key={req.id} className="bg-slate-900 border border-white/10 rounded-xl p-4 space-y-3 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-white font-medium">{req.students?.nama}</h3>
                                        <p className="text-slate-400 text-xs font-mono">{req.students?.nisn} • {req.students?.rombel}</p>
                                    </div>
                                    <StatusBadge status={req.status} />
                                </div>

                                <div className="bg-white/5 rounded p-3">
                                    <p className="text-slate-400 text-xs uppercase font-semibold mb-1">Alasan Perubahan</p>
                                    <p className="text-slate-300 text-sm line-clamp-2">{req.request_reason}</p>
                                </div>

                                <div className="pt-2 border-t border-white/5 flex justify-end">
                                    <Link
                                        href={`/admin/requests/${req.id}`}
                                        className="w-full text-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded border border-white/10 transition"
                                    >
                                        Lihat Detail
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View: Table (Hidden on small screens) */}
                <div className="hidden md:block bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-slate-400 text-sm">
                                    <th className="p-4 font-semibold">Nama Siswa</th>
                                    <th className="p-4 font-semibold">NISN</th>
                                    <th className="p-4 font-semibold">Kelas</th>
                                    <th className="p-4 font-semibold">Alasan</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {currentData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p>Tidak ada permintaan {activeTab === 'PENDING' ? 'yang perlu diproses' : activeTab === 'APPROVED' ? 'yang disetujui' : 'yang ditolak'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentData.map((req) => (
                                        <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-white font-medium">{req.students?.nama}</td>
                                            <td className="p-4 text-slate-400 font-mono text-sm">{req.students?.nisn}</td>
                                            <td className="p-4 text-slate-400">{req.students?.rombel}</td>
                                            <td className="p-4 text-slate-300 truncate max-w-[200px]" title={req.request_reason}>{req.request_reason}</td>
                                            <td className="p-4">
                                                <StatusBadge status={req.status} />
                                            </td>
                                            <td className="p-4">
                                                <Link
                                                    href={`/admin/requests/${req.id}`}
                                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded border border-white/10 transition"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls - Shared for Desktop & Mobile */}
                {filteredRequests.length > ITEMS_PER_PAGE && (
                    <div className="p-4 border border-white/10 rounded-xl flex justify-between items-center bg-slate-900/50">
                        <div className="text-xs text-slate-500 hidden md:block">
                            Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)} dari {filteredRequests.length} data
                        </div>
                        <div className="flex gap-2 w-full md:w-auto justify-between md:justify-end">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-xs rounded bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Sebelumnya
                            </button>
                            <span className="px-3 py-1 text-xs text-slate-400 flex items-center">
                                Hal {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-xs rounded bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
