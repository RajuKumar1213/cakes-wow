import React from 'react';
import { XCircle, RefreshCw, ArrowLeft, Phone, AlertTriangle } from 'lucide-react';

interface PaymentErrorProps {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}

export const PaymentError: React.FC<PaymentErrorProps> = ({ error, onRetry, onBack }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
      <div className="bg-white h-[90vh] rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300 overflow-y-scroll">
        {/* Error Header */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 text-center">
          
          <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
          <p className="text-red-100">Something went wrong with your payment</p>
        </div>

        {/* Error Details */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Payment Error</h3>
                <p className="text-red-700 text-sm leading-relaxed">
                  {error || 'The payment could not be processed. Please try again or contact support.'}
                </p>
              </div>
            </div>
          </div>

          {/* Common Reasons */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Common reasons for payment failure:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Insufficient balance in your account</li>
              <li>• Network connectivity issues</li>
              <li>• Incorrect card details or OTP</li>
              <li>• Payment gateway timeout</li>
              <li>• Bank declined the transaction</li>
            </ul>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">Need Immediate Help?</p>
            </div>
            <p className="text-sm text-blue-700">
              Call us at <span className="font-medium">+91 9876543210</span> and we'll help you complete your order over the phone.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Payment Again
            </button>
              <button
              onClick={onBack}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
