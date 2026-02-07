const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.error("Could not read .env.local", e);
}

async function verifyFix() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-3-flash-preview';

    console.log(`Verifying fix with model: ${modelName}`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, just say 'OK'.");
        const response = await result.response;
        console.log("SUCCESS!");
        console.log(`Response: ${response.text()}`);
    } catch (error) {
        console.error("FAILED:");
        console.error(error.message);
        console.error("\nTROUBLESHOOTING:");
        console.error("1. Check if 'Generative Language API' is enabled in Google Cloud Console.");
        console.error("2. Check if the API Key is valid and has permission for this API.");
        console.error("3. Check if your billing account is active (if required for this project).");
    }
}

verifyFix();
