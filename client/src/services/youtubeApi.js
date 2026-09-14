// Frontend never talks to YouTube directly and never sees the API key.
// It only calls our own Express backend, which holds YOUTUBE_API_KEY.

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function searchYouTube(query) {
  if (!navigator.onLine) {
    throw new Error('OFFLINE');
  }
  const res = await fetch(`${API_BASE}/youtube/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'YOUTUBE_ERROR');
  }
  return res.json();
}
