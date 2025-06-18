'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  ArrowLeft,
  Shield,
  CreditCard,
  Heart,
  Star,
  Gift,
  Calendar,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddOns from '@/components/AddOns';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Login from '@/components/Login';

const trustFeatures = [
  {
    icon: Shield,
    title: "100% Payment Protection",
    description: "Secure checkout guaranteed"
  },
  {
    icon: CreditCard,
    title: "No Hidden Charges",
    description: "Transparent pricing always"
  },
  {
    icon: Heart,
    title: "2M+ Smiles Delivered",
    description: "Trusted by millions"
  }
];

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { user } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = React.useState<any[]>([]);
  const [addOnQuantities, setAddOnQuantities] = React.useState<{ [key: string]: number }>({});  // Function to load add-ons from localStorage
  const loadAddOnsFromStorage = React.useCallback(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('bakingo-selected-addons');
      const savedQuantities = localStorage.getItem('bakingo-addon-quantities');
      
      if (saved) {
        const addOns = JSON.parse(saved);
        setSelectedAddOns(addOns);
        
        // Load saved quantities or initialize to 1
        let quantities: { [key: string]: number } = {};
        if (savedQuantities) {
          quantities = JSON.parse(savedQuantities);
        }
        
        // Initialize quantities to 1 for each add-on that doesn't have a quantity yet
        addOns.forEach((addOn: any) => {
          if (!quantities[addOn._id]) {
            quantities[addOn._id] = 1;
          }
        });
        
        setAddOnQuantities(quantities);
        // Save back to localStorage if there were any new quantities initialized
        localStorage.setItem('bakingo-addon-quantities', JSON.stringify(quantities));
      } else {
        setSelectedAddOns([]);
        setAddOnQuantities({});
      }
    } catch (error) {
      console.error('Error loading selected add-ons:', error);
    }
  }, []);React.useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return;
    
    // Load initial data
    loadAddOnsFromStorage();

    // Listen for localStorage changes (from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bakingo-selected-addons' || e.key === 'bakingo-addon-quantities') {
        loadAddOnsFromStorage();
      }
    };    // Listen for custom storage events within the same tab
    const handleCustomStorageChange = () => {
      loadAddOnsFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('addons-updated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('addons-updated', handleCustomStorageChange);
    };
  }, [loadAddOnsFromStorage]);  const updateAddOnQuantity = (addOnId: string, newQuantity: number) => {
    if (typeof window === 'undefined') return;
    
    if (newQuantity <= 0) {
      // Remove add-on if quantity is 0 or less
      const updatedAddOns = selectedAddOns.filter(addOn => addOn._id !== addOnId);
      setSelectedAddOns(updatedAddOns);
      localStorage.setItem('bakingo-selected-addons', JSON.stringify(updatedAddOns));

      const newQuantities = { ...addOnQuantities };
      delete newQuantities[addOnId];
      setAddOnQuantities(newQuantities);
      localStorage.setItem('bakingo-addon-quantities', JSON.stringify(newQuantities));

      // Dispatch custom event to notify other components
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
  const getAddOnsTotal = () => {
    return selectedAddOns.reduce((total, addOn) => {
      const quantity = addOnQuantities[addOn._id] || 1;
      return total + (addOn.price * quantity);
    }, 0);
  };



  if (items.length === 0) {
    return (<>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-12 text-center">
            <div className="relative mb-6 md:mb-8">                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-orange-600" />
            </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs md:text-sm font-bold">0</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 mb-6 md:mb-8 text-base md:text-lg">
              Discover our delicious collection of fresh cakes and treats!
            </p>              <Link href="/">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                Start Shopping
              </Button>
            </Link>

            {/* Trust Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
              {trustFeatures.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-600 rounded-full flex items-center justify-center mb-2 md:mb-3">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-4 md:py-8 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto px-2 md:px-4">          {/* Header Section */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black">
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-1 text-xs md:text-sm">{totalItems} items in your cart</p>
            </div>
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:border-orange-400 rounded px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm"
            >
              <X className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline">Clear Cart</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>          {/* Trust Features Bar */}
          <div className="bg-white rounded shadow-sm p-2 md:p-4 mb-4 md:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
              {trustFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-black text-xs md:text-sm">{feature.title}</h3>
                    <p className="text-xs md:text-xs text-gray-600 hidden md:block">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {/* Cart Items Card */}
              <div className="bg-white rounded shadow-xl overflow-hidden">
                <div className="bg-orange-600 text-white p-3 md:p-4">
                  <h2 className="text-base md:text-lg font-semibold">Your Items</h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 md:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3 md:gap-4">
                        {/* Product Image */}
                        <Link href={`/products/${item.slug}`}>
                          <div className="relative w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded overflow-hidden cursor-pointer group flex-shrink-0">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.slug}`}>
                            <h3 className="font-semibold text-black hover:text-orange-600 cursor-pointer mb-1 md:mb-2 text-sm md:text-base line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>                          <div className="flex items-center gap-2 md:gap-3 mb-2">
                            <span className="bg-gray-100 px-2 py-0.5 md:py-1 rounded-full text-xs text-gray-600">
                              {item.weight}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">4.8</span>
                            </div>
                          </div>

                          {/* Photo Cake Customization Display */}
                          {item.customization?.type === 'photo-cake' && (
                            <div className="mb-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="relative w-10 h-10 rounded overflow-hidden border border-purple-200">
                                  {item.customization.imageUrl && (
                                    <Image
                                      src={item.customization.imageUrl}
                                      alt="Custom photo"
                                      fill
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-purple-800">🎂 Custom Photo Cake</p>
                                  {item.customization.message && (
                                    <p className="text-xs text-purple-600">"{item.customization.message}"</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col gap-2 md:gap-3">
                            {/* Price */}
                            <div className="flex items-center gap-2">
                              {item.discountedPrice ? (
                                <>
                                  <span className="text-base md:text-lg font-bold text-orange-600">
                                    ₹{item.discountedPrice}
                                  </span>
                                  <span className="text-xs md:text-sm text-gray-400 line-through">
                                    ₹{item.price}
                                  </span>
                                  <span className="bg-green-100 text-green-800 px-1.5 md:px-2 py-0.5 rounded-full text-xs font-medium">
                                    {Math.round(((item.price - item.discountedPrice) / item.price) * 100)}% OFF
                                  </span>
                                </>
                              ) : (
                                <span className="text-base md:text-lg font-bold text-black">
                                  ₹{item.price}
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls and Remove Button */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-gray-100 rounded">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 md:p-1.5 hover:bg-gray-200 rounded-l transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 md:px-3 py-1 md:py-1.5 font-medium min-w-[2rem] md:min-w-[2.5rem] text-center text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 md:p-1.5 hover:bg-gray-200 rounded-r transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1 md:p-1.5 text-orange-500 hover:bg-orange-50 rounded transition-colors"
                                title="Remove from cart"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="mt-2 text-right">
                            <span className="text-xs md:text-sm font-semibold text-gray-800">
                              Subtotal: ₹{((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          {/* Selected Add-ons */}
                          {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                            <div className="mt-2 md:mt-3 p-2 md:p-3 bg-orange-50 rounded border-l-4 border-orange-200">
                              <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Selected Add-ons:</h4>
                              <div className="space-y-1">
                                {item.selectedAddOns.map((addOn, index) => (
                                  <div key={index} className="flex justify-between items-center text-xs md:text-sm">
                                    <span className="text-gray-600">{addOn.name}</span>
                                    <span className="font-semibold text-orange-600">+₹{addOn.price}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-orange-200">
                                <div className="flex justify-between items-center text-xs md:text-sm font-semibold">
                                  <span>Add-ons Total:</span>
                                  <span className="text-orange-600">
                                    +₹{item.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Add-ons Section - Show selected add-ons from localStorage */}
              {selectedAddOns.length > 0 && (
                <div className="bg-white rounded shadow-xl overflow-hidden">
                  <div className="bg-orange-600 text-white p-3 md:p-4">
                    <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                      <Gift className="w-4 h-4 md:w-5 md:h-5" />
                      Selected Add-ons
                    </h2>
                    <p className="text-orange-100 mt-1 text-xs md:text-sm">Extra special touches for your order</p>
                  </div>

                  <div className="p-3 md:p-4">
                    <div className="space-y-2 md:space-y-3">
                      {selectedAddOns.map((addOn) => (
                        <div key={addOn._id} className="flex items-center justify-between p-2 md:p-3 bg-orange-50 rounded border border-orange-200">
                          <div className="flex items-center gap-2 md:gap-3 flex-1">
                            <div className="w-8 h-8 md:w-10 md:h-10 relative rounded overflow-hidden flex-shrink-0">
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
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 text-xs md:text-sm truncate">{addOn.name}</h4>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600">{addOn.rating}</span>
                                <span className="text-xs text-gray-500 ml-2">₹{addOn.price} each</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 md:gap-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-white rounded border">
                              <button
                                onClick={() => updateAddOnQuantity(addOn._id, (addOnQuantities[addOn._id] || 1) - 1)}
                                className="p-0.5 md:p-1 hover:bg-gray-100 rounded-l transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-1.5 md:px-2 py-0.5 md:py-1 font-medium min-w-[1.5rem] md:min-w-[2rem] text-center text-xs md:text-sm">
                                {addOnQuantities[addOn._id] || 1}
                              </span>
                              <button
                                onClick={() => updateAddOnQuantity(addOn._id, (addOnQuantities[addOn._id] || 1) + 1)}
                                className="p-0.5 md:p-1 hover:bg-gray-100 rounded-r transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Total Price */}
                            <span className="font-semibold text-orange-600 text-xs md:text-sm min-w-[2.5rem] md:min-w-[3rem] text-right">
                              ₹{(addOn.price * (addOnQuantities[addOn._id] || 1))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-orange-200">
                      <div className="flex justify-between items-center font-bold text-sm md:text-base">
                        <span className="text-gray-800">Add-ons Total:</span>
                        <span className="text-orange-600">₹{getAddOnsTotal()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* All Available Add-ons Section */}
              <div className="bg-white rounded shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-pink-600 to-orange-600 text-white p-3 md:p-4">
                  <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <Gift className="w-4 h-4 md:w-5 md:h-5" />
                    Add More Special Touches
                  </h2>
                  <p className="text-pink-100 mt-1 text-xs md:text-sm">Make your order extra special with these add-ons</p>
                </div>

                <div className="p-2 md:p-4">
                  <AddOns
                    showTitle={false}
                    layout='flat'
                    maxItems={6}
                  />
                </div>
              </div>
            </div>            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded shadow-xl overflow-hidden sticky top-4 hidden lg:block">
                <div className="bg-orange-600 text-white p-4">
                  <h2 className="text-lg font-semibold">Order Summary</h2>
                </div>

                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Subtotal ({totalItems} items)</span>
                      <span className="font-semibold text-sm">₹{totalPrice.toFixed(2)}</span>
                    </div>

                    {selectedAddOns.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Add-ons ({selectedAddOns.length} items)</span>
                        <span className="font-semibold text-sm">₹{getAddOnsTotal().toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Delivery</span>
                      <div className="text-right">
                        <span className="font-semibold text-green-600 text-sm">Free</span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Grand Total</span>
                        <span className="text-orange-600">₹{(totalPrice + getAddOnsTotal()).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">

                    <Button onClick={() => !user ? setShowLogin(true) : router.push('/checkout')} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-base rounded">
                      Proceed to Checkout
                    </Button>


                    <Link href="/">
                      <Button variant="outline" className="w-full py-2 rounded border-gray-300 hover:bg-gray-50 text-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-800">Delivery Promise</h3>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Free delivery on all orders
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Same day delivery available
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Fresh cakes, guaranteed quality
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Schedule delivery for later
                      </li>
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Mobile Sticky Bottom Checkout */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:p-4 lg:hidden z-50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="text-xs text-gray-600">Total ({totalItems} items)</div>
                <div className="text-lg md:text-xl font-bold text-orange-600">
                  ₹{(totalPrice + getAddOnsTotal()).toFixed(2)}
                </div>
                {selectedAddOns.length > 0 && (
                  <div className="text-xs text-gray-500">+ {selectedAddOns.length} add-ons</div>
                )}
              </div>

              <Button onClick={() => !user ? setShowLogin(true) : router.push('/checkout')} className="flex-shrink-0 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-sm md:text-base rounded-lg">
                Checkout
              </Button>

            </div>
          </div>
        </div>
      </div>

      {showLogin && (
        <Login setShowLogin={setShowLogin} isVisible={showLogin} />
      )}
      <Footer />
    </>
  );
}
