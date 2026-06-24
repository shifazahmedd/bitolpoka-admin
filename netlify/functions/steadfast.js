const https = require('https');

exports.handler = async function(event, context) {
    // 1. Handle CORS securely
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        const payload = JSON.parse(event.body);
        const { api_key, secret_key, order_data } = payload;

        const requestBody = JSON.stringify(order_data);

        // 2. Set up the exact Steadfast connection parameters
        const options = {
            hostname: 'portal.steadfast.com.bd',
            path: '/api/v1/create_order',
            method: 'POST',
            headers: {
                'Api-Key': (api_key || '').trim(),       // .trim() removes accidental spaces!
                'Secret-Key': (secret_key || '').trim(), // .trim() removes accidental spaces!
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };

        // 3. Make the Native Request to bypass all firewall errors
        const responseBody = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => resolve({ statusCode: res.statusCode, body }));
            });
            req.on('error', (e) => reject(e));
            req.write(requestBody);
            req.end();
        });

        return {
            statusCode: responseBody.statusCode,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: responseBody.body
        };

    } catch (error) {
        // Return exactly what caused the failure
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message || "Native Server Error" })
        };
    }
};
