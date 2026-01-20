export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export async function GET(request: Request) {
    try {
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

        // Fetch PDSS grade for this student
        const { data: pdssGrade, error: gradeError } = await supabaseAdmin
            .from('pdss_grades')
            .select('*')
            .eq('student_id', student.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (gradeError) throw gradeError

        if (!pdssGrade) {
            return NextResponse.json({
                student,
                grade: null,
                has_data: false
            })
        }

        return NextResponse.json({
            student,
            grade: pdssGrade,
            has_data: true
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
