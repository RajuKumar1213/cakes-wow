// Cash on Delivery (COD) utility functions
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order.models';

export const createCODOrder = async (orderData) => {
  try {
    await dbConnect();

    const newOrder = new Order({
      orderId: `COD${Date.now()}`,
      items: orderData.items,
      customerInfo: orderData.customerInfo,
      totalAmount: orderData.totalAmount,
      subtotal: orderData.subtotal || orderData.totalAmount,
      deliveryCharge: orderData.deliveryCharge || 0,
      onlineDiscount: 0, // No discount for COD
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cod',
      notes: orderData.notes,
    });

    const savedOrder = await newOrder.save();
    return savedOrder;
  } catch (error) {
    console.error('Error creating COD order:', error);
    throw error;
  }
};

export const confirmCODOrder = async (orderId) => {
  try {
    await dbConnect();

    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = 'confirmed';
    order.paymentCompletedAt = new Date();
    
    const updatedOrder = await order.save();
    return updatedOrder;
  } catch (error) {
    console.error('Error confirming COD order:', error);
    throw error;
  }
};
