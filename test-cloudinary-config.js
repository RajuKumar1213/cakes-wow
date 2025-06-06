// Test Cloudinary configuration for Vercel deployment
require('dotenv').config({ path: '.env.local' });
const { v2: cloudinary } = require('cloudinary');

// Configure cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔍 Testing Cloudinary Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('- CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

// Check if all required variables are present
const hasAllVars = process.env.CLOUDINARY_CLOUD_NAME && 
                   process.env.CLOUDINARY_API_KEY && 
                   process.env.CLOUDINARY_API_SECRET;

if (!hasAllVars) {
  console.log('\n❌ Missing Cloudinary environment variables!');
  console.log('\nFor Vercel deployment, add these in your Vercel dashboard:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings > Environment Variables');
  console.log('4. Add these variables:');
  console.log('   - CLOUDINARY_CLOUD_NAME = dykqvsfd1');
  console.log('   - CLOUDINARY_API_KEY = 825164168851237');
  console.log('   - CLOUDINARY_API_SECRET = 6Hcp0uviKRLGb0SVE8USJ-Wqfzk');
  console.log('5. Redeploy your application');
  process.exit(1);
}

// Test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    console.log('\n🧪 Testing Cloudinary connection...');
    
    // Try to get account details (this will fail if credentials are wrong)
    const result = await cloudinary.api.ping();
    
    if (result && result.status === 'ok') {
      console.log('✅ Cloudinary connection successful!');
      console.log('📊 Account details:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        status: result.status
      });
    } else {
      console.log('❌ Cloudinary connection failed');
    }
  } catch (error) {
    console.log('❌ Cloudinary connection error:', error.message);
    
    if (error.message.includes('api_key')) {
      console.log('\n🔧 FIX: This error means your API credentials are not properly set in Vercel');
      console.log('Follow the steps above to add environment variables in your Vercel dashboard');
    }
  }
}

if (hasAllVars) {
  testCloudinaryConnection();
}
