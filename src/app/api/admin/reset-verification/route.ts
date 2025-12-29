import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export const runtime = 'edge'

export async function POST(request: Request) {
    try {
        // 1. Check Admin Session (Secure JWT)
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        const payload = token ? await verifyToken(token) : null

        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Use payload email for logging
        const adminEmail = payload.email || 'admin@sman1pati.sch.id'

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
                admin_email: adminEmail,
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
