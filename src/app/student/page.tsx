'use client'

import React, { useState } from 'react'
import * as XLSX from 'xlsx'

export default function StudentDashboard() {
    const [isVerified, setIsVerified] = useState(false)

    // Dummy Data for Demo
    const studentData = {
        nama: 'Budi Santoso',
        rombel: 'X-IPA-1',
        nipd: '12345',
        jk: 'L',
        nisn: '0081234567',
        tempat_lahir: 'Jakarta',
        tanggal_lahir: '2008-05-20',
        nik: '3171234567890001',
        agama: 'Islam',
        alamat: 'Jl. Mawar No. 10',
        rt: '001', rw: '005',
        dusun: '-', kelurahan: 'Cilandak', kecamatan: 'Cilandak',
        kode_pos: '12430',
        jenis_tinggal: 'Bersama Orang Tua',
        nama_ayah: 'Slamet',
        nama_ibu: 'Siti',
    }

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet([studentData])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Data Saya")
        XLSX.writeFile(wb, `${studentData.nama}_Data.xlsx`)
    }

    const handleValidate = () => {
        if (confirm('Apakah anda yakin data ini sudah benar? Aksi ini tidak dapat dibatalkan.')) {
            setIsVerified(true)
            // TODO: Call API to update status
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cek Data Anda</h1>
                    <p className="text-gray-500">Pastikan data berikut sudah benar.</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleExport} className="btn bg-green-50 text-green-700 border border-green-200 hover:bg-green-100">
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <h2 className="font-bold text-gray-700">Detail Data Murid</h2>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    {Object.entries(studentData).map(([key, value]) => (
                        <div key={key} className="border-b border-gray-50 pb-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                                {key.replace(/_/g, ' ')}
                            </label>
                            <div className="font-medium text-gray-800">{value}</div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col items-center justify-center gap-4 text-center">
                    {isVerified ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            <span className="font-semibold">Data Sudah Terverifikasi</span>
                        </div>
                    ) : (
                        <div className="w-full max-w-md">
                            <p className="text-sm text-gray-600 mb-4">
                                Jika data sudah benar, silakan klik tombol di bawah ini untuk melakukan validasi.
                            </p>
                            <button
                                onClick={handleValidate}
                                className="btn btn-primary w-full shadow-xl shadow-blue-500/20 py-3 text-lg"
                            >
                                Saya Konfirmasi Data Sudah Benar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
