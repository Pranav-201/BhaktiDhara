import React, { useState } from 'react';
import { db } from '../db/db';

export default function SongMenu({ song, categories, playlists, onClose, onChanged, onDelete }) {
  const [view, setView] = useState('menu'); // menu | move | playlist

  const moveToCategory = async (categoryId) => {
    await db.songs.update(song.id, { categoryId });
    onChanged();
    onClose();
  };

  const addToPlaylist = async (playlistId) => {
    const existing = await db.playlistSongs.where({ playlistId, songId: song.id }).first();
    if (!existing) {
      await db.playlistSongs.add({ playlistId, songId: song.id });
    }
    onChanged();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {view === 'menu' && (
          <>
            <h3>{song.title}</h3>
            <button className="btn-secondary" onClick={() => setView('move')}>Move to Category</button>
            <button className="btn-secondary" onClick={() => setView('playlist')}>Add to Playlist</button>
            <button className="btn-secondary btn-danger" onClick={() => { onDelete(song); onClose(); }}>
              Delete Song
            </button>
          </>
        )}

        {view === 'move' && (
          <>
            <h3>Move to Category</h3>
            <div className="pill-grid">
              {categories.map((cat) => (
                <div key={cat.id} className="pill" onClick={() => moveToCategory(cat.id)}>
                  {cat.icon} {cat.name}
                </div>
              ))}
            </div>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
          </>
        )}

        {view === 'playlist' && (
          <>
            <h3>Add to Playlist</h3>
            {playlists.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No playlists yet. Create one in Categories.</p>}
            <div className="pill-grid">
              {playlists.map((pl) => (
                <div key={pl.id} className="pill" onClick={() => addToPlaylist(pl.id)}>
                  {pl.name}
                </div>
              ))}
            </div>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
