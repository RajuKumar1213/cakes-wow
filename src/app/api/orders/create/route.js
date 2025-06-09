import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order.models';
import { generateOrderId } from '@/lib/serverOrderUtils';

/**
 * POST /api/orders/create
 * Create order in database with pending payment status
 */
export async function POST(request) {
  try {
    await dbConnect();

    const orderData = await request.json();
    console.log('Creating order with data:', orderData);

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
    }    // Validate mobile number - clean and validate
    const cleanMobileNumber = customerInfo.mobileNumber.replace(/\s+/g, '').replace(/^\+91/, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobileNumber)) {
      return NextResponse.json(
        { error: `Invalid mobile number format. Expected 10 digits starting with 6-9. Received: ${customerInfo.mobileNumber}` },
        { status: 400 }
      );
    }
    
    // Use cleaned mobile number
    customerInfo.mobileNumber = cleanMobileNumber;

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = await generateOrderId();    // Debug logging for timeSlot validation
    console.log('Debug: Order data before creation:', {
      timeSlot: orderData.customerInfo.timeSlot,
      timeSlotType: typeof orderData.customerInfo.timeSlot,
      deliveryDate: orderData.customerInfo.deliveryDate,
      mobileNumber: orderData.customerInfo.mobileNumber,
      originalMobileNumber: customerInfo.mobileNumber
    });

    // Create order in database with payment pending status
    const order = new Order({
      orderId,
      items: orderData.items,
      customerInfo: orderData.customerInfo,
      totalAmount: orderData.totalAmount,
      subtotal: orderData.subtotal || orderData.totalAmount,
      deliveryCharge: orderData.deliveryCharge || 0,
      onlineDiscount: orderData.onlineDiscount || 0,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: orderData.paymentMethod || 'online', // Default to online, will be updated later
      orderDate: new Date(),
      estimatedDeliveryDate: new Date(orderData.customerInfo.deliveryDate),
      timeSlot: orderData.customerInfo.timeSlot,
      notes: orderData.notes || '',
    });

    console.log('Debug: Order object before save:', {
      timeSlot: order.timeSlot,
      customerInfoTimeSlot: order.customerInfo.timeSlot
    });

    // Save order to database
    const savedOrder = await order.save();

    console.log('Order created successfully:', {
      orderId: savedOrder.orderId,
      totalAmount: savedOrder.totalAmount,
      paymentStatus: savedOrder.paymentStatus,
      status: savedOrder.status,
    });

    // Return success response with order details
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: savedOrder._id.toString(),
        orderId: savedOrder.orderId,
        totalAmount: savedOrder.totalAmount,
        status: savedOrder.status,
        paymentStatus: savedOrder.paymentStatus,
        customerInfo: savedOrder.customerInfo,
        estimatedDeliveryDate: savedOrder.estimatedDeliveryDate,
        timeSlot: savedOrder.timeSlot,
      },
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
