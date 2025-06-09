import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, AlertCircle, Save, Check, Edit3, ChevronUp, ChevronDown } from 'lucide-react';
import { OrderForm } from '@/constants/checkout';
import { useAuth } from '@/contexts/AuthContext';

interface PersonalDetailsFormCollapsibleProps {
  orderForm: OrderForm;
  errors: Partial<OrderForm>;
  onInputChange: (field: keyof OrderForm, value: string) => void;
  isComplete: boolean;
}

export const PersonalDetailsFormCollapsible: React.FC<PersonalDetailsFormCollapsibleProps> = ({
  orderForm,
  errors,
  onInputChange,
  isComplete,
}) => {
  const { user, updateUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(!isComplete);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Auto-collapse when form becomes complete
  useEffect(() => {
    if (isComplete && isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, isExpanded]);

  // Load user data into form when user is available
  useEffect(() => {
    if (user && user.name && !orderForm.fullName) {
      onInputChange('fullName', user.name);
    }
    if (user && user.email && !orderForm.email) {
      onInputChange('email', user.email);
    }
    if (user && user.phoneNumber && !orderForm.mobileNumber) {
      onInputChange('mobileNumber', user.phoneNumber);
    }
  }, [user, onInputChange, orderForm.fullName, orderForm.email, orderForm.mobileNumber]);

  const handleSave = async () => {
    if (!user) return;

    if (!orderForm.fullName.trim() && !orderForm.email.trim()) {
      setSaveError('Please fill in name and email to save');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const updateData: { name?: string; email?: string } = {};
    if (orderForm.fullName.trim()) {
      updateData.name = orderForm.fullName.trim();
    }
    if (orderForm.email.trim()) {
      updateData.email = orderForm.email.trim();
    }    try {
      const result = await updateUser(updateData);
      if (result) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError('Failed to save profile');
      }
    } catch (error) {
      setSaveError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

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
                <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900">
                Personal Details
              </h3>
              {isComplete && (
                <p className="text-xs md:text-sm text-gray-600">
                  {orderForm.fullName} • {orderForm.email}
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
            <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            Personal Details
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

      <div className="space-y-3 md:space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              value={orderForm.fullName}
              onChange={(e) => onInputChange('fullName', e.target.value)}
              className={`w-full pl-9 md:pl-12 pr-3 py-2 md:py-3 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="email"
              value={orderForm.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              className={`w-full pl-9 md:pl-12 pr-3 py-2 md:py-3 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
            Mobile Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="tel"
              value={orderForm.mobileNumber}
              onChange={(e) => onInputChange('mobileNumber', e.target.value)}
              className={`w-full pl-9 md:pl-12 pr-3 py-2 md:py-3 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your mobile number"
            />
          </div>
          {errors.mobileNumber && (
            <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {errors.mobileNumber}
            </p>
          )}
        </div>

        {/* Save Profile Button */}
        {user && (
          <div className="pt-2 md:pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving || (!orderForm.fullName.trim() && !orderForm.email.trim())}
              className="flex items-center space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 text-xs md:text-sm font-medium rounded-lg transition-colors"
            >
              {isSaving ? (
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3 h-3 md:w-4 md:h-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save to Profile'}</span>
            </button>

            {saveSuccess && (
              <p className="mt-2 text-xs md:text-sm text-green-600 flex items-center">
                <Check className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Profile updated successfully!
              </p>
            )}

            {saveError && (
              <p className="mt-2 text-xs md:text-sm text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                {saveError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};