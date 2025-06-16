import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order.models";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payment/create-order
 * Create Razorpay order for existing order in database
 */
export async function POST(request) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const requestBody = await request.json();
    const { orderId, paymentMethod } = requestBody;

    // Validate required fields
    if (!orderId) {
      console.error("❌ Order ID validation failed:", {
        orderId: orderId,
        requestBody: requestBody,
      });
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find existing order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }    // Update payment method
    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }

    // Clear any existing online discount and use the original total amount
    order.onlineDiscount = 0;
    const finalAmount = order.totalAmount;    // Create Razorpay order for online payments
    const razorpayOrderOptions = {
      amount: Math.round(finalAmount * 100), // Amount in paisa
      currency: "INR",
      receipt: `order_rcpt_${order.orderId}`,      notes: {
        orderId: order.orderId,
        customerName: order.customerInfo.fullName,
        customerMobile: order.customerInfo.mobileNumber,
        productNames: order.items.map((item) => item.name).join(", "),
        originalAmount: order.totalAmount,
        finalAmount: finalAmount,
        paymentMethod: paymentMethod,
        deliveryDate: order.customerInfo.deliveryDate,
        deliveryArea: order.customerInfo.area,
      },
    };


    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);


    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Return success response with payment details
    return NextResponse.json(
      {
        success: true,
        message: "Payment order created successfully",        order: {
          orderId: order.orderId,
          totalAmount: finalAmount,
          originalAmount: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
        payment: {
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          backendOrderId: order._id.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment order creation error:", error);

    // Handle Razorpay errors
    if (error.statusCode) {
      return NextResponse.json(
        { error: "Payment service error", details: error.error.description },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
