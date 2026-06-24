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

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const payload = JSON.parse(event.body);
        const { api_key, secret_key, order_data } = payload;

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

        return {
            statusCode: response.status,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};
