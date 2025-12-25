'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase' // Import Supabase Client
import { useRouter } from 'next/navigation'

import * as XLSX from 'xlsx'

export default function NewStudentPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [importLoading, setImportLoading] = useState(false)
    const [progress, setProgress] = useState(0)
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Basic validation
            if (!formData.nama || !formData.nisn) {
                throw new Error('Nama dan NISN wajib diisi.')
            }

            // Insert into Supabase
            const { error } = await supabase
                .from('students')
                .insert([
                    {
                        ...formData,
                        is_verified: false, // Default status
                    }
                ])

            if (error) throw error

            alert('Data berhasil disimpan ke Database!')
            router.push('/admin') // Redirect to dashboard

        } catch (error: any) {
            alert('Gagal menyimpan data: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    // Handle File Upload for Bulk Import
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImportLoading(true)
        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            if (jsonData.length === 0) throw new Error('File Excel kosong data.')

            // Map keys to match database columns (Assuming generic logic or template matching)
            // Ideally we validate or map columns here. For now, assuming user uses correct headers.
            // Let's normalize keys to lowercase just in case.

            const normalizedData = jsonData.map((row: any) => {
                const newRow: any = {}
                Object.keys(row).forEach(key => {
                    // Simple normalization: remove special chars, lowercase, replace space with underscore
                    // But for robustness, we might just assume headers match DB or are simple.
                    // For this MVP, let's just pass row and hope headers are "nama", "nisn", etc.
                    // Or we can be smart and map standard Indonesian headers like "Nama Lengkap" -> "nama"

                    const lowerKey = key.toLowerCase()
                    if (lowerKey.includes('nama')) newRow['nama'] = row[key]
                    else if (lowerKey.includes('nisn')) newRow['nisn'] = String(row[key]) // Ensure string
                    else if (lowerKey.includes('rombel') || lowerKey.includes('kelas')) newRow['rombel'] = row[key]
                    else if (lowerKey.includes('nipd')) newRow['nipd'] = String(row[key])
                    else if (lowerKey.includes('jk') || lowerKey.includes('kelamin')) newRow['jk'] = row[key]
                    else if (lowerKey.includes('tempat lahir')) newRow['tempat_lahir'] = row[key]
                    else if (lowerKey.includes('tanggal lahir')) {
                        // Convert Excel date to YYYY-MM-DD if needed, or string
                        // XLSX usually parses dates as numbers or strings depending on cell format.
                        // For simplicity, let's assume text or try to stringify.
                        newRow['tanggal_lahir'] = String(row[key])
                    }
                    else newRow[lowerKey] = row[key] // Fallback
                })

                if (!newRow.nama || !newRow.nisn) return null // Skip invalid rows

                return {
                    ...newRow,
                    is_verified: false
                }
            }).filter(Boolean)

            if (normalizedData.length === 0) throw new Error('Tidak ada data valid ditemukan (Periksa header kolom: Nama, NISN).')

            const { error } = await supabase.from('students').insert(normalizedData)
            if (error) throw error

            alert(`Berhasil mengimpor ${normalizedData.length} data siswa!`)
            router.push('/admin')

        } catch (error: any) {
            alert('Gagal import file: ' + error.message)
        } finally {
            setImportLoading(false)
            e.target.value = '' // Reset input
        }
    }

    // Styles for consistency
    const inputClass = "w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
    const labelClass = "block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2"

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-enter pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">Tambah Murid Baru</h2>
                    <p className="text-slate-400 text-sm">Input manual atau import dari Excel.</p>
                </div>
                <Link href="/admin" className="text-sm py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5">
                    &larr; Kembali ke Data
                </Link>
            </div>

            {/* Import Section */}
            <div className="glass-panel p-6 bg-blue-900/10 border-blue-500/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-blue-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Import Data dari Excel
                        </h3>
                        <p className="text-blue-200/60 text-sm mt-1">Upload file .xlsx berisi data siswa (Kolom: Nama, NISN, Rombel, dll)</p>
                    </div>
                    <div>
                        <label className={`relative inline-flex items-center justify-center px-6 py-3 font-bold text-white transition-all duration-200 bg-blue-600 rounded-xl cursor-pointer hover:bg-blue-500 shadow-md ${importLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {importLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Memproses...
                                </span>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    <span>Pilih File Excel</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                disabled={importLoading}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
                {importLoading && (
                    <div className="w-full bg-blue-900/50 h-2 rounded-full mt-4 overflow-hidden">
                        <div
                            className="bg-blue-500 h-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-sm uppercase tracking-wider">Atau Input Manual</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Data Pribadi */}
                <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 text-sm border border-orange-500/20">1</span>
                        Data Pribadi
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Nama Lengkap</label>
                            <input name="nama" type="text" placeholder="Contoh: Budi Santoso" className={inputClass} onChange={handleChange} required />
                        </div>

                        <div>
                            <label className={labelClass}>Rombel Saat Ini</label>
                            <input name="rombel" type="text" placeholder="Contoh: X-IPA-1" className={inputClass} onChange={handleChange} />
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
                            <input name="nisn" type="text" placeholder="10 digit nomor" className={inputClass} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className={labelClass}>NIPD</label>
                            <input name="nipd" type="text" placeholder="Nomor Induk" className={inputClass} onChange={handleChange} />
                        </div>

                        <div>
                            <label className={labelClass}>NIK</label>
                            <input name="nik" type="text" placeholder="16 digit NIK" className={inputClass} onChange={handleChange} />
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
                            <input name="tempat_lahir" type="text" className={inputClass} onChange={handleChange} />
                        </div>
                        <div>
                            <label className={labelClass}>Tanggal Lahir</label>
                            <input name="tanggal_lahir" type="date" className={`${inputClass} [color-scheme:dark]`} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Alamat */}
                <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm border border-blue-500/20">2</span>
                        Data Tempat Tinggal
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Alamat Jalan</label>
                            <input name="alamat" type="text" placeholder="Jalan, Gang, No Rumah" className={inputClass} onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <label className={labelClass}>RT</label>
                                <input name="rt" type="text" className={inputClass} onChange={handleChange} />
                            </div>
                            <div>
                                <label className={labelClass}>RW</label>
                                <input name="rw" type="text" className={inputClass} onChange={handleChange} />
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass}>Kode Pos</label>
                                <input name="kode_pos" type="text" className={inputClass} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClass}>Dusun/Lingkungan</label>
                                <input name="dusun" type="text" className={inputClass} onChange={handleChange} />
                            </div>
                            <div>
                                <label className={labelClass}>Kelurahan/Desa</label>
                                <input name="kelurahan" type="text" className={inputClass} onChange={handleChange} />
                            </div>
                            <div>
                                <label className={labelClass}>Kecamatan</label>
                                <input name="kecamatan" type="text" className={inputClass} onChange={handleChange} />
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

                {/* Section 3: Orang Tua */}
                <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm border border-indigo-500/20">3</span>
                        Data Orang Tua
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Ayah */}
                        <div className="space-y-6">
                            <h4 className="font-semibold text-indigo-300 border-b border-white/5 pb-2 uppercase text-xs tracking-wider">Data Ayah</h4>
                            <div>
                                <label className={labelClass}>Nama Ayah</label>
                                <input name="nama_ayah" type="text" className={inputClass} onChange={handleChange} />
                            </div>
                            <div>
                                <label className={labelClass}>NIK Ayah</label>
                                <input name="nik_ayah" type="text" className={inputClass} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Ibu */}
                        <div className="space-y-6">
                            <h4 className="font-semibold text-indigo-300 border-b border-white/5 pb-2 uppercase text-xs tracking-wider">Data Ibu</h4>
                            <div>
                                <label className={labelClass}>Nama Ibu</label>
                                <input name="nama_ibu" type="text" className={inputClass} onChange={handleChange} />
                            </div>
                            <div>
                                <label className={labelClass}>NIK Ibu</label>
                                <input name="nik_ibu" type="text" className={inputClass} onChange={handleChange} />
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
                        {loading ? 'Menyimpan...' : 'Simpan Data Murid'}
                    </button>
                </div>
            </form>
        </div>
    )
}
