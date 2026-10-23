# ITUE301 Examination Findings & Architecture Report

Student ID: 24DCE070  
Batch: 5CE1-C  
Set: Set A  
Course: ITUE301 Full Stack Web Development  

---

## T1 — The Menu

- **What was wrong:**
  The menu component lacked comprehensive nutritional calculations, had inconsistent handling of missing portion weights, formatted currency using unformatted numbers without the Indian Rupee symbol (`₹`) or fixed decimals, used arbitrary list keys, and displayed hardcoded or inaccurate availability labels. Furthermore, the energy formula was not handling optional/undefined `weightG` values gracefully.

- **Why it mattered:**
  Customers saw inconsistent pricing displays (e.g., `25` instead of `₹25.00`), NaN or erroneous kcal counts when portion weights were omitted, and misleading availability statuses. Rendering items without stable unique keys caused unnecessary DOM re-renders and React reconciliation warnings in the browser console.

- **How I fixed it:**
  In [`frontend/src/utils/calculations.js`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/frontend/src/utils/calculations.js), implemented the required whole-number energy formula `energy = Math.round(caloriesPer100g * (weightG ?? 100) / 100)` ensuring a default of 100g when `weightG` is absent. Added `formatRupees(amount)` to enforce formatting with exactly two decimal places and the `₹` prefix. In [`frontend/src/components/MenuCard.jsx`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/frontend/src/components/MenuCard.jsx), bound all required props (`name`, `category`, `price`, `portion weight`, `energy`, and dynamic `Available` / `Not Available` labels based on `available === true`). In [`frontend/src/pages/MenuPage.jsx`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/frontend/src/pages/MenuPage.jsx), passed stable unique IDs (`item.id`) as keys.

---

## T2 — Routing and Order State

- **What was wrong:**
  Navigation across pages triggered full-page browser reloads, resetting client-side customer and cart states. Cart totals (item count, total price, and total energy) were maintained as duplicate, desynchronized state variables rather than derived values. There was no enforcement of the 1000 kcal safety limit, allowing unavailable items into orders, and item removal was either broken or caused stale-state discrepancies.

- **Why it mattered:**
  Full-page reloads degraded user experience and wiped out customer names and cart selections. Duplicate state variables risked drift and race conditions. Exceeding the 1000 kcal limit without the required alert failed nutritional requirements.

- **How I fixed it:**
  In [`frontend/src/App.jsx`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/frontend/src/App.jsx), built single-page client-side routing (`Navbar`, `activePage`) preserving global order and customer state across views. Applied `useMemo` to derive `itemCount`, `totalPrice`, and `totalEnergy` directly from `cartItems`. In `handleAddToCart`, strictly enforced the 1000 kcal ceiling; if adding an item causes total energy to exceed 1000 kcal, the item is rejected and the exact message `Calorie limit of 1000 kcal exceeded` is displayed. In [`frontend/src/pages/OrderPage.jsx`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/frontend/src/pages/OrderPage.jsx), rendered the active customer banner `Order for: <name>`, itemized cart lines with two-decimal ₹ prices and whole kcal, and wired instant item removal via `handleRemoveItem`.

---

## T3 — Specials Board API Consumption

- **What was wrong:**
  The Specials board failed to handle asynchronous fetch lifecycle states properly, suffered from duplicate network calls during React Strict Mode mounts, lacked HTTP status verification (treating HTTP 4xx/5xx as successful responses), had no partition ordering for available versus sold-out items, and lacked a working retry mechanism without reloading the entire window.

- **Why it mattered:**
  Users encountered blank screens or unhandled promise rejections on network hiccups. Sold-out items were interspersed randomly, and the required exact summary format `<n> of <total> available` was absent.

- **How I fixed it:**
  In [`frontend/src/pages/SpecialsPage.jsx`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/frontend/src/pages/SpecialsPage.jsx), implemented an isolated `useEffect` that triggers `fetchSpecials` exactly once on mount, using an `AbortController` cleanup to handle unmounts and prevent duplicate executions. Validated `response.ok` to treat any non-2xx status as an error. Parsed items and stably partitioned them into available items (`!completed`) followed by sold-out items (`completed === true`), preserving original API sequence within each group. Rendered the summary badge in the exact format: `<n> of <total> available`. Implemented separate `isLoading`, `error` (`Could not load specials`), and success states, with an in-page `Retry` button that re-executes the fetch without a page reload.

---

## T4 — Express Orders Service and Middleware

- **What was wrong:**
  The Express orders service lacked strict payload validation, permitted invalid or negative quantities/weights, lacked logging or logged in arbitrary unstructured formats, allowed unhandled route errors to leak server internals and stack traces, and lacked full CRUD endpoint support (`GET`, `POST`, `DELETE`, error test `/api/v1/boom`).

- **Why it mattered:**
  Invalid order data corrupted calculations, server errors could expose sensitive stack traces, and absent request logs prevented auditability.

- **How I fixed it:**
  In [`backend/routes/orders.js`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/backend/routes/orders.js), established calorie mappings for `Samosa` (260), `Masala Chai` (50), `Veg Thali` (150), and `Cold Coffee` (70). Validated that `itemName` matches valid menu items, `qty` defaults to 1 and must be an integer between 1 and 10, and `weightG` defaults to 100 and must be a finite number > 0. Valid requests return HTTP 201 with `{ id, itemName, qty, weightG, kcal }`, where `kcal = Math.round(caloriesPer100g * weightG / 100 * qty)`. Added `GET /api/v1/orders`, `GET /api/v1/orders/:id`, `DELETE /api/v1/orders/:id`, and `GET /api/v1/boom`. In [`backend/middleware/logger.js`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/backend/middleware/logger.js), implemented logging for every request in the exact format `[METHOD] [PATH] [TIMESTAMP]`. In [`backend/middleware/errorHandler.js`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/backend/middleware/errorHandler.js), registered centralized error handling returning HTTP 500 with `{ "error": "Something went wrong" }`.

---

## T5 — MongoDB and Mongoose Menu Data

- **What was wrong:**
  The Mongoose schema lacked Drink-specific weight bounds (allowing drink portions over 500g), did not enforce boundary constraints for `caloriesPer100g` (0–900) or `weightG` (1–2000), and lacked a clean validation formatter, which leaked verbose Mongoose internal error objects. Furthermore, the seed script lacked robust error handling, did not demonstrate both valid and invalid insertions, and failed to guarantee MongoDB connection closure.

- **Why it mattered:**
  Business constraints (e.g., beverages limited to 500g maximum) were violated, leading to inconsistent database states. Unformatted Mongoose errors leaked internal ODM details to callers.

- **How I fixed it:**
  In [`backend/models/MenuItem.js`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/backend/models/MenuItem.js), defined schema rules for `name` (required, trimmed, max 50), `price` (min 0), `category` (enum: snack, meal, drink; default snack), `available` (default true), `caloriesPer100g` (min 0, max 900), and `weightG` (default 100, min 1, max 2000). Implemented a custom document and update validator enforcing that when `category === 'drink'`, `weightG` must not exceed 500g. In [`backend/utils/validation.js`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/backend/utils/validation.js), built `formatValidationError(err)` returning `{ error: "Validation failed", details: [{ field, message }] }` as plain JS objects. In [`backend/seed.js`](file:///c:/Users/masur/OneDrive/Desktop/awdf_cie/backend/seed.js), configured connection via `process.env.MONGODB_URI`, successfully saved one valid menu item and printed the document, attempted saving an invalid item, printed the formatted validation error, and safely closed the connection in a `finally` block.
