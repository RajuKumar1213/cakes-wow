const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');

async function testCategoryCreation() {
  try {
    console.log('Testing category creation with image upload...');

    // Create FormData
    const formData = new FormData();
    formData.append('name', 'Batman Cakes');
    formData.append('group', 'Superhero Cakes');
    formData.append('type', 'Character');
    formData.append('description', 'Amazing Batman themed cakes for superhero fans');

    // Check if we have a test image
    const imagePath = path.join(__dirname, 'public', 'cakes-wow-logo.jpg');
    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      formData.append('imageUrl', imageBuffer, {
        filename: 'batman-cake.jpg',
        contentType: 'image/jpeg'
      });
      console.log('✅ Image attached to form');
    } else {
      console.log('⚠️  No test image found, creating category without image');
    }

    // Make API request
    const response = await fetch('http://localhost:3002/api/categories', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Category created successfully!');
      console.log('Category data:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Failed to create category');
      console.log('Error:', result);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test fetching existing categories
async function testFetchCategories() {
  try {
    console.log('\nTesting category fetch...');
    
    const response = await fetch('http://localhost:3002/api/categories?format=all');
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Categories fetched successfully!');
      console.log(`Found ${result.data.length} categories`);
      result.data.forEach(cat => {
        console.log(`- ${cat.name} (${cat.group} > ${cat.type})${cat.imageUrl ? ' [Has Image]' : ''}`);
      });
    } else {
      console.log('❌ Failed to fetch categories');
      console.log('Error:', result);
    }
    
  } catch (error) {
    console.error('❌ Fetch test failed:', error);
  }
}

// Run tests
testFetchCategories()
  .then(() => testCategoryCreation())
  .then(() => testFetchCategories())
  .then(() => {
    console.log('\n✅ All tests completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Tests failed:', error);
    process.exit(1);
  });
