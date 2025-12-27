import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SCHOOL_KNOWLEDGE } from '@/lib/school-knowledge'
import { supabaseAdmin } from '@/utils/supabase-admin'

export const runtime = 'edge'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        // Double-check authentication (Defense in Depth)
        const adminSession = request.cookies.get('admin_session')
        if (!adminSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { message, history } = await request.json()

        if (!message) {
            return NextResponse.json(
                { error: 'Pesan tidak valid' },
                { status: 400 }
            )
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'API key tidak ditemukan' },
                { status: 500 }
            )
        }

        // Fetch Real-time Data from Supabase
        // We fetch simplified fields to save tokens while giving "all seeing" capability
        const { data: students, error: dbError } = await supabaseAdmin
            .from('students')
            .select('nama, nisn, rombel, is_verified, nipd, jk')
            .order('nama', { ascending: true })

        if (dbError) {
            console.error('Database Error:', dbError)
            // Continue without data, but log it
        }

        // Format data into a concise context string
        const studentContext = students ? students.map(s =>
            `- ${s.nama} (${s.rombel || 'No Class'}) | Status: ${s.is_verified ? 'Verified' : 'Pending'} | NISN: ${s.nisn} | JK: ${s.jk}`
        ).join('\n') : 'Data siswa tidak tersedia saat ini.'

        const stats = {
            total: students?.length || 0,
            verified: students?.filter(s => s.is_verified).length || 0,
            pending: students?.filter(s => !s.is_verified).length || 0
        }

        let systemInstruction = `Anda adalah Asisten AI Khusus untuk Bapak/Ibu Guru & Staf Admin di SMA Negeri 1 Pati.
        Tugas mulia Anda adalah membantu pengelolaan data siswa agar Bapak/Ibu Guru bisa lebih fokus mendidik.

        PENGGUNA ANDA:
        - Sapa mereka dengan sebutan hormat "Bapak/Ibu".
        - Mereka adalah pahlawan tanpa tanda jasa yang sedang berjuang untuk masa depan siswa.
        - Berikan semangat, apresiasi, dan kalimat motivasi yang menguatkan hati mereka.

        DATA STATISTIK SAAT INI:
        - Total Siswa: ${stats.total}
        - Sudah Verifikasi: ${stats.verified}
        - Belum Verifikasi: ${stats.pending}

        DATABASE SISWA LENGKAP (Gunakan ini untuk menjawab pertanyaan spesifik):
        === MULAI DATA ===
        ${studentContext}
        === SELESAI DATA ===

        PANDUAN MENJAWAB:
        1. Jawab pertanyaan data dengan AKURAT dan CEKATAN (seperti asisten yang sigap).
        2. Gunakan bahasa yang Sopan, Hangat, dan Penuh Empati.
        3. Selalu sisipkan kalimat penyemangat di akhir respons.
           Contoh: "Semangat terus ya Pak/Bu, setiap data yang rapi adalah langkah awal kesuksesan siswa kita! 🌱"
           Atau: "Terima kasih atas ketelatenan Bapak/Ibu, semoga lelahnya menjadi lillah. ✨"

        Gunakan pengetahuan umum sekolah juga:
        ${SCHOOL_KNOWLEDGE.systemInstruction}
        `

        // Get the generative model
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: systemInstruction,
            generationConfig: {
                temperature: 0.4, // Lower temperature for more factual answers
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        })

        // Generate response
        const chat = model.startChat({
            history: history || [],
        })

        const result = await chat.sendMessage(message)
        const response = await result.response
        const text = response.text()

        return NextResponse.json({
            response: text,
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error('Admin AI Chat Error:', error)
        return NextResponse.json(
            {
                error: 'Maaf, terjadi kesalahan pada server.',
                details: error.message
            },
            { status: 500 }
        )
    }
}
