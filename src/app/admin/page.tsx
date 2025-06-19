"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Loading, { Spinner, PageLoading } from "@/components/Loading";
import AdminNavbar from "@/components/AdminNavbar";
import axios from "axios";
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Calendar,
  FolderOpen,
  Plus,
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  averageOrderValue: number;
  revenueChange: number;
  ordersChange: number;
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
  recentOrders: Array<{
    _id: string;
    customerInfo: {
      name?: string;
      phone?: string;
    };
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
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
  const { loading } = useAuth();
  
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [statsLoading, setStatsLoading] = useState(true);

  // useEffect(() => {
  //   if (!localStorage.getItem("admin_token")) {
  //     router.push("/admin-login");
  //   }
  // }, [ router]);
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);

        // Fetch all data in parallel
        const [productsResponse, categoriesResponse, ordersResponse] = await Promise.all([
          axios.get("/api/products?limit=5"),
          axios.get("/api/categories?format=all"),
          axios.get("/api/orders"), // Get all orders for analytics
        ]);        // Process orders data for analytics
        const orders = ordersResponse.data.orders || [];
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate orders today
        const today = new Date().toISOString().split('T')[0];
        const ordersToday = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt || 0).toISOString().split('T')[0];
          return orderDate === today;
        }).length;

        // Calculate recent orders (last 5)
        const recentOrders = orders
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5);

        // Calculate top products based on order items
        const productSales: { [key: string]: { name: string; sales: number; revenue: number } } = {};
        
        orders.forEach((order: any) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const productName = item.name || 'Unknown Product';
              if (!productSales[productName]) {
                productSales[productName] = { name: productName, sales: 0, revenue: 0 };
              }
              productSales[productName].sales += item.quantity || 1;
              productSales[productName].revenue += (item.price || 0) * (item.quantity || 1);
            });
          }
        });
        
        const topProducts = Object.values(productSales)
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        // Calculate changes (last 7 days vs previous 7 days)
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const recentOrders7Days = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt || 0);
          return orderDate >= last7Days;
        });
        
        const previousOrders7Days = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt || 0);
          return orderDate >= previous7Days && orderDate < last7Days;
        });
        
        const recentRevenue = recentOrders7Days.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
        const previousRevenue = previousOrders7Days.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
        
        const revenueChange = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        const ordersChange = previousOrders7Days.length > 0 ? ((recentOrders7Days.length - previousOrders7Days.length) / previousOrders7Days.length) * 100 : 0;        // Get unique customers count
        const uniqueCustomers = new Set(
          orders.map((order: any) => order.customerInfo?.mobileNumber || order.customerInfo?.fullName)
            .filter((contact: any) => contact && contact.trim() !== '')
        ).size;

        const stats: DashboardStats = {
          totalProducts:
            productsResponse.data.data?.totalProducts ||
            productsResponse.data.data?.products?.length ||
            0,
          totalCategories: categoriesResponse.data.success
            ? categoriesResponse.data.data.length
            : 0,
          totalUsers: uniqueCustomers,
          totalOrders,
          totalRevenue,
          ordersToday,
          averageOrderValue,
          revenueChange: Math.round(revenueChange * 100) / 100,
          ordersChange: Math.round(ordersChange * 100) / 100,
          recentProducts:
            productsResponse.data.data?.products?.slice(0, 5) || [],
          recentCategories: categoriesResponse.data.success
            ? categoriesResponse.data.data.slice(0, 5)
            : [],
          recentOrders,
          topProducts: topProducts.length > 0 ? topProducts : [],
        };

        setDashboardStats(stats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Set default values on error but show user-friendly message
        setDashboardStats({
          totalProducts: 0,
          totalCategories: 0,
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          ordersToday: 0,
          averageOrderValue: 0,
          revenueChange: 0,
          ordersChange: 0,
          recentProducts: [],
          recentCategories: [],
          recentOrders: [],
          topProducts: [],
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );  }

  // Note: In a real app, you'd check if user has admin role
  // For demo purposes, we'll show the admin panel to any authenticated user
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <AdminNavbar />

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
              <StatCard
                title="Total Revenue"
                value={`₹${dashboardStats?.totalRevenue?.toLocaleString('en-IN') || '0'}`}
                change={
                  dashboardStats?.revenueChange 
                    ? `${dashboardStats.revenueChange > 0 ? '+' : ''}${dashboardStats.revenueChange}% vs last week`
                    : "No data for comparison"
                }
                icon={DollarSign}
                changeType={
                  (dashboardStats?.revenueChange || 0) > 0 ? 'positive' : 
                  (dashboardStats?.revenueChange || 0) < 0 ? 'negative' : 'neutral'
                }
              />
              <StatCard
                title="Total Orders"
                value={dashboardStats?.totalOrders?.toString() || "0"}
                change={
                  dashboardStats?.ordersChange 
                    ? `${dashboardStats.ordersChange > 0 ? '+' : ''}${dashboardStats.ordersChange}% vs last week`
                    : "No data for comparison"
                }
                icon={ShoppingCart}
                changeType={
                  (dashboardStats?.ordersChange || 0) > 0 ? 'positive' : 
                  (dashboardStats?.ordersChange || 0) < 0 ? 'negative' : 'neutral'
                }
              />
              <StatCard
                title="Orders Today"
                value={dashboardStats?.ordersToday?.toString() || "0"}
                change={`Avg: ₹${dashboardStats?.averageOrderValue?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'} per order`}
                icon={Calendar}
                changeType="neutral"
              />
              <StatCard
                title="Total Customers"
                value={dashboardStats?.totalUsers?.toString() || "0"}
                change={
                  dashboardStats?.recentOrders?.length
                    ? `${dashboardStats.recentOrders.length} recent orders`
                    : "No recent orders"
                }
                icon={Users}
                changeType="neutral"
              />
            </>
          )}
        </div>{" "}
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              Top Selling Products
            </h3>
            {statsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardStats?.topProducts?.length ? (
                  dashboardStats.topProducts.map((product, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{product.revenue.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No sales data available</p>
                )}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              Recent Orders
            </h3>
            {statsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardStats?.recentOrders?.length ? (
                  dashboardStats.recentOrders.map((order) => (
                    <div key={order._id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customerInfo?.name || order.customerInfo?.phone || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent orders</p>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              title="Manage Products, Categories and Add-ons"
              description="Add, edit, or remove products from your catalog"
              icon={Package}
              onClick={() => router.push("/admin/products")}
            />
            <QuickAction
              title="Hero Banners"
              description="Manage homepage carousel banners"
              icon={BarChart3}
              onClick={() => router.push("/admin/hero-banners")}
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
              </div>            )}
          </div>
        </div>
      </main>
    </div>
  );
}
