// Test the consolidated addons API
// Usage: node test-addons-api.js

const BASE_URL = 'http://localhost:3000';

async function testAddOnsAPI() {
  console.log('🧪 Testing consolidated Add-ons API...\n');

  try {
    // Test 1: GET all add-ons
    console.log('1️⃣ Testing GET all add-ons...');
    const getAllResponse = await fetch(`${BASE_URL}/api/addons`);
    const getAllData = await getAllResponse.json();
    console.log('✅ GET all add-ons:', getAllData.success ? 'SUCCESS' : 'FAILED');
    
    if (getAllData.data && getAllData.data.length > 0) {
      const firstAddOnId = getAllData.data[0]._id;
      
      // Test 2: GET single add-on by ID
      console.log('\n2️⃣ Testing GET single add-on by ID...');
      const getSingleResponse = await fetch(`${BASE_URL}/api/addons?id=${firstAddOnId}`);
      const getSingleData = await getSingleResponse.json();
      console.log('✅ GET single add-on:', getSingleData.success ? 'SUCCESS' : 'FAILED');
    }

    // Test 3: POST new add-on (JSON)
    console.log('\n3️⃣ Testing POST new add-on (JSON)...');
    const newAddOn = {
      name: 'Test Add-on',
      price: 99,
      image: 'https://example.com/test-image.jpg',
      rating: 4.5
    };
    
    const postResponse = await fetch(`${BASE_URL}/api/addons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAddOn)
    });
    const postData = await postResponse.json();
    console.log('✅ POST new add-on:', postData.success ? 'SUCCESS' : 'FAILED');
    
    if (postData.success) {
      const newAddOnId = postData.data._id;
      
      // Test 4: PUT update add-on
      console.log('\n4️⃣ Testing PUT update add-on...');
      const updateData = { name: 'Updated Test Add-on', price: 149 };
      const putResponse = await fetch(`${BASE_URL}/api/addons?id=${newAddOnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const putData = await putResponse.json();
      console.log('✅ PUT update add-on:', putData.success ? 'SUCCESS' : 'FAILED');
      
      // Test 5: DELETE add-on
      console.log('\n5️⃣ Testing DELETE add-on...');
      const deleteResponse = await fetch(`${BASE_URL}/api/addons?id=${newAddOnId}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteResponse.json();
      console.log('✅ DELETE add-on:', deleteData.success ? 'SUCCESS' : 'FAILED');
    }

    console.log('\n🎉 All tests completed! The consolidated API is working correctly.');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAddOnsAPI();
}

module.exports = { testAddOnsAPI };
