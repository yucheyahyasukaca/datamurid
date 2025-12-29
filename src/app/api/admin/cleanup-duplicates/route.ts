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
        // 1. Fetch all students
        // Fetch specific fields needed for decision making
        const { data: students, error } = await supabaseAdmin
            .from('students')
            .select('id, nisn, is_verified, created_at')
            .not('nisn', 'is', null) // Filter out null NISNs
            .order('id', { ascending: true })

        if (error) throw error
        if (!students || students.length === 0) {
            return NextResponse.json({ message: 'No students found to process.' })
        }

        const deletedIds: string[] = []
        const logMap = new Map<string, string[]>() // For reporting purposes

        // 2. Group by normalized NISN
        const grouped = new Map<string, any[]>()

        students.forEach(student => {
            if (!student.nisn) return
            const normalize = student.nisn.replace(/\D/g, '') // Remove non-digits
            if (!normalize) return // Skip empty if normalization failed

            // Key is the normalized NISN string (e.g. "8389") to handle "008389" vs "8389"
            // Using BigInt to remove leading zeros safely
            const key = BigInt(normalize).toString()

            if (!grouped.has(key)) {
                grouped.set(key, [])
            }
            grouped.get(key)!.push(student)
        })

        // 3. Process groups to find duplicates
        for (const [nisnKey, group] of grouped.entries()) {
            if (group.length > 1) {
                // Sort to find the 'Keeper'
                group.sort((a, b) => {
                    // Priority 1: Verified accounts first
                    if (a.is_verified !== b.is_verified) {
                        return a.is_verified ? -1 : 1
                    }

                    // Priority 2: Higher ID (usually implies newer creation)
                    return b.id > a.id ? 1 : -1 // Descending
                })

                // The first element is the "Keeper"
                const keeper = group[0]

                // All others are explicitly duplicates
                const duplicates = group.slice(1)

                duplicates.forEach(dup => {
                    deletedIds.push(dup.id)

                    // Log for report
                    const msg = `Deleted ID ${dup.id} (${dup.nisn}) in favor of ID ${keeper.id} (${keeper.nisn})`
                    if (!logMap.has(nisnKey)) logMap.set(nisnKey, [])
                    logMap.get(nisnKey)!.push(msg)
                })
            }
        }

        // 4. Perform Deletion
        if (deletedIds.length > 0) {
            // Delete in batches of 100 to avoid request size limits
            const batchSize = 100
            for (let i = 0; i < deletedIds.length; i += batchSize) {
                const batch = deletedIds.slice(i, i + batchSize)
                const { error: deleteError } = await supabaseAdmin
                    .from('students')
                    .delete()
                    .in('id', batch)

                if (deleteError) {
                    console.error('Batch Delete Error:', deleteError)
                    throw deleteError
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Cleanup Complete. Processed ${students.length} records. Found and deleted ${deletedIds.length} duplicates.`,
            meta: {
                total_students: students.length,
                deleted_count: deletedIds.length,
                unique_nisn_count: grouped.size
            },
            details: Object.fromEntries(logMap) // Return detailed log of what happened
        })

    } catch (error: any) {
        console.error('Cleanup API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
