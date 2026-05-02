// src/app/api/students/grades/kelulusan/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export const runtime = 'edge'

export async function GET(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const raw = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))
        const token = raw ? raw.trim().slice('auth_token='.length) : undefined
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'student') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const nisn = payload.nisn
        if (typeof nisn !== 'string' || !nisn) {
            return NextResponse.json({ error: 'Invalid token: nisn missing' }, { status: 401 })
        }

        // Ambil waktu rilis
        const { data: setting } = await supabaseAdmin
            .from('app_settings')
            .select('value')
            .eq('key', 'graduation_release_time')
            .maybeSingle()

        const releaseTime = setting?.value || null
        const isReleased = releaseTime ? new Date() >= new Date(releaseTime) : false

        if (!isReleased) {
            return NextResponse.json({ releaseTime, isReleased: false, record: null })
        }

        // Ambil data kelulusan siswa
        const { data: record } = await supabaseAdmin
            .from('graduation_records')
            .select('*')
            .eq('nisn', nisn)
            .maybeSingle()

        return NextResponse.json({ releaseTime, isReleased: true, record: record || null })
    } catch (error: any) {
        console.error('Student kelulusan GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
