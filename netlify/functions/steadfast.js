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

        // 3. Make the Native Request to bypass all version errors
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
```
5. Click **Commit changes** (twice) to save it.

### Step 2: Stop Hiding the Error in the Admin Panel
Right now, if Steadfast rejects the order, our code hides their explanation behind "Unknown Error." Let's update `admin.html` to print the *exact* reason Steadfast is rejecting it.

1. Go back to the main page of your GitHub repository.
2. Click on **`admin.html`**, and click the Pencil icon ✏️ to edit.
3. Scroll all the way down to **line 273**. You are going to replace exactly **one single line** to reveal the true error.

```html:Easy Admin Panel:admin.html
<!-- ... existing code ... -->
                const result = await response.json();

                if (!response.ok || result.status === 400) {
                    let errorMessage = result.error || result.message || JSON.stringify(result, null, 2);
                    alert(`❌ Steadfast Refused the Order:\n\n${errorMessage}`);
                    return;
                }

                // If successful, save the Tracking ID to the database!
<!-- ... existing code ... -->
```
4. Click **Commit changes** (twice) to save it.

### Step 3: Test the Auto-Deploy
Because Netlify is watching your GitHub, it is already updating your live site! 
1. Wait about 30 seconds.
2. Go to your live Admin Panel (`https://...netlify.app`) and **Hard Refresh** the page (Ctrl + Shift + R).
3. Click "Send to Steadfast" one more time.

If it works, you will get the green success checkmark! If Steadfast still refuses the order, the popup will now tell us **exactly** why they are rejecting it (e.g., "Phone number must be 11 digits", "Invalid API Key", etc.). Tell me exactly what the popup says!
