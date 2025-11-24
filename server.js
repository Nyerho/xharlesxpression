require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Existing env setup
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_CLIENT_ID = process.env.PRINTFUL_CLIENT_ID;
const PRINTFUL_CLIENT_SECRET = process.env.PRINTFUL_CLIENT_SECRET;
const PRINTFUL_OAUTH_SCOPE = process.env.PRINTFUL_OAUTH_SCOPE || 'public';
const REDIRECT_URI = process.env.PRINTFUL_REDIRECT_URI || `http://localhost:${PORT}/api/printful/oauth/callback`;

const TOKEN_PATH = path.join(__dirname, 'printful_token.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helpers for OAuth token storage
function getStoredToken() {
    try {
        if (fs.existsSync(TOKEN_PATH)) {
            return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
        }
    } catch (_) {}
    return null;
}
function saveToken(tokenObj) {
    try { fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenObj, null, 2)); } catch (err) { console.error('Unable to save token:', err.message); }
}
function hasCredentials() {
    const t = getStoredToken();
    return Boolean(PRINTFUL_API_KEY || (t && t.access_token));
}
function getAuthHeader() {
    if (PRINTFUL_API_KEY) return { Authorization: `Bearer ${PRINTFUL_API_KEY}` };
    const t = getStoredToken();
    if (t?.access_token) return { Authorization: `Bearer ${t.access_token}` };
    throw new Error('No Printful credentials available. Complete OAuth or set PRINTFUL_API_KEY.');
}

// OAuth start
app.get('/api/printful/oauth/start', (req, res) => {
    if (!PRINTFUL_CLIENT_ID || !PRINTFUL_CLIENT_SECRET) {
        return res.status(400).send('OAuth not configured: set PRINTFUL_CLIENT_ID and PRINTFUL_CLIENT_SECRET in .env');
    }
    const authUrl = new URL('https://www.printful.com/oauth/authorize');
    authUrl.searchParams.set('client_id', PRINTFUL_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', PRINTFUL_OAUTH_SCOPE);
    res.redirect(authUrl.toString());
});

// OAuth callback
app.get('/api/printful/oauth/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing authorization code.');
    try {
        const tokenRes = await axios.post('https://api.printful.com/oauth/token', {
            grant_type: 'authorization_code',
            client_id: PRINTFUL_CLIENT_ID,
            client_secret: PRINTFUL_CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            code
        }, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 });
        saveToken(tokenRes.data);
        res.status(200).send('Printful OAuth complete. Access token stored. You can close this tab.');
    } catch (err) {
        console.error('OAuth token exchange error:', err?.response?.data || err.message);
        res.status(500).send('OAuth failed. Check server logs.');
    }
});

// Status endpoint to verify credentials quickly
app.get('/api/printful/oauth/status', (req, res) => {
    const t = getStoredToken();
    res.json({
        has_api_key: Boolean(PRINTFUL_API_KEY),
        has_oauth_token: Boolean(t?.access_token),
        token_expires_in: t?.expires_in ?? null
    });
});

// Secure checkout route: creates Printful order
app.post('/api/printful/checkout', async (req, res) => {
    try {
        if (!hasCredentials()) {
            return res.status(400).json({
                error: 'Printful credentials not configured',
                hint: 'Complete OAuth at /api/printful/oauth/start or set PRINTFUL_API_KEY in .env'
            });
        }

        const payload = req.body;
        if (!payload || !payload.recipient || !Array.isArray(payload.items) || payload.items.length === 0) {
            return res.status(400).json({ error: 'Invalid payload: recipient and items are required.' });
        }

        payload.items = payload.items.map(i => ({
            variant_id: Number(i.variant_id),
            quantity: Number(i.quantity),
            retail_price: i.retail_price,
            name: i.name
        }));

        const headers = { ...getAuthHeader(), 'Content-Type': 'application/json' };
        const printfulRes = await axios.post('https://api.printful.com/orders', payload, { headers, timeout: 20000 });

        res.status(200).json({ ok: true, data: printfulRes.data });
    } catch (err) {
        const status = err?.response?.status || 500;
        const upstream = err?.response?.data;
        console.error('Printful order error:', upstream || err.message);
        res.status(status).json(upstream || { error: 'Order creation failed.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});