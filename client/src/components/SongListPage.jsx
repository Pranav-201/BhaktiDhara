import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import SongItem from './SongItem';
import SongMenu from './SongMenu';
import ConfirmDialog from './ConfirmDialog';

export default function SongListPage({ title, icon, songs, categories, playlists, emptyMessage, showBack = true, onSongsChanged, footer, className = '' }) {
  const navigate = useNavigate();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [menuSong, setMenuSong] = useState(null);
  const [deletingSong, setDeletingSong] = useState(null);
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const cancelSelect = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  const confirmDeleteSong = async () => {
    if (!deletingSong) return;
    await db.songs.delete(deletingSong.id);
    await db.playlistSongs.where({ songId: deletingSong.id }).delete();
    setDeletingSong(null);
    onSongsChanged();
  };

  const bulkMoveTo = async (categoryId) => {
    await db.songs.where('id').anyOf(selectedIds).modify({ categoryId });
    setBulkMoveOpen(false);
    cancelSelect();
    onSongsChanged();
  };

  const bulkDelete = async () => {
    await db.songs.where('id').anyOf(selectedIds).delete();
    await db.playlistSongs.where('songId').anyOf(selectedIds).delete();
    setDeletingBulk(false);
    cancelSelect();
    onSongsChanged();
  };

  return (
    <div className={`page ${className}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showBack && (
          <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">←</button>
        )}
        <div className="page-title" style={{ margin: '4px 0 14px', flex: 1 }}>
          {icon} {title} {songs ? `(${songs.length})` : ''}
        </div>
        {songs && songs.length > 0 && (
          <button className="icon-btn" onClick={() => (selectMode ? cancelSelect() : setSelectMode(true))}>
            {selectMode ? 'Cancel' : 'Select'}
          </button>
        )}
      </div>

      {(!songs || songs.length === 0) && (
        <div className="empty-state">
          <div className="big-icon">🎵</div>
          {emptyMessage || 'No songs here yet.'}
        </div>
      )}

      {(songs || []).map((song, i) => (
        <SongItem
          key={song.id}
          song={song}
          songList={songs}
          index={i}
          selectMode={selectMode}
          selected={selectedIds.includes(song.id)}
          onToggleSelect={toggleSelect}
          onOpenMenu={(s) => setMenuSong(s)}
        />
      ))}

      {selectMode && selectedIds.length > 0 && (
        <div className="modal-backdrop" style={{ alignItems: 'flex-end', background: 'transparent', pointerEvents: 'none' }}>
          <div
            className="modal-sheet"
            style={{ pointerEvents: 'auto', display: 'flex', gap: 10, borderRadius: 16, padding: 14 }}
          >
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => setBulkMoveOpen(true)}>
              Move ({selectedIds.length})
            </button>
            <button className="btn-primary btn-danger" style={{ flex: 1 }} onClick={() => setDeletingBulk(true)}>
              Delete
            </button>
          </div>
        </div>
      )}

      {menuSong && (
        <SongMenu
          song={menuSong}
          categories={categories || []}
          playlists={playlists || []}
          onClose={() => setMenuSong(null)}
          onChanged={onSongsChanged}
          onDelete={(s) => setDeletingSong(s)}
        />
      )}

      {deletingSong && (
        <ConfirmDialog
          title="Delete Song"
          message={`Remove "${deletingSong.title}" from your library permanently?`}
          onConfirm={confirmDeleteSong}
          onCancel={() => setDeletingSong(null)}
        />
      )}

      {deletingBulk && (
        <ConfirmDialog
          title="Delete Songs"
          message={`Remove ${selectedIds.length} song(s) from your library permanently?`}
          onConfirm={bulkDelete}
          onCancel={() => setDeletingBulk(false)}
        />
      )}

      {bulkMoveOpen && (
        <div className="modal-backdrop" onClick={() => setBulkMoveOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>Move {selectedIds.length} song(s) to</h3>
            <div className="pill-grid">
              {(categories || []).map((cat) => (
                <div key={cat.id} className="pill" onClick={() => bulkMoveTo(cat.id)}>
                  {cat.icon} {cat.name}
                </div>
              ))}
            </div>
            <button className="btn-secondary" onClick={() => setBulkMoveOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {footer}
    </div>
  );
}
