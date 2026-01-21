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
        // Optional: helper to find by name loosely if strict nisn fails
        const nameToIdMap = new Map(students?.map(s => [s.nama.toLowerCase(), s.id]) || [])

        let successCount = 0
        let insertedCount = 0
        let updatedCount = 0
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

                // Map excel status to valid ENUM
                let status = 'Eligible'
                const rawStatus = row['Status'] ? row['Status'].toString().toLowerCase() : ''
                if (rawStatus.includes('tidak')) status = 'Tidak Eligible'
                else if (rawStatus.includes('mengundurkan')) status = 'Mengundurkan Diri'
                else if (rawStatus.includes('eligible')) status = 'Eligible'

                // Helper to safely parse numbers, treating '-' as null
                const safeParseNumber = (val: any) => {
                    if (val === null || val === undefined) return null;
                    if (typeof val === 'string') {
                        const clean = val.trim();
                        if (clean === '-' || clean === '') return null;
                        const num = parseFloat(clean.replace(',', '.')); // Handle comma decimals if any
                        return isNaN(num) ? null : num;
                    }
                    return typeof val === 'number' ? val : null;
                }

                const payloadData = {
                    student_id: studentId,
                    total_semua_mapel: safeParseNumber(row['Jumlah Nilai Semua Mapel (SMT 1 - 5)'] || row['Jumlah Nilai Semua Mapel (SMT 1-5)']),
                    total_3_mapel_utama: safeParseNumber(row['Jumlah 3 Mapel Utama (B.Indo, Mat Umum, B.Ing)']),
                    total_mapel_pilihan: safeParseNumber(row['Jumlah Mapel Pilihan (SMT 3-5)']),
                    peringkat: safeParseNumber(row['Peringkat di PDSS']),
                    status: status,
                    is_published: false, // Default to hidden on import

                    tahun_ajaran: row['Tahun Ajaran'] || '2024/2025',
                    semester: '1-5',
                    keterangan: row['Keterangan (Pesan/Petunjuk)'] || row['Keterangan'] || null,
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
                    updatedCount++
                } else {
                    await supabaseAdmin
                        .from('pdss_grades')
                        .insert(payloadData)
                    insertedCount++
                }

                successCount++
            } catch (err: any) {
                failedCount++
                errors.push({ row: i + 2, name: row['Nama'], error: err.message })
            }
        }

        return NextResponse.json({
            success: successCount,
            inserted: insertedCount,
            updated: updatedCount,
            failed: failedCount,
            errors,
            message: `Import processed. Created: ${insertedCount}, Updated: ${updatedCount}, Failed: ${failedCount}`
        })

    } catch (error: any) {
        console.error('Import error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
