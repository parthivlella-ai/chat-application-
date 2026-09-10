const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'connectx_super_secret_jwt_key_2026_modern_realtime_chat',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

module.exports = { generateToken };
