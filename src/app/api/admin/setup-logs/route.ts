import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST() {
    try {
        // Attempt to select from the table to check if it exists
        const { error } = await supabaseAdmin
            .from('student_logs')
            .select('id')
            .limit(1)

        if (error) {
            // If the error code indicates relation does not exist (42P01 in Postgres, but Supabase might wrap it)
            if (error.code === '42P01' || error.message.includes('relation "student_logs" does not exist')) {
                return NextResponse.json({
                    success: false,
                    error: 'Table "student_logs" does not exist. Please run the SQL migration.'
                })
            }
            throw error
        }

        return NextResponse.json({ success: true, message: 'Table exists and is accessible.' })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
