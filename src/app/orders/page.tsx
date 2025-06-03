'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Package, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar,
  ArrowLeft,
  Eye,
  Search
} from 'lucide-react';
import { getOrderStatusInfo, formatDate, formatTime } from '@/lib/orderUtils';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedWeight?: string;
  imageUrl: string;
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

      setOrders(data.orders || []);    } catch (error) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your cake orders</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, name, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
            </h2>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Start by ordering some delicious cakes!'
              }
            </p>
            {searchTerm || statusFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/"
                className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors inline-block"
              >
                Browse Cakes
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusInfo = getOrderStatusInfo(order.status);
              
              return (
                <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Order #{order.orderId}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(order.orderDate)} at {formatTime(order.orderDate)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                      <Link
                        href={`/order-confirmation/${order.orderId}`}
                        className="inline-flex items-center text-pink-600 hover:text-pink-700 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={item.imageUrl || '/placeholder-cake.jpg'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                          {item.selectedWeight && (
                            <p className="text-xs text-gray-500">Weight: {item.selectedWeight}</p>
                          )}
                          <p className="text-xs text-gray-600">
                            ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600 mb-2 sm:mb-0">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate">{order.customerInfo.area}, {order.customerInfo.pinCode}</span>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-1" />
                        {order.customerInfo.mobileNumber}
                      </div>
                      
                      <div className="text-lg font-semibold text-gray-900">
                        Total: ₹{order.totalAmount}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        Delivery scheduled for {formatDate(order.customerInfo.deliveryDate)} 
                        ({order.customerInfo.timeSlot})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Orders Summary */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{filteredOrders.length}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {filteredOrders.filter(order => order.status === 'delivered').length}
                </div>
                <div className="text-sm text-green-700">Delivered</div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredOrders.filter(order => ['confirmed', 'preparing', 'out_for_delivery'].includes(order.status)).length}
                </div>
                <div className="text-sm text-blue-700">In Progress</div>
              </div>
              
              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">
                  ₹{filteredOrders.reduce((total, order) => total + order.totalAmount, 0)}
                </div>
                <div className="text-sm text-pink-700">Total Spent</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
