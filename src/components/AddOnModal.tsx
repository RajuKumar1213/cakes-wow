'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Plus, Check, X, ArrowRight, ShoppingCart } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface AddOn {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
}

interface AddOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onContinue: () => void;
  productName?: string;
}

// Default add-ons data (like Bakingo)
const defaultAddOns: AddOn[] = [
  {
    _id: '1',
    name: "Personalized Message Card",
    price: 50,
    image: "/images/heart.webp",
    rating: 4.8
  },
  {
    _id: '2',
    name: "Premium Gift Wrapping",
    price: 100,
    image: "/images/birthday1.webp",
    rating: 4.9
  },
  {
    _id: '3',
    name: "Surprise Balloon Bouquet",
    price: 150,
    image: "/images/aniversary.webp",
    rating: 4.7
  },
  {
    _id: '4',
    name: "Special Candles Set",
    price: 75,
    image: "/images/chocolate.webp",
    rating: 4.6
  },
  {
    _id: '5',
    name: "Fresh Flowers Bouquet",
    price: 200,
    image: "/images/engagement.webp",
    rating: 4.9
  },
  {
    _id: '6',
    name: "Celebration Confetti",
    price: 40,
    image: "/images/kid.webp",
    rating: 4.5
  }
];

const SELECTED_ADDONS_KEY = 'bakingo-selected-addons';

const AddOnModal: React.FC<AddOnModalProps> = ({
  isOpen,
  onClose,
  onSkip,
  onContinue,
  productName
}) => {
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const { showSuccess } = useToast();

  // Load selected add-ons from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(SELECTED_ADDONS_KEY);
        if (saved) {
          setSelectedAddOns(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading selected add-ons:', error);
      }
    }
  }, [isOpen]);

  // Save to localStorage whenever selectedAddOns changes
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_ADDONS_KEY, JSON.stringify(selectedAddOns));
    } catch (error) {
      console.error('Error saving selected add-ons:', error);
    }
  }, [selectedAddOns]);

  const handleAddOnToggle = (addOn: AddOn) => {
    const isSelected = selectedAddOns.some(item => item._id === addOn._id);
    
    if (isSelected) {
      // Remove from selected
      setSelectedAddOns(prev => prev.filter(item => item._id !== addOn._id));
      showSuccess(
        "Add-on Removed",
        `${addOn.name} removed from your order`,
        "heart"
      );
    } else {
      // Add to selected
      setSelectedAddOns(prev => [...prev, addOn]);
      showSuccess(
        "Add-on Added",
        `${addOn.name} added to your order`,
        "check"
      );
    }
  };

  const isSelected = (addOnId: string) => {
    return selectedAddOns.some(item => item._id === addOnId);
  };

  const getTotalPrice = () => {
    return selectedAddOns.reduce((total, addOn) => total + addOn.price, 0);
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  const handleContinue = () => {
    if (selectedAddOns.length > 0) {
      showSuccess(
        "Add-ons Added!",
        `${selectedAddOns.length} add-ons added to your order`,
        "check"
      );
    }
    onContinue();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-orange-600 text-white p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Make it Extra Special! 🎉</h2>
          <p className="text-pink-100">
            {productName ? `Perfect add-ons for your ${productName}` : 'Add magical touches to your order'}
          </p>
          {selectedAddOns.length > 0 && (
            <div className="mt-3 bg-white/20 rounded-full px-4 py-2 inline-block">
              <span className="text-sm font-medium">
                {selectedAddOns.length} add-on{selectedAddOns.length > 1 ? 's' : ''} selected (₹{getTotalPrice()})
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {defaultAddOns.map((addOn) => (
              <div
                key={addOn._id}
                className={`bg-white rounded-lg shadow-md border-2 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  isSelected(addOn._id) 
                    ? 'border-pink-500 ring-2 ring-pink-100' 
                    : 'border-gray-100 hover:border-pink-200'
                }`}
                onClick={() => handleAddOnToggle(addOn)}
              >
                <div className="relative h-20">
                  <Image
                    src={addOn.image}
                    alt={addOn.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/heart.webp";
                    }}
                  />
                  {/* Selection indicator */}
                  <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected(addOn._id)
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/80 text-gray-400'
                  }`}>
                    {isSelected(addOn._id) ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : (
                      <Plus className="w-2.5 h-2.5" />
                    )}
                  </div>
                </div>
                
                <div className="p-2 space-y-1">
                  <div>                    <h4 className="font-semibold text-gray-800 text-xs mb-1">
                      {addOn.name}
                    </h4>
                    
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`w-2 h-2 ${
                              index < Math.floor(addOn.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">
                          {addOn.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{addOn.price}
                    </span>
                    <div className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      isSelected(addOn._id)
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isSelected(addOn._id) ? 'Added' : 'Add'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Add-ons Summary */}
          {selectedAddOns.length > 0 && (
            <div className="mt-4 bg-pink-50 border border-pink-200 rounded-xl p-3">
              <h4 className="font-semibold text-pink-800 mb-2 text-center text-sm">Selected Add-ons</h4>
              <div className="space-y-1">
                {selectedAddOns.map((addOn) => (
                  <div key={addOn._id} className="flex justify-between items-center text-xs">
                    <span className="text-pink-700">{addOn.name}</span>
                    <span className="font-medium text-pink-800">₹{addOn.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-pink-200 mt-2 pt-2">
                <div className="flex justify-between items-center font-bold text-pink-800 text-sm">
                  <span>Total Add-ons:</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="bg-gray-50 p-4 border-t flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
            >
              Skip Add-ons
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-orange-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Continue to Cart
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOnModal;
