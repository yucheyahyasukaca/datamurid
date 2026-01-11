
export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        // 1. Verify Auth
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const url = new URL(request.url)
        const rombel = url.searchParams.get('rombel') || ''

        // 2. Build Queries
        let totalQuery = supabaseAdmin.from('students').select('*', { count: 'exact', head: true })
        let verifiedQuery = supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).eq('is_verified', true)
        let pendingQuery = supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).eq('is_verified', false)

        if (rombel) {
            totalQuery = totalQuery.eq('rombel', rombel)
            verifiedQuery = verifiedQuery.eq('rombel', rombel)
            pendingQuery = pendingQuery.eq('rombel', rombel)
        }

        // 3. Execute Parallel
        const [totalRes, verifiedRes, pendingRes] = await Promise.all([
            totalQuery,
            verifiedQuery,
            pendingQuery
        ])

        return NextResponse.json({
            total: totalRes.count || 0,
            verified: verifiedRes.count || 0,
            pending: pendingRes.count || 0
        })

    } catch (error: any) {
        console.error('API Stats Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
