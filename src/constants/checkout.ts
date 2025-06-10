import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Banknote,
  ShoppingCart,
  Truck,
  CheckCircle,
} from "lucide-react";

// Delivery types configuration
export const deliveryTypes = [
  {
    id: "free",
    name: "Standard Delivery",
    price: 0,
    description: "Free delivery (Next day)",
    icon: "🚚",
    popular: true,
    timeSlots: [
      { time: "9 AM - 11 AM", available: true },
      { time: "11 AM - 1 PM", available: true },
      { time: "1 PM - 3 PM", available: true },
      { time: "3 PM - 5 PM", available: true },
      { time: "5 PM - 7 PM", available: true },
      { time: "7 PM - 9 PM", available: true },
      { time: "8 PM - 10 PM", available: true },
      { time: "9 PM - 11 PM", available: true },
    ],
  },  {
    id: "midnight",
    name: "Midnight Delivery",
    price: 149,
    description: "Perfect for surprises",
    icon: "🌙",
    timeSlots: [{ time: "11 PM - 12 AM", available: true }],
  },{
    id: "fixtime",
    name: "Fixtime Delivery",
    price: 150,
    description: "Guaranteed time delivery",
    icon: "🎯",
    premium: true,
    timeSlots: [
      { time: "8 AM - 9 AM", available: true },
      { time: "9 AM - 10 AM", available: true },
      { time: "10 AM - 11 AM", available: true },
      { time: "11 AM - 12 PM", available: true },
      { time: "12 PM - 1 PM", available: true },
      { time: "1 PM - 2 PM", available: true },
      { time: "2 PM - 3 PM", available: true },
      { time: "3 PM - 4 PM", available: true },
      { time: "4 PM - 5 PM", available: true },
      { time: "5 PM - 6 PM", available: true },
      { time: "6 PM - 7 PM", available: true },
      { time: "7 PM - 8 PM", available: true },
      { time: "8 PM - 9 PM", available: true },
      { time: "9 PM - 10 PM", available: true },
      { time: "10 PM - 11 PM", available: true },
    ],
  },  {
    id: "earlymorning",
    name: "Early Morning ",
    price: 200,
    description: "Guaranteed time delivery",
    icon: "🌅",
    premium: true,
    timeSlots: [{ time: "7 AM - 9 AM", available: true }],
  },
];

// Payment methods
export const paymentMethods = [
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
  },  {
    id: "wallet",
    name: "Digital Wallets",
    description: "Paytm, Mobikwik, Amazon Pay",
    icon: Wallet,
    charge: 0,
  },
];

// Checkout steps
export const checkoutSteps = [
  {
    id: 1,
    title: "Delivery Details",
    icon: Truck,
    description: "Add delivery information",
  },
  {
    id: 2,
    title: "Cart Review",
    icon: ShoppingCart,
    description: "Review your items",
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
  // New fields for delivery details
  deliveryOccasion: string;
  relation: string;
  senderName: string;
  messageOnCard: string;
}

// Delivery occasions
export const deliveryOccasions = [
  "Birthday",
  "Anniversary",
  "Valentine's Day",
  "Mother's Day",
  "Father's Day",
  "Wedding",
  "Engagement",
  "Graduation",
  "Baby Shower",
  "Congratulations",
  "Thank You",
  "Get Well Soon",
  "Just Because",
  "Other",
];

// Relations
export const relations = [
  "Wife",
  "Husband",
  "Mother",
  "Father",
  "Sister",
  "Brother",
  "Daughter",
  "Son",
  "Friend",
  "Girlfriend",
  "Boyfriend",
  "Colleague",
  "Boss",
  "Teacher",
  "Other",
];

// Suggested messages based on occasion
export const suggestedMessages: Record<string, string[]> = {
  Birthday: [
    "Wishing you a very happy birthday! May all your dreams come true.",
    "Another year older, another year wiser! Happy Birthday!",
    "Hope your birthday is as sweet as this cake!",
  ],
  Anniversary: [
    "Celebrating another year of love and happiness together!",
    "Here's to many more years of love and laughter!",
    "Your love story continues to inspire us all.",
  ],
  "Valentine's Day": [
    "You make my heart skip a beat every day. Happy Valentine's Day!",
    "Roses are red, violets are blue, this sweet treat is just for you!",
    "With all my love on Valentine's Day and always.",
  ],
  Congratulations: [
    "Congratulations on your amazing achievement!",
    "You did it! So proud of you!",
    "Your hard work has paid off. Congratulations!",
  ],
  "Thank You": [
    "Thank you for being so wonderful!",
    "A sweet thank you for all that you do!",
    "Grateful for your kindness and support.",
  ],
};

// Initial order form state
export const initialOrderForm: OrderForm = {
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
  deliveryOccasion: "",
  relation: "",
  senderName: "",
  messageOnCard: "",
};
