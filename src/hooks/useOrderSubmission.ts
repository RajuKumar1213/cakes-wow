import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

export function useOrderSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { clearCart } = useCart();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const submitOrder = async (orderData: any) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();

      clearCart();
      showSuccess(
        'Order Placed Successfully!',
        'Your order has been placed and will be delivered on time.'
      );

      setTimeout(() => {
        router.push(`/order-confirmation/${result.orderId}`);
      }, 3000);

      return result;
    } catch (error) {
      console.error('Order placement error:', error);
      showError('Failed to place order. Please try again.', 'Order Error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitOrder, isSubmitting };
}
