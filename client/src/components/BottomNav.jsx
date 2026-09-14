import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const TABS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/categories', label: 'Categories', icon: 'grid' },
  { to: '/favorites', label: 'Favorites', icon: 'heart' },
  { to: '/youtube', label: 'YouTube', icon: 'play' },
  { to: '/settings', label: 'Settings', icon: 'settings' }
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon name={tab.icon} size={20} className="nav-icon" />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
