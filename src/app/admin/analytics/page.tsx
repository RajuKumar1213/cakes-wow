'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminNavbar from '@/components/AdminNavbar';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  Filter,
  AlertTriangle,
  Eye,
  Clock,
  Star,
  MapPin,
  Loader2
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  averageOrderValue: number;
  ordersToday: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  topCategories: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
  }>;
  salesByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

const AnalyticsCard = ({ title, value, change, changeType, icon: Icon, loading = false }: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  loading?: boolean;
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className={`text-sm font-medium flex items-center ${
        changeType === 'positive' ? 'text-green-600' : 
        changeType === 'negative' ? 'text-red-600' : 
        'text-gray-600'
      }`}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {changeType === 'positive' ? (
              <TrendingUp className="w-4 h-4 inline mr-1" />
            ) : changeType === 'negative' ? (
              <TrendingDown className="w-4 h-4 inline mr-1" />
            ) : null}
            {change}
          </>
        )}
      </div>
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">
      {loading ? (
        <span className="w-20 h-8 bg-gray-200 rounded animate-pulse inline-block"></span>
      ) : (
        value
      )}
    </p>
  </div>
);

export default function AdminAnalytics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setDataLoading(true);
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products?limit=1000'), // Get all products for accurate count
        ]);

        const [ordersData, productsData] = await Promise.all([
          ordersRes.json(),
          productsRes.json()
        ]);

        // Get real data
        const orders = ordersData.data || [];
        const products = productsData.data?.products || [];
        
        // Calculate real totals
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
        const totalOrders = orders.length;
        const totalProducts = products.length;
        
        // Calculate average order value
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Get unique customers from orders
        const uniqueCustomers = new Set(
          orders.map((order: any) => order.customerInfo?.phone || order.customerInfo?.email)
            .filter((contact: any) => contact && contact.trim() !== '')
        ).size;
        
        // Calculate real top products based on order items
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
        
        // Sort top products by sales
        const topProducts = Object.values(productSales)
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        // Calculate category performance based on actual orders
        const categorySales: { [key: string]: { name: string; orders: number; revenue: number } } = {};
        
        orders.forEach((order: any) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              // Try to get category from item or use a fallback
              const categoryName = item.category || 'Other';
              if (!categorySales[categoryName]) {
                categorySales[categoryName] = { name: categoryName, orders: 0, revenue: 0 };
              }
              categorySales[categoryName].orders += 1;
              categorySales[categoryName].revenue += (item.price || 0) * (item.quantity || 1);
            });
          }
        });
        
        const topCategories = Object.values(categorySales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Get real recent orders
        const recentOrders = orders
          .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5)
          .map((order: any) => ({
            id: order._id,
            customer: order.customerInfo?.name || order.customerInfo?.phone || 'Anonymous',
            amount: order.totalAmount || 0,
            status: order.status || 'pending',
            date: order.createdAt || new Date().toISOString()
          }));

        // Calculate real sales by day for the last 7 days
        const salesByDay = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayOrders = orders.filter((order: any) => {
            const orderDate = new Date(order.createdAt || 0).toISOString().split('T')[0];
            return orderDate === dateStr;
          });
          
          const dayRevenue = dayOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
          
          return {
            date: dateStr,
            revenue: dayRevenue,
            orders: dayOrders.length
          };
        }).reverse();        // Calculate orders today
        const today = new Date().toISOString().split('T')[0];
        const ordersToday = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt || 0).toISOString().split('T')[0];
          return orderDate === today;
        }).length;

        // Calculate changes based on previous period (simplified - last 7 days vs previous 7 days)
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
        const ordersChange = previousOrders7Days.length > 0 ? ((recentOrders7Days.length - previousOrders7Days.length) / previousOrders7Days.length) * 100 : 0;
        
        // Customer change calculation (simplified)
        const customersChange = recentOrders7Days.length > previousOrders7Days.length ? 
          Math.min(((recentOrders7Days.length - previousOrders7Days.length) / Math.max(previousOrders7Days.length, 1)) * 100, 100) : 0;

        setAnalyticsData({
          totalRevenue,
          totalOrders,
          totalCustomers: uniqueCustomers,
          totalProducts,
          revenueChange: Math.round(revenueChange * 100) / 100,
          ordersChange: Math.round(ordersChange * 100) / 100,
          customersChange: Math.round(customersChange * 100) / 100,
          averageOrderValue,
          topProducts: topProducts.length > 0 ? topProducts : [{ name: 'No sales data', sales: 0, revenue: 0 }],
          topCategories: topCategories.length > 0 ? topCategories : [{ name: 'No category data', orders: 0, revenue: 0 }],
          recentOrders,
          salesByDay,
          ordersToday
        });
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        // Set empty data on error
        setAnalyticsData({
          totalRevenue: 0,
          totalOrders: 0,
          totalCustomers: 0,
          totalProducts: 0,
          revenueChange: 0,
          ordersChange: 0,
          customersChange: 0,
          averageOrderValue: 0,
          ordersToday: 0,
          topProducts: [],
          topCategories: [],
          recentOrders: [],
          salesByDay: []
        });
      } finally {
        setDataLoading(false);
      }
    };

    if (!loading) {
      fetchAnalyticsData();
    }
  }, [loading, timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Website performance and business insights</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 3 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Total Revenue"
            value={`₹${analyticsData?.totalRevenue?.toLocaleString('en-IN') || '0'}`}
            change={analyticsData ? `${analyticsData.revenueChange > 0 ? '+' : ''}${analyticsData.revenueChange}%` : '0%'}
            changeType={(analyticsData?.revenueChange || 0) > 0 ? 'positive' : (analyticsData?.revenueChange || 0) < 0 ? 'negative' : 'neutral'}
            icon={DollarSign}
            loading={dataLoading}
          />
          <AnalyticsCard
            title="Total Orders"
            value={analyticsData?.totalOrders?.toString() || '0'}
            change={analyticsData ? `${analyticsData.ordersChange > 0 ? '+' : ''}${analyticsData.ordersChange}%` : '0%'}
            changeType={(analyticsData?.ordersChange || 0) > 0 ? 'positive' : (analyticsData?.ordersChange || 0) < 0 ? 'negative' : 'neutral'}
            icon={ShoppingCart}
            loading={dataLoading}
          />
          <AnalyticsCard
            title="Total Customers"
            value={analyticsData?.totalCustomers?.toString() || '0'}
            change={analyticsData ? `${analyticsData.customersChange > 0 ? '+' : ''}${analyticsData.customersChange}%` : '0%'}
            changeType={(analyticsData?.customersChange || 0) > 0 ? 'positive' : (analyticsData?.customersChange || 0) < 0 ? 'negative' : 'neutral'}
            icon={Users}
            loading={dataLoading}
          />
          <AnalyticsCard
            title="Total Products"
            value={analyticsData?.totalProducts?.toString() || '0'}
            change="Product catalog"
            changeType="neutral"
            icon={Package}
            loading={dataLoading}
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Average Order Value</h3>
                <p className="text-xl font-bold text-gray-900">
                  {dataLoading ? (
                    <span className="w-16 h-6 bg-gray-200 rounded animate-pulse inline-block"></span>
                  ) : (
                    `₹${analyticsData?.averageOrderValue?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}`
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Orders Today</h3>                <p className="text-xl font-bold text-gray-900">
                  {dataLoading ? (
                    <span className="w-12 h-6 bg-gray-200 rounded animate-pulse inline-block"></span>
                  ) : (
                    analyticsData?.ordersToday || 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Customer Satisfaction</h3>
                <p className="text-xl font-bold text-gray-900">4.8/5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              Top Products
            </h3>
            {dataLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {analyticsData?.topProducts?.map((product, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{product.revenue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Top Categories
            </h3>
            {dataLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {analyticsData?.topCategories?.map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{category.revenue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            Recent Orders
          </h3>
          {dataLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData?.recentOrders?.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">#{order.id.slice(-6)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{order.customer}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">₹{order.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
