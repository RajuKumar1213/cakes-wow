/**
 * Validation utilities for checkout forms
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate pincode (6 digits)
 */
export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Validate required field
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Validate personal details form
 */
export const validatePersonalDetails = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateRequired(formData.firstName)) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  // Remove lastName requirement - customers can proceed with just first name
  // if (!validateRequired(formData.lastName)) {
  //   errors.push({ field: 'lastName', message: 'Last name is required' });
  // }

  if (!validateRequired(formData.email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(formData.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }

  if (!validateRequired(formData.phone)) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (!validatePhone(formData.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid 10-digit phone number' });
  }

  return errors;
};

/**
 * Validate address form
 */
export const validateAddress = (formData: {
  address: string;
  landmark: string;
  pincode: string;
  area: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateRequired(formData.address)) {
    errors.push({ field: 'address', message: 'Address is required' });
  } else if (!validateMinLength(formData.address, 10)) {
    errors.push({ field: 'address', message: 'Address must be at least 10 characters' });
  }

  if (!validateRequired(formData.pincode)) {
    errors.push({ field: 'pincode', message: 'Pincode is required' });
  } else if (!validatePincode(formData.pincode)) {
    errors.push({ field: 'pincode', message: 'Please enter a valid 6-digit pincode' });
  }

  if (!validateRequired(formData.area)) {
    errors.push({ field: 'area', message: 'Area is required' });
  }

  return errors;
};

/**
 * Validate delivery timing
 */
export const validateDeliveryTiming = (formData: {
  deliveryType: string;
  deliveryDate: string;
  deliveryTime: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateRequired(formData.deliveryType)) {
    errors.push({ field: 'deliveryType', message: 'Delivery type is required' });
  }

  if (formData.deliveryType === 'scheduled') {
    if (!validateRequired(formData.deliveryDate)) {
      errors.push({ field: 'deliveryDate', message: 'Delivery date is required' });
    }

    if (!validateRequired(formData.deliveryTime)) {
      errors.push({ field: 'deliveryTime', message: 'Delivery time is required' });
    }
  }

  return errors;
};

/**
 * Validate payment step
 */
export const validatePayment = (formData: {
  paymentMethod: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateRequired(formData.paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: 'Payment method is required' });
  }

  return errors;
};

/**
 * Get error message for field
 */
export const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
  const error = errors.find(err => err.field === field);
  return error?.message;
};