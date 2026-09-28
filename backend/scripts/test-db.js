// backend/scripts/test-db.js
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const maskMongoUri = (uri) => {
  if (!uri) return 'UNDEFINED';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, '$1****$3');
};

async function testDatabaseConnection() {
  console.log('================================================================');
  console.log('🧪 [DB TEST] MongoDB Atlas Connection Diagnostics');
  console.log('================================================================');

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ FAIL: MONGO_URI is not set in backend/.env');
    console.error('   Please add MONGO_URI to backend/.env and rerun this script.');
    process.exit(1);
  }

  console.log(`📍 Testing URI: ${maskMongoUri(uri)}`);
  console.log('⏳ Connecting to MongoDB...');

  const startTime = Date.now();

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000 // 10 second timeout for diagnostic script
    });

    const elapsedMs = Date.now() - startTime;
    console.log(`\n✅ SUCCESS: Connected to MongoDB in ${elapsedMs}ms!`);
    console.log(`   Host:     ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);

    // Ping the admin database to verify query capability
    console.log('📡 Sending Ping to MongoDB...');
    const adminDb = conn.connection.db.admin();
    const pingResult = await adminDb.ping();
    console.log('✅ Ping Response:', pingResult);

    // List collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📁 Collections Found (${collections.length}):`, collections.map((c) => c.name).join(', ') || '(none yet)');

    console.log('\n================================================================');
    console.log('🎉 Your MongoDB Atlas connection is 100% verified and working!');
    console.log('   You can now safely push your code or trigger deployment.');
    console.log('================================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error(`\n❌ FAIL: Connection failed after ${elapsedMs}ms.`);
    console.error(`   Error Name:    ${error.name}`);
    console.error(`   Error Message: ${error.message}`);

    console.log('\n🔧 TROUBLESHOOTING CHECKLIST:');
    if (error.name === 'MongoServerSelectionError' || error.message.includes('Server selection timed out')) {
      console.log('   1. IP Access List (Most Likely):');
      console.log('      - Log into MongoDB Atlas (https://cloud.mongodb.com)');
      console.log('      - Go to "Network Access" under "Security"');
      console.log('      - Make sure your current IP address (or 0.0.0.0/0 for anywhere) is active.');
      console.log('   2. Network / DNS: Verify your network allows outbound traffic to Atlas.');
    } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.log('   1. Password URL Encoding:');
      console.log('      - If password contains special characters (@, #, :, /, ?, %, etc.), encode them!');
      console.log('      - Example: "@" -> "%40", "#" -> "%23"');
      console.log('   2. Database User:');
      console.log('      - Ensure the user exists in Atlas -> Database Access.');
      console.log('      - Verify the user has readWrite permissions for the target database.');
    } else if (error.name === 'MongoParseError') {
      console.log('   1. Connection String Syntax:');
      console.log('      - Ensure no spaces or illegal characters exist in the URI.');
      console.log('      - Ensure it begins with mongodb+srv:// or mongodb://');
    }

    console.log('================================================================');
    process.exit(1);
  }
}

testDatabaseConnection();
