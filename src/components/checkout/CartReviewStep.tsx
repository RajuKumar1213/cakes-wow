import React from 'react';
import Image from 'next/image';
import { Gift, Star } from 'lucide-react';
import { CartItem } from '@/contexts/CartContext';

interface CartReviewStepProps {
  items: CartItem[];
  selectedAddOns: any[];
  addOnQuantities: { [key: string]: number };
  calculateTotal: () => number;
  getAddOnsTotal: () => number;
}

export const CartReviewStep: React.FC<CartReviewStepProps> = ({
  items,
  selectedAddOns,
  addOnQuantities,
  calculateTotal,
  getAddOnsTotal,
}) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Review Your Cart
        </h2>
        <span className="text-xs md:text-sm text-gray-500">
          {items.length} item(s)
        </span>
      </div>

      {/* Cart Items */}
      <div className="divide-y divide-gray-200">
        {items.map((item: CartItem) => (
          <div key={item._id} className="py-3 md:py-4">
            <div className="flex items-start space-x-3 md:space-x-4">
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.imageUrl || "/placeholder-cake.jpg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2">
                  {item.name}
                </h3>
                {item.selectedWeight && (
                  <p className="text-xs text-gray-500">
                    Weight: {item.selectedWeight}
                  </p>
                )}
                <p className="text-xs md:text-sm text-gray-600">
                  ₹{item.discountedPrice || item.price} × {item.quantity}
                </p>
              </div>
              <div className="text-xs md:text-sm font-medium text-gray-900">
                ₹{(item.discountedPrice || item.price) * item.quantity}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Add-ons */}
      {selectedAddOns.length > 0 && (
        <div className="border-t pt-3 md:pt-4">
          <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3 flex items-center">
            <Gift className="w-4 h-4 mr-2 text-pink-500" />
            Selected Add-ons
          </h3>
          <div className="space-y-2">
            {selectedAddOns.map((addOn) => (
              <div
                key={addOn._id}
                className="flex items-center justify-between p-2 bg-pink-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-pink-500" />
                  <span className="text-xs md:text-sm text-gray-800">
                    {addOn.name} × {addOnQuantities[addOn._id] || 1}
                  </span>
                </div>
                <div className="text-xs md:text-sm font-medium text-pink-600">
                  ₹{addOn.price * (addOnQuantities[addOn._id] || 1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Offers */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4">
        <div className="flex items-start">
          <Gift className="w-4 h-4 md:w-5 md:h-5 text-orange-600 mt-0.5 mr-2 md:mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm md:text-base font-medium text-orange-900">
              Special Offer!
            </h4>
            <p className="text-xs md:text-sm text-orange-700 mt-1">
              Free delivery on orders above ₹500. You qualify for free delivery!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
