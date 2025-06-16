import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order.models';
import { generateOrderId } from '@/lib/serverOrderUtils';

/**
 * POST /api/orders
 * Create a new order
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

    const orderData = await request.json();

    // Validate required fields
    const requiredFields = ['items', 'customerInfo', 'totalAmount'];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate customer info
    const { customerInfo } = orderData;
    const requiredCustomerFields = ['fullName', 'mobileNumber', 'deliveryDate', 'timeSlot', 'area', 'fullAddress'];
    for (const field of requiredCustomerFields) {
      if (!customerInfo[field]) {
        return NextResponse.json(
          { error: `Customer ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate mobile number
    if (!/^[6-9]\d{9}$/.test(customerInfo.mobileNumber)) {
      return NextResponse.json(
        { error: 'Invalid mobile number format' },
        { status: 400 }
      );
    }

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = await generateOrderId();

    // Create order object
    const order = new Order({
      orderId,
      items: orderData.items,
      customerInfo: orderData.customerInfo,
      totalAmount: orderData.totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      orderDate: new Date(),
      estimatedDeliveryDate: new Date(orderData.customerInfo.deliveryDate),
      timeSlot: orderData.customerInfo.timeSlot,
      notes: orderData.notes || '',
    });

    // Save order to database
    const savedOrder = await order.save();

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      orderId: savedOrder.orderId,
      order: {
        orderId: savedOrder.orderId,
        totalAmount: savedOrder.totalAmount,
        status: savedOrder.status,
        orderDate: savedOrder.orderDate,
        estimatedDeliveryDate: savedOrder.estimatedDeliveryDate,
        timeSlot: savedOrder.timeSlot
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Order creation error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid order data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Get orders (with optional filtering)
 */
export async function GET(request) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const mobileNumber = searchParams.get('mobile');
    const orderId = searchParams.get('orderId');

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (mobileNumber) filter['customerInfo.mobileNumber'] = mobileNumber;
    if (orderId) filter.orderId = orderId;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;    // Get orders with pagination
    const orders = await Order.find(filter)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('🔍 Orders API - Sample order addons:', orders[0]?.addons);
    console.log('🔍 Orders API - Number of orders:', orders.length);

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
