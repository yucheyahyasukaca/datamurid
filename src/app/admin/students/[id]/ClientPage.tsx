'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EditStudentPage() {
    const router = useRouter()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [originalData, setOriginalData] = useState<any>(null)
    const [formData, setFormData] = useState({
        nama: '',
        rombel: '',
        nipd: '',
        jk: 'L',
        nisn: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        nik: '',
        agama: '',
        alamat: '',
        rt: '',
        rw: '',
        dusun: '',
        kelurahan: '',
        kecamatan: '',
        kode_pos: '',
        jenis_tinggal: '',
        no_hp: '',
        email: '',
        nama_ayah: '',
        nik_ayah: '',
        nama_ibu: '',
        nik_ibu: '',
    })

    useEffect(() => {
        const fetchStudent = async () => {
            if (!id) return

            try {
                const res = await fetch(`/api/admin/students/${id}`)
                const data = await res.json()

                if (!res.ok) throw new Error(data.error || 'Gagal memuat data siswa')

                if (data) {
                    const formattedData = {
                        nama: data.nama || '',
                        rombel: data.rombel || '',
                        nipd: data.nipd || '',
                        jk: data.jk || 'L',
                        nisn: data.nisn || '',
                        tempat_lahir: data.tempat_lahir || '',
                        tanggal_lahir: data.tanggal_lahir || '',
                        nik: data.nik || '',
                        agama: data.agama || '',
                        alamat: data.alamat || '',
                        rt: data.rt || '',
                        rw: data.rw || '',
                        dusun: data.dusun || '',
                        kelurahan: data.kelurahan || '',
                        kecamatan: data.kecamatan || '',
                        kode_pos: data.kode_pos || '',
                        jenis_tinggal: data.jenis_tinggal || '',
                        no_hp: data.no_hp || '',
                        email: data.email || '',
                        nama_ayah: data.nama_ayah || '',
                        nik_ayah: data.nik_ayah || '',
                        nama_ibu: data.nama_ibu || '',
                        nik_ibu: data.nik_ibu || '',
                    }
                    setFormData(formattedData)
                    setOriginalData(formattedData)
                }
            } catch (error: any) {
                alert('Gagal memuat data siswa: ' + error.message)
                router.push('/admin')
            } finally {
                setInitialLoading(false)
            }
        }

        fetchStudent()
    }, [id, router])

    const getChanges = (original: any, current: any) => {
        const changes: any = {}
        Object.keys(current).forEach(key => {
            if (original[key] !== current[key]) {
                changes[key] = {
                    old: original[key],
                    new: current[key]
                }
            }
        })
        return changes
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!formData.nama || !formData.nisn) {
                throw new Error('Nama dan NISN wajib diisi.')
            }

            const res = await fetch(`/api/admin/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Gagal menyimpan data')

            setOriginalData(formData) // Update original data to match current
            setIsEditing(false) // Switch back to view mode
            alert('Data berhasil diperbarui!')

        } catch (error: any) {
            alert('Gagal menyimpan perubahan: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
    const labelClass = "block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2"

    // Helper for Read-Only View
    const DetailItem = ({ label, value }: { label: string, value: string | null | undefined }) => (
        <div className="mb-4 last:mb-0">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</p>
            <p className="text-white font-medium text-base">{value || '-'}</p>
        </div>
    )

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-enter pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                        {isEditing ? 'Edit Data Murid' : 'Detail Murid'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {isEditing ? 'Perbarui data siswa secara manual.' : 'Informasi lengkap data siswa (Read Only).'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin" className="text-sm py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5">
                        &larr; Kembali
                    </Link>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-sm py-2 px-4 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 transition-colors border border-blue-500/20 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            Edit Data
                        </button>
                    )}
                </div>
            </div>

            {/* Sub-Header for Contact Info (Visible on View Mode) */}
            {!isEditing && (
                <div className="glass-panel p-6 border-l-4 border-l-green-500 relative overflow-hidden bg-gradient-to-r from-green-900/10 to-transparent">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider">Nomor Telepon / WA</p>
                                <div className="flex items-center gap-3">
                                    <p className="text-white font-mono text-lg">{formData.no_hp || '-'}</p>
                                    {formData.no_hp && (
                                        <a
                                            href={`https://wa.me/${formData.no_hp.replace(/^0/, '62').replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-bold border border-green-500/20 transition-colors flex items-center gap-1"
                                            title="Chat via WhatsApp"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.683-2.031-9.667-.272-.984-.47-.149-.669-.149-.198 0-.42.001-.643.001-.223 0-.585.085-.891.42-.306.335-1.177 1.151-1.177 2.807 0 1.657 1.206 3.257 1.374 3.481.169.224 2.374 3.626 5.751 5.087.803.348 1.429.557 1.916.711.8.252 1.528.217 2.108.131.649-.096 1.758-.718 2.006-1.411.248-.693.248-1.288.173-1.411z" /></svg>
                                            Chat WA
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider">Email Siswa</p>
                                <p className="text-white font-mono text-lg">{formData.email || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditing ? (
                // EDIT MODE FORM
                <form onSubmit={handleSubmit} className="space-y-8 animate-enter">
                    {/* Data Pribadi & Kontak */}
                    <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 text-sm border border-orange-500/20">1</span>
                            Data Pribadi & Kontak
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Nama Lengkap</label>
                                <input name="nama" type="text" placeholder="Contoh: Budi Santoso" className={inputClass} onChange={handleChange} value={formData.nama} required />
                            </div>

                            <div>
                                <label className={labelClass}>Rombel Saat Ini</label>
                                <input name="rombel" type="text" placeholder="Contoh: X-IPA-1" className={inputClass} onChange={handleChange} value={formData.rombel} />
                            </div>
                            <div>
                                <label className={labelClass}>Jenis Kelamin</label>
                                <div className="relative">
                                    <select name="jk" className={`${inputClass} appearance-none cursor-pointer`} onChange={handleChange} value={formData.jk}>
                                        <option value="L" className="bg-slate-900 text-white">Laki-laki</option>
                                        <option value="P" className="bg-slate-900 text-white">Perempuan</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>NISN</label>
                                <input name="nisn" type="text" placeholder="10 digit nomor" className={inputClass} onChange={handleChange} value={formData.nisn} required />
                            </div>
                            <div>
                                <label className={labelClass}>NIPD</label>
                                <input name="nipd" type="text" placeholder="Nomor Induk" className={inputClass} onChange={handleChange} value={formData.nipd} />
                            </div>

                            <div>
                                <label className={labelClass}>NIK</label>
                                <input name="nik" type="text" placeholder="16 digit NIK" className={inputClass} onChange={handleChange} value={formData.nik} />
                            </div>
                            <div>
                                <label className={labelClass}>Agama</label>
                                <div className="relative">
                                    <select name="agama" className={`${inputClass} appearance-none cursor-pointer`} onChange={handleChange} value={formData.agama}>
                                        <option value="" className="bg-slate-900 text-white">-- Pilih Agama --</option>
                                        <option value="Islam" className="bg-slate-900 text-white">Islam</option>
                                        <option value="Kristen" className="bg-slate-900 text-white">Kristen</option>
                                        <option value="Katolik" className="bg-slate-900 text-white">Katolik</option>
                                        <option value="Hindu" className="bg-slate-900 text-white">Hindu</option>
                                        <option value="Buddha" className="bg-slate-900 text-white">Buddha</option>
                                        <option value="Konghucu" className="bg-slate-900 text-white">Konghucu</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Tempat Lahir</label>
                                <input name="tempat_lahir" type="text" className={inputClass} onChange={handleChange} value={formData.tempat_lahir} />
                            </div>
                            <div>
                                <label className={labelClass}>Tanggal Lahir</label>
                                <input name="tanggal_lahir" type="date" className={`${inputClass} [color-scheme:dark]`} onChange={handleChange} value={formData.tanggal_lahir} />
                            </div>

                            {/* NEW: Contact Info Inputs */}
                            <div className="md:col-span-2 border-t border-white/5 pt-6 mt-2">
                                <h4 className="text-sm font-bold text-orange-200 mb-4 uppercase tracking-wider">Informasi Kontak</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Nomor Telepon / WA</label>
                                        <input name="no_hp" type="text" placeholder="08..." className={inputClass} onChange={handleChange} value={formData.no_hp} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Email</label>
                                        <input name="email" type="email" placeholder="contoh@email.com" className={inputClass} onChange={handleChange} value={formData.email} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm border border-blue-500/20">2</span>
                            Data Tempat Tinggal
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Alamat Jalan</label>
                                <input name="alamat" type="text" placeholder="Jalan, Gang, No Rumah" className={inputClass} onChange={handleChange} value={formData.alamat} />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <label className={labelClass}>RT</label>
                                    <input name="rt" type="text" className={inputClass} onChange={handleChange} value={formData.rt} />
                                </div>
                                <div>
                                    <label className={labelClass}>RW</label>
                                    <input name="rw" type="text" className={inputClass} onChange={handleChange} value={formData.rw} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelClass}>Kode Pos</label>
                                    <input name="kode_pos" type="text" className={inputClass} onChange={handleChange} value={formData.kode_pos} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className={labelClass}>Dusun/Lingkungan</label>
                                    <input name="dusun" type="text" className={inputClass} onChange={handleChange} value={formData.dusun} />
                                </div>
                                <div>
                                    <label className={labelClass}>Kelurahan/Desa</label>
                                    <input name="kelurahan" type="text" className={inputClass} onChange={handleChange} value={formData.kelurahan} />
                                </div>
                                <div>
                                    <label className={labelClass}>Kecamatan</label>
                                    <input name="kecamatan" type="text" className={inputClass} onChange={handleChange} value={formData.kecamatan} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Jenis Tinggal</label>
                                <div className="relative">
                                    <select name="jenis_tinggal" className={`${inputClass} appearance-none cursor-pointer`} onChange={handleChange} value={formData.jenis_tinggal}>
                                        <option value="" className="bg-slate-900 text-white">-- Pilih --</option>
                                        <option value="Bersama Orang Tua" className="bg-slate-900 text-white">Bersama Orang Tua</option>
                                        <option value="Wali" className="bg-slate-900 text-white">Wali</option>
                                        <option value="Kos" className="bg-slate-900 text-white">Kos</option>
                                        <option value="Asrama" className="bg-slate-900 text-white">Asrama</option>
                                        <option value="Panti Asuhan" className="bg-slate-900 text-white">Panti Asuhan</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm border border-indigo-500/20">3</span>
                            Data Orang Tua
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h4 className="font-semibold text-indigo-300 border-b border-white/5 pb-2 uppercase text-xs tracking-wider">Data Ayah</h4>
                                <div>
                                    <label className={labelClass}>Nama Ayah</label>
                                    <input name="nama_ayah" type="text" className={inputClass} onChange={handleChange} value={formData.nama_ayah} />
                                </div>
                                <div>
                                    <label className={labelClass}>NIK Ayah</label>
                                    <input name="nik_ayah" type="text" className={inputClass} onChange={handleChange} value={formData.nik_ayah} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="font-semibold text-indigo-300 border-b border-white/5 pb-2 uppercase text-xs tracking-wider">Data Ibu</h4>
                                <div>
                                    <label className={labelClass}>Nama Ibu</label>
                                    <input name="nama_ibu" type="text" className={inputClass} onChange={handleChange} value={formData.nama_ibu} />
                                </div>
                                <div>
                                    <label className={labelClass}>NIK Ibu</label>
                                    <input name="nik_ibu" type="text" className={inputClass} onChange={handleChange} value={formData.nik_ibu} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 sticky bottom-6 z-10 flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false)
                                setFormData(originalData) // Reset changes
                            }}
                            className="px-6 py-4 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all border border-white/10"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-bold text-white text-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            ) : (
                // READ ONLY VIEW
                <div className="space-y-8 animate-enter">
                    <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-500" />
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-400 text-sm border border-slate-500/20">1</span>
                            Data Pribadi
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
                            <DetailItem label="Nama Lengkap" value={formData.nama} />
                            <DetailItem label="Rombel" value={formData.rombel} />
                            <DetailItem label="Jenis Kelamin" value={formData.jk === 'L' ? 'Laki-laki' : 'Perempuan'} />
                            <DetailItem label="NISN" value={formData.nisn} />
                            <DetailItem label="NIPD" value={formData.nipd} />
                            <DetailItem label="NIK" value={formData.nik} />
                            <DetailItem label="Agama" value={formData.agama} />
                            <DetailItem label="Tempat Lahir" value={formData.tempat_lahir} />
                            <DetailItem label="Tanggal Lahir" value={formData.tanggal_lahir} />
                        </div>
                    </div>

                    <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm border border-blue-500/20">2</span>
                            Data Tempat Tinggal
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div className="md:col-span-2">
                                <DetailItem label="Alamat Lengkap" value={`${formData.alamat}, RT ${formData.rt || '-'} / RW ${formData.rw || '-'}`} />
                            </div>
                            <DetailItem label="Dusun/Lingkungan" value={formData.dusun} />
                            <DetailItem label="Kelurahan/Desa" value={formData.kelurahan} />
                            <DetailItem label="Kecamatan" value={formData.kecamatan} />
                            <DetailItem label="Kode Pos" value={formData.kode_pos} />
                            <DetailItem label="Jenis Tempat Tinggal" value={formData.jenis_tinggal} />
                        </div>
                    </div>

                    <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm border border-indigo-500/20">3</span>
                            Data Orang Tua
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                                <h4 className="font-bold text-indigo-300 mb-4 border-b border-white/5 pb-2">DATA AYAH</h4>
                                <div className="space-y-4">
                                    <DetailItem label="Nama Ayah" value={formData.nama_ayah} />
                                    <DetailItem label="NIK Ayah" value={formData.nik_ayah} />
                                </div>
                            </div>
                            <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                                <h4 className="font-bold text-indigo-300 mb-4 border-b border-white/5 pb-2">DATA IBU</h4>
                                <div className="space-y-4">
                                    <DetailItem label="Nama Ibu" value={formData.nama_ibu} />
                                    <DetailItem label="NIK Ibu" value={formData.nik_ibu} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
