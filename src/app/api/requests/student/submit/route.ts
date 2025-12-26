import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
    try {
        const { requestId, data } = await req.json()

        if (!requestId || !data) {
            return NextResponse.json({ error: 'Request ID and Data are required' }, { status: 400 })
        }

        // 1. Verify Request exists and is in EDITING state
        const { data: request, error: requestError } = await supabaseAdmin
            .from('student_change_requests')
            .select('status')
            .eq('id', requestId)
            .single()

        if (requestError || !request) {
            return NextResponse.json({ error: 'Request check failed' }, { status: 404 })
        }

        if (request.status !== 'EDITING' && request.status !== 'REQUESTED') {
            // Allow REQUESTED too just in case admin forgot to click "Approve Edit" but we allow strict flow?
            // Requirement says: "admin setujui maka siswa muncul tombol edit". So admin MUST approve first.
            // So status MUST be EDITING.
            if (request.status !== 'EDITING') {
                return NextResponse.json({ error: 'Permintaan tidak dalam status Edit.' }, { status: 400 })
            }
        }

        // 2. Update Request
        const { error: updateError } = await supabaseAdmin
            .from('student_change_requests')
            .update({
                status: 'REVIEW',
                proposed_changes: data,
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId)

        if (updateError) throw updateError

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Submit Changes Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
