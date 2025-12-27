'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ChatWidget() {
    const [showBubble, setShowBubble] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)

    useEffect(() => {
        // Show bubble after a short delay
        const timer = setTimeout(() => {
            if (!hasInteracted) {
                setShowBubble(true)
            }
        }, 1500)
        return () => clearTimeout(timer)
    }, [hasInteracted])

    const handleOpen = () => {
        setIsHovered(true);
        setHasInteracted(true);
        setShowBubble(false); // Hide bubble when hovering/opening to avoid clutter
    }

    return (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 pointer-events-none">

            {/* Chat Bubble Tooltip - Floating independent of button */}
            <div
                className={`transform transition-all duration-500 ease-out origin-bottom-right pointer-events-auto
                    ${showBubble ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}
                `}
            >
                {/* Animated Gradient Border Layer */}
                <div className="relative p-[3px] rounded-[2rem] rounded-br-[4px] overflow-hidden shadow-2xl max-w-[280px] md:max-w-[320px]">

                    {/* Spinning Gradient Background for Border */}
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#3b82f6_0%,#a855f7_25%,#ec4899_50%,#a855f7_75%,#3b82f6_100%)] animate-[spin_4s_linear_infinite]"></div>

                    <div className="relative bg-white/80 backdrop-blur-2xl p-5 rounded-[calc(2rem-3px)] rounded-br-[1px]">
                        <p className="text-sm font-medium leading-relaxed text-slate-700">
                            Hi! 🤩 Aku <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-extrabold">AI SMAN 1 Pati</span>.
                            <br />Butuh bantuan soal sekolah?
                        </p>

                        <div className="flex items-center gap-3 mt-4">
                            <Link
                                href="/ai-chat"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl text-center shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                            >
                                Tanya Sekarang
                            </Link>
                            <button
                                onClick={() => { setShowBubble(false); setHasInteracted(true); }}
                                className="px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-xl transition-colors"
                            >
                                Nanti Saja
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Toggle Button */}
            <Link
                href="/ai-chat"
                onMouseEnter={handleOpen}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative pointer-events-auto"
            >
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>

                <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#2563EB] to-[#4F46E5] shadow-2xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-active:scale-95 border-[3px] border-white/20 ring-4 ring-black/5 overflow-hidden`}>

                    {/* Inner sheen effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Robot / Chat Icon */}
                    <div className="relative z-10 transition-transform duration-300 group-hover:rotate-12">
                        {isHovered ? (
                            <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        ) : (
                            <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        )}
                    </div>
                </div>

                {/* Online Indicator */}
                <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-[3px] border-slate-900 rounded-full shadow-sm z-20"></span>
            </Link>

        </div>
    )
}
