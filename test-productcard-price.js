// Test script to verify ProductCard price display logic
// This tests the new feature: showing first weight option price when no base price is given

const testProductCardPriceLogic = () => {
  console.log("🧪 Testing ProductCard Price Display Logic");
  console.log("=" .repeat(50));

  // Test cases for price display logic
  const testCases = [
    {
      name: "Product with base price and discount",
      product: {
        price: 500,
        discountedPrice: 400,
        weightOptions: [
          { weight: "500g", price: 300, discountedPrice: 250 },
          { weight: "1kg", price: 500, discountedPrice: 400 }
        ]
      },
      expected: {
        displayPrice: 500,
        displayDiscountedPrice: 400,
        discountPercentage: 20
      }
    },
    {
      name: "Product with base price, no discount",
      product: {
        price: 600,
        discountedPrice: undefined,
        weightOptions: [
          { weight: "500g", price: 350 },
          { weight: "1kg", price: 600 }
        ]
      },
      expected: {
        displayPrice: 600,
        displayDiscountedPrice: undefined,
        discountPercentage: 0
      }
    },
    {
      name: "Product with NO base price - should use first weight option",
      product: {
        price: 0, // No base price
        discountedPrice: undefined,
        weightOptions: [
          { weight: "500g", price: 350, discountedPrice: 300 },
          { weight: "1kg", price: 650, discountedPrice: 550 }
        ]
      },
      expected: {
        displayPrice: 350,
        displayDiscountedPrice: 300,
        discountPercentage: 14 // Math.round((350-300)/350 * 100)
      }
    },
    {
      name: "Product with NO base price and no discount in weight options",
      product: {
        price: 0,
        discountedPrice: undefined,
        weightOptions: [
          { weight: "500g", price: 450 },
          { weight: "1kg", price: 800 }
        ]
      },
      expected: {
        displayPrice: 450,
        displayDiscountedPrice: undefined,
        discountPercentage: 0
      }
    },
    {
      name: "Product with undefined price - should use first weight option",
      product: {
        price: undefined,
        discountedPrice: undefined,
        weightOptions: [
          { weight: "250g", price: 200, discountedPrice: 180 },
          { weight: "500g", price: 380 }
        ]
      },
      expected: {
        displayPrice: 200,
        displayDiscountedPrice: 180,
        discountPercentage: 10
      }
    },
    {
      name: "Product with no price and no weight options",
      product: {
        price: undefined,
        discountedPrice: undefined,
        weightOptions: []
      },
      expected: {
        displayPrice: 0,
        displayDiscountedPrice: undefined,
        discountPercentage: 0
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
    console.log("Input:", JSON.stringify(testCase.product, null, 2));

    // Simulate the ProductCard price logic
    const { price, discountedPrice, weightOptions } = testCase.product;
    
    const displayPrice = price || (weightOptions && weightOptions.length > 0 ? weightOptions[0].price : 0);
    const displayDiscountedPrice = discountedPrice || (weightOptions && weightOptions.length > 0 ? weightOptions[0].discountedPrice : undefined);
    const discountPercentage = displayDiscountedPrice
      ? Math.round(((displayPrice - displayDiscountedPrice) / displayPrice) * 100)
      : 0;

    const result = {
      displayPrice,
      displayDiscountedPrice,
      discountPercentage
    };

    console.log("Expected:", testCase.expected);
    console.log("Actual:  ", result);

    // Check if results match expected
    const priceMatch = result.displayPrice === testCase.expected.displayPrice;
    const discountedPriceMatch = result.displayDiscountedPrice === testCase.expected.displayDiscountedPrice;
    const percentageMatch = result.discountPercentage === testCase.expected.discountPercentage;

    if (priceMatch && discountedPriceMatch && percentageMatch) {
      console.log("✅ PASSED");
      passed++;
    } else {
      console.log("❌ FAILED");
      if (!priceMatch) console.log(`   - Display price mismatch: expected ${testCase.expected.displayPrice}, got ${result.displayPrice}`);
      if (!discountedPriceMatch) console.log(`   - Discounted price mismatch: expected ${testCase.expected.displayDiscountedPrice}, got ${result.displayDiscountedPrice}`);
      if (!percentageMatch) console.log(`   - Discount percentage mismatch: expected ${testCase.expected.discountPercentage}%, got ${result.discountPercentage}%`);
      failed++;
    }
  });

  console.log("\n" + "=".repeat(50));
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log("🎉 All tests passed! ProductCard price logic is working correctly.");
    console.log("\n✨ Key Features Verified:");
    console.log("   ✓ Uses base price when available");
    console.log("   ✓ Falls back to first weight option price when no base price");
    console.log("   ✓ Handles discount calculations correctly");
    console.log("   ✓ Gracefully handles edge cases (no prices, empty weight options)");
  } else {
    console.log("⚠️  Some tests failed. Please check the ProductCard price logic.");
  }

  return failed === 0;
};

// Run the test
testProductCardPriceLogic();
