import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order.models';

/**
 * PATCH /api/orders/[orderId]
 * Update order status and other fields
 */
export async function PATCH(request, { params }) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const { orderId } = params;
    const updateData = await request.json();

    console.log(`🔄 Updating order ${orderId} with:`, updateData);

    // Find and update the order
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update fields based on what's provided
    if (updateData.status) {
      order.status = updateData.status;
      
      // Update tracking info based on status
      const now = new Date();
      const statusMessage = getStatusMessage(updateData.status);
      
      switch (updateData.status) {
        case 'confirmed':
          order.trackingInfo.confirmed = {
            timestamp: now,
            status: statusMessage
          };
          break;
        case 'preparing':
          if (!order.trackingInfo.preparing) {
            order.trackingInfo.preparing = {
              timestamp: now,
              status: statusMessage
            };
          }
          break;
        case 'out_for_delivery':
          if (!order.trackingInfo.outForDelivery) {
            order.trackingInfo.outForDelivery = {
              timestamp: now,
              status: statusMessage
            };
          }
          break;
        case 'delivered':
          order.trackingInfo.delivered = {
            timestamp: now,
            status: statusMessage
          };
          order.actualDeliveryDate = now;
          break;
        case 'cancelled':
          order.trackingInfo.cancelled = {
            timestamp: now,
            status: statusMessage
          };
          break;
      }
    }

    if (updateData.paymentStatus) {
      order.paymentStatus = updateData.paymentStatus;
      if (updateData.paymentStatus === 'paid') {
        order.paymentCompletedAt = new Date();
      }
    }

    if (updateData.notes !== undefined) {
      order.notes = updateData.notes;
    }

    // Save the updated order
    const updatedOrder = await order.save();


    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: {
        orderId: updatedOrder.orderId,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        trackingInfo: updatedOrder.trackingInfo,
        updatedAt: updatedOrder.updatedAt
      }
    });

  } catch (error) {
    console.error('Order update error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/[orderId]
 * Get specific order details
 */
export async function GET(request, { params }) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const { orderId } = params;
    
    const order = await Order.findOne({ orderId }).lean();
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

function getStatusMessage(status) {
  const statusMessages = {
    pending: 'Order is pending confirmation',
    confirmed: 'Order confirmed and processing started',
    preparing: 'Your order is being prepared with care',
    out_for_delivery: 'Order is out for delivery',
    delivered: 'Order delivered successfully',
    cancelled: 'Order has been cancelled'
  };
  
  return statusMessages[status] || 'Status updated';
}
