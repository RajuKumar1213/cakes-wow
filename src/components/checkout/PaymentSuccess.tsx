import React from 'react';
import { CheckCircle, Package, Clock, Phone, MapPin, Calendar, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

interface PaymentSuccessProps {
  orderDetails: {
    orderId: string;
    customerName: string;
    totalAmount: number;
    estimatedDeliveryDate: string;
    timeSlot: string;
    paymentStatus: string;
    status: string;
  };
  notifications?: {
    customer?: {
      phone: string;
      message: string;
    };
    admin?: {
      message: string;
    };
  };
  onClose: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ orderDetails, notifications, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleWhatsAppClick = () => {
    if (notifications?.customer) {
      const whatsappUrl = sendWhatsAppMessage(
        notifications.customer.phone,
        notifications.customer.message
      );
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-green-100">Your order has been confirmed</p>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-4">
          {/* Order ID */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="text-xl font-bold text-gray-900">{orderDetails.orderId}</p>
          </div>

          {/* Customer Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Order for</p>
                <p className="font-semibold text-gray-900">{orderDetails.customerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-gray-900">₹{orderDetails.totalAmount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Date</p>
                <p className="font-semibold text-gray-900">{formatDate(orderDetails.estimatedDeliveryDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Slot</p>
                <p className="font-semibold text-gray-900">{orderDetails.timeSlot}</p>
              </div>
            </div>
          </div>

          {/* Delivery Message */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Your Order is Confirmed!</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  🎉 Thank you for your order! Your delicious cake will be freshly prepared and delivered to you within the selected time slot. You'll receive updates on your order status soon.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-gray-600" />
              <p className="text-sm font-medium text-gray-900">Need Help?</p>
            </div>
            <p className="text-sm text-gray-600">
              Contact us at <span className="font-medium text-blue-600">+91 9876543210</span> for any queries about your order.
            </p>
          </div>          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {/* WhatsApp Confirmation Button */}
            {notifications?.customer && (
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Get Order Details on WhatsApp
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => window.location.href = '/orders'}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Track Your Order
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
