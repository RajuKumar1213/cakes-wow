const { exec } = require('child_process');

async function testEndpoint(url, description) {
    return new Promise((resolve) => {
        exec(`curl -s "${url}"`, (error, stdout, stderr) => {
            console.log(`\n=== ${description} ===`);
            if (error) {
                console.log(`❌ Error: ${error.message}`);
                resolve(false);
                return;
            }
            
            try {
                const data = JSON.parse(stdout);
                if (data.success) {
                    console.log(`✅ Success: ${JSON.stringify(data.data, null, 2)}`);
                    resolve(true);
                } else {
                    console.log(`❌ Failed: ${data.message || 'Unknown error'}`);
                    resolve(false);
                }
            } catch (e) {
                console.log(`❌ Parse Error: ${e.message}`);
                console.log(`Response: ${stdout.substring(0, 200)}...`);
                resolve(false);
            }
        });
    });
}

async function runTests() {
    console.log('🧪 Testing Weight Filter Implementation');
    console.log('=====================================');
    
    const baseUrl = 'http://localhost:3005';
    
    // Test 1: Check ranges API for deduplicated weights
    await testEndpoint(`${baseUrl}/api/products/ranges`, 'Ranges API - Should show deduplicated weights');
    
    // Test 2: Check category-specific ranges
    await testEndpoint(`${baseUrl}/api/products/ranges?category=chocolate-loaded-cakes`, 'Category Ranges API');
    
    // Test 3: Check products without filters
    await testEndpoint(`${baseUrl}/api/products?category=chocolate-loaded-cakes&limit=5`, 'Products API - No filters');
    
    // Test 4: Check products with weight filter (1kg)
    await testEndpoint(`${baseUrl}/api/products?category=chocolate-loaded-cakes&weights=1kg&limit=5`, 'Products API - Filter by 1kg');
    
    // Test 5: Check products with weight filter (500g)
    await testEndpoint(`${baseUrl}/api/products?category=chocolate-loaded-cakes&weights=500g&limit=5`, 'Products API - Filter by 500g');
    
    // Test 6: Check products with multiple weight filters
    await testEndpoint(`${baseUrl}/api/products?category=chocolate-loaded-cakes&weights=1kg,500g&limit=5`, 'Products API - Filter by multiple weights');
    
    // Test 7: Check products with price filter (should use minimum price)
    await testEndpoint(`${baseUrl}/api/products?category=chocolate-loaded-cakes&minPrice=300&maxPrice=800&limit=5`, 'Products API - Price filter (min price logic)');
    
    console.log('\n🎯 Summary:');
    console.log('- Weights should be deduplicated (no "0.5kg" and "500g" both showing)');
    console.log('- Weight filtering should match products with ANY weight variation');
    console.log('- Price filtering should only consider the minimum price per product');
    console.log('- Frontend should display unique, normalized weights in the filter UI');
}

runTests().catch(console.error);
