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
  tags: string[];
  weightOptions: Array<{
    weight: string;
    price: number;
    discountedPrice?: number;
  }>;
  isEggless: boolean;
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
  map(arg0: (category: any) => JSX.Element): import("react").ReactNode;
  _id: string;
  name: string;
  slug: string;
  group: string;
  type: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

const ImageUpload = ({
  onImageUploaded,
  onImageRemoved,
  existingImages = [],
}: {
  onImageUploaded: (url: string) => void;
  onImageRemoved: (url: string) => void;
  existingImages?: string[];
}) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploadError, setUploadError] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        const newImageUrl = response.data.data.url;
        setImages((prev) => [...prev, newImageUrl]);
        onImageUploaded(newImageUrl);
      } else {
        setUploadError("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
    onImageRemoved(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
        <span className="text-sm text-gray-500">Max 5MB, JPG/PNG/WEBP</span>
      </div>

      {uploadError && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {uploadError}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                width={200}
                height={150}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
  >();
  const [loadingData, setLoadingData] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check authentication
  // useEffect(() => {
  //   if (!loading && (!user || user.role !== "admin")) {
  //     router.push("/login");
  //   }
  // }, [user, loading, router]);

  // // Fetch data
  // useEffect(() => {
  //   if (user?.role === "admin") {
  //     fetchData();
  //   }
  // }, [user]);

  useEffect(() => {
    if (!loading) {
      fetchData();
    }
  }, [loading, editingCategory, success]);

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

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);


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
        setSuccess(true);
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

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(categories).map(
                      ([groupName, groupCategories]) => (
                        <optgroup key={groupName} label={groupName}>
                          {/* {console.log(groupName, groupCategories)} */}
                          {groupCategories.map((category) => (
                            <option key={category?._id} value={category?.slug}>
                              {category?.name}
                            </option>
                          ))}
                        </optgroup>
                      )
                    )}
                  </select>
                </div>

                <button
                  onClick={() => setShowProductForm(true)}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
                        height={300}
                        className="w-full object-cover"
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

                  <div className="p-2">
                    <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 mb-1 line-clamp-2">
                      {product.shortDescription}
                    </p>

                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-md font-bold text-gray-900">
                          ₹{product.price}
                        </span>
                        {product.discountedPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.discountedPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
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

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {product.isEggless && (
                          <span className="text-green-600 text-xs">
                            🥚 Eggless
                          </span>
                        )}
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
        )}
        {/* Categories Tab */}
        {activeTab === "categories" && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-md md:text-2xl font-semibold text-gray-900">
                  Categories Management
                </h2>
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="bg-orange-600 text-white px-3 md:px-6 py-1 md:py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {allCategories.map((category) => (
                <div
                  key={category._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {" "}
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

                    <div className="absolute top-1 right-1">
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
                  <div className="p-2">
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

                    <div className="flex items-center justify-end gap-2">
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
              ))}
            </div>

            {categories.length === 0 && (
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
          />
        )}
      </div>
    </div>
  );
}
