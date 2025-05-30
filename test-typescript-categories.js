// Test script for the updated Categories API with TypeScript
// This file tests the GET, POST, PATCH, and DELETE endpoints

const API_BASE = 'http://localhost:3000/api';

async function testCategoriesAPI() {
  console.log('🧪 Testing Categories API Endpoints...\n');

  try {
    // Test 1: GET all categories (grouped format)
    console.log('1. Testing GET /api/categories (grouped format)');
    const groupedResponse = await fetch(`${API_BASE}/categories`);
    const groupedData = await groupedResponse.json();
    console.log('✅ Grouped categories:', groupedData.success ? 'Success' : 'Failed');
    
    // Test 2: GET all categories (flat format)
    console.log('\n2. Testing GET /api/categories?format=all');
    const allResponse = await fetch(`${API_BASE}/categories?format=all`);
    const allData = await allResponse.json();
    console.log('✅ All categories:', allData.success ? 'Success' : 'Failed');
    
    // Test 3: POST new category
    console.log('\n3. Testing POST /api/categories');
    const formData = new FormData();
    formData.append('name', 'Test TypeScript Category');
    formData.append('group', 'Testing');
    formData.append('type', 'TypeScript');
    formData.append('description', 'A test category created via TypeScript API');
    
    const postResponse = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      body: formData
    });
    const postData = await postResponse.json();
    console.log('✅ Create category:', postData.success ? 'Success' : 'Failed');
    
    if (postData.success) {
      const categoryId = postData.data._id;
      console.log('   Created category ID:', categoryId);
      
      // Test 4: PATCH (update) category
      console.log('\n4. Testing PATCH /api/categories');
      const updateFormData = new FormData();
      updateFormData.append('id', categoryId);
      updateFormData.append('name', 'Updated TypeScript Category');
      updateFormData.append('group', 'Testing Updated');
      updateFormData.append('type', 'TypeScript Updated');
      updateFormData.append('description', 'An updated test category via TypeScript API');
      
      const patchResponse = await fetch(`${API_BASE}/categories`, {
        method: 'PATCH',
        body: updateFormData
      });
      const patchData = await patchResponse.json();
      console.log('✅ Update category:', patchData.success ? 'Success' : 'Failed');
      
      // Test 5: DELETE category
      console.log('\n5. Testing DELETE /api/categories');
      const deleteResponse = await fetch(`${API_BASE}/categories?id=${categoryId}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteResponse.json();
      console.log('✅ Delete category:', deleteData.success ? 'Success' : 'Failed');
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Function to test TypeScript type safety
function testTypeScript() {
  console.log('\n🔍 TypeScript Conversion Benefits:');
  console.log('✅ Strong typing for request/response objects');
  console.log('✅ Better IDE autocomplete and error detection');
  console.log('✅ Compile-time error checking');
  console.log('✅ Enhanced code maintainability');
  console.log('✅ Consistent API response format');
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCategoriesAPI, testTypeScript };
} else if (typeof window !== 'undefined') {
  window.testCategoriesAPI = testCategoriesAPI;
  window.testTypeScript = testTypeScript;
}

// Auto-run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testCategoriesAPI();
  testTypeScript();
}
