const mongoose = require('mongoose');
require('dotenv').config();

const MenuItem = require('./models/MenuItem');
const { formatValidationError } = require('./utils/validation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/itue301_exam';

async function seed() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');

    // Clear existing items in collection for clean demo
    await MenuItem.deleteMany({});
    console.log('Cleaned existing items.');

    // Step 2 & 3: Save one valid menu item and print/log the saved document
    console.log('\n--- 1. Saving Valid Menu Item ---');
    const validItem = new MenuItem({
      name: 'Samosa',
      price: 25.00,
      category: 'snack',
      available: true,
      caloriesPer100g: 260,
      weightG: 120
    });

    const savedItem = await validItem.save();
    console.log('Successfully saved valid menu item:');
    console.log(JSON.stringify(savedItem, null, 2));

    // Step 4 & 5: Attempt to save one intentionally invalid menu item, catch error, print formatted error
    console.log('\n--- 2. Attempting to Save Intentionally Invalid Menu Item ---');
    // Invalid: drink with weightG 650 (exceeds 500 max for drink), negative price, caloriesPer100g > 900
    const invalidItem = new MenuItem({
      name: 'Super Jumbo Shake with an Excessively Long Name Exceeding Fifty Characters Limit Easily Here',
      price: -15,
      category: 'drink',
      caloriesPer100g: 1200,
      weightG: 650
    });

    try {
      await invalidItem.save();
      console.warn('Warning: Invalid item was unexpectedly saved!');
    } catch (validationErr) {
      console.log('Caught expected validation error:');
      const formatted = formatValidationError(validationErr);
      console.log('Formatted Validation Error:');
      console.log(JSON.stringify(formatted, null, 2));
    }

  } catch (err) {
    console.error('Fatal error during seed execution:', err.message);
  } finally {
    // Step 6: Close MongoDB connection safely
    try {
      await mongoose.connection.close();
      console.log('\nMongoDB connection closed safely.');
    } catch (closeErr) {
      console.error('Error closing MongoDB connection:', closeErr.message);
    }
  }
}

seed();
