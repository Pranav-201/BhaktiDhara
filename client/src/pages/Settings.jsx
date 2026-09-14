import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSetting, setSetting } from '../db/db';
import { formatBytes, estimateStorage } from '../utils/storage';
import { usePlayer } from '../context/PlayerContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Settings() {
  const songs = useLiveQuery(() => db.songs.toArray(), [], []);
  const { autoplay, toggleAutoplay, repeatMode, cycleRepeatMode } = usePlayer();
  const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0 });
  const [confirmClearCache, setConfirmClearCache] = useState(false);
  const [confirmClearLibrary, setConfirmClearLibrary] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    estimateStorage().then(setStorageInfo);
  }, [songs]);

  const totalSize = (songs || []).reduce((sum, s) => sum + (s.fileSize || 0), 0);
  const totalSongs = (songs || []).length;

  const clearAppCache = async () => {
    // Clears only the Service Worker's application-shell cache — NEVER the
    // IndexedDB music library. The two are intentionally kept separate.
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    setConfirmClearCache(false);
    setCacheCleared(true);
  };

  const clearLibrary = async () => {
    await db.songs.clear();
    await db.playlistSongs.clear();
    setConfirmClearLibrary(false);
  };

  return (
    <div className="page">
      <div className="page-title">Settings</div>

      {cacheCleared && <div className="banner">App cache cleared. Your songs were not affected.</div>}

      <div className="section-title">Storage</div>
      <div className="settings-group">
        <div className="settings-row">
          <span>Songs</span>
          <span>{totalSongs}</span>
        </div>
        <div className="settings-row">
          <span>Library Size</span>
          <span>{formatBytes(totalSize)}</span>
        </div>
        <div className="settings-row">
          <span>Device Storage Used</span>
          <span>{formatBytes(storageInfo.usage)}</span>
        </div>
      </div>

      <div className="section-title">Playback Defaults</div>
      <div className="settings-group">
        <div className="settings-row">
          <span>Autoplay</span>
          <button className={`switch ${autoplay ? 'on' : ''}`} onClick={toggleAutoplay}>
            <span className="knob" />
          </button>
        </div>
        <div className="settings-row">
          <span>Repeat Mode</span>
          <button className="btn-secondary" style={{ width: 'auto', margin: 0, padding: '8px 14px' }} onClick={cycleRepeatMode}>
            {repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'Repeat All' : 'Repeat One'}
          </button>
        </div>
      </div>

      <div className="section-title">Storage Management</div>
      <div className="settings-group">
        <div className="settings-row" onClick={() => setConfirmClearCache(true)} style={{ cursor: 'pointer' }}>
          <span>Clear App Cache</span>
          <span>›</span>
        </div>
        <div
          className="settings-row"
          onClick={() => setConfirmClearLibrary(true)}
          style={{ cursor: 'pointer', color: 'var(--danger)' }}
        >
          <span>Delete Entire Music Library</span>
          <span>›</span>
        </div>
      </div>

      <div className="section-title">About</div>
      <div className="settings-group">
        <div className="settings-row">
          <span>App</span>
          <span>Bhakti Sangeet</span>
        </div>
        <div className="settings-row">
          <span>Version</span>
          <span>1.0.0</span>
        </div>
        <div className="settings-row">
          <span>Works Offline</span>
          <span>Yes</span>
        </div>
      </div>

      {confirmClearCache && (
        <ConfirmDialog
          title="Clear App Cache"
          message="This clears temporary app files only. Your imported songs, favorites, and playlists are completely safe."
          confirmLabel="Clear Cache"
          danger={false}
          onConfirm={clearAppCache}
          onCancel={() => setConfirmClearCache(false)}
        />
      )}

      {confirmClearLibrary && (
        <ConfirmDialog
          title="Delete Entire Music Library"
          message="This will permanently delete ALL imported songs, favorites, and playlist entries from this device. This cannot be undone."
          confirmLabel="Delete Everything"
          onConfirm={clearLibrary}
          onCancel={() => setConfirmClearLibrary(false)}
        />
      )}
    </div>
  );
}
