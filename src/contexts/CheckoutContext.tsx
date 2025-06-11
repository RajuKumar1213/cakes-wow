import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

export interface OrderForm {
  fullName: string;
  mobileNumber: string;
  email: string;
  deliveryDate: string;
  deliveryType: string;
  timeSlot: string;
  area: string;
  pinCode: string;
  fullAddress: string;
  landmark: string;
  specialInstructions: string;
  paymentMethod: string;
  // New delivery detail fields
  deliveryOccasion: string;
  relation: string;
  senderName: string;
  messageOnCard: string;
}

interface CheckoutState {
  currentStep: number;
  orderForm: OrderForm;
  errors: Partial<OrderForm>;
  isSubmitting: boolean;
  loading: boolean;
  orderSuccess: boolean;
  showDateModal: boolean;
  showTimeSlotModal: boolean;
  showCalendar: boolean;
  isCalendarClosing: boolean;
  selectedDeliveryType: any;
  currentMonth: Date;
  selectedDate: Date | null;
  selectedAddOns: any[];
  addOnQuantities: { [key: string]: number };
}

type CheckoutAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FORM'; payload: { field: keyof OrderForm; value: string } }
  | { type: 'SET_ERRORS'; payload: Partial<OrderForm> }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ORDER_SUCCESS'; payload: boolean }
  | { type: 'SET_MODAL'; payload: { modal: string; value: boolean } }
  | { type: 'SET_DELIVERY_TYPE'; payload: any }
  | { type: 'SET_SELECTED_DATE'; payload: Date | null }
  | { type: 'SET_CURRENT_MONTH'; payload: Date }
  | { type: 'SET_ADDONS'; payload: any[] }
  | { type: 'SET_ADDON_QUANTITIES'; payload: { [key: string]: number } };

const initialState: CheckoutState = {
  currentStep: 1,  orderForm: {
    fullName: '',
    mobileNumber: '',
    email: '',
    deliveryDate: '',
    deliveryType: '',
    timeSlot: '',
    area: '',
    pinCode: '',
    fullAddress: '',
    landmark: '',
    specialInstructions: '',
    paymentMethod: '',
    // New delivery detail fields
    deliveryOccasion: '',
    relation: '',
    senderName: '',
    messageOnCard: '',
  },
  errors: {},
  isSubmitting: false,
  loading: false,
  orderSuccess: false,
  showDateModal: false,
  showTimeSlotModal: false,
  showCalendar: false,
  isCalendarClosing: false,
  selectedDeliveryType: null,
  currentMonth: new Date(),
  selectedDate: null,
  selectedAddOns: [],
  addOnQuantities: {},
};

const checkoutReducer = (state: CheckoutState, action: CheckoutAction): CheckoutState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_FORM':
      return {
        ...state,
        orderForm: { ...state.orderForm, [action.payload.field]: action.payload.value },
        errors: { ...state.errors, [action.payload.field]: undefined },
      };    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ORDER_SUCCESS':
      return { ...state, orderSuccess: action.payload };
    case 'SET_MODAL':
      return { ...state, [action.payload.modal]: action.payload.value };
    case 'SET_DELIVERY_TYPE':
      return { ...state, selectedDeliveryType: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.payload };
    case 'SET_ADDONS':
      return { ...state, selectedAddOns: action.payload };
    case 'SET_ADDON_QUANTITIES':
      return { ...state, addOnQuantities: action.payload };
    default:
      return state;
  }
};

interface CheckoutContextType {
  state: CheckoutState;
  dispatch: React.Dispatch<CheckoutAction>;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateOrderForm: (field: keyof OrderForm, value: string) => void;
  validateCurrentStep: () => boolean;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const { user, loading } = useAuth();
  const { items } = useCart();  // Pre-fill form if user is logged in
  useEffect(() => {
    // Wait for auth loading to complete
    if (loading) {
      console.log('⏳ CheckoutContext: Auth still loading, waiting...');
      return;
    }

    if (user) {
      console.log('🔄 CheckoutContext: User loaded, prefilling form data...', {
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phoneNumber,
        hasAddress: user.address && user.address.length > 0
      });

      // Batch all form updates together
      const updates: Array<{ field: keyof OrderForm; value: string }> = [];

      if (user.phoneNumber) {
        console.log('📱 Setting mobile number:', user.phoneNumber);
        updates.push({ field: 'mobileNumber', value: user.phoneNumber });
      }
      
      if (user.name) {
        console.log('👤 Setting full name:', user.name);
        updates.push({ field: 'fullName', value: user.name });
      }
      
      if (user.email) {
        console.log('📧 Setting email:', user.email);
        updates.push({ field: 'email', value: user.email });
      }
      
      // Auto-prefill address from user's first saved address if available
      if (user.address && user.address.length > 0) {
        const firstAddress = user.address[0];
        console.log('🏠 Setting address from saved addresses:', firstAddress);
        
        if (firstAddress.fullAddress) {
          updates.push({ field: 'fullAddress', value: firstAddress.fullAddress });
        }
        
        if (firstAddress.city) {
          updates.push({ field: 'area', value: firstAddress.city });
        }
        
        if (firstAddress.pinCode) {
          updates.push({ field: 'pinCode', value: firstAddress.pinCode });
        }
      }

      // Apply all updates
      updates.forEach(update => {
        dispatch({
          type: 'UPDATE_FORM',
          payload: update,
        });
      });
      
      console.log('✅ CheckoutContext: Form prefilling completed with', updates.length, 'updates');
    } else {
      console.log('❌ CheckoutContext: No user found, skipping prefill');
    }
  }, [user, loading]);

  const updateOrderForm = (field: keyof OrderForm, value: string) => {
    dispatch({ type: 'UPDATE_FORM', payload: { field, value } });
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<OrderForm> = {};

    switch (state.currentStep) {
      case 1:
        if (items.length === 0) {
          return false;
        }
        break;

      case 2:
        if (!state.orderForm.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
        }
        if (!state.orderForm.mobileNumber.trim()) {
          newErrors.mobileNumber = 'Mobile number is required';
        } else if (!/^[6-9]\d{9}$/.test(state.orderForm.mobileNumber)) {
          newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
        }
        if (!state.orderForm.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.orderForm.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!state.orderForm.deliveryDate) {
          newErrors.deliveryDate = 'Delivery date is required';
        }
        if (!state.orderForm.deliveryType) {
          newErrors.deliveryType = 'Delivery type is required';
        }
        if (!state.orderForm.timeSlot) {
          newErrors.timeSlot = 'Time slot is required';
        }
        if (!state.orderForm.area) {
          newErrors.area = 'Area is required';
        }
        if (!state.orderForm.fullAddress.trim()) {
          newErrors.fullAddress = 'Full address is required';
        }
        break;

      case 3:
        if (!state.orderForm.paymentMethod) {
          newErrors.paymentMethod = 'Please select a payment method';
        }
        break;

      default:
        break;
    }

    dispatch({ type: 'SET_ERRORS', payload: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    if (validateCurrentStep()) {
      dispatch({ type: 'SET_STEP', payload: Math.min(state.currentStep + 1, 4) });
    }
  };

  const goToPreviousStep = () => {
    dispatch({ type: 'SET_STEP', payload: Math.max(state.currentStep - 1, 1) });
  };

  return (
    <CheckoutContext.Provider
      value={{
        state,
        dispatch,
        goToNextStep,
        goToPreviousStep,
        updateOrderForm,
        validateCurrentStep,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
