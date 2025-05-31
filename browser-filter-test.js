// Browser utility for testing filters
// Copy and paste this into browser console on any category page

window.testFilters = {
  // Test price filter
  testPrice: (min = 500, max = 2000) => {
    console.log(`🔍 Testing price filter: ₹${min} - ₹${max}`);
    const priceSliders = document.querySelectorAll('[data-price-slider]');
    console.log('Price sliders found:', priceSliders.length);
    
    // Simulate price change
    window.dispatchEvent(new CustomEvent('filterChange', {
      detail: { minPrice: min, maxPrice: max }
    }));
  },

  // Test weight filter
  testWeight: (weights = ['500g', '1kg']) => {
    console.log(`🔍 Testing weight filter:`, weights);
    const weightCheckboxes = document.querySelectorAll('[data-weight-checkbox]');
    console.log('Weight checkboxes found:', weightCheckboxes.length);
    
    // Simulate weight selection
    window.dispatchEvent(new CustomEvent('filterChange', {
      detail: { weights }
    }));
  },

  // Test eggless filter
  testEggless: (isEggless = true) => {
    console.log(`🔍 Testing eggless filter:`, isEggless);
    const egglessCheckbox = document.querySelector('[data-eggless-checkbox]');
    console.log('Eggless checkbox found:', !!egglessCheckbox);
    
    // Simulate eggless toggle
    window.dispatchEvent(new CustomEvent('filterChange', {
      detail: { isEggless }
    }));
  },

  // Test API directly
  testAPI: async (filters = {}) => {
    console.log(`🔍 Testing API with filters:`, filters);
    
    const params = new URLSearchParams({
      category: 'birthday-cakes',
      ...filters
    });
    
    try {
      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      console.log('✅ API Response:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      return null;
    }
  },

  // Check filter sidebar state
  checkSidebar: () => {
    const filterButton = document.querySelector('button:has(.lucide-filter)');
    const sidebar = document.querySelector('[data-filter-sidebar]') || document.querySelector('.filter-sidebar');
    
    console.log('🔍 Filter UI State:');
    console.log('Filter button found:', !!filterButton);
    console.log('Sidebar element found:', !!sidebar);
    console.log('Sidebar visible:', sidebar ? getComputedStyle(sidebar).display !== 'none' : false);
    
    if (filterButton) {
      console.log('Clicking filter button...');
      filterButton.click();
    }
  },

  // Monitor all filter changes
  monitorFilters: () => {
    console.log('🔍 Monitoring filter changes...');
    
    // Override console.log to catch filter logs
    const originalLog = console.log;
    window.filterLogs = [];
    
    console.log = function(...args) {
      const message = args.join(' ');
      if (message.includes('filter') || message.includes('Filter')) {
        window.filterLogs.push({ time: new Date(), message });
        originalLog('🎯 FILTER LOG:', ...args);
      } else {
        originalLog(...args);
      }
    };
    
    // Listen for network requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('/api/products')) {
        console.log('🌐 API CALL:', url);
      }
      return originalFetch.apply(this, args);
    };
    
    console.log('✅ Filter monitoring enabled. Check window.filterLogs for history.');
  }
};

// Auto-enable monitoring
window.testFilters.monitorFilters();

console.log('🛠️ Filter testing utilities loaded!');
console.log('Available commands:');
console.log('• testFilters.testPrice(min, max)');
console.log('• testFilters.testWeight([weights])');
console.log('• testFilters.testEggless(boolean)');
console.log('• testFilters.testAPI(filters)');
console.log('• testFilters.checkSidebar()');
console.log('• testFilters.monitorFilters()');
console.log('\nExample: testFilters.testPrice(500, 1500)');
