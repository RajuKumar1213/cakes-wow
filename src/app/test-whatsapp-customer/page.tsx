'use client';

import { useState } from 'react';

export default function TestWhatsAppCustomer() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [customPhone, setCustomPhone] = useState('');

  const runMockTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-whatsapp-customer', {
        method: 'GET'
      });
      
      const result = await response.json();
      setTestResult(result);
      
      console.log('Mock test result:', result);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message
      });
    }
    setLoading(false);
  };

  const runCustomTest = async () => {
    if (!customPhone.trim()) {
      alert('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const testOrderData = {
        orderId: "TEST" + Date.now(),
        customerInfo: {
          fullName: "Test Customer",
          mobileNumber: customPhone,
          deliveryDate: "2025-06-12",
          timeSlot: "2:00 PM - 4:00 PM",
          fullAddress: "123 Test Street",
          area: "Test Area",
          pinCode: "123456"
        },
        items: [
          {
            name: "Fresh Chocolate Birthday Cake",
            selectedWeight: "1kg",
            quantity: 1,
            price: 750,
            imageUrl: "https://res.cloudinary.com/dykqvsfd1/image/upload/v1749192061/test-cake.webp"
          }
        ],
        totalAmount: 750
      };

      const response = await fetch('/api/test-whatsapp-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderData: testOrderData,
          testPhone: customPhone
        })
      });
        const result = await response.json();
      setTestResult(result);
      
      console.log('Custom test result:', result);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">
            🧪 Fresh WhatsApp Customer Test
          </h1>
          
          <div className="space-y-6">
            {/* Mock Test */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Mock Data Test</h2>
              <p className="text-sm text-gray-600 mb-4">
                Test with predefined mock order data
              </p>
              <button
                onClick={runMockTest}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
              >
                {loading ? 'Testing...' : 'Run Mock Test'}
              </button>
            </div>

            {/* Custom Phone Test */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Custom Phone Test</h2>
              <p className="text-sm text-gray-600 mb-4">
                Test with your phone number
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="tel"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Enter phone number (e.g., 9876543210)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
                <button
                  onClick={runCustomTest}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
                >
                  {loading ? 'Testing...' : 'Send Test Message'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Enter a 10-digit Indian mobile number (without +91)
              </p>
            </div>

            {/* Template Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Template Info</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Template:</strong> customer_order_confirmation</p>
                <p><strong>Broadcast:</strong> customer_order_confirmation_[timestamp]</p>
                <p><strong>Variables:</strong> name, orderNumber, product1, trackingLink, supportMethod</p>
              </div>
            </div>

            {/* Results */}
            {testResult && (
              <div className="border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">Test Results</h2>
                <div className={`p-4 rounded ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="mb-2">
                    <span className={`font-semibold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>
                  
                  {testResult.result && (
                    <div className="space-y-2 text-sm">
                      {testResult.result.success && (
                        <>
                          <p><strong>Phone:</strong> {testResult.result.phone}</p>
                          <p><strong>Order ID:</strong> {testResult.result.orderId}</p>
                          <p><strong>Customer:</strong> {testResult.result.customer}</p>
                          <p><strong>Image Included:</strong> {testResult.result.imageIncluded ? 'Yes' : 'No'}</p>
                          <p><strong>Duration:</strong> {testResult.result.duration}ms</p>
                          <p><strong>Broadcast:</strong> {testResult.result.broadcastName}</p>
                        </>
                      )}
                      
                      {testResult.result.error && (
                        <p className="text-red-600"><strong>Error:</strong> {testResult.result.error}</p>
                      )}
                    </div>
                  )}
                  
                  {testResult.error && (
                    <p className="text-red-600 text-sm"><strong>Error:</strong> {testResult.error}</p>
                  )}
                </div>
                
                {/* Raw JSON */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    View Raw Response
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Environment Check */}
            {testResult?.environment && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Environment Check</h3>
                <div className="text-sm space-y-1">
                  <p>WATI_API_ENDPOINT: {testResult.environment.hasWATI_API_ENDPOINT ? '✅ Set' : '❌ Missing'}</p>
                  <p>WATI_ACCESS_TOKEN: {testResult.environment.hasWATI_ACCESS_TOKEN ? '✅ Set' : '❌ Missing'}</p>
                  <p>NEXT_PUBLIC_APP_URL: {testResult.environment.hasNEXT_PUBLIC_APP_URL ? '✅ Set' : '❌ Missing'}</p>
                  {testResult.environment.endpointValue && (
                    <p className="text-xs text-gray-600">Endpoint: {testResult.environment.endpointValue}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
