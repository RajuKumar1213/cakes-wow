"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProductCardWrapper } from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";
import Loading from "@/components/Loading";
import DualRangeSlider from "@/components/ui/DualRangeSlider";
import { useToast } from "@/contexts/ToastContext";
import { 
  Filter, 
  Search,
  X,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountedPrice?: number;
  imageUrls: string[];
  rating: number;
  reviewCount: number;
  shortDescription: string;
  isBestseller: boolean;
  categories: Array<{ name: string; slug: string }>;
  tags: string[];
  weightOptions: Array<{
    weight: string;
    price: number;
    discountedPrice?: number;
  }>;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

const CategoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.category as string;
  const { showError } = useToast();  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceInputs, setPriceInputs] = useState({ min: 0, max: 5000 });
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Sync price inputs with slider
  useEffect(() => {
    setPriceInputs({ min: priceRange[0], max: priceRange[1] });
  }, [priceRange]);

  // Prevent background scrolling when filters modal is open on mobile
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFilters]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: category?.name || "Category", href: `/${categorySlug}` },
  ];
  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        // Fetch category details
        const categoryResponse = await axios.get(`/api/categories/${categorySlug}`);
        if (categoryResponse.data.success) {
          setCategory(categoryResponse.data.data);
        } else {
          setError("Category not found");
          return;
        }

        // Fetch products for this category
        const productsResponse = await axios.get(`/api/products?category=${categorySlug}`);
        if (productsResponse.data.success) {
          setProducts(productsResponse.data.data.products || []);
        }
      } catch (error: any) {
        console.error("Error fetching category data:", error);
        
        // Set error state to prevent infinite loop
        if (error.response?.status === 404) {
          setError("Category not found");
        } else {
          setError("Failed to load category data");
        }
        
        // Don't show toast error to prevent infinite loops
        // showError("Error", "Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug && !error) { // Only fetch if no error state
      fetchCategoryAndProducts();
    }
  }, [categorySlug]); // Removed showError from dependencies to prevent infinite loop

  const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "rating", label: "Rating" },
    { value: "newest", label: "Newest First" },
    { value: "name", label: "Name A-Z" },
  ];  const getFilteredAndSortedProducts = () => {
    // Ensure products is an array
    if (!Array.isArray(products)) {
      return [];
    }
    
    let filtered = products.filter(product => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Price filter
      const productPrice = product.discountedPrice || product.price;
      if (productPrice < priceRange[0] || productPrice > priceRange[1]) {
        return false;
      }

      // Weight filter
      if (selectedWeights.length > 0) {
        const hasMatchingWeight = product.weightOptions?.some(option => 
          selectedWeights.includes(option.weight)
        );
        if (!hasMatchingWeight) {
          return false;
        }
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some(tag => 
          product.tags.some(productTag => 
            productTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });

    // Sort products
    switch (sortBy) {
      case "price_low":
        filtered.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
        break;
      case "price_high":
        filtered.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        // Assuming newer products have higher IDs
        filtered.sort((a, b) => b._id.localeCompare(a._id));
        break;      default: // popularity
        filtered.sort((a, b) => {
          // Sort by bestseller first, then by rating
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          return b.rating - a.rating;
        });
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  // Get unique weights from all products for filter options
  const availableWeights = Array.from(
    new Set(
      products.flatMap(product => 
        product.weightOptions?.map(option => option.weight) || []
      )
    )
  ).sort();  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="xl" />
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Loading {categorySlug}...
            </h3>
            <p className="text-gray-500 text-sm">
              Please wait while we fetch the products
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Category Not Found"}
          </h1>
          <p className="text-gray-600 mb-4">
            {error === "Category not found" 
              ? "The category you're looking for doesn't exist." 
              : "There was an error loading the category. Please try again later."}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex">            {/* Desktop Sidebar Filters - Hidden on mobile */}
            <div className="hidden lg:block w-80 bg-white border-r border-gray-100 min-h-screen shadow-sm">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-5 w-5 text-pink-600" />
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  <Sparkles className="h-4 w-4 text-pink-500" />
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                  />
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Price Range */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    Price Range
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between text-sm font-medium text-gray-700">
                      <span className="px-2 py-1 bg-white rounded-lg border">₹{priceRange[0]}</span>
                      <span className="text-gray-400">to</span>
                      <span className="px-2 py-1 bg-white rounded-lg border">₹{priceRange[1]}</span>
                    </div>
                    
                    <DualRangeSlider
                      min={0}
                      max={5000}
                      step={100}
                      value={priceRange as [number, number]}
                      onChange={(value) => setPriceRange(value)}
                      className="my-4"
                    />
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceInputs.min}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setPriceInputs(prev => ({ ...prev, min: value }));
                            setPriceRange([value, priceRange[1]]);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceInputs.max}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 5000;
                            setPriceInputs(prev => ({ ...prev, max: value }));
                            setPriceRange([priceRange[0], value]);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weight Filter */}
                {availableWeights.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Weight Options
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="grid grid-cols-2 gap-2">
                        {availableWeights.map((weight) => (
                          <label 
                            key={weight} 
                            className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedWeights.includes(weight)
                                ? 'border-pink-500 bg-pink-50 text-pink-700'
                                : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-25'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedWeights.includes(weight)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedWeights([...selectedWeights, weight]);
                                } else {
                                  setSelectedWeights(selectedWeights.filter(w => w !== weight));
                                }
                              }}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">{weight}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setPriceRange([0, 5000]);
                    setSelectedWeights([]);
                    setSelectedTags([]);
                    setSearchQuery("");
                  }}
                  className="w-full text-sm text-pink-600 hover:text-pink-700 font-semibold py-3 border-2 border-pink-200 rounded-xl hover:bg-pink-50 transition-all duration-200 hover:border-pink-300"
                >
                  Clear All Filters
                </button>
              </div>
            </div>            {/* Main Content */}
            <div className="flex-1 bg-gray-50">
              {/* Mobile Header with Filter Button */}
              <div className="lg:hidden p-4 bg-white border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {filteredProducts.length} Products
                  </h2>
                  <button
                    onClick={() => setShowFilters(true)}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-pink-200 rounded-xl text-sm font-semibold text-pink-600 hover:bg-pink-50 transition-all duration-200"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                </div>
                
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm"
                  />
                </div>
              </div>

              <div className="p-4 lg:p-6">
                {/* Sort Dropdown and View Toggle */}
                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="hidden lg:block">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {filteredProducts.length} Products Found
                      </h2>
                      <p className="text-sm text-gray-600">
                        in {category?.name} category
                      </p>
                    </div>
                      <div className="flex items-center gap-3">
                      {/* Sort Dropdown */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm font-medium bg-white shadow-sm min-w-[160px]"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCardWrapper 
                        key={product._id} 
                        product={product} 
                        viewMode="grid"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-400 mb-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                    </p>
                    <button
                      onClick={() => {
                        setPriceRange([0, 5000]);
                        setSelectedWeights([]);
                        setSelectedTags([]);
                        setSearchQuery("");
                      }}
                      className="px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>        {/* Mobile Filters Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm">
            <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50 sticky top-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-pink-600" />
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    <Sparkles className="h-4 w-4 text-pink-500" />
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Price Range */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    Price Range
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between text-sm font-medium text-gray-700">
                      <span className="px-2 py-1 bg-white rounded-lg border">₹{priceRange[0]}</span>
                      <span className="text-gray-400">to</span>
                      <span className="px-2 py-1 bg-white rounded-lg border">₹{priceRange[1]}</span>
                    </div>
                    
                    <DualRangeSlider
                      min={0}
                      max={5000}
                      step={100}
                      value={priceRange as [number, number]}
                      onChange={(value) => setPriceRange(value)}
                      className="my-4"
                    />
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceInputs.min}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setPriceInputs(prev => ({ ...prev, min: value }));
                            setPriceRange([value, priceRange[1]]);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceInputs.max}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 5000;
                            setPriceInputs(prev => ({ ...prev, max: value }));
                            setPriceRange([priceRange[0], value]);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weight Filter */}
                {availableWeights.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Weight Options
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="grid grid-cols-2 gap-2">
                        {availableWeights.map((weight) => (
                          <label 
                            key={weight} 
                            className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedWeights.includes(weight)
                                ? 'border-pink-500 bg-pink-50 text-pink-700'
                                : 'border-gray-200 bg-white hover:border-pink-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedWeights.includes(weight)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedWeights([...selectedWeights, weight]);
                                } else {
                                  setSelectedWeights(selectedWeights.filter(w => w !== weight));
                                }
                              }}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">{weight}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-gray-50 flex gap-3 sticky bottom-0">
                <button
                  onClick={() => {
                    setPriceRange([0, 5000]);
                    setSelectedWeights([]);
                    setSelectedTags([]);
                    setSearchQuery("");
                  }}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white transition-all duration-200"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CategoryPage;
