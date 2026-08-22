const { verifyAccessToken } = require('../utils/tokenUtils');
const AppError = require('../utils/AppError');

// Verifies the access token and attaches { id, type } to req.user.
// Does NOT check role — see authorize.js for that.
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token missing.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, type: decoded.type };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired.', 401));
    }
    return next(new AppError('Invalid access token.', 401));
  }
}

module.exports = authenticate;
