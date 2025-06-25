/**
 * Utility functions for checkout calculations
 */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  weight?: string;
  image?: string;
  addOns?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

/**
 * Calculate subtotal for cart items
 */
export const calculateSubtotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => {
    const itemTotal = (item.discountedPrice || item.price) * item.quantity;
    const addOnsTotal = item.addOns?.reduce((addOnSum, addOn) => 
      addOnSum + (addOn.price * addOn.quantity), 0) || 0;
    return total + itemTotal + addOnsTotal;
  }, 0);
};

/**
 * Calculate delivery charges based on delivery type and amount
 */
export const calculateDeliveryCharges = (
  deliveryType: string,
  subtotal: number,
  freeDeliveryThreshold: number = 500
): number => {
  if (deliveryType === 'pickup') return 0;
  if (subtotal >= freeDeliveryThreshold) return 0;
  
  const deliveryCharges = {
    standard: 50,
    express: 100,
    asap: 150
  };
  
  return deliveryCharges[deliveryType as keyof typeof deliveryCharges] || 50;
};

/**
 * Calculate platform fee (2% of subtotal, minimum ₹5)
 */
export const calculatePlatformFee = (subtotal: number): number => {
  const fee = Math.max(subtotal * 0.02, 5);
  return Math.round(fee * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate GST (18% on subtotal + delivery charges)
 */
export const calculateGST = (subtotal: number, deliveryCharges: number): number => {
  const taxableAmount = subtotal + deliveryCharges;
  const gst = taxableAmount * 0.18;
  return Math.round(gst * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate total amount
 */
export const calculateTotal = (
  subtotal: number,
  deliveryCharges: number,
  platformFee: number,
  gst: number,
  discount: number = 0
): number => {
  return subtotal + deliveryCharges + platformFee + gst - discount;
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  return `₹${amount.toFixed(2)}`;
};

/**
 * Calculate order summary
 */
export const calculateOrderSummary = (
  cartItems: CartItem[],
  deliveryType: string,
  discount: number = 0
) => {
  const subtotal = calculateSubtotal(cartItems);
  const deliveryCharges = calculateDeliveryCharges(deliveryType, subtotal);
  const total = subtotal + deliveryCharges - discount;

  return {
    subtotal,
    deliveryCharges,
    discount,
    total,
    itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
  };
};