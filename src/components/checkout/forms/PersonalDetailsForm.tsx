import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, AlertCircle, Save, Check } from 'lucide-react';
import { OrderForm } from '@/constants/checkout';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PersonalDetailsFormProps {
  orderForm: OrderForm;
  errors: Partial<OrderForm>;
  onInputChange: (field: keyof OrderForm, value: string) => void;
}

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  orderForm,
  errors,
  onInputChange,
}) => {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [originalUserData, setOriginalUserData] = useState<{
    fullName: string;
    email: string;
  }>({ fullName: '', email: '' });
  // Initialize original user data and set loading state
  useEffect(() => {
    if (user) {
      // Store original data for change detection
      setOriginalUserData({
        fullName: user.name || '',
        email: user.email || ''
      });
    }
    setIsLoadingUserData(false);
  }, [user]);

  // Check if there are changes from original data
  const hasChanges =
    orderForm.fullName !== originalUserData.fullName ||
    orderForm.email !== originalUserData.email;

  // Get list of changed fields
  const changedFields = [];
  if (orderForm.fullName !== originalUserData.fullName) changedFields.push('Name');
  if (orderForm.email !== originalUserData.email) changedFields.push('Email');

  // Show loading spinner if user data is still loading
  if (isLoadingUserData && !user) {
    return (
      <div className="bg-white rounded shadow-xl overflow-hidden">
        <div className="bg-orange-600 text-white p-3 md:p-4">
          <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
            <User className="w-4 h-4 md:w-5 md:h-5" />
            Personal Details
          </h2>
          <p className="text-orange-100 mt-1 text-xs md:text-sm">Help us deliver to the right person 👤</p>
        </div>
        <div className="p-4 md:p-6 flex items-center justify-center min-h-[200px]">
          <LoadingSpinner size="md" color="primary" text="Loading your profile..." />
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!user) return;

    // Check if there's anything to save
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
    }

    const success = await updateUser(updateData); if (success) {
      setSaveSuccess(true);
      // Reset original data to current values after successful save
      setOriginalUserData({
        fullName: orderForm.fullName || '',
        email: orderForm.email || ''
      });
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError('Failed to save. Please try again.');
    }

    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded shadow-xl overflow-hidden">
      <div className="bg-orange-600 text-white p-3 md:p-4">
        <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
          <User className="w-4 h-4 md:w-5 md:h-5" />
          Personal Details
        </h2>
        <p className="text-orange-100 mt-1 text-xs md:text-sm">Help us deliver to the right person 👤</p>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="group">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-orange-600">
              <div className="flex items-center">
                <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-orange-500" />
                Full Name *
              </div>
            </label>
            <div className="relative">            <input
              type="text"
              value={orderForm.fullName}
              onChange={(e) => onInputChange("fullName", e.target.value)}
              className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 focus:border-orange-400 transition-all duration-300 bg-white shadow-sm text-sm md:text-base ${errors.fullName
                  ? "border-red-400 bg-red-50"
                  : orderForm.fullName !== originalUserData.fullName
                    ? "border-orange-300 bg-orange-50 ring-2 ring-orange-100"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              placeholder="Who's receiving this sweetness?"
            />
              <User
                className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 transition-colors ${errors.fullName ? "text-red-400" : "text-gray-400"
                  }`}
              />
            </div>
            {errors.fullName && (
              <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                {errors.fullName}
              </div>
            )}
          </div>        <div className="group">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-orange-600">
              <div className="flex items-center">
                <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-orange-500" />
                Mobile Number *
                {orderForm.mobileNumber && (
                  <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={orderForm.mobileNumber}
                onChange={(e) => !orderForm.mobileNumber && onInputChange("mobileNumber", e.target.value)}
                readOnly={!!orderForm.mobileNumber}
                className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 transition-all duration-300 shadow-sm text-sm md:text-base ${orderForm.mobileNumber
                    ? "bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed"
                    : "bg-white border-gray-200 hover:border-orange-300 focus:border-orange-400"
                  }`}
                placeholder={orderForm.mobileNumber ? "Your verified mobile number" : "For delivery updates & calls"}
              />
              <Phone
                className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 ${orderForm.mobileNumber ? "text-green-500" : "text-gray-400"
                  }`}
              />
            </div>
            {!orderForm.mobileNumber && errors.mobileNumber && (
              <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                {errors.mobileNumber}
              </div>
            )}
          </div>

          <div className="md:col-span-2 group">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-orange-600">
              <div className="flex items-center">
                <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-orange-500" />
                Email Address *
              </div>
            </label>
            <div className="relative">            <input
              type="email"
              value={orderForm.email}
              onChange={(e) => onInputChange("email", e.target.value)}
              className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 focus:border-orange-400 transition-all duration-300 bg-white shadow-sm text-sm md:text-base ${errors.email
                  ? "border-red-400 bg-red-50"
                  : orderForm.email !== originalUserData.email
                    ? "border-orange-300 bg-orange-50 ring-2 ring-orange-100"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              placeholder="Where to send order updates?"
            />
              <Mail
                className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 transition-colors ${errors.email ? "text-red-400" : "text-gray-400"
                  }`}
              />
            </div>          {errors.email && (
              <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                {errors.email}
              </div>)}
          </div>
        </div>        {/* Save Button Section */}
        {user && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                Save your details to your profile for future orders
                {hasChanges && changedFields.length > 0 && (
                  <div className="text-xs text-orange-600 mt-1 font-medium">
                    ✨ Changes detected: {changedFields.join(', ')}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {saveError && (
                  <div className="flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {saveError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check className="w-4 h-4 mr-1" />
                    Saved successfully!
                  </div>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${                    isSaving || !hasChanges
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : hasChanges
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transform hover:scale-105'
                        : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg'
                    }`}                
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : (user?.name ? 'No Changes' : 'Save Details')}
                </button>
              </div>
            </div>
          </div>
        )}      
        </div>
    </div>
  );
};
