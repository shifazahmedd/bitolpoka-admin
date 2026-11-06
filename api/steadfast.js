export default async function handler(req, res) {
    // 1. Allow the Admin Panel to communicate with this file securely
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Reject non-POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { api_key, secret_key, order_data } = req.body;

        // Clean out any accidental invisible spaces from your saved keys
        const cleanApiKey = (api_key || '').trim();
        const cleanSecretKey = (secret_key || '').trim();

        // 2. Send to Steadfast's REAL backend server (Packzy)
        const steadfastResponse = await fetch('https://portal.packzy.com/api/v1/create_order', {
            method: 'POST',
            headers: {
                'Api-Key': cleanApiKey,
                'Secret-Key': cleanSecretKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order_data)
        });

        // 3. Carefully read the response so it doesn't crash
        const textResponse = await steadfastResponse.text();
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch(e) {
            return res.status(steadfastResponse.status).json({
                message: "Steadfast Server Error (Not JSON)",
                details: textResponse
            });
        }

        // 4. Send success back to the Admin Panel
        return res.status(steadfastResponse.status).json(data);

    } catch (error) {
        console.error('Vercel API Error:', error);
        return res.status(500).json({ message: error.message || 'Internal Vercel Error' });
    }
}
