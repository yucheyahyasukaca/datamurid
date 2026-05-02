'use client'

import React, { useState, useEffect, useCallback } from 'react'

interface GraduationRecord {
    id: string
    nisn: string
    nama: string | null
    tanggal_lahir: string | null
    no_ujian: string | null
    kota: string | null
    agama: string | null
    kelas: string | null
    status: 'LULUS' | 'TIDAK LULUS'
}

interface CountdownValues {
    days: number
    hours: number
    minutes: number
    seconds: number
}

function calcCountdown(releaseTime: string): CountdownValues {
    const diff = Math.max(0, new Date(releaseTime).getTime() - Date.now())
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
    }
}

export default function StudentKelulusanPage() {
    const [loading, setLoading] = useState(true)
    const [releaseTime, setReleaseTime] = useState<string | null>(null)
    const [isReleased, setIsReleased] = useState(false)
    const [record, setRecord] = useState<GraduationRecord | null>(null)
    const [countdown, setCountdown] = useState<CountdownValues>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/students/grades/kelulusan')
            if (!res.ok) {
                const result = await res.json()
                throw new Error(result.error || 'Gagal memuat data')
            }
            const result = await res.json()
            setReleaseTime(result.releaseTime)
            setIsReleased(result.isReleased)
            setRecord(result.record)
            if (result.releaseTime && !result.isReleased) {
                setCountdown(calcCountdown(result.releaseTime))
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    useEffect(() => {
        if (!releaseTime || isReleased) return
        const interval = setInterval(() => {
            const cd = calcCountdown(releaseTime)
            setCountdown(cd)
            if (cd.days === 0 && cd.hours === 0 && cd.minutes === 0 && cd.seconds === 0) {
                clearInterval(interval)
                fetchData()
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [releaseTime, isReleased, fetchData])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center glass-panel p-8 max-w-md border border-white/10">
                    <p className="text-red-400 font-medium">{error}</p>
                </div>
            </div>
        )
    }

    // Kondisi A: Belum dijadwalkan
    if (!releaseTime) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center glass-panel p-10 max-w-md border border-white/10">
                    <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Belum Dijadwalkan</h3>
                    <p className="text-slate-400 text-sm">Pengumuman kelulusan belum dijadwalkan oleh admin.</p>
                </div>
            </div>
        )
    }

    // Kondisi B: Countdown
    if (!isReleased) {
        const releaseDate = new Date(releaseTime)
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center max-w-2xl w-full px-4">
                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                        <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Pengumuman Kelulusan</h2>
                    <p className="text-slate-400 mb-2">Akan dibuka pada</p>
                    <p className="text-amber-400 font-semibold mb-8 text-lg">
                        {releaseDate.toLocaleDateString('id-ID', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })} · {releaseDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </p>

                    <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
                        {[
                            { value: countdown.days, label: 'Hari' },
                            { value: countdown.hours, label: 'Jam' },
                            { value: countdown.minutes, label: 'Menit' },
                            { value: countdown.seconds, label: 'Detik' },
                        ].map(({ value, label }) => (
                            <div key={label} className="glass-panel p-4 border border-amber-500/20 bg-amber-500/5 rounded-2xl">
                                <div className="text-3xl md:text-4xl font-bold text-amber-400 tabular-nums">
                                    {String(value).padStart(2, '0')}
                                </div>
                                <div className="text-xs text-slate-400 mt-1 font-medium">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Kondisi C: Rilis — data tidak ditemukan
    if (!record) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center glass-panel p-10 max-w-md border border-white/10">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Data Tidak Ditemukan</h3>
                    <p className="text-slate-400 text-sm">
                        Data kelulusan Anda belum tersedia. Hubungi pihak sekolah untuk informasi lebih lanjut.
                    </p>
                </div>
            </div>
        )
    }

    // Kondisi C: Rilis — tampilkan kartu kelulusan
    const isLulus = record.status === 'LULUS'
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                    Info Kelulusan
                </h2>
                <p className="text-slate-400 text-sm">Hasil pengumuman kelulusan resmi</p>
            </div>

            {/* Status Badge */}
            <div className={`glass-panel p-8 text-center border-2 ${
                isLulus ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/40 bg-red-500/5'
            }`}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isLulus ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                    {isLulus ? (
                        <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ) : (
                        <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    )}
                </div>
                <div className={`text-4xl font-black mb-2 ${isLulus ? 'text-green-400' : 'text-red-400'}`}>
                    {record.status}
                </div>
                <p className={`text-sm font-medium ${isLulus ? 'text-green-300' : 'text-red-300'}`}>
                    {isLulus ? 'Selamat! Anda dinyatakan lulus.' : 'Anda dinyatakan tidak lulus.'}
                </p>
            </div>

            {/* Student Details */}
            <div className="glass-panel p-6 border border-white/10 space-y-4">
                <h3 className="text-white font-bold text-lg mb-4">Data Siswa</h3>
                {[
                    { label: 'Nama', value: record.nama },
                    { label: 'Kelas', value: record.kelas },
                    { label: 'No. Peserta', value: record.nisn },
                    { label: 'No. Ujian', value: record.no_ujian },
                    { label: 'Tanggal Lahir', value: record.tanggal_lahir },
                    { label: 'Kota', value: record.kota },
                    { label: 'Agama', value: record.agama },
                ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-slate-400 text-sm">{label}</span>
                        <span className="text-white font-medium text-sm text-right">{value || '-'}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
