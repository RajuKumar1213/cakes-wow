import React, { useRef, useEffect } from 'react';
import { 
  Truck, 

} from 'lucide-react';
import { OrderForm } from '@/constants/checkout';
// import { PersonalDetailsFormCollapsible } from './forms/PersonalDetailsFormCollapsible';
// import { DeliveryTimingFormCollapsible } from './forms/DeliveryTimingFormCollapsible';
// import { AddressFormCollapsible } from './forms/AddressFormCollapsible';

interface DeliveryDetailsStepProps {
  orderForm: OrderForm;
  errors: Partial<OrderForm>;
  onInputChange: (field: keyof OrderForm, value: string) => void;
  onAreaChange: (area: string) => void;
  onShowCalendar: () => void;
  onShowDateModal: () => void;
}

export const DeliveryDetailsStep: React.FC<DeliveryDetailsStepProps> = ({
  orderForm,
  errors,
  onInputChange,
  onAreaChange,
  onShowCalendar,
  onShowDateModal,
}) => {
  const personalDetailsRef = useRef<HTMLDivElement>(null);
  const deliveryTimingRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  // Check completion status for each form
  const isPersonalDetailsComplete = !!(
    orderForm.fullName?.trim() &&
    orderForm.email?.trim() &&
    orderForm.mobileNumber?.trim()
  );

  const isDeliveryTimingComplete = !!(
    orderForm.deliveryType &&
    orderForm.deliveryDate &&
    orderForm.timeSlot
  );

  const isAddressComplete = !!(
    orderForm.fullAddress?.trim() &&
    orderForm.area?.trim() &&
    orderForm.pinCode?.trim()
  );

  // Auto-scroll to next unfilled form when previous completes
  useEffect(() => {
    if (isPersonalDetailsComplete && !isDeliveryTimingComplete) {
      setTimeout(() => {
        deliveryTimingRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    } else if (isPersonalDetailsComplete && isDeliveryTimingComplete && !isAddressComplete) {
      setTimeout(() => {
        addressRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  }, [isPersonalDetailsComplete, isDeliveryTimingComplete, isAddressComplete]);
  return (
    <div className="space-y-4 md:space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-3 md:mb-4 shadow-lg">
          <Truck className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </div>
        <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
          Delivery Information
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Where should we deliver your delicious treats? 🍰
        </p>
      </div>

      {/* TODO: These collapsible forms need to be created */}
      <div className="p-4 border border-gray-300 rounded-lg">
        <p className="text-gray-600">Collapsible forms are not yet implemented.</p>
        <p className="text-sm text-gray-500">Use DeliveryDetailsStepContent.tsx instead.</p>
      </div>

      {/* Personal Details */}
      {/* <div ref={personalDetailsRef}>
        <PersonalDetailsFormCollapsible
          orderForm={orderForm}
          errors={errors}
          onInputChange={onInputChange}
          isComplete={isPersonalDetailsComplete}
        />
      </div> */}

      {/* Delivery Timing */}
      {/* <div ref={deliveryTimingRef}>
        <DeliveryTimingFormCollapsible
          orderForm={orderForm}
          errors={errors}
          onInputChange={onInputChange}
          onShowCalendar={onShowCalendar}
          onShowDateModal={onShowDateModal}
          isComplete={isDeliveryTimingComplete}
        />
      </div> */}

      {/* Address Details */}
      {/* <div ref={addressRef}>
        <AddressFormCollapsible
          orderForm={orderForm}
          errors={errors}
          onInputChange={onInputChange}
          onAreaChange={onAreaChange}
          isComplete={isAddressComplete}
        />
      </div> */}
    </div>
  );
};
