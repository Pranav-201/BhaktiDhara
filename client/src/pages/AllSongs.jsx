import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import SongListPage from '../components/SongListPage';

export default function AllSongs() {
  const songs = useLiveQuery(() => db.songs.orderBy('title').toArray(), [], []);
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), [], []);
  const playlists = useLiveQuery(() => db.playlists.toArray(), [], []);

  return (
    <SongListPage
      title="All Songs"
      icon="🎵"
      songs={songs}
      categories={categories}
      playlists={playlists}
      emptyMessage="Import songs to build your library."
      onSongsChanged={() => {}}
    />
  );
}
