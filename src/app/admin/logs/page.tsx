'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

type LogEntry = {
    id: string
    admin_email: string
    student_name: string
    student_id: string
    action: string
    changes: any
    timestamp: string
}

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data, error } = await supabase
                    .from('student_logs')
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(50)

                if (error) throw error
                setLogs(data || [])
            } catch (err) {
                console.error('Error fetching logs:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [])

    const formatChanges = (changes: any) => {
        if (!changes) return '-'
        // changes structure expected: { field: { old: 'val', new: 'val' } }
        return Object.entries(changes).map(([field, values]: [string, any]) => (
            <div key={field} className="text-xs mb-1">
                <span className="font-semibold text-slate-300 capitalize">{field.replace(/_/g, ' ')}:</span>{' '}
                <span className="text-red-400 line-through mr-1">{values.old || '(kosong)'}</span>
                <span className="text-slate-500 mx-1">→</span>
                <span className="text-green-400">{values.new}</span>
            </div>
        ))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-enter pb-20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                        Riwayat Perubahan
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Catatan aktivitas perubahan data siswa oleh admin.
                    </p>
                </div>
            </div>

            <div className="glass-panel overflow-hidden border border-white/5 rounded-xl bg-slate-900/50">
                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-xs uppercase font-semibold text-slate-400 tracking-wider">Waktu</th>
                                <th className="p-4 text-xs uppercase font-semibold text-slate-400 tracking-wider">Admin</th>
                                <th className="p-4 text-xs uppercase font-semibold text-slate-400 tracking-wider">Siswa</th>
                                <th className="p-4 text-xs uppercase font-semibold text-slate-400 tracking-wider">Perubahan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        Belum ada catatan perubahan.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-slate-300 text-sm whitespace-nowrap align-top">
                                            {format(new Date(log.timestamp), 'dd MMM, HH:mm', { locale: id })}
                                        </td>
                                        <td className="p-4 text-slate-300 text-sm align-top">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white uppercase">
                                                    {log.admin_email[0]}
                                                </div>
                                                <span className="truncate max-w-[150px]" title={log.admin_email}>
                                                    {log.admin_email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-300 text-sm align-top">
                                            <span className="font-medium text-white">{log.student_name}</span>
                                        </td>
                                        <td className="p-4 text-slate-300 text-sm align-top">
                                            {formatChanges(log.changes)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden divide-y divide-white/5">
                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            Belum ada catatan perubahan.
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="p-4 space-y-3 hover:bg-white/5 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-mono">
                                        {format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm', { locale: id })}
                                    </span>
                                    <div className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 rounded-md border border-white/5">
                                        <div className="w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-[10px] font-bold">
                                            {log.admin_email[0].toUpperCase()}
                                        </div>
                                        <span className="text-xs text-slate-300 truncate max-w-[100px]">
                                            {log.admin_email}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-1 bg-gradient-to-b from-orange-500 to-transparent self-stretch rounded-full opacity-50"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="text-sm font-semibold text-white">
                                            {log.student_name}
                                        </div>
                                        <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                            {formatChanges(log.changes)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
