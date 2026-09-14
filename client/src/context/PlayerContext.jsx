import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { db, getSetting, setSetting } from '../db/db';

const PlayerContext = createContext(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

// Playback modes for when a track finishes.
const REPEAT_MODES = ['off', 'all', 'one'];

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const currentObjectUrl = useRef(null);

  const [queue, setQueue] = useState([]); // array of song objects (metadata only)
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // off | all | one
  const [autoplay, setAutoplay] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Load persisted preferences once.
  useEffect(() => {
    (async () => {
      setShuffle((await getSetting('shuffle', false)) === true);
      setRepeatMode(await getSetting('repeatMode', 'off'));
      setAutoplay((await getSetting('autoplay', true)) !== false);
    })();
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
  }, []);

  const revokeCurrentUrl = () => {
    if (currentObjectUrl.current) {
      URL.revokeObjectURL(currentObjectUrl.current);
      currentObjectUrl.current = null;
    }
  };

  const updateMediaSession = useCallback((song) => {
    if (!('mediaSession' in navigator) || !song) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: song.title || 'Unknown',
      artist: song.artist || 'Bhakti Sangeet',
      album: song.categoryId || '',
      artwork: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    });
  }, []);

  const playIndex = useCallback(
    async (index, list) => {
      const activeList = list || queue;
      if (index < 0 || index >= activeList.length) return;
      const song = activeList[index];
      setLoadError(null);

      try {
        const fullSong = await db.songs.get(song.id);
        if (!fullSong || !fullSong.audioBlob) {
          setLoadError('This song could not be found in your library.');
          return;
        }
        revokeCurrentUrl();
        const url = URL.createObjectURL(fullSong.audioBlob);
        currentObjectUrl.current = url;

        const audio = audioRef.current;
        audio.src = url;
        setCurrentIndex(index);
        setCurrentSong(fullSong);
        updateMediaSession(fullSong);

        await audio.play().catch(() => {});
        setIsPlaying(true);

        await db.songs.update(fullSong.id, {
          playCount: (fullSong.playCount || 0) + 1,
          lastPlayedAt: Date.now()
        });
      } catch (err) {
        setLoadError('Unable to play this song.');
      }
    },
    [queue, updateMediaSession]
  );

  const playSongList = useCallback(
    (songs, startIndex = 0) => {
      setQueue(songs);
      playIndex(startIndex, songs);
    },
    [playIndex]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    revokeCurrentUrl();
    setQueue([]);
    setCurrentIndex(-1);
    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsFullPlayerOpen(false);
    setLoadError(null);
  }, []);

  const pickNextIndex = useCallback(
    (fromIndex) => {
      if (queue.length === 0) return -1;
      if (shuffle) {
        if (queue.length === 1) return 0;
        let next = fromIndex;
        while (next === fromIndex) {
          next = Math.floor(Math.random() * queue.length);
        }
        return next;
      }
      const next = fromIndex + 1;
      if (next >= queue.length) {
        return repeatMode === 'all' ? 0 : -1;
      }
      return next;
    },
    [queue, shuffle, repeatMode]
  );

  const playNext = useCallback(() => {
    const next = pickNextIndex(currentIndex);
    if (next >= 0) playIndex(next);
  }, [currentIndex, pickNextIndex, playIndex]);

  const playPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    let prev = currentIndex - 1;
    if (prev < 0) prev = repeatMode === 'all' ? queue.length - 1 : 0;
    playIndex(prev);
  }, [currentIndex, queue.length, repeatMode, playIndex]);

  const seekTo = useCallback((time) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const next = !prev;
      setSetting('shuffle', next);
      return next;
    });
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      const idx = REPEAT_MODES.indexOf(prev);
      const next = REPEAT_MODES[(idx + 1) % REPEAT_MODES.length];
      setSetting('repeatMode', next);
      return next;
    });
  }, []);

  const toggleAutoplay = useCallback(() => {
    setAutoplay((prev) => {
      const next = !prev;
      setSetting('autoplay', next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback(
    async (songId) => {
      const song = await db.songs.get(songId);
      if (!song) return;
      await db.songs.update(songId, { isFavorite: !song.isFavorite });
      if (currentSong && currentSong.id === songId) {
        setCurrentSong({ ...currentSong, isFavorite: !song.isFavorite });
      }
    },
    [currentSong]
  );

  // Wire up native audio events.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      if (autoplay) {
        const next = pickNextIndex(currentIndex);
        if (next >= 0) {
          playIndex(next);
        } else {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => setLoadError('This song format may not be supported.');

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, [repeatMode, autoplay, currentIndex, pickNextIndex, playIndex]);

  // Android lock-screen / headset media controls.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return undefined;
    navigator.mediaSession.setActionHandler('play', togglePlayPause);
    navigator.mediaSession.setActionHandler('pause', togglePlayPause);
    navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
    navigator.mediaSession.setActionHandler('nexttrack', playNext);
    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      } catch {
        /* no-op */
      }
    };
  }, [togglePlayPause, playPrevious, playNext]);

  useEffect(() => () => revokeCurrentUrl(), []);

  const value = {
    queue,
    currentIndex,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isFullPlayerOpen,
    shuffle,
    repeatMode,
    autoplay,
    loadError,
    setIsFullPlayerOpen,
    playSongList,
    playIndex,
    togglePlayPause,
    closePlayer,
    playNext,
    playPrevious,
    seekTo,
    toggleShuffle,
    cycleRepeatMode,
    toggleAutoplay,
    toggleFavorite,
    clearLoadError: () => setLoadError(null)
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
