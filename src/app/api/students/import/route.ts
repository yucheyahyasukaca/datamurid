import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export async function POST(req: NextRequest) {
    try {
        const { students } = await req.json()

        if (!students || !Array.isArray(students)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        }

        for (const student of students) {
            try {
                // 1. Prepare Auth Credentials
                // Format: [nisn]@student.sman1pati.sch.id
                if (!student.nisn || !student.tanggal_lahir) {
                    throw new Error(`Data tidak lengkap for ${student.nama || 'Unknown'}`)
                }

                const email = `${student.nisn}@student.sman1pati.sch.id`

                // Format Password: DDMMYYYY from YYYY-MM-DD
                // Input date is likely "YYYY-MM-DD" or raw string. Let's parse carefully.
                // Assuming standard "YYYY-MM-DD" from the frontend processing
                const dateParts = student.tanggal_lahir.split('-')
                if (dateParts.length !== 3) throw new Error(`Format tanggal lahir salah: ${student.tanggal_lahir}`)

                const password = `${dateParts[2]}${dateParts[1]}${dateParts[0]}` // DDMMYYYY

                // 2. Create Auth User
                // Check if user exists first to avoid error, or just try create
                // createUser returns error if email exists.

                let userId = null

                // Try to get existing user by email
                const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
                // NOTE: listUsers is paginated, not efficient for large check, but for bulk sync it's okay for now or we catch error.
                // Better: try create, if fail (email conflict), get user.

                const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email: email,
                    password: password,
                    email_confirm: true,
                    user_metadata: { role: 'student', nama: student.nama }
                })

                if (authError) {
                    // If user already exists, we might want to update or just skip auth creation
                    if (authError.message.includes('already been registered')) {
                        // Ideally fetching the user ID here strictly would be good, 
                        // but let's assume we proceed to update/insert public record.
                        console.warn(`User ${email} already exists. Skipping Auth creation.`)
                    } else {
                        throw authError
                    }
                } else {
                    userId = authData.user.id
                }

                // 3. Insert/Upsert into public.students
                // If we have userId, we can link it if schema supports (e.g. user_id column).
                // Our schema `students` table might not have `user_id` enforced or present yet based on setup.sql default?
                // The user prompt implied inserting to "tabel siswa".

                const { error: dbError } = await supabaseAdmin
                    .from('students')
                    .upsert({
                        ...student,
                        // If you added a user_id column, add it here: user_id: userId
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'nisn' })

                if (dbError) throw dbError

                results.success++

            } catch (err: any) {
                console.error(`Error processing ${student.nama}:`, err)
                results.failed++
                results.errors.push(`${student.nama}: ${err.message}`)
            }
        }

        return NextResponse.json({
            message: `Processed ${students.length} students.`,
            stats: results
        })

    } catch (error: any) {
        console.error('Bulk import error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
