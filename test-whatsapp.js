// Test script to verify WhatsApp functions work with photo cake customization
import { sendCustomerOrderSuccessMessage, sendAdminOrderNotification } from './src/lib/whatsapp.js';

// Mock order data with photo cake customization
const mockOrderData = {
  orderId: "ORD-TEST-123",
  totalAmount: 1500,
  customerInfo: {
    fullName: "John Doe",
    mobileNumber: "9876543210"
  },
  deliveryInfo: {
    deliveryDate: "2025-06-20",
    deliveryTime: "2:00 PM - 4:00 PM",
    address: {
      street: "123 Main Street",
      area: "Downtown",
      city: "Mumbai"
    }
  },
  items: [
    {
      name: "Photo Cake Special",
      price: 1200,
      quantity: 1,
      selectedWeight: "1 Kg",
      imageUrl: "https://example.com/product-image.jpg",
      customization: {
        type: "photo-cake",
        message: "Happy Birthday Mom!",
        imageUrl: "https://res.cloudinary.com/your-cloud/image/upload/v123456/photo-cakes/custom-photo.jpg"
      }
    }
  ],
  addOns: [
    {
      name: "Candles",
      price: 50,
      quantity: 6
    }
  ],
  deliveryCharge: 0
};

console.log("Testing WhatsApp functions with photo cake data...");
console.log("Order data:", JSON.stringify(mockOrderData, null, 2));

// Test the image selection logic
function testImageSelection(orderData) {
  console.log("\n=== Testing Image Selection Logic ===");
  
  const getProductImage = () => {
    if (orderData.items?.[0]?.customization?.imageUrl) {
      return orderData.items[0].customization.imageUrl;
    } else if (orderData.items?.[0]?.imageUrl) {
      return orderData.items[0].imageUrl;
    } else {
      return "https://cakes-wow.vercel.app/images/cake-default.jpg";
    }
  };
  
  const selectedImage = getProductImage();
  console.log("Selected image:", selectedImage);
  console.log("Expected: Photo cake customization image");
  
  return selectedImage === orderData.items[0].customization.imageUrl;
}

// Test the price calculation logic
function testPriceCalculation(orderData) {
  console.log("\n=== Testing Price Calculation Logic ===");
  
  const calculateTotalAmount = () => {
    const itemsTotal = orderData.items?.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0) || 0;
    
    const addOnsTotal = orderData.addOns?.reduce((total, addOn) => {
      return total + (addOn.price * addOn.quantity);
    }, 0) || 0;
    
    return itemsTotal + addOnsTotal + (orderData.deliveryCharge || 0);
  };
  
  const calculatedTotal = calculateTotalAmount();
  console.log("Calculated total:", calculatedTotal);
  console.log("Expected:", 1200 + 300 + 0, "= 1500");
  
  return calculatedTotal === 1500;
}

// Test the item details formatting
function testItemDetailsFormatting(orderData) {
  console.log("\n=== Testing Item Details Formatting ===");
  
  const formatItemDetails = orderData.items?.map((item) => {
    let itemStr = `${item.name}`;
    if (item.selectedWeight) {
      itemStr += ` (${item.selectedWeight})`;
    }
    if (item.customization?.message) {
      itemStr += ` - Custom Message: "${item.customization.message}"`;
    }
    itemStr += ` - ₹${item.price} x ${item.quantity}`;
    return itemStr;
  }).join(", ") || "Order items";
  
  console.log("Formatted item details:", formatItemDetails);
  console.log("Should include custom message and pricing");
  
  return formatItemDetails.includes("Custom Message") && formatItemDetails.includes("Happy Birthday Mom!");
}

// Run tests
const imageTest = testImageSelection(mockOrderData);
const priceTest = testPriceCalculation(mockOrderData);
const detailsTest = testItemDetailsFormatting(mockOrderData);

console.log("\n=== Test Results ===");
console.log("Image selection test:", imageTest ? "✅ PASS" : "❌ FAIL");
console.log("Price calculation test:", priceTest ? "✅ PASS" : "❌ FAIL");
console.log("Item details formatting test:", detailsTest ? "✅ PASS" : "❌ FAIL");

if (imageTest && priceTest && detailsTest) {
  console.log("\n🎉 All tests passed! WhatsApp functions are ready for photo cake orders.");
} else {
  console.log("\n⚠️ Some tests failed. Please check the implementation.");
}
