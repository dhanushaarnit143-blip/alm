// backend/config/db.js
const dns = require('dns');
const mongoose = require('mongoose');

// In local development on Windows, fallback to public DNS if ISP blocks SRV records
if (process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch {}
}

/**
 * Helper to mask sensitive credentials in MongoDB connection URI for safe logging.
 * Example: mongodb+srv://myuser:secret123@cluster.mongodb.net -> mongodb+srv://myuser:****@cluster.mongodb.net
 */
const maskMongoUri = (uri) => {
  if (!uri) return 'UNDEFINED';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, '$1****$3');
};

/**
 * Production-ready MongoDB Connection Manager with retry logic for Mongoose v8.
 *
 * CRITICAL DEPLOYMENT NOTE FOR RENDER & MONGODB ATLAS:
 * Render backend web services run on dynamic IPs that change frequently.
 * If your connection fails or times out with MongooseServerSelectionError,
 * you MUST go to MongoDB Atlas -> Security -> Network Access -> Add IP Address
 * -> Click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0) -> Confirm.
 * Without 0.0.0.0/0, Atlas will block Render's inbound connection requests!
 */
const connectDB = async (retries = 5, delay = 5000) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('================================================================');
    console.error('❌ [DATABASE CRITICAL ERROR] MONGO_URI environment variable is NOT set!');
    console.error('   Please define MONGO_URI in your .env file or Render Environment Dashboard.');
    console.error('   Format: mongodb+srv://<username>:<encoded_password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority');
    console.error('================================================================');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return;
  }

  const maskedUri = maskMongoUri(uri);

  // Setup connection event listeners
  mongoose.connection.on('connected', () => {
    console.log(`📡 [MongoDB Event] Connection established to host: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`💥 [MongoDB Event] Runtime connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  [MongoDB Event] Mongoose disconnected from MongoDB.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 [MongoDB Event] Mongoose reconnected to MongoDB.');
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔌 [MongoDB] Connection attempt ${attempt}/${retries} to: ${maskedUri}`);

      // Modern Mongoose v8 connection options
      // (useNewUrlParser & useUnifiedTopology are deprecated and default in v8)
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000, // Timeout after 8 seconds of failing to select server
        socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
        autoIndex: process.env.NODE_ENV !== 'production' // Don't build indexes in production
      });

      console.log('================================================================');
      console.log(`✅ [MongoDB] Successfully connected to Database: "${conn.connection.name}"`);
      console.log(`   Host: ${conn.connection.host}`);
      console.log(`   Port: ${conn.connection.port}`);
      console.log(`   State: Connected (readyState: ${conn.connection.readyState})`);
      console.log('================================================================');
      return conn;
    } catch (error) {
      console.error('----------------------------------------------------------------');
      console.error(`❌ [MongoDB] Connection attempt ${attempt}/${retries} failed!`);
      console.error(`   Error Name:    ${error.name}`);
      console.error(`   Error Message: ${error.message}`);

      // Specific diagnostics for common Atlas & Render failure causes
      if (error.name === 'MongoServerSelectionError' || error.message.includes('Server selection timed out')) {
        console.error('\n🔍 [DIAGNOSIS]: Server Selection Timeout!');
        console.error('   👉 Cause 1: IP Access Blocked. Render uses dynamic IPs.');
        console.error('      FIX: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Select "Allow Access from Anywhere" (0.0.0.0/0).');
        console.error('   👉 Cause 2: Incorrect Cluster Hostname in MONGO_URI.');
      } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
        console.error('\n🔍 [DIAGNOSIS]: Authentication Failed!');
        console.error('   👉 Cause: Username or Password incorrect, or password contains unencoded special characters.');
        console.error('      FIX: Special characters in Atlas password must be URL-encoded (e.g., @ -> %40, # -> %23, / -> %2F).');
      } else if (error.name === 'MongoParseError') {
        console.error('\n🔍 [DIAGNOSIS]: Malformed Connection String!');
        console.error('   👉 Cause: Invalid URI format or unescaped characters in MONGO_URI.');
      }
      console.error('----------------------------------------------------------------');

      if (attempt < retries) {
        console.log(`⏳ Waiting ${delay / 1000} seconds before retrying...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(`🚨 [MongoDB] All ${retries} connection attempts exhausted.`);
        console.error('   Server will remain running to serve health checks and retry on subsequent requests.');
      }
    }
  }
};

connectDB.connectDB = connectDB;
connectDB.maskMongoUri = maskMongoUri;
module.exports = connectDB;
