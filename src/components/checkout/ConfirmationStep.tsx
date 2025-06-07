import React from 'react';
import { CheckCircle } from 'lucide-react';
import { CartItem } from '@/contexts/CartContext';

interface ConfirmationStepProps {
  items: CartItem[];
  selectedAddOns: any[];
  addOnQuantities: { [key: string]: number };
  calculateTotal: () => number;
  getAddOnsTotal: () => number;
  getDeliveryCharge: () => number;
  getFinalTotal: () => number;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  items,
  selectedAddOns,
  addOnQuantities,
  calculateTotal,
  getAddOnsTotal,
  getDeliveryCharge,
  getFinalTotal,
}) => {
  return (
    <div className="text-center space-y-4 md:space-y-6">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
      </div>

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Thank you for your order. We'll send you a confirmation
          email shortly.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 md:p-6 max-w-md mx-auto">
        <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">
          Order Summary
        </h3>
        <div className="space-y-2 text-xs md:text-sm">
          <div className="flex justify-between">
            <span>Items ({items.length})</span>
            <span>₹{calculateTotal()}</span>
          </div>
          {selectedAddOns.length > 0 && (
            <div className="flex justify-between">
              <span>Add-ons ({selectedAddOns.length})</span>
              <span>₹{getAddOnsTotal()}</span>
            </div>
          )}
          {getDeliveryCharge() > 0 && (
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>₹{getDeliveryCharge()}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{getFinalTotal()}</span>
          </div>
        </div>
      </div>

      <div className="text-orange-600 font-medium animate-pulse text-sm md:text-base">
        Redirecting to order confirmation...
      </div>
    </div>
  );
};
