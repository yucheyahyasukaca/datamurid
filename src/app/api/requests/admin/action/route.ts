import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
    try {
        const { requestId, action, notes } = await req.json()

        if (!requestId || !action) {
            return NextResponse.json({ error: 'Request ID and Action required' }, { status: 400 })
        }

        // 1. Get Request
        const { data: request, error: fetchError } = await supabaseAdmin
            .from('student_change_requests')
            .select('*')
            .eq('id', requestId)
            .single()

        if (fetchError || !request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        }

        let updateData: any = { updated_at: new Date().toISOString() }

        if (action === 'APPROVE_EDIT') {
            if (request.status !== 'REQUESTED') {
                return NextResponse.json({ error: 'Invalid invalid status for APPROVE_EDIT' }, { status: 400 })
            }
            updateData.status = 'EDITING'
        }
        else if (action === 'REJECT') {
            updateData.status = 'REJECTED'
            updateData.admin_notes = notes
        }
        else if (action === 'VALIDATE') {
            if (request.status !== 'REVIEW') {
                return NextResponse.json({ error: 'Invalid status for VALIDATE' }, { status: 400 })
            }

            // Apply changes to students table
            const { proposed_changes, student_id } = request

            // Clean changes (remove any non-updatable fields if necessary)
            // But we trust proposed_changes structure match
            const { error: applyError } = await supabaseAdmin
                .from('students')
                .update(proposed_changes)
                .eq('id', student_id)

            if (applyError) throw applyError

            updateData.status = 'APPROVED'
        } else {
            return NextResponse.json({ error: 'Unknown Action' }, { status: 400 })
        }

        // 2. Update Request Status
        const { error: updateError } = await supabaseAdmin
            .from('student_change_requests')
            .update(updateData)
            .eq('id', requestId)

        if (updateError) throw updateError

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Admin Action Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
