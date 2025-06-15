// Quick test script to test the products API
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

async function testProductAPI() {
  try {
    console.log('Testing Product API...');
    
    // Test GET first
    const getResponse = await fetch('http://localhost:3004/api/products');
    const getResult = await getResponse.json();
    console.log('GET /api/products status:', getResponse.status);
    console.log('GET result:', getResult.success ? 'Success' : 'Failed');
    
    // Get a category first
    const categoryResponse = await fetch('http://localhost:3004/api/categories');
    const categoryData = await categoryResponse.json();
    console.log('Categories available:', categoryData.success);
    
    if (!categoryData.success || !categoryData.data.length) {
      console.log('No categories available, cannot test product creation');
      return;
    }
    
    const categoryId = categoryData.data[0]._id;
    console.log('Using category ID:', categoryId);
    
    // Test POST with form data as URLSearchParams for debugging
    const formData = new URLSearchParams();
    formData.append('name', 'Test Product');
    formData.append('description', 'This is a test product description');
    formData.append('price', '25.99');
    formData.append('preparationTime', '4-6 hours');
    formData.append('isAvailable', 'true');
    formData.append('isBestseller', 'false');
    formData.append('isFeatured', 'false');
    
    // Add weight options
    formData.append('weightOptions[0][weight]', '1kg');
    formData.append('weightOptions[0][price]', '25.99');
    
    // Add category
    formData.append('categories', categoryId);
    
    console.log('Form data entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    console.log('Sending POST request...');
    const postResponse = await fetch('http://localhost:3004/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    
    const postResult = await postResponse.json();
    console.log('POST /api/products status:', postResponse.status);
    console.log('POST result:', JSON.stringify(postResult, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testProductAPI();
