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
  Share2,
  Truck,
  Heart,
  Star,
  MessageCircle,
  Gift,
  User,
  Timer,
  Shield,
  Award,
  ChefHat,
  Sparkles
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
  deliveryOccasion?: string;
  relation?: string;
  senderName?: string;
  messageOnCard?: string;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
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
      } if (data.orders && data.orders.length > 0) {
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
    } else {
      // Fallback to copying URL
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
          <h1 className="font-poppins text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-300/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Success Header with Animation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="text-center">
            {/* Success Animation */}
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto animate-ping opacity-20"></div>
              {/* Floating sparkles */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: '0s' }} />
              </div>
              <div className="absolute top-4 right-8">
                <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="absolute bottom-4 left-8">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-3">
              🎉 Order Placed Successfully!
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Thank you for choosing CakesWow! Your delicious cake will be freshly prepared with love and delivered to you.
            </p>

            {/* Order ID with Enhanced Design */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
              <p className="text-sm text-blue-600 mb-2 font-medium">Order ID</p>
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl font-mono font-bold text-blue-900 tracking-wider">
                  {order.orderId}
                </span>
                <button
                  onClick={copyOrderId}
                  disabled={copying}
                  className="p-2 text-blue-500 hover:text-blue-700 transition-colors hover:bg-blue-100 rounded-lg"
                  title="Copy Order ID"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-blue-500 mt-2">Save this ID for order tracking</p>
            </div>

            {/* Status Badge with Animation */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color} shadow-lg animate-pulse`}>
                {statusInfo.icon} {statusInfo.label}
              </span>
            </div>

            {/* Share Button */}
            <button
              onClick={shareOrder}
              className="inline-flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-lg"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Order</span>
            </button>
          </div>
        </div>

        {/* BDS Delivery Service Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">BDS Delivery Service</h2>
                <p className="text-sm text-gray-600">Your trusted delivery partner</p>
              </div>
            </div>
          </div>

          {/* Delivery Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Safe Delivery</h3>
              </div>
              <p className="text-sm text-green-700">Temperature-controlled vehicles ensure your cake arrives fresh</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Timer className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">On-Time Delivery</h3>
              </div>
              <p className="text-sm text-blue-700">Professional delivery team committed to punctuality</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Premium Service</h3>
              </div>
              <p className="text-sm text-purple-700">Careful handling with love and attention to detail</p>
            </div>
          </div>

          {/* Delivery Timeline */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6 border border-orange-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Delivery Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Delivery Date</p>
                  <p className="text-sm text-gray-600">{formatDate(order.customerInfo.deliveryDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Time Slot</p>
                  <p className="text-sm text-gray-600">{order.customerInfo.timeSlot}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-orange-600" />
                Your Delicious Order
              </h2>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-orange-200">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg">
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
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Weight: {item.selectedWeight}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-xl font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200">
                  <span>Total Amount</span>
                  <span className="text-pink-600">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-600" />
                Delivery Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Delivery Date</p>
                    <p className="font-medium text-blue-900">{formatDate(order.customerInfo.deliveryDate)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <Clock className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Time Slot</p>
                    <p className="font-medium text-green-900">{order.customerInfo.timeSlot}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Delivery Address</p>
                    <p className="font-medium text-purple-900">{order.customerInfo.fullName}</p>
                    <p className="text-sm text-purple-700">{order.customerInfo.fullAddress}</p>
                    <p className="text-sm text-purple-700">
                      {order.customerInfo.area}, {order.customerInfo.pinCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <Phone className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Contact Number</p>
                    <p className="font-medium text-orange-900">{order.customerInfo.mobileNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Details */}
            {(order.customerInfo.deliveryOccasion || order.customerInfo.relation || order.customerInfo.senderName || order.customerInfo.messageOnCard || order.notes) && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Special Details
                </h3>

                <div className="space-y-3">
                  {order.customerInfo.deliveryOccasion && (
                    <div className="p-3 bg-pink-50 rounded-lg">
                      <p className="text-sm text-pink-600 font-medium">Occasion</p>
                      <p className="text-pink-900">{order.customerInfo.deliveryOccasion}</p>
                    </div>
                  )}

                  {order.customerInfo.relation && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Relation</p>
                      <p className="text-blue-900">{order.customerInfo.relation}</p>
                    </div>
                  )}

                  {order.customerInfo.senderName && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">From</p>
                      <p className="text-green-900">{order.customerInfo.senderName}</p>
                    </div>
                  )}

                  {order.customerInfo.messageOnCard && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Message on Card
                      </p>
                      <p className="text-purple-900 italic">"{order.customerInfo.messageOnCard}"</p>
                    </div>
                  )}

                  {order.notes && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600 font-medium">Special Instructions</p>
                      <p className="text-orange-900">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Date</span>
                  <span>{formatDate(order.orderDate)} at {formatTime(order.orderDate)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="capitalize font-medium text-green-600">{order.paymentStatus}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span>{order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/"
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-center block"
              >
                Continue Shopping
              </Link>

              <Link
                href="/orders"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-center block"
              >
                Track Your Orders
              </Link>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            What's Next?
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Your Order Journey</h4>
                <p className="text-blue-800 text-sm leading-relaxed mb-4">
                  {statusInfo.description} Our expert bakers are already getting ready to create your perfect cake with the finest ingredients and utmost care.
                </p>
                <div className="flex items-center gap-2 text-blue-700 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>We'll send you updates via SMS as your order progresses</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl shadow-xl p-6 border border-orange-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center justify-center gap-2">
              <Phone className="w-5 h-5 text-orange-600" />
              Need Help?
            </h3>
            <p className="text-gray-700 mb-4">
              Our customer support team is here to help you with any questions about your order.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-lg">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900">+91 9876543210</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-lg">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">support@cakeswow.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
