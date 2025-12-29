
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export const runtime = 'edge'

import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        // Auth Check
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        const payload = token ? await verifyToken(token) : null

        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        // Fetch users with role 'admin' from profiles table
        const { data: profiles, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('role', 'admin')

        if (error) throw error

        // If we want more details (like email from auth.users), we might need to fetch them
        // However, the promote route ensures email is in profiles for non-UUID users.
        // For UUID users (likely from auth), we might need to fetch auth users if email is missing in profiles.

        // Let's try to fetch auth users for the IDs we found to be sure, or just return profiles.
        // Since we can't join auth.users directly with supabase-js easily in one query without RPC,
        // and loop might be slow, let's just return profiles for now. 
        // If email is missing in profile, we might show "Hidden/UUID" or try to fetch it client side?
        // Actually, let's just use `listUsers` and filter? No that's inefficient if many users.

        // Better: For the found profiles, fetch their emails via admin.listUsers if needed?
        // Or just rely on what's in profiles. The promote script adds email to profiles if not UUID.
        // If it IS UUID, it might not add email.

        return NextResponse.json({ admins: profiles })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
