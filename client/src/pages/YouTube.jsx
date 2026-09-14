import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { searchYouTube } from '../services/youtubeApi';

export default function YouTubePage() {
  const online = useOnlineStatus();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [showOfflinePopup, setShowOfflinePopup] = useState(false);

  const runSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!online) {
      setShowOfflinePopup(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await searchYouTube(query.trim());
      setResults(data.results || []);
      if ((data.results || []).length === 0) {
        setError('No results found. Try a different search.');
      }
    } catch (err) {
      if (err.message === 'OFFLINE') {
        setShowOfflinePopup(true);
      } else if (err.message === 'YOUTUBE_QUOTA_EXCEEDED') {
        setError('YouTube search is temporarily unavailable (quota reached). Please try again later.');
      } else {
        setError('Unable to search YouTube right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-title">▶️ YouTube</div>

      {!online && (
        <div className="banner">
          You're offline. Your local devotional library still works normally — YouTube search needs internet.
        </div>
      )}

      <form className="search-bar" onSubmit={runSearch}>
        <span>🔍</span>
        <input
          placeholder="Search YouTube, e.g. Hanuman Chalisa"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      <button className="btn-primary" style={{ marginBottom: 16 }} onClick={runSearch} disabled={loading}>
        {loading ? 'Searching…' : 'Search'}
      </button>

      {error && <div className="banner error">{error}</div>}

      {results.map((video) => (
        <div className="yt-result" key={video.videoId}>
          <img src={video.thumbnail} alt="" />
          <div className="info">
            <div className="title">{video.title}</div>
            <div className="channel">{video.channelTitle}</div>
            <button className="yt-play-btn" onClick={() => setPlayingVideoId(video.videoId)}>
              ▶ Play
            </button>
          </div>
        </div>
      ))}

      {playingVideoId && (
        <div className="yt-player-overlay">
          <div className="close-row">
            <button onClick={() => setPlayingVideoId(null)} aria-label="Close">✕</button>
          </div>
          <iframe
            src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1&playsinline=1`}
            title="YouTube player"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {showOfflinePopup && (
        <div className="modal-backdrop" onClick={() => setShowOfflinePopup(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>No Internet Connection</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>
              Please turn on Wi-Fi or mobile data to search YouTube.
            </p>
            <button className="btn-primary" onClick={() => setShowOfflinePopup(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
