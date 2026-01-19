import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function POST(request: Request) {
    try {
        // Verify admin token from cookie
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get form data
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Read file as buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Parse Excel file
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (!jsonData || jsonData.length === 0) {
            return NextResponse.json({ error: 'File Excel kosong atau format tidak sesuai' }, { status: 400 })
        }

        // Fetch all students to map NISN to student_id
        const { data: students, error: studentsError } = await supabaseAdmin
            .from('students')
            .select('id, nisn')

        if (studentsError) throw studentsError

        const nisnToIdMap = new Map(students?.map(s => [s.nisn, s.id]) || [])

        const results = {
            success: [] as any[],
            failed: [] as any[]
        }

        // Process each row
        for (let i = 0; i < jsonData.length; i++) {
            const row: any = jsonData[i]

            try {
                // Map column names (adjust based on actual Excel column names)
                const nisn = row['NISN']?.toString()

                if (!nisn) {
                    results.failed.push({
                        row: i + 2, // +2 because Excel is 1-indexed and has header
                        reason: 'NISN tidak ditemukan di Excel',
                        data: row
                    })
                    continue
                }

                const studentId = nisnToIdMap.get(nisn)

                if (!studentId) {
                    results.failed.push({
                        row: i + 2,
                        nisn,
                        reason: 'NISN tidak terdaftar di database',
                        data: row
                    })
                    continue
                }

                // Prepare data for insert
                // Column mapping based on Excel structure provided by user
                const tkaData = {
                    student_id: studentId,

                    // Bahasa Indonesia (PERTAMA)
                    bahasa_indonesia_nilai: row['Bahasa Indonesia'] ? parseFloat(row['Bahasa Indonesia']) : null,
                    bahasa_indonesia_kategori: row['Bahasa Indonesia Kategori'] || null,

                    // Matematika (KEDUA)
                    matematika_nilai: row['Matematika'] ? parseFloat(row['Matematika']) : null,
                    matematika_kategori: row['Matematika Kategori'] || null,

                    // Bahasa Inggris (KETIGA)
                    bahasa_inggris_nilai: row['Bahasa Inggris'] ? parseFloat(row['Bahasa Inggris']) : null,
                    bahasa_inggris_kategori: row['Bahasa Inggris Kategori'] || null,

                    // Total Wajib
                    total_wajib: row['Total Wajib'] ? parseFloat(row['Total Wajib']) : null,

                    // Mata Pelajaran Pilihan 1
                    mapel_pilihan_1: row['Mata Pelajaran Pilihan 1'] || null,
                    mapel_pilihan_1_nilai: row['Pilihan 1 Nilai'] ? parseFloat(row['Pilihan 1 Nilai']) : null,
                    mapel_pilihan_1_kategori: row['Pilihan 1 Kategori'] || null,

                    // Mata Pelajaran Pilihan 2
                    mapel_pilihan_2: row['Mata Pelajaran Pilihan 2'] || null,
                    mapel_pilihan_2_nilai: row['Pilihan 2 Nilai'] ? parseFloat(row['Pilihan 2 Nilai']) : null,
                    mapel_pilihan_2_kategori: row['Pilihan 2 Kategori'] || null,

                    // Total
                    total_nilai: row['Total'] ? parseFloat(row['Total']) : null,

                    // Additional info
                    tahun_ajaran: row['Tahun Ajaran'] || '2024/2025',
                    semester: row['Semester'] || null,
                    keterangan: row['Keterangan'] || null,

                    created_by: payload.userId
                }

                // Check if record already exists for this student
                const { data: existing } = await supabaseAdmin
                    .from('tka_grades')
                    .select('id')
                    .eq('student_id', studentId)
                    .maybeSingle()

                let result
                if (existing) {
                    // Update existing record
                    result = await supabaseAdmin
                        .from('tka_grades')
                        .update(tkaData)
                        .eq('id', existing.id)
                        .select()
                        .single()
                } else {
                    // Insert new record
                    result = await supabaseAdmin
                        .from('tka_grades')
                        .insert(tkaData)
                        .select()
                        .single()
                }

                if (result.error) throw result.error

                results.success.push({
                    row: i + 2,
                    nisn,
                    action: existing ? 'updated' : 'created'
                })

            } catch (error: any) {
                results.failed.push({
                    row: i + 2,
                    nisn: row['NISN'],
                    reason: error.message,
                    data: row
                })
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
        console.error('Import error:', error)
        return NextResponse.json({
            error: error.message || 'Failed to import Excel file'
        }, { status: 500 })
    }
}
