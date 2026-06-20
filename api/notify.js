export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Lire depuis query params (GET pixel tracker ou POST)
    const q = req.query || {};
    const title    = q.t || q.title || 'KZTV';
    const bodyText = q.b || q.body  || '';

    const text = '*' + title + '*\n' + bodyText;

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
    // Retourner un pixel 1x1 transparent (pour les requêtes GET image)
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(pixel);
  } catch(e) {
    res.status(200).send('');
  }
}
