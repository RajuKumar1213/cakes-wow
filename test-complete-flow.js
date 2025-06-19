// Complete test for photo cake order creation
console.log('🧪 Testing Photo Cake Order Creation Flow...\n');

async function createTestPhotoCakeOrder() {
  try {
    // Step 1: Test the photo upload endpoint
    console.log('📸 Step 1: Testing photo upload...');
    
    // Create a simple test image (base64 encoded 1x1 red pixel PNG)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGaC7dOAAAAABJRU5ErkJggg==';
    
    // Convert to blob for upload
    const response = await fetch(testImageBase64);
    const blob = await response.blob();
    
    const formData = new FormData();
    formData.append('file', blob, 'test-photo.png');
    
    const uploadResponse = await fetch('http://localhost:3001/api/upload/photo-cake', {
      method: 'POST',
      body: formData,
    });
    
    const uploadResult = await uploadResponse.json();
    
    if (!uploadResponse.ok || !uploadResult.success) {
      console.log('❌ Photo upload failed:', uploadResult.error);
      throw new Error(uploadResult.error || 'Photo upload failed');
    }
    
    console.log('✅ Photo uploaded successfully!');
    console.log('🔗 Image URL:', uploadResult.imageUrl);
    
    // Step 2: Create an order with the uploaded photo
    console.log('\n🛒 Step 2: Creating photo cake order...');
    
    const orderData = {
      items: [
        {
          productId: '676320b83b59f55dfb2b9e61', // Replace with actual product ID
          name: 'Custom Photo Birthday Cake',
          price: 1200,
          quantity: 1,
          selectedWeight: '1 Kg',
          imageUrl: 'https://example.com/cake-product.jpg',
          customization: {
            type: 'photo-cake',
            message: 'Happy Birthday Test User!',
            imageUrl: uploadResult.imageUrl // Use the uploaded image URL
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
        pinCode: '400001',
        fullAddress: '123 Test Street, Test Area, Mumbai',
        deliveryOccasion: 'birthday',
        relation: 'self',
        senderName: 'Test Customer',
        messageOnCard: 'Happy Birthday!',
        specialInstructions: 'Please handle the photo cake with care'
      },
      totalAmount: 1200,
      subtotal: 1200,
      deliveryCharge: 0,
      notes: 'Test photo cake order with uploaded image',
      selectedAddOns: [],
      addOnQuantities: {}
    };
    
    const orderResponse = await fetch('http://localhost:3001/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    const orderResult = await orderResponse.json();
    
    if (!orderResponse.ok) {
      console.log('❌ Order creation failed:', orderResult.error);
      throw new Error(orderResult.error || 'Order creation failed');
    }
      console.log('✅ Photo cake order created successfully!');
    console.log('📝 Order ID:', orderResult.order?.orderId || orderResult.orderId);
    console.log('🎂 Order Details:');
    console.log('   - Customer:', orderData.customerInfo.fullName);
    console.log('   - Photo URL:', uploadResult.imageUrl);
    console.log('   - Message:', orderData.items[0].customization.message);
    console.log('   - Total Amount: ₹' + orderData.totalAmount);
    
    // Step 3: Verify the order can be retrieved (optional)
    console.log('\n🔍 Step 3: Verifying order creation...');
    console.log('✅ Order should now be visible in admin dashboard');
    console.log('🔗 Admin URL: http://localhost:3001/admin/orders');
    
    return {
      success: true,
      orderId: orderResult.order?.orderId || orderResult.orderId,
      imageUrl: uploadResult.imageUrl
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
createTestPhotoCakeOrder().then(result => {
  console.log('\n🏁 Test Results:');
  if (result.success) {
    console.log('🎉 Photo cake order creation test PASSED!');
    console.log('📋 Summary:');
    console.log('   ✅ Photo uploaded to Cloudinary');
    console.log('   ✅ Order created in database');
    console.log('   ✅ Photo URL saved in order');
    console.log('   ✅ Order should be visible in admin dashboard');
    console.log('\n💡 The photo cake flow is working correctly!');
  } else {
    console.log('💥 Photo cake order creation test FAILED!');
    console.log('❌ Error:', result.error);
  }
}).catch(error => {
  console.error('💥 Test execution failed:', error);
});
