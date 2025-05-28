"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingCart, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { useState } from "react";

interface ProductCardProps {
  _id: string;
  name: string;
  slug: string;
  imageUrls: string[];
  price: number;
  discountedPrice?: number;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isEggless?: boolean;
  weightOptions?: Array<{
    weight: string;
    price: number;
    discountedPrice?: number;
  }>;
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

const ProductCard = ({
  _id,
  name,
  slug,
  imageUrls,
  price,
  discountedPrice,
  rating,
  reviewCount,
  isBestseller,
  isEggless,
  weightOptions,
  categories,
}: ProductCardProps) => {
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isInCart,
  } = useCart();
  const { showSuccess } = useToast();
  const [addingToCart, setAddingToCart] = useState(false);

  const discountPercentage = discountedPrice
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    setAddingToCart(true);
    try {
      const product = {
        _id,
        name,
        slug,
        imageUrls,
        price,
        discountedPrice,
        weightOptions: weightOptions || [
          { weight: "1kg", price, discountedPrice },
        ],
      };
      addToCart(product, 1);
      showSuccess(
        "Added to Cart!",
        `${name} has been added to your cart`,
        "cart"
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (isInWishlist(_id)) {
      removeFromWishlist(_id);
      showSuccess(
        "Removed from Wishlist",
        `${name} has been removed from your wishlist`,
        "heart"
      );
    } else {
      const product = {
        _id,
        name,
        slug,
        imageUrls,
        price,
        discountedPrice,
        categories,
      };
      addToWishlist(product);
      showSuccess(
        "Added to Wishlist!",
        `${name} has been added to your wishlist`,
        "heart"
      );
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group">
      <Link href={`/products/${slug}`}>
        <div className="relative h-44 overflow-hidden rounded-t-lg">
          <Image
            src={imageUrls[0] || "/placeholder-cake.jpg"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
              {discountPercentage}% OFF
            </div>
          )}
          {isBestseller && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
              Bestseller
            </div>
          )}
          {isEggless && (
            <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              Eggless
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/products/${slug}`}>
          <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] hover:text-pink-600 cursor-pointer">
            {name}
          </h3>
        </Link>

        <div className="flex items-center mb-2">
          <div className="flex items-center text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-700">
              {rating}
            </span>
          </div>
          <span className="text-sm text-gray-500 ml-1">
            ({reviewCount} reviews)
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{discountedPrice || price}
            </span>
            {discountedPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{price}
              </span>
            )}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {categories[0].name}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="flex-1 bg-pink-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1"
          >
            {addingToCart ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : isInCart(_id) ? (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </>
            )}
          </button>

          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-lg transition-colors ${
              isInWishlist(_id)
                ? "bg-pink-100 text-pink-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={
              isInWishlist(_id) ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={`h-4 w-4 ${isInWishlist(_id) ? "fill-current" : ""}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
