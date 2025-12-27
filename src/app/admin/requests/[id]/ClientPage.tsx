'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function RequestDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [request, setRequest] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [confirmationModal, setConfirmationModal] = useState({
        show: false,
        title: '',
        message: '',
        action: '',
        confirmText: 'Ya, Lanjutkan',
        confirmClass: 'bg-blue-600'
    })

    useEffect(() => {
        if (id) fetchRequestDetail()
    }, [id])

    const fetchRequestDetail = async () => {
        try {
            const res = await fetch('/api/requests/admin/list')
            const json = await res.json()
            if (json.data) {
                const found = json.data.find((r: any) => r.id === id)
                setRequest(found)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (action: string) => {
        // Confirmation is now handled by the UI before calling this
        setProcessing(true)
        try {
            const res = await fetch('/api/requests/admin/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: id,
                    action,
                    notes: rejectReason
                })
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error)

            router.refresh()
            fetchRequestDetail()
            setShowRejectModal(false)
            setConfirmationModal(prev => ({ ...prev, show: false }))
        } catch (error: any) {
            alert('Error: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    const promptConfirmation = (action: string) => {
        if (action === 'VALIDATE') {
            setConfirmationModal({
                show: true,
                title: 'Validasi Perubahan',
                message: 'Apakah Anda yakin ingin menyetujui dan menerapkan perubahan ini? Data siswa akan diperbarui secara permanen.',
                action: 'VALIDATE',
                confirmText: 'Ya, Setujui',
                confirmClass: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'
            })
        } else if (action === 'APPROVE_EDIT') {
            setConfirmationModal({
                show: true,
                title: 'Izinkan Edit',
                message: 'Apakah Anda yakin ingin mengizinkan siswa mengubah data mereka? Siswa akan dapat mengakses form edit.',
                action: 'APPROVE_EDIT',
                confirmText: 'Ya, Izinkan',
                confirmClass: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
            })
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>
    if (!request) return <div className="p-8 text-center text-red-400">Permintaan tidak ditemukan.</div>

    const renderComparison = () => {
        if (!request.proposed_changes) return null

        const original = request.original_data || {}
        const proposed = request.proposed_changes || {}

        const allKeys = Array.from(new Set([...Object.keys(original), ...Object.keys(proposed)]))
        const ignoredKeys = ['id', 'created_at', 'updated_at', 'is_verified', 'verified_at', 'user_id', 'password']

        const changes = allKeys.filter(key =>
            !ignoredKeys.includes(key) &&
            String(original[key]) !== String(proposed[key])
        )

        if (changes.length === 0) return <div className="text-slate-400">Tidak ada perubahan terdeteksi.</div>

        return (
            <div className="grid grid-cols-1 gap-4">
                {changes.map(key => (
                    <div key={key} className="bg-slate-800 p-4 rounded-lg border border-white/5">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">{key.replace(/_/g, ' ')}</div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 bg-red-900/20 p-2 rounded border border-red-500/20">
                                <div className="text-xs text-red-400 mb-1">Sebelum</div>
                                <div className="text-slate-300 break-words">{String(original[key] || '-')}</div>
                            </div>
                            <div className="flex items-center text-slate-500">
                                <svg className="w-6 h-6 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </div>
                            <div className="flex-1 bg-green-900/20 p-2 rounded border border-green-500/20">
                                <div className="text-xs text-green-400 mb-1">Sesudah</div>
                                <div className="text-white font-medium break-words">{String(proposed[key] || '-')}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <h1 className="text-2xl font-bold text-white">Detail Permintaan Perubahan</h1>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs text-slate-500 uppercase">Siswa</label>
                        <div className="text-lg font-bold text-white">{request.students?.nama}</div>
                        <div className="text-sm text-slate-400">{request.students?.nisn} - {request.students?.rombel}</div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase">Status</label>
                        <div className={`text-lg font-bold ${request.status === 'REQUESTED' ? 'text-blue-400' :
                            request.status === 'REVIEW' ? 'text-purple-400' : 'text-slate-300'
                            }`}>
                            {request.status}
                        </div>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5">
                    <label className="text-xs text-slate-500 uppercase">Alasan Permintaan</label>
                    <p className="mt-1 text-slate-300 bg-white/5 p-3 rounded-lg">{request.request_reason}</p>
                </div>
            </div>

            {request.status === 'REVIEW' && (
                <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-6 shadow-lg shadow-purple-900/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                        Validasi Perubahan
                    </h3>
                    <div className="mb-6">
                        {renderComparison()}
                    </div>

                    <div className="flex gap-4 border-t border-white/10 pt-4">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="flex-1 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition"
                            disabled={processing}
                        >
                            Tolak Perubahan
                        </button>
                        <button
                            onClick={() => promptConfirmation('VALIDATE')}
                            className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition"
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : 'Setujui & Terapkan Perubahan'}
                        </button>
                    </div>
                </div>
            )}

            {request.status === 'REQUESTED' && (
                <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Tindakan</h3>
                    <p className="text-slate-400 mb-6">Izinkan siswa untuk mengedit data diri mereka?</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="flex-1 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition"
                            disabled={processing}
                        >
                            Tolak
                        </button>
                        <button
                            onClick={() => promptConfirmation('APPROVE_EDIT')}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition"
                            disabled={processing}
                        >
                            {processing ? 'Memproses...' : 'Izinkan Edit'}
                        </button>
                    </div>
                </div>
            )}
            {request.status === 'EDITING' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2">Menunggu Siswa...</h3>
                    <p className="text-slate-300">Siswa telah diizinkan mengedit. Menunggu siswa menyimpan perubahan.</p>
                </div>
            )}

            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-xl w-full max-w-sm shadow-2xl">
                        <h3 className="font-bold text-white mb-4 text-lg">Alasan Penolakan</h3>
                        <textarea
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white mb-4 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition"
                            rows={3}
                            placeholder="Contoh: Data sudah sesuai akta..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 text-slate-400 hover:bg-white/5 rounded-lg transition">Batal</button>
                            <button
                                onClick={() => handleAction('REJECT')}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg shadow-red-500/20 transition"
                            >
                                Tolak
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmationModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-enter">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-xl w-full max-w-sm shadow-2xl">
                        <h3 className="font-bold text-white mb-2 text-lg">{confirmationModal.title}</h3>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            {confirmationModal.message}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmationModal(prev => ({ ...prev, show: false }))}
                                className="flex-1 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition"
                                disabled={processing}
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleAction(confirmationModal.action)}
                                className={`flex-1 py-2.5 text-white rounded-lg font-bold shadow-lg transition ${confirmationModal.confirmClass}`}
                                disabled={processing}
                            >
                                {processing ? 'Memproses...' : confirmationModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
