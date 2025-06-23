const axios = require('axios');

async function testSearchConsistency() {
  const baseURL = 'http://localhost:3001';
  const queries = ['chocolate cake', 'birthday', 'vanilla'];
  
  for (const query of queries) {
    try {
      console.log(`Testing search consistency for query: "${query}"`);
      console.log('='.repeat(50));
      
      // Test header search (suggestions API with limit 6)
      console.log('\n1. Header Search (suggestions API, limit 6):');
      const headerResponse = await axios.get(`${baseURL}/api/search/suggestions?q=${encodeURIComponent(query)}&limit=6`);
      const headerProducts = headerResponse.data.data.products || [];
      console.log(`   Results: ${headerProducts.length}`);
      headerProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.slug})`);
      });
      
      // Test search page (suggestions API with limit 12)
      console.log('\n2. Search Page (suggestions API, limit 12):');
      const searchResponse = await axios.get(`${baseURL}/api/search/suggestions?q=${encodeURIComponent(query)}&limit=12`);
      const searchProducts = searchResponse.data.data.products || [];
      console.log(`   Results: ${searchProducts.length}`);
      searchProducts.slice(0, 6).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.slug})`);
      });
      if (searchProducts.length > 6) {
        console.log(`   ... and ${searchProducts.length - 6} more results`);
      }
      
      // Check consistency
      console.log('\n3. Consistency Check:');
      const headerSlugs = headerProducts.map(p => p.slug);
      const searchSlugs = searchProducts.slice(0, headerProducts.length).map(p => p.slug);
      
      const isConsistent = JSON.stringify(headerSlugs) === JSON.stringify(searchSlugs);
      console.log(`   First ${headerProducts.length} results match: ${isConsistent ? '✅ YES' : '❌ NO'}`);
      
      if (!isConsistent) {
        console.log('   Header slugs:', headerSlugs);
        console.log('   Search slugs:', searchSlugs);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
      
    } catch (error) {
      console.error(`Error testing search for "${query}":`, error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
    }
  }
}

testSearchConsistency();
