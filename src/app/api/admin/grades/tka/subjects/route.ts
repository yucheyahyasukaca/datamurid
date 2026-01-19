export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { data, error } = await supabaseAdmin
            .from('tka_grades')
            .select('mapel_pilihan_1, mapel_pilihan_2')

        if (error) throw error

        const subjects = new Set<string>()
        // Add mandatory subjects
        subjects.add('Matematika')
        subjects.add('Bahasa Indonesia')
        subjects.add('Bahasa Inggris')

        data?.forEach((row: any) => {
            if (row.mapel_pilihan_1) subjects.add(row.mapel_pilihan_1)
            if (row.mapel_pilihan_2) subjects.add(row.mapel_pilihan_2)
        })

        return NextResponse.json({ data: Array.from(subjects).sort() })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
