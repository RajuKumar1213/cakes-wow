// Quick test to verify delivery time logic
// Simulating: Current time 6:36 PM, 6 hours prep time

const getCurrentTimeInMinutes = () => {
  // Simulate 6:36 PM = 18:36 = 18*60 + 36 = 1116 minutes
  return 18 * 60 + 36; // 1116 minutes from midnight
};

const getMinimumDeliveryTime = (preparationHours) => {
  const currentTimeMinutes = getCurrentTimeInMinutes();
  const preparationMinutes = preparationHours * 60;
  const bufferMinutes = 10;
  
  return currentTimeMinutes + preparationMinutes + bufferMinutes;
};

const convertTo24Hour = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  
  let hours;
  let minutes = 0;
  
  if (time.includes(':')) {
    [hours, minutes] = time.split(':').map(Number);
  } else {
    hours = parseInt(time);
    minutes = 0;
  }
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes; // return in minutes for easier comparison
};

const getSlotStartTime = (slot) => {
  const startTime = slot.split(' - ')[0];
  return convertTo24Hour(startTime);
};

const isSlotAvailable = (slot, preparationHours) => {
  const slotStartTime = getSlotStartTime(slot);
  const minimumDeliveryTime = getMinimumDeliveryTime(preparationHours);
  
  // Handle slots that go past midnight (e.g., "11 PM - 12 AM" or "12 AM - 1 AM")
  // For slots starting at midnight or later, they're effectively "tomorrow" but we treat them as late "today"
  if (slotStartTime < 12 * 60) { // Slot starts between 12 AM - 12 PM (next day morning/afternoon)
    // For early morning slots on "today" (which is actually tomorrow), always available
    return true;
  }
  
  // Handle case where minimum delivery time goes past midnight
  if (minimumDeliveryTime >= 24 * 60) {
    // If minimum delivery is past midnight, check against next day slots
    const adjustedMinDeliveryTime = minimumDeliveryTime - 24 * 60;
    return slotStartTime >= adjustedMinDeliveryTime;
  }
  
  return slotStartTime >= minimumDeliveryTime;
};

const shouldShowTodayInCalendar = (preparationHours) => {
  // Check if any standard delivery slots are available for today
  const standardSlots = [
    "11 AM - 1 PM",
    "1 PM - 3 PM", 
    "3 PM - 6 PM",
    "6 PM - 9 PM",
    "9 PM - 10 PM",
    "10 PM - 11 PM",
    "11 PM - 12 AM",
    "12 AM - 1 AM"
  ];
  
  // If any slot is available, show today
  const hasAvailableSlot = standardSlots.some(slot => 
    isSlotAvailable(slot, preparationHours)
  );
  
  return hasAvailableSlot;
};

// Test with 6 hours prep time (worst case scenario)
const prepTime = 6;
const currentTime = getCurrentTimeInMinutes();
const minDeliveryTime = getMinimumDeliveryTime(prepTime);
const minDeliveryHour = Math.floor(minDeliveryTime / 60);
const minDeliveryMinutes = minDeliveryTime % 60;
const showToday = shouldShowTodayInCalendar(prepTime);

console.log('=== DELIVERY TIME TEST ===');
console.log(`Current time: ${Math.floor(currentTime/60)}:${String(currentTime%60).padStart(2,'0')} (${currentTime} min)`);
console.log(`Prep time: ${prepTime} hours`);
console.log(`Min delivery time: ${minDeliveryHour}:${String(minDeliveryMinutes).padStart(2,'0')} (${minDeliveryTime} min)`);
console.log(`Show today: ${showToday}`);
console.log('');

// Test available slots
const testSlots = [
  "6 PM - 9 PM",
  "9 PM - 10 PM", 
  "10 PM - 11 PM",
  "11 PM - 12 AM",
  "12 AM - 1 AM"
];

console.log('=== SLOT AVAILABILITY ===');
testSlots.forEach(slot => {
  const available = isSlotAvailable(slot, prepTime);
  const slotStart = getSlotStartTime(slot);
  const slotHour = Math.floor(slotStart / 60);
  const slotMin = slotStart % 60;
  console.log(`${slot}: ${available ? 'AVAILABLE' : 'NOT AVAILABLE'} (starts at ${slotHour}:${String(slotMin).padStart(2,'0')})`);
});

// Test with 4 hours prep time (better case scenario)
console.log('\n=== WITH 4 HOURS PREP TIME ===');
const prepTime4 = 4;
const minDeliveryTime4 = getMinimumDeliveryTime(prepTime4);
const minDeliveryHour4 = Math.floor(minDeliveryTime4 / 60);
const minDeliveryMinutes4 = minDeliveryTime4 % 60;
const showToday4 = shouldShowTodayInCalendar(prepTime4);

console.log(`Min delivery time: ${minDeliveryHour4}:${String(minDeliveryMinutes4).padStart(2,'0')} (${minDeliveryTime4} min)`);
console.log(`Show today: ${showToday4}`);

testSlots.forEach(slot => {
  const available = isSlotAvailable(slot, prepTime4);
  console.log(`${slot}: ${available ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
});
