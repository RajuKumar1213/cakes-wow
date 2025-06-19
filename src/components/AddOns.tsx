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
  layout?: 'grid' | 'flat';
  maxItems?: number;
}

const SELECTED_ADDONS_KEY = 'bakingo-selected-addons';

const AddOns: React.FC<AddOnsProps> = ({
  showTitle = true,
  layout = 'grid',
  maxItems
}) => {
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  // Fetch add-ons from API
  const fetchAddOns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/addons');
      const data = await response.json();
      
      if (data.success) {
        setAddOns(data.data);
      } else {
        setError('Failed to load add-ons');
        showError('Error', 'Failed to load add-ons');
      }
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      setError('Failed to load add-ons');
      showError('Error', 'Failed to load add-ons');
    } finally {
      setLoading(false);
    }
  };  // Load selected add-ons from localStorage on mount
  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(SELECTED_ADDONS_KEY);
      if (saved) {
        const parsedAddOns = JSON.parse(saved);
        setSelectedAddOns(parsedAddOns);
      }
    } catch (error) {
      console.error('Error loading selected add-ons:', error);
    }
    
    // Fetch add-ons from API
    fetchAddOns();
    
    // Mark as initialized after loading
    setIsInitialized(true);
  }, []);  // Save to localStorage whenever selectedAddOns changes (but not on initial mount)
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Ensure we're on the client side and component is initialized
    if (typeof window === 'undefined' || !isInitialized) return;
    
    try {
      localStorage.setItem(SELECTED_ADDONS_KEY, JSON.stringify(selectedAddOns));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('addons-updated'));
    } catch (error) {
      console.error('Error saving selected add-ons:', error);
    }
  }, [selectedAddOns, isInitialized]);

  const displayAddOns = maxItems ? addOns.slice(0, maxItems) : addOns;  const handleAddOnToggle = (addOn: AddOn) => {
    const isSelected = selectedAddOns.some(item => item._id === addOn._id);
    
    if (isSelected) {
      // Remove from selected
      const newSelected = selectedAddOns.filter(item => item._id !== addOn._id);
      setSelectedAddOns(newSelected);
      showSuccess(
        "Add-on Removed",
        `${addOn.name} removed from your order`,
        "heart"
      );
    } else {
      // Add to selected
      const newSelected = [...selectedAddOns, addOn];
      setSelectedAddOns(newSelected);
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
      )}      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-gray-600">Loading add-ons...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchAddOns}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : displayAddOns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No add-ons available at the moment</p>
        </div>
      ) : (        <div className={`gap-2 ${
          layout === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'flex flex-row overflow-x-auto overflow-y-hidden  pb-2'
        }`} style={layout !== 'grid' ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}>
          {displayAddOns.map((addOn) => (
            <div
              key={addOn._id}
              className={`bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
                layout !== 'grid' ? 'flex-shrink-0 w-44 md:w-52' : ''
              }`}
            >              <div className="relative aspect-square w-full">
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
              
              <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                <div>                  <h4 className="font-semibold text-gray-800 text-xs md:text-sm mb-1">
                    {addOn.name}
                  </h4>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, index) => (                        <Star
                          key={index}
                          className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
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
                </div>                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-lg font-bold text-gray-900">
                    ₹{addOn.price}
                  </span>
                  <button
                    onClick={() => handleAddOnToggle(addOn)}
                    className={`flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                      isSelected(addOn._id)
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected(addOn._id) ? (
                      <>
                        <Check className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Added</span>
                        <span className="sm:hidden">✓</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Add</span>
                        <span className="sm:hidden">+</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
