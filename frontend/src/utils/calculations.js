/**
 * Calculates energy in whole kcal.
 * Formula: energy = Math.round(caloriesPer100g * (weightG ?? 100) / 100)
 * Uses 100g when weightG is absent. Handles optional values gracefully.
 */
export function calculateEnergy(caloriesPer100g, weightG) {
  const calories = Number(caloriesPer100g) || 0;
  const weight = (weightG !== undefined && weightG !== null && !isNaN(Number(weightG)))
    ? Number(weightG)
    : 100;

  return Math.round((calories * weight) / 100);
}

/**
 * Formats price in Indian Rupees with exactly two decimal places.
 * Example: 25 -> "₹25.00"
 */
export function formatRupees(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toFixed(2)}`;
}
