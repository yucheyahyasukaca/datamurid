export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { compare } from 'bcrypt-ts'
import { signToken } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const { nisn, password } = await request.json()

        if (!nisn || !password) {
            return NextResponse.json({ error: 'NISN dan Password harus diisi' }, { status: 400 })
        }

        const cleanNisn = nisn.replace(/\D/g, '')

        // 1. Fetch student including password hash
        const { data: student, error: fetchError } = await supabaseAdmin
            .from('students')
            .select('id, nisn, nama, tanggal_lahir, password')
            .eq('nisn', cleanNisn)
            .order('is_verified', { ascending: false })
            .limit(1)
            .single()

        if (fetchError || !student) {
            return NextResponse.json({ error: 'NISN tidak ditemukan' }, { status: 404 })
        }

        // 2. Verify Password
        let isMatch = false

        if (student.password) {
            // Check against hashed password
            isMatch = await compare(password, student.password)
        } else {
            // Check against DOB (Default password logic)
            const cleanInput = password.replace(/\D/g, '')
            const dbDate = student.tanggal_lahir // "YYYY-MM-DD"
            const [yyyy, mm, dd] = dbDate.split('-')

            const format1 = `${dd}${mm}${yyyy}`
            const format2 = `${yyyy}${mm}${dd}`

            if (cleanInput === format1 || cleanInput === format2) {
                isMatch = true
            }
        }

        if (!isMatch) {
            return NextResponse.json({ error: 'Password atau Tanggal Lahir salah' }, { status: 401 })
        }

        // 3. Login Successful
        // 3. Login Successful - Create Session Token
        const token = await signToken({
            sub: student.id,
            nisn: student.nisn,
            role: 'student',
            name: student.nama
        })

        const response = NextResponse.json({
            success: true,
            data: {
                nisn: student.nisn,
                nama: student.nama
            }
        })

        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        })

        return response

    } catch (error: any) {
        console.error('Student Login Error:', error)
        return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 })
    }
}
