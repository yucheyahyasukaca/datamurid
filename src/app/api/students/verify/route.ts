import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export async function POST(req: NextRequest) {
    try {
        // Basic Session Check (Middleware handles redirection, but good to double check)
        const studentSession = req.cookies.get('student_session')
        if (!studentSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { id, nisn } = body

        if (!id && !nisn) {
            return NextResponse.json({ error: 'ID or NISN is required' }, { status: 400 })
        }

        // Prepare update query
        let query = supabaseAdmin
            .from('students')
            .update({
                is_verified: true,
                verified_at: new Date().toISOString()
            })

        // Apply filter based on what's provided, prioritize ID
        if (id) {
            query = query.eq('id', id)
        } else {
            query = query.eq('nisn', nisn)
        }

        const { error } = await query

        if (error) throw error

        return NextResponse.json({ success: true, message: 'Data successfully verified' })

    } catch (error: any) {
        console.error('Verification Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
