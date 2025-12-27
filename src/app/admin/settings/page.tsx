'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

export default function AdminSettingsPage() {
    const [admins, setAdmins] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [emailToPromote, setEmailToPromote] = useState('')
    const [promoting, setPromoting] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        fetchAdmins()
    }, [])

    const fetchAdmins = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/list-admins')
            const data = await res.json()
            if (data.admins) {
                setAdmins(data.admins)
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePromote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!emailToPromote) return

        try {
            setPromoting(true)
            setMessage(null)

            const res = await fetch('/api/admin/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToPromote })
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'Failed to promote user')
            }

            const successMsg = result.note
                ? `${result.message} ${result.note}`
                : result.message || 'User promoted successfully!'

            setMessage({ text: successMsg, type: 'success' })
            // setEmailToPromote('') // Keep email visible so they can copy/check it
            fetchAdmins() // Refresh list

        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' })
        } finally {
            setPromoting(false)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">Pengaturan Admin</h2>
                <p className="text-slate-400 text-sm">Kelola akses administrator dan konfigurasi sistem.</p>
            </div>

            {/* Promote Section */}
            <div className="glass-panel p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Tambah Admin Baru</h3>
                        <p className="text-slate-400 text-xs">Berikan akses administrator kepada pengguna lain via email.</p>
                    </div>
                </div>

                <form onSubmit={handlePromote} className="space-y-4 max-w-xl">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">Email User / User UID</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={emailToPromote}
                                onChange={(e) => setEmailToPromote(e.target.value)}
                                placeholder="Masukkan email atau UID user..."
                                className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={promoting || !emailToPromote}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                            >
                                {promoting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span>Proses...</span>
                                    </>
                                ) : (
                                    <span>Jadikan Admin</span>
                                )}
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                            <span className="text-orange-400 font-bold">INFO:</span> Jika email belum terdaftar, user akan otomatis dibuatkan akun dengan password default: <span className="font-mono bg-white/10 px-1 rounded text-white">@sudirman24</span>
                        </p>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {message.type === 'success' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            )}
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}
                </form>
            </div>

            {/* List Admins Section */}
            <div className="glass-panel overflow-hidden border border-white/10">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">Daftar Admin</h3>
                    <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                        Total: {admins.length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User ID / Email</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                        Memuat data admin...
                                    </td>
                                </tr>
                            ) : admins.length > 0 ? (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">
                                            <div className="font-bold text-white text-sm mb-0.5">{admin.email || 'Email Hidden / UUID Only'}</div>
                                            <div className="text-slate-500">{admin.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
