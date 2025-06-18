// Test Cloudinary upload functionality
import { uploadToCloudinary } from './src/helpers/uploadOnCloudinary.js';

async function testImageUpload() {
  try {
    console.log('🧪 Testing Cloudinary upload...');
    
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGaC7dOAAAAABJRU5ErkJggg==';
    const base64Data = testImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('📊 Test image buffer size:', imageBuffer.length, 'bytes');
    
    const result = await uploadToCloudinary({
      buffer: imageBuffer,
      folder: 'test-uploads',
      public_id: `test-${Date.now()}`,
    });
    
    if (result && result.secure_url) {
      console.log('✅ Upload successful!');
      console.log('📎 Image URL:', result.secure_url);
    } else {
      console.log('❌ Upload failed - no result or URL');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Upload test failed:', error);
    return null;
  }
}

// Run the test
testImageUpload();
