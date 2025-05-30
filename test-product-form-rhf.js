// Product Form React Hook Form Test Script
// Run with: node test-product-form.js

const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const API_BASE = 'http://localhost:3002/api';

async function testProductAPI() {
  console.log('🧪 Testing Product Form with React Hook Form Implementation');
  console.log('='.repeat(60));

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const healthCheck = await axios.get(`${API_BASE}/products`);
    console.log('✅ Server is running');

    // Test 2: Fetch categories for product creation
    console.log('\n2. Fetching categories...');
    const categoriesRes = await axios.get(`${API_BASE}/categories?format=all`);
    const categories = categoriesRes.data.data;
    console.log(`✅ Found ${categories.length} categories`);
    
    if (categories.length === 0) {
      console.log('❌ No categories found. Please create categories first.');
      return;
    }

    // Test 3: Test product creation with FormData (simulating React Hook Form)
    console.log('\n3. Testing product creation with FormData...');
    
    const formData = new FormData();
    
    // Basic product data (matching React Hook Form structure)
    formData.append('name', 'Test Product - React Hook Form');
    formData.append('description', 'This is a test product created using the new React Hook Form implementation with Zod validation and image upload capabilities.');
    formData.append('shortDescription', 'Test product with React Hook Form');
    formData.append('price', '599.99');
    formData.append('discountedPrice', '499.99');
    formData.append('stockQuantity', '50');
    formData.append('preparationTime', '2-3 hours');
    formData.append('isEggless', 'true');
    formData.append('isBestseller', 'false');
    formData.append('isFeatured', 'true');

    // Categories (at least one required)
    formData.append('categories', categories[0]._id);
    if (categories[1]) {
      formData.append('categories', categories[1]._id);
    }

    // Tags
    formData.append('tags', 'test');
    formData.append('tags', 'react-hook-form');
    formData.append('tags', 'validation');

    // Weight options (matching useFieldArray structure)
    formData.append('weightOptions[0][weight]', '500g');
    formData.append('weightOptions[0][price]', '499.99');
    formData.append('weightOptions[1][weight]', '1kg');
    formData.append('weightOptions[1][price]', '899.99');

    // Simulate image file upload (if test image exists)
    const testImagePath = './public/cakes-wow-logo.jpg';
    if (fs.existsSync(testImagePath)) {
      formData.append('images', fs.createReadStream(testImagePath));
      console.log('📷 Added test image file');
    } else {
      console.log('⚠️ No test image found, creating product without images');
    }

    const createResponse = await axios.post(`${API_BASE}/products`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    if (createResponse.data.success) {
      console.log('✅ Product created successfully!');
      console.log(`   ID: ${createResponse.data.data._id}`);
      console.log(`   Slug: ${createResponse.data.data.slug}`);
      console.log(`   Images: ${createResponse.data.data.imageUrls?.length || 0}`);
      
      const productId = createResponse.data.data._id;

      // Test 4: Test product update
      console.log('\n4. Testing product update...');
      
      const updateFormData = new FormData();
      updateFormData.append('id', productId);
      updateFormData.append('name', 'Updated Test Product - React Hook Form');
      updateFormData.append('description', 'Updated description for React Hook Form test product.');
      updateFormData.append('shortDescription', 'Updated short description');
      updateFormData.append('price', '699.99');
      updateFormData.append('discountedPrice', '599.99');
      updateFormData.append('stockQuantity', '75');
      updateFormData.append('preparationTime', '3-4 hours');
      updateFormData.append('isEggless', 'false');
      updateFormData.append('isBestseller', 'true');
      updateFormData.append('isFeatured', 'true');

      // Keep existing categories
      updateFormData.append('categories', categories[0]._id);

      // Update weight options
      updateFormData.append('weightOptions[0][weight]', '750g');
      updateFormData.append('weightOptions[0][price]', '599.99');
      updateFormData.append('weightOptions[1][weight]', '1.5kg');
      updateFormData.append('weightOptions[1][price]', '1199.99');

      // Keep existing images (would be passed from form)
      if (createResponse.data.data.imageUrls?.length > 0) {
        createResponse.data.data.imageUrls.forEach(url => {
          updateFormData.append('imageUrls', url);
        });
      }

      const updateResponse = await axios.patch(`${API_BASE}/products`, updateFormData, {
        headers: {
          ...updateFormData.getHeaders()
        }
      });

      if (updateResponse.data.success) {
        console.log('✅ Product updated successfully!');
        console.log(`   Updated name: ${updateResponse.data.data.name}`);
        console.log(`   Updated price: ₹${updateResponse.data.data.price}`);
      }

      // Test 5: Test product retrieval
      console.log('\n5. Testing product retrieval...');
      const getResponse = await axios.get(`${API_BASE}/products`);
      const products = getResponse.data.data.products;
      const testProduct = products.find(p => p._id === productId);
      
      if (testProduct) {
        console.log('✅ Product retrieved successfully!');
        console.log(`   Name: ${testProduct.name}`);
        console.log(`   Categories: ${testProduct.categories.map(c => c.name).join(', ')}`);
        console.log(`   Weight options: ${testProduct.weightOptions.length}`);
      }

      // Test 6: Cleanup - Delete test product
      console.log('\n6. Cleaning up test product...');
      const deleteResponse = await axios.delete(`${API_BASE}/products?id=${productId}`);
      
      if (deleteResponse.data.success) {
        console.log('✅ Test product deleted successfully!');
      }

    } else {
      console.log('❌ Product creation failed:', createResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n🔍 Debug information:');
      console.log('- Check if database is connected');
      console.log('- Verify Cloudinary configuration');
      console.log('- Check server logs for detailed error');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Product Form React Hook Form tests completed');
}

// Test form validation scenarios
async function testValidation() {
  console.log('\n🔍 Testing form validation scenarios...');
  
  const validationTests = [
    {
      name: 'Empty form submission',
      data: new FormData()
    },
    {
      name: 'Missing required fields',
      data: (() => {
        const fd = new FormData();
        fd.append('name', 'Test Product');
        // Missing description, price, categories
        return fd;
      })()
    },
    {
      name: 'Invalid price validation',
      data: (() => {
        const fd = new FormData();
        fd.append('name', 'Test Product');
        fd.append('description', 'Test description');
        fd.append('shortDescription', 'Short desc');
        fd.append('price', '-100'); // Invalid negative price
        fd.append('categories', '507f1f77bcf86cd799439011'); // Dummy category ID
        fd.append('weightOptions[0][weight]', '500g');
        fd.append('weightOptions[0][price]', '100');
        return fd;
      })()
    }
  ];

  for (const test of validationTests) {
    try {
      console.log(`\n   Testing: ${test.name}`);
      const response = await axios.post(`${API_BASE}/products`, test.data, {
        headers: {
          ...test.data.getHeaders()
        }
      });
      console.log(`   ❌ Expected validation error but got success`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`   ✅ Validation error caught: ${error.response.data.error}`);
      } else {
        console.log(`   ❓ Unexpected error: ${error.response?.data?.error || error.message}`);
      }
    }
  }
}

// Run tests
async function runAllTests() {
  await testProductAPI();
  await testValidation();
}

runAllTests().catch(console.error);
