"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Image as ImageIcon,

  Loader2,
  Grid3X3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { ProductForm } from "@/components";

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
  }>;  weightOptions: Array<{
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
  globalDisplayOrder?: number;
  categoryOrders?: Array<{
    category: string;
    displayOrder: number;
  }>;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  group: string;
  type: string;
  description: string;
}

interface ProductsManagementProps {
  onLoadingChange?: (loading: boolean) => void;
}

export default function ProductsManagement({ onLoadingChange }: ProductsManagementProps) {
  const { showSuccess, showError } = useToast();

  console.log('🔄 ProductsManagement component mounting/re-rendering');

  // State management
  const [activeProductTab, setActiveProductTab] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created' | 'group' | 'displayOrder'>('displayOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [productsLoading, setProductsLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Ordering states
  const [orderingMode, setOrderingMode] = useState(false);
  const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);
  const [orderingCategory, setOrderingCategory] = useState<string>('all');
  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Set default category when categories load
  useEffect(() => {
    if (allCategories.length > 0 && !activeProductTab) {
      const firstCategory = allCategories[0];
      setActiveProductTab(firstCategory.slug);
      console.log('Setting default category:', firstCategory.name);
    }
  }, [allCategories, activeProductTab]);
  // Load products when category changes
  useEffect(() => {
    if (activeProductTab && (allCategories.length > 0 || activeProductTab === 'all' || activeProductTab === 'bestseller')) {
      console.log('Loading products for tab:', activeProductTab);
      fetchProducts(1);
      setCurrentPage(1);
      setSelectedCategory(activeProductTab);
      setOrderingCategory(activeProductTab);
    }
  }, [activeProductTab, allCategories.length]);

  // Update loading state
  useEffect(() => {
    onLoadingChange?.(productsLoading);
  }, [productsLoading, onLoadingChange]);
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?format=all');
      const data = await response.json();
      if (data.success || data.data) {
        const categories = data.data || [];
        setAllCategories(categories);
        console.log('📁 Categories loaded:', categories.length);
      } else {
        console.error('Failed to fetch categories - API response:', data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      showError("Error", "Failed to load categories");
    }
  };
  // Fetch products
  const fetchProducts = async (page = 1) => {
    if (!activeProductTab) return;
    
    setProductsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '30',
        sortBy,
        sortOrder,
      });      if (activeProductTab !== 'all' && activeProductTab !== 'bestseller') {
        params.append('category', activeProductTab);
      }

      if (activeProductTab === 'bestseller') {
        params.append('isBestseller', 'true');
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      
      if (data.success || data.data) {
        // Handle the API response structure correctly
        const products = data.data?.products || data.data || [];
        const pagination = data.data?.pagination || {};
        
        setProducts(products);
        setFilteredProducts(products);
        
        // Update pagination state
        if (pagination.page !== undefined) {
          setCurrentPage(pagination.page);
          setTotalPages(pagination.pages || 1);
          setTotalProducts(pagination.total || products.length);
        } else {
          // Fallback for simple array response
          setCurrentPage(page);
          setTotalPages(1);
          setTotalProducts(products.length);
        }
        
        console.log('📦 Products loaded:', products.length);
        console.log('📄 Pagination:', pagination);
      } else {
        console.error('API response structure:', data);
        showError("Error", "Invalid API response structure");
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showError("Error", "Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };
  // Handle search and filters
  useEffect(() => {
    if (activeProductTab && allCategories.length > 0) {
      console.log('Filters changed, refetching products...');
      fetchProducts(1);
      setCurrentPage(1);
    }
  }, [searchTerm, sortBy, sortOrder, activeProductTab, allCategories.length]);

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess("Success", "Product deleted successfully!");
        fetchProducts(currentPage);
      } else {
        showError("Error", data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      showError("Error", "Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle sort
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  // Ordering functions
  const handleReorderProducts = async (newOrder: { productId: string; displayOrder: number }[]) => {
    try {
      // Find the current category
      const currentCategory = allCategories.find(c => c.slug === activeProductTab);
      
      if (!currentCategory) {
        showError("Error", "Category not found for reordering");
        return;
      }

      console.log('🔄 Reordering products for category:', currentCategory.name, 'ID:', currentCategory._id);
      console.log('📦 New order:', newOrder);
      
      const response = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: currentCategory._id,
          productOrders: newOrder
        }),
      });

      const data = await response.json();
        if (data.success) {
        showSuccess("Success", "Products reordered successfully!");
        // Force refresh with display order sorting
        setSortBy('displayOrder');
        setSortOrder('asc');
        
        // Wait a bit for the database to update before refetching
        setTimeout(async () => {
          await fetchProducts(currentPage);
          console.log('✅ Products reorder completed and refreshed');
        }, 500);
      } else {
        console.error('❌ Reorder failed:', data);
        showError("Error", data.error || "Failed to reorder products");
      }
    } catch (error) {
      console.error("❌ Failed to reorder products:", error);
      showError("Error", "Failed to reorder products");
    }  };

  // Handle individual product reorder using dropdown
  const handleProductReorder = async (productId: string, newDisplayOrder: number) => {
    // Create order array where the selected product gets the new order
    // and other products shift accordingly
    const updatedProducts = [...products];
    const productIndex = updatedProducts.findIndex(p => p._id === productId);
    
    if (productIndex === -1) return;
    
    // Remove the product from its current position
    const [movedProduct] = updatedProducts.splice(productIndex, 1);
    
    // Insert it at the new position (subtract 1 because display order is 1-based)
    updatedProducts.splice(newDisplayOrder - 1, 0, movedProduct);
    
    // Create new order array
    const newOrder = updatedProducts.map((product, index) => ({
      productId: product._id,
      displayOrder: index + 1
    }));

    // Update local state immediately for better UX
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);

    // Save to backend
    await handleReorderProducts(newOrder);
  };

  // Commented out drag and drop functions for now
  /*
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, product: Product) => {
    setDraggedProduct(product);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetProduct: Product) => {
    e.preventDefault();
    
    if (!draggedProduct || draggedProduct._id === targetProduct._id) {
      setDraggedProduct(null);
      return;
    }

    console.log('🎯 Dropping product:', draggedProduct.name, 'onto:', targetProduct.name);

    const draggedIndex = products.findIndex(p => p._id === draggedProduct._id);
    const targetIndex = products.findIndex(p => p._id === targetProduct._id);
    
    const newProducts = [...products];
    newProducts.splice(draggedIndex, 1);
    newProducts.splice(targetIndex, 0, draggedProduct);
    
    // Update local state immediately for better UX
    setProducts(newProducts);
    setFilteredProducts(newProducts);

    // Create new order array with 1-based indexing
    const newOrder = newProducts.map((product, index) => ({
      productId: product._id,
      displayOrder: index + 1
    }));

    console.log('📋 New order to save:', newOrder);

    handleReorderProducts(newOrder);
    setDraggedProduct(null);
  };
  */  const toggleOrderingMode = () => {
    // Prevent ordering mode for global tabs like 'all' and 'bestseller'
    if (activeProductTab === 'all' || activeProductTab === 'bestseller') {
      showError("Error", "Product ordering is only available for individual categories");
      return;
    }
    
    const newOrderingMode = !orderingMode;
    setOrderingMode(newOrderingMode);
    
    if (newOrderingMode) {
      console.log('🔄 Entering ordering mode for category:', activeProductTab);
      // When entering ordering mode, ensure we're sorting by displayOrder
      setSortBy('displayOrder');
      setSortOrder('asc');
      setOrderingCategory(activeProductTab);
      // Refetch products with proper sorting
      fetchProducts(currentPage);
    } else {
      console.log('❌ Exiting ordering mode');
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page);
  };

  // Helper function to get current tab display name
  const getCurrentTabName = () => {
    if (activeProductTab === 'all') return 'All Products';
    if (activeProductTab === 'bestseller') return 'Bestseller Products';
    const category = allCategories.find(c => c.slug === activeProductTab);
    return category?.name || 'this category';
  };

  const renderTableView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">      {orderingMode && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center gap-2 text-blue-700">
            <ArrowUpDown className="w-4 h-4" />
            <span className="text-sm font-medium">
              Ordering Mode: Use the dropdown in the Order column to reorder products in {getCurrentTabName()}
            </span>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {orderingMode && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
              )}
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Product
                  {sortBy === 'name' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center gap-1">
                  Price
                  {sortBy === 'price' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">            {products.map((product, index) => (
              <tr 
                key={product._id}
                className="hover:bg-gray-50 transition-colors"
              >                {orderingMode && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={index + 1}
                      onChange={(e) => handleProductReorder(product._id, parseInt(e.target.value))}
                      className="block w-full min-w-[100px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                    >
                      {Array.from({ length: products.length }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Image
                        className="h-10 w-10 rounded-lg object-cover"
                        src={product.imageUrls[0] || '/images/placeholder.jpg'}
                        alt={product.name}
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ₹{product.discountedPrice || product.price}
                    {product.discountedPrice && (
                      <span className="ml-2 text-xs text-gray-500 line-through">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {product.categories.slice(0, 2).map((category) => (
                      <span
                        key={category._id}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                    {product.categories.length > 2 && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        +{product.categories.length - 2} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {product.isBestseller && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Bestseller
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Featured
                      </span>
                    )}
                  </div>
                </td>                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {product.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-500">
                      ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductForm(true);
                      }}
                      className="text-orange-600 hover:text-orange-900 transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      disabled={deleteLoading}
                      className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * 30) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 30, totalProducts)}</span> of{' '}
                <span className="font-medium">{totalProducts}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="h-5 w-5 rotate-[-90deg]" />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span
                        key={page}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="h-5 w-5 rotate-[-90deg]" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  if (!allCategories.length && !productsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Categories...</h3>
          <p className="text-gray-600 mb-4">Please wait while we load the product categories.</p>
          <button
            onClick={() => fetchCategories()}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Retry Loading Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Category Sub-tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Categories</h3>          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveProductTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeProductTab === 'all'
                  ? "bg-orange-100 text-orange-600 border border-orange-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Products  { activeProductTab === 'all' && `(${totalProducts})`  }
            </button>
            <button
              onClick={() => setActiveProductTab('bestseller')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeProductTab === 'bestseller'
                  ? "bg-orange-100 text-orange-600 border border-orange-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              🏆 Bestseller
              {activeProductTab === 'bestseller' && products.length > 0 && (
                <span className="ml-2 text-xs">({products.length})</span>
              )}
            </button>
            {allCategories.map((category) => (
              <button
                key={category._id}
                onClick={() => setActiveProductTab(category.slug)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeProductTab === category.slug
                    ? "bg-orange-100 text-orange-600 border border-orange-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category.name}
                {activeProductTab === category.slug && products.length > 0 && (
                  <span className="ml-2 text-xs">({products.length})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${viewMode === 'table'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${viewMode === 'grid'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Grid
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowProductForm(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>            {/* Only show reorder button for specific categories, not for 'all' or 'bestseller' */}
            {activeProductTab && activeProductTab !== 'all' && activeProductTab !== 'bestseller' && (
              <button
                onClick={toggleOrderingMode}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  orderingMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${!activeProductTab ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!activeProductTab}
              >                <ArrowUpDown className="w-4 h-4" />
                {orderingMode ? 'Exit Ordering' : 
                  `Reorder ${getCurrentTabName()} Products`
                }
              </button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
          <div>
            Showing {products.length} products in {getCurrentTabName()} (Page {currentPage} of {totalPages})
            {searchTerm && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Search: "{searchTerm}"
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <span className="font-medium capitalize">{sortBy}</span>
            <span className="text-xs">({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})</span>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {productsLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `No products found matching "${searchTerm}" in ${allCategories.find(c => c.slug === activeProductTab)?.name || 'this category'}.`
                : `No products found in ${allCategories.find(c => c.slug === activeProductTab)?.name || 'this category'}.`
              }
            </p>
            <button
              onClick={() => setShowProductForm(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Product
            </button>
          </div>
        </div>
      ) : (
        renderTableView()
      )}      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          categories={allCategories}
          product={editingProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(undefined);
          }}
          onSuccess={() => {
            setShowProductForm(false);
            setEditingProduct(undefined);
            fetchProducts(currentPage);
          }}
        />
      )}
    </>
  );
}
