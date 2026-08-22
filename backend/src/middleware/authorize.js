const AppError = require('../utils/AppError');

// Usage: authorize('hr') or authorize('employee')
// Must run AFTER the authenticate middleware.
function authorize(...allowedTypes) {
  return (req, res, next) => {
    if (!req.user || !allowedTypes.includes(req.user.type)) {
      return next(new AppError('You do not have permission to access this resource.', 403));
    }
    next();
  };
}

module.exports = authorize;
