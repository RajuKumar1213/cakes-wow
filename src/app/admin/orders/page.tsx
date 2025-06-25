'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import AdminNavbar from '@/components/AdminNavbar';
import {
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  RefreshCw,
  User,
  CreditCard,
  Gift,
  MessageSquare,
  Heart,
  Loader2
} from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  selectedWeight: string;
  imageUrl: string;
  customization?: {
    type: 'photo-cake';
    image: File | null;
    message: string;
    imageUrl: string | null;
  };
}

interface OrderAddOn {
  addOnId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CustomerInfo {
  fullName: string;
  mobileNumber: string;
  deliveryDate: string;
  timeSlot: string;
  area: string;
  pinCode: string;
  fullAddress: string;
  deliveryOccasion?: string;
  relation?: string;
  senderName?: string;
  messageOnCard?: string;
  specialInstructions?: string;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  addons: OrderAddOn[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  subtotal: number;
  deliveryCharge: number;
  onlineDiscount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'online' | 'card';
  orderDate: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  timeSlot: string;
  notes: string;
  trackingInfo?: {
    orderPlaced?: { timestamp: string; status: string };
    confirmed?: { timestamp: string; status: string };
    preparing?: { timestamp: string; status: string };
    outForDelivery?: { timestamp: string; status: string };
    delivered?: { timestamp: string; status: string };
    cancelled?: { timestamp: string; status: string };
  };
}

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' };
      case 'confirmed':
        return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' };
      case 'preparing':
        return { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'Preparing' };
      case 'out_for_delivery':
        return { color: 'bg-orange-100 text-orange-800', icon: Truck, label: 'Out for Delivery' };
      case 'delivered':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Unknown' };
    }
  };

  const { color, icon: Icon, label } = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const PaymentStatusBadge = ({ status }: { status: Order['paymentStatus'] }) => {
  const getPaymentConfig = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'paid':
        return { color: 'bg-green-100 text-green-800', label: 'Paid' };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', label: 'Failed' };
      case 'refunded':
        return { color: 'bg-gray-100 text-gray-800', label: 'Refunded' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  const { color, label } = getPaymentConfig(status);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const OrderCard = ({ order, onStatusChange, onViewDetails, onViewPhoto, isUpdating }: {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order['status']) => void;
  onViewDetails: (order: Order) => void;
  onViewPhoto: (imageUrl: string, customerName: string, message?: string) => void;
  isUpdating: boolean;
}) => {
  const formatPrice = (price: number) => `₹${price.toLocaleString()}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      {/* Mobile-first responsive header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">#{order.orderId}</h3>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">{order.customerInfo.fullName}</span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-lg sm:text-xl font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Customer and delivery info - Mobile optimized */}
      <div className="space-y-2 mb-4 text-xs sm:text-sm">
        <div className="flex items-start gap-2 text-gray-600">
          <Phone className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
          <span>{order.customerInfo.mobileNumber}</span>
        </div>

        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">
            {order.customerInfo.area}, {order.customerInfo.pinCode}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{formatDate(order.estimatedDeliveryDate)} at {order.timeSlot}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Package className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>
            {order.items.length} item{order.items.length > 1 ? 's' : ''}
            {order.addons && order.addons.length > 0 && (
              <span> + {order.addons.length} add-on{order.addons.length > 1 ? 's' : ''}</span>
            )}
          </span>
        </div>

        {order.paymentMethod && (
          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
          </div>
        )}
      </div>      {/* Photo Cake Display with Image Preview */}
      {order.items.some(item => item.customization?.type === 'photo-cake') && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-800 font-bold text-xs sm:text-sm">📸 PHOTO CAKE</span>
            <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
              Print Required
            </span>
          </div>
          
          {order.items
            .filter(item => item.customization?.type === 'photo-cake')
            .map((item, index) => (
              <div key={index} className="flex items-center gap-3 mb-2 last:mb-0">
                {/* Photo Preview */}                {item.customization?.imageUrl && item.customization.imageUrl !== '' && item.customization.imageUrl !== 'null' ? (                  <div 
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 border-purple-300 cursor-pointer hover:border-purple-500 transition-colors group"
                    onClick={() => {
                      const imageUrl = item.customization?.imageUrl;
                      console.log('🔍 Opening photo modal for image:', imageUrl?.substring(0, 50) + '...');
                      
                      if (imageUrl && imageUrl !== null && imageUrl !== '' && imageUrl !== 'null') {
                        onViewPhoto(imageUrl, order.customerInfo.fullName, item.customization?.message);
                      } else {
                        alert('❌ Image URL is invalid or missing. Please check if the image was uploaded correctly.');
                      }
                    }}
                    title="Click to view full image in modal"
                  >
                    <img
                      src={item.customization.imageUrl}
                      alt="Customer's photo for cake"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold">VIEW</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0 border-2 border-red-300 bg-red-50 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-red-600 text-xs font-bold block">NO</span>
                      <span className="text-red-600 text-xs font-bold">IMAGE</span>
                    </div>
                  </div>
                )}
                
                {/* Photo Details */}
                <div className="flex-1 min-w-0">                  <p className="text-purple-800 font-medium text-xs sm:text-sm truncate">{item.name}</p>
                  {item.customization?.message && (
                    <p className="text-purple-700 text-xs italic truncate" title={item.customization.message}>
                      � Name: "{item.customization.message}"
                    </p>
                  )}                  <p className="text-purple-600 text-xs font-medium">
                    {(item.customization?.imageUrl && item.customization.imageUrl !== '' && item.customization.imageUrl !== 'null')
                      ? "🖼️ Image ready - click to view and print" 
                      : "❌ Image missing - contact customer"}
                  </p>
                  
                  {/* Debug: Show raw image URL for troubleshooting */}
                  {item.customization?.imageUrl && (
                    <p className="text-xs text-gray-500 mt-1 break-all" title="Raw image URL for debugging">
                      URL: {item.customization.imageUrl.length > 50 
                        ? `${item.customization.imageUrl.substring(0, 50)}...`
                        : item.customization.imageUrl}
                    </p>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Special details - Mobile responsive */}
      {(order.customerInfo.deliveryOccasion || order.customerInfo.messageOnCard) && (
        <div className="bg-pink-50 rounded-lg p-2 sm:p-3 mb-4">
          {order.customerInfo.deliveryOccasion && (
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />
              <span className="text-xs sm:text-sm text-pink-800 font-medium">
                {order.customerInfo.deliveryOccasion}
              </span>
            </div>
          )}
          {order.customerInfo.messageOnCard && (
            <div className="flex items-start gap-2">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-pink-700 italic line-clamp-2">
                "{order.customerInfo.messageOnCard}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Order date and time */}
      <div className="text-xs text-gray-500 mb-4">
        Ordered: {formatDate(order.orderDate)} at {formatTime(order.orderDate)}
      </div>

      {/* Action buttons - Mobile optimized */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <select
          value={order.status}
          onChange={(e) => onStatusChange(order.orderId, e.target.value as Order['status'])}
          disabled={isUpdating}
          className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={() => onViewDetails(order)}
          className="bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-1 sm:gap-2"
        >
          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
};

const OrderDetailsModal = ({ order, onClose, onStatusUpdate, onViewPhoto }: {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => void;
  onViewPhoto: (imageUrl: string, customerName: string, message?: string) => void;
}) => {
  const formatPrice = (price: number) => `₹${price.toLocaleString()}`;
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header - Mobile optimized */}
        <div className="sticky top-0 bg-white p-4  border-b z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-600">#{order.orderId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">

          {/* Order Status and Quick Actions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <StatusBadge status={order.status} />
                <p className="text-sm text-gray-600 mt-1">
                  Ordered: {formatDateTime(order.orderDate)}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={order.status}
                  onChange={(e) => onStatusUpdate(order.orderId, e.target.value as Order['status'])}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Customer Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Name:</span> <span className="font-medium">{order.customerInfo.fullName}</span></p>
                <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{order.customerInfo.mobileNumber}</span></p>
                <p><span className="text-gray-600">Payment:</span>
                  <span className="ml-2">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </span>
                </p>
                <p><span className="text-gray-600">Method:</span> <span className="font-medium capitalize">{order.paymentMethod?.replace('_', ' ')}</span></p>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Date:</span> <span className="font-medium">{new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN')}</span></p>
                <p><span className="text-gray-600">Time:</span> <span className="font-medium">{order.timeSlot}</span></p>
                <p><span className="text-gray-600">Area:</span> <span className="font-medium">{order.customerInfo.area}</span></p>
                <p><span className="text-gray-600">PIN:</span> <span className="font-medium">{order.customerInfo.pinCode}</span></p>
              </div>
            </div>
          </div>

          {/* Full Delivery Address */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Complete Delivery Address
            </h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{order.customerInfo.fullAddress}</p>
          </div>

          {/* Special Instructions */}
          {(order.customerInfo.deliveryOccasion || order.customerInfo.relation || order.customerInfo.senderName || order.customerInfo.messageOnCard || order.customerInfo.specialInstructions) && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-pink-600" />
                Special Details
              </h3>
              <div className="bg-pink-50 rounded-lg p-4 space-y-3">
                {order.customerInfo.deliveryOccasion && (
                  <div>
                    <span className="text-sm font-medium text-pink-800">Occasion: </span>
                    <span className="text-sm text-pink-700">{order.customerInfo.deliveryOccasion}</span>
                  </div>
                )}
                {order.customerInfo.relation && (
                  <div>
                    <span className="text-sm font-medium text-pink-800">Relation: </span>
                    <span className="text-sm text-pink-700">{order.customerInfo.relation}</span>
                  </div>
                )}
                {order.customerInfo.senderName && (
                  <div>
                    <span className="text-sm font-medium text-pink-800">From: </span>
                    <span className="text-sm text-pink-700">{order.customerInfo.senderName}</span>
                  </div>
                )}
                {order.customerInfo.messageOnCard && (
                  <div className="bg-white rounded p-3 border-l-4 border-pink-400">
                    <span className="text-sm font-medium text-pink-800 flex items-center gap-1 mb-1">
                      <Heart className="w-3 h-3" />
                      Message on Card:
                    </span>
                    <p className="text-sm text-pink-700 italic">"{order.customerInfo.messageOnCard}"</p>
                  </div>
                )}
                {order.customerInfo.specialInstructions && (
                  <div>
                    <span className="text-sm font-medium text-pink-800">Special Instructions: </span>
                    <span className="text-sm text-pink-700">{order.customerInfo.specialInstructions}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Order Items ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      {item.selectedWeight && <span>Weight: {item.selectedWeight}</span>}
                      <span>Qty: {item.quantity}</span>
                      <span className="font-medium">₹{item.price} each</span>
                    </div>
                      {/* Photo Cake Customization Display - Only for Photo Cakes */}
                    {item.customization?.type === 'photo-cake' && (
                      <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-purple-800 font-semibold text-xs">📸 PHOTO CAKE</span>
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">Custom Print Required</span>
                        </div>                        <div className="flex items-start gap-3">                          {item.customization.imageUrl && item.customization.imageUrl !== '' && item.customization.imageUrl !== 'null' ? (                            <div 
                              className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 border-purple-300 cursor-pointer hover:border-purple-500 transition-colors group"
                              onClick={() => {
                                const imageUrl = item.customization?.imageUrl;
                                console.log('🔍 Opening photo modal for image:', imageUrl?.substring(0, 50) + '...');
                                
                                if (imageUrl && imageUrl !== null && imageUrl !== '' && imageUrl !== 'null') {
                                  onViewPhoto(imageUrl, order.customerInfo.fullName, item.customization?.message);
                                } else {
                                  alert('❌ Image URL is invalid or missing. Please check if the image was uploaded correctly.');
                                }
                              }}
                              title="Click to view full image in modal"
                            >
                              <img
                                src={item.customization.imageUrl}
                                alt="Customer's photo for cake"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold">VIEW</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-red-300 bg-red-50 flex items-center justify-center">
                              <div className="text-center">
                                <span className="text-red-600 text-xs font-bold">NO</span>
                                <span className="text-red-600 text-xs font-bold">IMAGE</span>
                              </div>
                            </div>
                          )}                          <div className="flex-1">
                            {item.customization.message && (
                              <p className="text-purple-700 text-xs italic mb-1">� Name: "{item.customization.message}"</p>
                            )}                            <p className="text-purple-600 text-xs font-medium">
                              {(item.customization.imageUrl && item.customization.imageUrl !== '' && item.customization.imageUrl !== 'null')
                                ? "🖼️ Click image to view full size and print - Print this photo on the cake" 
                                : "❌ Customer photo failed to upload - please contact customer"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{formatPrice((item.discountedPrice || item.price) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Add-ons */}
          {order.addons && order.addons.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Add-ons ({order.addons.length})
              </h3>
              <div className="space-y-3">
                {order.addons.map((addon, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-pink-50">
                    {addon.image ? (
                      <img
                        src={addon.image}
                        alt={addon.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-200 rounded-lg flex items-center justify-center">
                        <Gift className="w-6 h-6 text-pink-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{addon.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <span>Qty: {addon.quantity}</span>
                        <span className="font-medium">₹{addon.price} each</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{formatPrice(addon.price * addon.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Order Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatPrice(order.subtotal || 0)}</span>
                </div>

                {
                  order.addons && order.addons.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Add-ons:</span>
                      <span>{formatPrice(order.addons.reduce((total, addon) => total + (addon.price * addon.quantity), 0))}</span>
                    </div>
                  )
                }

                {order.deliveryCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charge:</span>
                    <span>{formatPrice(order.deliveryCharge)}</span>
                  </div>
                )}




                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Total Amount :</span>
                  <span className="text-orange-600">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Order Notes
              </h3>
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Photo View Modal Component
const PhotoViewModal = ({ imageUrl, customerName, message, onClose }: {
  imageUrl: string;
  customerName: string;
  message?: string;
  onClose: () => void;
}) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Photo Cake - ${customerName}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .image-container {
                max-width: 100%;
                text-align: center;
              }
              img {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
              }
              .message {
                margin-top: 20px;
                padding: 10px;
                background: #f0f0f0;
                border-radius: 5px;
                font-style: italic;
              }
              @media print {
                .no-print { display: none; }
                body { padding: 0; }
                img { max-height: 90vh; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Photo Cake for ${customerName}</h2>
              ${message ? `<p class="message">Message: "${message}"</p>` : ''}
            </div>
            <div class="image-container">
              <img src="${imageUrl}" alt="Photo Cake Image" />
            </div>
            <div class="no-print" style="margin-top: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Image</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl max-h-[95vh] w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-purple-50">
          <div>
            <h3 className="text-lg font-semibold text-purple-900">📸 Photo Cake Image</h3>
            <p className="text-sm text-purple-700">Customer: {customerName}</p>
            {message && (
              <p className="text-sm text-purple-600 italic">Message: "{message}"</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Image
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="p-4 max-h-[80vh] overflow-auto">
          <div className="text-center">
            <img
              src={imageUrl}
              alt="Photo Cake Image"
              className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg"
              onError={(e) => {
                console.error('Failed to load image:', imageUrl);
                e.currentTarget.src = '/placeholder-cake.jpg';
              }}
            />
          </div>
          
          {/* Instructions */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-1">📋 Printing Instructions:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Click "Print Image" button to open print preview</li>
              <li>• Ensure image prints at actual size for best quality</li>
              <li>• Use photo paper for edible printing if available</li>
              <li>• Check image orientation before printing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminOrders() {
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    imageUrl: string;
    customerName: string;
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsPerPage] = useState(20); // Fixed at 5 items per page for testing
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0
  });
  // Fetch orders from API
  const fetchOrders = async (page = currentPage, showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setRefreshing(!showLoader);

      const response = await fetch(`/api/orders?limit=${itemsPerPage}&page=${page}`);
      const data = await response.json();       if (data.success) {        // Debug: Log photo cake items to see their structure
        data.orders.forEach((order: any) => {
          const photoCakeItems = order.items.filter((item: any) => item.customization?.type === 'photo-cake');
          if (photoCakeItems.length > 0) {
            console.log(`🔍 Order ${order.orderId} has ${photoCakeItems.length} photo cake(s):`, 
              photoCakeItems.map((item: any) => ({
                name: item.name,
                hasImageUrl: !!item.customization?.imageUrl,
                imageUrl: item.customization?.imageUrl,
                imageUrlType: typeof item.customization?.imageUrl,
                message: item.customization?.message
              }))
            );
          }
        });
        
        setOrders(data.orders);
        setFilteredOrders(data.orders);
        
        if (data.pagination) {
          setTotalOrders(data.pagination.totalOrders);
          setTotalPages(data.pagination.totalPages);
          setCurrentPage(data.pagination.currentPage);
        } else {
          setTotalOrders(data.total || data.orders.length);
          setTotalPages(data.totalPages || Math.ceil((data.total || data.orders.length) / itemsPerPage));
          setCurrentPage(page);
        }

        // Calculate stats
        const newStats = data.orders.reduce((acc: any, order: Order) => {
          acc.total++;
          acc[order.status]++;
          return acc;
        }, {
          total: 0,
          pending: 0,
          confirmed: 0,
          preparing: 0,
          out_for_delivery: 0,
          delivered: 0,
          cancelled: 0
        });

        setStats(newStats);
      } else {
        showError('Failed to fetch orders', data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to fetch orders', 'Please check your connection and try again');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(searchLower) ||
        order.customerInfo.fullName.toLowerCase().includes(searchLower) ||
        order.customerInfo.mobileNumber.includes(searchTerm) ||
        order.customerInfo.area.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      setUpdating(true);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setOrders(prev => prev.map(order =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        ));

        // Update selected order if it's the one being updated
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }

        showSuccess(
          'Order status updated!',
          `Order #${orderId} status changed to ${newStatus.replace('_', ' ')}`
        );        // Refresh stats
        fetchOrders(currentPage, false);
      } else {
        showError('Failed to update order', data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Failed to update order', 'Please check your connection and try again');
    } finally {
      setUpdating(false);
    }
  };
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleViewPhoto = (imageUrl: string, customerName: string, message?: string) => {
    setSelectedPhoto({
      imageUrl,
      customerName,
      message
    });
  };

  // Pagination functions
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      fetchOrders(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      fetchOrders(newPage);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      fetchOrders(page);
    }
  };
  const handleRefresh = () => {
    fetchOrders(currentPage, false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading orders...</p>
          <p className="text-gray-500 text-sm">Fetching latest order data from database</p>
        </div>
      </div>
    );
  }

  const statuses = ['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header with Stats */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders Management</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage and track all customer orders</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats Grid - Mobile optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
              <p className="text-xs sm:text-sm text-gray-600">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 shadow-sm border border-yellow-200">
              <p className="text-xs sm:text-sm text-yellow-700">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-800">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-700">Confirmed</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-800">{stats.confirmed}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 shadow-sm border border-purple-200">
              <p className="text-xs sm:text-sm text-purple-700">Preparing</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-800">{stats.preparing}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 sm:p-4 shadow-sm border border-orange-200">
              <p className="text-xs sm:text-sm text-orange-700">Out</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-800">{stats.out_for_delivery}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 shadow-sm border border-green-200">
              <p className="text-xs sm:text-sm text-green-700">Delivered</p>
              <p className="text-lg sm:text-2xl font-bold text-green-800">{stats.delivered}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 sm:p-4 shadow-sm border border-red-200">
              <p className="text-xs sm:text-sm text-red-700">Cancelled</p>
              <p className="text-lg sm:text-2xl font-bold text-red-800">{stats.cancelled}</p>
            </div>
          </div>
        </div>

        {/* Filters - Mobile optimized */}
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, phone, or area..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">            {filteredOrders.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
                onViewPhoto={handleViewPhoto}
                isUpdating={updating}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {orders.length === 0 ? 'No orders yet' : 'No orders found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {orders.length === 0
                ? 'Orders will appear here when customers place them.'
                : searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No orders match your current filters.'
              }
            </p>
            {orders.length === 0 && (
              <button
                onClick={handleRefresh}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                Refresh Orders
              </button>
            )}
          </div>
        )}        {/* Pagination - Compact and stylish */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || refreshing}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Page</span>
              <select
                value={currentPage}
                onChange={(e) => handlePageClick(Number(e.target.value))}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
              >
                {[...Array(totalPages)].map((_, index) => (
                  <option key={index} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500">of {totalPages}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || refreshing}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </main>      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusChange}
          onViewPhoto={handleViewPhoto}
        />
      )}

      {/* Photo View Modal */}
      {selectedPhoto && (
        <PhotoViewModal
          imageUrl={selectedPhoto.imageUrl}
          customerName={selectedPhoto.customerName}
          message={selectedPhoto.message}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}
