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
        nama_ayah: '',
        nik_ayah: '',
        nama_ibu: '',
        nik_ibu: '',
    })

    useEffect(() => {
        const fetchStudent = async () => {
            if (!id) return

            try {
                const { data, error } = await supabase
                    .from('students')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error
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

            const { error } = await supabase
                .from('students')
                .update(formData)
                .eq('id', id)

            if (error) throw error

            const changes = getChanges(originalData, formData)
            if (Object.keys(changes).length > 0) {
                const { data: { user } } = await supabase.auth.getUser()
                const adminEmail = user?.email || 'unknown'

                await supabase.from('student_logs').insert({
                    admin_email: adminEmail,
                    student_name: formData.nama,
                    student_id: id,
                    action: 'UPDATE',
                    changes: changes
                })
            }

            alert('Data berhasil diperbarui!')
            router.push('/admin')

        } catch (error: any) {
            alert('Gagal menyimpan perubahan: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
    const labelClass = "block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2"

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
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">Edit Data Murid</h2>
                    <p className="text-slate-400 text-sm">Perbarui data siswa secara manual.</p>
                </div>
                <Link href="/admin" className="text-sm py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5">
                    &larr; Kembali ke Data
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 text-sm border border-orange-500/20">1</span>
                        Data Pribadi
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

                <div className="pt-6 sticky bottom-6 z-10">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto ml-auto flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-bold text-white text-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    )
}
