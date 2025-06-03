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
  price: number;  discountedPrice?: number;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  weightOptions?: Array<{
    weight: string;
    price: number;
    discountedPrice?: number;
  }>;
  categories: Array<{
    name: string;
    slug: string;
  }>;
  flag?: string;
}

const ProductCard = ({
  _id,
  name,
  slug,
  imageUrls,
  price,
  discountedPrice,  rating,
  reviewCount,
  isBestseller,
  weightOptions,
  categories,
  flag,
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
    <div className="bg-white rounded-md shadow-md hover:shadow-lg transition-all duration-300 group">
      <Link href={`/products/${slug}`}>
        {" "}
        <div className="relative h-44 sm:h-56 overflow-hidden rounded-t-lg">
          {" "}
          <Image
            src={imageUrls[0] || "/placeholder-cake.jpg"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
          {discountPercentage > 0 && (
            <div className="absolute bg-red-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-br-3xl text-xs font-medium">
              {discountPercentage}% OFF
            </div>
          )}          {/* {isBestseller && (
            <div className="absolute top-0 right-0 sm:top-0 sm:right-0 bg-yellow-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-bl-3xl text-xs font-medium">
              Bestseller
            </div>
          )} */}
        </div>
      </Link>

      <div className="p-2">
        <Link href={`/products/${slug}`}>
          <h3 className="font-medium text-gray-800 line-clamp-2 text-sm pb-1 hover:text-pink-600 cursor-pointer">
            {name}
          </h3>
        </Link>

        <div className="flex items-center ">
          <div className="flex items-center text-yellow-400">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
            <span className="ml-1 text-xs sm:text-sm font-medium text-gray-700">
              {rating}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-gray-500 ml-1">
            ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>

        <div className="flex items-center justify-between mb-2 sm:my-1">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-base sm:text-lg font-bold text-gray-900">
              ₹{discountedPrice || price}
            </span>
            {discountedPrice && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                ₹{price}
              </span>
            )}
          </div>
        </div>

        {flag !== "bestseller" && categories.length > 0 && (
          <div className="mb-2 sm:mb-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
              {categories[0].name}
            </span>
          </div>
        )}        {/* Action Buttons */}
        <div className="flex space-x-1 sm:space-x-2">
          {flag !== "bestseller" && (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 bg-pink-600 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1"
            >
              {addingToCart ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
              ) : isInCart(_id) ? (
                <>
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>
          )}

          {flag !=="bestseller" && <button
            onClick={handleWishlistToggle}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              flag === "bestseller" ? "flex-1" : ""
            } ${
              isInWishlist(_id)
                ? "bg-pink-100 text-pink-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={
              isInWishlist(_id) ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                isInWishlist(_id) ? "fill-current" : ""
              }`}
            />
            
          </button>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
