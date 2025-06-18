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
}

interface SearchDropdownProps {
  products: SearchProduct[];
  query: string;
  isLoading: boolean;
  selectedIndex: number;
  onProductClick: (slug: string) => void;
  onViewAllResults: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  products,
  query,
  isLoading,
  selectedIndex,
  onProductClick,
  onViewAllResults
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
      )}

      {/* Products Grid */}
      {!isLoading && products.length > 0 && (
        <>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product.slug)}
                  className={`bg-white rounded-lg border cursor-pointer transition-all duration-200 overflow-hidden ${
                    selectedIndex === index
                      ? 'border-blue-300 ring-2 ring-blue-100 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative w-full aspect-square bg-gray-100">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                    
                    {/* EGGLESS Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-300 rounded-full mr-1"></div>
                        EGGLESS
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-base font-bold text-gray-900">
                        {formatPrice(product.discountPrice || product.price)}
                      </span>
                      {product.discountPrice && (
                        <span className="text-sm line-through text-gray-400">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">4.9</span>
                      <span className="text-xs text-gray-400">
                        ({Math.floor(Math.random() * 400) + 100})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View All Results Button */}
          <div className="border-t border-gray-200 p-3">
            <button
              onClick={handleViewAllResults}
              className="w-full flex items-center justify-center space-x-2 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 text-sm font-medium"
            >
              <span>More Results ({products.length > 6 ? '16' : products.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchDropdown;
