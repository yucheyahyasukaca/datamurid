'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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

                router.push('/admin')

            } else {
                // Student "Fake Auth" via Table Lookup
                // Password input is expected to be format YYYY-MM-DD or DDMMYYYY depending on input
                // But let's assume raw string comparison or some basic format check.
                // The prompt said "password tanggal lahir". In the form we made it "date" input? 
                // No, in login form it is "text" or "password". Let's check.
                // It is type="password". 

                const cleanNisn = formData.identifier.replace(/\D/g, '')

                // Fetch student by NISN
                const { data: student, error: studentError } = await supabase
                    .from('students')
                    .select('nisn, tanggal_lahir, nama')
                    .eq('nisn', cleanNisn)
                    .single()

                if (studentError || !student) {
                    throw new Error('NISN tidak ditemukan.')
                }

                // Verify Date of Birth (Password)
                // We need to match the input password format with the stored date format (YYYY-MM-DD usually in SQL)
                // Let's assume user types "DDMMYYYY" (e.g. 25012008) and DB has "2008-01-25"
                // OR user types exactly what matches.
                // Let's try to normalize input.

                const inputPwd = formData.password.replace(/\D/g, '') // Remove non-digits
                // Expected DB format: 2008-05-20 (YYYY-MM-DD)
                // Expected Input: 20052008 (DDMMYYYY) -> We need to check both logic or just compel format

                const dbDate = student.tanggal_lahir // "YYYY-MM-DD"
                const [yyyy, mm, dd] = dbDate.split('-')
                const validPassword = `${dd}${mm}${yyyy}`

                if (inputPwd !== validPassword) {
                    // Fallback: also check if they typed YYYYMMDD
                    if (inputPwd !== `${yyyy}${mm}${dd}`) {
                        throw new Error('Tanggal lahir (password) salah. Gunakan format DDMMYYYY (Contoh: 25012008).')
                    }
                }

                // "Login" Successful
                localStorage.setItem('student_nisn', student.nisn)
                router.push('/student')
            }

        } catch (err: any) {
            setError(err.message || 'Gagal masuk. Periksa data Anda kembali.')
        } finally {
            setLoading(false)
        }
    }

    // Styles
    const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
    const labelClass = "block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2"

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0a]">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-enter">
                {/* School Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4 transform rotate-3">
                        <span className="text-3xl font-bold text-white -rotate-3">SM</span>
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
                            {loading ? (
                                <svg className="w-6 h-6 animate-spin text-white/50" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                'Masuk ke Portal'
                            )}
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
