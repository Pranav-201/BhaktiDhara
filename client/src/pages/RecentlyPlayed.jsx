import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import SongListPage from '../components/SongListPage';

export default function RecentlyPlayed() {
  const songs = useLiveQuery(
    () =>
      db.songs
        .filter((s) => !!s.lastPlayedAt)
        .toArray()
        .then((list) => list.sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)),
    [],
    []
  );
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), [], []);
  const playlists = useLiveQuery(() => db.playlists.toArray(), [], []);

  return (
    <SongListPage
      title="Recently Played"
      icon="🕘"
      songs={songs}
      categories={categories}
      playlists={playlists}
      emptyMessage="Songs you play will show up here."
      onSongsChanged={() => {}}
    />
  );
}
