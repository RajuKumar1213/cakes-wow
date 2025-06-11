import { NextResponse } from 'next/server';
import { sendCustomerOrderConfirmation, testCustomerOrderConfirmation } from '@/lib/whatsappCustomer';

/**
 * Test endpoint for the fresh customer WhatsApp order confirmation
 * GET /api/test-whatsapp-customer - Test with mock data
 * POST /api/test-whatsapp-customer - Test with provided order data
 */

export async function GET() {
  try {
    console.log('🧪 Testing fresh customer WhatsApp confirmation with mock data...');
    
    // Test environment variables
    const envCheck = {
      hasWATI_API_ENDPOINT: !!process.env.WATI_API_ENDPOINT,
      hasWATI_ACCESS_TOKEN: !!process.env.WATI_ACCESS_TOKEN,
      hasNEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
      endpointValue: process.env.WATI_API_ENDPOINT?.substring(0, 30) + '...',
      tokenPreview: process.env.WATI_ACCESS_TOKEN?.substring(0, 20) + '...'
    };
    
    console.log('🔧 Environment check:', envCheck);
    
    // Run test with mock data
    const result = await testCustomerOrderConfirmation();
    
    return NextResponse.json({
      success: true,
      message: 'Fresh customer WhatsApp test completed',
      environment: envCheck,
      result: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { orderData, testPhone } = await request.json();
    
    console.log('🧪 Testing fresh customer WhatsApp with provided data...');
    
    // Validate input
    if (!orderData) {
      return NextResponse.json({
        success: false,
        error: 'orderData is required'
      }, { status: 400 });
    }
    
    // Override phone number if test phone is provided
    if (testPhone) {
      orderData.customerInfo.mobileNumber = testPhone;
      console.log(`📱 Using test phone number: ${testPhone}`);
    }
    
    console.log('📊 Test order data:', {
      orderId: orderData.orderId,
      customerName: orderData.customerInfo?.fullName,
      phone: orderData.customerInfo?.mobileNumber,
      itemsCount: orderData.items?.length || 0
    });
    
    // Send WhatsApp confirmation
    const result = await sendCustomerOrderConfirmation(orderData);
    
    return NextResponse.json({
      success: true,
      message: 'Fresh customer WhatsApp test with provided data completed',
      result: result,
      testData: {
        orderId: orderData.orderId,
        phone: orderData.customerInfo?.mobileNumber,
        customerName: orderData.customerInfo?.fullName
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
