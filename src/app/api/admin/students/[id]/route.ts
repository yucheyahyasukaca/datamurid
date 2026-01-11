
export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params

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

        // 2. Fetch Student
        const { data, error } = await supabaseAdmin
            .from('students')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error

        return NextResponse.json(data)

    } catch (error: any) {
        console.error('API Student Detail Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
        const body = await request.json()

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

        // 2. Fetch Original Data for Logging
        const { data: originalData, error: fetchError } = await supabaseAdmin
            .from('students')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        // 3. Update Student
        const { error: updateError } = await supabaseAdmin
            .from('students')
            .update(body)
            .eq('id', id)

        if (updateError) throw updateError

        // 4. Log Changes
        const changes: any = {}
        Object.keys(body).forEach(key => {
            if (originalData[key] !== body[key]) {
                // Skip if both are null/undefined or empty string equivalents if needed
                // For simplicity, strict inequality is fine for now
                changes[key] = {
                    old: originalData[key],
                    new: body[key]
                }
            }
        })

        if (Object.keys(changes).length > 0) {
            await supabaseAdmin.from('student_logs').insert({
                admin_email: payload.email, // Use email from token payload
                student_name: body.nama || originalData.nama,
                student_id: id,
                action: 'UPDATE',
                changes: changes
            })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('API Student Update Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
