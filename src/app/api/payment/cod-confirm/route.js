import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order.models';
import { generateOrderConfirmationMessage, generateAdminNotificationMessage } from '@/lib/whatsapp';

/**
 * POST /api/payment/cod-confirm
 * Confirm Cash on Delivery order
 */
export async function POST(request) {
  try {
    await dbConnect();

    const { orderId } = await request.json();

    console.log('Confirming COD order:', orderId);

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status for COD
    order.status = 'confirmed';
    order.paymentMethod = 'cash_on_delivery';
    // For COD, payment status remains 'pending' until delivery
    
    const updatedOrder = await order.save();

    console.log('COD order confirmed successfully:', {
      orderId: updatedOrder.orderId,
      status: updatedOrder.status,
      paymentMethod: updatedOrder.paymentMethod,
    });

    // Generate WhatsApp messages
    let notifications = {
      sms: false,
      whatsapp: false,
      email: false,
    };

    try {
      const customerMessage = generateOrderConfirmationMessage(updatedOrder);
      const adminMessage = generateAdminNotificationMessage(updatedOrder);
      
      console.log('WhatsApp notifications prepared for COD order:', {
        customerPhone: updatedOrder.customerInfo.mobileNumber,
        customerMessageLength: customerMessage.length,
        adminMessageLength: adminMessage.length,
      });

      notifications = {
        customer: {
          phone: updatedOrder.customerInfo.mobileNumber,
          message: customerMessage,
        },
        admin: {
          message: adminMessage,
        },
      };
    } catch (notificationError) {
      console.error('Error preparing notifications for COD order:', notificationError);
      // Don't fail the order confirmation if notification prep fails
    }

    // Prepare response data
    const orderResponse = {
      orderId: updatedOrder.orderId,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      paymentMethod: updatedOrder.paymentMethod,
      totalAmount: updatedOrder.totalAmount,
      customerInfo: updatedOrder.customerInfo,
      estimatedDeliveryDate: updatedOrder.estimatedDeliveryDate,
      timeSlot: updatedOrder.timeSlot,
    };

    return NextResponse.json({
      success: true,
      message: 'COD order confirmed successfully',
      order: orderResponse,
      notifications,
    });

  } catch (error) {
    console.error('COD order confirmation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to confirm COD order' },
      { status: 500 }
    );
  }
}
