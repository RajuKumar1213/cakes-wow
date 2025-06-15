// Apply mongoose fix for Vercel deployment
import "@/lib/mongoose-fix";
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  selectedWeight: {
    type: String,
    default: "",
  },
  imageUrl: {
    type: String,
    default: "",
  },
});

const orderAddOnSchema = new mongoose.Schema({
  addOnId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  image: {
    type: String,
    default: "",
  },
});

const customerInfoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"],
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
    trim: true,
  },
  area: {
    type: String,
    required: true,
    trim: true,
  },
  pinCode: {
    type: String,
    required: true,
    trim: true,
  },
  fullAddress: {
    type: String,
    required: true,
    trim: true,
  },
  // New delivery detail fields
  deliveryOccasion: {
    type: String,
    trim: true,
    default: "",
  },
  relation: {
    type: String,
    trim: true,
    default: "",
  },
  senderName: {
    type: String,
    trim: true,
    default: "",
  },
  messageOnCard: {
    type: String,
    trim: true,
    default: "",
    maxLength: 200,
  },
  specialInstructions: {
    type: String,
    trim: true,
    default: "",
    maxLength: 150,
  },
});

const orderSchema = new mongoose.Schema(
  {    orderId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    items: [orderItemSchema],
    addons: [orderAddOnSchema],
    customerInfo: {
      type: customerInfoSchema,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    onlineDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },    paymentMethod: {
      type: String,
      enum: ["online", "card"],
      default: "online",
    },
    // Razorpay payment fields
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    paymentCompletedAt: {
      type: Date,
      default: null,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: true,
    },
    actualDeliveryDate: {
      type: Date,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    trackingInfo: {
      orderPlaced: {
        timestamp: { type: Date, default: Date.now },
        status: { type: String, default: "Order placed successfully" },
      },
      confirmed: {
        timestamp: Date,
        status: String,
      },
      preparing: {
        timestamp: Date,
        status: String,
      },
      outForDelivery: {
        timestamp: Date,
        status: String,
        deliveryPersonName: String,
        deliveryPersonPhone: String,
      },
      delivered: {
        timestamp: Date,
        status: String,
        deliveredBy: String,
      },
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
orderSchema.index({ "customerInfo.mobileNumber": 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ estimatedDeliveryDate: 1 });
orderSchema.index({ "customerInfo.area": 1 });

// Virtual for order total items count
orderSchema.virtual("totalItems").get(function () {
  const itemsCount = this.items.reduce((total, item) => total + item.quantity, 0);
  const addonsCount = this.addons.reduce((total, addon) => total + addon.quantity, 0);
  return itemsCount + addonsCount;
});

// Virtual for order age in hours
orderSchema.virtual("orderAgeHours").get(function () {
  return Math.floor((Date.now() - this.orderDate.getTime()) / (1000 * 60 * 60));
});

// Virtual for delivery status
orderSchema.virtual("deliveryStatus").get(function () {
  const now = new Date();
  const deliveryDate = new Date(this.estimatedDeliveryDate);

  if (this.status === "delivered") {
    return "delivered";
  } else if (this.status === "cancelled") {
    return "cancelled";
  } else if (now > deliveryDate) {
    return "overdue";
  } else {
    return "on_time";
  }
});

// Ensure virtuals are included in JSON output
orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

// Pre-save middleware to update tracking info
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const timestamp = new Date();

    switch (this.status) {
      case "confirmed":
        if (!this.trackingInfo.confirmed.timestamp) {
          this.trackingInfo.confirmed = {
            timestamp,
            status: "Order confirmed and being prepared",
          };
        }
        break;
      case "preparing":
        if (!this.trackingInfo.preparing.timestamp) {
          this.trackingInfo.preparing = {
            timestamp,
            status: "Your cake is being prepared",
          };
        }
        break;
      case "out_for_delivery":
        if (!this.trackingInfo.outForDelivery.timestamp) {
          this.trackingInfo.outForDelivery = {
            timestamp,
            status: "Order is out for delivery",
          };
        }
        break;
      case "delivered":
        if (!this.trackingInfo.delivered.timestamp) {
          this.trackingInfo.delivered = {
            timestamp,
            status: "Order delivered successfully",
          };
          this.actualDeliveryDate = timestamp;
        }
        break;
    }
  }
  next();
});

// Force recreation of the model to ensure schema changes are applied
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.model("Order", orderSchema);
