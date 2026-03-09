export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Vercel parses application/x-www-form-urlencoded into req.body (Object or String)
        const paramStr = typeof req.body === 'string'
            ? req.body
            : new URLSearchParams(req.body).toString();

        const response = await fetch('https://wos-giftcode-api.centurygame.com/api/player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://wos-giftcode.centurygame.com',
                'Referer': 'https://wos-giftcode.centurygame.com/',
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36'
            },
            body: paramStr
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error proxying to CenturyGame API:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
