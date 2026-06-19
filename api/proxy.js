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
    let body = await response.text();

    if (ct.includes('text/html')) {
      // 1. Injecter base tag pour les URLs relatives
      body = body.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`);

      // 2. Neutraliser les techniques anti-iframe les plus communes
      // a. X-Frame busting JS : if(top !== self) top.location = self.location
      body = body.replace(
        /if\s*\(\s*(?:window\.)?top\s*[!=]==?\s*(?:window\.)?(?:self|window)\s*\)/gi,
        'if(false)'
      );
      body = body.replace(
        /if\s*\(\s*(?:window\.)?(?:self|window)\s*[!=]==?\s*(?:window\.)?top\s*\)/gi,
        'if(false)'
      );
      // b. top.location.href = ou top.location.replace(
      body = body.replace(
        /(?:window\.)?top\.location(?:\.href)?\s*=/gi,
        'void(0)//'
      );
      body = body.replace(
        /(?:window\.)?top\.location\.replace\s*\(/gi,
        'void(0)||('
      );
      // c. frameElement check
      body = body.replace(
        /if\s*\(\s*(?:window\.)?frameElement\s*\)/gi,
        'if(false)'
      );
      // d. Supprimer les meta X-Frame-Options embarqués
      body = body.replace(
        /<meta[^>]+http-equiv\s*=\s*["']?X-Frame-Options["']?[^>]*>/gi,
        ''
      );
      // e. Neutraliser CSP frame-ancestors dans les meta
      body = body.replace(
        /frame-ancestors[^;'"]+/gi,
        'frame-ancestors *'
      );
    }

    // Ne PAS forwarder X-Frame-Options, CSP, ni les cookies
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 's-maxage=60');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.status(response.status).send(body);
  } catch(e) {
    res.status(500).send('Proxy error: ' + e.message);
  }
}
