// Simple math test for delivery time calculations
console.log('=== DELIVERY TIME DEBUG ===');

// Current time: 6:36 PM = 18:36 = 18*60 + 36 = 1116 minutes from midnight
const currentMinutes = 18 * 60 + 36; // 1116 minutes
console.log('Current time: 18:36 (', currentMinutes, 'minutes from midnight)');

// Test 2 hour prep time
const prep2h = 2 * 60; // 120 minutes
const buffer = 15; // 15 minutes buffer
const minDelivery2h = currentMinutes + prep2h + buffer;
console.log('\n2 HOUR PREP:');
console.log('Prep time:', prep2h, 'minutes');
console.log('Buffer:', buffer, 'minutes');
console.log('Minimum delivery time:', minDelivery2h, 'minutes');
console.log('That is:', Math.floor(minDelivery2h/60) + ':' + ((minDelivery2h%60).toString().padStart(2, '0')));
console.log('Is past midnight?', minDelivery2h >= 1440 ? 'YES - SHOW TOMORROW' : 'NO - SHOW TODAY');

// Test 6 hour prep time  
const prep6h = 6 * 60; // 360 minutes
const minDelivery6h = currentMinutes + prep6h + buffer;
console.log('\n6 HOUR PREP:');
console.log('Prep time:', prep6h, 'minutes');
console.log('Buffer:', buffer, 'minutes');
console.log('Minimum delivery time:', minDelivery6h, 'minutes');
console.log('That is:', Math.floor(minDelivery6h/60) + ':' + ((minDelivery6h%60).toString().padStart(2, '0')));
console.log('Is past midnight?', minDelivery6h >= 1440 ? 'YES - SHOW TOMORROW' : 'NO - SHOW TODAY');

if (minDelivery6h >= 1440) {
  const nextDayMinutes = minDelivery6h - 1440;
  console.log('Next day time would be:', Math.floor(nextDayMinutes/60) + ':' + ((nextDayMinutes%60).toString().padStart(2, '0')));
}

console.log('\n=== CORRECTED LOGIC ===');
console.log('✅ 2h prep: Delivery at 20:51 (8:51 PM) - Show TODAY (16th)');
console.log('✅ 6h prep: Delivery at 00:51 (12:51 AM next day) - Show TOMORROW (17th)');
console.log('❌ Previously it was showing day after tomorrow (18th) due to double condition');
