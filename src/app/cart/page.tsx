'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some delicious cakes to get started!
            </p>
            <Link href="/">
              <Button className="bg-pink-600 hover:bg-pink-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart ({totalItems} items)</h1>
          <Button
            variant="outline"
            onClick={clearCart}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {items.map((item) => (
                <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <Link href={`/products/${item.slug}`}>
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-pink-600 cursor-pointer mb-1">
                          {item.name}
                        </h3>
                      </Link>
                      
                      <div className="text-sm text-gray-500 mb-2">
                        Weight: {item.weight}
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Price */}
                        <div className="flex items-center gap-2">
                          {item.discountedPrice ? (
                            <>
                              <span className="text-lg font-bold text-pink-600">
                                ₹{item.discountedPrice}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                ₹{item.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              ₹{item.price}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-2 font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove from cart"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="mt-2 text-right">
                        <span className="text-sm text-gray-500">
                          Total: ₹{((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-pink-600">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3">
                  Proceed to Checkout
                </Button>
                
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Delivery Information</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Free delivery on all orders</li>
                  <li>• Same day delivery available</li>
                  <li>• Fresh cakes delivered to your door</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
