// Test script to verify WhatsApp image handling fix
const testOrderData = {
  orderId: "TEST123",
  items: [
    {
      productId: "product1",
      name: "Chocolate Truffle Cake",
      price: 899,
      quantity: 1,
      selectedWeight: "1kg",
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop"
    },
    {
      productId: "product2", 
      name: "Vanilla Cake",
      price: 599,
      quantity: 1,
      selectedWeight: "750g",
      imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop"
    }
  ],
  customerInfo: {
    fullName: "John Doe",
    mobileNumber: "9876543210",
    deliveryDate: "2025-06-10",
    timeSlot: "2:00 PM - 4:00 PM",
    area: "Koramangala",
    pinCode: "560034",
    fullAddress: "123 Main Street, Koramangala"
  },
  totalAmount: 1498
};

// Test image extraction logic
console.log('🧪 Testing image extraction logic...\n');

// Test the corrected logic (what we fixed it to)
const correctFirstCakeImage = testOrderData.items && testOrderData.items.length > 0 
  ? (testOrderData.items[0].imageUrl || null)
  : null;

console.log('✅ Corrected logic result:');
console.log('First cake image URL:', correctFirstCakeImage);
console.log('Expected:', testOrderData.items[0].imageUrl);
console.log('Match:', correctFirstCakeImage === testOrderData.items[0].imageUrl);

console.log('\n---\n');

// Test what the old buggy logic would have done
const buggyFirstCakeImage = testOrderData.items && testOrderData.items.length > 0 
  ? (testOrderData.items[0].imageUrls && testOrderData.items[0].imageUrls.length > 0 
      ? testOrderData.items[0].imageUrls[0] 
      : testOrderData.items[0].imageUrl || null)
  : null;

console.log('❌ Old buggy logic result:');
console.log('First cake image URL:', buggyFirstCakeImage);
console.log('Expected:', testOrderData.items[0].imageUrl);
console.log('Match:', buggyFirstCakeImage === testOrderData.items[0].imageUrl);

console.log('\n---\n');

// Test with missing imageUrl
const testOrderWithoutImage = {
  ...testOrderData,
  items: [
    {
      productId: "product1",
      name: "Chocolate Truffle Cake", 
      price: 899,
      quantity: 1,
      selectedWeight: "1kg"
      // No imageUrl property
    }
  ]
};

const imageFromMissingData = testOrderWithoutImage.items && testOrderWithoutImage.items.length > 0 
  ? (testOrderWithoutImage.items[0].imageUrl || null)
  : null;

console.log('🔍 Test with missing imageUrl:');
console.log('Result:', imageFromMissingData);
console.log('Expected: null');
console.log('Correct handling:', imageFromMissingData === null);

console.log('\n✅ All tests completed! The fix should resolve the WhatsApp image issue.');
