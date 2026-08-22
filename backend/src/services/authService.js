const { HR, Employee } = require('../models');
const AppError = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../utils/tokenUtils');

// Maps a user "type" string to its Sequelize model.
function modelFor(type) {
  if (type === 'hr') return HR;
  if (type === 'employee') return Employee;
  throw new AppError('Invalid user type.', 400);
}

async function registerEmployee({ name, email, password }) {
  const existing = await Employee.findOne({ where: { email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const employee = await Employee.create({ name, email, password });
  return issueTokens(employee, 'employee');
}

// Tries HR first, then Employee, since login is shared between both types.
async function login({ email, password }) {
  let user = await HR.findOne({ where: { email } });
  let type = 'hr';

  if (!user) {
    user = await Employee.findOne({ where: { email } });
    type = 'employee';
  }

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isValid = await user.validatePassword(password);
  if (!isValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  return issueTokens(user, type);
}

async function issueTokens(user, type) {
  const payload = { id: user.id, type };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: user.toSafeJSON()
  };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new AppError('Refresh token is required.', 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const Model = modelFor(decoded.type);
  const user = await Model.findByPk(decoded.id);

  // The stored token must match exactly — this is what lets logout
  // invalidate a refresh token immediately.
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Refresh token is no longer valid.', 401);
  }

  const accessToken = generateAccessToken({ id: user.id, type: decoded.type });
  return { accessToken };
}

async function logout({ id, type }) {
  const Model = modelFor(type);
  const user = await Model.findByPk(id);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
}

module.exports = {
  registerEmployee,
  login,
  refresh,
  logout,
  modelFor
};
