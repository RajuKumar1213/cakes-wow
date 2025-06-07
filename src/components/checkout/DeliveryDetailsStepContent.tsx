'use client';

import React from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useCart } from '@/contexts/CartContext';
import { PersonalDetailsForm } from '@/components/checkout/forms/PersonalDetailsForm';
import { AddressForm } from '@/components/checkout/forms/AddressForm';
import { DeliveryTimingForm } from '@/components/checkout/forms/DeliveryTimingForm';
import { CalendarModal } from '@/components/checkout/modals/CalendarModal';
import { DeliveryTypeModal } from '@/components/checkout/modals/DeliveryTypeModal';
import TimeSlotModal from '@/components/checkout/modals/TimeSlotModal';
import { validatePersonalDetails, validateAddress } from '@/utils/validation';
import { areaPinMap } from '@/constants/areaPinMap';

const DeliveryDetailsStepContent: React.FC = () => {
  const { state, dispatch, updateOrderForm, goToNextStep, goToPreviousStep } = useCheckout();
  const { items, totalPrice } = useCart();
  const { 
    orderForm, 
    errors, 
    showDateModal, 
    showTimeSlotModal, 
    showCalendar,
    selectedDeliveryType,
    selectedDate,
    currentMonth 
  } = state;

  const handlePersonalDetailsChange = (field: string, value: string) => {
    updateOrderForm(field as keyof typeof orderForm, value);
  };
  const handleAddressChange = (field: string, value: string) => {
    updateOrderForm(field as keyof typeof orderForm, value);
  };
  const handleAreaChange = (area: string) => {
    updateOrderForm('area', area);
    // Auto-populate pin code if available
    const pinCode = (areaPinMap as any)[area];
    if (pinCode) {
      updateOrderForm('pinCode', pinCode);
    }
  };

  const handleDateSelect = (date: string) => {
    updateOrderForm('deliveryDate', date);
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showCalendar', value: false } });
    // Show delivery type modal after date selection
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showDateModal', value: true } });
  };

  const handleCalendarDateSelect = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
    const dateString = date.toISOString().split('T')[0];
    updateOrderForm('deliveryDate', dateString);
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showCalendar', value: false } });
    // Show delivery type modal after date selection
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showDateModal', value: true } });
  };

  const handleDeliveryTypeSelect = (deliveryType: any) => {
    dispatch({ type: 'SET_DELIVERY_TYPE', payload: deliveryType });
    updateOrderForm('deliveryType', deliveryType.id);
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showDateModal', value: false } });
    // Show time slot modal after delivery type selection
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showTimeSlotModal', value: true } });
  };
  const handleTimeSlotSelect = (timeSlot: string) => {
    updateOrderForm('timeSlot', timeSlot);
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showTimeSlotModal', value: false } });
  };

  const handleUpdateField = (field: string, value: string) => {
    updateOrderForm(field as keyof typeof orderForm, value);
  };
  const handleContinue = async () => {
    try {
      // Validate all required fields first
      const personalDetailsErrors = validatePersonalDetails({
        firstName: orderForm.fullName.split(' ')[0] || '',
        lastName: orderForm.fullName.split(' ').slice(1).join(' ') || '',
        email: orderForm.email,
        phone: orderForm.mobileNumber,
      });

      const addressErrors = validateAddress({
        address: orderForm.fullAddress,
        landmark: orderForm.landmark,
        pincode: orderForm.pinCode,
        area: orderForm.area,
      });

      const allErrors = [...personalDetailsErrors, ...addressErrors];

      // Additional validation for delivery details
      if (!orderForm.deliveryDate) {
        allErrors.push({ field: 'deliveryDate', message: 'Delivery date is required' });
      }
      if (!orderForm.deliveryType) {
        allErrors.push({ field: 'deliveryType', message: 'Delivery type is required' });
      }
      if (!orderForm.timeSlot) {
        allErrors.push({ field: 'timeSlot', message: 'Time slot is required' });
      }

      if (allErrors.length > 0) {
        // Convert errors to the format expected by the context
        const errorObj: Partial<typeof orderForm> = {};
        allErrors.forEach(error => {
          if (error.field === 'firstName' || error.field === 'lastName') {
            errorObj.fullName = error.message;
          } else if (error.field === 'phone') {
            errorObj.mobileNumber = error.message;
          } else if (error.field === 'address') {
            errorObj.fullAddress = error.message;
          } else if (error.field === 'pincode') {
            errorObj.pinCode = error.message;
          } else {
            (errorObj as any)[error.field] = error.message;
          }
        });
        dispatch({ type: 'SET_ERRORS', payload: errorObj });
        return;
      }

      // Get add-ons from localStorage
      let selectedAddOns: any[] = [];
      let addOnQuantities: { [key: string]: number } = {};
      
      try {
        const savedAddOns = localStorage.getItem('bakingo-selected-addons');
        const savedQuantities = localStorage.getItem('bakingo-addon-quantities');
        
        if (savedAddOns) {
          selectedAddOns = JSON.parse(savedAddOns);
        }
        if (savedQuantities) {
          addOnQuantities = JSON.parse(savedQuantities);
        }
      } catch (error) {
        console.error('Error loading add-ons:', error);
      }

      // Calculate add-ons total
      const addOnsTotal = selectedAddOns.reduce((total, addOn) => {
        const quantity = addOnQuantities[addOn._id] || 1;
        return total + (addOn.price * quantity);
      }, 0);

      // Create delivery order
      const response = await fetch('/api/orders/delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData: orderForm,
          items: items,
          selectedAddOns: selectedAddOns,
          addOnQuantities: addOnQuantities,
          totalAmount: totalPrice + addOnsTotal,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const orderResult = await response.json();
      
      // Show success message and proceed
      console.log('Order created successfully:', orderResult);
      goToNextStep();
      
    } catch (error) {
      console.error('Error creating order:', error);
      // You can show an error message to the user here
      alert('Failed to create order. Please try again.');
    }
  };

  const handleShowCalendar = () => {
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showCalendar', value: true } });
  };

  const handleShowDeliveryTypes = () => {
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showDateModal', value: true } });
  };
  const handleChangeDateFromDeliveryModal = () => {
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showDateModal', value: false } });
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showCalendar', value: true } });
  };

  return (    <div className="p-3 md:p-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">Delivery Details</h2>
        <p className="text-sm md:text-base text-gray-600">Please provide your delivery information</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-3 md:space-y-6">{/* Personal Information */}
        <PersonalDetailsForm
          orderForm={orderForm}
          errors={errors}
          onInputChange={handlePersonalDetailsChange}
        />        {/* Delivery Address */}
        <AddressForm
          orderForm={orderForm}
          errors={errors}
          onInputChange={handleAddressChange}
          onAreaChange={handleAreaChange}
        />        {/* Delivery Timing */}
        <DeliveryTimingForm
          orderForm={orderForm}
          errors={errors}
          onShowCalendar={handleShowCalendar}
          onShowDateModal={handleShowDeliveryTypes}
          onDeliveryTypeChange={handleDeliveryTypeSelect}
          onTimeSlotSelect={handleTimeSlotSelect}
          onUpdateField={handleUpdateField}
          onContinue={handleContinue}
        />        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 md:pt-6">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
          >
            Back to Cart
          </button>
        </div>
      </div>{/* Modals */}
      <CalendarModal
        isOpen={showCalendar}
        isClosing={false}
        selectedDate={selectedDate}
        currentMonth={currentMonth}
        onDateSelect={handleDateSelect}
        onClose={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'showCalendar', value: false } })}
        onMonthChange={(direction: 'prev' | 'next') => {
          const newMonth = new Date(currentMonth);
          if (direction === 'prev') {
            newMonth.setMonth(newMonth.getMonth() - 1);
          } else {
            newMonth.setMonth(newMonth.getMonth() + 1);
          }
          dispatch({ type: 'SET_CURRENT_MONTH', payload: newMonth });
        }}
        generateCalendarDays={() => {
          const days = [];
          const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          
          for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
          }
          return days;
        }}
      />

      <DeliveryTypeModal
        isOpen={showDateModal}
        deliveryDate={orderForm.deliveryDate}
        onClose={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'showDateModal', value: false } })}
        onDeliveryTypeSelect={handleDeliveryTypeSelect}
        onChangeDate={handleChangeDateFromDeliveryModal}
      />

      <TimeSlotModal
        isOpen={showTimeSlotModal}
        selectedDate={orderForm.deliveryDate}
        selectedTime={orderForm.timeSlot}
        onTimeSelect={handleTimeSlotSelect}
        onClose={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'showTimeSlotModal', value: false } })}
        deliveryType="scheduled"
      />
    </div>
  );
};

export default DeliveryDetailsStepContent;
