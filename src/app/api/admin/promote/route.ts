
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { supabase } from '@/utils/supabase'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json() // acts as identifier (email or uuid)

        if (!email) {
            return NextResponse.json({ error: 'Identifier required' }, { status: 400 })
        }

        let userId = ''
        // improved check for UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(email)

        if (isUUID) {
            userId = email
        } else {
            // Search by email with pagination support (up to 1000)
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
            if (error) throw error

            const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

            if (!user) {
                // Return 404 is old behavior. Now we create the user!
                console.log(`User ${email} not found. Creating new user...`)
                const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: email,
                    password: '@sudirman24',
                    email_confirm: true
                })

                if (createError) {
                    throw new Error(`Failed to create user: ${createError.message}`)
                }

                userId = newUser.user.id
                // return NextResponse.json({ error: `User not found for email: ${email}. Please enter the "User UID" from your Supabase dashboard instead.` }, { status: 404 })
            } else {
                userId = user.id
            }
        }

        // UPSERT into profiles to ensure row exists AND is admin
        // This fixes cases where the profile row was never created by triggers
        const { error: upsertError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                role: 'admin',
                // We don't overwrite email if it's already there, but we provide it for new rows if we have it
                ...(isUUID ? {} : { email: email })
            }, { onConflict: 'id' })
            .select()

        if (upsertError) throw upsertError

        return NextResponse.json({
            message: `Success! User ${email || userId} is now an Admin.`,
            note: 'If this was a new user, the default password is: @sudirman24'
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
