// Test script to verify Firebase Admin SDK setup
// Run with: node test-firebase-admin.js

const admin = require('firebase-admin');

async function testFirebaseAdmin() {
  console.log('\n🔍 Testing Firebase Admin SDK Setup...\n');
  
  // Check environment variables
  console.log('1. Checking environment variables...');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!projectId) {
    console.error('❌ FIREBASE_PROJECT_ID is missing');
    return false;
  }
  console.log('✅ FIREBASE_PROJECT_ID:', projectId);
  
  if (!clientEmail) {
    console.error('❌ FIREBASE_CLIENT_EMAIL is missing');
    return false;
  }
  console.log('✅ FIREBASE_CLIENT_EMAIL:', clientEmail);
  
  if (!privateKey) {
    console.error('❌ FIREBASE_PRIVATE_KEY is missing');
    return false;
  }
  console.log('✅ FIREBASE_PRIVATE_KEY is present');
  
  // Check if private key has correct format
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    console.error('❌ FIREBASE_PRIVATE_KEY format is incorrect (should start with -----BEGIN PRIVATE KEY-----)');
    return false;
  }
  
  // Try to initialize Firebase Admin
  console.log('\n2. Initializing Firebase Admin SDK...');
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      })
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    return false;
  }
  
  // Try to create a test custom token
  console.log('\n3. Testing custom token generation...');
  try {
    const testToken = await admin.auth().createCustomToken('test-user-id');
    console.log('✅ Custom token created successfully');
    console.log('   Token preview:', testToken.substring(0, 50) + '...');
  } catch (error) {
    console.error('❌ Failed to create custom token:', error.message);
    return false;
  }
  
  console.log('\n✅ All tests passed! Firebase Admin SDK is properly configured.\n');
  return true;
}

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

testFirebaseAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
