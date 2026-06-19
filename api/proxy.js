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
      },
      redirect: 'follow'
    });

    const ct = response.headers.get('content-type') || 'text/html';
    const body = await response.text();

    let out = body;

    if (ct.includes('text/html')) {
      // Injecter base href pour les URLs relatives
      out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`);

      // Supprimer les meta X-Frame-Options embarqués
      out = out.replace(/<meta[^>]+http-equiv\s*=\s*["']?X-Frame-Options["']?[^>]*>/gi, '');

      // Neutraliser les bust-frame les plus simples (inline uniquement)
      out = out.replace(/if\s*\(\s*top\s*!==?\s*self\s*\)/g, 'if(false)');
      out = out.replace(/if\s*\(\s*self\s*!==?\s*top\s*\)/g, 'if(false)');
      out = out.replace(/top\.location\s*=/g, '//_top.location=');
    }

    // Supprimer les headers bloquants, forcer l'autorisation iframe
    res.setHeader('Content-Type', ct);
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Cache-Control', 'no-store');
    // Supprimer explicitement les headers CSP
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Frame-Options');
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    res.status(200).send(out);
  } catch(e) {
    res.status(500).send('');
  }
}
