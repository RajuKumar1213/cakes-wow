import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { usePayment } from '@/hooks/usePayment';
import { formatPrice } from '@/utils/calculations';
import { ArrowLeft, CreditCard, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PaymentError } from './PaymentError';

export const PaymentStep: React.FC = () => {
  const { clearCart } = useCart();
  const { state, goToPreviousStep } = useCheckout();
  const { initiatePayment, loading } = usePayment();
  const router = useRouter();
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('online');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showPaymentError, setShowPaymentError] = useState<boolean>(false);
  // Load pending order from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadPendingOrder = () => {
      try {
        const saved = localStorage.getItem('pending-order');
        console.log('🔍 Checking localStorage for pending-order:', !!saved);
        
        if (saved) {
          const order = JSON.parse(saved);
          console.log('📋 Found pending order:', order.orderId);
          setPendingOrder(order);
          return true;
        } else {
          console.log('⏳ No pending order found in localStorage');
          return false;
        }
      } catch (error) {
        console.error('❌ Error parsing pending order:', error);
        return false;
      }
    };

    // Try to load immediately
    if (!loadPendingOrder()) {
      console.log('⏳ Order not found immediately, waiting for order creation to complete...');
      
      // Wait longer for order creation to complete
      setTimeout(() => {
        if (!loadPendingOrder()) {
          console.log('⏳ Still no order found, retrying once more...');
          
          // Final retry after even longer delay
          setTimeout(() => {
            if (!loadPendingOrder()) {
              console.error('❌ No pending order found after all retries, redirecting back');
              goToPreviousStep();
            }
          }, 3000); // 3 second final delay
        }
      }, 2000); // 2 second initial delay
    }
  }, [goToPreviousStep]);
  const handlePayment = async () => {
    if (!pendingOrder) {
      console.error('No pending order found');
      return;
    }    // Debug: Log the pending order structure
    console.log('🔍 Pending Order Structure:', {
      id: pendingOrder.id,
      _id: pendingOrder._id,
      orderId: pendingOrder.orderId,
      totalAmount: pendingOrder.totalAmount,
      customerInfo: pendingOrder.customerInfo
    });

    const customerInfo = pendingOrder.customerInfo;
    // Use the MongoDB document ID (this is what the API expects)
    const orderIdToSend = pendingOrder.id || pendingOrder._id;

    console.log('📤 Sending to API:', {
      orderId: orderIdToSend,
      paymentMethod: selectedPaymentMethod
    });

    await initiatePayment(
      orderIdToSend,
      selectedPaymentMethod,
      customerInfo,
      (orderDetails, notifications) => {
        console.log('Payment successful:', orderDetails);        // Clear cart and localStorage
        clearCart();
        localStorage.removeItem('pending-order');
        localStorage.removeItem('bakingo-selected-addons');
        localStorage.removeItem('bakingo-addon-quantities');
        
        // Direct redirect to order confirmation page (no intermediate steps)
        window.location.href = `/order-confirmation/${orderDetails.orderId}`;
      },
      (error) => {
        console.error('Payment failed:', error);
        setPaymentError(error);
        setShowPaymentError(true);
      }
    );
  };

  const handleRetryPayment = () => {
    setShowPaymentError(false);
    setPaymentError(null);
    // The user can try again with the same order
  };

  const handleBackToCheckout = () => {
    setShowPaymentError(false);
    setPaymentError(null);
    goToPreviousStep();
  };

  if (!pendingOrder) {
    return (
      <div className="p-6 text-center">
        <p>Loading order details...</p>
      </div>
    );
  }
  // Use the total amount directly (no discount)
  const finalAmount = pendingOrder.totalAmount;

  return (
    <div className="p-3 md:p-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">Payment</h2>
        <p className="text-sm md:text-base text-gray-600">Choose your payment method and complete your order</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 md:gap-6">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Payment Method</h3>            <div className="space-y-2 md:space-y-3">
              {/* Online Payment */}
              <label className="flex items-center p-3 md:p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={selectedPaymentMethod === 'online'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="mr-3 md:mr-4"
                />
                <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-2 md:mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-sm md:text-base">Online Payment</div>
                  <div className="text-xs md:text-sm text-gray-600">UPI, Card, Net Banking</div>
                
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Order Summary</h3>

            <div className="space-y-2 text-sm md:text-base">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-medium">{pendingOrder.orderId}</span>
              </div>              <div className="flex justify-between">
                <span>Items Total:</span>
                <span>{formatPrice(pendingOrder.totalAmount)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-pink-600">{formatPrice(finalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Order Summary (Right Side) */}
        <div className="bg-gray-50 rounded-lg p-3 md:p-4 h-fit">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Order Details</h3>

          <div className="space-y-2 text-xs md:text-sm">
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-medium">{pendingOrder.customerInfo.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span>Mobile:</span>
              <span>{pendingOrder.customerInfo.mobileNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Date:</span>
              <span>{new Date(pendingOrder.customerInfo.deliveryDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Time Slot:</span>
              <span>{pendingOrder.customerInfo.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span>Area:</span>
              <span>{pendingOrder.customerInfo.area}</span>
            </div>
          </div>          <div className="mt-4 p-3 bg-white rounded border border-pink-200">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Amount to Pay:</div>
            <div className="text-lg md:text-xl font-bold text-pink-600">{formatPrice(finalAmount)}</div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <button
          onClick={goToPreviousStep}
          className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base w-full md:w-auto"
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          <span>Back to Cart Review</span>
        </button>        <button
          onClick={handlePayment}
          disabled={loading}
          className="px-6 md:px-8 py-2 md:py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium text-sm md:text-base w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>

      {/* Payment Error Modal */}
      {showPaymentError && paymentError && (
        <PaymentError
          error={paymentError}
          onRetry={handleRetryPayment}
          onBack={handleBackToCheckout}
        />
      )}
    </div>
  );
};
