import { NextResponse } from 'next/server';
import { createCODOrder } from '@/lib/cod';
import { generateOrderConfirmationMessage, generateAdminNotificationMessage, sendOrderConfirmationWithOwnerNotification } from '@/lib/whatsapp';

/**
 * POST /api/payment/cod
 * Create a Cash on Delivery order
 */
export async function POST(request) {
  try {
    const orderData = await request.json();
    
    console.log('Creating COD order:', orderData);

    // Validate required fields
    if (!orderData.items || !orderData.customerInfo || !orderData.totalAmount) {
      return NextResponse.json(
        { error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    // Create COD order in database
    const order = await createCODOrder(orderData);

    console.log('COD order created successfully:', {
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      customerName: order.customerInfo.fullName,
    });    // Generate WhatsApp messages and send order confirmation for COD order
    let notifications = null;
    try {
      const customerMessage = generateOrderConfirmationMessage(order);
      const adminMessage = generateAdminNotificationMessage(order);
      
      // Send WATI API order confirmation to customer AND owner notification
      const whatsappResults = await sendOrderConfirmationWithOwnerNotification(
        order.customerInfo.mobileNumber,
        order
      );

      console.log("📱 WATI API COD Order Confirmation Results:", {
        customerSuccess: whatsappResults.customer?.success,
        ownerSuccess: whatsappResults.owner?.success,
        overallSuccess: whatsappResults.success,
        orderId: order.orderId,
        customerImageIncluded: whatsappResults.customer?.imageIncluded,
        ownerImageIncluded: whatsappResults.owner?.imageIncluded,
        errors: whatsappResults.errors,
      });
      
      notifications = {
        customer: {
          phone: order.customerInfo.mobileNumber,
          message: customerMessage.replace('✅ Payment completed successfully!', '💰 Payment: Cash on Delivery'),
        },
        admin: {
          message: adminMessage.replace('✅ Payment Status: PAID', '💰 Payment Status: COD'),
        },
        whatsapp: whatsappResults,
      };
    } catch (notificationError) {
      console.error('Error preparing COD notifications:', notificationError);
      // Don't fail the order creation if notification prep fails
    }

    return NextResponse.json({
      success: true,
      message: 'COD order created successfully',
      order: {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        status: order.status,
        totalAmount: order.totalAmount,
        customerName: order.customerInfo.fullName,
        paymentMethod: 'cod',
      },
      notifications,
    });

  } catch (error) {
    console.error('COD order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create COD order' },
      { status: 500 }
    );
  }
}
