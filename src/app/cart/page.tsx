'use client';

import React from 'react';
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
    clearCart 
  } = useCart();

  // State for selected add-ons
  const [selectedAddOns, setSelectedAddOns] = React.useState<string[]>([]);

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="relative mb-8">                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-12 h-12 text-orange-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">0</span>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Discover our delicious collection of fresh cakes and treats!
              </p>              <Link href="/">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg rounded">
                  <ArrowLeft className="w-5 h-5 mr-3" />
                  Start Shopping
                </Button>
              </Link>

              {/* Trust Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200">
                {trustFeatures.map((feature, index) => (
                  <div key={index} className="flex flex-col items-center text-center">                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-3">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">            <div>
              <h1 className="text-4xl font-bold text-black">
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-2">{totalItems} items in your cart</p>
            </div>            <Button
              variant="outline"
              onClick={clearCart}
              className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:border-orange-400 rounded px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>          {/* Trust Features Bar */}
          <div className="bg-white rounded shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trustFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">              {/* Cart Items Card */}
              <div className="bg-white rounded shadow-xl overflow-hidden">
                <div className="bg-orange-600 text-white p-6">
                  <h2 className="text-xl font-semibold">Your Items</h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-6">
                        {/* Product Image */}                        <Link href={`/products/${item.slug}`}>
                          <div className="relative w-24 h-24 rounded overflow-hidden cursor-pointer group">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">                          <Link href={`/products/${item.slug}`}>
                            <h3 className="font-semibold text-black hover:text-orange-600 cursor-pointer mb-2 text-lg">
                              {item.name}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                              {item.weight}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">4.8</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Price */}
                            <div className="flex items-center gap-3">                              {item.discountedPrice ? (
                                <>
                                  <span className="text-xl font-bold text-orange-600">
                                    ₹{item.discountedPrice}
                                  </span>
                                  <span className="text-sm text-gray-400 line-through">
                                    ₹{item.price}
                                  </span>
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {Math.round(((item.price - item.discountedPrice) / item.price) * 100)}% OFF
                                  </span>
                                </>
                              ) : (
                                <span className="text-xl font-bold text-black">
                                  ₹{item.price}
                                </span>
                              )}
                            </div>                            {/* Quantity Controls */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center bg-gray-100 rounded">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-2 hover:bg-gray-200 rounded-l transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-2 hover:bg-gray-200 rounded-r transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-orange-500 hover:bg-orange-50 rounded transition-colors"
                                title="Remove from cart"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="mt-3 text-right">
                            <span className="text-lg font-semibold text-gray-800">
                              Subtotal: ₹{((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>              {/* Add-ons Section */}
              <div className="bg-white rounded shadow-xl overflow-hidden">
                <div className="bg-orange-600 text-white p-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Gift className="w-6 h-6" />
                    Make it Extra Special
                  </h2>
                  <p className="text-orange-100 mt-1">Add these premium extras to your order</p>
                </div>
                
                <div className="p-6">
                  <AddOns
                    selectedAddOns={selectedAddOns}
                    onAddOnToggle={handleAddOnToggle}
                    showTitle={false}
                    layout="grid"
                  />
                </div>
              </div>
            </div>            {/* Order Summary */}
            <div className="lg:col-span-1">              <div className="bg-white rounded shadow-xl overflow-hidden sticky top-4">
                <div className="bg-orange-600 text-white p-6">
                  <h2 className="text-xl font-semibold">Order Summary</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                      <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery</span>
                      <div className="text-right">
                        <span className="font-semibold text-green-600">Free</span>
                        <div className="text-xs text-gray-500">Saved ₹50</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span className="font-semibold">₹0</span>
                    </div>
                      <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span className="text-orange-600">₹{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-green-600 text-right mt-1">
                        You saved ₹50 on delivery!
                      </div>
                    </div>
                  </div>                  <div className="space-y-3 mb-6">
                    <Link href="/checkout">                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-lg rounded">
                        Proceed to Checkout
                      </Button>
                    </Link>
                    
                    <Link href="/">
                      <Button variant="outline" className="w-full py-3 rounded border-gray-300 hover:bg-gray-50">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>                  {/* Delivery Info */}
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

                  {/* Contact Info */}
                  <div className="mt-4 text-center">                    <p className="text-sm text-gray-600">
                      Need help? Call us at{' '}
                      <a href="tel:+911234567890" className="text-orange-600 font-semibold hover:underline">
                        +91 12345 67890
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
