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

            const { data, error } = await supabase
                .from('students')
                .select('nama')
                .eq('nisn', nisn)
                .single()

            if (data && data.nama) {
                setStudentName(data.nama)
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
        w-64 fixed h-full z-30 border-r border-white/10 bg-slate-900/90 backdrop-blur-xl transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            Portal Siswa
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">SMA Negeri 1 Pati</p>
                    </div>
                    {/* Close Button Mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    <Link href="/student" className={`block px-4 py-3 rounded-xl font-medium transition-all ${pathname === '/student'
                        ? 'bg-orange-600/10 text-orange-400 border border-orange-500/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}>
                        Data Diri
                    </Link>
                    <Link href="/student/grades" className={`block px-4 py-3 rounded-xl font-medium transition-all ${pathname === '/student/grades'
                        ? 'bg-orange-600/10 text-orange-400 border border-orange-500/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}>
                        Data Nilai
                    </Link>
                    <div className="pt-4 mt-4 border-t border-white/5">
                        <div className="pt-4 mt-4 border-t border-white/5">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('student_nisn')
                                    document.cookie = "student_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                                    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                                    window.location.href = '/login'
                                }}
                                className="w-full text-left block px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 min-h-screen flex flex-col relative w-full transition-all duration-300">
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
