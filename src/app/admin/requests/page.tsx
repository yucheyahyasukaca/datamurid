'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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

    if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Permintaan Perubahan Data</h1>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
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
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        Tidak ada permintaan perubahan data.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-medium">{req.students?.nama}</td>
                                        <td className="p-4 text-slate-400 font-mono text-sm">{req.students?.nisn}</td>
                                        <td className="p-4 text-slate-400">{req.students?.rombel}</td>
                                        <td className="p-4 text-slate-300 truncate max-w-[200px]">{req.request_reason}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                                                ${req.status === 'REQUESTED' ? 'bg-blue-500/20 text-blue-400' :
                                                    req.status === 'EDITING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        req.status === 'REVIEW' ? 'bg-purple-500/20 text-purple-400' :
                                                            req.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                                                'bg-red-500/20 text-red-400'
                                                }`}>
                                                {req.status === 'REQUESTED' ? 'Baru' :
                                                    req.status === 'EDITING' ? 'Sedang Edit' :
                                                        req.status === 'REVIEW' ? 'Butuh Validasi' :
                                                            req.status}
                                            </span>
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
        </div>
    )
}
