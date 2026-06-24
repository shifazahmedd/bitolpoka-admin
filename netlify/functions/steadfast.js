exports.handler = async function(event, context) {
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

        // Clean out any accidental invisible spaces
        const cleanApiKey = (api_key || '').trim();
        const cleanSecretKey = (secret_key || '').trim();

        // ✨ THE MAGIC FIX: Steadfast's actual secret API server is Packzy!
        const response = await fetch('https://portal.packzy.com/api/v1/create_order', {
            method: 'POST',
            headers: {
                'Api-Key': cleanApiKey,
                'Secret-Key': cleanSecretKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order_data)
        });

        const data = await response.json();

        return {
            statusCode: response.status,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message || "Native Server Error" })
        };
    }
};
