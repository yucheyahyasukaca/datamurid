import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
    try {
        const { nisn, reason } = await req.json()

        if (!nisn) {
            return NextResponse.json({ error: 'NISN is required' }, { status: 400 })
        }

        // 1. Get Student ID
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .select('*')
            .eq('nisn', nisn)
            .single()

        if (studentError || !student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        // 2. Check for active requests
        const { data: existing, error: existingError } = await supabaseAdmin
            .from('student_change_requests')
            .select('id, status')
            .eq('student_id', student.id)
            .in('status', ['REQUESTED', 'EDITING', 'REVIEW'])
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Anda masih memiliki permintaan perubahan yang belum selesai.' }, { status: 400 })
        }

        // 3. Create Request
        const { data: newRequest, error: insertError } = await supabaseAdmin
            .from('student_change_requests')
            .insert({
                student_id: student.id,
                status: 'REQUESTED',
                request_reason: reason,
                original_data: student // Snapshot current data
            })
            .select()
            .single()

        if (insertError) throw insertError

        return NextResponse.json({ success: true, data: newRequest })

    } catch (error: any) {
        console.error('Create Request Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
