'use client'

import React, { useState } from 'react'

export default function NewStudentPage() {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        alert('Simulasi: Data berhasil disimpan!\n' + JSON.stringify(formData, null, 2))
        // TODO: Implement Supabase insert
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Tambah Data Murid</h2>
                <button type="button" className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Data Pribadi */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="section-title text-blue-600 font-semibold mb-4">
                        A. Data Pribadi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label>Nama Lengkap</label>
                            <input name="nama" type="text" placeholder="Contoh: Budi Santoso" onChange={handleChange} required />
                        </div>

                        <div>
                            <label>Rombel Saat Ini</label>
                            <input name="rombel" type="text" placeholder="Contoh: X-IPA-1" onChange={handleChange} />
                        </div>
                        <div>
                            <label>Jenis Kelamin</label>
                            <select name="jk" onChange={handleChange} value={formData.jk}>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>

                        <div>
                            <label>NISN</label>
                            <input name="nisn" type="text" placeholder="10 digit nomor" onChange={handleChange} required />
                        </div>
                        <div>
                            <label>NIPD</label>
                            <input name="nipd" type="text" placeholder="Nomor Induk" onChange={handleChange} />
                        </div>

                        <div>
                            <label>NIK</label>
                            <input name="nik" type="text" placeholder="16 digit NIK" onChange={handleChange} />
                        </div>
                        <div>
                            <label>Agama</label>
                            <select name="agama" onChange={handleChange} value={formData.agama}>
                                <option value="">-- Pilih Agama --</option>
                                <option value="Islam">Islam</option>
                                <option value="Kristen">Kristen</option>
                                <option value="Katolik">Katolik</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Buddha">Buddha</option>
                                <option value="Konghucu">Konghucu</option>
                            </select>
                        </div>

                        <div>
                            <label>Tempat Lahir</label>
                            <input name="tempat_lahir" type="text" onChange={handleChange} />
                        </div>
                        <div>
                            <label>Tanggal Lahir</label>
                            <input name="tanggal_lahir" type="date" onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Alamat */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="section-title text-blue-600 font-semibold mb-4">
                        B. Data Tempat Tinggal
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label>Alamat Jalan</label>
                            <input name="alamat" type="text" placeholder="Jalan, Gang, No Rumah" onChange={handleChange} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label>RT</label>
                                <input name="rt" type="text" onChange={handleChange} />
                            </div>
                            <div>
                                <label>RW</label>
                                <input name="rw" type="text" onChange={handleChange} />
                            </div>
                            <div className="col-span-2">
                                <label>Kode Pos</label>
                                <input name="kode_pos" type="text" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label>Dusun/Lingkungan</label>
                                <input name="dusun" type="text" onChange={handleChange} />
                            </div>
                            <div>
                                <label>Kelurahan/Desa</label>
                                <input name="kelurahan" type="text" onChange={handleChange} />
                            </div>
                            <div>
                                <label>Kecamatan</label>
                                <input name="kecamatan" type="text" onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <label>Jenis Tinggal</label>
                            <select name="jenis_tinggal" onChange={handleChange} value={formData.jenis_tinggal}>
                                <option value="">-- Pilih --</option>
                                <option value="Bersama Orang Tua">Bersama Orang Tua</option>
                                <option value="Wali">Wali</option>
                                <option value="Kos">Kos</option>
                                <option value="Asrama">Asrama</option>
                                <option value="Panti Asuhan">Panti Asuhan</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 3: Orang Tua */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="section-title text-blue-600 font-semibold mb-4">
                        C. Data Orang Tua
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Ayah */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-700 border-b pb-2">Data Ayah</h4>
                            <div>
                                <label>Nama Ayah</label>
                                <input name="nama_ayah" type="text" onChange={handleChange} />
                            </div>
                            <div>
                                <label>NIK Ayah</label>
                                <input name="nik_ayah" type="text" onChange={handleChange} />
                            </div>
                        </div>

                        {/* Ibu */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-700 border-b pb-2">Data Ibu</h4>
                            <div>
                                <label>Nama Ibu</label>
                                <input name="nama_ibu" type="text" onChange={handleChange} />
                            </div>
                            <div>
                                <label>NIK Ibu</label>
                                <input name="nik_ibu" type="text" onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="btn btn-primary w-full md:w-auto px-8 py-3 text-base shadow-lg shadow-blue-500/30">
                        Simpan Data Murid
                    </button>
                </div>
            </form>
        </div>
    )
}
