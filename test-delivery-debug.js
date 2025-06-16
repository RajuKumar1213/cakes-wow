// Test delivery time calculations for debugging
console.log('=== DELIVERY TIME DEBUG ===');

// Simulate current time: 6:36 PM on June 16th
const mockCurrentTime = new Date('2025-06-16T18:36:00');
console.log('Current time:', mockCurrentTime.toLocaleString());

// Mock the current time
Date.now = () => mockCurrentTime.getTime();
global.Date = class extends Date {
  constructor(...args) {
    if (args.length === 0) {
      super(mockCurrentTime.getTime());
    } else {
      super(...args);
    }
  }
  
  static now() {
    return mockCurrentTime.getTime();
  }
};

// Import the functions we need to test
const { getMinimumDeliveryTime, getEarliestDeliveryDate, shouldShowTodayInCalendar } = require('./src/utils/deliveryTimeUtils.ts');

console.log('\n=== TESTING 2 HOUR PREP TIME ===');
const twoHourPrep = 2;
const minTime2h = getMinimumDeliveryTime(twoHourPrep);
const earliestDate2h = getEarliestDeliveryDate(twoHourPrep);
const showToday2h = shouldShowTodayInCalendar(twoHourPrep);

console.log('2h prep - Minimum delivery time (minutes):', minTime2h);
console.log('2h prep - Minimum delivery time (hours):', (minTime2h / 60).toFixed(2));
console.log('2h prep - Earliest date:', earliestDate2h.toDateString());
console.log('2h prep - Show today:', showToday2h);

console.log('\n=== TESTING 6 HOUR PREP TIME ===');
const sixHourPrep = 6;
const minTime6h = getMinimumDeliveryTime(sixHourPrep);
const earliestDate6h = getEarliestDeliveryDate(sixHourPrep);
const showToday6h = shouldShowTodayInCalendar(sixHourPrep);

console.log('6h prep - Minimum delivery time (minutes):', minTime6h);
console.log('6h prep - Minimum delivery time (hours):', (minTime6h / 60).toFixed(2));
console.log('6h prep - Earliest date:', earliestDate6h.toDateString());
console.log('6h prep - Show today:', showToday6h);

// Calculate what times these would be
const currentMinutes = mockCurrentTime.getHours() * 60 + mockCurrentTime.getMinutes();
console.log('\nCurrent time in minutes:', currentMinutes, '(', Math.floor(currentMinutes/60) + ':' + (currentMinutes%60).toString().padStart(2, '0'), ')');
console.log('2h prep would need delivery at minutes:', minTime2h, '(', Math.floor(minTime2h/60) + ':' + (minTime2h%60).toString().padStart(2, '0'), ')');
console.log('6h prep would need delivery at minutes:', minTime6h, '(', Math.floor(minTime6h/60) + ':' + (minTime6h%60).toString().padStart(2, '0'), ')');

// Check if 6h goes past midnight
if (minTime6h >= 1440) {
  console.log('6h prep goes past midnight - that is why it shows day after tomorrow');
  console.log('Minutes past midnight:', minTime6h - 1440);
  console.log('Time next day:', Math.floor((minTime6h - 1440)/60) + ':' + ((minTime6h - 1440)%60).toString().padStart(2, '0'));
}
