// Simple test to check filter functionality
// Run this in browser console on a category page

console.log('🧪 Filter Debug Test');

// Check if FilterSidebar exists
const filterSidebar = document.querySelector('[data-testid="filter-sidebar"]') || document.querySelector('.filter-sidebar');
console.log('FilterSidebar element found:', !!filterSidebar);

// Check if filter toggle button exists
const filterToggle = document.querySelector('button[data-filter-toggle]') || document.querySelector('button:has(.lucide-filter)');
console.log('Filter toggle button found:', !!filterToggle);

// Test filter functionality
if (filterToggle) {
  console.log('Clicking filter toggle...');
  filterToggle.click();
  setTimeout(() => {
    const sidebar = document.querySelector('.filter-sidebar') || document.querySelector('[role="dialog"]');
    console.log('Sidebar opened:', !!sidebar);
  }, 100);
}

// Check for any JavaScript errors
console.log('Listening for filter changes...');
window.addEventListener('error', (e) => {
  console.error('JavaScript error detected:', e.error);
});

// Override console.log to catch filter logs
const originalLog = console.log;
console.log = function(...args) {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('filter')) {
    originalLog('🔍 FILTER LOG:', ...args);
  } else {
    originalLog(...args);
  }
};
