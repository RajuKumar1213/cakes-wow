"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

import axios, { all } from "axios";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Package,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Tag,
  Folder as CategoryIcon,
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
import { CategoryForm, ProductForm } from "@/components";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
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
  tags: string[];  weightOptions: Array<{
    weight: string;
    price: number;
    discountedPrice?: number;
  }>;
  isAvailable: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  stockQuantity: number;
  preparationTime: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  group: string;
  type: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  sortOrder?: number;
}


export default function AdminProducts() {
  const { user, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"products" | "categories">(
    "products"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();  const [loadingData, setLoadingData] = useState(true);  const [deleteLoading, setDeleteLoading] = useState(false); 
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'created' | 'group'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loadData, setLoadData] = useState(false);

  useEffect(() => {
    if (!loading) {
      fetchData();
    }
  }, [loading, editingCategory, loadData]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [productsRes, categoriesRes, allCategoriesRes] = await Promise.all([
        axios.get("/api/products?limit=1000"),
        axios.get("/api/categories"),
        axios.get("/api/categories?format=all"),
      ]);

      setAllCategories(allCategoriesRes.data.data || []);
      setProducts(productsRes.data.data.products || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showError("Error", "Failed to load data");
    } finally {
      setLoadingData(false);
    }
  };
  // Filter products
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) =>
        product.categories.some((cat) => cat.slug === selectedCategory)
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'stock':
          aValue = a.stockQuantity;
          bValue = b.stockQuantity;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder]);
  const handleSort = (field: 'name' | 'price' | 'stock' | 'created' | 'group') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };


  const handleSaveProduct = async () => {
    // This function is called by ProductForm's onSuccess callback
    setShowProductForm(false);
    setEditingProduct(undefined);
    await fetchData(); // Refresh the data
  };

  // const handleSaveCategory = async (categoryData: any) => {
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      setDeleteLoading(true);
     const response = await axios.delete(`/api/products/${id}`);
      console.log(response.data);
      if (response.data.success) {
        
        showSuccess("Success", "Product deleted successfully!");
      } 
    } catch (error) {
      console.error("Failed to delete product:", error);
      showError("Error", "Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  };  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`/api/categories?id=${id}`);
      showSuccess("Success", "Category deleted successfully!");
      // Refresh categories after deletion
      fetchData();
    } catch (error) {
      console.error("Failed to delete category:", error);
      showError("Error", "Failed to delete category");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // if (!user || user.role !== "admin") {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {" "}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push("/admin")}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Products & Categories
            </h1>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <CategoryIcon className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Categories
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allCategories.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <Tag className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter((p) => p.isFeatured).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <ImageIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter((p) => p.stockQuantity < 10).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "products"
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === "categories"
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CategoryIcon className="w-4 h-4 inline mr-2" />
              Categories ({allCategories?.length})
            </button>
          </div>
        </div>
        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
                    />
                  </div>                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {allCategories.map((category) => (
                      <option key={category._id} value={category.slug}>
                        {category.name} ({category.group})
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                        viewMode === 'table' 
                          ? 'bg-white text-orange-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white text-orange-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      Grid
                    </button>
                  </div>
                </div>                <button
                  onClick={() => setShowProductForm(true)}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
                <div>
                  Showing {filteredProducts.length} of {products.length} products
                  {selectedCategory !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      Filtered by category
                    </span>
                  )}
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
            </div>            {/* Products Display */}
            {viewMode === 'table' ? (
              /* Products Table */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">                    <thead className="bg-gray-50">
                      <tr>
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
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('stock')}
                        >
                          <div className="flex items-center gap-1">
                            Stock
                            {sortBy === 'stock' ? (
                              sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-50" />
                            )}
                          </div>
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
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('created')}
                        >
                          <div className="flex items-center gap-1">
                            Created
                            {sortBy === 'created' ? (
                              sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-50" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-16 w-16">
                                {product.imageUrls && product.imageUrls.length > 0 ? (
                                  <Image
                                    src={product.imageUrls[0]}
                                    alt={product.name}
                                    width={64}
                                    height={64}
                                    className="h-16 w-16 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 max-w-xs">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500 max-w-xs line-clamp-2">
                                  {product.shortDescription}
                                </div>                                <div className="flex items-center gap-2 mt-1">
                                  {product.isFeatured && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Featured
                                    </span>
                                  )}
                                  {product.isBestseller && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                      Bestseller
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₹{product.price}
                            </div>
                            {product.discountedPrice && (
                              <div className="text-sm text-gray-500 line-through">
                                ₹{product.discountedPrice}
                              </div>
                            )}
                            {product.weightOptions && product.weightOptions.length > 0 && (
                              <div className="text-xs text-blue-600">
                                {product.weightOptions.length} variants
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              product.stockQuantity < 10 
                                ? 'text-red-600' 
                                : product.stockQuantity < 50 
                                  ? 'text-yellow-600' 
                                  : 'text-green-600'
                            }`}>
                              {product.stockQuantity}
                            </div>
                            <div className="text-xs text-gray-500">
                              {product.isAvailable ? 'Available' : 'Out of Stock'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {product.categories.slice(0, 3).map((category) => (
                                <span
                                  key={category._id}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {category.name}
                                </span>
                              ))}
                              {product.categories.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{product.categories.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isAvailable ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {product.rating?.toFixed(1) || '0.0'}
                              </div>
                              <div className="text-sm text-gray-500 ml-2">
                                ({product.reviewCount || 0})
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(product.createdAt).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowProductForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                                title="Delete Product"
                                disabled={deleteLoading}
                              >
                                {deleteLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Products Grid */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      {product.imageUrls && product.imageUrls.length > 0 ? (
                        <Image
                          src={product.imageUrls[0]}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex gap-2">
                        {product.isFeatured && (
                          <span className="bg-yellow-100/70 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                        {product.isBestseller && (
                          <span className="bg-green-100/70 text-green-800 text-xs px-2 py-1 rounded-full">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h2>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.shortDescription}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{product.price}
                          </span>
                          {product.discountedPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.discountedPrice}
                            </span>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${
                          product.stockQuantity < 10 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          Stock: {product.stockQuantity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        {product.categories.slice(0, 2).map((category) => (
                          <span
                            key={category._id}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                        {product.categories.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{product.categories.length - 2} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            product.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isAvailable ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by adding your first product"}
                </p>
              </div>
            )}
          </>
        )}        {/* Categories Tab */}
        {activeTab === "categories" && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
                    />
                  </div>

                  {/* Group Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Groups</option>
                    {Array.from(new Set(allCategories.map(cat => cat.group))).map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                        viewMode === 'table' 
                          ? 'bg-white text-orange-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white text-orange-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      Grid
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
                <div>
                  Showing {allCategories.filter(cat => 
                    (searchTerm === '' || cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     cat.group.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (selectedCategory === 'all' || cat.group === selectedCategory)
                  ).length} of {allCategories.length} categories
                  {selectedCategory !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      Filtered by group
                    </span>
                  )}
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

            {/* Categories Display */}
            {viewMode === 'table' ? (
              /* Categories Table */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-1">
                            Name
                            {sortBy === 'name' && (
                              sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('group')}
                        >
                          <div className="flex items-center gap-1">
                            Group
                            {sortBy === 'group' && (
                              sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('created')}
                        >
                          <div className="flex items-center gap-1">
                            Created
                            {sortBy === 'created' && (
                              sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allCategories
                        .filter(cat => 
                          (searchTerm === '' || cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cat.group.toLowerCase().includes(searchTerm.toLowerCase())) &&
                          (selectedCategory === 'all' || cat.group === selectedCategory)
                        )
                        .sort((a, b) => {
                          let aValue, bValue;
                          switch (sortBy) {
                            case 'name':
                              aValue = a.name.toLowerCase();
                              bValue = b.name.toLowerCase();
                              break;
                            case 'group':
                              aValue = a.group.toLowerCase();
                              bValue = b.group.toLowerCase();
                              break;
                            case 'created':
                              aValue = new Date(a.createdAt).getTime();
                              bValue = new Date(b.createdAt).getTime();
                              break;
                            default:
                              aValue = a.sortOrder || 0;
                              bValue = b.sortOrder || 0;
                          }
                          if (sortOrder === 'asc') {
                            return aValue > bValue ? 1 : -1;
                          } else {
                            return aValue < bValue ? 1 : -1;
                          }
                        })
                        .map((category) => (
                        <tr key={category._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {category.imageUrl ? (
                                <Image
                                  src={category.imageUrl}
                                  alt={category.name}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <CategoryIcon className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Slug: {category.slug}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {category.group}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {category.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {category.description || 'No description'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              category.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(category.createdAt).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingCategory(category);
                                  setShowCategoryForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
                                title="Edit category"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category._id)}
                                className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                                title="Delete category"
                              >
                                {deleteLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Categories Grid */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allCategories
                  .filter(cat => 
                    (searchTerm === '' || cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     cat.group.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (selectedCategory === 'all' || cat.group === selectedCategory)
                  )
                  .map((category) => (
                  <div
                    key={category._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          width={150}
                          height={150}
                          className="w-full h-44 object-cover"
                        />
                      ) : (
                        <div className="w-full h-44 bg-gray-200 flex items-center justify-center">
                          <CategoryIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      <div className="absolute top-2 right-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          {category.group}
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {category.type}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setShowCategoryForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                           {deleteLoading ? (
                             <Loader2 className="w-4 h-4 animate-spin" />
                           ) : (
                             <Trash2 className="w-4 h-4" />
                           )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {allCategories.length === 0 && (
              <div className="text-center py-12">
                <CategoryIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No categories found
                </h3>
                <p className="text-gray-600">
                  Get started by adding your first category
                </p>
              </div>
            )}
          </>
        )}
        {/* Forms */}{" "}
        {showProductForm && (
          <ProductForm
            product={editingProduct}
            categories={allCategories}
            onSuccess={handleSaveProduct}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProduct(undefined);
            }}
          />
        )}
        {showCategoryForm && (
          <CategoryForm
            category={editingCategory}
            onCancel={() => {
              setShowCategoryForm(false);
              setEditingCategory(undefined);
            }}
            setLoadData={setLoadData}
          />
        )}
      </div>
    </div>
  );
}
