'use client'

import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Message {
    role: 'user' | 'model'
    text: string
    timestamp: Date
}

export default function AdminAIPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [showWelcome, setShowWelcome] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async () => {
        if (!input.trim() || loading) return

        const userMessage: Message = {
            role: 'user',
            text: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)
        setShowWelcome(false)

        try {
            // Use standardized admin API path which is protected by middleware
            const response = await fetch('/api/admin/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: input,
                    history: messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.text }]
                    }))
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Terjadi kesalahan')
            }

            const botMessage: Message = {
                role: 'model',
                text: data.response,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, botMessage])
        } catch (error) {
            console.error('Error:', error)
            const errorMessage: Message = {
                role: 'model',
                text: 'Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const suggestions = [
        { text: "Tampilkan statistik siswa", icon: "📊" },
        { text: "Siapa siswa yang belum verifikasi?", icon: "⚠️" },
        { text: "Analisis performa nilai", icon: "📈" },
        { text: "Bantu buat pengumuman", icon: "📢" }
    ]

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] w-full text-slate-200 font-sans">
            {/* Main Chat Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {showWelcome ? (
                    <div className="h-full flex flex-col justify-center items-start max-w-3xl mx-auto px-4 md:px-6 animate-fade-in-up">
                        <div className="mb-6 md:mb-8">
                            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-orange-400 bg-clip-text text-transparent mb-2 md:mb-3">
                                Halo, Bapak/Ibu Guru
                            </h1>
                            <h2 className="text-xl md:text-3xl font-medium text-slate-400">
                                Mari kelola data dengan hati untuk masa depan siswa. ❤️
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full mt-4 md:mt-8">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setInput(suggestion.text)
                                        // Optional: auto-send
                                        // handleSendMessage()
                                    }}
                                    className="p-3 md:p-4 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 rounded-2xl text-left transition-all duration-300 flex items-center gap-3 md:gap-4 group"
                                >
                                    <span className="p-2 md:p-2.5 bg-slate-800/50 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 rounded-xl text-lg md:text-xl transition-colors">
                                        {suggestion.icon}
                                    </span>
                                    <span className="text-sm md:text-base text-slate-300 group-hover:text-white transition-colors">{suggestion.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                        </svg>
                                    </div>
                                )}
                                <div className={`max-w-[80%] ${msg.role === 'user'
                                    ? 'bg-indigo-600/20 border border-indigo-500/20 text-white rounded-[20px] rounded-tr-sm px-5 py-3 shadow-lg shadow-indigo-500/5'
                                    : 'text-slate-300'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <p>{msg.text}</p>
                                    ) : (
                                        <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-200 prose-strong:text-white max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    code({ node, inline, className, children, ...props }: any) {
                                                        const match = /language-(\w+)/.exec(className || '')
                                                        return !inline && match ? (
                                                            <div className="rounded-lg overflow-hidden border border-white/10 my-4 shadow-xl">
                                                                <div className="bg-slate-900/50 px-4 py-2 text-xs font-mono text-slate-400 border-b border-white/5 flex justify-between">
                                                                    <span>{match[1]}</span>
                                                                </div>
                                                                <SyntaxHighlighter
                                                                    style={vscDarkPlus}
                                                                    language={match[1]}
                                                                    PreTag="div"
                                                                    customStyle={{ margin: 0, borderRadius: 0, background: '#0f172a' }}
                                                                    {...props}
                                                                >
                                                                    {String(children).replace(/\n$/, '')}
                                                                </SyntaxHighlighter>
                                                            </div>
                                                        ) : (
                                                            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-sm" {...props}>
                                                                {children}
                                                            </code>
                                                        )
                                                    }
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 animate-pulse"></div>
                                <div className="flex gap-1 items-center h-8">
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6">
                <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] md:rounded-[25px] flex items-end p-2 pl-4 md:pl-6 transition-all duration-300 focus-within:bg-white/10 focus-within:border-indigo-500/30 focus-within:ring-1 focus-within:ring-indigo-500/30 shadow-2xl">
                    <div className="flex-1 min-w-0 py-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tanya Asisten Admin..."
                            className="w-full bg-transparent border-0 focus:ring-0 text-white placeholder-slate-400 resize-none h-[24px] max-h-[150px] md:max-h-[200px] overflow-y-auto leading-6 outline-none shadow-none ring-0 text-sm md:text-base"
                            style={{ height: Math.min(Math.max(input.split('\n').length * 24, 24), 200) + 'px' }}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || loading}
                        className="p-2.5 md:p-3 mr-0 md:mr-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 rounded-xl transition-all duration-300"
                    >
                        {loading ? (
                            <svg className="w-5 h-5 md:w-6 md:h-6 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 md:w-6 md:h-6 transform rotate-90" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                            </svg>
                        )}
                    </button>
                </div>
                <p className="text-center text-[10px] md:text-xs text-slate-500 mt-3 md:mt-4 font-medium">
                    AI mungkin membuat kesalahan. Mohon verifikasi informasi penting.
                </p>
            </div>
        </div>
    )
}
