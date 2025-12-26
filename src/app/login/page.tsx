'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/utils/supabase'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Login Mode State
    const [loginMode, setLoginMode] = useState<'admin' | 'student'>('admin')

    // Unified Form Data
    const [formData, setFormData] = useState({
        identifier: '', // Email for admin, NISN for student
        password: ''    // Password for admin, DOB for student
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError(null)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (loginMode === 'admin') {
                // Admin Authenticated with Supabase Auth
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email: formData.identifier,
                    password: formData.password,
                })

                if (authError) throw authError

                // Clear student session if any
                localStorage.removeItem('student_nisn')
                document.cookie = "student_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"

                // Set Admin Session Cookie for Middleware
                document.cookie = "admin_session=true; path=/; max-age=86400"

                router.push('/admin')

            } else {
                // Student Login via Secure API
                const res = await fetch('/api/auth/student-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nisn: formData.identifier,
                        password: formData.password
                    })
                })

                const result = await res.json()

                if (!res.ok) {
                    throw new Error(result.error || 'Gagal masuk')
                }

                // Login Successful
                const student = result.data
                localStorage.setItem('student_nisn', student.nisn)

                // Set Student Session Cookie for Middleware
                document.cookie = "student_session=true; path=/; max-age=86400"
                // Clear admin cookie
                document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"

                router.push('/student')
            }

        } catch (err: any) {
            setError(err.message || 'Gagal masuk. Periksa data Anda kembali.')
            setLoading(false)
        }
    }

    // Styles
    const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
    const labelClass = "block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2"

    // Rotating loading messages
    const [loadingMessage, setLoadingMessage] = useState('Menghubungkan ke server...')

    // Cyclical messages effect
    React.useEffect(() => {
        if (!loading) return;

        const messages = [
            'Menghubungkan ke server...',
            'Memverifikasi kredensial...',
            'Menyiapkan dashboard Anda...',
            'Sedang memuat data terbaru...',
            'Hampir selesai...'
        ];

        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setLoadingMessage(messages[i]);
        }, 2000); // Change message every 2 seconds

        return () => clearInterval(interval);
    }, [loading]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0a]">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            </div>

            {/* PREMIUIM FULL SCREEN LOADER */}
            {loading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative">
                        {/* Outer Glow */}
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse rounded-full"></div>

                        {/* Main Spinner Container */}
                        <div className="relative bg-slate-900/90 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">

                            {/* Animated Logo/Icon */}
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-2 border-4 border-orange-500/30 border-b-orange-500 rounded-full animate-spin animation-delay-500 reverse"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Image
                                        src="/sman1pati.png"
                                        alt="Loading..."
                                        width={40}
                                        height={40}
                                        className="animate-pulse"
                                    />
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-white mb-2">Mohon Tunggu</h3>

                            {/* Dynamic Message */}
                            <p className="text-slate-400 text-center text-sm min-h-[20px] animate-pulse">
                                {loadingMessage}
                            </p>

                            {/* Progress Indicator (Fake Bar) */}
                            <div className="w-full h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 w-1/2 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md relative z-10 animate-enter">
                {/* School Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/sman1pati.png"
                            alt="Logo SMAN 1 Pati"
                            width={100}
                            height={100}
                            className="drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">SMAN 1 Pati</h1>
                    <p className="text-slate-400 text-sm">Portal Data Murid & Administrasi</p>
                </div>

                <div className="glass-panel p-8 md:p-10 shadow-2xl border-t border-white/10">

                    {/* Role Switcher */}
                    <div className="flex p-1 bg-white/5 rounded-xl mb-6 border border-white/5">
                        <button
                            type="button"
                            onClick={() => setLoginMode('admin')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Admin / Guru
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginMode('student')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === 'student' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Murid
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>
                                {loginMode === 'admin' ? 'Email Sekolah' : 'NISN'}
                            </label>
                            <input
                                name="identifier"
                                type={loginMode === 'admin' ? 'email' : 'text'}
                                placeholder={loginMode === 'admin' ? 'nama@sman1pati.sch.id' : 'Contoh: 0081234567'}
                                className={inputClass}
                                value={formData.identifier}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                {loginMode === 'admin' ? 'Kata Sandi' : 'Tanggal Lahir (Password)'}
                            </label>
                            <input
                                name="password"
                                type="password"
                                placeholder={loginMode === 'admin' ? '••••••••' : 'Format: DDMMYYYY (25012008)'}
                                className={inputClass}
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                                <input type="checkbox" className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-offset-0 focus:ring-blue-500/20" />
                                <span>Ingat Saya</span>
                            </label>
                            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Lupa sandi?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-white text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            Masuk ke Portal
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8 text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} Tim IT SMAN 1 Pati. <br />All rights reserved.
                </div>
            </div>
        </div>
    )
}
