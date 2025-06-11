'use client';

import React, { useState } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalDetailsForm } from '@/components/checkout/forms/PersonalDetailsForm';
import { AddressForm } from '@/components/checkout/forms/AddressForm';
import { DeliveryTimingForm } from '@/components/checkout/forms/DeliveryTimingForm';
import { CalendarModal } from '@/components/checkout/modals/CalendarModal';
import { DeliveryTypeModal } from '@/components/checkout/modals/DeliveryTypeModal';
import TimeSlotModal from '@/components/checkout/modals/TimeSlotModal';
import { validatePersonalDetails, validateAddress } from '@/utils/validation';
import { areaPinMap } from '@/constants/areaPinMap';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';


const DeliveryDetailsStepContent: React.FC = () => {
  const { state, dispatch, updateOrderForm, goToNextStep, goToPreviousStep } = useCheckout();
  const router = useRouter();
  const { user, updateUser, addAddress } = useAuth();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
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
    // Fix for timezone issues - use local date formatting instead of ISO string
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
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
  };  const handleTimeSlotSelect = (timeSlot: string) => {
    updateOrderForm('timeSlot', timeSlot);
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showTimeSlotModal', value: false } });
  };

  const handleGoBackToDeliveryType = () => {
    // Close time slot modal and open delivery type modal
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showTimeSlotModal', value: false } });
    dispatch({ type: 'SET_MODAL', payload: { modal: 'showDateModal', value: true } });
  };

  const handleUpdateField = (field: string, value: string) => {
    updateOrderForm(field as keyof typeof orderForm, value);
  };  const handleContinue = async () => {
    try {
      setIsAutoSaving(true); // Start loading
      console.log('🔒 Automatically saving user data before proceeding to payment...');
        // Debug orderForm data
      console.log('🔍 Debug - orderForm data:', {
        fullName: orderForm.fullName,
        mobileNumber: orderForm.mobileNumber,
        email: orderForm.email,
        fullAddress: orderForm.fullAddress,
        area: orderForm.area,
        pinCode: orderForm.pinCode,
        landmark: orderForm.landmark,
        deliveryDate: orderForm.deliveryDate,
        deliveryType: orderForm.deliveryType,
        timeSlot: orderForm.timeSlot
      });

      // If user is logged in, skip validation and proceed directly to save
      if (user) {
        console.log('✅ User is logged in - skipping validation and proceeding to save...');
      } else {
        console.log('⚠️ Running validation checks for guest user...');
        
        // Only run validation for guest users
        const personalDetailsErrors = validatePersonalDetails({
          firstName: orderForm.fullName?.split(' ')[0] || '',
          lastName: orderForm.fullName?.split(' ').slice(1).join(' ') || '',
          email: orderForm.email || '',
          phone: orderForm.mobileNumber ? orderForm.mobileNumber.replace(/^\+?91/, '') : '',
        });

        const addressErrors = validateAddress({
          address: orderForm.fullAddress || '',
          landmark: orderForm.landmark || '',
          pincode: orderForm.pinCode || '',
          area: orderForm.area || '',
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
          console.log('❌ Validation errors found:', allErrors);
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
          setIsAutoSaving(false);
          return;
        }
      }

      // AUTOMATIC SAVING LOGIC - Save personal details and address before creating order
      console.log('🔒 All validations passed, proceeding with auto-save...');
      
      // Step 1: Save personal details to user profile if user is logged in
      if (user && (orderForm.fullName.trim() || orderForm.email.trim())) {
        console.log('💾 Auto-saving personal details to user profile...');
        try {
          const updateData: { name?: string; email?: string } = {};
          if (orderForm.fullName.trim()) {
            updateData.name = orderForm.fullName.trim();
          }
          if (orderForm.email.trim()) {
            updateData.email = orderForm.email.trim();
          }
          
          const personalDetailsSuccess = await updateUser(updateData);
          if (personalDetailsSuccess) {
            console.log('✅ Personal details saved successfully');
          } else {
            console.warn('⚠️ Failed to save personal details, but continuing...');
          }
        } catch (error) {
          console.error('❌ Error saving personal details:', error);
          // Continue anyway, don't block the checkout process
        }
      }      // Step 2: Save address to user's address book if user is logged in and address is complete
      console.log('🔍 Address save check:', {
        user: !!user,
        fullAddress: orderForm.fullAddress,
        area: orderForm.area,
        pinCode: orderForm.pinCode
      });

      if (user && orderForm.fullAddress?.trim() && orderForm.area?.trim() && orderForm.pinCode?.trim()) {
        console.log('🏠 Auto-saving address to user address book...');
        try {
          // Check if this exact address already exists
          const addressExists = user.address?.some((addr: any) => 
            addr.fullAddress === orderForm.fullAddress.trim() &&
            addr.city === orderForm.area.trim() &&
            addr.pinCode === orderForm.pinCode.trim()
          );

          console.log('🔍 Address exists check:', addressExists);

          if (!addressExists) {
            const newAddress = {
              receiverName: orderForm.fullName?.trim() || 'Default Receiver',
              prefix: 'Mr.',
              city: orderForm.area.trim(),
              pinCode: orderForm.pinCode.trim(),
              fullAddress: orderForm.fullAddress.trim(),
              phoneNumber: orderForm.mobileNumber || user.phoneNumber || '',
              alternatePhoneNumber: '',
              addressType: 'Home' as const
            };

            console.log('🏠 Attempting to save address:', newAddress);
            const addressSuccess = await addAddress(newAddress);
            if (addressSuccess) {
              console.log('✅ Address saved successfully to address book');
            } else {
              console.warn('⚠️ Failed to save address, but continuing...');
            }
          } else {
            console.log('ℹ️ Address already exists in address book, skipping save');
          }
        } catch (error) {
          console.error('❌ Error saving address:', error);
          // Continue anyway, don't block the checkout process
        }
      } else {
        console.log('❌ Address save skipped - missing required data:', {
          hasUser: !!user,
          hasFullAddress: !!(orderForm.fullAddress?.trim()),
          hasArea: !!(orderForm.area?.trim()),
          hasPinCode: !!(orderForm.pinCode?.trim())
        });      }

      // All data saved successfully, proceed to next step
      console.log('✅ All data saved successfully, proceeding to next step...');
      setIsAutoSaving(false); // Stop loading
      goToNextStep();
      
    } catch (error) {
      console.error('❌ Error in checkout process:', error);
      setIsAutoSaving(false); // Stop loading on error
      // You can show an error message to the user here
      alert('Failed to save data. Please try again.');
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
  };  return (
    <div className="p-3 md:p-6 relative">
      {/* Auto-save Loading Overlay */}
      {isAutoSaving && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
            <LoadingSpinner size="md" color="primary" text="Saving your data securely..." />
            <p className="text-sm text-gray-600 mt-2 text-center">This will only take a moment</p>
          </div>
        </div>
      )}

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
            onClick={()=> router.back()}
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
      />      <TimeSlotModal
        isOpen={showTimeSlotModal}
        selectedDate={orderForm.deliveryDate}
        selectedTime={orderForm.timeSlot}
        onTimeSelect={handleTimeSlotSelect}
        onClose={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'showTimeSlotModal', value: false } })}
        deliveryType="scheduled"
        selectedDeliveryTypeId={orderForm.deliveryType}
        onGoBackToDeliveryType={handleGoBackToDeliveryType}
      />
    </div>
  );
};

export default DeliveryDetailsStepContent;
