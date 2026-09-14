import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import Icon from './Icon';

export default function SongItem({ song, songList, index, selectMode = false, selected = false, onToggleSelect, onOpenMenu }) {
  const { currentSong, isPlaying, playSongList, togglePlayPause, toggleFavorite } = usePlayer();
  const isActive = currentSong && currentSong.id === song.id;
  const handleClick = () => {
    if (selectMode) return onToggleSelect(song.id);
    if (isActive) togglePlayPause(); else playSongList(songList, index);
  };

  return (
    <div className={`song-row ${isActive ? 'active' : ''}`}>
      {selectMode && <div className={`checkbox-circle ${selected ? 'checked' : ''}`} onClick={() => onToggleSelect(song.id)} />}
      <button className="cover" onClick={handleClick} aria-label={isActive && isPlaying ? 'Pause song' : 'Play song'}><Icon name={isActive && isPlaying ? 'pause' : 'music'} size={19} /></button>
      <div className="info" onClick={handleClick}><div className="title">{song.title}</div><div className="subtitle">{song.artist || song.categoryId}</div></div>
      {!selectMode && <>
        <button className={`icon-btn ${song.isFavorite ? 'active' : ''}`} onClick={() => toggleFavorite(song.id)} aria-label="Toggle favorite"><Icon name="heart" size={19} filled={song.isFavorite} /></button>
        {onOpenMenu && <button className="icon-btn" onClick={() => onOpenMenu(song)} aria-label="More options"><Icon name="more" size={20} /></button>}
      </>}
    </div>
  );
}
