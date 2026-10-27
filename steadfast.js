export default async function handler(req, res) {
    // 1. Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Reject non-POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { api_key, secret_key, order_data } = req.body;

    if (!api_key || !secret_key || !order_data) {
        return res.status(400).json({ message: 'Missing Steadfast API credentials or order data' });
    }

    try {
        // 3. Send the secure request to Steadfast's actual server
        const response = await fetch('https://portal.steadfast.com.bd/api/v1/create_order', {
            method: 'POST',
            headers: {
                'Api-Key': api_key,
                'Secret-Key': secret_key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order_data)
        });

        const data = await response.json();

        // 4. Return Steadfast's response back to your Admin Panel
        return res.status(response.status).json(data);
        
    } catch (error) {
        console.error('Steadfast API Error:', error);
        return res.status(500).json({ message: 'Internal Server Error: Could not reach Steadfast.' });
    }
}
