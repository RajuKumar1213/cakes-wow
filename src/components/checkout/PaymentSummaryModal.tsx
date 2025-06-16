import React from 'react';
import { X, CreditCard, ShoppingCart, Truck, Gift } from 'lucide-react';

interface PaymentSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayOnline: () => void;
  orderSummary: {
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      weight?: string;
      imageUrl?: string;
    }>;
    addOns: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;    subtotal: number;
    addOnsTotal: number;
    deliveryCharge: number;
    deliveryType: string;
    totalAmount: number;
  };
}

export const PaymentSummaryModal: React.FC<PaymentSummaryModalProps> = ({
  isOpen,
  onClose,
  onPayOnline,
  orderSummary
}) => {
  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 h-[95vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col">{/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
         
          <h2 className="text-2xl font-bold mb-2 text-center">Order Summary</h2>
          <p className="text-orange-100 text-center">Review your order details</p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side - Order Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Items Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-orange-600" />
                Cart Items ({orderSummary.items.length})
              </h3>
              <div className="space-y-2">
                {orderSummary.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-gray-500 text-xs">
                        {item.weight && `${item.weight} • `}Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons Section */}
            {orderSummary.addOns.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-pink-600" />
                  Add-ons ({orderSummary.addOns.length})
                </h3>
                <div className="space-y-2">
                  {orderSummary.addOns.map((addOn, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{addOn.name}</p>
                        <p className="text-gray-500 text-xs">Qty: {addOn.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ₹{(addOn.price * addOn.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items Subtotal</span>
                <span className="font-medium">₹{orderSummary.subtotal.toFixed(0)}</span>
              </div>
              
              {orderSummary.addOnsTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Add-ons Total</span>
                  <span className="font-medium">₹{orderSummary.addOnsTotal.toFixed(0)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm items-center">
                <div className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600">{orderSummary.deliveryType}</span>
                </div>
                <span className={`font-medium ${orderSummary.deliveryCharge > 0 ? 'text-gray-900' : 'text-green-600'}`}>
                  {orderSummary.deliveryCharge > 0 ? `₹${orderSummary.deliveryCharge}` : 'FREE'}
                </span>
              </div>              {/* Total Line */}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <div className="text-right">
                    <span className="text-green-600">₹{orderSummary.totalAmount.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>          {/* Right Side - Payment Options */}
          <div className="lg:w-80 bg-gray-50 p-6 flex flex-col justify-center space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">Complete your order with online payment</p>
            </div>

            {/* Online Payment Button */}
            <button
              onClick={onPayOnline}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.01] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />              <div className="text-center">
                <div className="text-sm">Pay Now</div>
                <div className="text-lg font-bold">₹{orderSummary.totalAmount.toFixed(0)}</div>
              </div>
            </button>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-4 pt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Secure Payment
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Encrypted Data
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Safe & Trusted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
