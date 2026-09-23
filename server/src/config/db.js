const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connectx';
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] MongoDB Connected to: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (err) {
    console.warn(`[Database] Local MongoDB unavailable (${err.message}). Initializing In-Memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] In-Memory MongoDB active at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Critical DB connection error:', memErr);
      process.exit(1);
    }
  }

  // Handle connection events
  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected.');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB error:', err);
  });
};

module.exports = connectDB;
