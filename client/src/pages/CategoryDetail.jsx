import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import SongListPage from '../components/SongListPage';
import ImportModal from '../components/ImportModal';

export default function CategoryDetail() {
  const { id } = useParams();
  const [showImport, setShowImport] = useState(false);
  const category = useLiveQuery(() => db.categories.get(id), [id]);
  const songs = useLiveQuery(
    () => db.songs.where('categoryId').equals(id).sortBy('title'),
    [id],
    []
  );
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), [], []);
  const playlists = useLiveQuery(() => db.playlists.toArray(), [], []);

  return (
    <>
    <SongListPage
      title={category ? category.name : 'Category'}
      icon={category ? category.icon : '🎵'}
      songs={songs}
      categories={categories}
      playlists={playlists}
      className="category-artwork"
      emptyMessage="No songs in this category yet. Import some songs to get started."
      onSongsChanged={() => {}}
      footer={
        <button className="import-button" onClick={() => setShowImport(true)}>
          + Import Songs
        </button>
      }
    />
    {showImport && category && (
      <ImportModal
        categories={categories || []}
        lockedCategoryId={category.id}
        lockedCategoryName={category.name}
        onImported={() => {}}
        onClose={() => setShowImport(false)}
      />
    )}
    </>
  );
}
