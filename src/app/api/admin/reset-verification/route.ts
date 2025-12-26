// Force rebuild: Fix module not found error
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export async function POST(request: Request) {
    try {
        // 1. Check Authorization Header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')

        // 2. Verify User using Supabase (Auth)
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 })
        }

        // 3. Verify Admin Role
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
        }

        // 4. Get Request Body
        const { studentId } = await request.json()
        if (!studentId) {
            return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
        }

        // 5. Get student details for logging
        const { data: student, error: fetchError } = await supabaseAdmin
            .from('students')
            .select('nama')
            .eq('id', studentId)
            .single()

        if (fetchError || !student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        // 6. Update Student Status
        const { error: updateError } = await supabaseAdmin
            .from('students')
            .update({
                is_verified: false,
                verified_at: null
            })
            .eq('id', studentId)

        if (updateError) throw updateError

        // 7. Log the action
        await supabaseAdmin
            .from('student_logs')
            .insert({
                admin_email: user.email,
                student_name: student.nama,
                student_id: studentId,
                action: 'RESET_VERIFICATION',
                changes: {
                    details: 'Admin reset verification status'
                }
            })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Reset verification error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
