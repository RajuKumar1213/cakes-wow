import { useState } from "react";
import ProductCard from "./ProductCard";
import FilterSidebar from "./FilterSidebar";
import { ChevronDown, Filter, Grid, List } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  imageUrls: string[];
  price: number;
  discountedPrice?: number;  rating: number;
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

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  category?: string;
}

const ProductGrid = ({
  products,
  loading = false,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSortChange,
  onFilterChange,
  category,
}: ProductGridProps) => {
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const sortOptions = [
    { value: "createdAt:desc", label: "Newest First" },
    { value: "createdAt:asc", label: "Oldest First" },
    { value: "price:asc", label: "Price: Low to High" },
    { value: "price:desc", label: "Price: High to Low" },
    { value: "rating:desc", label: "Highest Rated" },
    { value: "name:asc", label: "Name: A to Z" },
    { value: "weight:asc", label: "Weight: Low to High" },
    { value: "weight:desc", label: "Weight: High to Low" },
  ];
  // Handle sort change
  const handleSortChange = (sortValue: string) => {
    const [newSortBy, newSortOrder] = sortValue.split(":");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    onSortChange?.(newSortBy, newSortOrder);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => onPageChange?.(currentPage - 1)}
          className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-500 hover:text-pink-600 border border-gray-300 rounded-l-md hover:bg-gray-50 whitespace-nowrap"
        >
          Prev
        </button>
      );
    } // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange?.(i)}
          className={`px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm border-t border-b border-r border-gray-300 ${
            i === currentPage
              ? "bg-pink-600 text-white border-pink-600"
              : "text-gray-500 hover:text-pink-600 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => onPageChange?.(currentPage + 1)}
          className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-500 hover:text-pink-600 border border-gray-300 rounded-r-md hover:bg-gray-50 whitespace-nowrap"
        >
          Next
        </button>
      );
    }
    return (
      <div className="flex justify-center items-center mt-6 sm:mt-8">
        <div className="flex space-x-1 overflow-x-auto max-w-full">{pages}</div>
      </div>
    );
  };
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="h-32 sm:h-44 bg-gray-300"></div>
            <div className="p-2 sm:p-3">
              <div className="h-3 sm:h-4 bg-gray-300 rounded mb-1 sm:mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-300 rounded w-2/3 mb-1 sm:mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }  return (
    <div className="flex">
      {/* Filter Sidebar */}
      <FilterSidebar
        onFilterChange={onFilterChange || (() => {})}
        category={category}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
      
      {/* Main Content */}
      <div className="flex-1">
        <div>
          {/* Header with sorting and view options */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Filter Toggle Button for Mobile */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>

                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  {totalCount} Products
                </h2>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={`${sortBy}:${sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-2 py-1 sm:px-4 sm:py-2 pr-6 sm:pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-3 sm:gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {products.map((product) => (
                <ProductCard key={product._id} {...product} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
