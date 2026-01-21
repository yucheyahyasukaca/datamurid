export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { action } = body

        if (!['publish_all', 'unpublish_all'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        const isPublished = action === 'publish_all'

        // Update all records
        const { error } = await supabaseAdmin
            .from('pdss_grades')
            .update({ is_published: isPublished })
            // We need a WHERE clause for update without ID, usually 'id' is distinct.
            // Supabase requires at least one filter for update usually, unless we want to update ALL rows.
            // .neq('id', '00000000-0000-0000-0000-000000000000') is a hack to select all if needed, 
            // but let's check if we can just update all.
            .neq('id', '00000000-0000-0000-0000-000000000000')

        if (error) throw error

        return NextResponse.json({
            message: `Berhasil ${isPublished ? 'menampilkan' : 'menyembunyikan'} semua data nilai PDSS.`
        })

    } catch (error: any) {
        console.error('Bulk Publish Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
