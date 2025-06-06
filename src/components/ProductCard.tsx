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
  viewMode?: "grid" | "list";
}

interface Product {
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
}

interface ProductCardComponentProps {
  product: Product;
  viewMode?: "grid" | "list";
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
  viewMode = "grid",
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

  // Price display logic: use base price if available, otherwise use first weight option price
  const displayPrice = price || (weightOptions && weightOptions.length > 0 ? weightOptions[0].price : 0);
  const displayDiscountedPrice = discountedPrice || (weightOptions && weightOptions.length > 0 ? weightOptions[0].discountedPrice : undefined);

  const discountPercentage = displayDiscountedPrice
    ? Math.round(((displayPrice - displayDiscountedPrice) / displayPrice) * 100)
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
        price: displayPrice,
        discountedPrice: displayDiscountedPrice,
        weightOptions: weightOptions || [
          { weight: "1kg", price: displayPrice, discountedPrice: displayDiscountedPrice },
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
        price: displayPrice,
        discountedPrice: displayDiscountedPrice,
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

  // List view layout
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden">
        <Link href={`/products/${slug}`}>
          <div className="flex p-3 gap-3">
            {/* Image */}            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-100">
              <Image
                src={imageUrls[0] || "/placeholder-cake.jpg"}
                alt={name}
                fill
                className="object-contain p-1 hover:scale-110 transition-transform duration-300"
                sizes="80px"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              {discountPercentage > 0 && (
                <div className="absolute top-1 right-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                  {discountPercentage}%
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 truncate hover:text-pink-600 transition-colors">
                {name}
              </h3>

              <div className="flex items-center mb-2 gap-2">
                <div className="flex items-center text-yellow-400 bg-yellow-50 px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="ml-1 text-xs font-semibold text-gray-800">
                    {rating}
                  </span>
                </div>
                <span className="text-xs text-gray-500">({reviewCount})</span>
                {isBestseller && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">
                    Bestseller
                  </span>
                )}
              </div>              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-gray-900">
                    ₹{displayDiscountedPrice || displayPrice}
                  </span>
                  {displayDiscountedPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{displayPrice}
                    </span>
                  )}
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    {addingToCart ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : isInCart(_id) ? (
                      <><ShoppingCart className="h-3 w-3" /> Added</>
                    ) : (
                      <><Plus className="h-3 w-3" /> Add</>
                    )}
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    className={`p-1.5 rounded transition-colors ${isInWishlist(_id)
                        ? "bg-pink-100 text-pink-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <Heart className={`h-3 w-3 ${isInWishlist(_id) ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Grid view layout (existing code with mobile optimizations)
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 group border border-gray-100 overflow-hidden">     
     <Link href={`/products/${slug}`}>
      <div className="relative h-52 md:h-64 bg-white border-b border-gray-100">
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              src={imageUrls[0] || "/placeholder-cake.jpg"}
              alt={name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>
        </div>          
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
            {discountPercentage}% OFF
          </div>
        )}
      </div>
    </Link>

      <div className="p-2 sm:p-3">
        <Link href={`/products/${slug}`}>
          <h3 className="font-semibold text-gray-800 truncate text-xs sm:text-sm pb-1 sm:pb-2 hover:text-pink-600 cursor-pointer transition-colors duration-300">
            {name}
          </h3>
        </Link>        <div className="flex items-center mb-1">
          <div className="flex items-center text-yellow-400 bg-yellow-50 px-1.5 sm:px-2 py-0.5 rounded-full">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            <span className="ml-1 text-xs font-semibold text-gray-800">
              {rating}
            </span>
          </div>
          <span className="text-xs text-gray-500 ml-1 sm:ml-2">({reviewCount})</span>
        </div>        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-sm sm:text-base font-bold text-gray-900">
              ₹{displayDiscountedPrice || displayPrice}
            </span>
            {displayDiscountedPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{displayPrice}
              </span>
            )}
          </div>
        </div>
        {flag !== "bestseller" && categories.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-pink-600 bg-pink-50 px-2 py-0.5 sm:py-1 rounded-full font-medium">
              {categories[0].name}
            </span>
          </div>
        )}
        {/* Action Buttons - mobile optimized */}
        <div className="flex space-x-1 sm:space-x-2">
          {flag !== "bestseller" && (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center space-x-1"
            >
              {addingToCart ? (
                <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-b-2 border-white"></div>
              ) : isInCart(_id) ? (
                <>
                  <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>
          )}

          {flag !== "bestseller" && (
            <button
              onClick={handleWishlistToggle}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-300 ${flag === "bestseller" ? "flex-1" : ""
                } ${isInWishlist(_id)
                  ? "bg-pink-100 text-pink-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              title={
                isInWishlist(_id) ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className={`h-3 w-3 sm:h-4 sm:w-4 ${isInWishlist(_id) ? "fill-current" : ""}`}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Component wrapper to handle the new product interface
const ProductCardWrapper = ({ product, viewMode = "grid" }: ProductCardComponentProps) => {
  // Safety check for undefined product
  if (!product) {
    return null;
  }

  return (
    <ProductCard
      _id={product._id}
      name={product.name}
      slug={product.slug}
      imageUrls={product.imageUrls}
      price={product.price}
      discountedPrice={product.discountedPrice}
      rating={product.rating}
      reviewCount={product.reviewCount}
      isBestseller={product.isBestseller}
      weightOptions={product.weightOptions}
      categories={product.categories}
      viewMode={viewMode}
    />
  );
};

export default ProductCard;
export { ProductCardWrapper };
