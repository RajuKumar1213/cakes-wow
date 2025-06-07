import { useState } from 'react';
import axios from 'axios';

interface PaymentData {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  backendOrderId: string;
}

interface OrderData {
  items: any[];
  customerInfo: any;
  totalAmount: number;
  notes?: string;
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  // Create order and initiate payment
  const initiatePayment = async (
    orderData: OrderData,
    customerInfo: any,
    onSuccess: (orderDetails: any, notifications?: any) => void,
    onFailure: (error: string) => void
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Initiating payment with order data:', orderData);

      // Step 1: Create order in backend
      const createOrderResponse = await axios.post('/api/payment/create-order', orderData);
      
      if (!createOrderResponse.data.success) {
        throw new Error(createOrderResponse.data.error || 'Failed to create order');
      }

      const { payment, order } = createOrderResponse.data;
      console.log('Order created successfully:', { payment, order });

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Step 3: Configure Razorpay options
      const razorpayOptions = {
        key: payment.razorpayKeyId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'Cakes Wow',
        description: `Order ${order.orderId}`,
        order_id: payment.razorpayOrderId,
        prefill: {
          name: customerInfo.fullName,
          email: customerInfo.email || '',
          contact: customerInfo.mobileNumber,
        },
        theme: {
          color: '#2563eb', // Blue theme matching your app
        },
        handler: async (response: any) => {
          console.log('Payment successful, verifying...', response);
          
          try {
            // Step 4: Verify payment on backend
            const verifyResponse = await axios.post('/api/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              backend_order_id: payment.backendOrderId,
            });            if (verifyResponse.data.success) {
              console.log('Payment verified successfully:', verifyResponse.data);
              onSuccess(verifyResponse.data.order, verifyResponse.data.notifications);
            } else {
              throw new Error(verifyResponse.data.error || 'Payment verification failed');
            }
          } catch (verifyError: any) {
            console.error('Payment verification error:', verifyError);
            onFailure(verifyError.response?.data?.error || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            onFailure('Payment was cancelled');
          },
        },
      };

      // Step 5: Open Razorpay checkout
      const rzp = new (window as any).Razorpay(razorpayOptions);
      rzp.open();

    } catch (err: any) {
      console.error('Payment initiation error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to initiate payment';
      setError(errorMessage);
      onFailure(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    initiatePayment,
    loading,
    error,
  };
};
