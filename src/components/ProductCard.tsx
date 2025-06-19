"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

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
  viewMode = "grid",
}: ProductCardProps) => {
  // Price display logic: use base price if available, otherwise use first weight option price
  const displayPrice = price || (weightOptions && weightOptions.length > 0 ? weightOptions[0].price : 0);
  const displayDiscountedPrice = discountedPrice || (weightOptions && weightOptions.length > 0 ? weightOptions[0].discountedPrice : undefined);
  const discountPercentage = displayDiscountedPrice
    ? Math.round(((displayPrice - displayDiscountedPrice) / displayPrice) * 100)
    : 0;

  // List view layout
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden">
        <Link href={`/${slug}`}>
          <div className="flex p-3 gap-3">
            {/* Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-100">
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
                  )}                \
                  </div>

                {/* Removed add button and wishlist icon */}
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
          <h3 className="font-thin text-gray-800 truncate text-xs sm:text-sm pb-1 sm:pb-2 hover:text-pink-600 cursor-pointer transition-colors duration-300">
            {name}
          </h3>
        </Link>        
       
        <div className="flex items-center justify-between mb-2 ">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-sm sm:text-base font-black text-gray-900">
              ₹{displayDiscountedPrice || displayPrice}
            </span>
            {displayDiscountedPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{displayPrice}
              </span>
            )}
          </div>
        </div>
         <div className="flex items-center mb-1">
          <div className="flex items-center text-yellow-400 bg-yellow-50 px-1.5 sm:px-2 py-0.5 rounded-full">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            <span className="ml-1 text-xs font-semibold text-gray-800">
              {rating}
            </span>
          </div>
          <span className="text-xs text-gray-500 ml-1 sm:ml-2">({reviewCount})</span>
        </div>
        {/* {flag !== "bestseller" && categories.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-pink-600 bg-pink-50 px-2 py-0.5 sm:py-1 rounded-full font-medium">
              {categories[0].name}
            </span>
          </div>
        )} */}
        {/* Action Buttons - mobile optimized */}        {/* Removed add button and wishlist icon section */}
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
