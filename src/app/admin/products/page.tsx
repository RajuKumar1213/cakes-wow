"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import AdminNavbar from "@/components/AdminNavbar";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
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
import AddOnForm from "@/components/AddOnForm";
import ProductsManagement from "@/components/admin/ProductsManagement";
import CategoriesManagement from "@/components/admin/CategoriesManagement";
import AddOnsManagement from "@/components/admin/AddOnsManagement";

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

interface AddOn {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProducts() {
  const { user, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "addons"
  >("products");
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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<"name" | "price" | "created" | "group">(
    "created"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loadData, setLoadData] = useState(false);
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [filteredAddons, setFilteredAddons] = useState<AddOn[]>([]);
  const [showAddOnForm, setShowAddOnForm] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | undefined>();

  // Loading states for each tab
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [addonsLoading, setAddonsLoading] = useState(false);

  // Track which tabs have been loaded
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

  // Pagination state for products
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemsPerPage] = useState(30); // Fixed items per page

  // Initialize by loading the default active tab
  useEffect(() => {
    if (!loading) {
      loadTabData(activeTab);
    }
  }, [loading]);

  // Load data when tab changes
  useEffect(() => {
    if (!loading && activeTab) {
      loadTabData(activeTab);
    }
  }, [activeTab, editingCategory, loadData, editingAddOn]);

  // Function to load data for specific tab
  const loadTabData = async (tab: "products" | "categories" | "addons") => {
    // Skip if already loaded (except when explicitly refreshing)
    if (loadedTabs.has(tab) && !loadData) {
      return;
    }
    switch (tab) {
      case "products":
        await fetchProducts(currentPage);
        break;
      case "categories":
        await fetchCategories();
        break;
      case "addons":
        await fetchAddOns();
        break;
    } // Mark tab as loaded
    setLoadedTabs((prev) => new Set([...prev, tab]));
    if (loadData) setLoadData(false);
  };

