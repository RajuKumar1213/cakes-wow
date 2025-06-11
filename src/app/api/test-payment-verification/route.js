import { NextResponse } from 'next/server';
import { sendOrderConfirmationWithOwnerNotification } from '@/lib/whatsapp';

export async function POST(request) {
  try {
    console.log('🧪 Testing Payment Verification WhatsApp Flow...');
    
    // Use the actual order structure from the existing order
    const testOrderData = {
      orderId: "TEST_PAYMENT_" + Date.now(),
      customerInfo: {
        fullName: "Test WhatsApp Customer",
        mobileNumber: "9876543210",
        deliveryDate: "2025-06-11T00:00:00.000Z",
        timeSlot: "2:00 PM - 4:00 PM",
        area: "Test Area",
        pinCode: "123456",
        fullAddress: "123 Test Street"
      },
      items: [
        {
          productId: "68428d7e7a02dff72d418716",
          name: "Chocolate Birthday Cake",
          price: 750,
          quantity: 1,
          selectedWeight: "1kg",
          imageUrl: "https://res.cloudinary.com/dykqvsfd1/image/upload/v1749192061/test-cake.webp"
        }
      ],
      totalAmount: 750,
      paymentStatus: "paid",
      status: "confirmed"
    };
    
    console.log('🧪 Test order data prepared:', {
      orderId: testOrderData.orderId,
      customerName: testOrderData.customerInfo.fullName,
      phone: testOrderData.customerInfo.mobileNumber
    });
    
    // This is exactly what the payment verification calls
    const whatsappResults = await sendOrderConfirmationWithOwnerNotification(
      testOrderData.customerInfo.mobileNumber,
      testOrderData
    );
    
    console.log('🧪 WhatsApp Results:', whatsappResults);
    
    return NextResponse.json({
      success: true,
      message: "Payment verification WhatsApp test completed",
      testOrderData: {
        orderId: testOrderData.orderId,
        customerName: testOrderData.customerInfo.fullName,
        phone: testOrderData.customerInfo.mobileNumber
      },
      whatsappResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🧪 Test Payment Verification Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Test Payment Verification WhatsApp Flow - Use POST to test",
    description: "This endpoint simulates the exact WhatsApp flow that happens during payment verification"
  });
}
