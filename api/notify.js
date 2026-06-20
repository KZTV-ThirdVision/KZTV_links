export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let title = 'KZTV';
    let bodyText = '';

    if (req.method === 'GET' || (req.query && (req.query.t || req.query.title))) {
      // GET request (Image pixel trick depuis q.html)
      title    = (req.query.t || req.query.title || 'KZTV').substring(0, 100);
      bodyText = (req.query.b || req.query.body  || '').substring(0, 300);
    } else {
      // POST request (field.html)
      const b  = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      title    = (b.title || 'KZTV').substring(0, 100);
      bodyText = (b.body  || '').substring(0, 300);
    }

    const text = title + '\n' + bodyText;
    await fetch('https://api.telegram.org/bot8776244027:AAG6vCk6ilcb3qACw2qV7_SxaY7FJtmsK-Y/sendMessage', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ chat_id: '7629731239', text: text })
    });

    // Pixel GIF 1x1 pour les requetes GET Image
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(pixel);
  } catch(e) {
    res.status(200).send('');
  }
}
