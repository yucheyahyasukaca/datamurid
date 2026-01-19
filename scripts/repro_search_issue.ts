
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach(line => {
        const cleanLine = line.trim()
        if (!cleanLine || cleanLine.startsWith('#')) return
        const match = cleanLine.match(/^([^=]+)=(.*)$/)
        if (match) {
            const key = match[1].trim()
            let value = match[2].trim()
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
            process.env[key] = value
        }
    })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
    console.log('--- REPRO SEARCH ISSUE ---')

    // 1. Check if we have any TKA grades
    const { count, error: countError } = await supabase
        .from('tka_grades')
        .select('*', { count: 'exact', head: true })

    if (countError) console.error('Error counting grades:', countError)
    else console.log(`Total TKA Grades: ${count}`)

    if (!count || count === 0) {
        console.log('No grades to test search with.')
        return
    }

    // 2. Get one student name from existing grades to search for
    const { data: sample } = await supabase
        .from('tka_grades')
        .select('students!inner(nama)')
        .limit(1)
        .single()

    // @ts-ignore
    const searchName = sample?.students?.nama || 'a'
    console.log(`Searching for: "${searchName}"`)

    // 3. Test OLD (Current) Query
    console.log('\nTesting CURRENT query syntax...')
    try {
        const { data, error } = await supabase
            .from('tka_grades')
            .select('*, students!inner(*)')
            .or(`students.nama.ilike.%${searchName}%,students.nisn.ilike.%${searchName}%`)
            .limit(5)

        if (error) console.log('CURRENT query returned error:', error.message)
        else console.log(`CURRENT query returned ${data?.length} results`)
    } catch (e: any) {
        console.log('CURRENT query threw exception:', e.message)
    }

    // 4. Test NEW (Proposed) Query
    console.log('\nTesting PROPOSED query syntax...')
    try {
        const { data, error } = await supabase
            .from('tka_grades')
            .select('*, students!inner(*)')
            .or(`nama.ilike.%${searchName}%,nisn.ilike.%${searchName}%`, { foreignTable: 'students' })
            .limit(5)

        if (error) console.log('PROPOSED query returned error:', error.message)
        else console.log(`PROPOSED query returned ${data?.length} results`)
    } catch (e: any) {
        console.log('PROPOSED query threw exception:', e.message)
    }
}

main().catch(console.error)
