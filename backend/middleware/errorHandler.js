/**
 * Centralized error handling middleware.
 * Unexpected errors return HTTP 500 with { "error": "Something went wrong" }.
 * Never exposes stack traces or internal details in the response.
 */
function errorHandler(err, req, res, next) {
  // Log internal error for server monitoring/debugging
  console.error('Unhandled server error:', err && err.message ? err.message : err);

  // Return standard HTTP 500 without leaking stack traces or internal error details
  res.status(500).json({ error: 'Something went wrong' });
}

module.exports = errorHandler;
