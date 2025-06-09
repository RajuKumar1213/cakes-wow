import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Banknote,
  ShoppingCart,
  Truck,
  CheckCircle
} from 'lucide-react';



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
  "Other"
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
  "Other"
];

// Suggested messages based on occasion
export const suggestedMessages: Record<string, string[]> = {
  "Birthday": [
    "Wishing you a very happy birthday! May all your dreams come true.",
    "Another year older, another year wiser! Happy Birthday!",
    "Hope your birthday is as sweet as this cake!"
  ],
  "Anniversary": [
    "Celebrating another year of love and happiness together!",
    "Here's to many more years of love and laughter!",
    "Your love story continues to inspire us all."
  ],
  "Valentine's Day": [
    "You make my heart skip a beat every day. Happy Valentine's Day!",
    "Roses are red, violets are blue, this sweet treat is just for you!",
    "With all my love on Valentine's Day and always."
  ],
  "Congratulations": [
    "Congratulations on your amazing achievement!",
    "You did it! So proud of you!",
    "Your hard work has paid off. Congratulations!"
  ],
  "Thank You": [
    "Thank you for being so wonderful!",
    "A sweet thank you for all that you do!",
    "Grateful for your kindness and support."
  ]
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
