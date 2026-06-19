export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const text = (body.title ? '*' + body.title + '*\n' : '') + (body.body || '');
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
