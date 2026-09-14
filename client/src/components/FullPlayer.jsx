import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';
import Icon from './Icon';

export default function FullPlayer() {
  const { currentSong, isPlaying, currentTime, duration, isFullPlayerOpen, setIsFullPlayerOpen, togglePlayPause, playNext, playPrevious, seekTo, toggleFavorite, loadError, clearLoadError } = usePlayer();

  if (!isFullPlayerOpen || !currentSong) return null;

  return (
    <div className="full-player-overlay">
      <div className="full-player-header">
        <button className="icon-btn player-back-btn" onClick={() => setIsFullPlayerOpen(false)} aria-label="Back to music library"><Icon name="back" size={24} /></button>
        <span className="now-playing-label">Now Playing</span>
        <button className={`icon-btn ${currentSong.isFavorite ? 'active' : ''}`} onClick={() => toggleFavorite(currentSong.id)} aria-label="Toggle favorite"><Icon name="heart" size={22} filled={currentSong.isFavorite} /></button>
      </div>

      {loadError && <div className="banner error" style={{ margin: '0 20px' }} onClick={clearLoadError}>{loadError}</div>}

      <div className="full-player-art"><div className="disc"><img src="/icons/logo.png" alt="Bhakti Sangeet" /></div></div>

      <div className="full-player-info"><div className="title">{currentSong.title}</div><div className="subtitle">{currentSong.artist || currentSong.categoryId}</div></div>

      <div className="seek-section">
        <input type="range" min="0" max={duration || 0} value={currentTime} onChange={(event) => seekTo(Number(event.target.value))} />
        <div className="time-row"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
      </div>

      <div className="transport-row">
        <button onClick={playPrevious} aria-label="Previous song"><Icon name="previous" size={28} filled /></button>
        <button className="play-pause-btn" onClick={togglePlayPause} aria-label={isPlaying ? 'Pause song' : 'Play song'}>
          {isPlaying ? <span className="pause-bars" aria-hidden="true"><i /><i /></span> : <Icon name="play" size={30} filled />}
        </button>
        <button onClick={playNext} aria-label="Next song"><Icon name="next" size={28} filled /></button>
      </div>

    </div>
  );
}
