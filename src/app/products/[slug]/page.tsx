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
  ChevronDown,
  MapPin,
  Clock,
  Truck,
  Award,
  Shield,
} from "lucide-react";
import { Breadcrumb, Footer, Header, AddOnModal } from "@/components";
import PhotoCakeCustomization from "@/components/PhotoCakeCustomization";
import ReviewModal from "@/components/ReviewModal";
import ReviewsDisplay from "@/components/ReviewsDisplay";
import { useCart, AddOn } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import useSWR from "swr";

const fetcher = (...args: [RequestInfo, RequestInit?]) =>
  fetch(...args).then((res) => res.json());

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
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
  flavors?: string[];
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
    _id: string;
    name: string;
    slug: string;
  }>;
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
    getCartItemByProductId,
  } = useCart();

  const { showSuccess } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [showPhotoCakeModal, setShowPhotoCakeModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [photoCakeData, setPhotoCakeData] = useState<{
    image: File | null;
    message: string;
    imageUrl?: string;
  }>({ image: null, message: "", imageUrl: undefined });
  const [activeTab, setActiveTab] = useState<
    "description" | "ingredients" | "nutrition" | "reviews"
  >("description");

  const { data, isLoading } = useSWR(`/api/products/${productSlug}`, fetcher);
  useEffect(() => {
    if (data?.success) {
      setProduct(data?.data);
      if (data.data.weightOptions?.length > 0) {
        setSelectedWeight(data.data.weightOptions[0].weight);
      }
      if (data.data.flavors?.length > 0) {
        setSelectedFlavor(data.data.flavors[0]);
      }
    }
  }, [data]); // Check if the current product is a photo cake
  const isPhotoCake = () => {
    if (!product) return false;
    return product.categories.some(
      (category) =>
        category.name.toLowerCase().includes("photo") ||
        category.slug.toLowerCase().includes("photo") ||
        category.name.toLowerCase().includes("print")
    );
  };

  // Get cart item data for this product if it exists
  const getCartItemData = () => {
    if (!product) return null;
    return getCartItemByProductId(product._id);
  };
  // Get personalization data from cart or local state
  const getPersonalizationData = () => {
    const cartItem = getCartItemData();
    if (cartItem?.customization) {
      return {
        image: cartItem.customization.image,
        message: cartItem.customization.message,
        imageUrl: cartItem.customization.imageUrl || undefined,
      };
    }
    return photoCakeData;
  };

  // Calculate earliest delivery date based on preparation time
  const getEarliestDeliveryDate = () => {
    if (!product?.preparationTime) return "Tomorrow";

    try {
      // Extract number from preparation time (e.g., "24 hours", "2 days", "3-4 hours")
      const timeStr = product.preparationTime.toLowerCase();
      let days = 0;

      if (timeStr.includes("hour")) {
        const hours = parseInt(timeStr.match(/\d+/)?.[0] || "24");
        days = Math.ceil(hours / 24);
      } else if (timeStr.includes("day")) {
        days = parseInt(timeStr.match(/\d+/)?.[0] || "1");
      } else {
        // Default to 1 day if format is unclear
        days = 1;
      }

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + Math.max(days, 1));

      // Format the date
      if (days === 1) {
        return "Tomorrow";
      } else if (days === 2) {
        return "Day after tomorrow";
      } else {
        return deliveryDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        });
      }
    } catch (error) {
      console.error("Error calculating delivery date:", error);
      return "Tomorrow";
    }
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

    // If it's a photo cake and no photo is uploaded, show the customization modal
    if (isPhotoCake() && !photoCakeData.image) {
      setShowPhotoCakeModal(true);
      return;
    }

    setAddingToCart(true);
    try {
      const cartItem = {
        ...product,
        customization: isPhotoCake()
          ? {
              type: "photo-cake",
              image: photoCakeData.image,
              message: photoCakeData.message,
              imageUrl: photoCakeData.imageUrl || null,
            }
          : undefined,
      };

      addToCart(cartItem, quantity, selectedWeight, []);
      showSuccess(
        "Added to Cart!",
        `${quantity}x ${product.name} (${selectedWeight}) added to your cart${
          isPhotoCake() && photoCakeData.image ? " with your custom photo" : ""
        }`,
        "cart"
      );

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

  const handleModalSkip = () => {
    setShowAddOnModal(false);
    router.push("/cart");
  };

  const handleModalContinue = () => {
    setShowAddOnModal(false);
    router.push("/cart");
  };

  const handleModalClose = () => {
    setShowAddOnModal(false);
  };

  const handlePhotoCakeSave = (data: {
    image: File | null;
    imageUrl?: string;
    message: string;
  }) => {
    setPhotoCakeData({
      image: data.image,
      message: data.message,
      imageUrl: data.imageUrl || undefined,
    });
    setShowPhotoCakeModal(false);

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
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-300 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-600">
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
  ];

  return (
    <>
      {" "}
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-6 py-6">
          <div className="mb-6 px-1 sm:px-2 lg:px-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className="bg-white rounded-lg overflow-hidden px-2 sm:px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              {/* Product Images */}
              <div className="flex gap-4">
                {/* Thumbnail Images - Left Side */}
                {product.imageUrls.length > 1 && (
                  <div className="hidden sm:flex flex-col gap-3">
                    {product.imageUrls.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden transition-all duration-300 ${
                          selectedImageIndex === index
                            ? "border-orange-500 shadow-lg"
                            : "border-gray-200 hover:border-orange-300"
                        }`}>
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}{" "}
                {/* Main Image */}
                <div className="flex-1">
                  <div className="relative aspect-square w-full bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={
                        product.imageUrls[selectedImageIndex] ||
                        "/placeholder-cake.jpg"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority={selectedImageIndex === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {/* Personalized badge for photo cakes */}
                    {isPhotoCake() && (
                      <div className="absolute bottom-0 left-0 bg-yellow-500 text-black px-3 py-1 rounded-tr-2xl text-sm font-bold">
                        {getPersonalizationData().imageUrl
                          ? "Personalized"
                          : "Personalised"}
                      </div>
                    )}
                  </div>

                  {/* Mobile Thumbnail Images */}
                  {product.imageUrls.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 mt-3 sm:hidden">
                      {product.imageUrls.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-square rounded-lg border-2 overflow-hidden ${
                            selectedImageIndex === index
                              ? "border-orange-500"
                              : "border-gray-200"
                          }`}>
                          <Image
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="25vw"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Product Title and Rating */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded">
                      <span className="text-green-600 font-bold text-sm">
                        {product.rating}
                      </span>
                      <Star className="w-4 h-4 fill-green-600 text-green-600" />
                      <span className="text-sm text-gray-600">
                        ({product.reviewCount} Reviews)
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{getCurrentPrice()}
                    </span>
                    {getOriginalPrice() && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{getOriginalPrice()}
                        </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                          ({getDiscountPercentage()}% OFF)
                        </span>
                      </>
                    )}
                    <span className="text-sm text-gray-500">
                      (Inclusive of GST)
                    </span>
                  </div>
                </div>{" "}
                {product.description && (
                  <div className="space-y-4 mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Description
                    </h2>
                    <div className="text-gray-700">
                      {product.description.length > 200 ? (
                        <>
                          {showFullDescription
                            ? product.description
                            : `${product.description.substring(0, 200)}...`}
                          <button
                            onClick={() =>
                              setShowFullDescription(!showFullDescription)
                            }
                            className="text-gray-800 hover:text-gray-900 font-medium ml-2 underline">
                            {showFullDescription ? "Show Less" : "Show More"}
                          </button>
                        </>
                      ) : (
                        product.description
                      )}
                    </div>
                  </div>
                )}
                {/* Weight Selection */}
                {product.weightOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Select Weight
                      <span className="ml-2 text-blue-600 text-xs cursor-pointer hover:underline">
                        Serving Info
                      </span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {product.weightOptions.map((option) => (
                        <button
                          key={option.weight}
                          onClick={() => setSelectedWeight(option.weight)}
                          className={`p-3 text-center border rounded-lg transition-colors ${
                            selectedWeight === option.weight
                              ? "border-red-500 bg-red-50 text-red-600"
                              : "border-gray-300 hover:border-gray-400"
                          }`}>
                          <div className="font-medium text-sm">
                            {option.weight}
                          </div>
                        </button>
                      ))}{" "}
                    </div>
                  </div>
                )}{" "}
                {/* Quality Assurance Features */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center">
                        On time delivery
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Award className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center">
                        100% fresh & hygienic
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                        <Shield className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center">
                        FSSAI approved
                      </span>
                    </div>
                  </div>
                </div>
                {/* Flavor Selection */}
                {product.flavors && product.flavors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Select Flavours
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white"
                        value={selectedFlavor}
                        onChange={(e) => setSelectedFlavor(e.target.value)}>
                        {product.flavors.map((flavor) => (
                          <option key={flavor} value={flavor}>
                            {flavor}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}
                {/*  Preparation Time Info */}
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Preparation Time: {product.preparationTime || "24 hours"}
                    </span>
                  </div>
                </div>{" "}
                {/* Preview Personalised Image Box for Photo Cakes */}
                {isPhotoCake() &&
                  (getPersonalizationData().imageUrl ||
                    getPersonalizationData().image) && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center gap-3">
                        {(getPersonalizationData().imageUrl ||
                          getPersonalizationData().image) && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300">
                            <Image
                              src={
                                getPersonalizationData().imageUrl ||
                                (getPersonalizationData().image instanceof File
                                  ? URL.createObjectURL(
                                      getPersonalizationData().image!
                                    )
                                  : "/placeholder-cake.jpg")
                              }
                              alt="Personalized preview"
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <button
                            onClick={() => setShowPhotoCakeModal(true)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm underline">
                            {isInCart(product._id)
                              ? "View Personalised Cake"
                              : "Edit Personalisation"}
                          </button>
                          <p className="text-xs text-gray-500 mt-1">
                            {getPersonalizationData().message
                              ? `Message: "${getPersonalizationData().message}"`
                              : "Click to edit your personalization"}
                          </p>
                          {!isInCart(product._id) && (
                            <p className="text-xs text-green-600 mt-1 font-medium">
                              ✓ Ready to add to cart
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                {/* Photo Cake Buttons - Show based on cart status and customization */}
                {isPhotoCake() && (
                  <>
                    {isInCart(product._id) ? (
                      // If photo cake is already in cart, show Go to Cart button
                      <button
                        onClick={goToCart}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Go to Cart
                      </button>
                    ) : getPersonalizationData().image ||
                      getPersonalizationData().imageUrl ? (
                      // If photo cake is customized but not in cart, show Add to Cart button
                      <div className="flex gap-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange("decrease")}
                            className="p-2 hover:bg-gray-100"
                            disabled={quantity <= 1}>
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 font-medium">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange("increase")}
                            className="p-2 hover:bg-gray-100">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={handleAddToCart}
                          disabled={addingToCart}
                          className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50">
                          {addingToCart ? "Adding..." : "Add to Cart"}
                        </button>

                        <button
                          onClick={handleWishlistToggle}
                          className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <Heart
                            className={`w-5 h-5 ${
                              isInWishlist(product._id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>
                    ) : (
                      // If photo cake is not customized yet, show Personalise button
                      <button
                        onClick={() => setShowPhotoCakeModal(true)}
                        className="w-full bg-red-500 text-white py-3 rounded-lg font-medium text-lg hover:bg-red-600 transition-colors">
                        Personalise Your Cake
                      </button>
                    )}
                  </>
                )}
                {/* Regular Add to Cart for non-photo cakes only */}
                {!isPhotoCake() && (
                  <div className="flex gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange("decrease")}
                        className="p-2 hover:bg-gray-100"
                        disabled={quantity <= 1}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange("increase")}
                        className="p-2 hover:bg-gray-100">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {isInCart(product._id) ? (
                      <button
                        onClick={goToCart}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Go to Cart
                      </button>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50">
                        {addingToCart ? "Adding..." : "Add to Cart"}
                      </button>
                    )}

                    <button
                      onClick={handleWishlistToggle}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Heart
                        className={`w-5 h-5 ${
                          isInWishlist(product._id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Reviews Section */}
        <div className="bg-gray-50 py-8 mt-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            {" "}
            <ReviewsDisplay
              productId={product._id}
            />
          </div>
        </div>
      </div>
      {/* Add-On Modal */}
      <AddOnModal
        isOpen={showAddOnModal}
        onClose={handleModalClose}
        onSkip={handleModalSkip}
        onContinue={handleModalContinue}
        productName={product?.name}
      />{" "}
      {/* Photo Cake Customization Modal */}
      <PhotoCakeCustomization
        isOpen={showPhotoCakeModal}
        onClose={() => setShowPhotoCakeModal(false)}
        onSave={handlePhotoCakeSave}
        productName={product?.name || "Photo Cake"}
        initialData={getPersonalizationData()}
      />
      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        productId={product?._id || ""}
        productName={product?.name || ""}
        onReviewSubmitted={() => {
          setShowReviewModal(false);
          window.location.reload();
        }}
      />
      <Footer />
    </>
  );
};

export default ProductPage;
