"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Minus, Plus, Share2, Check } from 'lucide-react';
import { Breadcrumb } from '@/components';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  discountedPrice?: number;
  imageUrls: string[];
  rating: number;
  reviewCount: number;
  isEggless: boolean;
  isBestseller: boolean;
  weightOptions: Array<{
    weight: string;
    price: number;
    discountedPrice?: number;
  }>;
  categories: Array<{
    name: string;
    slug: string;
  }>;
  tags: string[];
}

const ProductPage = () => {
  const params = useParams();
  const productSlug = params.slug as string;
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, isInCart } = useCart();
  const { showSuccess } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${productSlug}`);
        const data = response.data;

        if (data.success) {
          setProduct(data.data);
          if (data.data.weightOptions.length > 0) {
            setSelectedWeight(data.data.weightOptions[0].weight);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      fetchProduct();
    }
  }, [productSlug]);

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const getCurrentPrice = () => {
    if (product && product.weightOptions.length > 0 && selectedWeight) {
      const weightOption = product.weightOptions.find(w => w.weight === selectedWeight);
      return weightOption?.discountedPrice || weightOption?.price || product.price;
    }
    return product?.discountedPrice || product?.price || 0;
  };

  const getOriginalPrice = () => {
    if (product && product.weightOptions.length > 0 && selectedWeight) {
      const weightOption = product.weightOptions.find(w => w.weight === selectedWeight);
      return weightOption?.discountedPrice ? weightOption.price : null;
    }
    return product?.discountedPrice ? product.price : null;
  };
  const getDiscountPercentage = () => {
    const currentPrice = getCurrentPrice();
    const originalPrice = getOriginalPrice();
    
    if (originalPrice && currentPrice) {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
    return 0;
  };
  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      addToCart(product, quantity, selectedWeight);
      showSuccess('Added to Cart!', `${quantity}x ${product.name} (${selectedWeight}) added to your cart`, 'cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      showSuccess('Removed from Wishlist', `${product.name} has been removed from your wishlist`, 'heart');
    } else {
      addToWishlist(product);
      showSuccess('Added to Wishlist!', `${product.name} has been added to your wishlist`, 'heart');
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="h-64 sm:h-80 lg:h-96 bg-gray-300 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 sm:h-16 lg:h-20 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="h-6 sm:h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 sm:h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="h-16 sm:h-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2 sm:px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-sm sm:text-base text-gray-600">The product you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: product.categories[0]?.name || 'Products', href: `/${product.categories[0]?.slug || 'products'}` },
    { label: product.name, href: `/products/${product.slug}` },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-3 sm:mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-4 lg:p-6">
            {/* Product Images */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.imageUrls[selectedImageIndex] || '/placeholder-cake.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {getDiscountPercentage() > 0 && (
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium">
                    {getDiscountPercentage()}% OFF
                  </div>
                )}
                {product.isBestseller && (
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-yellow-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium">
                    Bestseller
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  {product.imageUrls.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-12 sm:h-16 lg:h-20 rounded border-2 overflow-hidden transition-all ${
                        selectedImageIndex === index ? 'border-pink-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>            {/* Product Details */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    <span className="ml-1 text-xs sm:text-sm font-medium text-gray-700">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">
                    ({product.reviewCount} reviews)
                  </span>
                  {product.isEggless && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Eggless
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    ₹{getCurrentPrice()}
                  </span>
                  {getOriginalPrice() && (
                    <span className="text-lg sm:text-xl text-gray-500 line-through">
                      ₹{getOriginalPrice()}
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>              {/* Weight Options */}
              {product.weightOptions.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Select Weight</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {product.weightOptions.map((option) => (
                      <button
                        key={option.weight}
                        onClick={() => setSelectedWeight(option.weight)}
                        className={`p-2 sm:p-3 border rounded-lg text-center transition-colors ${
                          selectedWeight === option.weight
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium text-sm sm:text-base">{option.weight}</div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          ₹{option.discountedPrice || option.price}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}              {/* Quantity and Add to Cart */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Quantity</h3>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <span className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md min-w-[50px] sm:min-w-[60px] text-center text-sm sm:text-base">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button 
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full sm:flex-1 bg-pink-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    {addingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        <span>Adding...</span>
                      </>
                    ) : isInCart(product?._id || '') ? (
                      <>
                        <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                  
                  <div className="flex space-x-2 sm:space-x-0">
                    <button 
                      onClick={handleWishlistToggle}
                      className={`flex-1 sm:flex-none p-2.5 sm:p-3 border rounded-lg transition-colors ${
                        isInWishlist(product?._id || '') 
                          ? 'border-pink-500 bg-pink-50 text-pink-600' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      title={isInWishlist(product?._id || '') ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={`h-4 w-4 sm:h-5 sm:w-5 mx-auto ${isInWishlist(product?._id || '') ? 'fill-current' : ''}`} />
                    </button>
                    <button className="flex-1 sm:flex-none p-2.5 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>              {/* Tags */}
              {product.tags.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
