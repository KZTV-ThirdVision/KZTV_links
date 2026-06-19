// /api/scan.js — Point d'entrée unique pour tous les QR codes KZTV
// Gère : bots, défense totale, sentinelle, redirection normale

const SB_URL = 'https://bkqdhndjmpwdtcelrdit.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWRobmRqbXB3ZHRjZWxyZGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MTc5NDQsImV4cCI6MjA5Mzk5Mzk0NH0.CyYJFze2ggc1x0JNhYp7abCEWR1vOJq2r3dB8TowUEE';

const BOT_PATTERNS = [
  'googlebot','bingbot','slurp','duckduckbot','baiduspider',
  'yandexbot','sogou','exabot','facebot','ia_archiver',
  'applebot','twitterbot','linkedinbot','discordbot',
  'whatsapp','telegrambot','python-requests','curl','wget',
  'scrapy','axios','node-fetch','go-http-client'
];

function isBot(ua) {
  if (!ua) return true;
  const lower = ua.toLowerCase();
  return BOT_PATTERNS.some(b => lower.includes(b));
}

async function fetchSpot(shortId) {
  const r = await fetch(
    `${SB_URL}/rest/v1/spots?short_id=eq.${shortId}&select=*&limit=1`,
    { headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` } }
  );
  const data = await r.json();
  return data && data[0] ? data[0] : null;
}

async function patchSpot(spotId, patch) {
  await fetch(`${SB_URL}/rest/v1/spots?id=eq.${spotId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(patch)
  });
}

export default async function handler(req, res) {
  const shortId = req.query.id;
  const ua = req.headers['user-agent'] || '';

  // ── 1. Bot → redirection directe sans trace ──────────────────
  if (isBot(ua)) {
    // On doit quand même savoir vers où rediriger
    if (shortId) {
      const spot = await fetchSpot(shortId);
      if (spot && spot.real_url) {
        res.setHeader('Referrer-Policy', 'no-referrer');
        return res.redirect(302, spot.real_url);
      }
    }
    return res.redirect(302, 'https://www.google.com');
  }

  if (!shortId) return res.redirect(302, 'https://www.google.com');

  // ── 2. Charger le spot ───────────────────────────────────────
  const spot = await fetchSpot(shortId);
  if (!spot) return res.redirect(302, 'https://www.google.com');
  if (!spot.active) {
    res.setHeader('Referrer-Policy', 'no-referrer');
    return res.redirect(302, spot.real_url || 'https://www.google.com');
  }

  const now = new Date();

  // ── 3. Mode Défense Totale actif ? ──────────────────────────
  if (spot.defense_mode && spot.defense_until && new Date(spot.defense_until) > now) {
    // Incrémenter scans silencieusement
    await patchSpot(spot.id, { scans_count: (spot.scans_count || 0) + 1 });
    res.setHeader('Referrer-Policy', 'no-referrer');
    return res.redirect(302, spot.real_url);
  }
  // Defense expirée → reset
  if (spot.defense_mode && spot.defense_until && new Date(spot.defense_until) <= now) {
    await patchSpot(spot.id, { defense_mode: false, defense_until: null });
  }

  // ── 4. Rediriger vers notre popup avec paramètres courts ─────
  const popupUrl = `/q?id=${spot.id}`;
  res.setHeader('Referrer-Policy', 'no-referrer');
  return res.redirect(302, popupUrl);
}
