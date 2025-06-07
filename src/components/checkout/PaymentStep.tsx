import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { calculateOrderSummary, formatPrice } from '@/utils/calculations';
import { deliveryTypes } from '@/constants/checkout';
import { ArrowLeft } from 'lucide-react';

export const PaymentStep: React.FC = () => {
  const { items: cart } = useCart();
  const { state, goToPreviousStep } = useCheckout();
  const [selectedAddOns, setSelectedAddOns] = useState<any[]>([]);
  const [addOnQuantities, setAddOnQuantities] = useState<{ [key: string]: number }>({});

  // Load add-ons from localStorage
  useEffect(() => {
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
      }
    } catch (error) {
      console.error('Error loading selected add-ons:', error);
    }
  }, []);

  // Calculate add-ons total
  const getAddOnsTotal = () => {
    return selectedAddOns.reduce((total, addOn) => {
      const quantity = addOnQuantities[addOn._id] || 1;
      return total + (addOn.price * quantity);
    }, 0);
  };

  // Get selected delivery type and price
  const getSelectedDeliveryType = () => {
    if (!state.orderForm.deliveryType) return null;
    return deliveryTypes.find(type => type.id === state.orderForm.deliveryType);
  };

  const getDeliveryPrice = () => {
    const deliveryType = getSelectedDeliveryType();
    return deliveryType ? deliveryType.price : 0;
  };

  // Calculate totals
  const orderSummary = calculateOrderSummary(cart, state.orderForm.deliveryType || 'standard');
  const addOnsTotal = getAddOnsTotal();
  const deliveryPrice = getDeliveryPrice();
  const finalTotal = orderSummary.subtotal + addOnsTotal + deliveryPrice + orderSummary.platformFee + orderSummary.gst;

  return (    <div className="p-3 md:p-6">
      <h1 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Payment Step</h1>
        <div className="space-y-3 md:space-y-4">
        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
          <h3 className="text-sm md:text-base font-semibold mb-2">Order Summary:</h3>
          <p className="text-sm">Items: {cart.length} cakes</p>
          <p className="text-sm">Items Total: {formatPrice(orderSummary.subtotal)}</p>
        </div>

        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
          <h3 className="text-sm md:text-base font-semibold mb-2">Add-ons:</h3>
          <p className="text-sm">Add-ons Count: {selectedAddOns.length}</p>
          <p className="text-sm">Add-ons Total: {formatPrice(addOnsTotal)}</p>
        </div>

        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
          <h3 className="text-sm md:text-base font-semibold mb-2">Delivery:</h3>
          <p className="text-sm">Delivery Type: {getSelectedDeliveryType()?.name || 'Not selected'}</p>
          <p className="text-sm">Delivery Price: {formatPrice(deliveryPrice)}</p>
        </div><div className="bg-pink-50 p-4 rounded-lg border-2 border-pink-200">
          <h3 className="font-bold text-lg mb-2">Final Total:</h3>
          <p className="text-xl font-bold text-pink-600">{formatPrice(finalTotal)}</p>
        </div>

        {/* Back Button */}
        <div className="mt-6 flex justify-start">
          <button
            onClick={goToPreviousStep}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};
