// Debug version of PaymentStep.tsx with detailed console logs
// This shows exactly what happens at each step

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { usePayment } from '@/hooks/usePayment';
import { formatPrice } from '@/utils/calculations';
import { ArrowLeft, CreditCard, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const PaymentStep: React.FC = () => {
  const { clearCart } = useCart();
  const { state, goToPreviousStep } = useCheckout();
  const { initiatePayment, loading } = usePayment();
  const router = useRouter();

  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('online');

  // STEP 1: Load pending order from localStorage
  useEffect(() => {
    console.log('🔍 STEP 1: Loading pending order from localStorage...');
    
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('pending-order');
      console.log('📦 Raw localStorage data:', saved);
      
      if (saved) {
        const order = JSON.parse(saved);
        setPendingOrder(order);
        console.log('✅ STEP 1 SUCCESS: Pending order loaded:', {
          orderId: order.orderId,
          customerId: order._id,
          totalAmount: order.totalAmount,
          customerName: order.customerInfo?.fullName,
          items: order.items?.length
        });
      } else {
        console.error('❌ STEP 1 ERROR: No pending order found in localStorage');
        goToPreviousStep();
      }
    } catch (error) {
      console.error('❌ STEP 1 ERROR: Failed to parse pending order:', error);
      goToPreviousStep();
    }
  }, [goToPreviousStep]);

  // STEP 2: Handle payment method selection
  const handlePaymentMethodChange = (method: string) => {
    console.log(`💳 STEP 2: Payment method changed to: ${method}`);
    setSelectedPaymentMethod(method);
    
    // Recalculate amounts
    const originalAmount = pendingOrder?.totalAmount || 0;
    const discount = method === 'online' ? Math.round(originalAmount * 0.02) : 0;
    const finalAmount = originalAmount - discount;
    
    console.log('💰 Price calculation:', {
      originalAmount,
      discount,
      finalAmount,
      method
    });
  };

  // STEP 3: Handle payment button click
  const handlePayment = async () => {
    console.log('🚀 STEP 3: Payment button clicked');
    
    if (!pendingOrder) {
      console.error('❌ STEP 3 ERROR: No pending order found');
      return;
    }

    console.log('📋 STEP 3: Payment details:', {
      orderId: pendingOrder._id,
      paymentMethod: selectedPaymentMethod,
      customerInfo: pendingOrder.customerInfo,
      totalAmount: pendingOrder.totalAmount
    });

    const customerInfo = pendingOrder.customerInfo;
    
    // STEP 4: Call payment hook
    console.log('🔄 STEP 4: Calling initiatePayment...');
    
    await initiatePayment(
      pendingOrder._id,
      selectedPaymentMethod,
      customerInfo,
      // SUCCESS CALLBACK
      (orderDetails, notifications) => {
        console.log('🎉 STEP 5: Payment SUCCESS callback triggered');
        console.log('📄 Order details received:', orderDetails);
        console.log('📱 Notifications:', notifications);

        // Clear cart and localStorage
        console.log('🧹 STEP 6: Cleaning up cart and localStorage...');
        clearCart();
        localStorage.removeItem('pending-order');
        localStorage.removeItem('bakingo-selected-addons');
        localStorage.removeItem('bakingo-addon-quantities');
        console.log('✅ STEP 6: Cleanup completed');

        // Redirect to confirmation
        console.log(`🔄 STEP 7: Redirecting to order confirmation: ${orderDetails.orderId}`);
        router.push(`/order-confirmation?orderId=${orderDetails.orderId}`);
      },
      // ERROR CALLBACK
      (error) => {
        console.error('❌ STEP 5: Payment ERROR callback triggered');
        console.error('Error details:', error);
        alert(`Payment failed: ${error}`);
      }
    );
  };

  // Loading state
  if (!pendingOrder) {
    console.log('⏳ Waiting for pending order to load...');
    return (
      <div className="p-6 text-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  // Calculate amounts for display
  const originalAmount = pendingOrder.totalAmount;
  const onlineDiscount = selectedPaymentMethod === 'online' ? Math.round(originalAmount * 0.02) : 0;
  const finalAmount = originalAmount - onlineDiscount;

  console.log('💰 Current pricing display:', {
    originalAmount,
    onlineDiscount,
    finalAmount,
    selectedMethod: selectedPaymentMethod
  });

  return (
    <div className="p-3 md:p-6">
      {/* Debug Info */}
      <div className="mb-4 p-3 bg-blue-50 rounded border">
        <h4 className="font-bold text-blue-800">🐛 DEBUG INFO:</h4>
        <p><strong>Order ID:</strong> {pendingOrder.orderId}</p>
        <p><strong>Database ID:</strong> {pendingOrder._id}</p>
        <p><strong>Customer:</strong> {pendingOrder.customerInfo?.fullName}</p>
        <p><strong>Payment Method:</strong> {selectedPaymentMethod}</p>
        <p><strong>Original Amount:</strong> ₹{originalAmount}</p>
        <p><strong>Discount:</strong> ₹{onlineDiscount}</p>
        <p><strong>Final Amount:</strong> ₹{finalAmount}</p>
      </div>

      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">Payment</h2>
        <p className="text-sm md:text-base text-gray-600">Choose your payment method and complete your order</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 md:gap-6">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Payment Method</h3>

            <div className="space-y-2 md:space-y-3">
              {/* Online Payment */}
              <label className="flex items-center p-3 md:p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={selectedPaymentMethod === 'online'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  className="mr-3 md:mr-4"
                />
                <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-2 md:mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-sm md:text-base">Online Payment</div>
                  <div className="text-xs md:text-sm text-gray-600">UPI, Card, Net Banking</div>
                  <div className="text-xs md:text-sm text-green-600 font-medium">Save 2% with online payment!</div>
                </div>              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Order Summary</h3>

            <div className="space-y-2 text-sm md:text-base">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-medium">{pendingOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Items Total:</span>
                <span>{formatPrice(pendingOrder.totalAmount)}</span>
              </div>
              {selectedPaymentMethod === 'online' && onlineDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Online Discount (2%):</span>
                  <span>-{formatPrice(onlineDiscount)}</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-pink-600">{formatPrice(finalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side order details */}
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
          </div>

          <div className="mt-4 p-3 bg-white rounded border border-pink-200">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Amount to Pay:</div>
            <div className="text-lg md:text-xl font-bold text-pink-600">{formatPrice(finalAmount)}</div>
            {selectedPaymentMethod === 'online' && onlineDiscount > 0 && (
              <div className="text-xs text-green-600">You save {formatPrice(onlineDiscount)}!</div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <button
          onClick={() => {
            console.log('🔄 Going back to previous step');
            goToPreviousStep();
          }}
          className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base w-full md:w-auto"
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          <span>Back to Cart Review</span>
        </button>

        <button
          onClick={() => {
            console.log('🔥 PAY NOW BUTTON CLICKED!');
            handlePayment();
          }}
          disabled={loading}
          className="px-6 md:px-8 py-2 md:py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium text-sm md:text-base w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Processing...' : selectedPaymentMethod === 'online' ? '💳 Pay Now' : '📦 Place Order'}        
        </button>
      </div>
    </div>
  );
};
