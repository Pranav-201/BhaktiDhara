import React from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import SongListPage from '../components/SongListPage';

export default function PlaylistDetail() {
  const { id } = useParams();
  const playlist = useLiveQuery(() => db.playlists.get(id), [id]);
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), [], []);
  const playlists = useLiveQuery(() => db.playlists.toArray(), [], []);

  const songs = useLiveQuery(async () => {
    const links = await db.playlistSongs.where('playlistId').equals(id).toArray();
    const songIds = links.map((l) => l.songId);
    if (songIds.length === 0) return [];
    const items = await db.songs.where('id').anyOf(songIds).toArray();
    return items;
  }, [id], []);

  return (
    <SongListPage
      title={playlist ? playlist.name : 'Playlist'}
      icon="📀"
      songs={songs}
      categories={categories}
      playlists={playlists}
      emptyMessage="No songs in this playlist yet. Add songs from the song menu (⋮)."
      onSongsChanged={() => {}}
    />
  );
}
