export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

// GET: Fetch student's own grades
export async function GET(request: Request) {
    try {
        // 1. Get NISN from query params
        const url = new URL(request.url)
        const nisn = url.searchParams.get('nisn')

        if (!nisn) {
            return NextResponse.json({ error: 'NISN is required' }, { status: 400 })
        }

        // 2. Get student by NISN
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .select('id')
            .eq('nisn', nisn)
            .single()

        if (studentError || !student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        // 3. Fetch grades for this student
        const { data: grades, error: gradesError } = await supabaseAdmin
            .from('academic_test_grades')
            .select('*')
            .eq('student_id', student.id)
            .order('created_at', { ascending: false })

        if (gradesError) throw gradesError

        // 4. Calculate statistics
        const scores = grades?.map(g => g.score).filter(s => s !== null) || []
        const stats = {
            total_tests: grades?.length || 0,
            average_score: scores.length > 0
                ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
                : '0',
            highest_score: scores.length > 0 ? Math.max(...scores).toFixed(2) : '0',
            lowest_score: scores.length > 0 ? Math.min(...scores).toFixed(2) : '0'
        }

        return NextResponse.json({
            data: grades || [],
            stats
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
