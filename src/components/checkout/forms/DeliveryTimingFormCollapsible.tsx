import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, Check, Edit3, ChevronUp, Star, Gift } from 'lucide-react';
import { OrderForm, deliveryTypes, deliveryOccasions, relations } from '@/constants/checkout';

interface DeliveryTimingFormCollapsibleProps {
  orderForm: OrderForm;
  errors: Partial<OrderForm>;
  onInputChange: (field: keyof OrderForm, value: string) => void;
  onShowCalendar: () => void;
  onShowDateModal: () => void;
  isComplete: boolean;
}

export const DeliveryTimingFormCollapsible: React.FC<DeliveryTimingFormCollapsibleProps> = ({
  orderForm,
  errors,
  onInputChange,
  onShowCalendar,
  onShowDateModal,
  isComplete,
}) => {
  const [isExpanded, setIsExpanded] = useState(!isComplete);

  // Auto-collapse when form becomes complete
  useEffect(() => {
    if (isComplete && isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, isExpanded]);

  const selectedDeliveryType = deliveryTypes.find(dt => dt.id === orderForm.deliveryType);

  // Collapsed view
  if (!isExpanded) {
    return (
      <div className={`border-2 rounded-lg p-3 md:p-4 transition-all duration-200 ${
        isComplete 
          ? 'bg-green-50 border-green-200 shadow-sm' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={`p-1.5 md:p-2 rounded-full ${
              isComplete ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {isComplete ? (
                <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              ) : (
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900">
                Delivery Timing
              </h3>
              {isComplete && (
                <p className="text-xs md:text-sm text-gray-600">
                  {orderForm.deliveryDate} • {orderForm.timeSlot}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-1 px-2 md:px-3 py-1 text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg p-3 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="p-1.5 md:p-2 bg-blue-100 rounded-full">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            Delivery Timing
          </h3>
        </div>
        {isComplete && (
          <button
            onClick={() => setIsExpanded(false)}
            className="flex items-center space-x-1 px-2 md:px-3 py-1 text-xs md:text-sm text-gray-600 hover:text-gray-700"
          >
            <ChevronUp className="w-3 h-3 md:w-4 md:h-4" />
            <span>Collapse</span>
          </button>
        )}
      </div>

      <div className="space-y-3 md:space-y-6">
        {/* Delivery Type */}
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">
            Delivery Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            {deliveryTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onInputChange('deliveryType', type.id)}
                className={`p-3 md:p-4 border-2 rounded-lg text-left transition-all ${
                  orderForm.deliveryType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className={`p-1.5 md:p-2 rounded-full ${
                      orderForm.deliveryType === type.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {type.icon}
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-medium">{type.name}</h4>
                      <p className="text-xs md:text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>                  <div className="text-right">
                    <p className="text-sm md:text-base font-medium">₹{type.price}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {errors.deliveryType && (
            <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {errors.deliveryType}
            </p>
          )}
        </div>

        {/* Delivery Date */}
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Delivery Date *
          </label>
          <button
            onClick={onShowCalendar}
            className={`w-full p-2 md:p-3 border rounded-lg text-left flex items-center justify-between ${
              errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
            } hover:border-gray-400 transition-colors`}
          >
            <div className="flex items-center space-x-2 md:space-x-3">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <span className={`text-sm md:text-base ${
                orderForm.deliveryDate ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {orderForm.deliveryDate || 'Select delivery date'}
              </span>
            </div>
          </button>
          {errors.deliveryDate && (
            <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {errors.deliveryDate}
            </p>
          )}
        </div>

        {/* Time Slot */}
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Time Slot *
          </label>
          <button
            onClick={onShowDateModal}
            className={`w-full p-2 md:p-3 border rounded-lg text-left flex items-center justify-between ${
              errors.timeSlot ? 'border-red-500' : 'border-gray-300'
            } hover:border-gray-400 transition-colors`}
          >
            <div className="flex items-center space-x-2 md:space-x-3">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <span className={`text-sm md:text-base ${
                orderForm.timeSlot ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {orderForm.timeSlot || 'Select time slot'}
              </span>
            </div>
          </button>
          {errors.timeSlot && (
            <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {errors.timeSlot}
            </p>
          )}
        </div>

        {/* Delivery Occasion */}
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Occasion (Optional)
          </label>
          <select
            value={orderForm.deliveryOccasion}
            onChange={(e) => onInputChange('deliveryOccasion', e.target.value)}
            className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an occasion</option>            {deliveryOccasions.map((occasion) => (
              <option key={occasion} value={occasion}>
                {occasion}
              </option>
            ))}
          </select>
        </div>

        {/* Relation */}
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Relation (Optional)
          </label>
          <select
            value={orderForm.relation}
            onChange={(e) => onInputChange('relation', e.target.value)}
            className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select relation</option>            {relations.map((relation) => (
              <option key={relation} value={relation}>
                {relation}
              </option>
            ))}
          </select>
        </div>

        {/* Sender Name */}
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Sender Name (Optional)
          </label>
          <input
            type="text"
            value={orderForm.senderName}
            onChange={(e) => onInputChange('senderName', e.target.value)}
            className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Who is sending this gift?"
          />
        </div>

        {/* Message on Card */}
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Message on Card (Optional)
          </label>
          <textarea
            value={orderForm.messageOnCard}
            onChange={(e) => onInputChange('messageOnCard', e.target.value)}
            className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a special message for the card"
            rows={3}
          />
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            value={orderForm.specialInstructions}
            onChange={(e) => onInputChange('specialInstructions', e.target.value)}
            className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special instructions for delivery"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};