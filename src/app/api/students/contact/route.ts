import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export async function POST(req: NextRequest) {
    try {
        // Basic Session Check
        const studentSession = req.cookies.get('student_session')
        if (!studentSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { nisn, no_hp, email, no_hp_ortu } = body

        if (!nisn) {
            return NextResponse.json({ error: 'NISN is required' }, { status: 400 })
        }

        // Use supabaseAdmin to bypass RLS and update contact info
        const { error } = await supabaseAdmin
            .from('students')
            .update({
                no_hp: no_hp || null,
                email: email || null,
                no_hp_ortu: no_hp_ortu || null
            })
            .eq('nisn', nisn)

        if (error) throw error

        return NextResponse.json({ success: true, message: 'Contact information updated successfully' })

    } catch (error: any) {
        console.error('Contact Update Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
