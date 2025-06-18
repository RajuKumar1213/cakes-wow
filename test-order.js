// Test photo cake order creation with real image data
const testPhotoCakeOrder = async () => {
  try {
    console.log('🧪 Testing photo cake order creation...');
    
    // Simple 1x1 pixel red PNG in base64
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGaC7dOAAAAABJRU5ErkJggg==';
    
    const orderData = {
      items: [
        {
          productId: 'test-photo-cake-123',
          name: 'Test Photo Cake',
          price: 1000,
          quantity: 1,
          selectedWeight: '1 Kg',
          imageUrl: 'https://example.com/cake.jpg',
          customization: {
            type: 'photo-cake',
            message: 'Happy Birthday Test!',
            imageData: testImageBase64
          }
        }
      ],
      customerInfo: {
        fullName: 'Test User',
        mobileNumber: '9876543210',
        email: 'test@example.com',
        deliveryDate: '2025-06-20',
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
      notes: 'Test order',
      selectedAddOns: [],
      addOnQuantities: {}
    };

    console.log('📤 Sending test order...');
    
    const response = await fetch('http://localhost:3001/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Order created successfully!');
      console.log('📋 Order ID:', result.order?.orderId);
      console.log('🍰 First item customization:', result.order?.items?.[0]?.customization);
    } else {
      console.log('❌ Order creation failed:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testPhotoCakeOrder();
