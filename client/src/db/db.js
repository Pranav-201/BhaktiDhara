import Dexie from 'dexie';

/*
  IndexedDB schema (via Dexie).
  This is the ONLY place the personal music library lives — nothing here
  is ever sent to the Node backend.

  Tables:
    songs        - metadata + audioBlob for every imported song
    categories   - devotional categories (Hanuman, Ganpati, ...)
    playlists    - user-created custom playlists
    playlistSongs- join table: playlistId <-> songId
    settings     - key/value app preferences (autoplay, repeat, theme, sort)
*/
export const db = new Dexie('BhaktiSangeetDB');

db.version(1).stores({
  songs:
    'id, title, artist, categoryId, fileName, mimeType, isFavorite, playCount, lastPlayedAt, createdAt',
  categories: 'id, name, order',
  playlists: 'id, name, createdAt',
  playlistSongs: '++autoId, playlistId, songId',
  settings: 'key'
});

export const DEFAULT_CATEGORIES = [
  { id: 'hanuman', name: 'Hanuman', icon: '🙏', order: 1 },
  { id: 'ganpati', name: 'Ganpati', icon: '🕉', order: 2 },
  { id: 'mahadev', name: 'Mahadev', icon: '🔱', order: 3 },
  { id: 'vitthal', name: 'Vitthal', icon: '🪷', order: 4 },
  { id: 'devi', name: 'Devi', icon: '🌺', order: 5 },
  { id: 'krishna', name: 'Krishna', icon: '🪈', order: 6 },
  { id: 'ram', name: 'Ram', icon: '🏹', order: 7 },
  { id: 'other', name: 'Other', icon: '🎵', order: 99 }
];

export async function ensureDefaultCategories() {
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  }
}

export function newId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getSetting(key, fallback) {
  const row = await db.settings.get(key);
  return row ? row.value : fallback;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}
