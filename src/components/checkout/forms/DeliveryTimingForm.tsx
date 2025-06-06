import React, { useState } from 'react';
import { Clock, Calendar, AlertCircle, Check, Star, Zap, Heart, User, MessageCircle, FileText, Send, ChevronDown, CreditCard, Loader2, Banknote, Eye } from 'lucide-react';
import { OrderForm, deliveryTypes, deliveryOccasions, relations, suggestedMessages } from '@/constants/checkout';
import { useCart } from '@/contexts/CartContext';
import { usePayment } from '@/hooks/usePayment';
import { PaymentSuccess } from '@/components/checkout/PaymentSuccess';
import { PaymentError } from '@/components/checkout/PaymentError';
import { PaymentSummaryModal } from '@/components/checkout/PaymentSummaryModal';
import axios from 'axios';
import { useCheckout } from '@/contexts/CheckoutContext';

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
  onDeliveryTypeChange,
  onTimeSlotSelect,
  onContinue,
}) => {
    const { state, goToNextStep } = useCheckout();
  console.log('DeliveryTimingForm ENHANCED VERSION LOADED with new fields');
  const selectedDeliveryType = deliveryTypes.find(dt => dt.id === orderForm.deliveryType); const [showSuggestedMessages, setShowSuggestedMessages] = useState(false);
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [paymentNotifications, setPaymentNotifications] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [codLoading, setCodLoading] = useState(false);

  const { items, totalPrice, clearCart } = useCart();
  const { initiatePayment, loading: paymentLoading } = usePayment();

  const handleDeliveryTypeSelect = (deliveryType: any) => {
    if (onDeliveryTypeChange) {
      onDeliveryTypeChange(deliveryType);
    }
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    if (onTimeSlotSelect) {
      onTimeSlotSelect(timeSlot);
    }
  };

  const handleSuggestedMessageSelect = (message: string) => {
    onUpdateField('messageOnCard', message);
    setShowSuggestedMessages(false);
  };

  const currentSuggestedMessages = orderForm.deliveryOccasion && suggestedMessages[orderForm.deliveryOccasion]
    ? suggestedMessages[orderForm.deliveryOccasion]
    : [];
  const handleContinue = () => {
    // Basic validation for new fields
    const requiredFields = ['deliveryDate', 'timeSlot'];
    const hasErrors = requiredFields.some(field => !orderForm[field as keyof OrderForm]);

    if (!hasErrors) {
      onContinue();
    }
  }; const getAddOnsFromStorage = () => {
    try {
      const savedAddOns = localStorage.getItem('bakingo-selected-addons');
      const savedQuantities = localStorage.getItem('bakingo-addon-quantities');

      if (!savedAddOns) return [];

      const addOns = JSON.parse(savedAddOns);
      const quantities = savedQuantities ? JSON.parse(savedQuantities) : {};

      return addOns.map((addOn: any) => ({
        name: addOn.name,
        quantity: quantities[addOn._id] || 1,
        price: addOn.price
      }));
    } catch (error) {
      console.error('Error loading add-ons:', error);
      return [];
    }
  };

  const calculateOrderSummary = () => {
    const addOns = getAddOnsFromStorage();
    const addOnsTotal = addOns.reduce((total: number, addOn: any) => total + (addOn.price * addOn.quantity), 0);
    const subtotal = totalPrice + addOnsTotal;
    const deliveryCharge = selectedDeliveryType ? selectedDeliveryType.price : 0;
    const totalAmount = subtotal + deliveryCharge;
    const onlineDiscount = Math.round(totalAmount * 0.02); // 2% discount for online payment
    const finalAmountOnline = totalAmount - onlineDiscount;
    const finalAmountCOD = totalAmount; // No discount for COD

    return {
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        weight: item.selectedWeight,
        imageUrl: item.imageUrl
      })),
      addOns,
      subtotal,
      addOnsTotal,
      deliveryCharge,
      deliveryType: selectedDeliveryType?.name || 'Standard Delivery',
      onlineDiscount,
      totalAmount,
      finalAmountOnline,
      finalAmountCOD
    };
  };

  const validateForm = () => {
    // Validate required fields
    const requiredFields = ['fullName', 'mobileNumber', 'deliveryDate', 'timeSlot', 'area', 'fullAddress'];
    const missingFields = [];

    for (const field of requiredFields) {
      const value = orderForm[field as keyof OrderForm];
      if (!value || value.toString().trim() === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      alert(`Please fill all required fields before proceeding. Missing: ${missingFields.join(', ')}`);
      return false;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return false;
    }

    return true;
  };

  const handleShowPaymentSummary = () => {
    if (!validateForm()) return;
    setShowPaymentSummary(true);
  };

  const handlePaymentConfirm = async (paymentType: 'online' | 'cod') => {
    setShowPaymentSummary(false);

    if (paymentType === 'online') {
      await handleOnlinePayment();
    } else {
      await handleCOD();
    }
  };
  const handleOnlinePayment = async () => {
    const orderSummary = calculateOrderSummary();

    // Prepare order data
    const orderData = {
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedWeight: item.selectedWeight || '',
        imageUrl: item.imageUrl || '',
      })),
      addOns: orderSummary.addOns,
      customerInfo: {
        fullName: orderForm.fullName,
        mobileNumber: orderForm.mobileNumber,
        email: orderForm.email,
        deliveryDate: orderForm.deliveryDate,
        timeSlot: orderForm.timeSlot,
        area: orderForm.area,
        pinCode: orderForm.pinCode,
        fullAddress: orderForm.fullAddress,
        deliveryOccasion: orderForm.deliveryOccasion,
        relation: orderForm.relation,
        senderName: orderForm.senderName,
        messageOnCard: orderForm.messageOnCard,
        specialInstructions: orderForm.specialInstructions,
      },
      totalAmount: orderSummary.finalAmountOnline,
      subtotal: orderSummary.subtotal,
      addOnsTotal: orderSummary.addOnsTotal,
      deliveryCharge: orderSummary.deliveryCharge,
      onlineDiscount: orderSummary.onlineDiscount,
      notes: orderForm.specialInstructions,
    };

    console.log('Initiating payment with order data:', orderData);

    await initiatePayment(
      orderData,
      orderForm,
      (orderDetails, notifications) => {
        console.log('Payment successful:', orderDetails);
        setPaymentSuccess(orderDetails);
        setPaymentNotifications(notifications);
        clearCart(); // Clear cart after successful payment
        // Clear add-ons from localStorage
        localStorage.removeItem('bakingo-selected-addons');
        localStorage.removeItem('bakingo-addon-quantities');
      },
      (error) => {
        console.error('Payment failed:', error);
        setPaymentError(error);
      }
    );
  }; const handleCOD = async () => {
    setCodLoading(true);

    try {
      const orderSummary = calculateOrderSummary();

      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedWeight: item.selectedWeight || '',
          imageUrl: item.imageUrl || '',
        })),
        addOns: orderSummary.addOns,
        customerInfo: {
          fullName: orderForm.fullName,
          mobileNumber: orderForm.mobileNumber,
          email: orderForm.email,
          deliveryDate: orderForm.deliveryDate,
          timeSlot: orderForm.timeSlot,
          area: orderForm.area,
          pinCode: orderForm.pinCode,
          fullAddress: orderForm.fullAddress,
          deliveryOccasion: orderForm.deliveryOccasion,
          relation: orderForm.relation,
          senderName: orderForm.senderName,
          messageOnCard: orderForm.messageOnCard,
          specialInstructions: orderForm.specialInstructions,
        },
        totalAmount: orderSummary.finalAmountCOD,
        subtotal: orderSummary.subtotal,
        addOnsTotal: orderSummary.addOnsTotal,
        deliveryCharge: orderSummary.deliveryCharge,
        notes: orderForm.specialInstructions,
      };

      console.log('Creating COD order with data:', orderData);

      const response = await axios.post('/api/payment/cod', orderData);

      if (response.data.success) {
        console.log('COD order created successfully:', response.data);
        setPaymentSuccess(response.data.order);
        setPaymentNotifications(response.data.notifications);
        clearCart(); // Clear cart after successful order creation
        // Clear add-ons from localStorage
        localStorage.removeItem('bakingo-selected-addons');
        localStorage.removeItem('bakingo-addon-quantities');
      } else {
        throw new Error(response.data.error || 'Failed to create COD order');
      }
    } catch (error: any) {
      console.error('COD order creation error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create COD order';
      setPaymentError(errorMessage);
    } finally {
      setCodLoading(false);
    }
  };

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
          </div>            {/* Delivery Occasion, Relation, and Sender Name */}
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
                  Message on Card
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
          </div>            {/* Payment Buttons */}
          <div className="pt-4 border-t space-y-3">
            {/* Single Preview Order Button */}
            <button
              type="button"
              onClick={goToNextStep}
              disabled={!orderForm.deliveryDate || !orderForm.timeSlot || paymentLoading || codLoading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform flex items-center justify-center gap-2 ${orderForm.deliveryDate && orderForm.timeSlot && !paymentLoading && !codLoading
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >

              <Eye className="w-5 h-5" />
              {!orderForm.deliveryDate || !orderForm.timeSlot
                ? 'Please select date and time first'
                : 'Preview Order'
              }

            </button>

            {/* Payment Info */}
            <div className="text-center text-xs text-gray-500 mt-2">
              <p>💳 Review your order details before payment</p>
              <p>💰 Choose between Online Payment (2% discount) or Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>      {/* Payment Summary Modal */}
      {showPaymentSummary && (
        <PaymentSummaryModal
          isOpen={showPaymentSummary}
          onClose={() => setShowPaymentSummary(false)}
          onPayOnline={() => handlePaymentConfirm('online')}
          onCashOnDelivery={() => handlePaymentConfirm('cod')}
          orderSummary={calculateOrderSummary()}
        />
      )}

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <PaymentSuccess
          orderDetails={paymentSuccess}
          notifications={paymentNotifications}
          onClose={() => {
            setPaymentSuccess(null);
            setPaymentNotifications(null);
            window.location.href = '/'; // Redirect to home
          }}
        />
      )}

      {/* Payment Error Modal */}
      {paymentError && (
        <PaymentError
          error={paymentError}
          onRetry={() => {
            setPaymentError(null);
            handleShowPaymentSummary(); // Retry payment
          }}
          onBack={() => {
            setPaymentError(null);
          }}
        />
      )}
    </div>
  );
};
