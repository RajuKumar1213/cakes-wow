'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, Calendar, LogOut, Package, Heart, Clock, Eye, Truck, CheckCircle, AlertCircle, ArrowRight, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Image from 'next/image';

interface Order {
  _id: string;
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: {
    product: {
      name: string;
      images: string[];
    };
  }[];
  deliveryAddress?: {
    area: string;
  };
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'out for delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'preparing':
        return <Package className="w-4 h-4" />;
      case 'out for delivery':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 pt-20">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 rounded-2xl p-8 text-white mb-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-poppins text-3xl font-bold mb-2">Welcome back!</h2>
                <p className="text-pink-100 text-lg">
                  Manage your profile and track your sweet orders
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5 inline-block mr-2" />
                Profile Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Package className="w-5 h-5 inline-block mr-2" />
                My Orders ({orders.length})
              </button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Active Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orders.filter(order => !['delivered', 'cancelled'].includes(order.status?.toLowerCase())).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Member Since</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => router.push('/')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group transform hover:scale-105"
                  >
                    <Package className="w-8 h-8 text-gray-600 group-hover:text-pink-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700">Browse Cakes</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group transform hover:scale-105"
                  >
                    <Clock className="w-8 h-8 text-gray-600 group-hover:text-pink-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700">Order History</span>
                  </button>

                  <button 
                    onClick={() => router.push('/wishlist')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group transform hover:scale-105"
                  >
                    <Heart className="w-8 h-8 text-gray-600 group-hover:text-pink-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700">Favorites</span>
                  </button>

                  <button 
                    onClick={logout}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all group transform hover:scale-105"
                  >
                    <LogOut className="w-8 h-8 text-gray-600 group-hover:text-red-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-red-700">Logout</span>
                  </button>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">Phone Number</span>
                    </div>
                    <span className="font-medium text-gray-900">{user?.phoneNumber}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">Member Since</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">Account Status</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {loadingOrders ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center">
                  <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">Start browsing our delicious cakes and place your first order!</p>
                  <button
                    onClick={() => router.push('/')}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all transform hover:scale-105"
                  >
                    Browse Cakes
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: Order) => (
                    <div key={order._id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Order Header */}
                        <div className="flex items-start gap-4">
                          {order.items?.[0]?.product?.images?.[0] && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <Image
                                src={order.items[0].product.images[0]}
                                alt={order.items[0].product.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                Order #{order.orderId}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} • ₹{order.totalAmount}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div className="flex items-center gap-3">
                          {order.deliveryAddress && (
                            <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 max-w-40">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{order.deliveryAddress.area}</span>
                            </div>
                          )}
                          <button
                            onClick={() => router.push(`/orders/${order._id}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      {order.items && order.items.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Package className="w-4 h-4" />
                            <span>
                              {order.items[0].product.name}
                              {order.items.length > 1 && ` +${order.items.length - 1} more`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
