import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order.models';
import { generateOrderId } from '@/lib/serverOrderUtils';
import jwt from 'jsonwebtoken';

/**
 * POST /api/orders/delivery
 * Create a new delivery order
 */
export async function POST(request) {
  try {
    // Parse request body
    const { orderData, items, selectedAddOns = [], addOnQuantities = {}, totalAmount } = await request.json();

    // Validate required fields
    if (!orderData || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order data and items are required' },
        { status: 400 }
      );
    }

    if (!orderData.deliveryDate || !orderData.timeSlot || !orderData.fullAddress || !totalAmount) {
      return NextResponse.json(
        { success: false, message: 'Missing required delivery information' },
        { status: 400 }
      );
    }

    // Get user from JWT token
    const token = request.cookies.get('token')?.value;
    let userId = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        console.log('Token validation failed:', error.message);
        // Continue without user ID for guest orders
      }
    }    // Connect to database
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    // Generate unique order ID
    const orderId = generateOrderId();

    // Process add-ons for the order
    const processedAddOns = selectedAddOns.map(addOn => ({
      addOnId: addOn._id,
      name: addOn.name,
      price: addOn.price,
      quantity: addOnQuantities[addOn._id] || 1,
      totalPrice: addOn.price * (addOnQuantities[addOn._id] || 1)
    }));

    // Calculate add-ons total
    const addOnsTotal = processedAddOns.reduce((sum, addOn) => sum + addOn.totalPrice, 0);

    // Create order object
    const newOrder = new Order({
      orderId,
      userId,
      customerInfo: {
        fullName: orderData.fullName,
        mobileNumber: orderData.mobileNumber,
        email: orderData.email,
        deliveryDate: new Date(orderData.deliveryDate),
        deliveryType: orderData.deliveryType,
        timeSlot: orderData.timeSlot,
        area: orderData.area,
        pinCode: orderData.pinCode,
        fullAddress: orderData.fullAddress,
        landmark: orderData.landmark || '',
        // New delivery detail fields
        deliveryOccasion: orderData.deliveryOccasion || '',
        relation: orderData.relation || '',
        senderName: orderData.senderName || '',
        messageOnCard: orderData.messageOnCard || '',
        specialInstructions: orderData.specialInstructions || '',
      },
      items: items.map(item => ({
        productId: item.productId || item.id,
        name: item.name,
        price: item.discountedPrice || item.price,
        quantity: item.quantity,
        weight: item.weight,
        imageUrl: item.imageUrl,
        category: item.category || 'cake',
        selectedAddOns: item.selectedAddOns || []
      })),
      addOns: processedAddOns,
      totalAmount: totalAmount,
      itemsTotal: totalAmount - addOnsTotal,      addOnsTotal: addOnsTotal,
      status: 'pending',
      paymentMethod: 'online', // Default for online payments
      orderDate: new Date(),
      estimatedDeliveryDate: new Date(orderData.deliveryDate),
      timeSlot: orderData.timeSlot,
      notes: orderData.specialInstructions || '',
    });

    // Save order to database
    const savedOrder = await newOrder.save();

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      orderId: savedOrder.orderId,
      orderDetails: {
        orderId: savedOrder.orderId,
        totalAmount: savedOrder.totalAmount,
        itemsCount: savedOrder.items.length,
        estimatedDeliveryDate: savedOrder.estimatedDeliveryDate,
        status: savedOrder.status
      }
    });

  } catch (error) {
    console.error('Error creating delivery order:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