  // Separate fetch functions for each data type
  const fetchProducts = async (page = 1) => {
    setProductsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        page: page.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      const [productsRes, allCategoriesRes] = await Promise.all([
        fetch(`/api/products?${params.toString()}`),
        fetch("/api/categories?format=all"),
      ]);

      const [productsData, allCategoriesData] = await Promise.all([
        productsRes.json(),
        allCategoriesRes.json(),
      ]);

      setAllCategories(allCategoriesData.data || []);
      setProducts(productsData.data.products || []);

      // Update pagination state
      if (productsData.data.pagination) {
        setCurrentPage(productsData.data.pagination.page);
        setTotalPages(productsData.data.pagination.pages);
        setTotalProducts(productsData.data.pagination.total);
      }
      console.log(
        "📦 Products loaded:",
        productsData.data.products?.length || 0
      );
      console.log("📄 Pagination:", productsData.data.pagination);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      showError("Error", "Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const categoriesRes = await fetch("/api/categories?format=all");
      const categoriesData = await categoriesRes.json();

      setCategories(categoriesData.data || []);
      console.log("📁 Categories loaded:", categoriesData.data?.length || 0);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      showError("Error", "Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchAddOns = async () => {
    setAddonsLoading(true);
    try {
      const res = await fetch("/api/addons");
      const data = await res.json();
      setAddons(data.data || []);
      console.log("🎁 Add-ons loaded:", data.data?.length || 0);
    } catch (error) {
      console.error("Failed to fetch add-ons:", error);
      showError("Error", "Failed to load add-ons");
    } finally {
      setAddonsLoading(false);
    }
  };
  // Filter products on server side when filters change
  useEffect(() => {
    if (loadedTabs.has("products") && activeTab === "products") {
      // Reset to page 1 when filters change
      fetchProducts(1);
    }
  }, [searchTerm, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    let filtered = addons;
    if (searchTerm) {
      filtered = filtered.filter((addon) =>
        addon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAddons(filtered);
  }, [addons, searchTerm]);
  const handleSort = (field: "name" | "price" | "created" | "group") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
  const handleSaveProduct = async () => {
    // This function is called by ProductForm's onSuccess callback
    setShowProductForm(false);
    setEditingProduct(undefined);
    // Mark products tab as not loaded to force refresh
    setLoadedTabs((prev) => {
      const newSet = new Set(prev);
      newSet.delete("products");
      return newSet;
    });
    await loadTabData("products");
  };
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      console.log(data);
      if (data.success) {
        showSuccess("Success", "Product deleted successfully!");
        // Mark products tab as not loaded to force refresh
        setLoadedTabs((prev) => {
          const newSet = new Set(prev);
          newSet.delete("products");
          return newSet;
        });
        await loadTabData("products");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      showError("Error", "Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        showSuccess("Success", "Category deleted successfully!");
        // Mark categories tab as not loaded to force refresh
        setLoadedTabs((prev) => {
          const newSet = new Set(prev);
          newSet.delete("categories");
          return newSet;
        });
        await loadTabData("categories");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      showError("Error", "Failed to delete category");
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleDeleteAddOn = async (id: string) => {
    if (!confirm("Are you sure you want to delete this add-on?")) return;
    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/addons/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        showSuccess("Success", "Add-on deleted successfully!");
        // Mark addons tab as not loaded to force refresh
        setLoadedTabs((prev) => {
          const newSet = new Set(prev);
          newSet.delete("addons");
          return newSet;
        });
        await loadTabData("addons");
      }
    } catch (error) {
      showError("Error", "Failed to delete add-on");
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleSaveAddOn = async () => {
    setShowAddOnForm(false);
    setEditingAddOn(undefined);
    // Mark addons tab as not loaded to force refresh
    setLoadedTabs((prev) => {
      const newSet = new Set(prev);
      newSet.delete("addons");
      return newSet;
    });
    await loadTabData("addons");
  }; // Check if currently loading any data
  const isCurrentTabLoading = () => {
    switch (activeTab) {
      case "products":
        return productsLoading;
      case "categories":
        return categoriesLoading;
      case "addons":
        return addonsLoading;
      default:
        return false;
    }
  };

  if (loading) {
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
      {/* Admin Navbar */}
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
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
                </p>{" "}
                <p className="text-2xl font-bold text-gray-900">
                  {totalProducts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <CategoryIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Categories</p>{" "}
                <p className="text-2xl font-bold text-gray-900">
                  {loadedTabs.has("categories") ? categories.length : "-"}
                </p>
              </div>
            </div>
          </div>{" "}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Add-ons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadedTabs.has("addons") ? addons.length : "-"}
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
            }`}>
            <Package className="w-4 h-4 inline mr-2" />
            Products ({loadedTabs.has("products") ? products.length : "-"})
            {productsLoading && (
              <Loader2 className="w-3 h-3 inline ml-1 animate-spin" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === "categories"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            <CategoryIcon className="w-4 h-4 inline mr-2" />
            Categories ({loadedTabs.has("categories") ? categories.length : "-"}
            )
            {categoriesLoading && (
              <Loader2 className="w-3 h-3 inline ml-1 animate-spin" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("addons")}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === "addons"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            <Tag className="w-4 h-4 inline mr-2" />
            Addons ({loadedTabs.has("addons") ? addons.length : "-"})
            {addonsLoading && (
              <Loader2 className="w-3 h-3 inline ml-1 animate-spin" />
            )}
          </button>
        </div>
      </div>
      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="pb-10">
          <ProductsManagement />
        </div>
      )}
      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="pb-10">
          <CategoriesManagement />
        </div>
      )}
      {/* Addons Tab */}
      {activeTab === "addons" && (
        <div className="pb-10">
          <AddOnsManagement />
        </div>
      )}
      {/* Forms */}
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
      )}{" "}
      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onCancel={() => {
            setShowCategoryForm(false);
            setEditingCategory(undefined);
          }}
          setLoadData={() => {
            setShowCategoryForm(false);
            setEditingCategory(undefined);
            // Mark categories tab as not loaded to force refresh
            setLoadedTabs((prev) => {
              const newSet = new Set(prev);
              newSet.delete("categories");
              return newSet;
            });
            loadTabData("categories");
          }}
        />
      )}
      {showAddOnForm && (
        <AddOnForm
          addOn={editingAddOn}
          onSuccess={handleSaveAddOn}
          onCancel={() => {
            setShowAddOnForm(false);
            setEditingAddOn(undefined);
          }}
        />
      )}
    </div>
  );
}
