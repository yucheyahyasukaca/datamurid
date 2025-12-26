'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function ContactPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [studentId, setStudentId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        no_hp: '',
        email: '',
        no_hp_ortu: ''
    })
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    })

    useEffect(() => {
        const fetchContactData = async () => {
            const nisn = localStorage.getItem('student_nisn')
            if (!nisn) {
                router.push('/login')
                return
            }

            try {
                // Fetch student data including contact info
                // Note: Ensure the columns no_hp, email, no_hp_ortu exist in your 'students' table
                const { data, error } = await supabase
                    .from('students')
                    .select('id, no_hp, email, no_hp_ortu')
                    .eq('nisn', nisn)
                    .order('is_verified', { ascending: false })
                    .limit(1)
                    .single()

                if (error) throw error

                if (data) {
                    setStudentId(data.id)
                    setFormData({
                        no_hp: data.no_hp || '',
                        email: data.email || '',
                        no_hp_ortu: data.no_hp_ortu || ''
                    })
                }
            } catch (error) {
                console.error('Error fetching contact:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchContactData()
    }, [router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            if (!studentId) return

            const { error } = await supabase
                .from('students')
                .update({
                    no_hp: formData.no_hp,
                    email: formData.email,
                    no_hp_ortu: formData.no_hp_ortu
                })
                .eq('id', studentId)

            if (error) throw error

            setNotification({
                show: true,
                type: 'success',
                message: 'Data kontak berhasil disimpan!'
            })

            // Hide notification after 3 seconds
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }))
            }, 3000)

        } catch (error: any) {
            setNotification({
                show: true,
                type: 'error',
                message: 'Gagal menyimpan data: ' + error.message
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
    const labelClass = "block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2"

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                    Kontak Saya
                </h1>
                <p className="text-slate-400 text-sm">
                    Lengkapi informasi kontak agar sekolah dapat menghubungi Anda dengan mudah.
                </p>
            </div>

            {/* Notification */}
            {notification.show && (
                <div className={`p-4 rounded-xl border mb-6 animate-enter ${notification.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    } flex items-center gap-3`}>
                    {notification.type === 'success' ? (
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    ) : (
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    )}
                    <span className="text-sm font-medium">{notification.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass-panel p-6 md:p-8 relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-red-500" />

                    <div className="space-y-6 relative z-10">
                        {/* No HP */}
                        <div>
                            <label className={labelClass} htmlFor="no_hp">
                                No. Handphone (WhatsApp Aktif)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                </span>
                                <input
                                    id="no_hp"
                                    name="no_hp"
                                    type="tel"
                                    placeholder="Contoh: 081234567890"
                                    className={`${inputClass} pl-12`}
                                    value={formData.no_hp}
                                    onChange={handleChange}
                                    pattern="[0-9]*"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Pastikan nomor terhubung dengan WhatsApp.</p>
                        </div>

                        {/* Email */}
                        <div>
                            <label className={labelClass} htmlFor="email">
                                Alamat Email Aktif
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                                </span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    className={`${inputClass} pl-12`}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* No HP Ortu */}
                        <div>
                            <label className={labelClass} htmlFor="no_hp_ortu">
                                No. HP Orang Tua (Ayah / Ibu)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </span>
                                <input
                                    id="no_hp_ortu"
                                    name="no_hp_ortu"
                                    type="tel"
                                    placeholder="Contoh: 081234567890"
                                    className={`${inputClass} pl-12`}
                                    value={formData.no_hp_ortu}
                                    onChange={handleChange}
                                    pattern="[0-9]*"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Nomor yang dapat dihubungi dalam keadaan darurat.</p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hovered:from-orange-400 hovered:to-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                            Simpan Kontak
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
