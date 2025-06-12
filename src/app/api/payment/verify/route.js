import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order.models";
import { sendCustomerOrderSuccessMessage } from "@/lib/whatsapp";

/**
 * POST /api/payment/verify
 * Verify Razorpay payment signature and update order status
 */
export async function POST(request) {
  try {
    await dbConnect();

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      backend_order_id,
    } = await request.json();

    // Validate required fields
    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !backend_order_id
    ) {
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    // Find the order in database
    const order = await Order.findById(backend_order_id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify Razorpay signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

   

    if (generated_signature !== razorpay_signature) {
      console.error("Payment signature verification failed");
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update order with payment details
    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpayOrderId = razorpay_order_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentCompletedAt = new Date();
    const updatedOrder = await order.save();

    await sendCustomerOrderSuccessMessage(
      updatedOrder.customerInfo.mobileNumber,
      updatedOrder
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        orderId: updatedOrder.orderId,
        paymentStatus: updatedOrder.paymentStatus,
        status: updatedOrder.status,
        totalAmount: updatedOrder.totalAmount,
        customerName: updatedOrder.customerInfo.fullName,
        estimatedDeliveryDate: updatedOrder.estimatedDeliveryDate,
        timeSlot: updatedOrder.timeSlot,
      },
      notifications: updatedOrder.notifications,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
