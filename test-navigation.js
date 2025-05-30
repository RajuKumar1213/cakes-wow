const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testNavigationData() {
  try {
    console.log('🧭 Testing Navigation Data Integration...\n');
    
    // Test the grouped categories API (used by navigation)
    const response = await fetch('http://localhost:3002/api/categories');
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Navigation-ready category data:');
      console.log('=====================================\n');
      
      Object.entries(result.data).forEach(([group, categories]) => {
        console.log(`📂 ${group}:`);
        categories.forEach(cat => {
          console.log(`   🎂 ${cat.name}`);
          console.log(`      Slug: /${cat.slug}`);
          console.log(`      Type: ${cat.type}`);
          if (cat.imageUrl) {
            console.log(`      Image: ✅ Available`);
          }
          console.log('');
        });
      });
      
      console.log('🔗 Sample Navigation URLs:');
      console.log('=========================');
      Object.entries(result.data).forEach(([group, categories]) => {
        categories.slice(0, 2).forEach(cat => {
          console.log(`${cat.name}: http://localhost:3002/${cat.slug}`);
        });
      });
      
    } else {
      console.log('❌ Failed to fetch navigation data:', result);
    }
    
  } catch (error) {
    console.error('❌ Navigation test failed:', error);
  }
}

testNavigationData();
