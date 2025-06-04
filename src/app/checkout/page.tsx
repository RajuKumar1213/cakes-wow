"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart,
  MapPin,
  Clock,
  Calendar,
  User,
  Phone,
  Home,
  CreditCard,
  CheckCircle,
  ChevronRight,
  Check,
  Edit3,
  Truck,
  Wallet,
  Shield,
  Award,
  Gift,
  ArrowLeft,
  ArrowRight,
  Lock,
  Smartphone,
  Building2,
  Banknote,
  Star,
  ChevronLeft,
  Package,
  Mail,
  AlertCircle,
  Info,
  Heart,
} from "lucide-react";

// Area to PIN code mapping
const areaPinMap = {
  "Rajendra Nagar": "834001",
  "Ashok Nagar": "834002",
  Harmu: "834003",
  Lalpur: "834004",
  Kanke: "834005",
  Doranda: "834006",
  Bariatu: "834007",
  "Ranchi University": "834008",
  Hatia: "834009",
  Namkum: "834010",
};

// Delivery types configuration
const deliveryTypes = [
  {
    id: "free",
    name: "Standard Delivery",
    price: 0,
    description: "Free delivery (Next day)",
    icon: "🚚",
    popular: true,
    timeSlots: [
      { time: "9:00 AM - 11:00 AM", available: true },
      { time: "11:00 AM - 1:00 PM", available: true },
      { time: "1:00 PM - 3:00 PM", available: true },
      { time: "3:00 PM - 5:00 PM", available: true },
      { time: "5:00 PM - 7:00 PM", available: true },
    ],
  },
  {
    id: "standard",
    name: "Standard Delivery",
    price: 149,
    description: "Same day delivery",
    icon: "⚡",
    timeSlots: [
      { time: "9:00 AM - 11:00 AM", available: true },
      { time: "11:00 AM - 1:00 PM", available: true },
      { time: "1:00 PM - 3:00 PM", available: true },
      { time: "3:00 PM - 5:00 PM", available: true },
      { time: "5:00 PM - 7:00 PM", available: true },
      { time: "7:00 PM - 9:00 PM", available: true },
    ],
  },
  {
    id: "midnight",
    name: "Midnight Delivery",
    price: 150,
    description: "Perfect for surprises",
    icon: "🌙",
    timeSlots: [
      { time: "8:00 PM - 10:00 PM", available: true },
      { time: "9:00 PM - 11:00 PM", available: true },
      { time: "10:00 PM - 12:00 AM", available: true },
      { time: "11:00 PM - 1:00 AM", available: true },
    ],
  },
  {
    id: "fixtime",
    name: "Fixtime Delivery",
    price: 200,
    description: "Guaranteed time delivery",
    icon: "🎯",
    premium: true,
    timeSlots: [
      { time: "9:00 AM - 11:00 AM", available: true },
      { time: "11:00 AM - 1:00 PM", available: true },
      { time: "1:00 PM - 3:00 PM", available: true },
      { time: "3:00 PM - 5:00 PM", available: true },
      { time: "5:00 PM - 7:00 PM", available: true },
      { time: "7:00 PM - 9:00 PM", available: true },
      { time: "8:00 PM - 10:00 PM", available: true },
    ],
  },
  {
    id: "earlymorning",
    name: "Early Morning",
    price: 100,
    description: "Early bird delivery",
    icon: "🌅",
    timeSlots: [
      { time: "6:00 AM - 8:00 AM", available: true },
      { time: "7:00 AM - 9:00 AM", available: true },
      { time: "8:00 AM - 10:00 AM", available: true },
    ],
  },
];

// Payment methods
const paymentMethods = [
  {
    id: "razorpay",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, Rupay",
    icon: CreditCard,
    popular: true,
    charge: 0,
  },
  {
    id: "upi",
    name: "UPI Payment",
    description: "PhonePe, GooglePay, Paytm",
    icon: Smartphone,
    popular: true,
    charge: 0,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    description: "All major banks supported",
    icon: Building2,
    charge: 0,
  },
  {
    id: "wallet",
    name: "Digital Wallets",
    description: "Paytm, Mobikwik, Amazon Pay",
    icon: Wallet,
    charge: 0,
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when you receive",
    icon: Banknote,
    charge: 25,
  },
];

// Checkout steps
const checkoutSteps = [
  {
    id: 1,
    title: "Cart Review",
    icon: ShoppingCart,
    description: "Review your items",
  },
  {
    id: 2,
    title: "Delivery Details",
    icon: Truck,
    description: "Add delivery information",
  },
  {
    id: 3,
    title: "Payment",
    icon: CreditCard,
    description: "Select payment method",
  },
  {
    id: 4,
    title: "Confirmation",
    icon: CheckCircle,
    description: "Order confirmation",
  },
];

