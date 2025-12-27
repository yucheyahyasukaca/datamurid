'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Close sidebar when route changes (mobile experience)
    React.useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

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
                                <span className="font-bold text-lg">A</span>
                            </span>
                            Portal Admin
                        </h2>
                        <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide pl-1">SMA Negeri 1 Pati</p>
                    </div>
                </div>

                <nav className="p-4 space-y-2 mt-2">
                    {/* Special AI Menu Item with Dual Light Effects */}
                    <div className="relative group p-[2px] rounded-xl overflow-hidden mb-6 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                        {/* 1. Static Glow Base (Always On) - Enlarged */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-60 blur-xl transition-opacity duration-300 group-hover:opacity-80"></div>

                        {/* 2. Rotating Glow Beam */}
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#3b82f6_0%,#a855f7_25%,#ec4899_50%,#a855f7_75%,#3b82f6_100%)] animate-[spin_4s_linear_infinite] opacity-60 blur-md"></div>

                        {/* 3. Rotating Sharp Border */}
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#3b82f6_0%,#a855f7_25%,#ec4899_50%,#a855f7_75%,#3b82f6_100%)] animate-[spin_4s_linear_infinite] opacity-100 block"></div>

                        <Link href="/admin/ai" className={`relative flex items-center gap-3 px-4 py-3.5 rounded-[10px] font-medium transition-all duration-300 bg-[#0f172a] hover:bg-slate-900 border border-transparent ${pathname === '/admin/ai'
                            ? 'text-indigo-400'
                            : 'text-slate-300 hover:text-white'
                            }`}>
                            <div className={`p-2 rounded-lg transition-colors ${pathname === '/admin/ai' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            </div>
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">Asisten AI</span>
                            {pathname === '/admin/ai' && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></div>
                            )}
                        </Link>
                    </div>

                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Menu Utama</p>

                    <Link href="/admin" className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${pathname === '/admin'
                        ? 'bg-gradient-to-r from-orange-600/20 to-red-600/10 text-white border border-orange-500/20 shadow-lg shadow-orange-500/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                        }`}>
                        <div className={`p-2 rounded-lg transition-colors ${pathname === '/admin' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                        <span>Data Murid</span>
                        {pathname === '/admin' && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]"></div>
                        )}
                    </Link>

                    <Link href="/admin/grades" className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${pathname === '/admin/grades'
                        ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/10 text-white border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                        }`}>
                        <div className={`p-2 rounded-lg transition-colors ${pathname === '/admin/grades' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </div>
                        <span>Data Nilai</span>
                        {pathname === '/admin/grades' && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                        )}
                    </Link>

                    <Link href="/admin/logs" className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${pathname === '/admin/logs'
                        ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/10 text-white border border-blue-500/20 shadow-lg shadow-blue-500/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                        }`}>
                        <div className={`p-2 rounded-lg transition-colors ${pathname === '/admin/logs' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span>Riwayat Perubahan</span>
                        {pathname === '/admin/logs' && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
                        )}
                    </Link>


                    <Link href="/admin/requests" className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${pathname.startsWith('/admin/requests')
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/10 text-white border border-purple-500/20 shadow-lg shadow-purple-500/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                        }`}>
                        <div className={`p-2 rounded-lg transition-colors ${pathname.startsWith('/admin/requests') ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        </div>
                        <span>Permintaan Perubahan</span>
                        {pathname.startsWith('/admin/requests') && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]"></div>
                        )}
                    </Link>

                    <Link href="/admin/settings" className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${pathname.startsWith('/admin/settings')
                        ? 'bg-gradient-to-r from-slate-600/20 to-zinc-600/10 text-white border border-slate-500/20 shadow-lg shadow-slate-500/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                        }`}>
                        <div className={`p-2 rounded-lg transition-colors ${pathname.startsWith('/admin/settings') ? 'bg-slate-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <span>Pengaturan Admin</span>
                        {pathname.startsWith('/admin/settings') && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.6)]"></div>
                        )}
                    </Link>



                    <div className="pt-6 mt-6 border-t border-white/5">
                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Akun</p>
                        <button
                            onClick={() => {
                                document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                                document.cookie = "student_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                                localStorage.removeItem('student_nisn')
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
                            Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/10 uppercase">
                            A
                        </div>
                        <span className="text-sm text-slate-400 hidden sm:block">Admin User</span>
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
