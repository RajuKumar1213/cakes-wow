'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const { 
    wishlist, 
    removeFromWishlist, 
    addToCart, 
    isInCart 
  } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-poppins text-3xl font-bold mb-8">My Wishlist</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />            <h2 className="font-poppins text-xl font-semibold text-gray-700 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Save your favorite cakes for later!
            </p>
            <Link href="/">
              <Button className="bg-pink-600 hover:bg-pink-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Explore Cakes
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
          <h1 className="font-poppins text-3xl font-bold">My Wishlist ({wishlist.length} items)</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <Link href={`/products/${item.slug}`}>
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                  />
                </Link>
                
                {/* Remove from wishlist button */}
                <button
                  onClick={() => removeFromWishlist(item.productId)}
                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
                  title="Remove from wishlist"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>

                {/* Discount badge */}
                {item.discountedPrice && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {Math.round((1 - item.discountedPrice / item.price) * 100)}% OFF
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4">
                <Link href={`/products/${item.slug}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-pink-600 cursor-pointer mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
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

                {/* Added date */}
                <p className="text-xs text-gray-500 mb-3">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </p>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      // Add to cart with default weight and quantity
                      const product = {
                        _id: item.productId,
                        name: item.name,
                        slug: item.slug,
                        imageUrls: [item.imageUrl],
                        price: item.price,
                        discountedPrice: item.discountedPrice,
                        weightOptions: [{ weight: '1kg', price: item.price }]
                      };
                      addToCart(product, 1);
                    }}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    disabled={isInCart(item.productId)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isInCart(item.productId) ? 'In Cart' : 'Add to Cart'}
                  </Button>

                  <Link href={`/products/${item.slug}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to shopping */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline" className="px-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
