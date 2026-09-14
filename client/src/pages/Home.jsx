import React, { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import CategoryCard from '../components/CategoryCard';
import SongItem from '../components/SongItem';
import ImportModal from '../components/ImportModal';
import Icon from '../components/Icon';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState('');
  const [logoHidden, setLogoHidden] = useState(false);
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), [], []);
  const songs = useLiveQuery(() => db.songs.toArray(), [], []);

  useEffect(() => {
    const onScroll = () => setLogoHidden(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const categoryCounts = useMemo(() => {
    const map = {};
    (songs || []).forEach((song) => { map[song.categoryId] = (map[song.categoryId] || 0) + 1; });
    return map;
  }, [songs]);

  const searchResults = useMemo(() => {
    if (!search.trim() || !songs) return [];
    const query = search.trim().toLowerCase();
    return songs.filter((song) => song.title.toLowerCase().includes(query) || song.fileName.toLowerCase().includes(query) || (song.artist || '').toLowerCase().includes(query) || song.categoryId.toLowerCase().includes(query));
  }, [search, songs]);

  const createCategory = async (name) => {
    const id = `custom-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    await db.categories.add({ id, name, icon: 'music', order: 50 });
    return id;
  };

  return (
    <div className="page home-page">
      <header className={`home-logo ${logoHidden ? 'is-hidden' : ''}`}>
        <img src="/icons/logo.png" alt="Bhakti Sangeet" />
      </header>

      <div className="search-bar">
        <Icon name="search" size={19} />
        <input placeholder="Search your songs" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {search.trim() ? (
        <>
          <div className="section-title">Search Results <span>{searchResults.length}</span></div>
          {searchResults.length === 0 ? <div className="empty-state"><Icon name="search" size={42} /><p>No songs found.</p></div> : searchResults.map((song, index) => <SongItem key={song.id} song={song} songList={searchResults} index={index} />)}
        </>
      ) : (
        <>
          <div className="section-title">Your devotional collection</div>
          <div className="category-grid">{(categories || []).map((category) => <CategoryCard key={category.id} category={category} count={categoryCounts[category.id] || 0} />)}</div>
          <div className="library-links">
            <button className="list-card" onClick={() => navigate('/favorites')}><span className="list-icon"><Icon name="heart" size={20} /></span><span className="label">Favorites</span><Icon name="chevron" size={18} /></button>
            <button className="list-card" onClick={() => navigate('/recent')}><span className="list-icon"><Icon name="clock" size={20} /></span><span className="label">Recently Played</span><Icon name="chevron" size={18} /></button>
            <button className="list-card" onClick={() => navigate('/all-songs')}><span className="list-icon"><Icon name="library" size={20} /></span><span className="label">All Songs <small>{songs ? songs.length : 0}</small></span><Icon name="chevron" size={18} /></button>
          </div>
          <button className="import-button" onClick={() => setShowImport(true)}><Icon name="plus" size={20} /> Import Songs</button>
        </>
      )}

      {showImport && <ImportModal categories={categories || []} onCreateCategory={createCategory} onImported={() => {}} onClose={() => setShowImport(false)} />}
    </div>
  );
}
