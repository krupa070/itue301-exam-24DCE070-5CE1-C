const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const ordersRouter = require('./routes/orders');
const MenuItem = require('./models/MenuItem');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/itue301_exam';

// Middleware
app.use(cors());
app.use(express.json());

// 1. Request logging middleware - runs for all incoming requests (success & failure)
app.use(requestLogger);

// API routes
app.use('/api/v1', ordersRouter);

// Endpoint to fetch menu items from MongoDB (or fallback to defaults if db is empty)
app.get('/api/v1/menu', async (req, res, next) => {
  try {
    const items = await MenuItem.find().lean();
    if (items && items.length > 0) {
      return res.status(200).json(items);
    }
    // Default starter menu items if DB hasn't been seeded yet
    const defaults = [
      { id: '1', name: 'Samosa', category: 'snack', price: 25.00, weightG: 100, caloriesPer100g: 260, available: true },
      { id: '2', name: 'Masala Chai', category: 'drink', price: 20.00, weightG: 150, caloriesPer100g: 50, available: true },
      { id: '3', name: 'Veg Thali', category: 'meal', price: 180.00, weightG: 450, caloriesPer100g: 150, available: true },
      { id: '4', name: 'Cold Coffee', category: 'drink', price: 80.00, weightG: 250, caloriesPer100g: 70, available: false },
      { id: '5', name: 'Paneer Pakoda', category: 'snack', price: 60.00, caloriesPer100g: 220, available: true } // tests weightG absent (default 100)
    ];
    return res.status(200).json(defaults);
  } catch (err) {
    next(err);
  }
});

// Centralized error handling middleware - must be registered after all routes
app.use(errorHandler);

// Only listen if this file is run directly (not imported during automated tests)
if (require.main === module) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log(`Connected to MongoDB at ${MONGODB_URI}`);
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err.message);
      // Still listen so API endpoints work even if MongoDB is starting up
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT} (without MongoDB)`);
      });
    });
}

module.exports = app;
