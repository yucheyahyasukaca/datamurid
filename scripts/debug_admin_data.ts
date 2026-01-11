
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually read .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8')
        console.log('Read .env.local, bytes:', envConfig.length)
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
        console.log('.env.local loaded manually')
        console.log('Keys found:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
    } else {
        console.warn('.env.local not found')
    }
} catch (e) {
    console.error('Error reading .env.local', e)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// Try both possible env var names for the service key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

console.log('Checking variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function main() {
    console.log('--- DEBUG ADMIN DATA ---')
    console.log('Connecting to Supabase...')

    // 1. Check Students Count (bypassing RLS because of service role)
    const { count, error: countError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

    if (countError) {
        console.error('Error counting students:', countError)
    } else {
        console.log(`Total Students in DB (Service Role): ${count}`)
    }

    // 2. Check Profiles and Roles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, role')

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
    } else {
        console.log(`\nFound ${profiles?.length || 0} profiles:`)
        profiles?.forEach(p => {
            console.log(` - ID: ${p.id}, Email: ${p.email}, Role: ${p.role}`)
        })
    }

    console.log('\n--- END DEBUG ---')
}

main().catch(console.error)
