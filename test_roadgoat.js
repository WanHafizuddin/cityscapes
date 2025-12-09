const https = require('https');

function fetch(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        // Might be HTML if not API
                        console.log("Response starts with:", data.substring(0, 100));
                        reject(new Error("Not JSON response"));
                    }
                } else {
                    reject(new Error(`Status Code: ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

async function test() {
    try {
        console.log("Testing RoadGoat for Kota Bharu...");
        // URL from server.js
        const url = 'https://www.roadgoat.com/business/cities-api/kota-bharu';
        console.log("URL:", url);
        const data = await fetch(url);
        console.log("Success!");
        console.log("Keys:", Object.keys(data));
        if (data.data) {
            console.log("Name:", data.data.attributes.name);
        }
    } catch (e) {
        console.error("Failed:", e.message);
    }
}

test();
