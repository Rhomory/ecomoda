/* ============================================
   Vercel Serverless Function — /api/session
   Crea un Session Token de Niubiz para el monto a pagar.

   API oficial:
   POST https://apisandbox.vnforappstest.com/api.ecommerce/v2/ecommerce/token/session/{merchantId}
   Authorization: <accessToken>
   ============================================ */

const MERCHANT_ID = '456879852'; // sandbox demo
const NIUBIZ_SESSION_URL = `https://apisandbox.vnforappstest.com/api.ecommerce/v2/ecommerce/token/session/${MERCHANT_ID}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { accessToken, amount, channel = 'web' } = req.body || {};
    if (!accessToken) return res.status(400).json({ error: 'Falta accessToken' });
    if (!amount) return res.status(400).json({ error: 'Falta amount' });

    const clientIp = (req.headers['x-forwarded-for'] || '127.0.0.1').split(',')[0].trim();

    const payload = {
      channel,
      amount: Number(amount).toFixed(2),
      antifraud: {
        clientIp,
        merchantDefineData: {
          MDD4: 'comprador@ecomoda.com',
          MDD21: '0',
          MDD32: 'ecomoda-' + Date.now(),
          MDD75: 'Registrado',
          MDD77: '1'
        }
      },
      dataMap: {
        urlAddress: 'https://ecomoda.demo'
      }
    };

    const r = await fetch(NIUBIZ_SESSION_URL, {
      method: 'POST',
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!r.ok) {
      console.error('[Niubiz session] error:', r.status, text);
      return res.status(r.status).json({
        error: 'Error creando session token',
        status: r.status,
        body: data
      });
    }

    return res.status(200).json({
      sessionKey: data.sessionKey,
      expirationTime: data.expirationTime,
      merchantId: MERCHANT_ID
    });
  } catch (err) {
    console.error('[Niubiz session] fatal:', err);
    return res.status(500).json({ error: err.message });
  }
}
