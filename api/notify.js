export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { title, body, priority } = typeof req.body === 'string'
      ? JSON.parse(req.body) : req.body;

    const r = await fetch('https://ntfy.sh/kztv-alerte-sentinelle-defense-total-protection-x100-active', {
      method: 'POST',
      headers: {
        'Title': title || 'KZTV',
        'Priority': priority || 'default',
        'Tags': 'kztv',
        'Content-Type': 'text/plain'
      },
      body: body || ''
    });

    res.status(200).json({ ok: true, ntfy: r.status });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
