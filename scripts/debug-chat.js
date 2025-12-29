async function testChat() {
    const url = 'http://localhost:3000/api/ai-chat';
    const body = {
        message: 'Berapa passing grade Akuntansi UM?',
        studentContext: { name: 'Test User' }
    };

    console.log('Sending request to', url);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            console.error(`Status: ${res.status} ${res.statusText}`);
            const err = await res.text();
            console.error('Error Body:', err);
        } else {
            const data = await res.json();
            console.log('Response:', data.response.substring(0, 100) + '...');
        }
    } catch (e) {
        console.error('Test Failed:', e.message);
    }
}

testChat();
