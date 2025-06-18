/**
 * Client-safe order utility functions
 * These functions can be used in both client and server components
 */

/**
 * Format order for display
 */
export function formatOrderForDisplay(order) {
  return {
    orderId: order.orderId,
    customerName: order.customerInfo.fullName,
    mobileNumber: order.customerInfo.mobileNumber,
    items: order.items.map(item => ({      name: item.name,
      quantity: item.quantity,
      price: item.price,
      discountedPrice: item.discountedPrice,
      selectedWeight: item.selectedWeight,
      total: (item.discountedPrice || item.price) * item.quantity
    })),
    totalAmount: order.totalAmount,
    status: order.status,
    paymentStatus: order.paymentStatus,
    orderDate: order.orderDate,
    estimatedDeliveryDate: order.estimatedDeliveryDate,
    deliveryAddress: {
      area: order.customerInfo.area,
      pinCode: order.customerInfo.pinCode,
      fullAddress: order.customerInfo.fullAddress
    },
    timeSlot: order.timeSlot,
    notes: order.notes
  };
}

/**
 * Get order status display info
 */
export function getOrderStatusInfo(status) {
  const statusMap = {
    pending: {
      label: 'Order Placed',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '🕐',
      description: 'Your order has been placed and is being processed'
    },
    confirmed: {
      label: 'Confirmed',
      color: 'bg-blue-100 text-blue-800',
      icon: '✅',
      description: 'Your order has been confirmed and is being prepared'
    },
    preparing: {
      label: 'Preparing',
      color: 'bg-orange-100 text-orange-800',
      icon: '👨‍🍳',
      description: 'Your delicious cake is being prepared'
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      color: 'bg-purple-100 text-purple-800',
      icon: '🚗',
      description: 'Your order is on the way'
    },
    delivered: {
      label: 'Delivered',
      color: 'bg-green-100 text-green-800',
      icon: '🎉',
      description: 'Your order has been delivered successfully'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800',
      icon: '❌',
      description: 'This order has been cancelled'
    }
  };

  return statusMap[status] || statusMap.pending;
}

/**
 * Validate order delivery date and time
 */
export function validateDeliveryDateTime(deliveryDate, timeSlot) {
  const now = new Date();
  const delivery = new Date(deliveryDate);
  
  // Check if delivery date is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  delivery.setHours(0, 0, 0, 0);
  
  if (delivery < today) {
    return {
      isValid: false,
      error: 'Delivery date cannot be in the past'
    };
  }

  // Check if delivery is too far in the future (30 days limit)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  
  if (delivery > maxDate) {
    return {
      isValid: false,
      error: 'Delivery date cannot be more than 30 days from now'
    };
  }
  // Validate time slot format (basic validation - just check it's not empty)
  if (!timeSlot || timeSlot.trim().length === 0) {
    return {
      isValid: false,
      error: 'Time slot is required'
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Calculate estimated preparation time based on items
 */
export function calculatePreparationTime(items) {
  // Base preparation time in hours
  let prepTime = 4;
  
  // Add extra time based on quantity and complexity
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  if (totalItems > 5) {
    prepTime += 2; // Extra 2 hours for large orders
  }
  
  // Check for special items that need more time
  const hasCustomCake = items.some(item => 
    item.name.toLowerCase().includes('custom') || 
    item.name.toLowerCase().includes('designer')
  );
  
  if (hasCustomCake) {
    prepTime += 4; // Extra 4 hours for custom cakes
  }
  
  return `${prepTime}-${prepTime + 2} hours`;
}

/**
 * Get delivery charge based on area
 */
export function getDeliveryCharge(area, totalAmount) {
  const areaCharges = {
    "Rajendra Nagar": 50,
    "Ashok Nagar": 50,
    "Harmu": 60,
    "Lalpur": 70,
    "Kanke": 80,
    "Doranda": 60,
    "Bariatu": 70,
    "Ranchi University": 80,
    "Hatia": 100,
    "Namkum": 120
  };

  const baseCharge = areaCharges[area] || 100;
  
  // Free delivery for orders above ₹1000
  if (totalAmount >= 1000) {
    return 0;
  }
  
  return baseCharge;
}

/**
 * Format date for display
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format time for display
 */
export function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
