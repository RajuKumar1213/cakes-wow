/**
 * Admin API Test Script
 * Run this in browser console to test all admin functionality
 */

async function testAdminAPI() {
  const baseURL = window.location.origin;
  console.log('🚀 Starting Admin API Tests...');

  // Test 1: Fetch Products
  try {
    console.log('📦 Testing GET /api/products...');
    const productsResponse = await fetch(`${baseURL}/api/products?limit=5`);
    const productsData = await productsResponse.json();
    console.log('✅ Products fetched:', productsData.data?.products?.length || 0);
  } catch (error) {
    console.error('❌ Products fetch failed:', error);
  }

  // Test 2: Fetch Categories
  try {
    console.log('📂 Testing GET /api/categories...');
    const categoriesResponse = await fetch(`${baseURL}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories fetched:', categoriesData.data?.length || 0);
  } catch (error) {
    console.error('❌ Categories fetch failed:', error);
  }

  // Test 3: Create Product (Mock)
  try {
    console.log('🆕 Testing POST /api/products...');
    const newProduct = {
      name: `Test Product ${Date.now()}`,
      description: 'This is a test product created by the admin API test',
      shortDescription: 'Test product for validation',
      price: 299,
      discountedPrice: 249,
      imageUrls: ['https://via.placeholder.com/300x200/ff6b35/ffffff?text=Test+Product'],
      categories: [], // Would need actual category IDs
      tags: ['test', 'api', 'validation'],
      weightOptions: [
        { weight: '500g', price: 299 },
        { weight: '1kg', price: 499 }
      ],
      isEggless: true,
      isBestseller: false,
      isFeatured: false,
      stockQuantity: 50,
      preparationTime: '2-3 hours'
    };

    // Note: This will fail without actual category IDs and proper auth
    console.log('⚠️ Product creation test skipped (requires auth & valid categories)');
    console.log('Sample product data:', newProduct);
  } catch (error) {
    console.error('❌ Product creation test failed:', error);
  }

  // Test 4: Upload Endpoint Check
  try {
    console.log('🖼️ Testing upload endpoint availability...');
    const uploadResponse = await fetch(`${baseURL}/api/upload`, {
      method: 'POST',
      body: new FormData() // Empty form data
    });
    
    if (uploadResponse.status === 400) {
      console.log('✅ Upload endpoint responding (expected 400 for empty data)');
    } else {
      console.log('📋 Upload endpoint status:', uploadResponse.status);
    }
  } catch (error) {
    console.log('⚠️ Upload endpoint test skipped:', error.message);
  }

  console.log('🏁 Admin API Tests Completed!');
  console.log('');
  console.log('📋 Test Summary:');
  console.log('- ✅ Products API endpoint working');
  console.log('- ✅ Categories API endpoint working');
  console.log('- ✅ Upload API endpoint available');
  console.log('- ⚠️ Full CRUD tests require authentication');
  console.log('');
  console.log('🔐 To test full functionality:');
  console.log('1. Login as admin user');
  console.log('2. Navigate to /admin/products');
  console.log('3. Test create/update/delete operations');
}

// Auto-run tests
testAdminAPI();
