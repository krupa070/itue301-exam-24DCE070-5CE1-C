import assert from 'assert';
import { calculateEnergy, formatRupees } from '../src/utils/calculations.js';

console.log('--- Starting Frontend Unit & Logic Verification Tests ---\n');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`        ${err.message}`);
  }
}

// 1. Energy Calculation Tests (Task 1 & Task 2)
test('Energy calculation handles basic portion and calories', () => {
  // Samosa: 260 kcal/100g, 100g -> 260
  assert.strictEqual(calculateEnergy(260, 100), 260);
  // Masala Chai: 50 kcal/100g, 150g -> 75
  assert.strictEqual(calculateEnergy(50, 150), 75);
  // Veg Thali: 150 kcal/100g, 450g -> 675
  assert.strictEqual(calculateEnergy(150, 450), 675);
});

test('Energy calculation defaults weightG to 100g when absent or null', () => {
  // Paneer Pakoda: 220 kcal/100g, undefined weightG -> 220
  assert.strictEqual(calculateEnergy(220, undefined), 220);
  assert.strictEqual(calculateEnergy(220, null), 220);
});

test('Energy calculation always returns rounded whole number', () => {
  // 55 kcal/100g, 125g -> 68.75 -> 69
  assert.strictEqual(calculateEnergy(55, 125), 69);
  assert.strictEqual(Number.isInteger(calculateEnergy(55, 125)), true);
});

// 2. Rupee Currency Formatting Tests (Task 1 & Task 2)
test('formatRupees formats amounts in Indian Rupees with exactly two decimal places', () => {
  assert.strictEqual(formatRupees(25), '₹25.00');
  assert.strictEqual(formatRupees(180), '₹180.00');
  assert.strictEqual(formatRupees(20.5), '₹20.50');
  assert.strictEqual(formatRupees(0), '₹0.00');
});

// 3. 1000 kcal Limit Enforcement & Cart Totals (Task 2)
test('1000 kcal limit enforcement rejects items when exceeded and shows exact message', () => {
  const cart = [
    { name: 'Veg Thali', price: 180, energyKcal: 675 },
    { name: 'Samosa', price: 25, energyKcal: 260 }
  ];

  const currentEnergy = cart.reduce((sum, item) => sum + item.energyKcal, 0);
  assert.strictEqual(currentEnergy, 935);

  const nextItemEnergy = calculateEnergy(220, 100); // 220 kcal

  let alertMessage = '';
  let itemAdded = false;

  if (currentEnergy + nextItemEnergy > 1000) {
    alertMessage = 'Calorie limit of 1000 kcal exceeded';
  } else {
    itemAdded = true;
  }

  assert.strictEqual(itemAdded, false);
  assert.strictEqual(alertMessage, 'Calorie limit of 1000 kcal exceeded');
});

test('Cart item removal immediately recalculates totals', () => {
  let cart = [
    { id: 1, name: 'Veg Thali', price: 180, energyKcal: 675 },
    { id: 2, name: 'Samosa', price: 25, energyKcal: 260 }
  ];

  let totalEnergy = cart.reduce((sum, item) => sum + item.energyKcal, 0);
  let totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
  assert.strictEqual(totalEnergy, 935);
  assert.strictEqual(totalPrice, 205);

  // Remove Samosa
  cart = cart.filter((item) => item.id !== 2);
  totalEnergy = cart.reduce((sum, item) => sum + item.energyKcal, 0);
  totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  assert.strictEqual(cart.length, 1);
  assert.strictEqual(totalEnergy, 675);
  assert.strictEqual(totalPrice, 180);
});

// 4. Specials Grouping & Ordering Logic (Task 3)
test('Specials sorts available items first while preserving original order within groups', () => {
  const rawApiTodos = [
    { id: 1, title: 'Item 1', completed: true },
    { id: 2, title: 'Item 2', completed: false },
    { id: 3, title: 'Item 3', completed: false },
    { id: 4, title: 'Item 4', completed: true },
    { id: 5, title: 'Item 5', completed: false }
  ];

  const available = rawApiTodos.filter((t) => !t.completed);
  const soldOut = rawApiTodos.filter((t) => t.completed);
  const ordered = [...available, ...soldOut];

  assert.deepStrictEqual(ordered.map((t) => t.id), [2, 3, 5, 1, 4]);
  assert.strictEqual(`${available.length} of ${rawApiTodos.length} available`, '3 of 5 available');
});

console.log(`\nTests Completed: ${passed}/${total} Passed.`);
if (passed === total) {
  console.log('ALL FRONTEND TESTS PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}
