import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import SongListPage from '../components/SongListPage';

export default function Favorites() {
  const songs = useLiveQuery(
    () => db.songs.filter((s) => s.isFavorite === true).sortBy('title'),
    [],
    []
  );
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), [], []);
  const playlists = useLiveQuery(() => db.playlists.toArray(), [], []);

  return (
    <SongListPage
      title="Favorites"
      icon="❤️"
      songs={songs}
      categories={categories}
      playlists={playlists}
      emptyMessage="Tap the heart on any song to add it here."
      showBack={false}
      onSongsChanged={() => {}}
    />
  );
}
