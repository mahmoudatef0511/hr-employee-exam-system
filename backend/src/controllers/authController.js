const authService = require('../services/authService');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const { validateRegistration, validateLogin } = require('../utils/validators');

async function register(req, res, next) {
  try {
    const errors = validateRegistration(req.body);
    if (errors.length) throw new AppError('Validation failed.', 400, errors);

    const { name, email, password } = req.body;
    const result = await authService.registerEmployee({ name, email, password });
    return success(res, 201, result, 'Registration successful.');
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body);
    if (errors.length) throw new AppError('Validation failed.', 400, errors);

    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return success(res, 200, result, 'Login successful.');
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    return success(res, 200, result, 'Access token refreshed.');
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user);
    return success(res, 200, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout };
