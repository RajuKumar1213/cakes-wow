/**
 * Utility functions for calculating delivery times based on preparation time
 */

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DeliveryType {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  popular?: boolean;
  premium?: boolean;
  timeSlots: TimeSlot[];
}

/**
 * Parse preparation time string and return hours
 * Examples: "3 hours" -> 3, "4-6 hours" -> 6 (taking maximum), "2 Hours" -> 2
 */
export const parsePreparationTime = (prepTime: string): number => {
  if (!prepTime) return 4; // default 4 hours

  
  const lowerCaseTime = prepTime.toLowerCase();
  
  // Handle range format like "4-6 hours"
  const rangeMatch = lowerCaseTime.match(/(\d+)\s*-\s*(\d+)\s*hours?/);
  if (rangeMatch) {
    return parseInt(rangeMatch[2]); // Take the maximum time
  }
  
  // Handle single number format like "3 hours"
  const singleMatch = lowerCaseTime.match(/(\d+)\s*hours?/);
  if (singleMatch) {
    return parseInt(singleMatch[1]);
  }
  
  return 4; // fallback
};

/**
 * Get the maximum preparation time from cart items
 */
export const getMaxPreparationTime = (cartItems: any[]): number => {
  if (!cartItems || cartItems.length === 0) return 4;


  
  const maxPrepTime = cartItems.reduce((max, item) => {
    const itemPrepTime = parsePreparationTime(item.preparationTime || '4 hours');
    return Math.max(max, itemPrepTime);
  }, 0);
  
  return maxPrepTime || 4; // Ensure we always return at least 4 hours as fallback
};

/**
 * Convert time string to 24-hour format for comparison
 * Examples: "9 AM" -> 9, "11 PM" -> 23, "12 PM" -> 12, "12 AM" -> 0
 */
export const convertTo24Hour = (timeStr: string): number => {
  const [time, period] = timeStr.split(' ');
  
  let hours: number;
  let minutes: number = 0;
  
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

/**
 * Get start time from time slot string
 * Example: "11 AM - 1 PM" -> 11 AM in minutes
 */
export const getSlotStartTime = (slot: string): number => {
  const startTime = slot.split(' - ')[0];
  return convertTo24Hour(startTime);
};

/**
 * Get end time from time slot string
 * Example: "11 AM - 1 PM" -> 1 PM in minutes
 */
export const getSlotEndTime = (slot: string): number => {
  const endTime = slot.split(' - ')[1];
  return convertTo24Hour(endTime);
};

/**
 * Check if selected date is today
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const selectedDateObj = new Date(dateString);
  return today.toDateString() === selectedDateObj.toDateString();
};

/**
 * Check if selected date is tomorrow
 */
export const isTomorrow = (dateString: string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const selectedDateObj = new Date(dateString);
  return tomorrow.toDateString() === selectedDateObj.toDateString();
};

/**
 * Get current time in minutes from midnight
 */
export const getCurrentTimeInMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

/**
 * Get minimum delivery time based on current time and preparation time
 * Returns the earliest possible delivery time in minutes from midnight
 */
export const getMinimumDeliveryTime = (preparationHours: number): number => {
  const currentTimeMinutes = getCurrentTimeInMinutes();
  const preparationMinutes = preparationHours * 60;
  const bufferMinutes = 10; // Reduced buffer to 10 minutes for more flexibility
  
  return currentTimeMinutes + preparationMinutes + bufferMinutes;
};

/**
 * Check if a time slot is available based on preparation time
 */
export const isSlotAvailable = (
  slot: string, 
  selectedDate: string, 
  preparationHours: number
): boolean => {
  // For future dates, all slots are available
  if (!isToday(selectedDate)) {
    return true;
  }
  
  // For today, check if slot start time is after minimum delivery time
  const slotStartTime = getSlotStartTime(slot);
  const minimumDeliveryTime = getMinimumDeliveryTime(preparationHours);
  
  // Handle late night slots (12 AM - early morning) that are technically "tomorrow"
  // but we show them as available for "today" selection
  if (slotStartTime < 6 * 60) { // Slots before 6 AM are considered next day
    // If minimum delivery time goes past midnight, these slots might be available
    if (minimumDeliveryTime >= 24 * 60) {
      const nextDayMinTime = minimumDeliveryTime - 24 * 60;
      return slotStartTime >= nextDayMinTime;
    }
    // If minimum delivery time is still today, these early morning slots are not available
    return false;
  }
  
  // For regular slots today, check if slot start time is after minimum delivery time
  return slotStartTime >= minimumDeliveryTime;
};

/**
 * Check if a delivery type should be available based on preparation time and current time
 */
export const isDeliveryTypeAvailable = (
  deliveryType: DeliveryType,
  selectedDate: string,
  preparationHours: number
): boolean => {
  if (!isToday(selectedDate)) {
    return true; // All delivery types available for future dates
  }
  
  // Check if any slot in this delivery type is available
  return deliveryType.timeSlots.some(slot => 
    isSlotAvailable(slot.time, selectedDate, preparationHours)
  );
};

/**
 * Filter available time slots based on preparation time
 */
export const getAvailableTimeSlots = (
  timeSlots: TimeSlot[],
  selectedDate: string,
  preparationHours: number
): TimeSlot[] => {
  return timeSlots.filter(slot => 
    isSlotAvailable(slot.time, selectedDate, preparationHours)
  );
};

/**
 * Get the earliest available date for delivery based on preparation time
 */
export const getEarliestDeliveryDate = (preparationHours: number): Date => {
  const now = new Date();
  const minimumDeliveryTime = getMinimumDeliveryTime(preparationHours);
  
  // If minimum delivery time is past midnight (>= 1440 minutes = 24:00),
  // then we need next day delivery
  if (minimumDeliveryTime >= 1440) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  return now; // Today is available
};

/**
 * Check if calendar should show today as available
 */
export const shouldShowTodayInCalendar = (preparationHours: number): boolean => {
  // Get today's date as a string
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
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
    isSlotAvailable(slot, todayString, preparationHours)
  );
  
  return hasAvailableSlot;
};

/**
 * Get formatted minimum delivery time for display
 */
export const getMinimumDeliveryTimeForDisplay = (preparationHours: number): string => {
  const minimumDeliveryTime = getMinimumDeliveryTime(preparationHours);
  const hours = Math.floor(minimumDeliveryTime / 60);
  const minutes = minimumDeliveryTime % 60;
  
  // Convert to 12-hour format
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${displayHours}:${displayMinutes} ${period}`;
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
