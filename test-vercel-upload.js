/**
 * Test script for Vercel-compatible image upload
 * Tests the buffer-based upload to Cloudinary
 */

// Import cloudinary directly to test buffer upload
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test buffer upload function
const uploadBufferToCloudinary = async (buffer, filename) => {
  try {
    if (!buffer) return null;

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: `products/${filename}`,
          folder: 'bakingo-products',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error('Buffer upload error:', error);
    return null;
  }
};

async function testBufferUpload() {
  console.log('🧪 Testing Vercel-compatible buffer upload...');
  
  try {
    // Check if we have environment variables
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('❌ Cloudinary environment variables not set');
      console.log('Please check your .env.local file has:');
      console.log('- CLOUDINARY_CLOUD_NAME');
      console.log('- CLOUDINARY_API_KEY');
      console.log('- CLOUDINARY_API_SECRET');
      return;
    }

    console.log('✅ Environment variables found');
    console.log('🌤️  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

    // Test with a sample image if available
    const testImagePath = './public/images/chocolate.webp';
    
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found at:', testImagePath);
      console.log('Please ensure you have a test image to upload');
      return;
    }

    console.log('✅ Test image found');

    // Read image as buffer
    const imageBuffer = fs.readFileSync(testImagePath);
    const fileName = `test-upload-${Date.now()}.webp`;

    console.log('📤 Uploading buffer to Cloudinary...');
    console.log('📄 File size:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    
    const result = await uploadBufferToCloudinary(imageBuffer, fileName);
    
    if (result && result.secure_url) {
      console.log('✅ Buffer upload successful!');
      console.log('📸 Image URL:', result.secure_url);
      console.log('🆔 Public ID:', result.public_id);
      console.log('📁 Folder:', result.folder);
      console.log('📏 Dimensions:', `${result.width}x${result.height}`);
    } else {
      console.log('❌ Buffer upload failed - no result returned');
    }
    
  } catch (error) {
    console.error('❌ Buffer upload test failed:');
    console.error('Error:', error.message);
    if (error.http_code) {
      console.error('HTTP Code:', error.http_code);
    }
    if (error.error && error.error.message) {
      console.error('Cloudinary Error:', error.error.message);
    }
  }
}

// Run the test
testBufferUpload();
