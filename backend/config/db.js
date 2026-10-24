const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongod = null;
let cachedPromise = null;

const connectDB = async () => {
  // Reuse existing connection if alive
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (cachedPromise) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    try {
      const uri = process.env.MONGODB_URI;
      const isCloudProduction =
        (!!process.env.VERCEL && process.env.VERCEL_ENV !== 'development') ||
        (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV);

      // 1. If explicit non-local MONGODB_URI is provided, try external connection
      if (uri && !uri.includes('127.0.0.1:27017') && !uri.includes('localhost:27017')) {
        try {
          console.log(`Connecting to external MongoDB...`);
          const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
          });
          console.log(`✅ External MongoDB Connected successfully: ${conn.connection.host}`);
          return conn;
        } catch (err) {
          console.error(`⚠️ External MongoDB connection failed: ${err.message}`);
          if (isCloudProduction) {
            throw err;
          }
        }
      } else if (!isCloudProduction) {
        // 2. Try default local MongoDB port first (local dev / vercel dev only)
        try {
          const localUri = uri || 'mongodb://127.0.0.1:27017/sadguru_mart';
          console.log(`Checking local MongoDB at: ${localUri}...`);
          const conn = await mongoose.connect(localUri, {
            serverSelectionTimeoutMS: 1500,
          });
          console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
          return conn;
        } catch (err) {
          console.log('🔄 No external MongoDB service detected. Initializing embedded persistent MongoDB engine...');
        }
      }

      // 3. Fallback to Embedded MongoDB only in local environment
      if (isCloudProduction) {
        throw new Error(
          'MONGODB_URI is required in cloud production / Vercel. Please set MONGODB_URI (e.g. MongoDB Atlas) in your environment variables.'
        );
      }

      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.join(__dirname, '../data/db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      // Clean up stale lock files from previous abnormal termination if not actively held
      ['mongod.lock', 'WiredTiger.lock'].forEach((file) => {
        const lockFile = path.join(dbPath, file);
        if (fs.existsSync(lockFile)) {
          try {
            fs.unlinkSync(lockFile);
          } catch (lockErr) {
            // If file is actively locked by a running process, ignore
          }
        }
      });

      mongod = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: 'wiredTiger',
          dbName: 'sadguru_mart',
          args: ['--syncdelay=1'],
        },
      });

      const memoryUri = mongod.getUri('sadguru_mart');
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Embedded Persistent MongoDB Engine started and connected: ${memoryUri}`);
      console.log(`📁 Database storage path: ${dbPath}`);
      return conn;
    } catch (err) {
      console.error(`❌ Database connection failed: ${err.message}`);
      cachedPromise = null;
      throw err;
    }
  })();

  return cachedPromise;
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.db.admin().command({ fsync: 1 });
      } catch (fsyncErr) {
        // ignore if already shutting down
      }
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
    cachedPromise = null;
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
};

module.exports = { connectDB, disconnectDB };
