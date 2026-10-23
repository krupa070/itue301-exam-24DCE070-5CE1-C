/**
 * Request logging middleware.
 * Logs exactly one line per request in the format:
 * [METHOD] [PATH] [TIMESTAMP]
 * Runs for both successful and failed requests.
 */
function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${req.method}] [${req.originalUrl || req.url}] [${timestamp}]`);
  next();
}

module.exports = requestLogger;
