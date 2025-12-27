'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ChatWidget() {
    const [showBubble, setShowBubble] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        // Show bubble after a short delay
        const timer = setTimeout(() => {
            setShowBubble(true)
        }, 1500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700">

            {/* Chat Bubble Tooltip */}
            <div
                className={`transform transition-all duration-500 origin-bottom-right ${showBubble ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 translate-x-8 pointer-events-none'
                    }`}
            >
                <div className="bg-white/95 backdrop-blur-md text-slate-800 p-4 rounded-3xl rounded-r-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative max-w-[320px] border border-white/40 ring-1 ring-black/5">
                    <p className="text-sm font-medium leading-relaxed tracking-wide text-slate-600">
                        Hi, aku <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-bold">AI SMAN 1 Pati</span>. <br />
                        Ada yang bisa dibantu?
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <Link href="/ai-chat" className="text-blue-600 text-xs font-bold hover:text-blue-700 transition-colors flex items-center gap-1 group">
                            Coba sekarang
                            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </Link>
                        <button
                            onClick={() => setShowBubble(false)}
                            className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:text-slate-600 transition-colors"
                        >
                            Tutup
                        </button>
                    </div>

                    {/* Triangle pointer */}
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white transform rotate-45 border-r border-t border-white/40 shadow-sm translate-x-[-2px]"></div>
                </div>
            </div>

            {/* Main Toggle Button */}
            <Link
                href="/ai-chat"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-[2px] border-white/10 ring-2 ring-white/20"
            >
                {/* Ping Animation */}
                <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20 animate-ping duration-[2000ms]"></span>

                {/* Icon */}
                <div className="relative z-10">
                    <svg
                        className={`w-5 h-5 text-white transition-transform duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                </div>

                {/* Status Indicator */}
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#10b981] rounded-full border-[2px] border-slate-900 shadow-sm"></div>
            </Link>

        </div>
    )
}
