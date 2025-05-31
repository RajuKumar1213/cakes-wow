// Test Category Management in Admin Interface
const axios = require('axios');

const BASE_URL = 'http://localhost:3004';

async function testCategoryManagement() {
  console.log('🔧 Testing Category Management Flow...\n');

  try {
    // 1. Create a test category
    console.log('1. Creating a test category...');
    
    const formData = new FormData();
    formData.append('name', 'Test Delete Category');
    formData.append('group', 'Test Group');
    formData.append('type', 'Test');
    formData.append('description', 'This is a test category for deletion');

    const createResponse = await axios.post(`${BASE_URL}/api/categories`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!createResponse.data.success) {
      console.log('❌ Failed to create test category');
      return;
    }

    const testCategory = createResponse.data.data;
    console.log(`✅ Test category created: ${testCategory.name} (ID: ${testCategory._id})`);

    // 2. Verify category appears in the list
    console.log('\n2. Verifying category appears in admin list...');
    const listResponse = await axios.get(`${BASE_URL}/api/categories?format=all`);
    const foundCategory = listResponse.data.data.find(cat => cat._id === testCategory._id);
    
    if (foundCategory) {
      console.log('✅ Test category found in admin list');
    } else {
      console.log('❌ Test category not found in admin list');
    }

    // 3. Test deletion
    console.log('\n3. Testing category deletion...');
    const deleteResponse = await axios.delete(`${BASE_URL}/api/categories?id=${testCategory._id}`);
    
    if (deleteResponse.data.success) {
      console.log('✅ Category deletion API call successful');
    } else {
      console.log('❌ Category deletion API call failed');
    }

    // 4. Verify category is removed from list
    console.log('\n4. Verifying category is removed from list...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/categories?format=all`);
    const stillExists = verifyResponse.data.data.find(cat => cat._id === testCategory._id);
    
    if (!stillExists) {
      console.log('✅ Category successfully removed from database');
    } else {
      console.log('❌ Category still exists in database');
    }

    // 5. Test admin interface data flow
    console.log('\n5. Testing admin interface data flow...');
    
    // Get grouped categories (what admin interface uses)
    const groupedResponse = await axios.get(`${BASE_URL}/api/categories`);
    const allCategoriesResponse = await axios.get(`${BASE_URL}/api/categories?format=all`);
    
    console.log('✅ Admin interface data endpoints working:');
    console.log(`   - Grouped categories: ${Object.keys(groupedResponse.data.data || {}).length} groups`);
    console.log(`   - All categories: ${allCategoriesResponse.data.data.length} total categories`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }

  console.log('\n🏁 Category management test completed!');
}

// Run the test
testCategoryManagement().catch(console.error);
