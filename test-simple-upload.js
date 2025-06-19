// Simple test for photo cake image upload
const { uploadToCloudinary } = require('./src/helpers/uploadOnCloudinary.ts');

async function testImageUpload() {
  try {
    console.log('🧪 Testing Cloudinary upload...');
    
    // Test Cloudinary configuration first
    console.log('📋 Environment check:', {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
    });
    
    // Simple 1x1 pixel red PNG in base64
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGaC7dOAAAAABJRU5ErkJggg==';
    const base64Data = testImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('📊 Test image buffer size:', imageBuffer.length, 'bytes');
    
    const result = await uploadToCloudinary({
      buffer: imageBuffer,
      folder: 'photo-cakes-test',
      public_id: `test-photo-cake-${Date.now()}`,
    });
    
    if (result && result.secure_url) {
      console.log('✅ Upload successful!');
      console.log('🔗 Image URL:', result.secure_url);
      console.log('🆔 Public ID:', result.public_id);
      return result.secure_url;
    } else {
      console.log('❌ Upload failed');
      console.log('📄 Result:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    console.error('📄 Full error:', error);
    return null;
  }
}

// Run the test
testImageUpload().then(result => {
  if (result) {
    console.log('\n🎉 Photo cake image upload test completed successfully!');
  } else {
    console.log('\n💥 Photo cake image upload test failed!');
  }
  process.exit(0);
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});
