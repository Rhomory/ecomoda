/* ============================================
   Vercel Serverless Function — /api/security
   Llama a la API security de Niubiz (sandbox)
   y devuelve el accessToken al frontend.

   API oficial:
   GET https://apitestenv.vnforapps.com/api.security/v1/security
   Authorization: Basic base64(user:password)

   Credenciales sandbox (demo, hardcoded):
   user:     integraciones@niubiz.com.pe
   password: _7z3@8fF
   ============================================ */

const NIUBIZ_USER = 'integraciones@niubiz.com.pe';
const NIUBIZ_PASSWORD = '_7z3@8fF';
const NIUBIZ_SECURITY_URL = 'https://apitestenv.vnforapps.com/api.security/v1/security';

export default async function handler(req, res) {
  // CORS por si lo testeás desde otro origen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const basicAuth = Buffer.from(`${NIUBIZ_USER}:${NIUBIZ_PASSWORD}`).toString('base64');

    const r = await fetch(NIUBIZ_SECURITY_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    });

    const text = await r.text();

    if (!r.ok) {
      console.error('[Niubiz security] error:', r.status, text);
      return res.status(r.status).json({
        error: 'Error obteniendo access token',
        status: r.status,
        body: text
      });
    }

    // La API devuelve el token plano (string), no JSON
    const accessToken = text.replace(/^"|"$/g, '').trim();
    return res.status(200).json({ accessToken });
  } catch (err) {
    console.error('[Niubiz security] fatal:', err);
    return res.status(500).json({ error: err.message });
  }
}
