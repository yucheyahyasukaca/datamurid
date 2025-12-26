'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentEditPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<any>({})
    const [requestId, setRequestId] = useState<string | null>(null)
    const [error, setError] = useState('')

    // Fields config
    const textFields = [
        { key: 'nama', label: 'Nama Lengkap' },
        { key: 'nisn', label: 'NISN' },
        { key: 'nipd', label: 'NIPD' },
        { key: 'rombel', label: 'Rombel' },
        { key: 'jk', label: 'Jenis Kelamin (L/P)' },
        { key: 'tempat_lahir', label: 'Tempat Lahir' },
        { key: 'tanggal_lahir', label: 'Tanggal Lahir (YYYY-MM-DD)', type: 'date' },
        { key: 'nik', label: 'NIK' },
        { key: 'agama', label: 'Agama' },
        { key: 'alamat', label: 'Alamat Jalan' },
        { key: 'rt', label: 'RT' },
        { key: 'rw', label: 'RW' },
        { key: 'dusun', label: 'Dusun' },
        { key: 'kelurahan', label: 'Desa/Kelurahan' },
        { key: 'kecamatan', label: 'Kecamatan' },
        { key: 'kode_pos', label: 'Kode Pos' },
        { key: 'jenis_tinggal', label: 'Jenis Tinggal' },
        { key: 'no_hp', label: 'No HP' },
        { key: 'email', label: 'Email' },
    ]

    const parentFields = [
        { key: 'nama_ayah', label: 'Nama Ayah' },
        { key: 'nik_ayah', label: 'NIK Ayah' },
        { key: 'nama_ibu', label: 'Nama Ibu' },
        { key: 'nik_ibu', label: 'NIK Ibu' },
    ]

    useEffect(() => {
        const nisn = localStorage.getItem('student_nisn')
        if (!nisn) {
            router.push('/login')
            return
        }
        checkStatusAndFetchData(nisn)
    }, [])

    const checkStatusAndFetchData = async (nisn: string) => {
        try {
            // 1. Check Status
            const statusRes = await fetch(`/api/requests/student/status?nisn=${nisn}`)
            const statusJson = await statusRes.json()

            if (statusJson.data?.status !== 'EDITING') {
                alert('Anda tidak memiliki akses edit saat ini.')
                router.push('/student')
                return
            }

            setRequestId(statusJson.data.id)

            // 2. Fetch Data
            const dataRes = await fetch(`/api/students/detail?nisn=${nisn}`)
            const dataJson = await dataRes.json()

            if (dataJson.data) {
                setFormData(dataJson.data)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch('/api/requests/student/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    data: formData // Send the whole blob
                })
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error)

            alert('Perubahan berhasil disimpan! Menunggu validasi admin.')
            router.push('/student')

        } catch (err: any) {
            alert('Gagal menyimpan: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="text-center p-10 text-white">Memuat...</div>

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Edit Data Siswa</h1>
                    <button onClick={() => router.back()} className="text-sm px-4 py-2 rounded bg-white/10 hover:bg-white/20 transition">
                        Batal
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Official Data */}
                    <section className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                        <h2 className="text-lg font-semibold text-blue-400 mb-6 border-b border-white/5 pb-2">Data Pribadi</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {textFields.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">{field.label}</label>
                                    <input
                                        type={field.type || 'text'}
                                        name={field.key}
                                        value={formData[field.key] || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Parents Data */}
                    <section className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                        <h2 className="text-lg font-semibold text-green-400 mb-6 border-b border-white/5 pb-2">Data Orang Tua</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {parentFields.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">{field.label}</label>
                                    <input
                                        type="text"
                                        name={field.key}
                                        value={formData[field.key] || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:bg-white/5 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition transform hover:scale-105"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
