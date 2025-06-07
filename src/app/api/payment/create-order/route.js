import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order.models';
import { generateOrderId } from '@/lib/orderUtils';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payment/create-order
 * Create order in database and Razorpay order for payment
 */
export async function POST(request) {
  try {
    await dbConnect();

    const orderData = await request.json();
    console.log('Creating payment order with data:', orderData);

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
    const orderId = await generateOrderId();    // Create order in database with payment pending status
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
      paymentMethod: 'online',
      orderDate: new Date(),
      estimatedDeliveryDate: new Date(orderData.customerInfo.deliveryDate),
      timeSlot: orderData.customerInfo.timeSlot,
      notes: orderData.notes || '',
    });

    // Save order to database
    const savedOrder = await order.save();

    // Create Razorpay order
    const razorpayOrderOptions = {
      amount: Math.round(orderData.totalAmount * 100), // Amount in paisa
      currency: 'INR',
      receipt: savedOrder.orderId,
      notes: {
        orderId: savedOrder.orderId,
        customerName: customerInfo.fullName,
        customerMobile: customerInfo.mobileNumber,
      },
    };

    console.log('Creating Razorpay order with options:', razorpayOrderOptions);

    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);

    console.log('Razorpay order created:', razorpayOrder);

    // Update order with Razorpay order ID
    savedOrder.razorpayOrderId = razorpayOrder.id;
    await savedOrder.save();

    // Return success response with payment details
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        orderId: savedOrder.orderId,
        totalAmount: savedOrder.totalAmount,
        status: savedOrder.status,
        paymentStatus: savedOrder.paymentStatus,
      },
      payment: {
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        backendOrderId: savedOrder._id.toString(),
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

    // Handle Razorpay errors
    if (error.statusCode) {
      return NextResponse.json(
        { error: 'Payment service error', details: error.error.description },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
