const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to server console for debugging
  console.error('[Error Details]:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found or invalid identifier.';
    return res.status(404).json({ success: false, message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered.`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Authentication token has expired.' });
  }

  // Default server error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'An unexpected server error occurred. Please try again.',
  });
};

module.exports = { errorHandler };
