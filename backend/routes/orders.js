const express = require('express');
const crypto = require('crypto');

const router = express.Router();

// Fixed calories per 100g for valid menu items
const MENU_CALORIES = {
  'Samosa': 260,
  'Masala Chai': 50,
  'Veg Thali': 150,
  'Cold Coffee': 70
};

// In-memory orders store
const orders = [];

/**
 * POST /api/v1/orders
 * Request body: { itemName, qty, weightG }
 */
router.post('/orders', (req, res) => {
  const { itemName } = req.body;
  let { qty, weightG } = req.body;

  // Validate itemName
  if (!itemName || typeof itemName !== 'string' || !(itemName in MENU_CALORIES)) {
    return res.status(400).json({
      error: `Invalid itemName. Must be one of: ${Object.keys(MENU_CALORIES).join(', ')}`
    });
  }

  // Handle qty: defaults to 1, otherwise must be whole integer 1..10
  if (qty === undefined || qty === null) {
    qty = 1;
  } else {
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > 10) {
      return res.status(400).json({
        error: 'Invalid qty. Quantity must be a whole integer from 1 through 10'
      });
    }
  }

  // Handle weightG: defaults to 100, otherwise must be finite number > 0
  if (weightG === undefined || weightG === null) {
    weightG = 100;
  } else {
    if (typeof weightG !== 'number' || !Number.isFinite(weightG) || weightG <= 0) {
      return res.status(400).json({
        error: 'Invalid weightG. Weight must be a finite number greater than 0'
      });
    }
  }

  const caloriesPer100g = MENU_CALORIES[itemName];
  const kcal = Math.round((caloriesPer100g * weightG / 100) * qty);
  const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

  const newOrder = {
    id,
    itemName,
    qty,
    weightG,
    kcal
  };

  orders.push(newOrder);

  return res.status(201).json(newOrder);
});

/**
 * GET /api/v1/orders
 */
router.get('/orders', (req, res) => {
  res.status(200).json(orders);
});

/**
 * GET /api/v1/orders/:id
 */
router.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({ error: `Order with id ${id} not found` });
  }

  res.status(200).json(order);
});

/**
 * DELETE /api/v1/orders/:id
 */
router.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Order with id ${id} not found` });
  }

  const deleted = orders.splice(index, 1)[0];
  res.status(200).json({ message: 'Order deleted successfully', order: deleted });
});

/**
 * GET /api/v1/boom
 * Deliberately throws an error to test centralized error handling
 */
router.get('/boom', (req, res, next) => {
  throw new Error('Boom! Centralized error test triggered.');
});

module.exports = router;
