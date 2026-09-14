import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, newId } from '../db/db';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Categories() {
  const navigate = useNavigate();
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), [], []);
  const songs = useLiveQuery(() => db.songs.toArray(), [], []);
  const playlists = useLiveQuery(() => db.playlists.toArray(), [], []);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [renamingCategory, setRenamingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [newName, setNewName] = useState('');

  const categoryCounts = useMemo(() => {
    const map = {};
    (songs || []).forEach((s) => {
      map[s.categoryId] = (map[s.categoryId] || 0) + 1;
    });
    return map;
  }, [songs]);

  const addCategory = async () => {
    const name = newName.trim();
    if (!name) return;
    const id = newId('cat');
    await db.categories.add({ id, name, icon: '🎵', order: 60 });
    setNewName('');
    setShowAddCategory(false);
  };

  const renameCategory = async () => {
    const name = newName.trim();
    if (!name || !renamingCategory) return;
    await db.categories.update(renamingCategory.id, { name });
    setRenamingCategory(null);
    setNewName('');
  };

  const deleteCategory = async () => {
    if (!deletingCategory) return;
    const count = categoryCounts[deletingCategory.id] || 0;
    if (count > 0) {
      // Move songs to "Other" instead of deleting them.
      await db.songs.where({ categoryId: deletingCategory.id }).modify({ categoryId: 'other' });
    }
    await db.categories.delete(deletingCategory.id);
    setDeletingCategory(null);
  };

  const addPlaylist = async () => {
    const name = newName.trim();
    if (!name) return;
    await db.playlists.add({ id: newId('pl'), name, createdAt: Date.now() });
    setNewName('');
    setShowAddPlaylist(false);
  };

  return (
    <div className="page">
      <div className="page-title">Categories</div>

      {(categories || []).map((cat) => (
        <div key={cat.id} className="list-card">
          <span className="emoji">{cat.icon}</span>
          <span className="label" onClick={() => navigate(`/category/${cat.id}`)}>
            {cat.name} ({categoryCounts[cat.id] || 0})
          </span>
          <button
            className="icon-btn"
            onClick={() => {
              setRenamingCategory(cat);
              setNewName(cat.name);
            }}
          >
            ✏️
          </button>
          <button className="icon-btn" onClick={() => setDeletingCategory(cat)}>
            🗑️
          </button>
        </div>
      ))}

      <button
        className="btn-secondary"
        onClick={() => {
          setShowAddCategory(true);
          setNewName('');
        }}
      >
        + New Category
      </button>

      <div className="section-title">Playlists</div>
      {(playlists || []).length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No custom playlists yet.</p>
      )}
      {(playlists || []).map((pl) => (
        <div key={pl.id} className="list-card" onClick={() => navigate(`/playlist/${pl.id}`)}>
          <span className="emoji">📀</span>
          <span className="label">{pl.name}</span>
          <span style={{ color: 'var(--text-muted)' }}>›</span>
        </div>
      ))}
      <button
        className="btn-secondary"
        onClick={() => {
          setShowAddPlaylist(true);
          setNewName('');
        }}
      >
        + New Playlist
      </button>

      {(showAddCategory || renamingCategory) && (
        <div className="modal-backdrop" onClick={() => { setShowAddCategory(false); setRenamingCategory(null); }}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>{renamingCategory ? 'Rename Category' : 'New Category'}</h3>
            <input
              className="text-input"
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <button className="btn-primary" onClick={renamingCategory ? renameCategory : addCategory}>
              Save
            </button>
            <button className="btn-secondary" onClick={() => { setShowAddCategory(false); setRenamingCategory(null); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showAddPlaylist && (
        <div className="modal-backdrop" onClick={() => setShowAddPlaylist(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>New Playlist</h3>
            <input
              className="text-input"
              placeholder="Playlist name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <button className="btn-primary" onClick={addPlaylist}>Save</button>
            <button className="btn-secondary" onClick={() => setShowAddPlaylist(false)}>Cancel</button>
          </div>
        </div>
      )}

      {deletingCategory && (
        <ConfirmDialog
          title="Delete Category"
          message={`Songs in "${deletingCategory.name}" will be moved to "Other". This won't delete any songs.`}
          confirmLabel="Delete Category"
          onConfirm={deleteCategory}
          onCancel={() => setDeletingCategory(null)}
        />
      )}
    </div>
  );
}
