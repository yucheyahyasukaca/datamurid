import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    try {
        // Query param checks can be added for filtering
        const { data, error } = await supabaseAdmin
            .from('student_change_requests')
            .select(`
                *,
                students (
                    nama,
                    rombel,
                    nisn
                )
            `)
            .order('updated_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('List Requests Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
