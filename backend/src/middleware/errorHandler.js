const { UniqueConstraintError, ValidationError } = require('sequelize');

// Centralized error handler. Keep messages generic for unexpected errors
// so we never leak internals (stack traces, SQL, etc.) to the client.
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error.';
  let errors = err.errors || null;

  if (err instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'A record with this value already exists.';
    errors = err.errors?.map((e) => e.message) || null;
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation failed.';
    errors = err.errors?.map((e) => e.message) || null;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token.';
  }

  if (!err.isOperational) {
    // Unexpected/programmer error — log full detail server-side only.
    console.error('Unexpected error:', err);
    if (statusCode === 500) {
      message = 'Internal server error.';
      errors = null;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

module.exports = errorHandler;
