import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const nisn = searchParams.get('nisn')

    if (!nisn) {
        return NextResponse.json({ error: 'NISN is required' }, { status: 400 })
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('students')
            .select('*')
            .eq('nisn', nisn)
            .order('is_verified', { ascending: false })
            .limit(1)
            .single()

        if (error) throw error

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('Error fetching student:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
