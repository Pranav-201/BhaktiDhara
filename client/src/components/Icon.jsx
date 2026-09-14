import React from 'react';

const paths = {
  home: 'M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5h-5.1v-5.8H8.6v5.8H3.5a.5.5 0 0 1-.5-.5v-9.2Z',
  grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  heart: 'M20.8 8.6c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.8 4.8 0 0 1 12 5.4a4.8 4.8 0 0 1 8.8 3.2Z',
  play: 'm8 5 11 7-11 7V5Z',
  settings: 'M4 7h16M4 17h16M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  search: 'm20 20-4.4-4.4m1.4-5.1a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z',
  music: 'M9 18.5a3 3 0 1 1-2-2.8V6l11-2v11.5a3 3 0 1 1-2-2.8V7.1L9 8.4v10.1Z',
  clock: 'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 4v4.5l3 1.8',
  library: 'M5 5.5h14v13H5v-13Zm3 3h8m-8 3h8m-8 3h5',
  chevron: 'm9 18 6-6-6-6',
  more: 'M12 7.5h.01M12 12h.01m-.01 4.5h.01',
  close: 'm7 7 10 10M17 7 7 17',
  back: 'm15 18-6-6 6-6M9 12h11',
  previous: 'M6 5v14m12-14-8 7 8 7V5Z',
  next: 'M18 5v14m-12-14 8 7-8 7V5Z',
  pause: 'M8 6v12m8-12v12',
  plus: 'M12 5v14M5 12h14',
  temple: 'm3.5 10 8.5-6 8.5 6M5 10v8.5h14V10M9 18.5v-5h6v5',
  lotus: 'M12 20c-4.5 0-7.5-2.7-8.5-6.5 3.3.2 5.7 1.3 7 3.4-.8-3.2-2.3-5.5-4.4-7 3.5.2 5.4 1.9 6 5.1.6-3.2 2.5-4.9 6-5.1-2.1 1.5-3.6 3.8-4.4 7 1.3-2.1 3.7-3.2 7-3.4C19.5 17.3 16.5 20 12 20Z'
};

export default function Icon({ name, size = 20, filled = false, className = '' }) {
  return <svg className={`app-icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.music} /></svg>;
}
