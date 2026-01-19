export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

// GET: Fetch student's own TKA grade
export async function GET(request: Request) {
    try {
        // Get NISN from query params
        const url = new URL(request.url)
        const nisn = url.searchParams.get('nisn')

        if (!nisn) {
            return NextResponse.json({ error: 'NISN is required' }, { status: 400 })
        }

        // Get student by NISN
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .select('id, nama, nisn, rombel')
            .eq('nisn', nisn)
            .single()

        if (studentError || !student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        // Fetch TKA grade for this student
        const { data: tkaGrade, error: gradeError } = await supabaseAdmin
            .from('tka_grades')
            .select('*')
            .eq('student_id', student.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (gradeError) throw gradeError

        // If no grade found, return empty
        if (!tkaGrade) {
            return NextResponse.json({
                student,
                grade: null,
                has_data: false
            })
        }

        // Calculate stats
        const scores = [
            tkaGrade.matematika_nilai,
            tkaGrade.bahasa_indonesia_nilai,
            tkaGrade.bahasa_inggris_nilai,
            tkaGrade.mapel_pilihan_1_nilai,
            tkaGrade.mapel_pilihan_2_nilai
        ].filter(s => s !== null)

        const stats = {
            total_subjects: scores.length,
            average_score: scores.length > 0
                ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
                : '0',
            highest_score: scores.length > 0 ? Math.max(...scores).toFixed(2) : '0',
            lowest_score: scores.length > 0 ? Math.min(...scores).toFixed(2) : '0'
        }

        return NextResponse.json({
            student,
            grade: tkaGrade,
            stats,
            has_data: true
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
