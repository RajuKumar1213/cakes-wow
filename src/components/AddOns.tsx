'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddOns } from '@/hooks/useAddOns';

interface AddOn {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
}

interface AddOnsProps {
  addOns?: AddOn[];
  selectedAddOns?: string[];
  onAddOnToggle?: (addOnId: string) => void;
  showTitle?: boolean;
  layout?: 'grid' | 'list';
  maxItems?: number;
  useApi?: boolean;
}

// Default add-ons data
const defaultAddOns: AddOn[] = [
  {
    _id: '1',
    name: "Personalized Message Card",
    price: 50,
    image: "/images/message-card.jpg",
    rating: 4.8
  },
  {
    _id: '2',
    name: "Premium Gift Wrapping",
    price: 100,
    image: "/images/gift-wrap.jpg",
    rating: 4.9
  },
  {
    _id: '3',
    name: "Surprise Balloon Bouquet",
    price: 150,
    image: "/images/balloons.jpg",
    rating: 4.7
  },
  {
    _id: '4',
    name: "Midnight Delivery",
    price: 200,
    image: "/images/midnight-delivery.jpg",
    rating: 4.6
  },
  {
    _id: '5',
    name: "Scented Candles",
    price: 75,
    image: "/images/candles.jpg",
    rating: 4.5
  },
  {
    _id: '6',
    name: "Fresh Flower Bouquet",
    price: 300,
    image: "/images/flowers.jpg",
    rating: 4.9
  }
];

export default function AddOns({
  addOns: propAddOns,
  selectedAddOns = [],
  onAddOnToggle,
  showTitle = true,
  layout = 'grid',
  maxItems,
  useApi = false
}: AddOnsProps) {
  const [localSelectedAddOns, setLocalSelectedAddOns] = useState<string[]>(selectedAddOns);
  
  // Use API data if useApi is true, otherwise use prop data or default data
  const { addOns: apiAddOns, loading, error } = useAddOns();
  
  const addOns = useApi ? apiAddOns : (propAddOns || defaultAddOns);
  const displayAddOns = maxItems ? addOns.slice(0, maxItems) : addOns;

  const handleAddOnToggle = (addOnId: string) => {
    if (onAddOnToggle) {
      onAddOnToggle(addOnId);
    } else {
      // Local state management if no parent handler provided
      setLocalSelectedAddOns(prev =>
        prev.includes(addOnId)
          ? prev.filter(id => id !== addOnId)
          : [...prev, addOnId]
      );
    }
  };

  const isSelected = (addOnId: string) => {
    return onAddOnToggle ? selectedAddOns.includes(addOnId) : localSelectedAddOns.includes(addOnId);
  };
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-3 h-3 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Show loading state
  if (useApi && loading) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Make it Extra Special
          </h3>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="w-full h-24 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (useApi && error) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Make it Extra Special
          </h3>
        )}
        <div className="text-center p-8 border border-gray-200 rounded-xl">
          <p className="text-gray-600">Failed to load add-ons: {error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Make it Extra Special
          </h3>
        )}
        <div className="space-y-3">
          {displayAddOns.map((addOn) => (
            <div
              key={addOn._id}              className={`flex items-center gap-4 p-4 border rounded transition-all cursor-pointer ${
                isSelected(addOn._id)
                  ? 'border-red-500 bg-red-50 shadow-md'
                  : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
              }`}
              onClick={() => handleAddOnToggle(addOn._id)}
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={addOn.image}
                  alt={addOn.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{addOn.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {renderStars(addOn.rating)}
                  </div>
                  <span className="text-sm text-gray-600">({addOn.rating})</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-bold text-pink-600">₹{addOn.price}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected(addOn._id)
                    ? 'bg-pink-500 border-pink-500'
                    : 'border-gray-300'
                }`}>
                  {isSelected(addOn._id) ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Make it Extra Special
        </h3>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayAddOns.map((addOn) => (
          <div
            key={addOn._id}
            className={`relative border rounded-xl p-4 transition-all cursor-pointer group ${
              isSelected(addOn._id)
                ? 'border-pink-500 bg-pink-50 shadow-md'
                : 'border-gray-200 hover:border-pink-300 hover:shadow-sm'
            }`}
            onClick={() => handleAddOnToggle(addOn._id)}
          >
            {/* Selection Indicator */}
            <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected(addOn._id)
                ? 'bg-pink-500 border-pink-500'
                : 'border-gray-300 group-hover:border-pink-400'
            }`}>
              {isSelected(addOn._id) ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-pink-500" />
              )}
            </div>

            {/* Image */}
            <div className="relative w-full h-24 rounded-lg overflow-hidden mb-3">
              <Image
                src={addOn.image}
                alt={addOn.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2 text-sm">{addOn.name}</h4>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {renderStars(addOn.rating)}
                </div>
                <span className="text-xs text-gray-600">({addOn.rating})</span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-pink-600">₹{addOn.price}</span>
                <Button
                  size="sm"
                  variant={isSelected(addOn._id) ? "default" : "outline"}
                  className={`text-xs px-3 py-1 ${
                    isSelected(addOn._id)
                      ? 'bg-pink-500 hover:bg-pink-600 text-white'
                      : 'border-pink-300 text-pink-600 hover:bg-pink-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddOnToggle(addOn._id);
                  }}
                >
                  {isSelected(addOn._id) ? 'Added' : 'Add'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
