// Test script to verify Gemini API locally
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = 'AIzaSyDSjzZGhTlO2-H6CzehhEuVBgRsueoITzg'
const genAI = new GoogleGenerativeAI(apiKey)

async function test() {
    try {
        console.log('Testing Gemini API...')

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: 'You are a friendly AI tutor for high school students.',
        })

        const result = await model.generateContent('Hello! Can you help me?')
        const response = await result.response
        const text = response.text()

        console.log('SUCCESS! Response:', text)
    } catch (error) {
        console.error('ERROR:', error)
    }
}

test()
