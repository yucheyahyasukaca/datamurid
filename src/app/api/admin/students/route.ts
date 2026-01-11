
export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        // 1. Verify Auth
        const url = new URL(request.url)
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Parse Params
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const search = url.searchParams.get('search') || ''
        const rombel = url.searchParams.get('rombel') || ''

        // 3. Build Query
        let query = supabaseAdmin
            .from('students')
            .select('*', { count: 'exact' })
            .order('nama', { ascending: true })

        if (search) {
            query = query.or(`nama.ilike.%${search}%,nisn.ilike.%${search}%,nipd.ilike.%${search}%`)
        }

        if (rombel) {
            query = query.eq('rombel', rombel)
        }

        // 4. Pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        if (limit > 0) {
            query = query.range(from, to)
        }

        const { data, error, count } = await query

        if (error) throw error

        return NextResponse.json({
            data: data || [],
            total: count || 0
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
