// Test current delivery logic at 6:36 PM with 4-6 hours prep time

// Mock current time to 6:36 PM (18:36)
const mockCurrentTime = () => {
  const now = new Date();
  now.setHours(18, 36, 0, 0); // 6:36 PM
  return now.getHours() * 60 + now.getMinutes(); // 1116 minutes from midnight
};

// Mock functions
const getCurrentTimeInMinutes = mockCurrentTime;

const getMinimumDeliveryTime = (preparationHours) => {
  const currentTimeMinutes = getCurrentTimeInMinutes();
  const preparationMinutes = preparationHours * 60;
  const bufferMinutes = 10;
  return currentTimeMinutes + preparationMinutes + bufferMinutes;
};

const convertTo24Hour = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  let hours = parseInt(time);
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  return hours * 60; // Return minutes from midnight
};

const getSlotStartTime = (slot) => {
  const startTime = slot.split(' - ')[0];
  return convertTo24Hour(startTime);
};

const isSlotAvailable = (slot, selectedDate, preparationHours) => {
  // For today, check if slot start time is after minimum delivery time
  const slotStartTime = getSlotStartTime(slot);
  const minimumDeliveryTime = getMinimumDeliveryTime(preparationHours);
  
  console.log(`Slot: ${slot}`);
  console.log(`  Slot start time: ${Math.floor(slotStartTime/60)}:${String(slotStartTime%60).padStart(2,'0')} (${slotStartTime} minutes)`);
  console.log(`  Min delivery time: ${Math.floor(minimumDeliveryTime/60)}:${String(minimumDeliveryTime%60).padStart(2,'0')} (${minimumDeliveryTime} minutes)`);
  
  // Handle late night slots (12 AM - early morning) that are technically "tomorrow"
  if (slotStartTime < 6 * 60) { // Slots before 6 AM are considered next day
    if (minimumDeliveryTime >= 24 * 60) {
      const nextDayMinTime = minimumDeliveryTime - 24 * 60;
      const available = slotStartTime >= nextDayMinTime;
      console.log(`  Late night slot - Next day min time: ${Math.floor(nextDayMinTime/60)}:${String(nextDayMinTime%60).padStart(2,'0')} - Available: ${available}`);
      return available;
    }
    console.log(`  Late night slot but min delivery still today - Available: false`);
    return false;
  }
  
  // For regular slots today
  const available = slotStartTime >= minimumDeliveryTime;
  console.log(`  Regular slot - Available: ${available}`);
  return available;
};

console.log("=== CURRENT TIME TEST ===");
console.log(`Current time: 6:36 PM (${getCurrentTimeInMinutes()} minutes from midnight)`);
console.log("");

console.log("=== 4 HOURS PREP TIME ===");
const min4h = getMinimumDeliveryTime(4);
console.log(`Minimum delivery time with 4h prep: ${Math.floor(min4h/60)}:${String(min4h%60).padStart(2,'0')} (${min4h} minutes)`);

const slots = [
  "6 PM - 9 PM",
  "9 PM - 10 PM", 
  "10 PM - 11 PM",
  "11 PM - 12 AM",
  "12 AM - 1 AM"
];

slots.forEach(slot => {
  isSlotAvailable(slot, "today", 4);
});

console.log("");
console.log("=== 6 HOURS PREP TIME ===");
const min6h = getMinimumDeliveryTime(6);
console.log(`Minimum delivery time with 6h prep: ${Math.floor(min6h/60)}:${String(min6h%60).padStart(2,'0')} (${min6h} minutes)`);

slots.forEach(slot => {
  isSlotAvailable(slot, "today", 6);
});
