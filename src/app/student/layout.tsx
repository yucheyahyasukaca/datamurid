'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    const [studentName, setStudentName] = useState('Siswa User')

    // Close sidebar when route changes (mobile experience)
    React.useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    // Fetch Student Name
    React.useEffect(() => {
        async function fetchStudentName() {
            const nisn = localStorage.getItem('student_nisn')
            if (!nisn) return

            try {
                const response = await fetch(`/api/students/detail?nisn=${nisn}`)
                const result = await response.json()

                if (result.data && result.data.nama) {
                    setStudentName(result.data.nama)
                }
            } catch (error) {
                console.error("Failed to fetch student name", error)
            }
        }
        fetchStudentName()
    }, [])

    return (
        <div className="min-h-screen flex text-slate-300 relative overflow-x-hidden">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        w-72 fixed h-full z-30 border-r border-white/10 bg-[#0f172a]/95 backdrop-blur-2xl transition-transform duration-300 ease-out shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
                <div className="p-8 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-500"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                <span className="font-bold text-lg">P</span>
                            </span>
                            Portal Siswa
                        </h2>
                        <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide pl-1">SMA Negeri 1 Pati</p>
                    </div>
                </div>

                <nav className="p-4 space-y-2 mt-2">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Menu Utama</p>

                    <Link href="/student" className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${pathname === '/student'
                        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border border-blue-500/20 shadow-lg shadow-blue-500/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                        }`}>
                        <div className={`p-2 rounded-lg transition-colors ${pathname === '/student' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <span>Data Diri</span>
                        {pathname === '/student' && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
                        )}
                    </Link>

                    <Link href="/student/grades" className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${pathname === '/student/grades'
                        ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/10 text-white border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                        }`}>
                        <div className={`p-2 rounded-lg transition-colors ${pathname === '/student/grades' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </div>
                        <span>Data Nilai</span>
                        {pathname === '/student/grades' && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                        )}
                    </Link>

                    <Link href="/student/contact" className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${pathname === '/student/contact'
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/10 text-white border border-purple-500/20 shadow-lg shadow-purple-500/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                        }`}>
                        <div className={`p-2 rounded-lg transition-colors ${pathname === '/student/contact' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        </div>
                        <span>Kontak Saya</span>
                        {pathname === '/student/contact' && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]"></div>
                        )}
                    </Link>

                    <div className="pt-6 mt-6 border-t border-white/5">
                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Akun</p>
                        <button
                            onClick={() => {
                                localStorage.removeItem('student_nisn')
                                document.cookie = "student_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                                document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                                window.location.href = '/login'
                            }}
                            className="w-full relative group overflow-hidden flex items-center gap-3 px-4 py-3.5 text-sm text-red-400 hover:text-white rounded-xl transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500 transition-colors duration-300"></div>
                            <div className="relative z-10 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-white/20 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                </div>
                                <span className="font-medium">Log Out</span>
                            </div>
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-72 min-h-screen flex flex-col relative w-full transition-all duration-300">
                <header className="h-16 flex items-center px-4 md:px-8 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-10 justify-between">
                    <div className="flex items-center gap-3">
                        {/* Hamburger Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <h1 className="text-lg font-semibold text-white">
                            Dashboard Siswa
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/10 uppercase">
                            {studentName.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-400 hidden sm:block">{studentName}</span>
                    </div>
                </header>

                <main className="p-4 md:p-8 animate-enter flex-1 overflow-x-hidden">
                    {children}
                </main>

                <footer className="p-6 border-t border-white/5 text-center text-slate-600 text-xs md:text-sm font-medium">
                    <p>&copy; 2025 SMA Negeri 1 Pati. Developed by Tim IT SMAN 1 Pati.</p>
                </footer>
            </div>
        </div>
    )
}
