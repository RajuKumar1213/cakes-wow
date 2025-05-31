// Test script to debug dropdown functionality
const { MongoClient } = require('mongodb');

async function testDropdownData() {
  try {
    console.log('🔍 Testing Dropdown Navigation Data...\n');
    
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('bakingo-clone');
    
    // Get all categories
    const categories = await db.collection('categories').find({}).toArray();
    console.log(`📊 Total categories found: ${categories.length}\n`);
    
    // Group categories by group (like the frontend does)
    const groupedCategories = categories.reduce((acc, category) => {
      const group = category.group;
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(category);
      return acc;
    }, {});
    
    console.log('🔄 Dropdown Test Results:');
    console.log('========================\n');
    
    Object.keys(groupedCategories).forEach(group => {
      const categories = groupedCategories[group];
      const shouldHaveDropdown = categories.length > 1;
      
      console.log(`📂 ${group}:`);
      console.log(`   Categories: ${categories.length}`);
      console.log(`   Has Dropdown: ${shouldHaveDropdown ? '✅ YES' : '❌ NO'}`);
      
      if (shouldHaveDropdown) {
        // Group by type to show dropdown structure
        const typeGroups = categories.reduce((acc, cat) => {
          if (!acc[cat.type]) acc[cat.type] = [];
          acc[cat.type].push(cat.name);
          return acc;
        }, {});
        
        console.log('   Dropdown Sections:');
        Object.entries(typeGroups).forEach(([type, catNames]) => {
          const sectionName = type === 'Category' ? 'By Type' : 
                            type === 'Occasion' ? 'By Occasion' :
                            type === 'Relationship' ? 'By Relationship' :
                            type === 'Dessert' ? 'Desserts' :
                            type === 'Theme' ? 'Theme Cakes' :
                            type === 'Special' ? 'Special Cakes' :
                            type === 'Character' ? 'Character Cakes' :
                            type === 'Romantic' ? 'Romantic Cakes' :
                            type === 'Fantasy' ? 'Fantasy Cakes' :
                            type === 'Adventure' ? 'Adventure Cakes' :
                            type === 'Luxury' ? 'Luxury Collection' :
                            type;
          
          console.log(`     📍 ${sectionName}: ${catNames.join(', ')}`);
        });
      } else {
        console.log(`   Direct Link: /${categories[0].slug}`);
      }
      console.log('');
    });
    
    console.log('\n🎯 Hover Test Instructions:');
    console.log('============================');
    Object.keys(groupedCategories).forEach(group => {
      if (groupedCategories[group].length > 1) {
        console.log(`✅ Hover on "${group}" should show dropdown with ${groupedCategories[group].length} items`);
      } else {
        console.log(`⚡ Click on "${group}" should go directly to /${groupedCategories[group][0].slug}`);
      }
    });
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error testing dropdown data:', error);
  }
}

testDropdownData();
