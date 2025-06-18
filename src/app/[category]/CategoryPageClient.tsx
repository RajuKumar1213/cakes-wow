"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProductCardWrapper } from "@/components/ProductCard";
import Loading from "@/components/Loading";
import DualRangeSlider from "@/components/ui/DualRangeSlider";
import { useToast } from "@/contexts/ToastContext";
import {
  Filter,
  X,
  SlidersHorizontal,
  Sparkles,
  ChevronLeft,
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

interface CategoryPageClientProps {
  initialCategory: Category;
  initialProducts: Product[];
  categorySlug: string;
  initialFilterOptions: {
    weights: string[];
    tags: string[];
    priceRange?: { min: number; max: number };
  };
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const CategoryPageClient = ({
  initialCategory,
  initialProducts,
  categorySlug,
  initialFilterOptions,
  initialPagination,
}: CategoryPageClientProps) => {
  const router = useRouter();
  const { showError } = useToast();

  const [category] = useState<Category>(initialCategory);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filterLoading, setFilterLoading] = useState(false);
  const [pagination, setPagination] = useState(initialPagination || {
    page: 1,
    limit: 24,
    total: initialProducts.length,
    pages: Math.ceil(initialProducts.length / 24)
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("displayOrder"); // Use displayOrder to respect admin ordering
  const [priceInputs, setPriceInputs] = useState({
    min: 0,
    max: initialFilterOptions.priceRange?.max || 5000
  });

  // Filter states
  const [priceRange, setPriceRange] = useState([
    0,
    initialFilterOptions.priceRange?.max || 5000
  ]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);  const [availableWeights] = useState<string[]>(initialFilterOptions.weights);
  const [availableTags] = useState<string[]>(initialFilterOptions.tags);
  
  // Track if this is the initial render
  const isInitialRender = useRef(true);

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

    return () => {
      document.body.style.overflow = '';
    };
  }, [showFilters]);  // Function to build API query parameters from filter state
  const buildApiParams = (page: number = 1) => {
    const params = new URLSearchParams();
    params.append('category', categorySlug);
    params.append('page', page.toString());

    if (priceRange[0] > 0) {
      params.append('minPrice', priceRange[0].toString());
    }
    if (priceRange[1] < (initialFilterOptions.priceRange?.max || 5000)) {
      params.append('maxPrice', priceRange[1].toString());
    }

    // Make sure to include all selected weights
    selectedWeights.forEach(weight => {
      params.append('weights', weight);
    });

    // Make sure to include all selected tags
    selectedTags.forEach(tag => {
      params.append('tags', tag);
    });    // Add sorting
    if (sortBy === 'price_low') {
      params.append('sortBy', 'price');
      params.append('sortOrder', 'asc');
    } else if (sortBy === 'price_high') {
      params.append('sortBy', 'price');
      params.append('sortOrder', 'desc');
    } else if (sortBy === 'rating') {
      params.append('sortBy', 'rating');
      params.append('sortOrder', 'desc');
    } else if (sortBy === 'name') {
      params.append('sortBy', 'name');
      params.append('sortOrder', 'asc');
    } else if (sortBy === 'newest') {
      params.append('sortBy', 'createdAt');
      params.append('sortOrder', 'desc');
    } else if (sortBy === 'popularity') {
      params.append('sortBy', 'rating');
      params.append('sortOrder', 'desc');
    } else if (sortBy === 'displayOrder') {
      // Admin-defined ordering
      params.append('sortBy', 'displayOrder');
      params.append('sortOrder', 'asc');
    } else {
      // Default to admin ordering instead of rating
      params.append('sortBy', 'displayOrder');
      params.append('sortOrder', 'asc');
    }

    params.append('limit', '24');
    return params.toString();
  }; const fetchFilteredProducts = async (page: number = 1) => {
    try {
      setFilterLoading(true);

      // Build API parameters with the current page and all filters
      const apiParams = buildApiParams(page);

      // Log the full API params for debugging
      console.log(`Fetching products with params: ${apiParams}`);

      const response = await fetch(`/api/products?${apiParams}`);

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update products state with the new results
        setProducts(data.data.products || []);

        // Update pagination state
        setPagination(data.data.pagination || {
          page: 1,
          limit: 24,
          total: 0,
          pages: 0
        });

        // Log successful update
        console.log(`Products updated. Page: ${data.data.pagination?.page}, Total: ${data.data.pagination?.total}`);
      } else {
        showError("Error", "Failed to filter products");
        console.error("API returned error:", data.error);
      }
    } catch (error) {
      console.error("Error filtering products:", error);
      showError("Error", "Failed to filter products");
    } finally {
      setFilterLoading(false);
    }
  };  // Fetch products when filters change
  useEffect(() => {
    // Skip the very first render since we have server-side data
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // For all subsequent changes (including clearing filters), fetch new data
    fetchFilteredProducts(1); // Reset to page 1 when filters change
  }, [priceRange, selectedWeights, selectedTags, sortBy]);
  // Handle page change
  const handlePageChange = (page: number) => {
    console.log(`Page change requested to: ${page}`);

    // Make sure we're not already on the requested page
    if (page !== pagination.page) {
      // Fetch products for the new page while preserving all current filters
      fetchFilteredProducts(page);

      // Scroll to top of products section
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "rating", label: "Rating" },
    { value: "newest", label: "Newest First" },
    { value: "name", label: "Name A-Z" },
  ];

  const filteredProducts = products;
  const maxPrice = initialFilterOptions.priceRange?.max || 5000;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex">
        {/* Desktop Sidebar Filters - Hidden on mobile */}
        <div className="hidden lg:block w-80 bg-white border-r border-gray-100 min-h-screen shadow-sm">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-pink-600" />
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <Sparkles className="h-4 w-4 text-pink-500" />
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
                  max={maxPrice}
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
                        const value = parseInt(e.target.value) || maxPrice;
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
                        className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedWeights.includes(weight)
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
                // Reset all filters to their initial state
                setPriceRange([0, maxPrice]);
                setSelectedWeights([]);
                setSelectedTags([]);
                setSortBy("popularity");
              }}
              className="w-full text-sm text-pink-600 hover:text-pink-700 font-semibold py-3 border-2 border-pink-200 rounded-xl hover:bg-pink-50 transition-all duration-200 hover:border-pink-300"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
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
            </div>            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="relative">
                {filterLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                    <div className="text-center">
                      <Loading size="lg" />
                      <p className="text-sm text-gray-600 mt-2">Applying filters...</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 md:gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCardWrapper
                      key={product._id}
                      product={product}
                      viewMode="grid"
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>

                      {/* Page Numbers */}
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 5;
                        let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }

                        // Add first page and ellipsis if needed
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => handlePageChange(1)}
                              className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-pink-600 border-t border-b border-r border-gray-300 hover:bg-gray-50"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis1" className="px-3 py-2 text-sm text-gray-500 border-t border-b border-r border-gray-300">
                                ...
                              </span>
                            );
                          }
                        }

                        // Add visible page numbers
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`px-3 py-2 text-sm font-medium border-t border-b border-r border-gray-300 ${i === pagination.page
                                  ? "bg-pink-600 text-white border-pink-600"
                                  : "text-gray-500 hover:text-pink-600 hover:bg-gray-50"
                                }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Add last page and ellipsis if needed
                        if (endPage < pagination.pages) {
                          if (endPage < pagination.pages - 1) {
                            pages.push(
                              <span key="ellipsis2" className="px-3 py-2 text-sm text-gray-500 border-t border-b border-r border-gray-300">
                                ...
                              </span>
                            );
                          }
                          pages.push(
                            <button
                              key={pagination.pages}
                              onClick={() => handlePageChange(pagination.pages)}
                              className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-pink-600 border-t border-b border-r border-gray-300 hover:bg-gray-50"
                            >
                              {pagination.pages}
                            </button>
                          );
                        }

                        return pages;
                      })()}

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Results Info */}
                {pagination.total > 0 && (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-400 mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any products matching your criteria. Try adjusting your filters.
                </p>                <button
                  onClick={() => {
                    // Reset all filters to their initial state
                    setPriceRange([0, maxPrice]);
                    setSelectedWeights([]);
                    setSelectedTags([]);
                    setSortBy("popularity");
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

      {/* Mobile Filters Modal */}
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
            </div>            <div className="p-4 space-y-6">
              {/* Price Range - Mobile */}
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
                    max={maxPrice}
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
                          const value = parseInt(e.target.value) || maxPrice;
                          setPriceInputs(prev => ({ ...prev, max: value }));
                          setPriceRange([priceRange[0], value]);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Filter - Mobile */}
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
                          className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedWeights.includes(weight)
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

              {/* Tags Filter - Mobile */}
              {availableTags.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Tags
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex flex-wrap gap-2">
                      {availableTags.slice(0, 10).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            if (selectedTags.includes(tag)) {
                              setSelectedTags(selectedTags.filter(t => t !== tag));
                            } else {
                              setSelectedTags([...selectedTags, tag]);
                            }
                          }}
                          className={`px-3 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${selectedTags.includes(tag)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700'
                            }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>            <div className="p-4 border-t bg-gray-50 flex gap-3 sticky bottom-0">              <button
              onClick={() => {
                // Reset all filters to their initial state
                setPriceRange([0, maxPrice]);
                setSelectedWeights([]);
                setSelectedTags([]);
                setSortBy("popularity");
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
  );
};

export default CategoryPageClient;