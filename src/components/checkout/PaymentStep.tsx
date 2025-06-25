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
  const router = useRouter();  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('online');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showPaymentError, setShowPaymentError] = useState<boolean>(false);
  const [fetchingOrder, setFetchingOrder] = useState<boolean>(false);
  
  // Function to fetch order data from API
  const fetchOrderData = async (orderId: string) => {
    try {
      setFetchingOrder(true);
      console.log('🔍 Fetching order data for ID:', orderId);
      
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order data');
      }
      
      const result = await response.json();
      
      if (result.success && result.order) {
        console.log('✅ Order data fetched successfully:', result.order);
        setPendingOrder(result.order);
        return true;
      } else {
        console.error('❌ Order not found in API response');
        return false;
      }
    } catch (error) {
      console.error('❌ Error fetching order data:', error);
      return false;
    } finally {
      setFetchingOrder(false);
    }
  };  // Load pending order from localStorage or fetch from API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadPendingOrder = async () => {
      try {
        const saved = localStorage.getItem('pending-order');
        const orderId = localStorage.getItem('current-order-id');
        console.log('🔍 Checking localStorage for pending-order:', !!saved);
        console.log('🔍 Checking localStorage for current-order-id:', orderId);
        
        // First try to use the saved order data
        if (saved) {
          const order = JSON.parse(saved);
          console.log('📋 Found pending order in localStorage:', order.orderId);
          
          // Check if the order has all required data
          if (order.totalAmount && order.customerInfo && order.items) {
            setPendingOrder(order);
            return true;
          } else {
            console.log('📋 Order data incomplete, fetching from API...');
            // If incomplete, try to fetch from API using the orderId
            if (order.orderId) {
              return await fetchOrderData(order.orderId);
            }
          }
        }
        
        // If no saved order but we have an orderId, fetch from API
        if (orderId) {
          console.log('📋 Found order ID, fetching complete data from API...');
          return await fetchOrderData(orderId);
        }
        
        console.log('⏳ No pending order found in localStorage');
        return false;
      } catch (error) {
        console.error('❌ Error loading pending order:', error);
        return false;
      }
    };

    // Try to load immediately
    loadPendingOrder().then(success => {
      if (!success) {
        console.log('⏳ Order not found immediately, waiting for order creation to complete...');
        
        // Wait longer for order creation to complete
        setTimeout(() => {
          loadPendingOrder().then(success => {
            if (!success) {
              console.log('⏳ Still no order found, retrying once more...');
              
              // Final retry after even longer delay
              setTimeout(() => {
                loadPendingOrder().then(success => {
                  if (!success) {
                    console.error('❌ No pending order found after all retries, redirecting back');
                    goToPreviousStep();
                  }
                });
              }, 3000); // 3 second final delay
            }
          });
        }, 2000); // 2 second initial delay
      }
    });
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
        console.log('Payment successful:', orderDetails);        // Clear cart and localStorage thoroughly
        clearCart();
        localStorage.removeItem('pending-order');
        localStorage.removeItem('bakingo-selected-addons');
        localStorage.removeItem('bakingo-addon-quantities');
        localStorage.removeItem('bakingo-cart');
        localStorage.removeItem('bakingo-wishlist');
        
        // Also clear any other temporary checkout data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('checkout-') || key.startsWith('order-')) {
            localStorage.removeItem(key);
          }
        });
        
        console.log('🧹 localStorage cleaned after successful payment');
        
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
  };  if (!pendingOrder || fetchingOrder) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p>{fetchingOrder ? 'Fetching order details...' : 'Loading order details...'}</p>
      </div>
    );
  }
  
  // Use the total amount directly (no discount) with fallback
  const finalAmount = pendingOrder.totalAmount || 0;
  const itemsTotal = pendingOrder.subtotal || pendingOrder.totalAmount || 0;
  const deliveryCharge = pendingOrder.deliveryCharge || 0;

  console.log('💰 PaymentStep: Order amounts:', {
    totalAmount: pendingOrder.totalAmount,
    subtotal: pendingOrder.subtotal,
    deliveryCharge: pendingOrder.deliveryCharge,
    finalAmount: finalAmount
  });

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
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Order Summary</h3>            <div className="space-y-2 text-sm md:text-base">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-medium">{pendingOrder.orderId || 'N/A'}</span>
              </div>
              
              {/* Items List */}
              {pendingOrder.items && pendingOrder.items.length > 0 && (
                <div>
                  <div className="font-medium text-gray-900 mb-2">Items ({pendingOrder.items.length}):</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {pendingOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="truncate mr-2">
                          {item.quantity}x {item.name}
                          {item.selectedWeight && ` (${item.selectedWeight})`}
                          {item.customization?.type === 'photo-cake' && ' 📸'}
                        </span>
                        <span className="whitespace-nowrap">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {itemsTotal > 0 && (
                <div className="flex justify-between">
                  <span>Items Total:</span>
                  <span>{formatPrice(itemsTotal)}</span>
                </div>
              )}
              
              {deliveryCharge > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span>{formatPrice(deliveryCharge)}</span>
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

        {/* Sticky Order Summary (Right Side) */}
        <div className="bg-gray-50 rounded-lg p-3 md:p-4 h-fit">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Order Details</h3>          <div className="space-y-2 text-xs md:text-sm">
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-medium">{pendingOrder.customerInfo?.fullName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Mobile:</span>
              <span>{pendingOrder.customerInfo?.mobileNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Date:</span>
              <span>{pendingOrder.customerInfo?.deliveryDate ? new Date(pendingOrder.customerInfo.deliveryDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Time Slot:</span>
              <span>{pendingOrder.customerInfo?.timeSlot || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Area:</span>
              <span>{pendingOrder.customerInfo?.area || 'N/A'}</span>
            </div>
          </div><div className="mt-4 p-3 bg-white rounded border border-pink-200">
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
