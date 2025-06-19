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
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [showPhotoCakeModal, setShowPhotoCakeModal] = useState(false);
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 lg:gap-8">              {/* Image skeleton */}
              <div className="flex gap-3 lg:gap-4">
                {/* Thumbnail skeleton - Left Side */}
                <div className="hidden sm:flex flex-col gap-2 lg:gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"
                    ></div>
                  ))}
                </div>
                {/* Main image skeleton */}
                <div className="flex-1">
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                  {/* Mobile thumbnail skeleton */}
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 mt-2 sm:hidden">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"
                      ></div>
                    ))}
                  </div>
                </div>              </div>

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
  ]; return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-8 py-2 lg:py-4">
          <div className=" sm:mb-2 lg:mb-2">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-8 p-2 sm:p-3 lg:p-8">                {/* Product Images */}                <div className="flex gap-2 lg:gap-3">
              {/* Thumbnail Images - Left Side */}
              {product.imageUrls.length > 1 && (
                <div className="hidden sm:flex flex-col gap-1.5 lg:gap-2">
                  {product.imageUrls.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-14 h-14 lg:w-16 lg:h-16 rounded-md border-2 overflow-hidden transition-all duration-300 hover:scale-105 ${selectedImageIndex === index
                        ? "border-pink-500 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-contain p-0.5"
                        sizes="64px"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="flex-1">
                <div className="relative aspect-square w-full bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden">
                  <Image
                    src={
                      product.imageUrls[selectedImageIndex] ||
                      "/placeholder-cake.jpg"
                    }
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    priority={selectedImageIndex === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDdemcxqeK/8AUyQkKUSPH/Z"
                  />
                  {getDiscountPercentage() > 0 && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                      {getDiscountPercentage()}% OFF
                    </div>
                  )}
                  {product.isBestseller && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                      ⭐ Bestseller
                    </div>
                  )}
                </div>

                {/* Mobile Thumbnail Images - Below Main Image */}
                {product.imageUrls.length > 1 && (
                  <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mt-2 sm:hidden">
                    {product.imageUrls.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square rounded-md border-2 overflow-hidden transition-all duration-300 hover:scale-105 ${selectedImageIndex === index
                          ? "border-pink-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-contain p-1"
                          sizes="25vw"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>              {/* Product Details */}
              <div className="space-y-3 lg:space-y-4">
                <div className="space-y-2">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= product.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {product.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.reviewCount} reviews)
                    </span>
                    {product.isBestseller && (
                      <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 px-2 py-0.5 rounded-lg text-xs font-semibold">
                        ⭐ Bestseller
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {product.shortDescription}
                  </p>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl lg:text-3xl font-bold text-pink-600">
                    ₹{getCurrentPrice()}
                  </span>
                  {getOriginalPrice() && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{getOriginalPrice()}
                    </span>
                  )}
                  {getDiscountPercentage() > 0 && (
                    <span className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg">
                      Save {getDiscountPercentage()}%
                    </span>
                  )}
                </div>                {/* Weight Options */}
                {product.weightOptions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 block">
                      Select Weight
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {product.weightOptions.map((option) => (
                        <button
                          key={option.weight}
                          onClick={() => setSelectedWeight(option.weight)}
                          className={`p-2 rounded-lg border-2 text-center transition-all duration-300 hover:scale-105 ${selectedWeight === option.weight
                            ? "border-pink-500 bg-pink-50 text-pink-600 shadow-md"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}
                        >
                          <div className="text-xs font-semibold">
                            {option.weight}
                          </div>
                          <div className="text-xs font-bold text-gray-900">
                            ₹{option.discountedPrice || option.price}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>                )}                {/* Photo Cake Customization */}
                {isPhotoCake() && (
                  <div className="space-y-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-purple-600" />
                      <h3 className="text-base font-semibold text-purple-900">Personalize Your Photo Cake</h3>
                    </div>
                    
                    {photoCakeData.image ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-purple-200">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={URL.createObjectURL(photoCakeData.image)}
                              alt="Selected photo"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-900">Photo uploaded ✓</p>
                            <p className="text-xs text-gray-500">{photoCakeData.image.name}</p>
                            {photoCakeData.message && (
                              <p className="text-xs text-purple-600">
                                Message: "{photoCakeData.message}"
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setShowPhotoCakeModal(true)}
                            className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-2">
                        <div className="mb-2">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                            <Camera className="h-6 w-6 text-purple-600" />
                          </div>
                          <p className="text-xs text-gray-700 mb-1">Make it special with your photo!</p>
                          <p className="text-xs text-gray-500">Upload your favorite picture</p>
                        </div>
                        <button
                          onClick={() => setShowPhotoCakeModal(true)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold text-xs hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                          <Camera className="h-3 w-3 inline mr-1" />
                          Add Your Photo
                        </button>
                      </div>
                    )}
                    
                    <div className="bg-white/60 p-2 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-800">
                        <strong>💡 Tip:</strong> Upload high-quality photos with good lighting for best results.
                      </p>
                    </div>
                  </div>
                )}

                {/* Quantity and Add to Cart */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 block">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange("decrease")}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all disabled:opacity-50"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-lg font-bold w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange("increase")}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {isInCart(product?._id || "") ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleAddToCart}
                          disabled={addingToCart}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 text-sm"
                        >
                          {addingToCart ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Added to Cart</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={goToCart}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 text-sm"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>View Cart</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2.5 px-6 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {addingToCart ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Adding...
                          </div>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 inline mr-2" />
                            Add to Cart - ₹{(getCurrentPrice() * quantity)}
                          </>
                        )}
                      </button>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={handleWishlistToggle}
                        className={`flex-1 p-2.5 border-2 rounded-xl transition-all duration-300 hover:scale-105 ${isInWishlist(product?._id || "")
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
                          className={`h-4 w-4 mx-auto ${isInWishlist(product?._id || "")
                            ? "fill-current"
                            : ""
                            }`}
                        />
                      </button>
                      <button className="flex-1 p-2.5 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 hover:scale-105">
                        <Share2 className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                  </div>                  {/* Delivery Info */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-xl border border-green-200">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-4 h-4 text-green-600 mt-0.5">🚚</div>
                      <div>
                        <h3 className="font-semibold text-sm text-green-800">
                          Delivery Information
                        </h3>
                        <p className="text-xs text-green-700 mt-1">
                          ⏰ {product.preparationTime} • Preparation time
                          may vary based on order volume.
                        </p>
                      </div>
                    </div>
                  </div>

                 
                </div>
              </div>
            </div>

            {/* Tabs for additional product information */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-4 py-2 text-sm font-medium ${activeTab === "description"
                    ? "text-pink-600 border-b-2 border-pink-600"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Description
                </button>
               
               
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-4 py-2 text-sm font-medium ${activeTab === "reviews"
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
          </div>
        </div>
      </div>      {/* Add-On Modal */}
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
      />

      <Footer />
    </>
  );
};

export default ProductPage;
