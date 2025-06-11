import { NextResponse } from 'next/server';
import { sendCustomerOrderConfirmationRobust } from '@/lib/whatsapp';

export async function POST(request) {
  try {
    console.log('🧪 Debug WhatsApp - API called');
    
    const body = await request.json();
    const { phoneNumber, testData } = body;

    // Create test order data
    const testOrderData = testData || {
      orderId: "DEBUG_" + Date.now(),
      customerInfo: {
        fullName: "Debug Test User",
        mobileNumber: phoneNumber || "9876543210",
        deliveryDate: "2024-12-25",
        timeSlot: "2:00 PM - 4:00 PM",
        fullAddress: "123 Debug Street",
        area: "Test Area",
        pinCode: "123456"
      },
      items: [
        {
          name: "Debug Chocolate Cake",
          selectedWeight: "1kg",
          quantity: 1,
          price: 750,
          imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400"
        }
      ],
      totalAmount: 750
    };

    console.log('🧪 Debug WhatsApp - Test data prepared:', {
      orderId: testOrderData.orderId,
      customerName: testOrderData.customerInfo.fullName,
      phone: testOrderData.customerInfo.mobileNumber
    });

    // Test environment variables
    const envCheck = {
      WATI_API_ENDPOINT: !!process.env.WATI_API_ENDPOINT,
      WATI_ACCESS_TOKEN: !!process.env.WATI_ACCESS_TOKEN,
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
      endpointValue: process.env.WATI_API_ENDPOINT,
      tokenPreview: process.env.WATI_ACCESS_TOKEN?.substring(0, 20) + '...'
    };

    console.log('🧪 Debug WhatsApp - Environment check:', envCheck);

    // Test the robust function
    const result = await sendCustomerOrderConfirmationRobust(
      phoneNumber || testOrderData.customerInfo.mobileNumber,
      testOrderData
    );

    console.log('🧪 Debug WhatsApp - Result:', result);

    return NextResponse.json({
      success: true,
      message: 'Debug WhatsApp test completed',
      environment: envCheck,
      testOrderData,
      whatsappResult: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🧪 Debug WhatsApp - Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Debug WhatsApp API - Use POST to test',
    usage: {
      POST: {
        phoneNumber: 'Phone number to test (optional)',
        testData: 'Custom order data (optional)'
      }
    }
  });
}
