export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
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

        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const search = url.searchParams.get('search') || ''
        const kelas = url.searchParams.get('kelas') || ''

        const offset = (page - 1) * limit

        let query = supabaseAdmin
            .from('pdss_grades')
            .select(`
                *,
                students!inner (
                    nama,
                    nisn,
                    rombel
                )
            `, { count: 'exact' })
            .order('created_at', { ascending: false })

        if (search) {
            query = query.or(`nama.ilike.%${search}%,nisn.ilike.%${search}%`, { foreignTable: 'students' })
        }

        if (kelas) {
            query = query.eq('students.rombel', kelas)
        }

        if (limit !== -1) {
            query = query.range(offset, offset + limit - 1)
        }

        const { data, error, count } = await query

        if (error) throw error

        return NextResponse.json({
            data: data || [],
            total: count || 0,
            page,
            limit
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

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
        const cleanBody = Object.fromEntries(
            Object.entries(body).map(([key, value]) => [key, value === '' ? null : value])
        )

        const { data, error } = await supabaseAdmin
            .from('pdss_grades')
            .insert({
                ...cleanBody,
                created_by: payload.userId
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data, message: 'PDSS grade created successfully' })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: Request) {
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
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).map(([key, value]) => [key, value === '' ? null : value])
        )

        const { data, error } = await supabaseAdmin
            .from('pdss_grades')
            .update(cleanUpdates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data, message: 'PDSS grade updated successfully' })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
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
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('pdss_grades')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ message: 'PDSS grade deleted successfully' })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
