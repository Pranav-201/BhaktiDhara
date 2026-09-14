import React from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function MiniPlayer() {
  const { currentSong, isPlaying, currentTime, duration, togglePlayPause, playNext, playPrevious, closePlayer, setIsFullPlayerOpen } =
    usePlayer();

  if (!currentSong) return null;

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mini-player">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="info" onClick={() => setIsFullPlayerOpen(true)}>
        <div className="title">🎵 {currentSong.title}</div>
      </div>
      <button onClick={playPrevious} aria-label="Previous">⏮</button>
      <button onClick={togglePlayPause} aria-label="Play or pause">{isPlaying ? '⏸' : '▶️'}</button>
      <button onClick={playNext} aria-label="Next">⏭</button>
      <button onClick={closePlayer} aria-label="Close song">×</button>
    </div>
  );
}
