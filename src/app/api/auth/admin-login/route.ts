export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase' // Use client/public supabase for login to check credentials
import { signToken } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email dan Password harus diisi' }, { status: 400 })
        }

        // 1. Verify Credentials with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (authError || !authData.user) {
            return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
        }

        // 2. Create Session Token
        const token = await signToken({
            sub: authData.user.id,
            email: authData.user.email,
            role: 'admin',
            user_metadata: authData.user.user_metadata
        })

        // 3. Create Response with HttpOnly Cookie
        const response = NextResponse.json({
            success: true,
            user: { email: authData.user.email }
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
        console.error('Admin Login Error:', error)
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
    }
}
