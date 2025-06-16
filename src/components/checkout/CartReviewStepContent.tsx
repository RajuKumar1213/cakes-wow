'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { calculateOrderSummary, formatPrice } from '@/utils/calculations';
import { deliveryTypes } from '@/constants/checkout';
import Image from 'next/image';
import { Gift, Plus, Minus, Star, ArrowLeft } from 'lucide-react';

const CartReviewStepContent: React.FC = () => {
  const { items: cart, updateQuantity, removeFromCart } = useCart();
  const { state, goToNextStep, goToPreviousStep, dispatch } = useCheckout();
  const [selectedAddOns, setSelectedAddOns] = useState<any[]>([]);
  const [addOnQuantities, setAddOnQuantities] = useState<{ [key: string]: number }>({});

  // Load add-ons from localStorage
  const loadAddOnsFromStorage = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('bakingo-selected-addons');
      const savedQuantities = localStorage.getItem('bakingo-addon-quantities');
      
      if (saved) {
        const addOns = JSON.parse(saved);
        setSelectedAddOns(addOns);
        
        let quantities: { [key: string]: number } = {};
        if (savedQuantities) {
          quantities = JSON.parse(savedQuantities);
        }
        
        addOns.forEach((addOn: any) => {
          if (!quantities[addOn._id]) {
            quantities[addOn._id] = 1;
          }
        });
        
        setAddOnQuantities(quantities);
      } else {        setSelectedAddOns([]);
        setAddOnQuantities({});
      }
    } catch (error) {
      // Error loading add-ons - silent fail
    }
  }, []);

  // Load add-ons on component mount
  useEffect(() => {
    loadAddOnsFromStorage();

    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bakingo-selected-addons' || e.key === 'bakingo-addon-quantities') {
        loadAddOnsFromStorage();
      }
    };

    const handleCustomStorageChange = () => {
      loadAddOnsFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('addons-updated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('addons-updated', handleCustomStorageChange);
    };
  }, [loadAddOnsFromStorage]);

  // Update add-on quantity
  const updateAddOnQuantity = (addOnId: string, newQuantity: number) => {
    if (typeof window === 'undefined') return;
    
    if (newQuantity <= 0) {
      const updatedAddOns = selectedAddOns.filter(addOn => addOn._id !== addOnId);
      setSelectedAddOns(updatedAddOns);
      localStorage.setItem('bakingo-selected-addons', JSON.stringify(updatedAddOns));

      const newQuantities = { ...addOnQuantities };
      delete newQuantities[addOnId];
      setAddOnQuantities(newQuantities);
      localStorage.setItem('bakingo-addon-quantities', JSON.stringify(newQuantities));

      window.dispatchEvent(new CustomEvent('addons-updated'));
    } else {
      const newQuantities = {
        ...addOnQuantities,
        [addOnId]: newQuantity
      };
      setAddOnQuantities(newQuantities);
      localStorage.setItem('bakingo-addon-quantities', JSON.stringify(newQuantities));
    }
  };
  // Calculate add-ons total
  const getAddOnsTotal = () => {
    return selectedAddOns.reduce((total, addOn) => {
      const quantity = addOnQuantities[addOn._id] || 1;
      return total + (addOn.price * quantity);
    }, 0);
  };

  // Get selected delivery type
  const getSelectedDeliveryType = () => {
    if (!state.orderForm.deliveryType) return null;
    return deliveryTypes.find(type => type.id === state.orderForm.deliveryType);
  };

  // Get delivery price
  const getDeliveryPrice = () => {
    const deliveryType = getSelectedDeliveryType();
    return deliveryType ? deliveryType.price : 0;
  };
  // Handle proceed to checkout (create order and go to step 3)
  const handleProceedToCheckout = async () => {
    try {      // Calculate totals
      const addOnsTotal = getAddOnsTotal();
      const deliveryPrice = getDeliveryPrice();
      const finalTotal = orderSummary.subtotal + addOnsTotal + deliveryPrice;// Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId || item._id,
          name: item.name,
          price: item.discountedPrice || item.price,
          quantity: item.quantity,
          selectedWeight: item.selectedWeight || '',
          imageUrl: item.imageUrl || '',
        })),
        customerInfo: {
          fullName: state.orderForm.fullName,
          mobileNumber: state.orderForm.mobileNumber.replace(/\s+/g, '').replace(/^\+91/, ''), // Clean mobile number
          email: state.orderForm.email,
          deliveryDate: state.orderForm.deliveryDate,
          timeSlot: state.orderForm.timeSlot,
          area: state.orderForm.area,
          pinCode: state.orderForm.pinCode,
          fullAddress: state.orderForm.fullAddress,
          deliveryOccasion: state.orderForm.deliveryOccasion || '',
          relation: state.orderForm.relation || '',
          senderName: state.orderForm.senderName || '',
          messageOnCard: state.orderForm.messageOnCard || '',
          specialInstructions: state.orderForm.specialInstructions || '',
        },        totalAmount: finalTotal,
        subtotal: orderSummary.subtotal,
        deliveryCharge: deliveryPrice,
        notes: state.orderForm.specialInstructions || '',
        // Include add-ons in notes for reference
        selectedAddOns: selectedAddOns,
        addOnQuantities: addOnQuantities,      };

      // Create order in database
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }      const result = await response.json();

      // Store order details in context for payment step
      localStorage.setItem('pending-order', JSON.stringify(result.order));      // Proceed to payment step
      dispatch({ type: 'SET_STEP', payload: 3 });
      
    } catch (error) {
      // Show error message to user (you might want to add a toast notification here)
      alert('Failed to create order. Please try again.');
    }
  };

  const orderSummary = calculateOrderSummary(cart, state.orderForm.deliveryType || 'standard');
  if (cart.length === 0) {
    return (
      <div className="p-3 md:p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">Add some delicious cakes to get started!</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 md:px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm md:text-base"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">Review Your Order</h2>
        <p className="text-sm md:text-base text-gray-600">Check your items and delivery details before proceeding to payment</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 md:gap-6">        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-2 md:space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-3 md:p-4">
              <div className="flex items-start space-x-2 md:space-x-4">
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.imageUrl || "/placeholder-cake.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-medium text-gray-900">{item.name}</h3>
                  {item.selectedWeight && (
                    <p className="text-xs md:text-sm text-gray-600">Weight: {item.selectedWeight}</p>
                  )}
                  <p className="text-xs md:text-sm text-gray-600">
                    {formatPrice(item.discountedPrice || item.price)} each
                  </p>
                  
                  {/* Show cart item's selected add-ons if any */}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <div className="mt-2 p-2 bg-pink-50 rounded border border-pink-200">
                      <h4 className="text-xs font-semibold text-pink-800 mb-1">Included Add-ons:</h4>
                      <div className="space-y-1">
                        {item.selectedAddOns.map((addOn, index) => (
                          <div key={index} className="flex justify-between items-center text-xs">
                            <span className="text-pink-700">{addOn.name}</span>
                            <span className="font-medium text-pink-800">₹{addOn.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                    {/* Quantity controls */}
                  <div className="flex items-center space-x-1 md:space-x-2 mt-1 md:mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                    <span className="w-6 md:w-8 text-center font-medium text-sm md:text-base">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm md:text-base font-semibold text-gray-900">
                    {formatPrice((item.discountedPrice || item.price) * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs md:text-sm text-red-600 hover:text-red-700 mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}          {/* Selected Add-ons Section */}
          {selectedAddOns.length > 0 && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 md:p-4 border border-pink-200">
              <div className="flex items-center space-x-2 mb-3 md:mb-4">
                <Gift className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
                <h3 className="text-sm md:text-base font-semibold text-gray-900">Selected Add-ons</h3>
              </div>
              
              <div className="space-y-2 md:space-y-3">
                {selectedAddOns.map((addOn) => (
                  <div key={addOn._id} className="flex items-center justify-between p-2 md:p-3 bg-white rounded border border-pink-200">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="relative w-8 h-8 md:w-12 md:h-12 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={addOn.image}
                          alt={addOn.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/images/heart.webp";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-xs md:text-sm">{addOn.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-2 h-2 md:w-3 md:h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{addOn.rating}</span>
                          <span className="text-xs text-gray-500 ml-1 md:ml-2">₹{addOn.price} each</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-gray-100 rounded">
                        <button
                          onClick={() => updateAddOnQuantity(addOn._id, (addOnQuantities[addOn._id] || 1) - 1)}
                          className="p-1 hover:bg-gray-200 rounded-l transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 py-1 font-medium min-w-[2rem] text-center text-sm">
                          {addOnQuantities[addOn._id] || 1}
                        </span>
                        <button
                          onClick={() => updateAddOnQuantity(addOn._id, (addOnQuantities[addOn._id] || 1) + 1)}
                          className="p-1 hover:bg-gray-200 rounded-r transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <span className="font-semibold text-pink-600 text-sm min-w-[3rem] text-right">
                        ₹{(addOn.price * (addOnQuantities[addOn._id] || 1))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-pink-200">
                <div className="flex justify-between items-center font-bold text-base">
                  <span className="text-gray-800">Add-ons Total:</span>
                  <span className="text-pink-600">₹{getAddOnsTotal()}</span>
                </div>
              </div>
            </div>
          )}
        </div>        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({orderSummary.itemCount} items)</span>
                <span>{formatPrice(orderSummary.subtotal)}</span>
              </div>
                {selectedAddOns.length > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons ({selectedAddOns.length} items)</span>
                  <span>{formatPrice(getAddOnsTotal())}</span>
                </div>
              )}
                <div className="flex justify-between">
                <span>
                  {getSelectedDeliveryType() ? 
                    `${getSelectedDeliveryType()?.name} (${getSelectedDeliveryType()?.description})` :
                    'Delivery charges'
                  }
                </span>
                <span>
                  {getDeliveryPrice() === 0 ? 'FREE' : formatPrice(getDeliveryPrice())}
                </span>
              </div>              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatPrice(orderSummary.subtotal + getAddOnsTotal() + getDeliveryPrice())}</span>
                </div>
              </div>
            </div>            {getDeliveryPrice() === 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  🎉 You qualify for FREE delivery!
                </p>
              </div>
            )}            {getSelectedDeliveryType() && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">
                  🚚 {getSelectedDeliveryType()?.name} - {getSelectedDeliveryType()?.description}
                </p>
                {state.orderForm.timeSlot && (
                  <p className="text-xs text-blue-600 mt-1">
                    ⏰ Time Slot: {state.orderForm.timeSlot}
                  </p>
                )}
              </div>
            )}

            {selectedAddOns.length > 0 && (
              <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                <p className="text-sm text-pink-700 font-medium">
                  ✨ {selectedAddOns.length} special add-on{selectedAddOns.length > 1 ? 's' : ''} included!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>      {/* Navigation Buttons */}
      <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <button
          onClick={goToPreviousStep}
          className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base w-full md:w-auto"
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          <span>Back to Delivery Details</span>
        </button>
        
        <button
          onClick={handleProceedToCheckout}
          className="px-6 md:px-8 py-2 md:py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium text-sm md:text-base w-full md:w-auto"
        >
          Process to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartReviewStepContent;
