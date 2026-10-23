import React from 'react';
import { formatRupees } from '../utils/calculations';

const ITEM_ICONS = {
  'Samosa': '🥟',
  'Masala Chai': '☕',
  'Veg Thali': '🍱',
  'Cold Coffee': '🧋',
  'Paneer Pakoda': '🧀'
};

export default function OrderPage({
  cartItems,
  customerName,
  setCustomerName,
  onRemoveItem,
  totals,
  onNavigateToMenu
}) {
  const { itemCount, totalPrice, totalEnergy } = totals;
  const isOverHalf = totalEnergy > 500;
  const isNearLimit = totalEnergy > 850;
  const energyPercentage = Math.min(Math.round((totalEnergy / 1000) * 100), 100);

  return (
    <div className="order-page">
      {/* Customer Name bar */}
      <div className="customer-bar">
        <div className="customer-input-group">
          <span className="input-avatar">👤</span>
          <label htmlFor="order-customer-name-input">Customer Name:</label>
          <input
            id="order-customer-name-input"
            type="text"
            className="customer-input"
            placeholder="e.g. Krupa Masura..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div className="order-for-text" id="order-for-summary">
          Order for: {customerName ? customerName : 'Guest'}
        </div>
      </div>

      <div className="order-layout">
        {/* Cart Items List / Table */}
        <div className="cart-table-container">
          <div className="table-header-row">
            <h2>🛒 Current Tray ({cartItems.length} lines)</h2>
            <span className="table-header-sub">Review your meal before checkout</span>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-cart-icon">🍽️</div>
              <p className="empty-cart-title">Your tray is currently empty!</p>
              <p className="empty-cart-desc">
                Select your favorite snacks, wholesome thalis, and beverages from the canteen menu.
              </p>
              <button
                type="button"
                className="btn-browse-menu"
                onClick={onNavigateToMenu}
              >
                ✨ Browse Canteen Menu
              </button>
            </div>
          ) : (
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Price</th>
                  <th>Energy</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((cartLine) => {
                  const icon = ITEM_ICONS[cartLine.name] || '🍽️';
                  return (
                    <tr key={cartLine.cartId} id={`cart-row-${cartLine.cartId}`}>
                      <td>
                        <div className="cart-item-name-cell">
                          <span className="cart-item-icon">{icon}</span>
                          <div>
                            <span className="cart-item-title">{cartLine.name}</span>
                            <span className="cart-item-weight">{cartLine.weightG}g portion</span>
                          </div>
                        </div>
                      </td>
                      <td className="cart-price-cell">
                        {formatRupees(cartLine.price)}
                      </td>
                      <td className="cart-energy-cell">
                        🔥 {cartLine.energyKcal} kcal
                      </td>
                      <td>
                        <button
                          id={`btn-remove-${cartLine.cartId}`}
                          type="button"
                          className="btn-remove"
                          onClick={() => onRemoveItem(cartLine.cartId)}
                        >
                          🗑️ Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Summary & Derived Totals */}
        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Receipt Summary</h3>
            <span className="receipt-badge">Canteen Tray</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">Items Count:</span>
            <span className="summary-val" id="summary-item-count">{itemCount}</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">Total Energy:</span>
            <span className="summary-val energy-val-highlight" id="summary-total-energy">
              {totalEnergy} kcal <span className="kcal-max-label">/ 1000 kcal</span>
            </span>
          </div>

          <div className="energy-progress-box">
            <div className="progress-labels">
              <span className="progress-sub-label">Nutritional Allowance</span>
              <span className="progress-percentage-label">{energyPercentage}%</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className={`progress-bar-fill ${isNearLimit ? 'limit-warning' : isOverHalf ? 'warning' : ''}`}
                style={{ width: `${energyPercentage}%` }}
              />
            </div>
            <span className="energy-remaining-note">
              {1000 - totalEnergy > 0
                ? `✨ ${1000 - totalEnergy} kcal available before reaching limit`
                : '⚠️ Exact 1000 kcal threshold reached!'}
            </span>
          </div>

          <div className="summary-row summary-total">
            <span className="summary-label">Total Price:</span>
            <span className="summary-val total-price-val" id="summary-total-price">
              {formatRupees(totalPrice)}
            </span>
          </div>

          <div className="canteen-guarantee">
            <span>🛡️ Campus Nutritional Standards Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
