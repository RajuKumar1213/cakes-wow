'use client';

import React, { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ShoppingCart, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  Home,
  CreditCard,
  CheckCircle
} from 'lucide-react';

// Area to PIN code mapping
const areaPinMap = {
  "Rajendra Nagar": "834001",
  "Ashok Nagar": "834002", 
  "Harmu": "834003",
  "Lalpur": "834004",
  "Kanke": "834005",
  "Doranda": "834006",
  "Bariatu": "834007",
  "Ranchi University": "834008",
  "Hatia": "834009",
  "Namkum": "834010"
};

// Time slot options
const timeSlots = [
  "9:00 AM - 12:00 PM",
  "12:00 PM - 3:00 PM", 
  "3:00 PM - 6:00 PM",
  "6:00 PM - 9:00 PM"
];

interface OrderForm {
  fullName: string;
  mobileNumber: string;
  deliveryDate: string;
  timeSlot: string;
  area: string;
  pinCode: string;
  fullAddress: string;
}

// Extended version of CartItem interface for local use
interface CheckoutCartItem extends CartItem {
  weightPrice?: number;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  // Form state
  const [orderForm, setOrderForm] = useState<OrderForm>({
    fullName: '',
    mobileNumber: '',
    deliveryDate: '',
    timeSlot: '',
    area: '',
    pinCode: '',
    fullAddress: ''
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<OrderForm>>({});
  const [orderSuccess, setOrderSuccess] = useState(false);  // Calculate total price
  const calculateTotal = (): number => {
    return items.reduce((total: number, item: CartItem) => {
      const price = item.discountedPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setOrderForm(prev => ({
        ...prev,
        mobileNumber: user.phoneNumber || ''
      }));
    }
  }, [user]);
  // Auto-fill PIN code when area is selected
  const handleAreaChange = (area: string) => {
    setOrderForm(prev => ({
      ...prev,
      area,
      pinCode: area in areaPinMap ? areaPinMap[area as keyof typeof areaPinMap] : ''
    }));
    
    // Clear area error if it exists
    if (errors.area) {
      setErrors(prev => ({ ...prev, area: undefined }));
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<OrderForm> = {};

    if (!orderForm.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!orderForm.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(orderForm.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!orderForm.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    } else {
      const selectedDate = new Date(orderForm.deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.deliveryDate = 'Delivery date cannot be in the past';
      }
    }

    if (!orderForm.timeSlot) {
      newErrors.timeSlot = 'Time slot is required';
    }

    if (!orderForm.area) {
      newErrors.area = 'Area is required';
    }

    if (!orderForm.fullAddress.trim()) {
      newErrors.fullAddress = 'Full address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Handle order submission
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      showError('Please fill all required fields correctly', 'Form Error');
      return;
    }

    if (items.length === 0) {
      showError('Your cart is empty', 'Cart Error');
      return;
    }

    setIsSubmitting(true);    try {
      const orderData = {
        items: items.map((item: CartItem) => ({
          productId: item.productId,
          name: item.name,
          price: item.discountedPrice || item.price,
          quantity: item.quantity,
          selectedWeight: item.selectedWeight,
          imageUrl: item.imageUrl
        })),
        customerInfo: orderForm,
        totalAmount: calculateTotal(),
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();
      
      // Clear cart and show success
      clearCart();
      setOrderSuccess(true);
      showSuccess('Order Placed Successfully!', 'Your order has been placed and will be delivered on time.');

      // Redirect to order confirmation page after 3 seconds
      setTimeout(() => {
        router.push(`/order-confirmation/${result.orderId}`);
      }, 3000);    } catch (error) {
      console.error('Order placement error:', error);
      showError('Failed to place order. Please try again.', 'Order Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="font-poppins text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some delicious cakes to your cart first!</p>
          <button
            onClick={() => router.push('/')}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="font-poppins text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 text-lg mb-6">
            Thank you for your order. You will receive a confirmation message shortly.
          </p>
          <div className="animate-pulse text-pink-600 font-medium">
            Redirecting to order confirmation...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Review your order and complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Summary
              </h2>              <div className="space-y-4 mb-6">
                {items.map((item: CartItem) => (
                  <div key={`${item.productId}-${item.selectedWeight || 'default'}`} className="flex items-center space-x-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={item.imageUrl || '/placeholder-cake.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.selectedWeight && (
                        <p className="text-xs text-gray-500">Weight: {item.selectedWeight}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        ₹{item.discountedPrice || item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{(item.discountedPrice || item.price) * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Information</h2>
              
              <form className="space-y-6">
                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={orderForm.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={orderForm.mobileNumber}
                      onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter 10-digit mobile number"
                    />
                    {errors.mobileNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      value={orderForm.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      min={getMinDate()}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.deliveryDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Time Slot *
                    </label>
                    <select
                      value={orderForm.timeSlot}
                      onChange={(e) => handleInputChange('timeSlot', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        errors.timeSlot ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    {errors.timeSlot && (
                      <p className="text-red-500 text-sm mt-1">{errors.timeSlot}</p>
                    )}
                  </div>
                </div>

                {/* Area & PIN Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Area *
                    </label>
                    <select
                      value={orderForm.area}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        errors.area ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select your area</option>
                      {Object.keys(areaPinMap).map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                    {errors.area && (
                      <p className="text-red-500 text-sm mt-1">{errors.area}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={orderForm.pinCode}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="Auto-filled based on area"
                    />
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Home className="w-4 h-4 inline mr-1" />
                    Full Address *
                  </label>
                  <textarea
                    value={orderForm.fullAddress}
                    onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.fullAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your complete address with landmarks"
                  />
                  {errors.fullAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullAddress}</p>
                  )}
                </div>

                {/* Place Order Button */}
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Place Order (₹{calculateTotal()})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
