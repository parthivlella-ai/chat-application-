const errorHandler = (err, req, res, next) => {
  // Log to server console for debugging
  console.error('[Error Details]:', err);

  const statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected server error occurred. Please try again.';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, message: 'Resource not found or invalid identifier.' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    return res.status(400).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered.`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors || {}).map((val) => val.message).join(', ');
    return res.status(400).json({ success: false, message: msg || 'Validation failed.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Authentication token has expired.' });
  }

  // Default server error
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { errorHandler };
