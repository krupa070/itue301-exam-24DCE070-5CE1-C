import React, { useState } from 'react';
import MenuCard from '../components/MenuCard';

export default function MenuPage({
  menuItems,
  customerName,
  setCustomerName,
  onAddToCart,
  alertMessage,
  onCloseAlert,
  totals = { itemCount: 0, totalPrice: 0, totalEnergy: 0 }
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Items', icon: '🍽️' },
    { id: 'snack', label: 'Snacks', icon: '🍿' },
    { id: 'meal', label: 'Meals', icon: '🍛' },
    { id: 'drink', label: 'Drinks', icon: '🥤' }
  ];

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category === selectedCategory);

  const caloriePercentage = Math.min(Math.round((totals.totalEnergy / 1000) * 100), 100);
  const isNearLimit = totals.totalEnergy > 800;

  return (
    <div className="menu-page">
      {/* Alert banner for Calorie limit or errors */}
      {alertMessage && (
        <div className="alert-banner alert-danger" id="alert-banner">
          <div className="alert-content">
            <span className="alert-icon">⚠️</span>
            <span>{alertMessage}</span>
          </div>
          <button
            type="button"
            className="alert-close-btn"
            id="close-alert-btn"
            onClick={onCloseAlert}
            aria-label="Close alert"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulsing-green-dot" /> Kitchen Live & Cooking
          </div>
          <h1 className="hero-title">Welcome to Campus Canteen</h1>
          <p className="hero-subtitle">
            Delicious wholesome meals crafted for campus life. Choose your favorites and monitor your energy with our 1000 kcal Smart Cart!
          </p>
          <div className="hero-features">
            <span className="feature-pill">⚡ Fast Counter Pickup</span>
            <span className="feature-pill">🥗 Fresh Ingredients</span>
            <span className="feature-pill">🔥 1000 kcal Max Guard</span>
          </div>
        </div>

        {/* Live Cart Calorie Gauge Widget */}
        <div className="live-calorie-widget">
          <div className="widget-header">
            <span className="widget-title">🔥 Live Calorie Meter</span>
            <span className="widget-badge">{totals.itemCount} items</span>
          </div>
          <div className="widget-energy-value">
            {totals.totalEnergy} <span className="kcal-unit">/ 1000 kcal</span>
          </div>
          <div className="widget-progress-bg">
            <div
              className={`widget-progress-fill ${isNearLimit ? 'limit-warning' : ''}`}
              style={{ width: `${caloriePercentage}%` }}
            />
          </div>
          <span className="widget-footer-note">
            {1000 - totals.totalEnergy > 0
              ? `${1000 - totals.totalEnergy} kcal headroom remaining`
              : 'Maximum calorie limit reached'}
          </span>
        </div>
      </div>

      {/* Customer Name bar */}
      <div className="customer-bar">
        <div className="customer-input-group">
          <span className="input-avatar">👤</span>
          <label htmlFor="customer-name-input">Customer Name:</label>
          <input
            id="customer-name-input"
            type="text"
            className="customer-input"
            placeholder="e.g. Krupa Masura..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div className="order-for-text" id="order-for-display">
          Order for: {customerName ? customerName : 'Guest'}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="category-filters-bar">
        <span className="filter-label">Filter by:</span>
        <div className="filter-pills">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render menu items grid with stable, unique keys */}
      <div className="menu-grid">
        {filteredItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
