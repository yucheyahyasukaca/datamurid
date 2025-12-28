'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface SessionExpiredModalProps {
    isOpen: boolean
}

export default function SessionExpiredModal({ isOpen }: SessionExpiredModalProps) {
    const router = useRouter()

    if (!isOpen) return null

    const handleLoginRedirect = () => {
        // Clear cookies and storage just to be safe
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        localStorage.removeItem('sb-access-token') // Generic Supabase token cleanup if any
        window.location.href = '/login'
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-500"></div>
                <div className="absolute top-[-20%] right-[-20%] w-[200px] h-[200px] bg-blue-600/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[200px] h-[200px] bg-orange-600/10 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col items-center text-center">

                    {/* Icon */}
                    <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_10s_linear_infinite]"></div>
                        <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Sesi Berakhir</h2>

                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        Demi keamanan, sesi Anda telah berakhir otomatis karena batas waktu. Silakan login kembali untuk melanjutkan aktivitas Anda.
                    </p>

                    <button
                        onClick={handleLoginRedirect}
                        className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span>Login Kembali</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                        </svg>
                    </button>

                </div>
            </div>
        </div>
    )
}
