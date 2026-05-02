// src/app/api/admin/settings/graduation-time/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export const runtime = 'edge'

const SETTING_KEY = 'graduation_release_time'

export async function GET(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const raw = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))
        const token = raw ? raw.trim().slice('auth_token='.length) : undefined
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const { data } = await supabaseAdmin
            .from('app_settings')
            .select('value')
            .eq('key', SETTING_KEY)
            .maybeSingle()

        return NextResponse.json({ releaseTime: data?.value || null })
    } catch (error: any) {
        console.error('Graduation-time GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const raw = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))
        const token = raw ? raw.trim().slice('auth_token='.length) : undefined
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const { releaseTime } = await request.json()
        if (!releaseTime || isNaN(new Date(releaseTime).getTime())) {
            return NextResponse.json({ error: 'releaseTime must be a valid ISO date string' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('app_settings')
            .upsert({ key: SETTING_KEY, value: releaseTime, updated_at: new Date().toISOString() })

        if (error) throw error

        return NextResponse.json({ success: true, releaseTime })
    } catch (error: any) {
        console.error('Graduation-time POST error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
