'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export default function AIChatPage() {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [studentContext, setStudentContext] = useState<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const init = async () => {
            // Updated for HttpOnly Cookies:
            // We cannot check document.cookie for auth_token.
            // We rely on Middleware to have protected this route.
            // If we are here, we are likely authenticated.

            const studentNisn = localStorage.getItem('student_nisn')
            setIsAuthenticated(true) // Assume true if page loaded

            if (studentNisn) {
                try {
                    const res = await fetch(`/api/students/detail?nisn=${studentNisn}`)

                    if (res.status === 401) {
                        setIsAuthenticated(false)
                        router.push('/login')
                        return
                    }

                    const json = await res.json()
                    if (json.data) {
                        const data = json.data
                        const requiredFields = ['nama', 'nisn', 'tempat_lahir', 'tanggal_lahir', 'nik', 'agama', 'nama_ayah', 'nama_ibu']
                        const missing = requiredFields.filter(f => !data[f])

                        setStudentContext({
                            name: data.nama,
                            missingFields: missing,
                            isVerified: data.is_verified,
                            nisn: data.nisn
                        })
                    }
                } catch (e) {
                    console.error("Failed to fetch student context", e)
                }
            } else {
                // If no NISN in localstorage, we might be an admin viewing this or a student with cleared storage?
                // Just let them chat without context or redirect?
                // For now, allow it but maybe minimal context.
            }
        }

        init()
    }, [router])

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            // Prepare history (last 10 messages to save context/tokens)
            // Convert to Gemini format: 'user' -> 'user', 'assistant' -> 'model'
            const history = messages.slice(-10).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));

            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    history: history, // Send history
                    studentContext: studentContext
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mendapatkan respons dari AI')
            }

            const aiMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, aiMessage])
        } catch (error) {
            console.error('Error:', error)
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Maaf, ada kesalahan saat menghubungi AI. Coba lagi ya!',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">

            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Konsultan AI SMAN 1 Pati</h1>
                                <p className="text-xs text-slate-400">Siap membantu kamu!</p>
                            </div>
                        </div>
                    </div>
                    <Image
                        src="/sman1pati.png"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="rounded-lg"
                    />
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-6">

                    {messages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/20 flex items-center justify-center">
                                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-slate-200">Hai! Aku AI Konsultan SMAN 1 Pati</h2>
                            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                                Tanya apa aja yang kamu mau! Bisa tentang pelajaran, info sekolah, konsultasi universitas & jurusan, atau curhat. Aku siap bantu! 🎓
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                                {[
                                    'Cek kelengkapan data saya',
                                    'Ada alumni yang diterima di UGM?',
                                    'Peluang saya masuk Teknik Sipil gimana?',
                                    'Siapa saja yang lolos SNBP 2025?',
                                    'Jurusan apa yang paling banyak diminati?',
                                    'Rekomendasi kampus sesuai nilai saya'
                                ].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(suggestion)}
                                        className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all hover:scale-105"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                                    </svg>
                                </div>
                            )}


                            <div
                                className={`max-w-[85%] md:max-w-[75%] px-5 py-4 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-md shadow-lg shadow-blue-500/10'
                                    : 'bg-white/5 border border-white/10 text-white rounded-bl-md shadow-lg'
                                    }`}
                            >
                                <div className={`prose prose-sm md:prose-base ${msg.role === 'assistant' ? 'prose-invert' : ''} max-w-none leading-relaxed`}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: ({ node, ...props }: any) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline" />,
                                            ul: ({ node, ...props }: any) => <ul {...props} className="list-disc pl-4 space-y-1 my-2 !text-white" />,
                                            ol: ({ node, ...props }: any) => <ol {...props} className="list-decimal pl-4 space-y-1 my-2 !text-white" />,
                                            li: ({ node, ...props }: any) => <li {...props} className="pl-1 !text-white" />,
                                            p: ({ node, ...props }: any) => <p {...props} className="!text-white" />,
                                            strong: ({ node, ...props }: any) => <strong {...props} className="!text-white font-bold" />,
                                            em: ({ node, ...props }: any) => <em {...props} className="!text-white" />,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                                </svg>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 bg-slate-900/50 backdrop-blur-lg sticky bottom-0">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ketik pertanyaan kamu di sini..."
                                rows={1}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none max-h-32"
                                style={{ minHeight: '48px' }}
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        AI bisa salah. Cek info penting dengan guru ya!
                    </p>
                </div>
            </div>
        </div>
    )
}
