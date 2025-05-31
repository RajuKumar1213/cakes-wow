// Test script for Filter Sidebar functionality
// Run this in browser console or as a Node.js script

async function testFilterSidebar() {
  console.log('🧪 Testing Filter Sidebar Implementation...\n');

  // Test 1: Check if ranges API endpoint works
  console.log('1. Testing product ranges API...');
  try {
    const rangesResponse = await fetch('/api/products/ranges');
    const rangesData = await rangesResponse.json();
    
    if (rangesData.success) {
      console.log('✅ Ranges API working');
      console.log('   Price Range:', rangesData.data.priceRange);
      console.log('   Weight Options:', rangesData.data.weightOptions);
    } else {
      console.log('❌ Ranges API failed');
    }
  } catch (error) {
    console.log('❌ Ranges API error:', error.message);
  }

  // Test 2: Test products API with filters
  console.log('\n2. Testing products API with filters...');
  
  const testFilters = [
    { name: 'Price Filter', params: '?minPrice=500&maxPrice=1500' },
    { name: 'Weight Filter', params: '?weights=1kg&weights=500g' },
    { name: 'Eggless Filter', params: '?isEggless=true' },
    { name: 'Bestseller Filter', params: '?isBestseller=true' },
    { name: 'Combined Filters', params: '?minPrice=300&maxPrice=2000&isEggless=true&weights=1kg' }
  ];

  for (const filter of testFilters) {
    try {
      const response = await fetch(`/api/products${filter.params}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${filter.name}: ${data.data.products.length} products found`);
      } else {
        console.log(`❌ ${filter.name}: Failed`);
      }
    } catch (error) {
      console.log(`❌ ${filter.name}: Error - ${error.message}`);
    }
  }

  // Test 3: Check filter sidebar component integration
  console.log('\n3. Testing FilterSidebar component...');
  
  const filterSidebarExists = document.querySelector('[data-testid="filter-sidebar"]') || 
                             document.querySelector('.filter-sidebar') ||
                             document.querySelector('div[class*="filter"]');
  
  if (filterSidebarExists) {
    console.log('✅ Filter sidebar component found in DOM');
    
    // Check for key elements
    const priceSlider = document.querySelector('input[type="range"]');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const filterButtons = document.querySelectorAll('button[class*="filter"]');
    
    console.log(`   - Price sliders: ${priceSlider ? '✅' : '❌'}`);
    console.log(`   - Filter checkboxes: ${checkboxes.length} found`);
    console.log(`   - Filter buttons: ${filterButtons.length} found`);
  } else {
    console.log('❌ Filter sidebar component not found in DOM');
  }

  // Test 4: CSS styles validation
  console.log('\n4. Testing CSS styles...');
  
  const requiredStyles = [
    'dual-range-slider',
    'filter-hover',
    'active-filter-border',
    'filter-checkbox'
  ];

  let stylesFound = 0;
  requiredStyles.forEach(style => {
    const element = document.querySelector(`.${style}`);
    if (element) {
      stylesFound++;
      console.log(`   ✅ ${style} class found`);
    } else {
      console.log(`   ❌ ${style} class not found`);
    }
  });

  console.log(`\n   CSS Styles: ${stylesFound}/${requiredStyles.length} found`);

  // Test 5: Filter functionality simulation
  console.log('\n5. Testing filter functionality...');
  
  const testFilterObject = {
    minPrice: 500,
    maxPrice: 1500,
    weights: ['1kg', '500g'],
    isEggless: true,
    isBestseller: false
  };

  console.log('   Test filter object:', testFilterObject);
  
  // Simulate filter change
  const filterChangeEvent = new CustomEvent('filterChange', {
    detail: testFilterObject
  });
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(filterChangeEvent);
    console.log('   ✅ Filter change event dispatched');
  }

  console.log('\n🎉 Filter Sidebar Test Complete!');
  console.log('\nNext steps:');
  console.log('1. Open the application in browser');
  console.log('2. Navigate to a products page');
  console.log('3. Click the "Filters" button');
  console.log('4. Test the price slider and weight checkboxes');
  console.log('5. Verify products update dynamically');
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testFilterSidebar);
  } else {
    testFilterSidebar();
  }
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testFilterSidebar };
}

console.log('Filter Sidebar Test Script Loaded');
console.log('Call testFilterSidebar() to run tests');
