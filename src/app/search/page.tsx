"use client"
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header, Footer, ProductGrid, Breadcrumb, Loading } from '@/components';

interface Product {
  _id: string;
  name: string;
  slug: string;
  imageUrls: string[];
  price: number;
  discountedPrice: number;
  finalPrice: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  isEggless: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  discountPercentage: number;
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

interface SearchResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    search: {
      query: string;
      resultsCount: number;
    };
  };
}

// Create a separate component for the search functionality
function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchUrl = new URL('/api/search', window.location.origin);
      searchUrl.searchParams.set('q', query);
      searchUrl.searchParams.set('page', currentPage.toString());
      searchUrl.searchParams.set('limit', '12');
      searchUrl.searchParams.set('sortBy', sortBy);
      searchUrl.searchParams.set('sortOrder', sortOrder);

      const response = await fetch(searchUrl.toString());
      const data: SearchResponse = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      } else {
        setError('Search failed. Please try again.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query, currentPage, sortBy, sortOrder]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: `Search Results for "${query}"`, href: '#' }
  ];

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Search Cakes</h1>
          <p className="text-gray-600">Enter a search term to find delicious cakes and pastries!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Search Results for "{query}"
            </h1>
            {!loading && (
              <p className="text-gray-600 mt-2">
                {pagination.total} {pagination.total === 1 ? 'product' : 'products'} found
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loading size="lg" text="Searching..." />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchSearchResults}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg mb-4">
              No products found for "{query}"
            </div>
            <p className="text-gray-500 mb-6">
              Try searching with different keywords or browse our categories.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.href = '/products'}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Browse All Products
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        ) : (
          <ProductGrid
            totalCount={pagination.total}
            products={products}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onSortChange={(newSortBy, newSortOrder) => {
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              setCurrentPage(1); // Reset to first page when sorting
            }}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Suspense fallback={<Loading size="lg" text="Loading search..." />}>
        <SearchPageContent />
      </Suspense>
      <Footer />
    </main>
  );
}
