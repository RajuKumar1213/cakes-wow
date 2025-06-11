import React, { useState } from 'react';
import { Clock, Calendar, AlertCircle, Star, Heart, User, MessageCircle, FileText, Send, ChevronDown, Eye } from 'lucide-react';
import { OrderForm, deliveryTypes, deliveryOccasions, relations, suggestedMessages } from '@/constants/checkout';
import { useCheckout } from '@/contexts/CheckoutContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DeliveryTimingFormProps {
  orderForm: OrderForm;
  errors: Partial<OrderForm>;
  onUpdateField: (field: keyof OrderForm, value: string) => void;
  onShowCalendar: () => void;
  onShowDateModal: () => void;
  onDeliveryTypeChange?: (deliveryType: any) => void;
  onTimeSlotSelect?: (timeSlot: string) => void;
  onContinue: () => void;
}

export const DeliveryTimingForm: React.FC<DeliveryTimingFormProps> = ({
  orderForm,
  errors,
  onUpdateField,
  onShowCalendar,
  onShowDateModal,
  onContinue,
}) => {
  const { goToNextStep } = useCheckout();
  const selectedDeliveryType = deliveryTypes.find(dt => dt.id === orderForm.deliveryType);
  const [showSuggestedMessages, setShowSuggestedMessages] = useState(false);
  const [isLoadingDeliveryData, setIsLoadingDeliveryData] = useState(true);

  // Comprehensive validation function to check all required fields
  const validateAllRequiredFields = () => {
    const requiredFields = {
      // Personal details
      fullName: orderForm.fullName?.trim(),
      email: orderForm.email?.trim(),
      mobileNumber: orderForm.mobileNumber?.trim(),
      
      // Address details
      fullAddress: orderForm.fullAddress?.trim(),
      area: orderForm.area?.trim(),
      pinCode: orderForm.pinCode?.trim(),
      
      // Delivery details
      deliveryDate: orderForm.deliveryDate?.trim(),
      timeSlot: orderForm.timeSlot?.trim(),
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    return {
      isValid: missingFields.length === 0,
      missingFields,
      requiredFields
    };
  };

  const validation = validateAllRequiredFields();
  const isFormComplete = validation.isValid;

  // Simulate loading of delivery types and time slots
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingDeliveryData(false);
    }, 500); // Small delay to show spinner
    return () => clearTimeout(timer);
  }, []);

  const handleSuggestedMessageSelect = (message: string) => {
    onUpdateField('messageOnCard', message);
    setShowSuggestedMessages(false);
  };
  const currentSuggestedMessages = orderForm.deliveryOccasion && suggestedMessages[orderForm.deliveryOccasion]
    ? suggestedMessages[orderForm.deliveryOccasion]
    : [];

  // Show loading spinner if delivery data is still loading
  if (isLoadingDeliveryData) {
    return (
      <div className="bg-white rounded shadow-xl overflow-hidden">
        <div className="bg-blue-600 text-white p-3 md:p-4">
          <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 md:w-5 md:h-5" />
            Delivery Details
          </h2>
          <p className="text-blue-100 mt-1 text-xs md:text-sm">Complete your delivery information ⏰</p>
        </div>
        <div className="p-4 md:p-6 flex items-center justify-center min-h-[200px]">
          <LoadingSpinner size="md" color="primary" text="Loading delivery options..." />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-xl overflow-hidden">
      <div className="bg-blue-600 text-white p-3 md:p-4">
        <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          Delivery Details
        </h2>
        <p className="text-blue-100 mt-1 text-xs md:text-sm">Complete your delivery information ⏰</p>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Date and Time Selection */}
        <div className="space-y-4">
          {/* Consolidated Date, Delivery Type & Time Selection */}
          {orderForm.deliveryDate && orderForm.timeSlot && selectedDeliveryType ? (
            <div className="relative group">
              <div className="p-4 md:p-6 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-50 rounded-xl md:rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm md:text-lg font-bold text-gray-900 mb-1">
                        {new Date(orderForm.deliveryDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        / {orderForm.timeSlot}
                      </div>
                      <div className="flex items-center text-xs md:text-sm text-blue-700">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        {selectedDeliveryType.name}{" "}
                        {selectedDeliveryType.price > 0
                          ? `(₹${selectedDeliveryType.price})`
                          : "(Free)"}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onShowDateModal()}
                    className="px-3 py-2 md:px-4 md:py-2 bg-white/80 hover:bg-white border-2 border-blue-300 hover:border-blue-400 rounded-lg md:rounded-xl text-blue-600 hover:text-blue-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md text-sm md:text-base"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Step-by-step Selection Process */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Step 1: Date Selection */}
              <div className="group">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3 transition-colors group-focus-within:text-blue-600">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-blue-500" />
                    Delivery Date *
                  </div>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => onShowCalendar()}
                    className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 focus:border-blue-400 transition-all duration-300 transform hover:scale-[1.02] bg-white shadow-sm text-left text-sm md:text-base ${errors.deliveryDate
                      ? "border-red-400 bg-red-50"
                      : orderForm.deliveryDate
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    {orderForm.deliveryDate ? (
                      <span className="text-blue-900 font-medium">
                        {new Date(orderForm.deliveryDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        When should we deliver? 📅
                      </span>
                    )}
                  </button>
                  <Calendar
                    className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 transition-colors ${errors.deliveryDate
                      ? "text-red-400"
                      : orderForm.deliveryDate
                        ? "text-blue-500"
                        : "text-gray-400"
                      }`}
                  />
                </div>
                {errors.deliveryDate && (
                  <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    {errors.deliveryDate}
                  </div>
                )}
              </div>

              {/* Step 2: Time Selection */}
              <div className="group">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3 transition-colors group-focus-within:text-blue-600">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-blue-500" />
                    Delivery Time *
                  </div>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      orderForm.deliveryDate
                        ? onShowDateModal()
                        : onShowCalendar()
                    }
                    disabled={!orderForm.deliveryDate}
                    className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 focus:border-blue-400 transition-all duration-300 transform hover:scale-[1.02] bg-white shadow-sm text-left text-sm md:text-base ${!orderForm.deliveryDate
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                      : errors.timeSlot
                        ? "border-red-400 bg-red-50"
                        : orderForm.timeSlot
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    {!orderForm.deliveryDate ? (
                      <span className="text-gray-400">
                        Select date first
                      </span>
                    ) : orderForm.timeSlot ? (
                      <span className="text-blue-900 font-medium">
                        {orderForm.timeSlot}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Choose delivery time ⏰
                      </span>
                    )}
                  </button>
                  <Clock
                    className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 transition-colors ${!orderForm.deliveryDate
                      ? "text-gray-300"
                      : errors.timeSlot
                        ? "text-red-400"
                        : orderForm.timeSlot
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                  />
                </div>
                {errors.timeSlot && (
                  <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    {errors.timeSlot}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Type Information Display */}
          {orderForm.deliveryDate && !orderForm.timeSlot && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Next: Choose Your Delivery Type</h4>
                  <p className="text-blue-700 text-sm">Select from Standard, Midnight, Fixed Time, or Early Morning delivery</p>
                </div>
              </div>
            </div>
          )}
        </div>        {/* Additional Delivery Information */}
        <div className="space-y-6 border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-semibold text-gray-900">Make it Special</h3>
          </div>

          {/* Delivery Occasion, Relation, and Sender Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Star className="w-3 h-3 mr-1 text-pink-500" />
                  Occasion
                </div>
              </label>
              <select
                value={orderForm.deliveryOccasion}
                onChange={(e) => onUpdateField('deliveryOccasion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-pink-400 focus:ring-0 transition-colors text-sm"
              >
                <option value="">Select occasion</option>
                {deliveryOccasions.map(occasion => (
                  <option key={occasion} value={occasion}>{occasion}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1 text-pink-500" />
                  Relation
                </div>
              </label>
              <select
                value={orderForm.relation}
                onChange={(e) => onUpdateField('relation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-pink-400 focus:ring-0 transition-colors text-sm"
              >
                <option value="">Select relation</option>
                {relations.map(relation => (
                  <option key={relation} value={relation}>{relation}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Send className="w-3 h-3 mr-1 text-pink-500" />
                  Sender Name
                </div>
              </label>
              <input
                type="text"
                value={orderForm.senderName}
                onChange={(e) => onUpdateField('senderName', e.target.value)}
                placeholder="From"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-pink-400 focus:ring-0 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Message on Card and Special Instructions - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Message on Card */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1 text-pink-500" />
                  Message on Cake Card
                </div>
              </label>

              {/* Suggested Messages */}
              {currentSuggestedMessages.length > 0 && (
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => setShowSuggestedMessages(!showSuggestedMessages)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mb-1"
                  >
                    <Star className="w-3 h-3" />
                    Suggestions
                    <ChevronDown className={`w-3 h-3 transform transition-transform ${showSuggestedMessages ? 'rotate-180' : ''}`} />
                  </button>

                  {showSuggestedMessages && (
                    <div className="space-y-1 mb-2">
                      {currentSuggestedMessages.map((message, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestedMessageSelect(message)}
                          className="w-full p-2 text-left bg-pink-50 border border-pink-200 rounded-md hover:bg-pink-100 transition-colors text-xs"
                        >
                          "{message}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <textarea
                value={orderForm.messageOnCard}
                onChange={(e) => onUpdateField('messageOnCard', e.target.value)}
                placeholder="Write a message..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-pink-400 focus:ring-0 transition-colors resize-none text-sm"
                maxLength={200}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {orderForm.messageOnCard.length}/200
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FileText className="w-3 h-3 mr-1 text-blue-500" />
                  Special Instructions
                </div>
              </label>
              <textarea
                value={orderForm.specialInstructions}
                onChange={(e) => onUpdateField('specialInstructions', e.target.value)}
                placeholder="Any special delivery instructions..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-400 focus:ring-0 transition-colors resize-none text-sm"
                maxLength={150}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {orderForm.specialInstructions.length}/150
              </div>
            </div>
          </div>          {/* Continue Button */}
          <div className="pt-4 border-t space-y-3">
            {/* Show validation errors if form is incomplete */}
            {!isFormComplete && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">Please complete the following required fields:</p>
                    <ul className="space-y-1 text-xs">
                      {validation.missingFields.map((field) => (
                        <li key={field} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {field === 'fullName' && 'Full Name'}
                          {field === 'email' && 'Email Address'}
                          {field === 'mobileNumber' && 'Mobile Number'}
                          {field === 'fullAddress' && 'Full Address'}
                          {field === 'area' && 'Delivery Area'}
                          {field === 'pinCode' && 'PIN Code'}
                          {field === 'deliveryDate' && 'Delivery Date'}
                          {field === 'timeSlot' && 'Time Slot'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onContinue}
              disabled={!isFormComplete}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform flex items-center justify-center gap-2 ${
                isFormComplete
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Eye className="w-5 h-5" />
              {!isFormComplete
                ? `Complete ${validation.missingFields.length} required field${validation.missingFields.length > 1 ? 's' : ''} first`
                : 'Save Data & Continue to Payment'
              }
            </button>            
            <div className="text-center text-xs text-gray-500">
              <p>💾 All personal details and address will be automatically saved before proceeding to payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
