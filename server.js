require('dotenv').config();

const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

if (!PRINTFUL_API_KEY) {
    console.warn('WARNING: PRINTFUL_API_KEY not set. Create a .env file with PRINTFUL_API_KEY=your_key');
}

app.use(cors());
app.use(express.json());

// Serve your static site (index.html, art-shop.html, assets, etc.)
app.use(express.static(path.join(__dirname)));

// Secure checkout route: creates Printful order
app.post('/api/printful/checkout', async (req, res) => {
    try {
        const payload = req.body;

        // Basic validation
        if (!payload || !payload.recipient || !Array.isArray(payload.items) || payload.items.length === 0) {
            return res.status(400).json({ error: 'Invalid payload: recipient and items are required.' });
        }

        // Ensure variant_id is numeric (Printful expects number)
        payload.items = payload.items.map(i => ({
            variant_id: Number(i.variant_id),
            quantity: Number(i.quantity),
            retail_price: i.retail_price,
            name: i.name
        }));

        // Optionally add packing slip or other fields here
        const printfulRes = await axios.post(
            'https://api.printful.com/orders',
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 20000
            }
        );

        // Return Printful API response to frontend
        res.status(200).json({ ok: true, data: printfulRes.data });
    } catch (err) {
        console.error('Printful order error:', err?.response?.data || err.message);
        const status = err?.response?.status || 500;
        const message = err?.response?.data || { error: 'Order creation failed.' };
        res.status(status).json(message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});