'use client'
import { useState } from 'react'

export default function FixPermissions() {
    const [email, setEmail] = useState('')
    const [msg, setMsg] = useState('')

    const handlePromote = async () => {
        const res = await fetch('/api/admin/promote', {
            method: 'POST',
            body: JSON.stringify({ email }),
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await res.json()
        setMsg(data.message || data.error)
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Fix Admin Permissions</h1>
            <p className="mb-4 text-slate-400">Enter your <b>Email</b> OR <b>User UID</b> (from Supabase).</p>
            <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@school.id OR b645fdc9-..."
                className="p-3 rounded bg-slate-800 border border-slate-700 mb-4 w-full max-w-sm"
            />
            <button
                onClick={handlePromote}
                className="bg-blue-600 px-6 py-2 rounded font-bold hover:bg-blue-500"
            >
                Promote to Admin
            </button>
            {msg && <p className="mt-4 p-2 bg-slate-800 rounded">{msg}</p>}
        </div>
    )
}
