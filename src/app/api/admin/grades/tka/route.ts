export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

// GET: Fetch all TKA grades (admin only)
export async function GET(request: Request) {
    try {
        // Verify admin token from cookie
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get query params
        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const search = url.searchParams.get('search') || ''
        const kelas = url.searchParams.get('kelas') || ''

        const offset = (page - 1) * limit

        // Build query
        let query = supabaseAdmin
            .from('tka_grades')
            .select(`
                *,
                students!inner(id, nama, nisn, rombel)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })

        // Apply filters
        if (search) {
            query = query.or(`students.nama.ilike.%${search}%,students.nisn.ilike.%${search}%`)
        }
        if (kelas) {
            query = query.eq('students.rombel', kelas)
        }

        // Pagination
        query = query.range(offset, offset + limit - 1)

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

// POST: Create new TKA grade (admin only)
export async function POST(request: Request) {
    try {
        // Verify admin token from cookie
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
        const {
            student_id,
            bahasa_indonesia_nilai,
            bahasa_indonesia_kategori,
            matematika_nilai,
            matematika_kategori,
            bahasa_inggris_nilai,
            bahasa_inggris_kategori,
            total_wajib,
            mapel_pilihan_1,
            mapel_pilihan_1_nilai,
            mapel_pilihan_1_kategori,
            mapel_pilihan_2,
            mapel_pilihan_2_nilai,
            mapel_pilihan_2_kategori,
            total_nilai,
            tahun_ajaran,
            semester,
            keterangan
        } = body

        // Validation
        if (!student_id) {
            return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
        }

        // Insert data
        const { data, error } = await supabaseAdmin
            .from('tka_grades')
            .insert({
                student_id,
                bahasa_indonesia_nilai: bahasa_indonesia_nilai ? parseFloat(bahasa_indonesia_nilai) : null,
                bahasa_indonesia_kategori,
                matematika_nilai: matematika_nilai ? parseFloat(matematika_nilai) : null,
                matematika_kategori,
                bahasa_inggris_nilai: bahasa_inggris_nilai ? parseFloat(bahasa_inggris_nilai) : null,
                bahasa_inggris_kategori,
                total_wajib: total_wajib ? parseFloat(total_wajib) : null,
                mapel_pilihan_1,
                mapel_pilihan_1_nilai: mapel_pilihan_1_nilai ? parseFloat(mapel_pilihan_1_nilai) : null,
                mapel_pilihan_1_kategori,
                mapel_pilihan_2,
                mapel_pilihan_2_nilai: mapel_pilihan_2_nilai ? parseFloat(mapel_pilihan_2_nilai) : null,
                mapel_pilihan_2_kategori,
                total_nilai: total_nilai ? parseFloat(total_nilai) : null,
                tahun_ajaran,
                semester,
                keterangan,
                created_by: payload.userId
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data, message: 'TKA grade created successfully' })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT: Update TKA grade (admin only)
export async function PUT(request: Request) {
    try {
        // Verify admin token from cookie
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
        const { id, ...updateFields } = body

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        // Parse numeric fields
        if (updateFields.bahasa_indonesia_nilai) updateFields.bahasa_indonesia_nilai = parseFloat(updateFields.bahasa_indonesia_nilai)
        if (updateFields.matematika_nilai) updateFields.matematika_nilai = parseFloat(updateFields.matematika_nilai)
        if (updateFields.bahasa_inggris_nilai) updateFields.bahasa_inggris_nilai = parseFloat(updateFields.bahasa_inggris_nilai)
        if (updateFields.total_wajib) updateFields.total_wajib = parseFloat(updateFields.total_wajib)
        if (updateFields.mapel_pilihan_1_nilai) updateFields.mapel_pilihan_1_nilai = parseFloat(updateFields.mapel_pilihan_1_nilai)
        if (updateFields.mapel_pilihan_2_nilai) updateFields.mapel_pilihan_2_nilai = parseFloat(updateFields.mapel_pilihan_2_nilai)
        if (updateFields.total_nilai) updateFields.total_nilai = parseFloat(updateFields.total_nilai)

        const { data, error } = await supabaseAdmin
            .from('tka_grades')
            .update(updateFields)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data, message: 'TKA grade updated successfully' })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE: Remove TKA grade (admin only)
export async function DELETE(request: Request) {
    try {
        // Verify admin token from cookie
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
            .from('tka_grades')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ message: 'TKA grade deleted successfully' })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
