import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order.models";
import { sendCustomerOrderConfirmation } from "@/lib/whatsapp";

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

    console.log("Payment verification request:", {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      backend_order_id,
    });

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

    console.log("Signature verification:", {
      received_signature: razorpay_signature,
      generated_signature,
      matches: generated_signature === razorpay_signature,
    });

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
    console.log("Order updated successfully:", {
      orderId: updatedOrder.orderId,
      paymentStatus: updatedOrder.paymentStatus,
      status: updatedOrder.status,
    });    
     // Send WhatsApp confirmation to customer after successful payment
    console.log("🚀 Sending WhatsApp order confirmation...");
    
    try {
      const whatsappResult = await sendCustomerOrderConfirmation(updatedOrder);
      
      if (whatsappResult.success) {
        console.log("✅ WhatsApp confirmation sent successfully:", {
          phone: whatsappResult.phone,
          orderId: whatsappResult.orderId,
          customer: whatsappResult.customer
        });
        
        // Store notification status in order
        updatedOrder.notifications = {
          whatsapp: {
            sent: true,
            sentAt: new Date(),
            phone: whatsappResult.phone,
            broadcastName: whatsappResult.broadcastName
          }
        };
      } else {
        console.error("❌ WhatsApp confirmation failed:", whatsappResult.error);
        
        // Store failure status
        updatedOrder.notifications = {
          whatsapp: {
            sent: false,
            error: whatsappResult.error,
            attemptedAt: new Date()
          }
        };
      }
      
      // Save notification status
      await updatedOrder.save();
      
    } catch (whatsappError) {
      console.error("❌ WhatsApp confirmation error:", whatsappError.message);
      
      // Store error status
      updatedOrder.notifications = {
        whatsapp: {
          sent: false,
          error: whatsappError.message,
          attemptedAt: new Date()
        }
      };
      
      await updatedOrder.save();
    }return NextResponse.json({
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
