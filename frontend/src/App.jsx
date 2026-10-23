import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import MenuPage from './pages/MenuPage';
import OrderPage from './pages/OrderPage';
import SpecialsPage from './pages/SpecialsPage';
import { calculateEnergy } from './utils/calculations';

// Starter menu items with realistic data
const INITIAL_MENU_ITEMS = [
  {
    id: 'item-1',
    name: 'Samosa',
    category: 'snack',
    price: 25.0,
    caloriesPer100g: 260,
    weightG: 100,
    available: true
  },
  {
    id: 'item-2',
    name: 'Masala Chai',
    category: 'drink',
    price: 20.0,
    caloriesPer100g: 50,
    weightG: 150,
    available: true
  },
  {
    id: 'item-3',
    name: 'Veg Thali',
    category: 'meal',
    price: 180.0,
    caloriesPer100g: 150,
    weightG: 450,
    available: true
  },
  {
    id: 'item-4',
    name: 'Cold Coffee',
    category: 'drink',
    price: 80.0,
    caloriesPer100g: 70,
    weightG: 250,
    available: false // Test case for unavailable item
  },
  {
    id: 'item-5',
    name: 'Paneer Pakoda',
    category: 'snack',
    price: 60.0,
    caloriesPer100g: 220,
    // weightG omitted intentionally to test default 100g behavior
    available: true
  }
];

export default function App() {
  const [activePage, setActivePage] = useState('menu');
  const [customerName, setCustomerName] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');

  // Task 2 Requirement 6: Derive totals from cart data using useMemo
  const totals = useMemo(() => {
    let itemCount = 0;
    let totalPrice = 0;
    let totalEnergy = 0;

    for (const item of cartItems) {
      itemCount += 1;
      totalPrice += Number(item.price) || 0;
      totalEnergy += Number(item.energyKcal) || 0;
    }

    return {
      itemCount,
      totalPrice,
      totalEnergy
    };
  }, [cartItems]);

  // Task 2 Requirement 3 & 7: Add to cart with calorie check and availability check
  const handleAddToCart = (item) => {
    // Only available items can be added
    if (!item.available) {
      return;
    }

    const itemEnergy = calculateEnergy(item.caloriesPer100g, item.weightG);

    // Enforce 1000 kcal limit
    if (totals.totalEnergy + itemEnergy > 1000) {
      // Task 2 Requirement 7: Show exact required message
      setAlertMessage('Calorie limit of 1000 kcal exceeded');
      return;
    }

    // Clear any previous alert
    setAlertMessage('');

    // Add unique cart line item
    const cartLine = {
      cartId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      menuId: item.id,
      name: item.name,
      price: item.price,
      weightG: item.weightG ?? 100,
      caloriesPer100g: item.caloriesPer100g,
      energyKcal: itemEnergy
    };

    setCartItems((prev) => [...prev, cartLine]);
  };

  // Task 2 Requirement 8: Remove item and immediately recalculate totals
  const handleRemoveItem = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
    // Clear alert when space is made in cart
    setAlertMessage('');
  };

  return (
    <div className="app-container">
      {/* Client-side navigation: switches view without page reload */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        cartCount={totals.itemCount}
      />

      <main>
        {activePage === 'menu' && (
          <MenuPage
            menuItems={INITIAL_MENU_ITEMS}
            customerName={customerName}
            setCustomerName={setCustomerName}
            onAddToCart={handleAddToCart}
            alertMessage={alertMessage}
            onCloseAlert={() => setAlertMessage('')}
            totals={totals}
          />
        )}

        {activePage === 'order' && (
          <OrderPage
            cartItems={cartItems}
            customerName={customerName}
            setCustomerName={setCustomerName}
            onRemoveItem={handleRemoveItem}
            totals={totals}
            onNavigateToMenu={() => setActivePage('menu')}
          />
        )}

        {activePage === 'specials' && <SpecialsPage />}
      </main>
    </div>
  );
}
