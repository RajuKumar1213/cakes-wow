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
  discountedPrice,
  rating,
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
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 group border border-gray-100 overflow-hidden">
      <Link href={`/products/${slug}`}>
        <div className="relative h-36 sm:h-48 overflow-hidden">
          <Image
            src={imageUrls[0] || "/placeholder-cake.jpg"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 brightness-105 saturate-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />{" "}
          {discountPercentage > 0 && (
            <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-3xl text-xs font-bold shadow-md">
              {discountPercentage}% OFF
            </div>
          )}
          {/* {isBestseller && (
            <div className="absolute top-0 right-0 sm:top-0 sm:right-0 bg-yellow-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-bl-3xl text-xs font-medium">
              Bestseller
            </div>
          )} */}
        </div>{" "}
      </Link>

      <div className="p-2 md:p-3">
        <Link href={`/products/${slug}`}>
          <h3 className="font-semibold text-gray-800 truncate text-sm pb-2 hover:text-pink-600 cursor-pointer transition-colors duration-300">
            {name}
          </h3>
        </Link>
        <div className="flex items-center mb-1">
          <div className="flex items-center text-yellow-400 bg-yellow-50 px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3 fill-current" />
            <span className="ml-1 text-xs font-semibold text-gray-800">
              {rating}
            </span>
          </div>
          <span className="text-xs text-gray-500 ml-2">({reviewCount})</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold text-gray-900">
              ₹{discountedPrice || price}
            </span>
            {discountedPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{price}
              </span>
            )}
          </div>
        </div>
        {flag !== "bestseller" && categories.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-pink-600 bg-pink-50 px-2 py-1 rounded-full font-medium">
              {categories[0].name}
            </span>
          </div>
        )}{" "}
        {/* Action Buttons */}
        <div className="flex space-x-2">
          {flag !== "bestseller" && (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-1"
            >
              {addingToCart ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : isInCart(_id) ? (
                <>
                  <ShoppingCart className="h-3 w-3" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </>
              )}
            </button>
          )}

          {flag !== "bestseller" && (
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-lg transition-colors duration-300 ${
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
                className={`h-4 w-4 ${isInWishlist(_id) ? "fill-current" : ""}`}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
