export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send('No URL');
  
  try {
    const origin = new URL(url).origin;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      redirect: 'follow'
    });
    
    const ct = response.headers.get('content-type') || 'text/html';
    let body = await response.text();
    
    if (ct.includes('text/html')) {
      body = body.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`);
    }
    
    // Forward content type but NOT X-Frame-Options or CSP
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 's-maxage=60');
    res.status(response.status).send(body);
  } catch(e) {
    res.status(500).send('Proxy error: ' + e.message);
  }
}
