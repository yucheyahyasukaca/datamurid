// src/app/api/admin/grades/kelulusan/import/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'
import * as XLSX from 'xlsx'

export const runtime = 'edge'

export async function POST(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const raw = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))
        const token = raw ? raw.trim().slice('auth_token='.length) : undefined
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

        const validRecords: any[] = []
        const seenNisn = new Set<string>()
        const results = { success: [] as any[], failed: [] as any[] }

        // Validation pass — collect all valid records first
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i]
            const nisn = row['No. Peserta']?.toString().trim()

            if (!nisn) {
                results.failed.push({ row: i + 2, reason: 'Kolom "No. Peserta" tidak ditemukan atau kosong' })
                continue
            }

            if (seenNisn.has(nisn)) {
                results.failed.push({ row: i + 2, nisn, reason: 'NISN duplikat dalam file Excel' })
                continue
            }

            const rawStatus = row['Status']?.toString().trim().toUpperCase()
            if (rawStatus !== 'LULUS' && rawStatus !== 'TIDAK LULUS') {
                results.failed.push({ row: i + 2, nisn, reason: `Status tidak valid: "${row['Status']}" — harus LULUS atau TIDAK LULUS` })
                continue
            }

            seenNisn.add(nisn)
            validRecords.push({
                nisn,
                nama: row['Nama']?.toString().trim() || null,
                tanggal_lahir: row['Tanggal Lahir']?.toString().trim() || null,
                no_ujian: row['No. Ujian']?.toString().trim() || null,
                kota: row['Kota']?.toString().trim() || null,
                agama: row['Agama']?.toString().trim() || null,
                kelas: row['Kelas']?.toString().trim() || null,
                status: rawStatus as 'LULUS' | 'TIDAK LULUS',
            })
            results.success.push({ row: i + 2, nisn })
        }

        // Only delete and insert if there are valid records
        if (validRecords.length > 0) {
            await supabaseAdmin
                .from('graduation_records')
                .delete()
                .gte('created_at', '1970-01-01T00:00:00Z')

            const { error } = await supabaseAdmin
                .from('graduation_records')
                .insert(validRecords)

            if (error) throw error
        }

        return NextResponse.json({
            message: 'Import completed',
            total: jsonData.length,
            success: results.success.length,
            failed: results.failed.length,
            details: results
        })
    } catch (error: any) {
        console.error('Kelulusan import error:', error)
        return NextResponse.json({ error: error.message || 'Gagal import file' }, { status: 500 })
    }
}
