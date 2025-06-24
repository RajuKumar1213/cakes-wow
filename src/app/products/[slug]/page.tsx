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
  Camera,
} from "lucide-react";
import { Breadcrumb, Footer, Header, AddOnModal } from "@/components";
import PhotoCakeCustomization from "@/components/PhotoCakeCustomization";
import ReviewModal from "@/components/ReviewModal";
import ReviewsDisplay from "@/components/ReviewsDisplay";
import { useCart, AddOn } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import useSWR from "swr";

const fetcher = (...args: [RequestInfo, RequestInit?]) => fetch(...args).then(res => res.json())

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
  } = useCart();
  const { showSuccess } = useToast();  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState<string>(""); 
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [showPhotoCakeModal, setShowPhotoCakeModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [photoCakeData, setPhotoCakeData] = useState<{ image: File | null; message: string; imageUrl?: string }>({ image: null, message: '', imageUrl: undefined });
  const [activeTab, setActiveTab] = useState<
    "description" | "ingredients" | "nutrition" | "reviews"
  >("description");

  const { data, isLoading } = useSWR(`/api/products/${productSlug}`, fetcher);
  console.log(data?.data);
  useEffect(() => {
    if (data?.success) {
      setProduct(data?.data);

      if (data.data.weightOptions?.length > 0) {
        setSelectedWeight(data.data.weightOptions[0].weight);
      }
    }
  }, [data]);

  // Check if the current product is a photo cake
  const isPhotoCake = () => {
    if (!product) return false;
    
    // Check if any category is related to photo cakes
    return product.categories.some(category => 
      category.name.toLowerCase().includes('photo') || 
      category.slug.toLowerCase().includes('photo') ||
      category.name.toLowerCase().includes('print')
    );
  };


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
  }; const getDiscountPercentage = () => {
    const currentPrice = getCurrentPrice();
    const originalPrice = getOriginalPrice();

    if (originalPrice && currentPrice) {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
    return 0;
  };  const handleAddToCart = async () => {
    if (!product) return;

    // If it's a photo cake and no photo is uploaded, show the customization modal
    if (isPhotoCake() && !photoCakeData.image) {
      setShowPhotoCakeModal(true);
      return;
    }

    setAddingToCart(true);
    try {      // Add to cart with photo cake data if applicable
      const cartItem = {
        ...product,
        customization: isPhotoCake() ? {
          type: 'photo-cake',
          image: photoCakeData.image,
          message: photoCakeData.message,
          imageUrl: photoCakeData.imageUrl || null
        } : undefined
      };

      addToCart(cartItem, quantity, selectedWeight, []);
      showSuccess(
        "Added to Cart!",
        `${quantity}x ${product.name} (${selectedWeight}) added to your cart${isPhotoCake() && photoCakeData.image ? ' with your custom photo' : ''}`,
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
  };
  // const handleAddOnToggle = (addOnId: string, addOn: AddOn) => {
  //   const isSelected = selectedAddOns.some(selected => selected._id === addOn._id);

  //   if (isSelected) {
  //     setSelectedAddOns(prev => prev.filter(selected => selected._id !== addOn._id));
  //   } else {
  //     setSelectedAddOns(prev => [...prev, addOn]);
  //   }
  // };

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
  };  const handlePhotoCakeSave = (data: { image: File | null; imageUrl?: string; message: string }) => {
    setPhotoCakeData({ 
      image: data.image, 
      message: data.message,
      imageUrl: data.imageUrl || undefined // Will be undefined since we're not uploading yet
    });
    setShowPhotoCakeModal(false);
    
    // Show success message for photo selection
    if (data.image) {
      showSuccess(
        "Photo Selected!",
        "Your custom photo has been saved. Add to cart and it will be uploaded during checkout.",
        "check"
      );
    }
  };

  if (isLoading) {
    return (      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
          {/* Breadcrumb skeleton */}
          <div className="mb-2 sm:mb-3">
            <div className="flex items-center space-x-1.5 animate-pulse">
              <div className="h-3 bg-gray-300 rounded w-12"></div>
              <div className="h-3 bg-gray-300 rounded w-3"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
              <div className="h-3 bg-gray-300 rounded w-3"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 sm:p-3 animate-pulse">            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">              {/* Image skeleton */}
              <div className="flex gap-2 lg:gap-3">
                {/* Thumbnail skeleton - Left Side */}
                <div className="hidden sm:flex flex-col gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"
                    ></div>
                  ))}
                </div>
                {/* Main image skeleton */}
                <div className="flex-1">
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                  {/* Mobile thumbnail skeleton */}
                  <div className="grid grid-cols-4 gap-1 mt-2 sm:hidden">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"
                      ></div>
                    ))}
                  </div>
                </div>              </div>              {/* Content skeleton */}
              <div className="space-y-2 sm:space-y-3">
                <div className="space-y-2">
                  <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5"></div>
                  <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                  <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                </div>                <div className="space-y-2">
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
                  <div className="flex gap-1 sm:gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-6 sm:h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg w-12 sm:w-16"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="h-8 sm:h-9 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex-1"></div>
                  <div className="h-8 sm:h-9 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-8 sm:w-9"></div>
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
  ];  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6 relative z-10">
          <div className="mb-3 sm:mb-4">
            <Breadcrumb items={breadcrumbItems} />
          </div><div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden border border-white/50 hover:shadow-3xl transition-all duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 p-3 lg:p-4">                {/* Product Images */}                
                <div className="flex gap-2 lg:gap-3">
                  {/* Thumbnail Images - Left Side */}
                  {product.imageUrls.length > 1 && (
                    <div className="hidden sm:flex flex-col gap-2">
                      {product.imageUrls.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-12 h-12 lg:w-16 lg:h-16 rounded-lg border-2 overflow-hidden transition-all duration-300 hover:scale-110 hover:rotate-1 group ${selectedImageIndex === index
                            ? "border-pink-500 shadow-lg ring-2 ring-pink-200"
                            : "border-gray-200 hover:border-pink-300 hover:shadow-md"
                            }`}
                        >
                          <Image
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="64px"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Main Image */}
                  <div className="flex-1">
                    <div className="relative aspect-square w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group">
                      <Image
                        src={
                          product.imageUrls[selectedImageIndex] ||
                          "/placeholder-cake.jpg"
                        }
                        alt={product.name}
                        fill
                        className="object-cover p-2 sm:p-3 group-hover:scale-105 transition-transform duration-500"
                        priority={selectedImageIndex === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDdemcxqeK/8AUyQkKUSPH/Z"
                      />
                      {/* Floating badges */}
                      {getDiscountPercentage() > 0 && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 via-red-600 to-pink-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                          <span className="drop-shadow-sm">🔥 {getDiscountPercentage()}% OFF</span>
                        </div>
                      )}
                      {product.isBestseller && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                          <span className="drop-shadow-sm">⭐ Bestseller</span>
                        </div>
                      )}
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 pointer-events-none"></div>
                    </div>

                    {/* Mobile Thumbnail Images - Below Main Image */}
                    {product.imageUrls.length > 1 && (
                      <div className="grid grid-cols-4 gap-1 mt-2 sm:hidden">
                        {product.imageUrls.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all duration-300 hover:scale-105 group ${selectedImageIndex === index
                              ? "border-pink-500 shadow-md ring-2 ring-pink-200"
                              : "border-gray-200 hover:border-pink-300"
                              }`}
                          >
                            <Image
                              src={image}
                              alt={`${product.name} ${index + 1}`}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              sizes="25vw"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>              {/* Product Details */}
              <div className="space-y-2 sm:space-y-3">                {/* Header Section */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                      {product.name}
                    </h1>
                    
                    {/* Rating and Reviews */}
                    <div className="flex flex-wrap items-center gap-1">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-2 py-1 rounded-full border border-yellow-200">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-2.5 h-2.5 ${star <= product.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          {product.rating}
                        </span>
                        <span className="text-xs text-gray-600">
                          ({product.reviewCount})
                        </span>
                      </div>
                      
                      {product.isBestseller && (
                        <div className="bg-gradient-to-r from-yellow-100 to-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs font-bold border border-yellow-300">
                          ⭐ Bestseller
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2 sm:p-3 border border-gray-200">
                      <p className="text-gray-700 leading-relaxed text-xs">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-lg p-2 sm:p-3 border border-pink-200 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                          ₹{getCurrentPrice().toLocaleString()}
                        </span>
                        {getOriginalPrice() && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{getOriginalPrice()?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {getDiscountPercentage() > 0 && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                          💰 Save {getDiscountPercentage()}%
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-600">
                      <span className="font-medium">🎯 Special Price • Limited Time</span>
                    </div>
                  </div>
                </div>{/* Weight Options */}
                {product.weightOptions.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-900 block">
                      🎂 Choose Size
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {product.weightOptions.map((option) => (
                        <button
                          key={option.weight}
                          onClick={() => setSelectedWeight(option.weight)}
                          className={`relative p-2 rounded-lg border-2 text-center transition-all duration-300 hover:scale-105 group ${selectedWeight === option.weight
                            ? "border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 text-pink-600 shadow-md ring-2 ring-pink-200"
                            : "border-gray-200 hover:border-pink-300 text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-pink-50 hover:to-purple-50"
                            }`}
                        >
                          <div className="text-xs font-bold mb-1">
                            {option.weight}
                          </div>
                          <div className="text-xs font-black">
                            ₹{(option.discountedPrice || option.price).toLocaleString()}
                          </div>
                          {option.discountedPrice && (
                            <div className="text-xs line-through text-gray-500">
                              ₹{option.price.toLocaleString()}
                            </div>
                          )}
                          {selectedWeight === option.weight && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}{/* Photo Cake Customization */}
                {isPhotoCake() && (
                  <div className="space-y-2 p-2 sm:p-3 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 border-2 border-purple-300 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Camera className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-purple-900">Personalize Your Photo Cake</h3>
                        <p className="text-xs text-purple-700">Add your favorite memory!</p>
                      </div>
                    </div>
                    
                    {photoCakeData.image ? (
                      <div className="flex items-center gap-2 p-2 bg-white/70 backdrop-blur-sm rounded-lg border border-purple-200">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-purple-300 shadow-sm">
                          <Image
                            src={URL.createObjectURL(photoCakeData.image)}
                            alt="Selected photo"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                            <p className="text-xs font-bold text-gray-900">Photo uploaded!</p>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{photoCakeData.image.name}</p>
                          {photoCakeData.message && (
                            <div className="bg-purple-100 rounded-md p-1 mt-1">
                              <p className="text-xs text-purple-800 truncate">
                                💌 "{photoCakeData.message}"
                              </p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setShowPhotoCakeModal(true)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-lg font-semibold text-xs hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-2 sm:p-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                          <Camera className="h-5 w-5 text-purple-600" />
                        </div>
                        <p className="text-xs font-bold text-gray-800 mb-1">Make it yours!</p>
                        <p className="text-xs text-gray-600 mb-2">Upload your picture</p>
                        <button
                          onClick={() => setShowPhotoCakeModal(true)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg font-bold text-xs hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                        >
                          <Camera className="h-3 w-3 inline mr-1" />
                          📸 Add Photo
                        </button>
                      </div>
                    )}
                    
                    <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-800">
                        <strong>💡 Tip:</strong> Use high-quality photos with good lighting for best results.
                      </p>
                    </div>
                  </div>
                )}                {/* Quantity and Add to Cart */}
                <div className="space-y-2 sm:space-y-3">
                  {/* Quantity Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-900 block">
                      🛒 Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange("decrease")}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all duration-300 disabled:opacity-50 bg-gradient-to-br from-gray-50 to-gray-100"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-300 rounded-lg px-3 py-1 shadow-sm">
                        <span className="text-sm font-bold text-pink-600">
                          {quantity}
                        </span>
                      </div>
                      <button
                        onClick={() => handleQuantityChange("increase")}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {isInCart(product?._id || "") ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={handleAddToCart}
                          disabled={addingToCart}
                          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-3 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-1 text-xs border border-pink-400"
                        >
                          {addingToCart ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3" />
                              <span>✨ Added</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={goToCart}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-1 text-xs border border-green-400"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          <span>🛍️ View Cart</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-pink-400 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          {addingToCart ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Adding to Cart...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <ShoppingCart className="w-4 h-4" />
                              <span>🛒 Add to Cart - ₹{(getCurrentPrice() * quantity).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    )}

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleWishlistToggle}
                        className={`p-2 border-2 rounded-lg transition-all duration-300 hover:scale-105 font-semibold text-xs ${isInWishlist(product?._id || "")
                          ? "border-pink-500 bg-gradient-to-br from-pink-50 to-pink-100 text-pink-600 shadow-sm"
                          : "border-gray-300 hover:border-pink-300 hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100 bg-gradient-to-br from-gray-50 to-gray-100"
                          }`}
                        title={
                          isInWishlist(product?._id || "")
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        <Heart
                          className={`h-3 w-3 mx-auto mb-1 ${isInWishlist(product?._id || "")
                            ? "fill-current"
                            : ""
                            }`}
                        />
                        <span className="text-xs">
                          {isInWishlist(product?._id || "") ? "💖 Saved" : "🤍 Save"}
                        </span>
                      </button>
                      <button className="p-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 hover:scale-105 font-semibold text-xs">
                        <Share2 className="h-3 w-3 mx-auto mb-1" />
                        <span className="text-xs">📤 Share</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-2 sm:p-3 rounded-lg border border-green-200 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-sm shadow-sm">
                        🚚
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xs text-green-800 mb-1">
                          🎯 Delivery Info
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs">⏰</span>
                            <p className="text-xs font-semibold text-green-700">
                              Preparation time : {product.preparationTime}
                            </p>
                          </div>
                          <p className="text-xs text-green-700">
                            Fresh baked & carefully packaged
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>            {/* Enhanced Tabs Section */}
            <div className="border-t border-gray-200 mt-3 sm:mt-4 pt-3 sm:pt-4">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl p-1">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`flex-1 px-3 sm:px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === "description"
                    ? "text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                    }`}
                >
                  📝 Description
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 px-3 sm:px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === "reviews"
                    ? "text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                    }`}
                >
                  ⭐ Reviews ({product.reviewCount})
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-b-xl border-2 border-gray-200 border-t-0">
                {activeTab === "description" && (
                  <div className="p-3 sm:p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-lg">📖</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">About This Cake</h3>
                        <p className="text-xs text-gray-600">Everything you need to know</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed text-sm font-medium whitespace-pre-line">
                          {product.description}
                        </p>
                      </div>
                    </div>

                   
                  </div>
                )}                {activeTab === "reviews" && (
                  <div className="p-3 sm:p-4">
                    <ReviewsDisplay 
                      productId={product._id} 
                      onWriteReview={() => setShowReviewModal(true)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>{/* Add-On Modal */}
      <AddOnModal
        isOpen={showAddOnModal}
        onClose={handleModalClose}
        onSkip={handleModalSkip}
        onContinue={handleModalContinue}
        productName={product?.name}
      />

      {/* Photo Cake Customization Modal */}
      <PhotoCakeCustomization
        isOpen={showPhotoCakeModal}
        onClose={() => setShowPhotoCakeModal(false)}
        onSave={handlePhotoCakeSave}
        productName={product?.name || 'Photo Cake'}
      />      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        productId={product?._id || ''}
        productName={product?.name || ''}
        onReviewSubmitted={() => {
          setShowReviewModal(false);
          // Optionally trigger a refresh of reviews here
          window.location.reload(); // Simple refresh for now
        }}
      />

      <Footer />
    </>
  );
};

export default ProductPage;
