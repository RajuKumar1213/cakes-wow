'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Package, 
  Clock, 
  MapPin, 
  Eye,
  Search,
  Filter,
  Calendar,
  Truck,
  ChefHat,
  CreditCard,
  Banknote,
  ArrowRight,
  Star,
  Heart
} from 'lucide-react';
import { getOrderStatusInfo, formatDate, formatTime } from '@/lib/orderUtils';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  selectedWeight?: string;
  imageUrl: string;
  customization?: {
    type: 'photo-cake';
    message: string;
    imageUrl: string;
  };
}

interface CustomerInfo {
  fullName: string;
  mobileNumber: string;
  deliveryDate: string;
  timeSlot: string;
  area: string;
  pinCode: string;
  fullAddress: string;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'razorpay' | 'cod';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentCompletedAt?: string;
  orderDate: string;
  notes?: string;
}

export default function OrdersPage() {
  const { showError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to load orders', 'There was an error retrieving your order history');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <Package className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <Star className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getPaymentIcon = (method: string) => {
    return method === 'cod' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 pt-32 lg:pt-44">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-16 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 pt-28 lg:pt-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-8">
          {/* Header Section */}
          <div className="mb-6 lg:mb-8">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent mb-2">
                My Orders
              </h1>
              <p className="text-sm lg:text-base text-gray-600">Track your delicious cake orders</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 lg:p-6 mb-4 lg:mb-6 shadow-lg border border-pink-100/50">
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/90"
                />
              </div>
              
              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 lg:py-3 text-sm lg:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/90 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 lg:py-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-lg border border-pink-100/50 max-w-md mx-auto">
                <Package className="w-16 h-16 lg:w-20 lg:h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">No Orders Found</h3>
                <p className="text-sm lg:text-base text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter' 
                    : 'Start your sweet journey by placing your first order'
                  }
                </p>
                <Link href="/">
                  <button className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-orange-600 transition-all duration-300 font-medium text-sm lg:text-base">
                    Browse Cakes
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 lg:space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = getOrderStatusInfo(order.status);
                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                
                return (
                  <div
                    key={order._id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100/50 hover:border-pink-200/60"
                  >
                    {/* Mobile Layout */}
                    <div className="lg:hidden">
                      {/* Header */}
                      <div className="p-4 border-b border-gray-100/80">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-gray-500">#{order.orderId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-800">₹{order.totalAmount}</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            {getPaymentIcon(order.paymentMethod)}
                            <span>{order.paymentMethod.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex gap-3">
                          {/* Items Images */}
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white shadow-md">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                                    <ChefHat className="w-5 h-5 text-pink-500" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-white shadow-md">
                                <span className="text-xs font-bold text-gray-600">+{order.items.length - 2}</span>
                              </div>
                            )}
                          </div>                          {/* Order Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {order.items[0].name}
                                  {order.items[0].customization?.type === 'photo-cake' && ' (Photo Cake)'}
                                  {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {totalItems} item{totalItems > 1 ? 's' : ''} • {formatDate(order.orderDate)}
                                </p>
                                {/* Show custom message for photo cakes */}
                                {order.items[0].customization?.message && (
                                  <p className="text-xs text-purple-600 mt-1 italic">
                                    "{order.items[0].customization.message}"
                                  </p>
                                )}
                                <div className="flex items-center gap-1 mt-2">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500 truncate">{order.customerInfo.area}</span>
                                </div>
                              </div>
                              
                              {/* Photo Cake Custom Image Display (Right Side) */}
                              <div className="flex items-center gap-2 ml-2">
                                {order.items[0].customization?.imageUrl && (
                                  <div className="relative">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md border-2 border-purple-200">
                                      <Image
                                        src={order.items[0].customization.imageUrl}
                                        alt="Custom photo"
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                      <span className="text-xs text-white">📷</span>
                                    </div>
                                  </div>
                                )}
                                <Link href={`/order-confirmation/${order.orderId}`}>
                                  <button className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:from-pink-600 hover:to-orange-600 transition-all duration-300">
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:block">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          {/* Left: Order Info */}
                          <div className="flex items-center gap-6">
                            {/* Items Images */}
                            <div className="flex -space-x-3">                              {order.items.slice(0, 3).map((item, index) => (
                                <div key={index} className="relative w-16 h-16 rounded-2xl overflow-hidden ring-3 ring-white shadow-lg">
                                  {/* Prioritize photo cake custom image over product image */}
                                  {item.customization?.imageUrl ? (
                                    <Image
                                      src={item.customization.imageUrl}
                                      alt={`Custom photo for ${item.name}`}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : item.imageUrl ? (
                                    <Image
                                      src={item.imageUrl}
                                      alt={item.name}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                                      <ChefHat className="w-7 h-7 text-pink-500" />
                                    </div>
                                  )}
                                  {/* Photo cake indicator */}
                                  {item.customization?.type === 'photo-cake' && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                      <span className="text-sm text-white">📷</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-3 ring-white shadow-lg">
                                  <span className="text-sm font-bold text-gray-600">+{order.items.length - 3}</span>
                                </div>
                              )}
                            </div>                            {/* Order Details */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {order.items[0].name}
                                  {order.items[0].customization?.type === 'photo-cake' && ' (Photo Cake)'}
                                  {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                </h3>
                                <span className="text-sm font-mono text-gray-500">#{order.orderId}</span>
                              </div>
                              
                              {/* Show custom message for photo cakes */}
                              {order.items[0].customization?.message && (
                                <p className="text-sm text-purple-600 mb-2 italic">
                                  Custom Message: "{order.items[0].customization.message}"
                                </p>
                              )}
                              
                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Package className="w-4 h-4" />
                                  <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(order.orderDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{order.customerInfo.area}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {getPaymentIcon(order.paymentMethod)}
                                  <span>{order.paymentMethod.toUpperCase()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Status, Photo Cake Image, and Actions */}
                          <div className="flex items-center gap-6">
                            {/* Photo Cake Custom Image Display (Right Side) */}
                            {order.items[0].customization?.imageUrl && (
                              <div className="relative">
                                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg border-3 border-purple-200">
                                  <Image
                                    src={order.items[0].customization.imageUrl}
                                    alt="Custom photo cake image"
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="absolute -top-2 -right-2 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
                                  <span className="text-white text-sm">📷</span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center rounded-b-xl">
                                  Custom Photo
                                </div>
                              </div>
                            )}
                            
                            <div className="text-right">
                              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${statusInfo.color} mb-2`}>
                                {getStatusIcon(order.status)}
                                {statusInfo.label}
                              </div>
                              <div className="text-xl font-bold text-gray-800">₹{order.totalAmount}</div>
                            </div>
                            
                            <Link href={`/order-confirmation/${order.orderId}`}>
                              <button className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-orange-600 transition-all duration-300 font-medium flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                            </Link>
                          </div></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
