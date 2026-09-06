const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // 1. If explicit non-local MONGODB_URI is provided, try external connection
  if (uri && !uri.includes('127.0.0.1:27017') && !uri.includes('localhost:27017')) {
    try {
      console.log(`Connecting to external MongoDB at: ${uri}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ External MongoDB Connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ External MongoDB connection failed (${err.message}).`);
    }
  } else {
    // 2. Try default local MongoDB port first
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

  // 3. Fallback to Embedded MongoDB with permanent disk persistence
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dbPath = path.join(__dirname, '../data/db');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

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
  } catch (memErr) {
    console.error(`❌ Failed to start embedded MongoDB: ${memErr.message}`);
    process.exit(1);
  }
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
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
};

module.exports = { connectDB, disconnectDB };
