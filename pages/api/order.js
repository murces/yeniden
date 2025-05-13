import crypto from 'crypto';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { symbol, action, size } = req.body;
    const side = action === 'BUY' ? 'BUY' : 'SELL';

    const API_KEY    = process.env.BINANCE_API_KEY;
    const API_SECRET = process.env.BINANCE_API_SECRET;
    if (!API_KEY || !API_SECRET) {
      return res.status(500).json({ error: 'API keys missing' });
    }

    const timestamp = Date.now();
    const query = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${size}&timestamp=${timestamp}`;
    const signature = crypto
      .createHmac('sha256', API_SECRET)
      .update(query)
      .digest('hex');

    const url = `https://fapi.binance.com/fapi/v1/order?${query}&signature=${signature}`;
    const binanceRes = await fetch(url, {
      method: 'POST',
      headers: { 'X-MBX-APIKEY': API_KEY }
    });
    const data = await binanceRes.json();
    return res.status(binanceRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
}
