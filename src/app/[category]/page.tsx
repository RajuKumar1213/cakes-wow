"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProductCardWrapper } from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";
import Loading from "@/components/Loading";
import { useToast } from "@/contexts/ToastContext";
import { 
  Filter, 
  Search,
  X,
  ChevronDown,
  ChevronRight
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
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
  ).sort();
  if (loading) {
    return <Loading />;
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
          <div className="flex">
            {/* Desktop Sidebar Filters - Hidden on mobile */}
            <div className="hidden lg:block w-80 bg-white border-r min-h-screen">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight Filter */}
                {availableWeights.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Weight</h4>
                    <div className="space-y-2">
                      {availableWeights.map((weight) => (
                        <label key={weight} className="flex items-center">
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
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{weight}</span>
                        </label>
                      ))}
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
                  className="w-full text-sm text-pink-600 hover:text-pink-700 font-medium py-2 border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 lg:p-6">
              {/* Mobile Header with Filter Button */}
              <div className="lg:hidden mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {filteredProducts.length} Products
                  </h2>
                  <button
                    onClick={() => setShowFilters(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="hidden lg:block">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {filteredProducts.length} Products
                    </h2>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCardWrapper 
                      key={product._id} 
                      product={product} 
                      viewMode="grid"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <button
                    onClick={() => {
                      setPriceRange([0, 5000]);
                      setSelectedWeights([]);
                      setSelectedTags([]);
                      setSearchQuery("");
                    }}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
            <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b bg-white sticky top-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight Filter */}
                {availableWeights.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Weight</h4>
                    <div className="space-y-2">
                      {availableWeights.map((weight) => (
                        <label key={weight} className="flex items-center">
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
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{weight}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-gray-50 flex gap-3">
                <button
                  onClick={() => {
                    setPriceRange([0, 5000]);
                    setSelectedWeights([]);
                    setSelectedTags([]);
                    setSearchQuery("");
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
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
