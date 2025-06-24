"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import AdminNavbar from "@/components/AdminNavbar";
import {
  Package,
  Star,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  imageUrls: string[];
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    group: string;
    type: string;
  }>;
  weightOptions: Array<{
    weight: string;
    price: number;
    discountedPrice?: number;
  }>;
  isAvailable: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  preparationTime: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  bestsellerOrder?: number;
}

export default function BestsellerManagement() {
  const { user, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [bestsellerLoading, setBestsellerLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  // Fetch bestsellers
  const fetchBestsellers = async () => {
    setBestsellerLoading(true);
    try {
      const url = `/api/products?isBestseller=true&sortBy=bestsellerOrder&sortOrder=asc&limit=100&_=${Date.now()}`;

      const res = await fetch(url, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (data.success && data.data?.products) {
        setBestsellers(data.data.products);
      } else {
        setBestsellers([]);
      }

    } catch (error) {
      console.error("❌ Failed to fetch bestsellers:", error);
      showError("Error", "Failed to load bestsellers");
      setBestsellers([]);
    } finally {
      setBestsellerLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {

    // Load bestsellers once auth is resolved (regardless of user state for debugging)
    if (!loading) {
      fetchBestsellers();
    }
  }, [loading, user]);

  // Also load on component mount for immediate debugging
  useEffect(() => {
    fetchBestsellers();
  }, []);

  // Update bestseller order
  const updateBestsellerOrder = async (productId: string, direction: 'up' | 'down') => {
    console.log(`🔄 Updating order for product ${productId} - Direction: ${direction}`);
    setUpdateLoading(productId);
    try {
      // Sort current bestsellers by order
      const sortedBestsellers = [...bestsellers].sort((a, b) =>
        (a.bestsellerOrder || 0) - (b.bestsellerOrder || 0)
      );

      const currentIndex = sortedBestsellers.findIndex(p => p._id === productId);
      if (currentIndex === -1) {
        console.error('❌ Product not found in bestsellers list');
        return;
      }

      // Create new ordering array
      const newOrder = [...sortedBestsellers];

      if (direction === 'up' && currentIndex > 0) {
        // Swap with previous item
        [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      } else if (direction === 'down' && currentIndex < sortedBestsellers.length - 1) {
        // Swap with next item
        [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      } else {
        // Already at boundary
        showError("Info", `Product is already at the ${direction === 'up' ? 'top' : 'bottom'}`);
        return;
      }

      // Update all products with new sequential orders
      for (let i = 0; i < newOrder.length; i++) {
        const product = newOrder[i];
        const orderValue = i + 1; // Start from 1

        const formData = new FormData();
        formData.append('bestsellerOrder', orderValue.toString());

        const response = await fetch(`/api/products/${product._id}`, {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update order');
        }
      }

      showSuccess("Success", `Product moved ${direction}!`);
      await fetchBestsellers();
    } catch (error) {
      console.error("❌ Failed to update bestseller order:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError("Error", `Failed to update bestseller order: ${errorMessage}`);
    } finally {
      setUpdateLoading(null);
    }
  };
  // Set specific order
  const setSpecificOrder = async (productId: string, newOrder: number) => {
    console.log(`🔄 Setting specific order for product ${productId} - Order: ${newOrder}`);
    setUpdateLoading(productId);
    try {
      const formData = new FormData();
      formData.append('bestsellerOrder', newOrder.toString());

      const url = `/api/products/${productId}`;
      console.log('📡 PUT URL:', url);

      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (data.success || response.ok) {
        showSuccess("Success", "Order updated successfully!");
        await fetchBestsellers();
      } else {
        console.error('❌ Update failed:', data);
        throw new Error(data.message || data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error("❌ Failed to update bestseller order:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError("Error", `Failed to update bestseller order: ${errorMessage}`);
    } finally {
      setUpdateLoading(null);
    }
  };
  // Normalize all bestseller orders to ensure sequential numbering
  const normalizeBestsellerOrders = async () => {
    try {
      // Sort current bestsellers by order
      const sortedBestsellers = [...bestsellers].sort((a, b) =>
        (a.bestsellerOrder || 0) - (b.bestsellerOrder || 0)
      );

      // Update each product with sequential order numbers
      for (let i = 0; i < sortedBestsellers.length; i++) {
        const product = sortedBestsellers[i];
        const newOrder = i + 1; // Start from 1

        if (product.bestsellerOrder !== newOrder) {
          const formData = new FormData();
          formData.append('bestsellerOrder', newOrder.toString());

          const response = await fetch(`/api/products/${product._id}`, {
            method: 'PUT',
            body: formData,
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to normalize order');
          }
        }
      }

      await fetchBestsellers();
      showSuccess("Success", "Bestseller orders have been normalized!");
    } catch (error) {
      console.error("❌ Failed to normalize orders:", error);
      showError("Error", "Failed to normalize bestseller orders");
    }
  };

  // Alternative reordering method with better logic
  const updateBestsellerOrderV2 = async (productId: string, direction: 'up' | 'down') => {
    console.log(`🔄 Updating order V2 for product ${productId} - Direction: ${direction}`);
    setUpdateLoading(productId);
    try {
      // Sort current bestsellers by order
      const sortedBestsellers = [...bestsellers].sort((a, b) =>
        (a.bestsellerOrder || 0) - (b.bestsellerOrder || 0)
      );

      const currentIndex = sortedBestsellers.findIndex(p => p._id === productId);
      if (currentIndex === -1) {
        console.error('❌ Product not found in bestsellers list');
        return;
      }

      // Create new ordering array
      const newOrder = [...sortedBestsellers];

      if (direction === 'up' && currentIndex > 0) {
        // Swap with previous item
        [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      } else if (direction === 'down' && currentIndex < sortedBestsellers.length - 1) {
        // Swap with next item
        [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      } else {
        // Already at boundary
        showError("Info", `Product is already at the ${direction === 'up' ? 'top' : 'bottom'}`);
        setUpdateLoading(null);
        return;
      }

      // Update all products with new sequential orders
      for (let i = 0; i < newOrder.length; i++) {
        const product = newOrder[i];
        const orderValue = i + 1; // Start from 1

        const formData = new FormData();
        formData.append('bestsellerOrder', orderValue.toString());

        const response = await fetch(`/api/products/${product._id}`, {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update order');
        }
      }

      showSuccess("Success", `Product moved ${direction}!`);
      console.log('✅ Order updated successfully, refreshing list...');
      await fetchBestsellers();
    } catch (error) {
      console.error("❌ Failed to update bestseller order:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError("Error", `Failed to update bestseller order: ${errorMessage}`);
    } finally {
      setUpdateLoading(null);
    }
  };

  if (loading) {
    console.log('🔄 Auth still loading...');
    return <div className="min-h-screen bg-gray-50"><AdminNavbar /><div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div></div>;
  }

  if (!user) {
    console.log('❌ No user found, should redirect...');
    // You might want to redirect to login here
  }

  // Sort bestsellers for display
  const sortedBestsellers = [...bestsellers].sort((a, b) =>
    (a.bestsellerOrder || 0) - (b.bestsellerOrder || 0)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                Bestseller Management
              </h1>
              <p className="text-gray-600">
                Manage the order of bestseller products as they appear on your website. Lower numbers appear first.
              </p>
            </div>            <div className="flex items-center gap-4">
              <div className="flex items-center bg-orange-50 px-4 py-2 rounded-lg">
                <Star className="w-5 h-5 text-orange-500 mr-2" />
                <span className="text-orange-700 font-medium">
                  {bestsellers.length} Bestsellers
                </span>
              </div>
              <button
                onClick={normalizeBestsellerOrders}
                disabled={bestsellerLoading || updateLoading !== null}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Package className="w-4 h-4" />
                Normalize Orders
              </button>
              <button
                onClick={fetchBestsellers}
                disabled={bestsellerLoading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${bestsellerLoading ? 'animate-spin' : ''}`} />
                {bestsellerLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {bestsellerLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mr-3" />
              <span className="text-gray-600">Loading bestsellers...</span>
            </div>
          </div>
        ) : sortedBestsellers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bestsellers Found</h3>
              <p className="text-gray-600 mb-4">
                No products are currently marked as bestsellers. Mark products as bestsellers first.
              </p>
              <button
                onClick={() => router.push('/admin/products')}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Go to Products
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Products List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Bestseller Products Order</h3>
                <p className="text-gray-600">Products are displayed in the order shown below (top to bottom)</p>
              </div>

              <div className="divide-y divide-gray-200">
                {sortedBestsellers.map((product, index) => (
                  <div key={product._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      {/* Order Number */}
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
                        {index + 1}
                      </div>

                      {/* Product Image */}
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden mr-4 flex-shrink-0">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <Image
                            src={product.imageUrls[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate mb-1 text-lg">{product.name}</h4>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="font-medium">
                            ₹{product.discountedPrice || product.price}
                            {product.discountedPrice && (
                              <span className="ml-2 line-through text-gray-400">₹{product.price}</span>
                            )}
                          </span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span>{product.rating} ({product.reviewCount} reviews)</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            Order: {product.bestsellerOrder || 0}
                          </span>
                        </div>
                      </div>                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => updateBestsellerOrderV2(product._id, 'up')}
                          disabled={updateLoading !== null || index === 0}
                          className="p-3 text-gray-400 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 rounded-lg hover:border-green-300"
                          title="Move Up"                        >
                          {updateLoading !== null ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <ArrowUp className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => updateBestsellerOrderV2(product._id, 'down')}
                          disabled={updateLoading !== null || index === sortedBestsellers.length - 1}
                          className="p-3 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 rounded-lg hover:border-red-300"
                          title="Move Down"
                        >
                          {updateLoading !== null ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <ArrowDown className="w-5 h-5" />
                          )}
                        </button>
                        <a
                          href={`/products/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 text-gray-400 hover:text-blue-600 transition-colors border border-gray-200 rounded-lg hover:border-blue-300"
                          title="View Product"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                How to Reorder Bestsellers
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                <ul className="space-y-2">
                  <li>• <strong>Move Up (↑):</strong> Swaps position with the product above</li>
                  <li>• <strong>Move Down (↓):</strong> Swaps position with the product below</li>
                  <li>• <strong>Normalize Orders:</strong> Resets all orders to sequential numbers (1, 2, 3...)</li>
                </ul>
                <ul className="space-y-2">
                  <li>• <strong>Products are displayed</strong> in the order shown (top to bottom)</li>
                  <li>• <strong>Changes are automatically saved</strong> when you click the buttons</li>
                  <li>• <strong>Use normalize</strong> if orders become inconsistent</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
