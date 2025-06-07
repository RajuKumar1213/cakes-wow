import { NextResponse } from 'next/server';
import { createCODOrder } from '@/lib/cod';
import { generateOrderConfirmationMessage, generateAdminNotificationMessage } from '@/lib/whatsapp';

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
    });

    // Generate WhatsApp messages for COD order
    let notifications = null;
    try {
      const customerMessage = generateOrderConfirmationMessage(order);
      const adminMessage = generateAdminNotificationMessage(order);
      
      notifications = {
        customer: {
          phone: order.customerInfo.mobileNumber,
          message: customerMessage.replace('✅ Payment completed successfully!', '💰 Payment: Cash on Delivery'),
        },
        admin: {
          message: adminMessage.replace('✅ Payment Status: PAID', '💰 Payment Status: COD'),
        },
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
