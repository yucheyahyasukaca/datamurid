// src/app/api/admin/grades/kelulusan/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export const runtime = 'edge'

export async function GET(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const search = url.searchParams.get('search') || ''
        const kelas = url.searchParams.get('kelas') || ''

        let query = supabaseAdmin
            .from('graduation_records')
            .select('*', { count: 'exact' })

        if (search) {
            query = query.or(`nama.ilike.%${search}%,nisn.ilike.%${search}%`)
        }
        if (kelas) {
            query = query.eq('kelas', kelas)
        }

        query = query.order('nama', { ascending: true })

        if (limit !== -1) {
            const from = (page - 1) * limit
            query = query.range(from, from + limit - 1)
        }

        const { data, error, count } = await query
        if (error) throw error

        // Stats global (tanpa filter)
        const { data: allRecords } = await supabaseAdmin
            .from('graduation_records')
            .select('status')

        const totalLulus = allRecords?.filter(r => r.status === 'LULUS').length || 0
        const totalTidakLulus = allRecords?.filter(r => r.status === 'TIDAK LULUS').length || 0

        return NextResponse.json({
            data: data || [],
            total: count || 0,
            stats: { lulus: totalLulus, tidak_lulus: totalTidakLulus }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
