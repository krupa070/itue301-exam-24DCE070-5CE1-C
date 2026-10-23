import React from 'react';

export default function Navbar({ activePage, setActivePage, cartCount }) {
  const navItems = [
    { id: 'menu', label: 'Menu', icon: '🍽️' },
    { id: 'order', label: `Order (${cartCount})`, icon: '🛒' },
    { id: 'specials', label: 'Specials', icon: '⭐' }
  ];

  return (
    <nav className="navbar">
      <div className="brand" id="brand-header">
        <div className="brand-logo-icon">🍽️</div>
        <div className="brand-text-container">
          <span className="brand-name">Campus Canteen</span>
          <span className="brand-tagline">Fresh Food & Nutritional Balance</span>
        </div>
      </div>
      <div className="nav-links">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            type="button"
            className={`nav-btn ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="nav-btn-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
