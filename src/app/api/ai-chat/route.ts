import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SCHOOL_KNOWLEDGE } from '@/lib/school-knowledge'

export const runtime = 'edge'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        const { message, studentContext } = await request.json()

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

            if (studentContext.imgFields && studentContext.missingFields.length > 0) {
                systemInstruction += `\nTUGAS KAMU: Ingatkan siswa ini untuk melengkapi data: ${studentContext.missingFields.join(', ')}.`
            }
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

        // Generate response
        const result = await model.generateContent(message)
        const response = await result.response
        const text = response.text()

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

