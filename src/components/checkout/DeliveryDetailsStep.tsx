import React from 'react';
import { 
  Truck, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  Home, 
  Package, 
  Star, 
  Gift,
  Heart,
  Calendar,
  AlertCircle,
  Check
} from 'lucide-react';
import { OrderForm, areaPinMap } from '@/constants/checkout';
import { PersonalDetailsForm } from './forms/PersonalDetailsForm';
import { DeliveryTimingForm } from './forms/DeliveryTimingForm';
import { AddressForm } from './forms/AddressForm';
// import { AddressForm } from './forms/AddressForm';

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

      <form className="space-y-4 md:space-y-8">
        {/* Personal Details Section */}
        <PersonalDetailsForm
          orderForm={orderForm}
          errors={errors}
          onInputChange={onInputChange}
        />

        {/* Delivery Timing Section */}
        <DeliveryTimingForm
          orderForm={orderForm}
          errors={errors}
          onShowCalendar={onShowCalendar}
          onShowDateModal={onShowDateModal} onUpdateField={function (field: keyof OrderForm, value: string): void {
            throw new Error('Function not implemented.');
          } } onContinue={function (): void {
            throw new Error('Function not implemented.');
          } }        />

        {/* Address Section */}
        <AddressForm
          orderForm={orderForm}
          errors={errors}
          onInputChange={onInputChange}
          onAreaChange={onAreaChange}
        />

        {/* Fun Delivery Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-200">
          <div className="flex items-center justify-center mb-3 md:mb-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-500 animate-pulse" />
              <span className="font-medium text-purple-900 text-sm md:text-base">
                Almost ready to deliver happiness!
              </span>
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-500 animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-center">
            <div className="flex flex-col items-center p-3 bg-white rounded-lg md:rounded-xl shadow-sm">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Truck className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
              </div>
              <span className="text-xs md:text-sm font-medium text-purple-900">
                Fast Delivery
              </span>
              <span className="text-xs text-purple-600">
                Within 2-4 hours
              </span>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-white rounded-lg md:rounded-xl shadow-sm">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <Gift className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
              </div>
              <span className="text-xs md:text-sm font-medium text-purple-900">
                Fresh Quality
              </span>
              <span className="text-xs text-purple-600">
                Guaranteed freshness
              </span>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-white rounded-lg md:rounded-xl shadow-sm">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Heart className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
              </div>
              <span className="text-xs md:text-sm font-medium text-purple-900">
                Made with Love
              </span>
              <span className="text-xs text-purple-600">
                Each order special
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
