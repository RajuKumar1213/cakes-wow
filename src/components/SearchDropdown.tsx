import React from 'react';
import { Search, Loader2, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SearchProduct {
  _id: string;
  name: string;
  shortDescription: string;
  imageUrl: string;
  price: number;
  discountPrice?: number;
  slug: string;
  category: string;
  categorySlug: string;
  weightOptions: Array<{
    weight: string;
    price: number;
    discountedPrice?: number;
  }>;
  rating: number;
  reviewCount: number;
  firstWeightOption?: {
    weight: string;
    price: number;
    discountedPrice?: number;
  };
}

interface SearchDropdownProps {
  products: SearchProduct[];
  query: string;
  isLoading: boolean;
  selectedIndex: number;
  onProductClick: (slug: string) => void;
  onViewAllResults: () => void;
  onPopularSearchClick?: (term: string) => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  products,
  query,
  isLoading,
  selectedIndex,
  onProductClick,
  onViewAllResults,
  onPopularSearchClick
}) => {
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleProductClick = (slug: string) => {
    onProductClick(slug);
    router.push(`/products/${slug}`);
  };

  const handleViewAllResults = () => {
    onViewAllResults();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };
  


  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-[500px] overflow-y-auto">
      
      {/* Show popular searches when query is empty */}
      {!isLoading && query.length === 0 && (
        <div className="p-4">
          <div className="text-center mb-4">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-700 mb-2">Search for cakes</h3>
            <p className="text-xs text-gray-500">Type to find your perfect cake</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Popular searches:</h4>            <div className="flex flex-wrap gap-2">
              {['Chocolate Cake', 'Birthday Cake', 'Red Velvet', 'Vanilla Cake', 'Cheesecake'].map((term) => (
                <span
                  key={term}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  onClick={() => {
                    if (onPopularSearchClick) {
                      onPopularSearchClick(term);
                    }
                  }}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Show hint when typing first character */}
      {!isLoading && query.length === 1 && (
        <div className="text-center p-6">
          <Search className="w-6 h-6 text-gray-300 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-gray-500">
            Keep typing to see suggestions...
          </p>
        </div>
      )}
      {/* Header */}
      {products.length > 0 && !isLoading && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Search results for "{query}"
            </span>
            <span className="text-xs text-gray-500">
              {products.length} found
            </span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            <span className="text-sm text-gray-600">Searching...</span>
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && products.length === 0 && query.length >= 2 && (
        <div className="text-center p-8">
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            No results found for "{query}"
          </p>
          <p className="text-xs text-gray-400">
            Try different keywords
          </p>
        </div>
      )}      {/* Products Grid */}
      {!isLoading && products.length > 0 && (
        <>
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product.slug)}
                  className={`bg-white rounded-md border cursor-pointer transition-all duration-200 overflow-hidden ${
                    selectedIndex === index
                      ? 'border-blue-300 ring-1 ring-blue-100 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >                   
                 {/* Product Image */}
                  <div className="relative w-full aspect-square bg-gray-100">
                    <Image
                      src={product.imageUrl }
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="100px"
                     
                    />
                  </div>                  {/* Product Details */}
                  <div className="p-2">
                    <h3 className="font-medium text-xs text-gray-900 line-clamp-1 mb-1">
                      {product.name}
                    </h3>
                    
                    {/* Weight option if available */}
                    {product.firstWeightOption && (
                      <p className="text-xs text-gray-600 mb-1">
                        {product.firstWeightOption.weight}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(product.discountPrice || product.price)}
                      </span>
                      {product.discountPrice && (
                        <span className="text-xs line-through text-gray-400">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-2.5 h-2.5 ${
                                star <= Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
                        </span>
                        {product.reviewCount > 0 && (
                          <span className="text-xs text-gray-500">
                            ({product.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>          
          {/* View All Results Button */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleViewAllResults}
              className="w-full flex items-center justify-center space-x-2 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 text-xs font-medium"
            >
              <span>View All Results</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchDropdown;
