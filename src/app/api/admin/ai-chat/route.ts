import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SCHOOL_KNOWLEDGE } from '@/lib/school-knowledge'
import { supabaseAdmin } from '@/utils/supabase-admin'

export const runtime = 'edge'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        // Double-check authentication (Defense in Depth)
        const token = request.cookies.get('auth_token')?.value
        const payload = token ? await verifyToken(token) : null

        if (!payload || payload.role !== 'admin') {
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
            .select('nama, nisn, rombel, is_verified, nipd, jk, tanggal_lahir, alamat, kelurahan, kecamatan')
            .order('nama', { ascending: true })

        if (dbError) {
            console.error('Database Error:', dbError)
            // Continue without data, but log it
        }


        // Calculate detailed stats per Rombel & Find Oldest/Youngest
        const statsByRombel: Record<string, { total: number; verified: number; pending: number }> = {}
        let totalStats = { total: 0, verified: 0, pending: 0 }

        let oldestStudent: any = null
        let youngestStudent: any = null

        if (students) {
            students.forEach(s => {
                const rombel = s.rombel || 'Tanpa Kelas'

                // Initialize if not exists
                if (!statsByRombel[rombel]) {
                    statsByRombel[rombel] = { total: 0, verified: 0, pending: 0 }
                }

                // Increment counts
                statsByRombel[rombel].total++
                totalStats.total++

                if (s.is_verified) {
                    statsByRombel[rombel].verified++
                    totalStats.verified++
                } else {
                    statsByRombel[rombel].pending++
                    totalStats.pending++
                }

                // Check Oldest/Youngest
                if (s.tanggal_lahir) {
                    const birthDate = new Date(s.tanggal_lahir)

                    // Oldest (Min Date)
                    if (!oldestStudent || birthDate < new Date(oldestStudent.tanggal_lahir)) {
                        oldestStudent = s
                    }

                    // Youngest (Max Date)
                    if (!youngestStudent || birthDate > new Date(youngestStudent.tanggal_lahir)) {
                        youngestStudent = s
                    }
                }
            })
        }

        // Format Rombel Recap for AI
        const rombelRecap = Object.entries(statsByRombel)
            .sort((a, b) => a[0].localeCompare(b[0])) // Sort by class name
            .map(([rombel, data]) => {
                return `- **${rombel}**: Total ${data.total} (✅ ${data.verified} | ⏳ ${data.pending})`
            })
            .join('\n')

        // Format data into a concise context string
        const studentContext = students ? students.map(s =>
            `- ${s.nama} (${s.rombel || 'No Class'}) | Status: ${s.is_verified ? 'Verified' : 'Pending'} | NISN: ${s.nisn} | JK: ${s.jk} | Tgl Lahir: ${s.tanggal_lahir || '-'} | Alamat: ${s.alamat || '-'}, ${s.kelurahan || '-'}, ${s.kecamatan || '-'}`
        ).join('\n') : 'Data siswa tidak tersedia saat ini.'

        let systemInstruction = `Anda adalah Asisten AI Khusus untuk Bapak/Ibu Guru & Staf Admin di SMA Negeri 1 Pati.
        Tugas mulia Anda adalah membantu pengelolaan data siswa agar Bapak/Ibu Guru bisa lebih fokus mendidik.

        PENGGUNA ANDA:
        - Sapa mereka dengan sebutan hormat "Bapak/Ibu".
        - Mereka adalah pahlawan tanpa tanda jasa yang sedang berjuang untuk masa depan siswa.
        - Berikan semangat, apresiasi, dan kalimat motivasi yang menguatkan hati mereka.

        DATA STATISTIK SAAT INI (Update Real-time):
        
        **RINGKASAN TOTAL:**
        - Total Siswa: ${totalStats.total}
        - Sudah Verifikasi: ${totalStats.verified}
        - Belum Verifikasi: ${totalStats.pending}
        
        **STATISTIK DEMOGRAFI (Berdasarkan Tanggal Lahir):**
        - Murid Paling Tua: ${oldestStudent ? `${oldestStudent.nama} (${oldestStudent.rombel}) - Lahir: ${oldestStudent.tanggal_lahir}` : 'Data belum tersedia'}
        - Murid Paling Muda: ${youngestStudent ? `${youngestStudent.nama} (${youngestStudent.rombel}) - Lahir: ${youngestStudent.tanggal_lahir}` : 'Data belum tersedia'}

        **KONTEKS GEOGRAFIS:**
        - Sekolah: SMA Negeri 1 Pati (Jl. P. Sudirman No. 24, Pati Kota).
        - Untuk pertanyaan "Paling Jauh" atau "Paling Dekat", gunakan logika kecamatan/kelurahan dari data alamat siswa.
        - Dekat: Pati Kota, Margorejo.
        - Jauh: Pucakwangi, Jaken, Tayu, Dukuhseti.

        **REKAP PER KELAS (ROMBEL):**
        ${rombelRecap}

        (Gunakan data di atas untuk menjawab pertanyaan jumlah/statistik. Jangan menghitung manual dari list nama di bawah karena rawan salah hitung).


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

        // --- INJECT SNBP DATA (MATCHING STUDENT AI CAPABILITIES) ---
        try {
            const alumniData = require('@/data/alumni-snbp.json');

            if (Array.isArray(alumniData) && alumniData.length > 0) {
                systemInstruction += `\n\n[HISTORI ALUMNI SMAN 1 PATI - JALUR SNBP]\n`;
                systemInstruction += `Data berikut adalah FAKTA JUMLAH alumni yang diterima SNBP. Jika ditanya jumlah, WAJIB hitung dari tabel ringkasan ini.\n`;

                // Pre-calculate statistics to allow AI to read exact numbers easily
                const stats: Record<string, Record<string, number>> = {};

                alumniData.forEach((d: any) => {
                    if (!stats[d.ptn]) stats[d.ptn] = {};
                    if (!stats[d.ptn][d.year]) stats[d.ptn][d.year] = 0;
                    stats[d.ptn][d.year] += d.count;
                });

                // Generate Summary Table string
                let summaryTable = "RINGKASAN STATISTIK DITERIMA PER KAMPUS:\n";

                // Also calculate Total Per Year for global context
                const totalPerYear: Record<string, number> = {};

                Object.keys(stats).sort().forEach(ptn => {
                    const years = stats[ptn];
                    const total = Object.values(years).reduce((a, b) => a + b, 0);
                    const detailStr = Object.entries(years)
                        .sort((a, b) => parseInt(b[0]) - parseInt(a[0])) // Sort DB desc
                        .map(([y, c]) => {
                            // Accumulate total per year
                            if (!totalPerYear[y]) totalPerYear[y] = 0;
                            totalPerYear[y] += c;
                            return `${y} (${c})`;
                        })
                        .join(', ');

                    summaryTable += `- ${ptn}: TOTAL ${total} siswa. Rincian: ${detailStr}\n`;
                });

                // Inject Total Per Year
                const totalYearStr = Object.entries(totalPerYear)
                    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                    .map(([y, c]) => `Tahun ${y}: ${c} siswa`)
                    .join(' | ');

                systemInstruction += `\n[RINGKASAN TOTAL PER TAHUN] (Gunakan ini untuk pertanyaan jumlah per tahun)\n${totalYearStr}\n\n`;
                systemInstruction += summaryTable;
                systemInstruction += `\nDETAIL JURUSAN & SISWA (Gunakan untuk mencari nama siswa):\n`;

                // Generate detailed list with names
                const historyDetails = alumniData.map((d: any) => {
                    const names = d.details ? d.details.map((det: any) => det.name).join(', ') : '';
                    return `- ${d.year} | ${d.ptn} | ${d.prodi} | Siswa: ${names}`;
                }).join('\n');

                systemInstruction += historyDetails;

                systemInstruction += `\n\nATURAN PENTING SNBP:\n`;
                systemInstruction += `1. Gunakan data ini untuk membantu Guru menganalisis tren atau menjawab pertanyaan orang tua.\n`;
                systemInstruction += `2. Jika ditanya jumlah, BACA LANGSUNG dari RINGKASAN.\n`;
            }
        } catch (error) {
            console.error("Failed to load alumni SNBP data for admin", error);
        }

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
