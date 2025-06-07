import React from 'react';
import { Calendar } from 'lucide-react';
import { deliveryTypes } from '@/constants/checkout';

interface DeliveryTypeModalProps {
  isOpen: boolean;
  deliveryDate: string;
  onClose: () => void;
  onDeliveryTypeSelect: (type: any) => void;
  onChangeDate: () => void;
}

export const DeliveryTypeModal: React.FC<DeliveryTypeModalProps> = ({
  isOpen,
  deliveryDate,
  onClose,
  onDeliveryTypeSelect,
  onChangeDate,
}) => {
  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl md:rounded-2xl max-w-md w-full mx-0 md:mx-4 max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-3 md:p-6 flex-1 overflow-y-auto"><div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                Select Delivery Type
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Choose your preferred delivery option
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>          <div className="space-y-2 md:space-y-3">
            {deliveryTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onDeliveryTypeSelect(type)}
                className="w-full p-3 md:p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 transform hover:scale-[1.02] text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl md:text-2xl mr-2 md:mr-3">{type.icon}</span>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 text-sm md:text-base">
                          {type.name}
                        </span>
                        {type.popular && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                            Popular
                          </span>
                        )}
                        {type.premium && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600 mt-1">
                        {type.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 text-sm md:text-base">
                      {type.price > 0 ? `₹${type.price}` : "Free"}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>          {deliveryDate && (
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  <span className="text-xs md:text-sm">
                    {new Date(deliveryDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>                <button
                  onClick={onChangeDate}
                  className="text-orange-600 text-xs md:text-sm hover:text-orange-800 transition-colors"
                >
                  Change Date
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
