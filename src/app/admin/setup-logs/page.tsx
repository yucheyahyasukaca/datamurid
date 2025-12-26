'use client'

import React, { useState } from 'react'

export default function SetupLogsPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const checkTable = async () => {
        setStatus('loading')
        try {
            const response = await fetch('/api/admin/setup-logs', { method: 'POST' })
            const data = await response.json()

            if (!data.success) throw new Error(data.error)

            setStatus('success')
            setMessage('Table verified! You can now use the Logs feature.')
        } catch (error: any) {
            setStatus('error')
            setMessage(error.message)
        }
    }

    const sqlCommand = `CREATE TABLE IF NOT EXISTS public.student_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_email TEXT NOT NULL,
    student_name TEXT,
    student_id UUID,
    action TEXT NOT NULL,
    changes JSONB,
    timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_logs_student_id ON public.student_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_student_logs_timestamp ON public.student_logs(timestamp DESC);`

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-4">Setup Student Logs</h1>

            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-slate-300">1. Run this SQL</h3>
                <p className="text-slate-400 mb-4 text-sm">
                    Open your Supabase Dashboard &gt; SQL Editor and run the following command:
                </p>
                <pre className="bg-black/50 p-4 rounded-lg text-xs font-mono text-green-400 overflow-x-auto select-all">
                    {sqlCommand}
                </pre>
            </div>

            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-300">2. Verify Setup</h3>
                    <p className="text-slate-400 text-sm">Click here after running the SQL.</p>
                </div>

                {status === 'idle' && (
                    <button
                        onClick={checkTable}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
                    >
                        Verify Table
                    </button>
                )}

                {status === 'loading' && (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                )}

                {status === 'success' && (
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 font-medium">
                        ✅ Verified
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-end">
                        <button
                            onClick={checkTable}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors mb-2"
                        >
                            Retry
                        </button>
                        <span className="text-red-400 text-xs max-w-xs text-right">{message}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
