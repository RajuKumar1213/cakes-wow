const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function createTestCategories() {
  const testCategories = [
    {
      name: 'Pink Heart Cakes',
      group: 'For Girlfriend',
      type: 'Romantic',
      description: 'Beautiful pink heart-shaped cakes perfect for expressing love'
    },
    {
      name: 'Jungle Adventure Cakes',
      group: 'Jungle Theme',
      type: 'Adventure',
      description: 'Wild jungle themed cakes with animals and tropical decorations'
    },
    {
      name: 'Princess Castle Cakes',
      group: 'For Girlfriend',
      type: 'Fantasy',
      description: 'Magical princess castle cakes for fairy tale dreams'
    },
    {
      name: 'Safari Explorer Cakes',
      group: 'Jungle Theme',
      type: 'Adventure',
      description: 'Safari themed cakes with lions, elephants and jungle vibes'
    },
    {
      name: 'Gold Rose Cakes',
      group: 'Wedding Special',
      type: 'Luxury',
      description: 'Elegant gold and rose themed cakes for special occasions'
    }
  ];

  console.log('Creating diverse test categories...\n');

  for (const category of testCategories) {
    try {
      const formData = new FormData();
      formData.append('name', category.name);
      formData.append('group', category.group);
      formData.append('type', category.type);
      formData.append('description', category.description);

      const response = await fetch('http://localhost:3002/api/categories', {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${category.name} created successfully!`);
        console.log(`   Group: ${category.group} | Type: ${category.type}`);
      } else {
        console.log(`❌ Failed to create ${category.name}`);
        console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${category.name}:`, error.message);
    }
  }

  console.log('\n🎯 Testing complete! Fetching all categories...\n');

  // Fetch and display all categories grouped
  try {
    const response = await fetch('http://localhost:3002/api/categories');
    const result = await response.json();
    
    if (response.ok) {
      console.log('📊 Categories by Group:');
      Object.entries(result.data).forEach(([group, categories]) => {
        console.log(`\n🏷️  ${group}:`);
        categories.forEach(cat => {
          console.log(`   - ${cat.name} (${cat.type})`);
        });
      });
    }
  } catch (error) {
    console.error('❌ Failed to fetch grouped categories:', error);
  }
}

createTestCategories();
