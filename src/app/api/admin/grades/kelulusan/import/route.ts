// src/app/api/admin/grades/kelulusan/import/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'
import * as XLSX from 'xlsx'

export const runtime = 'edge'

export async function POST(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const formData = await request.formData()
        const file = formData.get('file') as File
        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet)

        if (!jsonData || jsonData.length === 0) {
            return NextResponse.json({ error: 'File Excel kosong atau format tidak sesuai' }, { status: 400 })
        }

        // Hapus semua data lama
        await supabaseAdmin
            .from('graduation_records')
            .delete()
            .gte('created_at', '1970-01-01T00:00:00Z')

        const results = { success: [] as any[], failed: [] as any[] }

        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i]
            try {
                const nisn = row['No. Peserta']?.toString().trim()
                if (!nisn) {
                    results.failed.push({ row: i + 2, reason: 'Kolom "No. Peserta" tidak ditemukan atau kosong' })
                    continue
                }

                const rawStatus = row['Status']?.toString().trim().toUpperCase()
                if (rawStatus !== 'LULUS' && rawStatus !== 'TIDAK LULUS') {
                    results.failed.push({ row: i + 2, nisn, reason: `Status tidak valid: "${row['Status']}" — harus LULUS atau TIDAK LULUS` })
                    continue
                }

                const record = {
                    nisn,
                    nama: row['Nama']?.toString().trim() || null,
                    tanggal_lahir: row['Tanggal Lahir']?.toString().trim() || null,
                    no_ujian: row['No. Ujian']?.toString().trim() || null,
                    kota: row['Kota']?.toString().trim() || null,
                    agama: row['Agama']?.toString().trim() || null,
                    kelas: row['Kelas']?.toString().trim() || null,
                    status: rawStatus as 'LULUS' | 'TIDAK LULUS',
                }

                const { error } = await supabaseAdmin
                    .from('graduation_records')
                    .insert(record)

                if (error) throw error
                results.success.push({ row: i + 2, nisn })
            } catch (err: any) {
                results.failed.push({ row: i + 2, nisn: row['No. Peserta'], reason: err.message })
            }
        }

        return NextResponse.json({
            message: 'Import completed',
            total: jsonData.length,
            success: results.success.length,
            failed: results.failed.length,
            details: results
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Gagal import file' }, { status: 500 })
    }
}
