export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

// GET: Fetch all grades with filters (admin only)
export async function GET(request: Request) {
    try {
        // 1. Verify Auth
        const url = new URL(request.url)
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Parse Params
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const search = url.searchParams.get('search') || ''
        const testName = url.searchParams.get('test_name') || ''
        const subject = url.searchParams.get('subject') || ''
        const semester = url.searchParams.get('semester') || ''
        const schoolYear = url.searchParams.get('school_year') || ''

        // 3. Build Query with JOIN to students table
        let query = supabaseAdmin
            .from('academic_test_grades')
            .select(`
                *,
                students!inner(id, nama, nisn, rombel)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })

        // Search by student name or NISN
        if (search) {
            query = query.or(`students.nama.ilike.%${search}%,students.nisn.ilike.%${search}%`)
        }

        // Filters
        if (testName) {
            query = query.eq('test_name', testName)
        }
        if (subject) {
            query = query.eq('subject', subject)
        }
        if (semester) {
            query = query.eq('semester', semester)
        }
        if (schoolYear) {
            query = query.eq('school_year', schoolYear)
        }

        // 4. Pagination
        const from = (page - 1) * limit
        const to = from + limit - 1

        if (limit > 0) {
            query = query.range(from, to)
        }

        const { data, error, count } = await query

        if (error) throw error

        return NextResponse.json({
            data: data || [],
            total: count || 0
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST: Create new grade (admin only)
export async function POST(request: Request) {
    try {
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

        // 2. Parse Body
        const body = await request.json()
        const { student_id, test_name, subject, score, grade, test_date, semester, school_year, notes } = body

        // 3. Validation
        if (!student_id || !test_name || !subject) {
            return NextResponse.json({ error: 'Missing required fields: student_id, test_name, subject' }, { status: 400 })
        }

        // 4. Insert
        const { data, error } = await supabaseAdmin
            .from('academic_test_grades')
            .insert({
                student_id,
                test_name,
                subject,
                score: score ? parseFloat(score) : null,
                grade,
                test_date,
                semester,
                school_year,
                notes,
                created_by: payload.userId
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data }, { status: 201 })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT: Update existing grade (admin only)
export async function PUT(request: Request) {
    try {
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

        // 2. Parse Body
        const body = await request.json()
        const { id, student_id, test_name, subject, score, grade, test_date, semester, school_year, notes } = body

        // 3. Validation
        if (!id) {
            return NextResponse.json({ error: 'Missing grade ID' }, { status: 400 })
        }

        // 4. Update
        const { data, error } = await supabaseAdmin
            .from('academic_test_grades')
            .update({
                student_id,
                test_name,
                subject,
                score: score ? parseFloat(score) : null,
                grade,
                test_date,
                semester,
                school_year,
                notes
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE: Remove grade (admin only)
export async function DELETE(request: Request) {
    try {
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

        // 2. Parse Body
        const body = await request.json()
        const { id } = body

        // 3. Validation
        if (!id) {
            return NextResponse.json({ error: 'Missing grade ID' }, { status: 400 })
        }

        // 4. Delete
        const { error } = await supabaseAdmin
            .from('academic_test_grades')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
