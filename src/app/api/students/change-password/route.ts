import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const { nisn, oldPassword, newPassword } = await request.json()

        if (!nisn || !oldPassword || !newPassword) {
            return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
        }

        // 1. Fetch student (including password for verification)
        const { data: student, error: fetchError } = await supabaseAdmin
            .from('students')
            .select('id, nisn, tanggal_lahir, password')
            .eq('nisn', nisn)
            .single()

        if (fetchError || !student) {
            return NextResponse.json({ error: 'Murid tidak ditemukan' }, { status: 404 })
        }

        // 2. Verify old password
        let isMatch = false

        if (student.password) {
            // Check against hashed password
            isMatch = await bcrypt.compare(oldPassword, student.password)
        } else {
            // Check against DOB (Default password)
            const cleanInput = oldPassword.replace(/\D/g, '')
            const [yyyy, mm, dd] = student.tanggal_lahir.split('-')

            // Allow DDMMYYYY or YYYYMMDD
            const format1 = `${dd}${mm}${yyyy}`
            const format2 = `${yyyy}${mm}${dd}`

            if (cleanInput === format1 || cleanInput === format2) {
                isMatch = true
            }
        }

        if (!isMatch) {
            return NextResponse.json({ error: 'Password lama salah' }, { status: 401 })
        }

        // 3. Hash new password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        // 4. Update student
        const { error: updateError } = await supabaseAdmin
            .from('students')
            .update({ password: hashedPassword })
            .eq('id', student.id)

        if (updateError) throw updateError

        return NextResponse.json({ success: true, message: 'Password berhasil diubah' })

    } catch (error: any) {
        console.error('Change Password Error:', error)
        return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 })
    }
}
