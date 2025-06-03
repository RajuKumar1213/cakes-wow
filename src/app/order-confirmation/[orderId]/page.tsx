'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar,
  Package,
  ArrowLeft,
  Copy,
  Share2
} from 'lucide-react';
import { getOrderStatusInfo } from '@/lib/orderUtils';

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
  orderId: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  orderDate: string;
  estimatedDeliveryDate: string;
  timeSlot: string;
  notes?: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  const orderId = params.orderId as string;

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders?orderId=${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order details');
      }      if (data.orders && data.orders.length > 0) {
        setOrder(data.orders[0]);
      } else {
        showError('Order not found', 'The requested order could not be found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      showError('Failed to load order details', 'There was an error loading your order');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = async () => {
    if (!order) return;
    
    setCopying(true);
  try {
      await navigator.clipboard.writeText(order.orderId);
      showSuccess('Order ID copied to clipboard', 'You can use this ID for order tracking');
    } catch (error) {
      showError('Failed to copy order ID', 'Please try again or copy manually');
    } finally {
      setCopying(false);
    }
  };

  const shareOrder = async () => {
    if (!order) return;

    const shareData = {
      title: 'Bakingo Order Confirmation',
      text: `Order ${order.orderId} placed successfully! Total: ₹${order.totalAmount}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        showSuccess('Order link copied to clipboard', 'You can share this link with others');
      } catch (error) {
        showError('Failed to copy order link', 'Please try again or copy manually from your address bar');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-4">
              Thank you for your order. We'll start preparing your delicious cake right away.
            </p>
            
            {/* Order ID */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl font-mono font-bold text-gray-900">
                  {order.orderId}
                </span>
                <button
                  onClick={copyOrderId}
                  disabled={copying}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy Order ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.icon} {statusInfo.label}
              </span>
            </div>

            {/* Share Button */}
            <button
              onClick={shareOrder}
              className="inline-flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Order</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={item.imageUrl || '/placeholder-cake.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.selectedWeight && (
                        <p className="text-sm text-gray-600">Weight: {item.selectedWeight}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Delivery Date</p>
                    <p className="font-medium">{formatDate(order.customerInfo.deliveryDate)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Time Slot</p>
                    <p className="font-medium">{order.customerInfo.timeSlot}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="font-medium">{order.customerInfo.fullName}</p>
                    <p className="text-sm text-gray-700">{order.customerInfo.fullAddress}</p>
                    <p className="text-sm text-gray-700">
                      {order.customerInfo.area}, {order.customerInfo.pinCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Contact Number</p>
                    <p className="font-medium">{order.customerInfo.mobileNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Date</span>
                  <span>{formatDate(order.orderDate)} at {formatTime(order.orderDate)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="capitalize">{order.paymentStatus}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span>Cash on Delivery</span>
                </div>
                
                {order.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">Special Instructions</p>
                    <p className="text-sm mt-1">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/"
                className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-700 transition-colors text-center block"
              >
                Continue Shopping
              </Link>
              
              <Link
                href="/orders"
                className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Order Status Description */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              {statusInfo.description} We'll send you updates via SMS as your order progresses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