// Order form interface
interface OrderForm {
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
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  // Current step state
  const [currentStep, setCurrentStep] = useState(1);
  // Form state
  const [orderForm, setOrderForm] = useState<OrderForm>({
    fullName: "",
    mobileNumber: "",
    email: "",
    deliveryDate: "",
    deliveryType: "",
    timeSlot: "",
    area: "",
    pinCode: "",
    fullAddress: "",
    landmark: "",
    specialInstructions: "",
    paymentMethod: "",
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<OrderForm>>({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isCalendarClosing, setIsCalendarClosing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Add-ons state
  const [selectedAddOns, setSelectedAddOns] = useState<any[]>([]);
  const [addOnQuantities, setAddOnQuantities] = useState<{
    [key: string]: number;
  }>({});

  // Handle delivery type selection
  const handleDeliveryTypeSelect = (deliveryType: any) => {
    setSelectedDeliveryType(deliveryType);
    setOrderForm((prev) => ({
      ...prev,
      deliveryType: deliveryType.id,
      timeSlot: "", // Reset time slot when delivery type changes
    }));
    setShowDateModal(false);
    setShowTimeSlotModal(true);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: string) => {
    setOrderForm((prev) => ({
      ...prev,
      timeSlot,
    }));
    setShowTimeSlotModal(false);
  };
  // Handle date selection
  const handleDateSelect = (date: string) => {
    setOrderForm((prev) => ({
      ...prev,
      deliveryDate: date,
    }));
    setShowDateModal(true);
  };

  // Calendar utility functions
  const generateCalendarDays = () => {
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    const startOfCalendar = new Date(startOfMonth);
    const endOfCalendar = new Date(endOfMonth);

    // Start from Sunday
    startOfCalendar.setDate(
      startOfCalendar.getDate() - startOfCalendar.getDay()
    );
    // End on Saturday
    endOfCalendar.setDate(
      endOfCalendar.getDate() + (6 - endOfCalendar.getDay())
    );

    const days = [];
    const currentDate = new Date(startOfCalendar);

    while (currentDate <= endOfCalendar) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };
  const handleCalendarDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;

    setSelectedDate(date);
    const dateString = date.toISOString().split("T")[0];
    setOrderForm((prev) => ({
      ...prev,
      deliveryDate: dateString,
    }));
    handleCalendarClose();
    setTimeout(() => setShowDateModal(true), 150); // Small delay for smooth transition
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Handle calendar modal close with animation
  const handleCalendarClose = () => {
    setIsCalendarClosing(true);
    setTimeout(() => {
      setShowCalendar(false);
      setIsCalendarClosing(false);
    }, 300); // Match transition duration
  };

  // Calculate total price
  const calculateTotal = (): number => {
    return items.reduce((total: number, item: CartItem) => {
      const price = item.discountedPrice || item.price;
      return total + price * item.quantity;
    }, 0);
  };
  // Calculate delivery charge
  const getDeliveryCharge = (): number => {
    const selectedPayment = paymentMethods.find(
      (p) => p.id === orderForm.paymentMethod
    );
    const paymentCharge = selectedPayment?.charge || 0;

    const selectedDelivery = deliveryTypes.find(
      (d) => d.id === orderForm.deliveryType
    );
    const deliveryCharge = selectedDelivery?.price || 0;

    return paymentCharge + deliveryCharge;
  };
  // Calculate final total
  const getFinalTotal = (): number => {
    return calculateTotal() + getAddOnsTotal() + getDeliveryCharge();
  };

  // Calculate add-ons total
  const getAddOnsTotal = (): number => {
    return selectedAddOns.reduce((total, addOn) => {
      const quantity = addOnQuantities[addOn._id] || 1;
      return total + addOn.price * quantity;
    }, 0);
  };

  // Load selected add-ons from localStorage
  const loadAddOnsFromStorage = React.useCallback(() => {
    try {
      const saved = localStorage.getItem("bakingo-selected-addons");
      if (saved) {
        const addOns = JSON.parse(saved);
        setSelectedAddOns(addOns);
        // Initialize quantities to 1 for each add-on that doesn't have a quantity yet
        setAddOnQuantities((prev) => {
          const quantities: { [key: string]: number } = { ...prev };
          addOns.forEach((addOn: any) => {
            if (!quantities[addOn._id]) {
              quantities[addOn._id] = 1;
            }
          });
          return quantities;
        });
      } else {
        setSelectedAddOns([]);
        setAddOnQuantities({});
      }
    } catch (error) {
      console.error("Error loading selected add-ons:", error);
    }
  }, []); // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setOrderForm((prev) => ({
        ...prev,
        mobileNumber: user.phoneNumber || "",
      }));
    }
  }, [user]);

  // Load add-ons from localStorage
  useEffect(() => {
    loadAddOnsFromStorage();

    // Listen for localStorage changes (from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "bakingo-selected-addons") {
        loadAddOnsFromStorage();
      }
    };

    // Listen for custom storage events within the same tab
    const handleCustomStorageChange = () => {
      loadAddOnsFromStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("addons-updated", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("addons-updated", handleCustomStorageChange);
    };
  }, [loadAddOnsFromStorage]);

  // Sync selectedDate with orderForm.deliveryDate
  useEffect(() => {
    if (orderForm.deliveryDate) {
      setSelectedDate(new Date(orderForm.deliveryDate));
    }
  }, [orderForm.deliveryDate]);

  // Auto-fill PIN code when area is selected
  const handleAreaChange = (area: string) => {
    setOrderForm((prev) => ({
      ...prev,
      area,
      pinCode:
        area in areaPinMap ? areaPinMap[area as keyof typeof areaPinMap] : "",
    }));

    if (errors.area) {
      setErrors((prev) => ({ ...prev, area: undefined }));
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setOrderForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<OrderForm> = {};

    switch (currentStep) {
      case 1:
        // Cart review - just check if cart has items
        if (items.length === 0) {
          showError("Your cart is empty", "Cart Error");
          return false;
        }
        break;

      case 2:
        // Delivery details validation
        if (!orderForm.fullName.trim()) {
          newErrors.fullName = "Full name is required";
        }

        if (!orderForm.mobileNumber.trim()) {
          newErrors.mobileNumber = "Mobile number is required";
        } else if (!/^[6-9]\d{9}$/.test(orderForm.mobileNumber)) {
          newErrors.mobileNumber =
            "Please enter a valid 10-digit mobile number";
        }

        if (!orderForm.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.email)) {
          newErrors.email = "Please enter a valid email address";
        }
        if (!orderForm.deliveryDate) {
          newErrors.deliveryDate = "Delivery date is required";
        } else {
          const selectedDate = new Date(orderForm.deliveryDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDate < today) {
            newErrors.deliveryDate = "Delivery date cannot be in the past";
          }
        }

        if (!orderForm.deliveryType) {
          newErrors.deliveryType = "Delivery type is required";
        }

        if (!orderForm.timeSlot) {
          newErrors.timeSlot = "Time slot is required";
        }

        if (!orderForm.area) {
          newErrors.area = "Area is required";
        }

        if (!orderForm.fullAddress.trim()) {
          newErrors.fullAddress = "Full address is required";
        }
        break;

      case 3:
        // Payment method validation
        if (!orderForm.paymentMethod) {
          newErrors.paymentMethod = "Please select a payment method";
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  // Handle order submission
  const handlePlaceOrder = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: items.map((item: CartItem) => ({
          productId: item.productId,
          name: item.name,
          price: item.discountedPrice || item.price,
          quantity: item.quantity,
          selectedWeight: item.selectedWeight,
          imageUrl: item.imageUrl,
        })),
        addOns: selectedAddOns.map((addOn) => ({
          addOnId: addOn._id,
          name: addOn.name,
          price: addOn.price,
          quantity: addOnQuantities[addOn._id] || 1,
          imageUrl: addOn.imageUrl,
        })),
        customerInfo: orderForm,
        totalAmount: calculateTotal(),
        addOnsTotal: getAddOnsTotal(),
        deliveryCharge: getDeliveryCharge(),
        finalAmount: getFinalTotal(),
        orderDate: new Date().toISOString(),
        status: "pending",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const result = await response.json();

      clearCart();
      setOrderSuccess(true);
      setCurrentStep(4);
      showSuccess(
        "Order Placed Successfully!",
        "Your order has been placed and will be delivered on time."
      );

      setTimeout(() => {
        router.push(`/order-confirmation/${result.orderId}`);
      }, 3000);
    } catch (error) {
      console.error("Order placement error:", error);
      showError("Failed to place order. Please try again.", "Order Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Redirect if cart is empty and not order success
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="font-poppins text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-6">
            Add some delicious cakes to your cart first!
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-2 md:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2 md:mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Back</span>
          </button>
          <h1 className="font-poppins text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
            Checkout
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Complete your order in a few simple steps
          </p>
        </div>{" "}
        {/* Progress Steps */}
        <div className="mb-4 md:mb-8">
          <div className="flex items-center justify-between bg-white rounded-lg p-3 md:p-6 shadow-sm">
            {checkoutSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                      relative flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full transition-all duration-200
                      ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-orange-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }
                    `}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 md:w-6 md:h-6" />
                      ) : (
                        <StepIcon className="w-4 h-4 md:w-6 md:h-6" />
                      )}
                    </div>
                    <div className="mt-1 md:mt-2 text-center">
                      <div
                        className={`text-xs md:text-sm font-medium ${
                          isActive ? "text-orange-600" : "text-gray-600"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 hidden md:block">
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {index < checkoutSteps.length - 1 && (
                    <div
                      className={`
                      flex-1 h-0.5 mx-2 md:mx-4 transition-all duration-200
                      ${isCompleted ? "bg-green-500" : "bg-gray-200"}
                    `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>{" "}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Order Summary - Always Visible */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:sticky lg:top-8">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2 text-orange-600" />
                Order Summary
              </h2>
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                {items.map((item: CartItem) => (
                  <div
                    key={`${item.productId}-${
                      item.selectedWeight || "default"
                    }`}
                    className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.imageUrl || "/placeholder-cake.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs md:text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.selectedWeight && (
                        <p className="text-xs text-gray-500">
                          Weight: {item.selectedWeight}
                        </p>
                      )}
                      <p className="text-xs md:text-sm text-gray-600">
                        ₹{item.discountedPrice || item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-xs md:text-sm font-medium text-gray-900">
                      ₹{(item.discountedPrice || item.price) * item.quantity}
                    </div>
                  </div>
                ))}

                {/* Selected Add-ons */}
                {selectedAddOns.length > 0 && (
                  <div className="border-t pt-3 md:pt-4">
                    <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2 md:mb-3 flex items-center">
                      <Gift className="w-4 h-4 mr-2 text-pink-500" />
                      Selected Add-ons
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      {selectedAddOns.map((addOn) => (
                        <div
                          key={addOn._id}
                          className="flex items-center space-x-2 md:space-x-3 p-2 bg-pink-50 rounded border border-pink-200"
                        >
                          <div className="relative w-10 h-10 md:w-12 md:h-12 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={addOn.image || "/placeholder-addon.jpg"}
                              alt={addOn.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs md:text-sm font-medium text-gray-900 truncate">
                              {addOn.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              ₹{addOn.price} × {addOnQuantities[addOn._id] || 1}
                            </p>
                          </div>
                          <div className="text-xs md:text-sm font-medium text-pink-600">
                            ₹{addOn.price * (addOnQuantities[addOn._id] || 1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>{" "}
              <div className="border-t pt-3 md:pt-4 space-y-2">
                <div className="flex justify-between items-center text-xs md:text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                {selectedAddOns.length > 0 && (
                  <div className="flex justify-between items-center text-xs md:text-sm text-gray-600">
                    <span>Add-ons ({selectedAddOns.length} items)</span>
                    <span>₹{getAddOnsTotal()}</span>
                  </div>
                )}
                {orderForm.deliveryType && (
                  <div className="flex justify-between items-center text-xs md:text-sm text-gray-600">
                    <span>
                      {deliveryTypes.find(
                        (d) => d.id === orderForm.deliveryType
                      )?.name || "Delivery"}
                    </span>
                    <span>
                      {deliveryTypes.find(
                        (d) => d.id === orderForm.deliveryType
                      )?.price === 0
                        ? "Free"
                        : `₹${
                            deliveryTypes.find(
                              (d) => d.id === orderForm.deliveryType
                            )?.price || 0
                          }`}
                    </span>
                  </div>
                )}{" "}
                {orderForm.paymentMethod &&
                  (() => {
                    const paymentMethod = paymentMethods.find(
                      (p) => p.id === orderForm.paymentMethod
                    );
                    return paymentMethod && paymentMethod.charge > 0 ? (
                      <div className="flex justify-between items-center text-xs md:text-sm text-gray-600">
                        <span>Payment Processing</span>
                        <span>₹{paymentMethod.charge}</span>
                      </div>
                    ) : null;
                  })()}
                <div className="flex justify-between items-center text-base md:text-lg font-semibold text-gray-900 border-t pt-2">
                  <span>Total Amount</span>
                  <span>₹{getFinalTotal()}</span>
                </div>
              </div>{" "}
              {/* Trust Badges */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col items-center">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-green-500 mb-1" />
                    <span className="text-xs text-gray-600">Secure</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Award className="w-5 h-5 md:w-6 md:h-6 text-orange-500 mb-1" />
                    <span className="text-xs text-gray-600">Quality</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Truck className="w-5 h-5 md:w-6 md:h-6 text-blue-500 mb-1" />
                    <span className="text-xs text-gray-600">Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
          {/* Main Content Area */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm p-3 md:p-6">
              {/* Step 1: Cart Review */}
              {currentStep === 1 && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                      Review Your Cart
                    </h2>
                    <span className="text-xs md:text-sm text-gray-500">
                      {items.length} item(s)
                    </span>
                  </div>{" "}
                  <div className="space-y-3 md:space-y-4">
                    {items.map((item: CartItem) => (
                      <div
                        key={`${item.productId}-${
                          item.selectedWeight || "default"
                        }`}
                        className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.imageUrl || "/placeholder-cake.jpg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm md:text-lg font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                          {item.selectedWeight && (
                            <p className="text-xs md:text-sm text-gray-500">
                              Weight: {item.selectedWeight}
                            </p>
                          )}
                          <div className="flex items-center mt-1 md:mt-2">
                            <span className="text-sm md:text-lg font-semibold text-orange-600">
                              ₹{item.discountedPrice || item.price}
                            </span>
                            {item.discountedPrice && (
                              <span className="text-xs md:text-sm text-gray-500 line-through ml-2">
                                ₹{item.price}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-center flex-shrink-0">
                          <div className="text-xs md:text-sm text-gray-500">
                            Qty
                          </div>
                          <div className="text-sm md:text-lg font-semibold">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="text-center flex-shrink-0">
                          <div className="text-xs md:text-sm text-gray-500">
                            Total
                          </div>
                          <div className="text-sm md:text-lg font-semibold text-gray-900">
                            ₹
                            {(item.discountedPrice || item.price) *
                              item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>{" "}
                  {/* Special Offers */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4">
                    <div className="flex items-start">
                      <Gift className="w-4 h-4 md:w-5 md:h-5 text-orange-600 mt-0.5 mr-2 md:mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm md:text-base font-medium text-orange-900">
                          Special Offer!
                        </h4>
                        <p className="text-xs md:text-sm text-orange-700 mt-1">
                          Free delivery on orders above ₹500. You qualify for
                          free delivery!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}{" "}
              {/* Step 2: Delivery Details */}
              {currentStep === 2 && (
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
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-orange-200">
                      <div className="flex items-center mb-4 md:mb-6">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-600 rounded-full flex items-center justify-center mr-2 md:mr-3">
                          <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-semibold text-gray-900">
                            Personal Details
                          </h3>
                          <p className="text-xs md:text-sm text-orange-700">
                            Tell us about yourself
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {" "}
                        <div className="group">
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-orange-600">
                            <div className="flex items-center">
                              <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-orange-500" />
                              Full Name *
                            </div>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={orderForm.fullName}
                              onChange={(e) =>
                                handleInputChange("fullName", e.target.value)
                              }
                              className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 focus:border-orange-400 transition-all duration-300 bg-white shadow-sm text-sm md:text-base ${
                                errors.fullName
                                  ? "border-red-400 bg-red-50"
                                  : "border-gray-200 hover:border-orange-300"
                              }`}
                              placeholder="What should we call you?"
                            />
                            <User
                              className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 transition-colors ${
                                errors.fullName
                                  ? "text-red-400"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                          {errors.fullName && (
                            <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              {errors.fullName}
                            </div>
                          )}
                        </div>
                        <div className="group">
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-orange-600">
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-orange-500" />
                              Mobile Number *
                            </div>
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={orderForm.mobileNumber}
                              onChange={(e) =>
                                handleInputChange(
                                  "mobileNumber",
                                  e.target.value
                                )
                              }
                              className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 focus:border-orange-400 transition-all duration-300 bg-white shadow-sm text-sm md:text-base ${
                                errors.mobileNumber
                                  ? "border-red-400 bg-red-50"
                                  : "border-gray-200 hover:border-orange-300"
                              }`}
                              placeholder="Your contact number"
                              maxLength={10}
                            />
                            <Phone
                              className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 transition-colors ${
                                errors.mobileNumber
                                  ? "text-red-400"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                          {errors.mobileNumber && (
                            <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              {errors.mobileNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 md:mt-6 group">
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-orange-600">
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-orange-500" />
                            Email Address *
                          </div>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={orderForm.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 focus:border-orange-400 transition-all duration-300 bg-white shadow-sm text-sm md:text-base ${
                              errors.email
                                ? "border-red-400 bg-red-50"
                                : "border-gray-200 hover:border-orange-300"
                            }`}
                            placeholder="Where to send order updates?"
                          />
                          <Mail
                            className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 transition-colors ${
                              errors.email ? "text-red-400" : "text-gray-400"
                            }`}
                          />
                        </div>
                        {errors.email && (
                          <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                            <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            {errors.email}
                          </div>
                        )}
                      </div>
                    </div>{" "}
                    {/* Delivery Timing Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-200">
                      <div className="flex items-center mb-4 md:mb-6">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center mr-2 md:mr-3">
                          <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-semibold text-gray-900">
                            Delivery Timing
                          </h3>
                          <p className="text-xs md:text-sm text-blue-700">
                            When would you like to receive your order? ⏰
                          </p>
                        </div>
                      </div>{" "}
                      {/* Consolidated Date & Time Selection */}
                      <div className="space-y-4 md:space-y-6">
                        {/* Main Selection Display */}
                        {orderForm.deliveryDate && orderForm.timeSlot ? (
                          <div className="relative group">
                            <div className="p-4 md:p-6 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-50 rounded-xl md:rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 md:space-x-4">
                                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-sm md:text-lg font-bold text-gray-900 mb-1">
                                      {new Date(
                                        orderForm.deliveryDate
                                      ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      })}{" "}
                                      / {orderForm.timeSlot}
                                    </div>
                                    <div className="flex items-center text-xs md:text-sm text-blue-700">
                                      <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                      {selectedDeliveryType?.name}{" "}
                                      {selectedDeliveryType?.price > 0
                                        ? `(₹${selectedDeliveryType.price})`
                                        : "(Free)"}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowDateModal(true)}
                                  className="px-3 py-2 md:px-4 md:py-2 bg-white/80 hover:bg-white border-2 border-blue-300 hover:border-blue-400 rounded-lg md:rounded-xl text-blue-600 hover:text-blue-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md text-sm md:text-base"
                                >
                                  Change
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Selection Buttons */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {" "}
                            {/* Date Selection */}
                            <div className="group">
                              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3 transition-colors group-focus-within:text-blue-600">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-blue-500" />
                                  Delivery Date *
                                </div>
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setShowCalendar(true)}
                                  className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 focus:border-blue-400 transition-all duration-300 transform hover:scale-[1.02] bg-white shadow-sm text-left text-sm md:text-base ${
                                    errors.deliveryDate
                                      ? "border-red-400 bg-red-50"
                                      : orderForm.deliveryDate
                                      ? "border-blue-400 bg-blue-50"
                                      : "border-gray-200 hover:border-blue-300"
                                  }`}
                                >
                                  {orderForm.deliveryDate ? (
                                    <span className="text-blue-900 font-medium">
                                      {new Date(
                                        orderForm.deliveryDate
                                      ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">
                                      Pick your perfect delivery date
                                    </span>
                                  )}
                                </button>
                                <Calendar
                                  className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 transition-colors ${
                                    errors.deliveryDate
                                      ? "text-red-400"
                                      : orderForm.deliveryDate
                                      ? "text-blue-500"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                              {errors.deliveryDate && (
                                <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                                  <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                  {errors.deliveryDate}
                                </div>
                              )}
                            </div>{" "}
                            {/* Time Slot Selection */}
                            <div className="group">
                              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-blue-500" />
                                  Delivery Time *
                                </div>
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    orderForm.deliveryDate
                                      ? setShowDateModal(true)
                                      : setShowCalendar(true)
                                  }
                                  disabled={!orderForm.deliveryDate}
                                  className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 transition-all duration-300 transform hover:scale-[1.02] bg-white shadow-sm text-left text-sm md:text-base ${
                                    !orderForm.deliveryDate
                                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                                      : errors.timeSlot
                                      ? "border-red-400 bg-red-50"
                                      : orderForm.timeSlot
                                      ? "border-blue-400 bg-blue-50"
                                      : "border-gray-200 hover:border-blue-300"
                                  }`}
                                >
                                  {!orderForm.deliveryDate ? (
                                    <span className="text-gray-400">
                                      Select date first
                                    </span>
                                  ) : orderForm.timeSlot ? (
                                    <span className="text-blue-900 font-medium">
                                      {orderForm.timeSlot}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">
                                      Choose delivery time ⏰
                                    </span>
                                  )}
                                </button>
                                <Clock
                                  className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 transition-colors ${
                                    !orderForm.deliveryDate
                                      ? "text-gray-300"
                                      : errors.timeSlot
                                      ? "text-red-400"
                                      : orderForm.timeSlot
                                      ? "text-blue-500"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                              {errors.timeSlot && (
                                <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                                  <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                  {errors.timeSlot}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>{" "}
                    {/* Address Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-green-200">
                      <div className="flex items-center mb-4 md:mb-6">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600 rounded-full flex items-center justify-center mr-2 md:mr-3">
                          <MapPin className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-semibold text-gray-900">
                            Delivery Address
                          </h3>
                          <p className="text-xs md:text-sm text-green-700">
                            Where should we bring the sweetness? 🏠
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                        <div className="group">
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                              Select Area *
                            </div>
                          </label>
                          <div className="relative">
                            <select
                              value={orderForm.area}
                              onChange={(e) => handleAreaChange(e.target.value)}
                              className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 focus:border-green-400 transition-all duration-300 transform focus:scale-[1.02] bg-white shadow-sm appearance-none text-sm md:text-base ${
                                errors.area
                                  ? "border-red-400 bg-red-50"
                                  : "border-gray-200 hover:border-green-300"
                              }`}
                            >
                              <option value="">Choose your area</option>
                              {Object.keys(areaPinMap).map((area) => (
                                <option key={area} value={area}>
                                  {area}
                                </option>
                              ))}
                            </select>
                            <MapPin
                              className={`absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 transition-colors ${
                                errors.area ? "text-red-400" : "text-gray-400"
                              }`}
                            />
                            <ChevronRight className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 rotate-90 w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                          </div>
                          {errors.area && (
                            <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              {errors.area}
                            </div>
                          )}
                        </div>

                        <div className="group">
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center">
                              <Package className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                              PIN Code
                            </div>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={orderForm.pinCode}
                              readOnly
                              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-lg md:rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 shadow-sm text-sm md:text-base"
                              placeholder="Auto-filled based on area"
                            />
                            <Package className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                            {orderForm.pinCode && (
                              <div className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2">
                                <Check className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>{" "}
                      <div className="space-y-4 md:space-y-6">
                        <div className="group">
                          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                            <div className="flex items-center">
                              <Home className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                              Complete Address *
                            </div>
                          </label>
                          <div className="relative">
                            <textarea
                              value={orderForm.fullAddress}
                              onChange={(e) =>
                                handleInputChange("fullAddress", e.target.value)
                              }
                              rows={4}
                              className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 rounded-lg md:rounded-xl focus:ring-0 focus:border-green-400 transition-all duration-300 transform focus:scale-[1.02] bg-white shadow-sm resize-none text-sm md:text-base ${
                                errors.fullAddress
                                  ? "border-red-400 bg-red-50"
                                  : "border-gray-200 hover:border-green-300"
                              }`}
                              placeholder="House/Flat number, Street name, Society name..."
                            />
                            <Home
                              className={`absolute left-3 md:left-4 top-3 md:top-4 w-3 h-3 md:w-4 md:h-4 transition-colors ${
                                errors.fullAddress
                                  ? "text-red-400"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                          {errors.fullAddress && (
                            <div className="mt-2 flex items-center text-red-500 text-xs md:text-sm animate-pulse">
                              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              {errors.fullAddress}
                            </div>
                          )}
                        </div>{" "}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="group">
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                              <div className="flex items-center">
                                <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                                Landmark (Optional)
                              </div>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={orderForm.landmark}
                                onChange={(e) =>
                                  handleInputChange("landmark", e.target.value)
                                }
                                className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-0 focus:border-green-400 transition-all duration-300 transform focus:scale-[1.02] bg-white shadow-sm hover:border-green-300 text-sm md:text-base"
                                placeholder="Near hospital, mall, school..."
                              />
                              <Star className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                            </div>
                          </div>

                          <div className="group">
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                              <div className="flex items-center">
                                <Gift className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                                Special Instructions (Optional)
                              </div>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={orderForm.specialInstructions}
                                onChange={(e) =>
                                  handleInputChange(
                                    "specialInstructions",
                                    e.target.value
                                  )
                                }
                                className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-lg md:rounded-xl focus:ring-0 focus:border-green-400 transition-all duration-300 transform focus:scale-[1.02] bg-white shadow-sm hover:border-green-300 text-sm md:text-base"
                                placeholder="Any special delivery notes..."
                              />
                              <Gift className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
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
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                            <Shield className="w-3 h-3 md:w-4 md:h-4 text-pink-600" />
                          </div>
                          <span className="text-xs md:text-sm font-medium text-purple-900">
                            Safe Packaging
                          </span>
                          <span className="text-xs text-purple-600">
                            Hygienic & Secure
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-white rounded-lg md:rounded-xl shadow-sm">
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                            <Award className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
                          </div>
                          <span className="text-xs md:text-sm font-medium text-purple-900">
                            Fresh Quality
                          </span>
                          <span className="text-xs text-purple-600">
                            Guaranteed freshness
                          </span>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}{" "}
              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                      Payment Method
                    </h2>
                    <div className="flex items-center text-green-600">
                      <Lock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      <span className="text-xs md:text-sm">Secure Payment</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      const isSelected = orderForm.paymentMethod === method.id;

                      return (
                        <div
                          key={method.id}
                          onClick={() =>
                            handleInputChange("paymentMethod", method.id)
                          }
                          className={`
                            relative p-3 md:p-4 border rounded-lg cursor-pointer transition-all duration-200
                            ${
                              isSelected
                                ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                                : "border-gray-200 hover:border-orange-300"
                            }
                          `}
                        >
                          <div className="flex items-center">
                            <div
                              className={`
                              flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg mr-3 md:mr-4
                              ${
                                isSelected
                                  ? "bg-orange-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }
                            `}
                            >
                              <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center">
                                <h3 className="text-base md:text-lg font-medium text-gray-900">
                                  {method.name}
                                </h3>
                                {method.popular && (
                                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                    Popular
                                  </span>
                                )}
                                {method.charge > 0 && (
                                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                    +₹{method.charge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs md:text-sm text-gray-600 mt-1">
                                {method.description}
                              </p>
                            </div>

                            <div
                              className={`
                              w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center
                              ${
                                isSelected
                                  ? "border-orange-600 bg-orange-600"
                                  : "border-gray-300"
                              }
                            `}
                            >
                              {isSelected && (
                                <Check className="w-2 h-2 md:w-3 md:h-3 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {errors.paymentMethod && (
                    <p className="text-red-500 text-xs md:text-sm flex items-center">
                      <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      {errors.paymentMethod}
                    </p>
                  )}

                  {/* Security Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                    <div className="flex items-start">
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5 mr-2 md:mr-3" />
                      <div>
                        <h4 className="font-medium text-blue-900 text-sm md:text-base">
                          Secure Payment
                        </h4>
                        <p className="text-xs md:text-sm text-blue-700 mt-1">
                          Your payment information is encrypted and secure. We
                          do not store your card details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}{" "}
              {/* Step 4: Order Confirmation */}
              {currentStep === 4 && orderSuccess && (
                <div className="text-center space-y-4 md:space-y-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
                  </div>

                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      Order Placed Successfully!
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">
                      Thank you for your order. We'll send you a confirmation
                      email shortly.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 md:p-6 max-w-md mx-auto">
                    <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">
                      Order Summary
                    </h3>
                    <div className="space-y-2 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span>Items ({items.length})</span>
                        <span>₹{calculateTotal()}</span>
                      </div>
                      {getDeliveryCharge() > 0 && (
                        <div className="flex justify-between">
                          <span>Delivery Charge</span>
                          <span>₹{getDeliveryCharge()}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{getFinalTotal()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-orange-600 font-medium animate-pulse text-sm md:text-base">
                    Redirecting to order confirmation...
                  </div>
                </div>
              )}
              {/* Navigation Buttons */}
              {!orderSuccess && (
                <div className="flex flex-col sm:flex-row justify-between pt-4 md:pt-6 border-t gap-3 sm:gap-0">
                  <button
                    onClick={handlePreviousStep}
                    disabled={currentStep === 1}
                    className="flex items-center justify-center px-4 md:px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Previous
                  </button>

                  {currentStep < 3 ? (
                    <button
                      onClick={handleNextStep}
                      className="flex items-center justify-center px-4 md:px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm md:text-base order-1 sm:order-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                    </button>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="flex items-center justify-center px-4 md:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base order-1 sm:order-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2"></div>
                          <span className="hidden sm:inline">
                            Placing Order...
                          </span>
                          <span className="sm:hidden">Placing...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                          <span className="hidden sm:inline">
                            Place Order (₹{getFinalTotal()})
                          </span>
                          <span className="sm:hidden">Place Order</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}{" "}
            </div>
          </div>{" "}          {/* Custom Calendar Modal */}
          {showCalendar && (
            <div
              className={`fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50  transition-all duration-300 ${
                isCalendarClosing ? "opacity-0" : "opacity-100"
              }`}
            >
              <div
                className={`w-full max-w-lg transform transition-all duration-300 ease-out ${
                  isCalendarClosing 
                    ? 'translate-y-full md:translate-y-0 md:scale-95 md:opacity-0' 
                    : 'translate-y-0 md:scale-100 md:opacity-100'
                } md:max-h-[85vh]`}
              >
                <div className="bg-white rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] md:max-h-full overflow-y-auto">                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 md:p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base md:text-lg font-semibold">
                          Choose Delivery Date
                        </h3>
                        <p className="text-orange-100 text-xs mt-1">
                          Pick the perfect day for your sweet delivery 🎂
                        </p>
                      </div>
                      <button
                        onClick={handleCalendarClose}
                        className="text-white hover:text-orange-100 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                      >
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>                  <div className="p-3 md:p-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <button
                        onClick={() => navigateMonth("prev")}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                      >
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <h4 className="text-sm md:text-base font-semibold text-gray-900">
                        {formatMonthYear(currentMonth)}
                      </h4>
                      <button
                        onClick={() => navigateMonth("next")}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                      >
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>                    {/* Calendar Grid */}
                    <div className="mb-3">
                      {/* Day Headers */}
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day) => (
                            <div
                              key={day}
                              className="p-1.5 text-center text-xs font-medium text-gray-500"
                            >
                              {day}
                            </div>
                          )
                        )}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-1">
                        {generateCalendarDays().map((date, index) => {
                          const isCurrentMonth =
                            date.getMonth() === currentMonth.getMonth();
                          const isDisabled = isDateDisabled(date);
                          const isSelected = isDateSelected(date);
                          const isToday =
                            date.toDateString() === new Date().toDateString();

                          return (
                            <button
                              key={index}
                              onClick={() => handleCalendarDateSelect(date)}
                              disabled={isDisabled}
                              className={`
                          relative p-1.5 md:p-2 text-xs rounded-lg transition-all duration-200 transform hover:scale-105
                          ${
                            !isCurrentMonth
                              ? "text-gray-300 hover:text-gray-400"
                              : isDisabled
                              ? "text-gray-300 cursor-not-allowed opacity-50"
                              : isSelected
                              ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg transform scale-105"
                              : isToday
                              ? "bg-blue-100 text-blue-600 border-2 border-blue-300 font-semibold"
                              : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                          }
                          ${
                            !isDisabled && isCurrentMonth
                              ? "hover:shadow-md"
                              : ""
                          }
                        `}
                            >
                              {date.getDate()}
                              {isToday && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                  <Heart className="w-2 h-2 text-red-500 fill-current" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>                    {/* Selected Date Display */}
                    {selectedDate && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-orange-600 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              Selected Date
                            </div>
                            <div className="text-xs text-orange-700">
                              {selectedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}{" "}
                    {/* Action Buttons */}
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={handleCalendarClose}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      {selectedDate && (
                        <button
                          onClick={() => {
                            handleCalendarClose();
                            setTimeout(() => setShowDateModal(true), 150);
                          }}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                        >
                          Confirm Date
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Delivery Type Selection Modal */}
          {showDateModal && (
            <div
              className={`fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 ${
                isCalendarClosing ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="">
                <div className="bg-white rounded-t-2xl max-w-md w-full md:max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Select Delivery Type
                      </h3>
                      <button
                        onClick={() => setShowDateModal(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {deliveryTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => handleDeliveryTypeSelect(type)}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 transform hover:scale-[1.02] text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{type.icon}</span>
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-900">
                                    {type.name}
                                  </span>
                                  {type.popular && (
                                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                      Popular
                                    </span>
                                  )}
                                  {type.premium && (
                                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                      Premium
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {type.description}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                {type.price > 0 ? `₹${type.price}` : "Free"}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {orderForm.deliveryDate && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              {new Date(
                                orderForm.deliveryDate
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setShowCalendar(true);
                              setShowDateModal(false);
                            }}
                            className="text-orange-600 text-sm hover:text-orange-800 transition-colors"
                          >
                            Change Date
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Time Slot Selection Modal */}
          {showTimeSlotModal && selectedDeliveryType && (
            <div
              className={`fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 ${
                isCalendarClosing ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Select Time Slot
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedDeliveryType.name} -{" "}
                        {selectedDeliveryType.price > 0
                          ? `₹${selectedDeliveryType.price}`
                          : "Free"}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTimeSlotModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedDeliveryType.timeSlots.map(
                      (slot: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleTimeSlotSelect(slot.time)}
                          disabled={!slot.available}
                          className={`w-full p-4 border-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02] text-left ${
                            slot.available
                              ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Clock className="w-5 h-5 mr-3 text-blue-500" />
                              <div>
                                <div className="font-medium">{slot.time}</div>
                                {!slot.available && (
                                  <div className="text-xs text-red-500 mt-1">
                                    Not Available
                                  </div>
                                )}
                              </div>
                            </div>
                            {slot.available && (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>
                      )
                    )}
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => {
                        setShowTimeSlotModal(false);
                        setShowDateModal(true);
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
