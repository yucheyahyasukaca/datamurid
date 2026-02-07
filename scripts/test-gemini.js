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


async function testModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const logFile = path.join(__dirname, '..', 'gemini_debug.log');
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    if (!apiKey) {
        log("No API KEY found");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTest = [
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-3-pro-preview', // User suggestion
        'gemini-3-flash-preview' // Just in case
    ];

    log(`Starting test at ${new Date().toISOString()}`);

    for (const modelName of modelsToTest) {
        log(`\nTesting model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, just say 'OK'.");
            const response = await result.response;
            log(`SUCCESS: ${modelName}`);
            log(`Response: ${response.text()}`);
            // If one works, we can stop or keep testing to find best? 
            // Let's keep testing to see all available option.
        } catch (error) {
            log(`FAILED: ${modelName}`);
            log(`Error: ${error.message}`);
        }
    }
    log("\nTest complete.");
}

testModels();
