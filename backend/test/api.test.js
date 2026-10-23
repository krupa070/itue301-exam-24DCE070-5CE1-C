const http = require('http');
const assert = require('assert');
const app = require('../server');
const { formatValidationError } = require('../utils/validation');

function runRequest(server, options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body, rawBody: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting API & Backend Verification Tests ---\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

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

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`        ${err.message}`);
    }
  }

  try {
    // Test 1: POST /api/v1/orders with valid data
    let createdOrderId = null;
    await asyncTest('POST /api/v1/orders returns 201 with correct kcal calculation', async () => {
      const res = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: '/api/v1/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        itemName: 'Samosa',
        qty: 2,
        weightG: 150
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.itemName, 'Samosa');
      assert.strictEqual(res.body.qty, 2);
      assert.strictEqual(res.body.weightG, 150);
      // Samosa = 260 kcal / 100g -> 260 * 150 / 100 * 2 = 780
      assert.strictEqual(res.body.kcal, 780);
      assert(res.body.id, 'Expected an order ID');
      createdOrderId = res.body.id;
    });

    // Test 2: POST /api/v1/orders with defaults
    await asyncTest('POST /api/v1/orders applies default qty (1) and weightG (100)', async () => {
      const res = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: '/api/v1/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        itemName: 'Cold Coffee'
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.itemName, 'Cold Coffee');
      assert.strictEqual(res.body.qty, 1);
      assert.strictEqual(res.body.weightG, 100);
      // Cold Coffee = 70 kcal / 100g * 100 / 100 * 1 = 70
      assert.strictEqual(res.body.kcal, 70);
    });

    // Test 3: POST /api/v1/orders rejects invalid itemName with 400
    await asyncTest('POST /api/v1/orders rejects invalid itemName with 400 and error message', async () => {
      const res = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: '/api/v1/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        itemName: 'Burger',
        qty: 1
      });

      assert.strictEqual(res.status, 400);
      assert(res.body.error, 'Expected error field in response');
    });

    // Test 4: POST /api/v1/orders rejects invalid qty (out of range or non-integer)
    await asyncTest('POST /api/v1/orders rejects qty < 1, > 10, or decimal with 400', async () => {
      const resZero = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: '/api/v1/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { itemName: 'Samosa', qty: 0 });
      assert.strictEqual(resZero.status, 400);

      const resTwelve = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: '/api/v1/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { itemName: 'Samosa', qty: 12 });
      assert.strictEqual(resTwelve.status, 400);

      const resFloat = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: '/api/v1/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { itemName: 'Samosa', qty: 2.5 });
      assert.strictEqual(resFloat.status, 400);
    });

    // Test 5: POST /api/v1/orders rejects invalid weightG <= 0
    await asyncTest('POST /api/v1/orders rejects invalid weightG <= 0 with 400', async () => {
      const res = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: '/api/v1/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { itemName: 'Samosa', weightG: -50 });
      assert.strictEqual(res.status, 400);
    });

    // Test 6: GET /api/v1/orders
    await asyncTest('GET /api/v1/orders returns 200 and list of orders', async () => {
      const res = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: '/api/v1/orders',
        method: 'GET'
      });
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.body));
      assert(res.body.length >= 2);
    });

    // Test 7: GET /api/v1/orders/:id
    await asyncTest('GET /api/v1/orders/:id returns 200 for matching order, 404 for non-existent', async () => {
      const res = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: `/api/v1/orders/${createdOrderId}`,
        method: 'GET'
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.id, createdOrderId);

      const notFoundRes = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: '/api/v1/orders/nonexistent123',
        method: 'GET'
      });
      assert.strictEqual(notFoundRes.status, 404);
      assert(notFoundRes.body.error);
    });

    // Test 8: DELETE /api/v1/orders/:id
    await asyncTest('DELETE /api/v1/orders/:id deletes order and returns 200, or 404 if missing', async () => {
      const res = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: `/api/v1/orders/${createdOrderId}`,
        method: 'DELETE'
      });
      assert.strictEqual(res.status, 200);

      const againRes = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: `/api/v1/orders/${createdOrderId}`,
        method: 'DELETE'
      });
      assert.strictEqual(againRes.status, 404);
    });

    // Test 9: GET /api/v1/boom triggers centralized error handler with 500
    await asyncTest('GET /api/v1/boom returns 500 with exact JSON: { "error": "Something went wrong" }', async () => {
      const res = await runRequest(server, {
        hostname: 'localhost',
        port,
        path: '/api/v1/boom',
        method: 'GET'
      });
      assert.strictEqual(res.status, 500);
      assert.deepStrictEqual(res.body, { error: 'Something went wrong' });
    });

    // Test 10: formatValidationError unit test
    test('formatValidationError formats errors into plain object with details array', () => {
      const mockErr = {
        errors: {
          name: { message: 'Name cannot exceed 50 characters' },
          price: { message: 'Price must be at least 0' }
        }
      };
      const formatted = formatValidationError(mockErr);
      assert.strictEqual(formatted.error, 'Validation failed');
      assert(Array.isArray(formatted.details));
      assert.strictEqual(formatted.details.length, 2);
      assert.strictEqual(formatted.details[0].field, 'name');
      assert.strictEqual(formatted.details[0].message, 'Name cannot exceed 50 characters');
      assert.strictEqual(formatted.details[1].field, 'price');
    });

  } finally {
    server.close();
  }

  console.log(`\nTests Completed: ${passed}/${total} Passed.`);
  if (passed === total) {
    console.log('ALL TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
