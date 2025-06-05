"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Share2,
  Check,
} from "lucide-react";
import { Breadcrumb, Footer, Header, AddOns, AddOnModal } from "@/components";
import { useCart, AddOn } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import axios from "axios";

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
  isBestseller: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  stockQuantity: number;
  minimumOrderQuantity: number;
  preparationTime: string;
  ingredients: string[];
  allergens: string[];
  nutritionalInfo: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
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
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const productSlug = params.slug as string;
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isInCart,
    items,
  } = useCart();
  const { showSuccess } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState<string>("");  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "ingredients" | "nutrition" | "reviews"
  >("description");
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // Add timeout to API request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await axios.get(`/api/products/${productSlug}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = response.data;

        if (data.success) {
          setProduct(data.data);
          if (data.data.weightOptions.length > 0) {
            setSelectedWeight(data.data.weightOptions[0].weight);
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.error("Request timeout - API taking too long");
        } else {
          console.error("Error fetching product:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      fetchProduct();
    }
  }, [productSlug]);

  const handleQuantityChange = (action: "increase" | "decrease") => {
    if (action === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const getCurrentPrice = () => {
    if (product && product.weightOptions.length > 0 && selectedWeight) {
      const weightOption = product.weightOptions.find(
        (w) => w.weight === selectedWeight
      );
      return (
        weightOption?.discountedPrice || weightOption?.price || product.price
      );
    }
    return product?.discountedPrice || product?.price || 0;
  };

  const getOriginalPrice = () => {
    if (product && product.weightOptions.length > 0 && selectedWeight) {
      const weightOption = product.weightOptions.find(
        (w) => w.weight === selectedWeight
      );
      return weightOption?.discountedPrice ? weightOption.price : null;
    }
    return product?.discountedPrice ? product.price : null;
  };  const getDiscountPercentage = () => {
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
      // Add to cart without add-ons first
      addToCart(product, quantity, selectedWeight, []);
      showSuccess(
        "Added to Cart!",
        `${quantity}x ${product.name} (${selectedWeight}) added to your cart`,
        "cart"
      );
      
      // Show add-on modal after successful cart addition
      setShowAddOnModal(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const goToCart = () => {
    router.push("/cart");
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      showSuccess(
        "Removed from Wishlist",
        `${product.name} has been removed from your wishlist`,
        "heart"
      );
    } else {
      addToWishlist(product);
      showSuccess(
        "Added to Wishlist!",
        `${product.name} has been added to your wishlist`,
        "heart"
      );
    }
  };  const handleAddOnToggle = (addOnId: string, addOn: AddOn) => {
    const isSelected = selectedAddOns.some(selected => selected._id === addOn._id);
    
    if (isSelected) {
      setSelectedAddOns(prev => prev.filter(selected => selected._id !== addOn._id));
    } else {
      setSelectedAddOns(prev => [...prev, addOn]);
    }
  };

  const handleModalSkip = () => {
    // Skip add-ons and go directly to cart
    setShowAddOnModal(false);
    router.push("/cart");
  };

  const handleModalContinue = () => {
    // Continue with selected add-ons and go to cart
    setShowAddOnModal(false);
    router.push("/cart");
  };

  const handleModalClose = () => {
    setShowAddOnModal(false);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          {/* Breadcrumb skeleton */}
          <div className="mb-2 sm:mb-4">
            <div className="flex items-center space-x-1.5 animate-pulse">
              <div className="h-3 bg-gray-300 rounded w-12"></div>
              <div className="h-3 bg-gray-300 rounded w-3"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
              <div className="h-3 bg-gray-300 rounded w-3"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 sm:p-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
              {/* Image skeleton */}
              <div className="space-y-2 sm:space-y-3">
                <div className="h-56 sm:h-72 lg:h-80 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 sm:h-14 lg:h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Content skeleton */}
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="h-6 sm:h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5"></div>
                  <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                  <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
                  <div className="flex gap-1.5 sm:gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 sm:h-9 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg w-16 sm:w-20"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <div className="h-9 sm:h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex-1"></div>
                  <div className="h-9 sm:h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-9 sm:w-10"></div>
                </div>
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    {
      label: product.categories[0]?.name || "Products",
      href: `/${product.categories[0]?.slug || "products"}`,
    },
    { label: product.name, href: `/products/${product.slug}` },
  ];return (
    <>
      <Header />      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-2 sm:px-3 lg:px-6 py-1 sm:py-2 lg:py-6">
          <div className="mb-1 sm:mb-2 lg:mb-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-6 p-2 sm:p-3 lg:p-6">              {/* Product Images */}
              <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                <div className="relative h-48 sm:h-56 lg:h-72 xl:h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl overflow-hidden group">
                  <Image
                    src={
                      product.imageUrls[selectedImageIndex] ||
                      "/placeholder-cake.jpg"
                    }
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={selectedImageIndex === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDdemcxqeK/8AUyQkKUSPH/Z"
                  />                  {getDiscountPercentage() > 0 && (
                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-xs font-semibold shadow-lg">
                      {getDiscountPercentage()}% OFF
                    </div>
                  )}
                  {product.isBestseller && (
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-xs font-semibold shadow-lg">
                      ⭐ Bestseller
                    </div>
                  )}
                </div>                {/* Thumbnail Images */}
                {product.imageUrls.length > 1 && (
                  <div className="grid grid-cols-4 gap-1 sm:gap-1.5 lg:gap-2">
                    {product.imageUrls.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-8 sm:h-10 lg:h-14 xl:h-16 rounded-md sm:rounded-lg border-2 overflow-hidden transition-all duration-300 hover:scale-105 ${
                          selectedImageIndex === index
                            ? "border-pink-500 shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, (max-width: 1024px) 12vw, 10vw"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>              {/* Product Details */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h1><div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            star <= product.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm sm:text-base font-medium text-gray-900">
                      {product.rating}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      ({product.reviewCount} reviews)
                    </span>
                    {product.isBestseller && (
                      <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs font-semibold">
                        ⭐ Bestseller
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3">
                    {product.shortDescription}
                  </p>
                </div>
                {/* Pricing */}
                <div className="flex items-baseline gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-pink-600">
                    ₹{getCurrentPrice()}
                  </span>
                  {getOriginalPrice() && (
                    <span className="text-lg sm:text-xl text-gray-500 line-through">
                      ₹{getOriginalPrice()}
                    </span>
                  )}
                  {getDiscountPercentage() > 0 && (
                    <span className="text-sm sm:text-base text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg">
                      Save {getDiscountPercentage()}%
                    </span>
                  )}
                </div>                {/* Weight Options */}
                {product.weightOptions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm sm:text-base font-semibold text-gray-900 block">
                      Select Weight
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {product.weightOptions.map((option) => (
                        <button
                          key={option.weight}
                          onClick={() => setSelectedWeight(option.weight)}
                          className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 ${
                            selectedWeight === option.weight
                              ? "border-pink-500 bg-pink-50 text-pink-600 shadow-md"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          <div className="text-xs sm:text-sm font-semibold">
                            {option.weight}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-gray-900">
                            ₹{option.discountedPrice || option.price}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}{" "}                {/* Quantity and Add to Cart */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm sm:text-base font-semibold text-gray-900 block">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange("decrease")}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all disabled:opacity-50"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="text-lg sm:text-xl font-bold w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange("increase")}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>                  {/* Action Buttons */}
                  <div className="space-y-2 sm:space-y-3">
                    {isInCart(product?._id || "") ? (
                      <div className="w-full sm:flex-1 flex space-x-2">
                        <button
                          onClick={handleAddToCart}
                          disabled={addingToCart}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 text-sm sm:text-base"
                        >
                          {addingToCart ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                              <span>Added to Cart</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={goToCart}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 text-sm sm:text-base"
                        >
                          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>View Cart</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {addingToCart ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Adding...
                          </div>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                            Add to Cart - ₹{(getCurrentPrice() * quantity)}
                          </>
                        )}
                      </button>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={handleWishlistToggle}
                        className={`flex-1 p-2.5 sm:p-3 border-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                          isInWishlist(product?._id || "")
                            ? "border-pink-500 bg-pink-50 text-pink-600"
                            : "border-gray-300 hover:border-pink-300 hover:bg-pink-50"
                        }`}
                        title={
                          isInWishlist(product?._id || "")
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        <Heart
                          className={`h-4 w-4 sm:h-5 sm:w-5 mx-auto ${
                            isInWishlist(product?._id || "")
                              ? "fill-current"
                              : ""
                          }`}
                        />
                      </button>
                      <button className="flex-1 p-2.5 sm:p-3 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 hover:scale-105">
                        <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mx-auto" />
                      </button>
                    </div>
                  </div>                  {/* Delivery Info */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-4 rounded-xl border border-green-200">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 text-green-600 mt-0.5">🚚</div>
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base text-green-800">
                          Delivery Information
                        </h3>
                        <p className="text-xs sm:text-sm text-green-700 mt-1">
                          ⏰ {product.preparationTime} • 🆓 Free delivery on orders above ₹500
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {product.tags.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm sm:text-base font-semibold text-gray-900 block">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs for additional product information */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "description"
                      ? "text-pink-600 border-b-2 border-pink-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Description
                </button>
                {product.ingredients.length > 0 && (
                  <button
                    onClick={() => setActiveTab("ingredients")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "ingredients"
                        ? "text-pink-600 border-b-2 border-pink-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Ingredients
                  </button>
                )}
                {product.nutritionalInfo && (
                  <button
                    onClick={() => setActiveTab("nutrition")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "nutrition"
                        ? "text-pink-600 border-b-2 border-pink-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Nutritional Info
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "reviews"
                      ? "text-pink-600 border-b-2 border-pink-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Reviews ({product.reviewCount})
                </button>
              </div>

              <div className="py-4 px-1">
                {activeTab === "description" && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {activeTab === "ingredients" &&
                  product.ingredients.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Ingredients</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {product.ingredients.map((ingredient, index) => (
                          <li key={index} className="text-gray-600">
                            {ingredient}
                          </li>
                        ))}
                      </ul>

                      {product.allergens.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-base font-medium mb-1">
                            Allergen Information
                          </h4>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <p className="text-sm text-yellow-800 font-medium mb-1">
                              May contain:
                            </p>
                            <p className="text-sm text-gray-600">
                              {product.allergens.join(", ")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {activeTab === "nutrition" && product.nutritionalInfo && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Nutritional Information
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {product.nutritionalInfo.calories && (
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Calories</p>
                          <p className="text-lg font-medium">
                            {product.nutritionalInfo.calories}
                          </p>
                        </div>
                      )}
                      {product.nutritionalInfo.protein && (
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Protein</p>
                          <p className="text-lg font-medium">
                            {product.nutritionalInfo.protein}
                          </p>
                        </div>
                      )}
                      {product.nutritionalInfo.carbs && (
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Carbs</p>
                          <p className="text-lg font-medium">
                            {product.nutritionalInfo.carbs}
                          </p>
                        </div>
                      )}
                      {product.nutritionalInfo.fat && (
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Fat</p>
                          <p className="text-lg font-medium">
                            {product.nutritionalInfo.fat}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      *Approximate values per serving
                    </p>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center text-yellow-400 mr-2">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="ml-1 text-lg font-medium text-gray-800">
                          {product.rating}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        Based on {product.reviewCount} reviews
                      </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-600 mb-3">
                        Be the first to review this product!
                      </p>
                      <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Write a Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky cart bar that appears when product is in cart */}
            {/* {isInCart(product?._id || "") && (
              <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-3 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 relative rounded overflow-hidden mr-3">
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Added to your cart</p>
                      <p className="text-xs text-gray-500">
                        {product.name} ({selectedWeight})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={goToCart}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    View Cart
                  </button>
                </div>
              </div>
            )} */}          </div>
        </div>
      </div>
      
      {/* Add-On Modal */}
      <AddOnModal
        isOpen={showAddOnModal}
        onClose={handleModalClose}
        onSkip={handleModalSkip}
        onContinue={handleModalContinue}
        productName={product?.name}
      />
      
      <Footer />
    </>
  );
};

export default ProductPage;
