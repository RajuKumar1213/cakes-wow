"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Loading, { Spinner, PageLoading } from "@/components/Loading";
import axios from "axios";
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  FolderOpen,
  Plus,
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  recentProducts: Array<{
    _id: string;
    name: string;
    price: number;
    createdAt: string;
  }>;
  recentCategories: Array<{
    _id: string;
    name: string;
    group: string;
    createdAt: string;
  }>;
}

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  changeType,
}: {
  title: string;
  value: string;
  change: string;
  icon: any;
  changeType: "positive" | "negative" | "neutral";
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <p
          className={`text-sm mt-2 flex items-center gap-1 ${
            changeType === "positive"
              ? "text-green-600"
              : changeType === "negative"
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          {change}
        </p>
      </div>
      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-orange-600" />
      </div>
    </div>
  </div>
);

const QuickAction = ({
  title,
  description,
  icon: Icon,
  onClick,
  color = "orange",
}: {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
  color?: string;
}) => (
  <button
    onClick={onClick}
    className="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all text-left group"
  >
    <div className="flex items-start gap-4">
      <div
        className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center group-hover:bg-${color}-200 transition-colors`}
      >
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  </button>
);

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin-login");
    }
  }, [user, loading, router]);
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);

        // Fetch products count and recent products
        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get("/api/products?limit=5"),
          axios.get("/api/categories?format=all"),
        ]);

        const stats: DashboardStats = {
          totalProducts:
            productsResponse.data.data?.totalProducts ||
            productsResponse.data.data?.products?.length ||
            0,
          totalCategories: categoriesResponse.data.success
            ? categoriesResponse.data.data.length
            : 0,
          totalUsers: 0, // TODO: Add users API when authentication system is complete
          recentProducts:
            productsResponse.data.data?.products?.slice(0, 5) || [],
          recentCategories: categoriesResponse.data.success
            ? categoriesResponse.data.data.slice(0, 5)
            : [],
        };

        setDashboardStats(stats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Set default values on error but show user-friendly message
        setDashboardStats({
          totalProducts: 0,
          totalCategories: 0,
          totalUsers: 0,
          recentProducts: [],
          recentCategories: [],
        });
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Note: In a real app, you'd check if user has admin role
  // For demo purposes, we'll show the admin panel to any authenticated user

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-orange-600">Bakingo</h1>
              <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user?.phoneNumber}</span>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                User Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {" "}
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h2>
              <p className="text-gray-600">
                Manage your bakery business with powerful admin tools
              </p>
            </div>
            <button
              onClick={() => {
                setStatsLoading(true);
                window.location.reload();
              }}
              className="mt-4 sm:mt-0 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            // Loading skeleton for stats
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              {" "}
              <StatCard
                title="Total Products"
                value={dashboardStats?.totalProducts.toString() || "0"}
                change={
                  dashboardStats?.recentProducts.length
                    ? `${dashboardStats.recentProducts.length} added recently`
                    : "No recent products"
                }
                icon={Package}
                changeType="neutral"
              />
              <StatCard
                title="Total Categories"
                value={dashboardStats?.totalCategories.toString() || "0"}
                change={
                  dashboardStats?.recentCategories.length
                    ? `${dashboardStats.recentCategories.length} categories active`
                    : "No categories yet"
                }
                icon={FolderOpen}
                changeType="neutral"
              />
              <StatCard
                title="Orders Today"
                value="0"
                change="Order system pending"
                icon={ShoppingCart}
                changeType="neutral"
              />
              <StatCard
                title="Total Revenue"
                value="₹0"
                change="Analytics coming soon"
                icon={DollarSign}
                changeType="neutral"
              />
            </>
          )}
        </div>{" "}
        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              title="Manage Products"
              description="Add, edit, or remove products from your catalog"
              icon={Package}
              onClick={() => router.push("/admin/products")}
            />
            <QuickAction
              title="Manage Categories"
              description="Organize and manage product categories"
              icon={FolderOpen}
              onClick={() => router.push("/admin/categories")}
              color="purple"
            />
            <QuickAction
              title="View Orders"
              description="Track and manage customer orders"
              icon={ShoppingCart}
              onClick={() => router.push("/admin/orders")}
            />
            <QuickAction
              title="Add New Product"
              description="Quickly add a new product to your store"
              icon={Plus}
              onClick={() => router.push("/admin/products?action=new")}
              color="green"
            />
            <QuickAction
              title="User Management"
              description="Manage customer accounts and permissions"
              icon={Users}
              onClick={() => router.push("/admin/users")}
            />
            <QuickAction
              title="Analytics"
              description="View detailed business analytics and reports"
              icon={BarChart3}
              onClick={() => router.push("/admin/analytics")}
              color="blue"
            />
          </div>
        </div>{" "}
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Products */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Products
              </h3>
              <button
                onClick={() => router.push("/admin/products")}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View All
              </button>
            </div>
            {statsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 animate-pulse"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : dashboardStats?.recentProducts.length ? (
              <div className="space-y-3">
                {dashboardStats.recentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Added {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      ₹{product.price}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No products yet</p>
                <button
                  onClick={() => router.push("/admin/products?action=new")}
                  className="text-orange-600 text-sm font-medium mt-2 hover:text-orange-700"
                >
                  Add your first product
                </button>
              </div>
            )}
          </div>

          {/* Recent Categories */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Categories
              </h3>
              <button
                onClick={() => router.push("/admin/categories")}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                View All
              </button>
            </div>
            {statsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 animate-pulse"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardStats?.recentCategories.length ? (
              <div className="space-y-3">
                {dashboardStats.recentCategories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Group: {category.group}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No categories yet</p>
                <button
                  onClick={() => router.push("/admin/categories?action=new")}
                  className="text-orange-600 text-sm font-medium mt-2 hover:text-orange-700"
                >
                  Add your first category
                </button>
              </div>
            )}
          </div>
        </div>{" "}
      </main>
    </div>
  );
}
