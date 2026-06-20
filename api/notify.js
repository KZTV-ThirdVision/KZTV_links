export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  try {
    // Lire depuis query params (sendBeacon) ou body JSON
    const qTitle = req.query && req.query.title;
    const qBody  = req.query && req.query.body;
    let title, bodyText;
    if (qTitle) {
      title    = qTitle;
      bodyText = qBody || '';
    } else {
      const b  = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      title    = b.title || 'KZTV';
      bodyText = b.body  || '';
    }
    const text = (title ? '*' + title + '*\n' : '') + bodyText;
    const r = await fetch('https://api.telegram.org/bot8776244027:AAG6vCk6ilcb3qACw2qV7_SxaY7FJtmsK-Y/sendMessage', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: '7629731239',
        text: text,
        parse_mode: 'Markdown'
      })
    });
    const data = await r.json();
    res.status(200).json({ ok: data.ok });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
