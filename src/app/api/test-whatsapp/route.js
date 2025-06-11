import { NextResponse } from 'next/server';
import { testCustomerOrderConfirmation, sendCustomerOrderConfirmationRobust } from '@/lib/whatsapp';

export async function POST(request) {
  try {
    const body = await request.json();
    const { testMode, phoneNumber, orderData } = body;

    console.log('🧪 WhatsApp Test API called with:', { testMode, phoneNumber: phoneNumber?.slice(-4) });

    let result;

    if (testMode) {
      // Run the built-in test
      result = await testCustomerOrderConfirmation();
    } else if (phoneNumber && orderData) {
      // Test with provided data
      result = await sendCustomerOrderConfirmationRobust(phoneNumber, orderData);
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either set testMode: true or provide phoneNumber and orderData' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? 'WhatsApp message sent successfully!' 
        : 'WhatsApp message failed to send',
      details: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('WhatsApp Test API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp Test API',
    usage: {
      POST: {
        testMode: 'Set to true to run built-in test',
        phoneNumber: 'Phone number for custom test (include with orderData)',
        orderData: 'Order data object for custom test'
      }
    },
    template: 'customer_order_confirmation',
    variables: [
      'name - Customer name',
      'orderNumber - Order ID',
      'product1 - Product list',
      'trackingLink - Order tracking URL',
      'supportMethod - Contact support method'
    ]
  });
}
