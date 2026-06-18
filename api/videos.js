// /api/videos.js — proxy YouTube API (même domaine, pas de restriction iOS PWA)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const YT_KEY = 'AIzaSyDC64NfAfHLOA7rxzY1zFv7Fq6U8VOGYwA';
  const CHANNEL_ID = 'UC1FccLXBfJ6He2gHYCQvSjw';
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&type=video&order=date&maxResults=50&key=${YT_KEY}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }
    const videos = (data.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumb: item.snippet.thumbnails.default.url
    }));
    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(200).json({ videos });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
