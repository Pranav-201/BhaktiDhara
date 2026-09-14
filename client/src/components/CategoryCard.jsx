import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CategoryCard({ category, count }) {
  const navigate = useNavigate();
  return (
    <button className="category-card" onClick={() => navigate(`/category/${category.id}`)}>
      <div className="name">{category.name}</div>
      <div className="count">{count} {count === 1 ? 'song' : 'songs'}</div>
    </button>
  );
}
