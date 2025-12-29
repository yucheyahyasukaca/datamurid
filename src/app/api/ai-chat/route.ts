import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SCHOOL_KNOWLEDGE } from '@/lib/school-knowledge'

export const runtime = 'edge'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        const { message, studentContext, history } = await request.json()

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Pesan tidak valid' },
                { status: 400 }
            )
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not found in environment')
            return NextResponse.json(
                { error: 'API key tidak ditemukan' },
                { status: 500 }
            )
        }

        console.log('Generating AI response using Gemini 2.0 Flash...')

        let systemInstruction = SCHOOL_KNOWLEDGE.systemInstruction

        if (studentContext) {
            systemInstruction += `\n\n[KONTEKS SISWA LIVE]\n`
            systemInstruction += `Nama: ${studentContext.name || 'Siswa'}\n`
            systemInstruction += `Data Kosong: ${studentContext.missingFields?.join(', ') || 'Lengkap'}\n`
            systemInstruction += `Status Verifikasi: ${studentContext.isVerified ? 'Sudah Verifikasi' : 'Belum Verifikasi'}\n`

            if (studentContext.missingFields && studentContext.missingFields.length > 0) {
                systemInstruction += `\nTUGAS KAMU: Ingatkan siswa ini untuk melengkapi data: ${studentContext.missingFields.join(', ')}.`
            }
        }

        // LOAD SNBP HISTORY DATA
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

                systemInstruction += `\n\nATURAN PENTING:\n`;
                systemInstruction += `1. Jika user tanya "Berapa jumlah...", BACA LANGSUNG dari "RINGKASAN STATISTIK".\n`;
                systemInstruction += `2. Jika user tanya "Siapa..." atau "Dimana [Nama] diterima...", cari di "DETAIL JURUSAN & SISWA".\n`;
            }
        } catch (error) {
            console.error("Failed to load alumni SNBP data", error);
        }

        // Inject PTN Data
        // Optimization: Only inject if the user asks about universities? 
        // For now, inject always as per request to make it "knowledge AI"
        // Inject PTN Data with Keyword Filtering (Optimization)
        try {
            const ptnData = require('@/data/ptn-data.json');

            // Simple keyword matching to find relevant university
            // We search for the university name in the user's message
            const foundUniversities = ptnData.filter((univ: any) => {
                const keywords = univ.university.toLowerCase().split(' ');
                // Check if the message contains the full name or significant parts
                // E.g. "Universitas Indonesia" -> check "universitas indonesia"
                // Or check abbreviations if we had them mapped
                const msgLower = message.toLowerCase();

                // Matches "Universitas Indonesia" or just "UI" if we had abbreviations (we need a map)
                // For now, check if the university name appears (at least 2 words if long, or exact match)
                // Handle special chars in UPN names (e.g. "UPN “Veteran” Jakarta")
                const normalizedUnivName = univ.university.toLowerCase().replace(/[“”"]/g, '');
                if (msgLower.includes(normalizedUnivName)) return true;

                if (msgLower.includes(univ.university.toLowerCase())) return true;

                // HEURISTIC: Partial match for common names
                // e.g. "Brawijaya" for "Universitas Brawijaya"
                const distinctName = univ.university.replace('Universitas', '').replace('Institut', '').replace('Negeri', '').trim().toLowerCase();
                if (distinctName.length > 3 && msgLower.includes(distinctName)) return true;

                // Specific abbreviation mappings (Manual hardcodes for popular ones)
                const abbrMap: Record<string, string[]> = {
                    'ui': ['universitas indonesia'],
                    'ugm': ['universitas gadjah mada'],
                    'itb': ['institut teknologi bandung'],
                    'ipb': ['institut pertanian bogor', 'ipb university'],
                    'unair': ['universitas airlangga'],
                    'its': ['institut teknologi sepuluh nopember'],
                    'unda': ['universitas diponegoro'], // undip
                    'undip': ['universitas diponegoro'],
                    'ub': ['universitas brawijaya'],
                    'unpad': ['universitas padjadjaran'],
                    'uns': ['universitas sebelas maret'],
                    'usk': ['universitas syiah kuala'],
                    'usu': ['universitas sumatera utara'],
                    'unand': ['universitas andalas'],
                    'unp': ['universitas negeri padang'],
                    'unj': ['universitas negeri jakarta'],
                    'upi': ['universitas pendidikan indonesia'],
                    'uny': ['universitas negeri yogyakarta'],
                    'um': ['universitas negeri malang'],
                    'unesa': ['universitas negeri surabaya'],
                    'unhas': ['universitas hasanuddin'],
                    'unm': ['universitas negeri makassar'],
                    'unsri': ['universitas sriwijaya'],
                    'upn': ['upn', 'veteran'], // Catch all UPNs
                    'upnvy': ['upn “veteran” yogyakarta', 'upn veteran yogyakarta'],
                    'upnvj': ['upn “veteran” jakarta', 'upn veteran jakarta'],
                    'upnvjt': ['upn “veteran” jawa timur', 'upn veteran jawa timur', 'upn jatim']
                };

                // Check abbreviations
                for (const [abbr, fullNames] of Object.entries(abbrMap)) {
                    if (fullNames.some(fn => fn.toLowerCase() === univ.university.toLowerCase()) ||
                        univ.university.toLowerCase().includes(abbr)) {
                        // Check if message contains the abbreviation as a distinct word
                        const regex = new RegExp(`\\b${abbr}\\b`, 'i');
                        if (regex.test(msgLower)) return true;
                    }
                }

                return false;
            });

            if (foundUniversities.length > 0) {
                systemInstruction += `\n\n[DATABASE PASSING GRADE PTN 2025 - SUMBER KEBENARAN UTAMA]\n`;
                systemInstruction += `Data terpilih untuk pertanyaan ini:\n`;
                systemInstruction += JSON.stringify(foundUniversities);
                systemInstruction += `\n\nINSTRUKSI KHUSUS:\n`;
                systemInstruction += `1. Gunakan HANYA data di atas.\n`;
                systemInstruction += `2. Bedakan kategori 'SNBP' vs 'SNBT'.\n`;
            } else {
                // Inject a list of available universities so the AI knows what it knows
                const availableList = ptnData.map((u: any) => u.university).join(', ');
                systemInstruction += `\n\n[INFO DATABASE]\n`;
                systemInstruction += `Saya memiliki data passing grade lengkap untuk universitas berikut: ${availableList}.\n`;
                systemInstruction += `Jika user bertanya tentang salah satu kampus ini, saya akan memuat datanya. Jika user bertanya spesifik tapi saya tidak memuat datanya, mungkin saya gagal mendeteksi nama kampusnya.\n`;
            }

        } catch (e) {
            console.error('Failed to load PTN data', e);
        }

        // Get the generative model with system instruction
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp', // Updated to 2.0 Flash as requested
            systemInstruction: systemInstruction,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        })

        // Initialize Chat with History
        // Ensure history is correctly formatted for Gemini (user/model roles, parts array)
        const cleanHistory = Array.isArray(history) ? history.map((h: any) => ({
            role: h.role === 'assistant' ? 'model' : h.role,
            parts: h.parts || [{ text: h.content || '' }]
        })) : [];

        const chat = model.startChat({
            history: cleanHistory,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        console.log('AI response generated successfully')

        return NextResponse.json({
            response: text,
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error('AI Chat Error:', error)
        console.error('Error details:', {
            message: error.message,
            model: 'gemini-2.0-flash-exp'
        })

        // Fallback error handling for model availability
        let errorMessage = 'Maaf, terjadi kesalahan saat memproses permintaan kamu.';

        if (error.message?.includes('not found') || error.message?.includes('404')) {
            errorMessage = 'Model AI sedang sibuk atau tidak tersedia. Coba lagi nanti ya!';
        }

        return NextResponse.json(
            {
                error: errorMessage,
                details: error.message
            },
            { status: 500 }
        )
    }
}

