export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { genSalt, hash } from 'bcrypt-ts'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        // 1. Check Admin Session
        const cookieStore = await cookies()
        const adminSession = cookieStore.get('admin_session')

        if (!adminSession || adminSession.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { studentId, newPassword } = await request.json()

        if (!studentId || !newPassword) {
            return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
        }

        // 2. Hash new password
        const salt = await genSalt(10)
        const hashedPassword = await hash(newPassword, salt)

        // 3. Update student
        const { error: updateError } = await supabaseAdmin
            .from('students')
            .update({ password: hashedPassword })
            .eq('id', studentId)

        if (updateError) throw updateError

        return NextResponse.json({ success: true, message: 'Password berhasil direset' })

    } catch (error: any) {
        console.error('Reset Password Error:', error)
        return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 })
    }
}
