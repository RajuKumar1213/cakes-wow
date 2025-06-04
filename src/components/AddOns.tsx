'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Plus, Check } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface AddOn {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
}

interface AddOnsProps {
  showTitle?: boolean;
  layout?: 'grid' | 'list';
  maxItems?: number;
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

const AddOns: React.FC<AddOnsProps> = ({
  showTitle = true,
  layout = 'grid',
  maxItems
}) => {
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const { showSuccess } = useToast();

  // Load selected add-ons from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SELECTED_ADDONS_KEY);
      if (saved) {
        setSelectedAddOns(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading selected add-ons:', error);
    }
  }, []);

  // Save to localStorage whenever selectedAddOns changes
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_ADDONS_KEY, JSON.stringify(selectedAddOns));
    } catch (error) {
      console.error('Error saving selected add-ons:', error);
    }
  }, [selectedAddOns]);

  const displayAddOns = maxItems ? defaultAddOns.slice(0, maxItems) : defaultAddOns;

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

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-800">Make it Extra Special</h3>
          <p className="text-gray-600">Add magical touches to your order</p>
          {selectedAddOns.length > 0 && (
            <div className="inline-block bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-medium">
              {selectedAddOns.length} add-on{selectedAddOns.length > 1 ? 's' : ''} selected (₹{getTotalPrice()})
            </div>
          )}
        </div>
      )}

      <div className={`grid gap-4 ${
        layout === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {displayAddOns.map((addOn) => (
          <div
            key={addOn._id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-40">
              <Image
                src={addOn.image}
                alt={addOn.name}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback to a default image if the specified image fails to load
                  e.currentTarget.src = "/images/heart.webp";
                }}
              />
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">
                  {addOn.name}
                </h4>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`w-3 h-3 ${
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
                <span className="text-lg font-bold text-gray-900">
                  ₹{addOn.price}
                </span>
                <button
                  onClick={() => handleAddOnToggle(addOn)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isSelected(addOn._id)
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSelected(addOn._id) ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary section when add-ons are selected */}
      {selectedAddOns.length > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
          <div className="text-center">
            <h4 className="font-semibold text-pink-800 mb-2">Selected Add-ons</h4>
            <div className="space-y-1">
              {selectedAddOns.map((addOn) => (
                <div key={addOn._id} className="flex justify-between items-center text-sm">
                  <span className="text-pink-700">{addOn.name}</span>
                  <span className="font-medium text-pink-800">₹{addOn.price}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-pink-200 mt-2 pt-2">
              <div className="flex justify-between items-center font-bold text-pink-800">
                <span>Total Add-ons:</span>
                <span>₹{getTotalPrice()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOns;
