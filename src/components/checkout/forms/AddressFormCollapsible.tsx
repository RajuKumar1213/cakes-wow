import React, { useState, useEffect } from 'react';
import { MapPin, Home, Phone, User, Edit3, Plus, ChevronUp, AlertCircle, Check } from 'lucide-react';
import { OrderForm } from '@/constants/checkout';
import { areaPinMap } from '@/constants/areaPinMap';
import { useAuth, Address } from '@/contexts/AuthContext';

interface AddressFormCollapsibleProps {
  orderForm: OrderForm;
  errors: Partial<OrderForm>;
  onInputChange: (field: keyof OrderForm, value: string) => void;
  onAreaChange: (area: string) => void;
  isComplete: boolean;
}

export const AddressFormCollapsible: React.FC<AddressFormCollapsibleProps> = ({
  orderForm,
  errors,
  onInputChange,
  onAreaChange,
  isComplete,
}) => {
  const { user, addAddress } = useAuth();
  const [isExpanded, setIsExpanded] = useState(!isComplete);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Address>({
    receiverName: '',
    prefix: 'Mr.',
    city: '',
    pinCode: '',
    fullAddress: '',
    phoneNumber: user?.phoneNumber || '',
    alternatePhoneNumber: '',
    addressType: 'Home'
  });

  const prefixes = ['Mr.', 'Ms.', 'Mrs.', 'Dr.'];
  const addressTypes = ['Home', 'Office', 'Others'];
  const areas = Object.keys(areaPinMap);

  // Auto-collapse when form becomes complete
  useEffect(() => {
    if (isComplete && isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, isExpanded]);

  // Auto-select first address if available
  useEffect(() => {
    if (user?.address && user.address.length > 0 && !selectedAddress && !orderForm.fullAddress) {
      const firstAddress = user.address[0];
      setSelectedAddress(firstAddress);
      onInputChange('fullAddress', firstAddress.fullAddress);
      onInputChange('pinCode', firstAddress.pinCode);
      onAreaChange(firstAddress.city);
    }
  }, [user?.address, selectedAddress, orderForm.fullAddress, onInputChange, onAreaChange]);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    onInputChange('fullAddress', address.fullAddress);
    onInputChange('pinCode', address.pinCode);
    onAreaChange(address.city);
  };

  const handleInputChange = (field: keyof Address, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAreaChange = (area: string) => {
    const pinCode = (areaPinMap as Record<string, string>)[area] || '';
    setFormData(prev => ({ ...prev, city: area, pinCode }));
    onAreaChange(area);
    onInputChange('pinCode', pinCode);
  };

  const handleSaveAddress = async () => {
    if (!formData.receiverName.trim() || !formData.city.trim() || !formData.fullAddress.trim()) {
      return;
    }

    setIsLoading(true);    try {
      const result = await addAddress(formData);
      if (result) {
        // Auto-select the new address
        const newAddress = { ...formData };
        setSelectedAddress(newAddress);
        onInputChange('fullAddress', newAddress.fullAddress);
        onInputChange('pinCode', newAddress.pinCode);
        onAreaChange(newAddress.city);
        setShowAddressForm(false);
      }
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsLoading(false);
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
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900">
                Delivery Address
              </h3>
              {isComplete && (
                <p className="text-xs md:text-sm text-gray-600">
                  {orderForm.area} • {orderForm.pinCode}
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
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">
            Delivery Address
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
        {/* Saved Addresses */}
        {user?.address && user.address.length > 0 && !showAddressForm && (
          <div>
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <label className="block text-sm md:text-base font-medium text-gray-700">
                Saved Addresses
              </label>
              <button
                onClick={() => setShowAddressForm(true)}
                className="flex items-center space-x-1 px-2 md:px-3 py-1 text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
                <span>Add New</span>
              </button>
            </div>
            <div className="space-y-2">
              {user.address.map((address, index) => (
                <button
                  key={index}
                  onClick={() => handleAddressSelect(address)}
                  className={`w-full p-3 md:p-4 border-2 rounded-lg text-left transition-all ${
                    selectedAddress === address
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Home className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                        <span className="text-xs md:text-sm font-medium text-gray-600">
                          {address.addressType}
                        </span>
                      </div>
                      <p className="text-sm md:text-base font-medium">{address.receiverName}</p>
                      <p className="text-xs md:text-sm text-gray-600">{address.fullAddress}</p>
                      <p className="text-xs md:text-sm text-gray-600">{address.city} - {address.pinCode}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* New Address Form */}
        {(showAddressForm || !user?.address || user.address.length === 0) && (
          <div className="space-y-3 md:space-y-4">
            {user?.address && user.address.length > 0 && (
              <div className="flex items-center justify-between">
                <h4 className="text-sm md:text-base font-medium text-gray-700">Add New Address</h4>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="text-xs md:text-sm text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Receiver Name */}
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                Receiver Name *
              </label>
              <div className="flex space-x-2">
                <select
                  value={formData.prefix}
                  onChange={(e) => handleInputChange('prefix', e.target.value)}
                  className="w-20 md:w-24 p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {prefixes.map((prefix) => (
                    <option key={prefix} value={prefix}>{prefix}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={formData.receiverName}
                  onChange={(e) => handleInputChange('receiverName', e.target.value)}
                  className="flex-1 p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter receiver name"
                />
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                Area *
              </label>
              <select
                value={formData.city || orderForm.area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className={`w-full p-2 md:p-3 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.area ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select your area</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              {errors.area && (
                <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  {errors.area}
                </p>
              )}
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                PIN Code *
              </label>
              <input
                type="text"
                value={formData.pinCode || orderForm.pinCode}
                onChange={(e) => {
                  handleInputChange('pinCode', e.target.value);
                  onInputChange('pinCode', e.target.value);
                }}
                className={`w-full p-2 md:p-3 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pinCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter PIN code"
                readOnly={!!formData.city}
              />
              {errors.pinCode && (
                <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  {errors.pinCode}
                </p>
              )}
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                Full Address *
              </label>
              <textarea
                value={formData.fullAddress || orderForm.fullAddress}
                onChange={(e) => {
                  handleInputChange('fullAddress', e.target.value);
                  onInputChange('fullAddress', e.target.value);
                }}
                className={`w-full p-2 md:p-3 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fullAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter complete address with landmarks"
                rows={3}
              />
              {errors.fullAddress && (
                <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  {errors.fullAddress}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>

            {/* Address Type */}
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
                Address Type
              </label>
              <div className="flex space-x-2 md:space-x-3">
                {addressTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleInputChange('addressType', type)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                      formData.addressType === type
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Address Button */}
            {user && (
              <button
                onClick={handleSaveAddress}
                disabled={isLoading || !formData.receiverName.trim() || !formData.city.trim() || !formData.fullAddress.trim()}
                className="w-full px-4 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm md:text-base font-medium rounded-lg transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Address'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};