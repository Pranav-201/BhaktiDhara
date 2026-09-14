import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import BottomNav from './components/BottomNav';
import MiniPlayer from './components/MiniPlayer';
import FullPlayer from './components/FullPlayer';

import Home from './pages/Home';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';
import PlaylistDetail from './pages/PlaylistDetail';
import Favorites from './pages/Favorites';
import RecentlyPlayed from './pages/RecentlyPlayed';
import AllSongs from './pages/AllSongs';
import YouTubePage from './pages/YouTube';
import Settings from './pages/Settings';

export default function App() {
  return (
    <PlayerProvider>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:id" element={<CategoryDetail />} />
          <Route path="/playlist/:id" element={<PlaylistDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/recent" element={<RecentlyPlayed />} />
          <Route path="/all-songs" element={<AllSongs />} />
          <Route path="/youtube" element={<YouTubePage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>

        <MiniPlayer />
        <FullPlayer />
        <BottomNav />
      </div>
    </PlayerProvider>
  );
}
