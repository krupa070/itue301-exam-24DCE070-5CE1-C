import React from 'react';
import { calculateEnergy, formatRupees } from '../utils/calculations';

const ITEM_ICONS = {
  'Samosa': '🥟',
  'Masala Chai': '☕',
  'Veg Thali': '🍱',
  'Cold Coffee': '🧋',
  'Paneer Pakoda': '🧀'
};

const CATEGORY_ICONS = {
  'snack': '🍿',
  'meal': '🍛',
  'drink': '🥤'
};

export default function MenuCard({ item, onAddToCart }) {
  const {
    id,
    name,
    category = 'snack',
    price = 0,
    caloriesPer100g = 0,
    weightG,
    available = false
  } = item;

  // Task 1 requirement: energy = Math.round(caloriesPer100g * (weightG ?? 100) / 100)
  // Use 100g when weightG is absent; produces a whole number
  const energyKcal = calculateEnergy(caloriesPer100g, weightG);
  const displayWeight = (weightG !== undefined && weightG !== null) ? Number(weightG) : 100;
  const availabilityLabel = available ? 'Available' : 'Not Available';
  const itemIcon = ITEM_ICONS[name] || '🍽️';
  const categoryIcon = CATEGORY_ICONS[category] || '🏷️';

  return (
    <div
      className={`menu-card ${!available ? 'unavailable' : ''}`}
      id={`menu-card-${id}`}
    >
      <div className="card-top-accent" />

      <div className="card-header">
        <div className="card-title-group">
          <div className="food-icon-badge" aria-hidden="true">
            {itemIcon}
          </div>
          <div>
            <h3 className="card-title">{name}</h3>
            <span className="category-tag">
              {categoryIcon} {category}
            </span>
          </div>
        </div>
      </div>

      <div className="card-details">
        <div className="detail-item">
          <span className="detail-label">Price</span>
          <span className="detail-value price-value">{formatRupees(price)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Portion</span>
          <span className="detail-value">{displayWeight} g</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Energy</span>
          <span className="detail-value energy-value">🔥 {energyKcal} kcal</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Status</span>
          <span className={`badge ${available ? 'badge-available' : 'badge-unavailable'}`}>
            <span className="status-dot" /> {availabilityLabel}
          </span>
        </div>
      </div>

      <div className="card-footer">
        <span className="detail-label per-100g-label">
          Per 100g: <strong>{caloriesPer100g} kcal</strong>
        </span>
        <button
          id={`btn-add-${id}`}
          type="button"
          className="btn-add"
          disabled={!available}
          onClick={() => onAddToCart(item)}
        >
          {available ? '➕ Add to Order' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}
