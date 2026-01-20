export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function POST(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Fetch all students map
        const { data: students, error: studentsError } = await supabaseAdmin
            .from('students')
            .select('id, nisn, nama')

        if (studentsError) throw studentsError

        const nisnToIdMap = new Map(students?.map(s => [s.nisn, s.id]) || [])
        // Optional: helper to find by name loosely if strict nisn fails? 
        const nameToIdMap = new Map(students?.map(s => [s.nama.toLowerCase(), s.id]) || [])

        let successCount = 0
        let failedCount = 0
        const errors: any[] = []

        for (let i = 0; i < jsonData.length; i++) {
            const row: any = jsonData[i]
            try {
                let studentId = null

                if (row['NISN']) {
                    studentId = nisnToIdMap.get(row['NISN'].toString())
                }

                if (!studentId && row['Nama']) {
                    studentId = nameToIdMap.get(row['Nama'].toLowerCase())
                }

                if (!studentId) {
                    throw new Error(`Siswa tidak ditemukan: ${row['Nama'] || row['NISN']}`)
                }

                const payloadData = {
                    student_id: studentId,
                    total_semua_mapel: row['Jumlah Nilai Semua Mapel (SMT 1 - 5)'] || null,
                    total_3_mapel_utama: row['Jumlah 3 Mapel Utama (B.Indo, Mat Umum, B.Ing)'] || null,
                    total_mapel_pilihan: row['Jumlah Mapel Pilihan (SMT 3-5)'] || null,
                    peringkat: row['Peringkat di PDSS'] || null,

                    tahun_ajaran: row['Tahun Ajaran'] || '2024/2025',
                    semester: row['Semester'] || null,
                    keterangan: row['Keterangan'] || null,
                    created_by: payload.userId
                }

                // Check existing
                const { data: existing } = await supabaseAdmin
                    .from('pdss_grades')
                    .select('id')
                    .eq('student_id', studentId)
                    .eq('tahun_ajaran', payloadData.tahun_ajaran)
                    .maybeSingle()

                if (existing) {
                    await supabaseAdmin
                        .from('pdss_grades')
                        .update(payloadData)
                        .eq('id', existing.id)
                } else {
                    await supabaseAdmin
                        .from('pdss_grades')
                        .insert(payloadData)
                }

                successCount++
            } catch (err: any) {
                failedCount++
                errors.push({ row: i + 2, name: row['Nama'], error: err.message })
            }
        }

        return NextResponse.json({
            success: successCount,
            failed: failedCount,
            errors,
            message: `Import processed. Success: ${successCount}, Failed: ${failedCount}`
        })

    } catch (error: any) {
        console.error('Import error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
