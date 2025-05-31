// Test Category Deletion API
const axios = require('axios');

const BASE_URL = 'http://localhost:3004';

async function testCategoryDeletion() {
  console.log('🧪 Testing Category Deletion API...\n');

  try {
    // First, let's fetch existing categories to get an ID to test with
    console.log('1. Fetching existing categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/api/categories?format=all`);
    
    if (!categoriesResponse.data.success || !categoriesResponse.data.data.length) {
      console.log('❌ No categories found to test deletion with');
      return;
    }

    const categories = categoriesResponse.data.data;
    console.log(`✅ Found ${categories.length} categories`);
    
    // Show available categories
    console.log('\n📋 Available categories:');
    categories.slice(0, 5).forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (ID: ${cat._id})`);
    });

    // Test deletion with wrong URL format (should fail)
    console.log('\n2. Testing deletion with wrong URL format...');
    try {
      const wrongResponse = await axios.delete(`${BASE_URL}/api/categories/${categories[0]._id}`);
      console.log('❌ Unexpected success with wrong URL format');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Correctly failed with wrong URL format (404)');
      } else {
        console.log('⚠️  Failed with unexpected error:', error.message);
      }
    }

    // Test deletion with correct URL format
    console.log('\n3. Testing deletion with correct URL format...');
    const testCategoryId = categories[0]._id;
    console.log(`   Attempting to delete category: ${categories[0].name} (${testCategoryId})`);

    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/api/categories?id=${testCategoryId}`);
      
      if (deleteResponse.data.success) {
        console.log('✅ Category deletion successful!');
        console.log('   Response:', deleteResponse.data);
        
        // Verify the category was actually deleted
        console.log('\n4. Verifying deletion...');
        const verifyResponse = await axios.get(`${BASE_URL}/api/categories?format=all`);
        const remainingCategories = verifyResponse.data.data;
        
        const deletedCategoryStillExists = remainingCategories.find(cat => cat._id === testCategoryId);
        
        if (!deletedCategoryStillExists) {
          console.log('✅ Category successfully removed from database');
          console.log(`   Categories count: ${categories.length} → ${remainingCategories.length}`);
        } else {
          console.log('❌ Category still exists in database after deletion');
        }
        
      } else {
        console.log('❌ Category deletion failed:', deleteResponse.data);
      }
    } catch (error) {
      console.log('❌ Category deletion error:', error.response?.data || error.message);
    }

    // Test deletion with invalid ID
    console.log('\n5. Testing deletion with invalid ID...');
    try {
      const invalidResponse = await axios.delete(`${BASE_URL}/api/categories?id=invalid-id`);
      console.log('❌ Unexpected success with invalid ID');
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.log('✅ Correctly failed with invalid ID (500)');
      } else {
        console.log('⚠️  Failed with unexpected status:', error.response?.status);
      }
    }

    // Test deletion with missing ID
    console.log('\n6. Testing deletion with missing ID...');
    try {
      const missingIdResponse = await axios.delete(`${BASE_URL}/api/categories`);
      console.log('❌ Unexpected success with missing ID');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly failed with missing ID (400)');
        console.log('   Error message:', error.response.data.error);
      } else {
        console.log('⚠️  Failed with unexpected status:', error.response?.status);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🏁 Category deletion test completed!');
}

// Run the test
testCategoryDeletion().catch(console.error);
