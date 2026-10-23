/**
 * Formats a Mongoose ValidationError into a clean, standard plain JavaScript object.
 * Output structure:
 * {
 *   error: "Validation failed",
 *   details: [
 *     { field: "price", message: "Price is required" },
 *     ...
 *   ]
 * }
 */
function formatValidationError(err) {
  if (!err) {
    return { error: 'Validation failed', details: [] };
  }

  const details = [];

  if (err.errors && typeof err.errors === 'object') {
    for (const key of Object.keys(err.errors)) {
      const item = err.errors[key];
      details.push({
        field: key,
        message: item.message || String(item)
      });
    }
  } else if (err.message) {
    details.push({
      field: 'general',
      message: err.message
    });
  }

  return {
    error: 'Validation failed',
    details
  };
}

module.exports = {
  formatValidationError
};
