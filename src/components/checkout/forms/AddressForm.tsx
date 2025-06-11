import React, { useState, useEffect } from 'react';
import { MapPin, Home, Phone, User, Edit3, Plus, Trash2, ChevronRight, AlertCircle, Check } from 'lucide-react';
import { OrderForm } from '@/constants/checkout';
import { areaPinMap } from '@/constants/areaPinMap';
import { useAuth, Address } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AddressFormProps {
    orderForm: OrderForm;
    errors: Partial<OrderForm>;
    onInputChange: (field: keyof OrderForm, value: string) => void;
    onAreaChange: (area: string) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
    orderForm,
    onInputChange,
    onAreaChange,
}) => {
    const { user, addAddress, updateAddress, deleteAddress, checkAuth } = useAuth(); 
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
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
    const [formErrors, setFormErrors] = useState<Partial<Address>>({});
    
    const prefixes = ['Mr.', 'Ms.', 'Mrs.'];
    const addressTypes = ['Home', 'Office', 'Others'];
    
    // Explicitly fetch user data when component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoadingAddresses(true);
                // Force a refresh of the user data
                await checkAuth();
                console.log('User data refreshed');
            } catch (error) {
                console.error('Error refreshing user data:', error);
            } finally {
                // We don't set isLoadingAddresses to false here
                // It will be handled by the other useEffect
            }
        };
        
        if (user) {
            console.log('User already exists, checking addresses...');
            if (!user.address || user.address.length === 0) {
                console.log('No addresses found, refreshing user data...');
                fetchUserData();
            } else {
                console.log('User has addresses:', user.address.length);
                setIsLoadingAddresses(false);
            }
        } else {
            console.log('No user found, waiting for auth context...');
        }
    }, [user, checkAuth]);

    // Handle UI updates once we have user data
    useEffect(() => {
        console.log('User data changed, addresses:', user?.address?.length);
        
        // If user has addresses and none is selected, show address list
        if (user?.address && user.address.length > 0 && !selectedAddress) {
            setShowAddressForm(false);
        } else if (!user?.address || user.address.length === 0) {
            // If no addresses, show form
            setShowAddressForm(true);
        }

        // Update phone number if user data changes
        if (user?.phoneNumber && !formData.phoneNumber) {
            setFormData(prev => ({ ...prev, phoneNumber: user.phoneNumber }));
        }

        // Set loading to false once user data is processed
        setIsLoadingAddresses(false);
    }, [user?.address, selectedAddress, user?.phoneNumber, formData.phoneNumber]);
    
    useEffect(() => {
        if (user?.address && user.address.length > 0 && !selectedAddress && !orderForm.fullAddress && !orderForm.area) {
            console.log('Auto-selecting first address');
            const firstAddress = user.address[0];
            setSelectedAddress(firstAddress);
            onInputChange('fullAddress', firstAddress.fullAddress);
            onInputChange('pinCode', firstAddress.pinCode);
            onAreaChange(firstAddress.city);
        } else if (user?.address && user.address.length > 0 && !selectedAddress && (orderForm.fullAddress || orderForm.area)) {
            // If orderForm already has data, try to find a matching address
            console.log('Looking for matching address in user saved addresses');
            const matchingAddress = user.address.find(
                addr => addr.fullAddress === orderForm.fullAddress || addr.city === orderForm.area
            );
            
            if (matchingAddress) {
                console.log('Found matching address, selecting it');
                setSelectedAddress(matchingAddress);
            }
        }
    }, [user?.address, selectedAddress, orderForm.fullAddress, orderForm.area, onInputChange, onAreaChange]);

    // Sync orderForm data back to local formData when orderForm changes
    useEffect(() => {
        if (orderForm.fullAddress && !selectedAddress) {
            setFormData(prev => ({
                ...prev,
                fullAddress: orderForm.fullAddress,
                pinCode: orderForm.pinCode || prev.pinCode,
                city: orderForm.area || prev.city,
                receiverName: orderForm.fullName || prev.receiverName,
                phoneNumber: orderForm.mobileNumber || prev.phoneNumber
            }));
        }
    }, [orderForm.fullAddress, orderForm.pinCode, orderForm.area, orderForm.fullName, orderForm.mobileNumber, selectedAddress]);

    const handleInputChange = (field: keyof Address, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Also update parent orderForm for critical fields
        if (field === 'fullAddress') {
            onInputChange('fullAddress', value);
        } else if (field === 'pinCode') {
            onInputChange('pinCode', value);
        }
    };


    const handleAreaChange = (area: string) => {
        const pinCode = (areaPinMap as Record<string, string>)[area] || '';

        // Update local state
        setFormData(prev => ({ ...prev, city: area, pinCode }));

        // Update parent orderForm
        onAreaChange(area);
        onInputChange('pinCode', pinCode);
    };
    
    const validateForm = (): boolean => {
        const errors: Partial<Address> = {};

        if (!formData.receiverName.trim()) errors.receiverName = 'Receiver name is required';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.pinCode.trim()) errors.pinCode = 'PIN code is required';
        if (!formData.fullAddress.trim()) errors.fullAddress = 'Full address is required';
        // Phone number validation - only show error if empty or invalid
        const phoneNumber = formData.phoneNumber.trim();
        if (!phoneNumber) {
            errors.phoneNumber = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
            // Only show validation error if it's not the user's pre-filled phone number
            if (phoneNumber !== user?.phoneNumber) {
                errors.phoneNumber = 'Please enter a valid phone number';
            }
        }

        // Alternate phone number validation - only validate if provided
        const alternatePhone = (formData.alternatePhoneNumber ?? '').trim();
        if (alternatePhone && !/^[6-9]\d{9}$/.test(alternatePhone)) {
            errors.alternatePhoneNumber = 'Please enter a valid alternate phone number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveAddress = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            let success = false;
            if (editingAddress?._id) {
                success = await updateAddress(editingAddress._id, formData);
            } else {
                success = await addAddress(formData);
            } if (success) {
                setShowAddressForm(false);
                setEditingAddress(null);
                setFormData({
                    receiverName: '',
                    prefix: 'Mr.',
                    city: '',
                    pinCode: '',
                    fullAddress: '',
                    phoneNumber: user?.phoneNumber || '',
                    alternatePhoneNumber: '',
                    addressType: 'Home'
                });
            }
        } catch (error) {
            console.error('Error saving address:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditAddress = (address: Address) => {
        setFormData(address);
        setEditingAddress(address);
        setShowAddressForm(true);
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        setIsLoading(true);
        try {
            await deleteAddress(addressId);
            if (selectedAddress?._id === addressId) {
                setSelectedAddress(null);
            }
        } catch (error) {
            console.error('Error deleting address:', error);
        } finally {
            setIsLoading(false);
        }
    }; 
    
    const handleSelectAddress = (address: Address) => {
        setSelectedAddress(address);
        // Update order form with selected address
        onInputChange('fullAddress', address.fullAddress);
        onInputChange('pinCode', address.pinCode);
        onAreaChange(address.city);
    };
    
    const handleAddNewAddress = () => {
        setFormData({
            receiverName: '',
            prefix: 'Mr.',
            city: '',
            pinCode: '',
            fullAddress: '',
            phoneNumber: user?.phoneNumber || '',
            alternatePhoneNumber: '',
            addressType: 'Home'
        });
        setEditingAddress(null);
        setShowAddressForm(true);
    };
    
    // Show loading spinner if address data is still loading
    if (isLoadingAddresses) {
        return (
            <div className="bg-white rounded shadow-xl overflow-hidden">
                <div className="bg-green-600 text-white p-3 md:p-4">
                    <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                        Delivery Address
                    </h2>
                    <p className="text-green-100 mt-1 text-xs md:text-sm">Where should we bring the sweetness? 🏠</p>
                </div>
                <div className="p-4 md:p-6 flex items-center justify-center min-h-[200px]">
                    <LoadingSpinner size="md" color="primary" text="Loading your addresses..." />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded shadow-xl overflow-hidden">
            <div className="bg-green-600 text-white p-3 md:p-4">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    Delivery Address
                </h2>
                <p className="text-green-100 mt-1 text-xs md:text-sm">Where should we bring the sweetness? 🏠</p>
            </div>

            <div className="p-4 md:p-6">
                {/* Address List View */}
                {!showAddressForm && user?.address && user.address.length > 0 && (
                    <div className="space-y-4">
                        {user.address.map((address) => (
                            <div
                                key={address._id}
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${selectedAddress?._id === address._id
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                    }`}
                                onClick={() => handleSelectAddress(address)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                                {address.addressType}
                                            </span>
                                            {selectedAddress?._id === address._id && (
                                                <Check className="w-4 h-4 text-green-600" />
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-gray-800">
                                            {address.prefix} {address.receiverName}
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {address.fullAddress}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            {address.city}, {address.pinCode}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            📞 {address.phoneNumber}
                                            {address.alternatePhoneNumber && `, ${address.alternatePhoneNumber}`}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditAddress(address);
                                            }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAddress(address._id!);
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={handleAddNewAddress}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-green-400 hover:text-green-600 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Address
                        </button>
                    </div>
                )}

                {/* Address Form */}
                {showAddressForm && (
                    <div className="space-y-4">
                        {/* Receiver Name Row */}
                        <div className="flex gap-4">

                            <div className="">
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    Prefix *
                                </label>
                                <select
                                    value={formData.prefix}
                                    onChange={(e) => handleInputChange('prefix', e.target.value)}
                                    className="w-fit px-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-green-400 transition-all duration-300"
                                >
                                    {prefixes.map((prefix) => (
                                        <option key={prefix} value={prefix}>
                                            {prefix}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="group">
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    Receiver Name *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.receiverName}
                                        onChange={(e) => handleInputChange('receiverName', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-3 border-2 rounded-lg focus:ring-0 focus:border-green-400 transition-all duration-300 ${formErrors.receiverName ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                            }`}
                                        placeholder="Enter receiver name"
                                    />
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                                {formErrors.receiverName && (
                                    <div className="mt-2 flex items-center text-red-500 text-xs">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {formErrors.receiverName}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* City and PIN Code */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center">
                                        <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                                        Delivery Area * (Hyderabad)
                                    </div>
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.city}
                                        onChange={(e) => handleAreaChange(e.target.value)}
                                        className={`w-full pl-10 pr-8 py-3 border-2 rounded-lg focus:ring-0 focus:border-green-400 transition-all duration-300 appearance-none ${formErrors.city ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                            }`}
                                    >
                                        <option value="">Choose your city</option>
                                        {Object.keys(areaPinMap).map((area) => (
                                            <option key={area} value={area}>
                                                {area}
                                            </option>
                                        ))}
                                    </select>
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-gray-400" />
                                </div>
                                {formErrors.city && (
                                    <div className="mt-2 flex items-center text-red-500 text-xs">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {formErrors.city}
                                    </div>
                                )}
                            </div>                            <div className="group">
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center">
                                        <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                                        PIN Code *
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.pinCode}
                                        onChange={(e) => handleInputChange('pinCode', e.target.value)}
                                        readOnly={!!formData.city} // Read-only only when city is selected
                                        className={`w-full pl-10 pr-3 py-3 border-2 rounded-lg focus:ring-0 focus:border-green-400 transition-all duration-300 ${formData.city
                                            ? 'bg-gray-100 text-gray-600 border-gray-200'
                                            : formErrors.pinCode
                                                ? 'border-red-400 bg-red-50'
                                                : 'border-gray-200'
                                            }`}
                                        placeholder={formData.city ? "Auto-filled based on city" : "Enter PIN code manually"}
                                    />
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    {formData.pinCode && formData.city && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <Check className="w-4 h-4 text-green-500" />
                                        </div>
                                    )}
                                </div>
                                {formErrors.pinCode && (
                                    <div className="mt-2 flex items-center text-red-500 text-xs">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {formErrors.pinCode}
                                    </div>
                                )}
                                {!formData.city && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        💡 Select an area above to auto-fill PIN code, or enter manually
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Full Address */}
                        <div className="group">
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <Home className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                                    Delivery Address *
                                </div>
                            </label>
                            <div className="relative">
                                <textarea
                                    value={formData.fullAddress}
                                    onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                                    rows={3}
                                    className={`w-full pl-10 pr-3 py-3 border-2 rounded-lg focus:ring-0 focus:border-green-400 transition-all duration-300 resize-none ${formErrors.fullAddress ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                        }`}
                                    placeholder="House number, building name, street details..."
                                />
                                <Home className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            </div>
                            {formErrors.fullAddress && (
                                <div className="mt-2 flex items-center text-red-500 text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {formErrors.fullAddress}
                                </div>
                            )}
                        </div>

                        {/* Phone Numbers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center">
                                        <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                                        Shipping Phone Number *
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-3 border-2 rounded-lg focus:ring-0 focus:border-green-400 transition-all duration-300 ${formErrors.phoneNumber ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                            }`}
                                        placeholder="Enter phone number"
                                    />
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                                {formErrors.phoneNumber && (
                                    <div className="mt-2 flex items-center text-red-500 text-xs">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {formErrors.phoneNumber}
                                    </div>
                                )}
                            </div>

                            <div className="group">
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center">
                                        <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-gray-400" />
                                        Add Alternate Phone Number
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={formData.alternatePhoneNumber}
                                        onChange={(e) => handleInputChange('alternatePhoneNumber', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-3 border-2 rounded-lg focus:ring-0 focus:border-green-400 transition-all duration-300 ${formErrors.alternatePhoneNumber ? 'border-red-400 bg-red-50' : 'border-gray-200'
                                            }`}
                                        placeholder="Alternate phone number"
                                    />
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                                {formErrors.alternatePhoneNumber && (
                                    <div className="mt-2 flex items-center text-red-500 text-xs">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {formErrors.alternatePhoneNumber}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Address Type */}
                        <div className="group">
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                Address Type *
                            </label>
                            <div className="flex gap-4">
                                {addressTypes.map((type) => (
                                    <label key={type} className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="addressType"
                                            value={type}
                                            checked={formData.addressType === type}
                                            onChange={(e) => handleInputChange('addressType', e.target.value)}
                                            className="mr-2 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleSaveAddress}
                                disabled={isLoading}
                                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-300 font-medium"
                            >
                                {isLoading ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddressForm(false);
                                    setEditingAddress(null);
                                }}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
