import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const nisn = searchParams.get('nisn')

    if (!nisn) {
        return NextResponse.json({ error: 'NISN is required' }, { status: 400 })
    }

    try {
        // 1. Get Student ID
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .select('id')
            .eq('nisn', nisn)
            .single()

        if (studentError || !student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        // 2. Get Latest Request
        const { data: request, error: requestError } = await supabaseAdmin
            .from('student_change_requests')
            .select('*')
            .eq('student_id', student.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (requestError && requestError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            throw requestError
        }

        return NextResponse.json({ data: request || null })

    } catch (error: any) {
        console.error('Check Status Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
