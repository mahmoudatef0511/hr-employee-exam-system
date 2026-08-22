// Small helpers to keep response shapes consistent across the API.

function success(res, statusCode, data, message = 'Success') {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function error(res, statusCode, message = 'Something went wrong', errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

module.exports = { success, error };
