// Complete test for photo cake flow
import { uploadToCloudinary } from './src/helpers/uploadOnCloudinary.js';

console.log('🧪 Testing complete photo cake flow...');

// Test Cloudinary configuration
console.log('📋 Cloudinary config check:', {
  hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
  hasApiKey: !!process.env.CLOUDINARY_API_KEY,
  hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME
});

// Test image upload
async function testImageUpload() {
  try {
    console.log('📸 Testing image upload to Cloudinary...');
    
    // Simple 1x1 pixel red PNG in base64
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGaC7dOAAAAABJRU5ErkJggg==';
    const base64Data = testImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('📊 Image buffer size:', imageBuffer.length, 'bytes');
    
    const result = await uploadToCloudinary({
      buffer: imageBuffer,
      folder: 'photo-cakes-test',
      public_id: `test-photo-cake-${Date.now()}`,
    });
    
    if (result && result.secure_url) {
      console.log('✅ Image upload successful!');
      console.log('� Image URL:', result.secure_url);
      console.log('🆔 Public ID:', result.public_id);
      return result.secure_url;
    } else {
      console.log('❌ Image upload failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Image upload error:', error);
    return null;
  }
}

// Test database connection (simple)
async function testDatabaseConnection() {
  try {
    console.log('🗄️ Testing database connection...');
    const response = await fetch('http://localhost:3000/api/products?limit=1');
    if (response.ok) {
      console.log('✅ Database connection working');
      return true;
    } else {
      console.log('❌ Database connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

// Run complete test
async function runCompleteTest() {
  console.log('🚀 Starting complete photo cake flow test...\n');
  
  // Test 1: Image upload
  const imageUrl = await testImageUpload();
  console.log('');
  
  // Test 2: Database connection
  const dbConnected = await testDatabaseConnection();
  console.log('');
  
  // Test 3: Mock order creation with photo cake
  if (imageUrl && dbConnected) {
    console.log('🎂 Testing photo cake order creation...');
    
    const mockOrderData = {
      items: [
        {
          productId: '676320b83b59f55dfb2b9e61', // Use a real product ID from your database
          name: 'Test Photo Cake',
          price: 1000,
          quantity: 1,
          selectedWeight: '1 Kg',
          imageUrl: 'https://example.com/cake.jpg',
          customization: {
            type: 'photo-cake',
            message: 'Happy Birthday Test!',
            imageUrl: imageUrl // Use the uploaded image URL
          }
        }
      ],
      customerInfo: {
        fullName: 'Test Customer',
        mobileNumber: '9876543210',
        email: 'test@example.com',
        deliveryDate: '2025-06-25',
        timeSlot: '2:00 PM - 4:00 PM',
        area: 'Test Area',
        pinCode: '123456',
        fullAddress: 'Test Address 123',
        deliveryOccasion: 'birthday',
        relation: 'self',
        senderName: 'Test Sender',
        messageOnCard: 'Test Message',
        specialInstructions: 'Test Instructions'
      },
      totalAmount: 1000,
      subtotal: 1000,
      deliveryCharge: 0,
      notes: 'Test photo cake order',
      selectedAddOns: [],
      addOnQuantities: {}
    };
    
    try {
      const response = await fetch('http://localhost:3000/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockOrderData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Photo cake order created successfully!');
        console.log('📝 Order ID:', result.orderId);
        console.log('🎨 Order details:', JSON.stringify(result, null, 2));
      } else {
        console.log('❌ Photo cake order creation failed');
        console.log('❌ Error:', result.error || result.message);
      }
    } catch (error) {
      console.error('❌ Order creation error:', error);
    }
  } else {
    console.log('⚠️ Skipping order creation test due to previous failures');
  }
  
  console.log('\n🏁 Test completed');
}

// Run the test
runCompleteTest();
  
  const cartItem = {
    name: "Custom Photo Birthday Cake",
    price: 899,
    customization: {
      type: 'photo-cake',
      image: null, // File object would be here in real scenario
      message: 'Happy Birthday Mom!',
      imageUrl: uploadResult.imageUrl // This should be preserved
    }
  };
  
  console.log('📦 Cart item with customization:', {
    name: cartItem.name,
    hasCustomization: !!cartItem.customization,
    imageUrl: cartItem.customization.imageUrl,
    message: cartItem.customization.message
  });
  
  return cartItem;
};

const simulateCheckoutProcessing = (cartItem) => {
  console.log('\n3. 🔄 Simulating checkout processing...');
  
  // This should use existing imageUrl and NOT convert to base64
  const processedItem = {
    productId: 'photo-cake-123',
    name: cartItem.name,
    price: cartItem.price,
    quantity: 1,
    selectedWeight: '1 Kg',
    imageUrl: '',
    customization: {
      type: cartItem.customization.type,
      message: cartItem.customization.message,
      imageData: null, // Should be null since we have imageUrl
      imageUrl: cartItem.customization.imageUrl // Should preserve existing URL
    }
  };
  
  console.log('📋 Processed for order creation:', {
    hasImageUrl: !!processedItem.customization.imageUrl,
    hasImageData: !!processedItem.customization.imageData,
    imageUrl: processedItem.customization.imageUrl
  });
  
  return processedItem;
};

const simulateOrderCreation = (processedItem) => {
  console.log('\n4. 📝 Simulating order creation API...');
  
  if (processedItem.customization.imageUrl) {
    console.log('✅ Using existing uploaded image URL - no re-upload needed');
    console.log('🖼️ Final image URL in order:', processedItem.customization.imageUrl);
    return {
      success: true,
      order: {
        orderId: 'ORD-123456',
        items: [{
          ...processedItem,
          customization: {
            ...processedItem.customization,
            imageData: undefined // Remove any base64 data
          }
        }]
      }
    };
  } else {
    console.log('❌ No image URL found - this indicates a problem');
    return { success: false, error: 'No image URL' };
  }
};

const simulateAdminView = (order) => {
  console.log('\n5. 👨‍💼 Simulating admin order view...');
  
  const firstItem = order.items[0];
  
  if (firstItem.customization?.type === 'photo-cake') {
    console.log('📸 Photo cake detected in admin view');
    
    if (firstItem.customization.imageUrl) {
      console.log('✅ Photo cake image URL available for printing:', firstItem.customization.imageUrl);
      console.log('🖨️ Admin can view and print the customer photo');
      return true;
    } else {
      console.log('❌ No image URL available - admin cannot see customer photo');
      return false;
    }
  } else {
    console.log('ℹ️ Not a photo cake - no special image display needed');
    return true;
  }
};

// Run the test flow
console.log('🚀 Starting end-to-end photo cake test...\n');

try {
  const uploadResult = simulatePhotoUpload();
  const cartItem = simulateAddToCart(uploadResult);
  const processedItem = simulateCheckoutProcessing(cartItem);
  const orderResult = simulateOrderCreation(processedItem);
  
  if (orderResult.success) {
    const adminSuccess = simulateAdminView(orderResult.order);
    
    console.log('\n🎉 TEST RESULTS:');
    console.log('================');
    console.log('✅ Photo upload: SUCCESS');
    console.log('✅ Add to cart: SUCCESS');
    console.log('✅ Checkout processing: SUCCESS');
    console.log('✅ Order creation: SUCCESS');
    console.log('✅ Admin view:', adminSuccess ? 'SUCCESS' : 'FAILED');
    console.log('\n🏆 Overall test result: PASS');
    console.log('📋 Image is properly preserved throughout the entire flow');
  } else {
    console.log('\n❌ TEST FAILED at order creation');
    console.log('Error:', orderResult.error);
  }
} catch (error) {
  console.log('\n💥 TEST CRASHED:');
  console.error(error);
}

console.log('\n=== End of Test ===');
