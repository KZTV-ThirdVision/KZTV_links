export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send('No URL');

  try {
    const origin = new URL(url).origin;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Accept-Encoding': 'identity',
      },
      redirect: 'follow'
    });

    const ct = response.headers.get('content-type') || 'text/html';
    const body = await response.text();
    let out = body;

    if (ct.includes('text/html')) {
      out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`);
      out = out.replace(/<meta[^>]+http-equiv\s*=\s*["']?X-Frame-Options["']?[^>]*>/gi, '');
      out = out.replace(/if\s*\(\s*top\s*!==\s*self\s*\)/g, 'if(false)');
      out = out.replace(/if\s*\(\s*self\s*!==\s*top\s*\)/g, 'if(false)');
    }

    // Uniquement les headers nécessaires
    res.setHeader('Content-Type', ct);
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(200).send(out);

  } catch(e) {
    res.status(200).send('<html><body></body></html>');
  }
}
