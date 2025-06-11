// WhatsApp notification utility
export const sendWhatsAppMessage = (phoneNumber, message) => {
  // Format phone number (remove +91 if present and ensure it's 10 digits)
  const cleanNumber = phoneNumber.replace(/\D/g, '').slice(-10);
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/91${cleanNumber}?text=${encodedMessage}`;
  
  return whatsappUrl;
};

export const generateOrderConfirmationMessage = (order) => {
  const { orderId, customerInfo, items, totalAmount } = order;
  
  const itemsList = items.map(item => 
    `• ${item.name} ${item.selectedWeight ? `(${item.selectedWeight})` : ''} - ₹${item.price} x ${item.quantity}`
  ).join('\n');
  
  const message = `🎂 *Order Confirmation - Cakes Wow*

Order ID: *${orderId}*
Customer: ${customerInfo.fullName}

📋 *Items Ordered:*
${itemsList}

💰 *Total Amount:* ₹${totalAmount}
📅 *Delivery Date:* ${customerInfo.deliveryDate}
⏰ *Time Slot:* ${customerInfo.timeSlot}
📍 *Address:* ${customerInfo.fullAddress}, ${customerInfo.area}, ${customerInfo.pinCode}

✅ Payment completed successfully!

Thank you for choosing Cakes Wow! 🍰
We'll prepare your delicious cake with love.

For any queries, call us at: +91-XXXXXXXXXX`;

  return message;
};

export const generateAdminNotificationMessage = (order) => {
  const { orderId, customerInfo, items, totalAmount } = order;
  
  const itemsList = items.map(item => 
    `• ${item.name} ${item.selectedWeight ? `(${item.selectedWeight})` : ''} - ₹${item.price} x ${item.quantity}`
  ).join('\n');
  
  const message = `🔔 *New Order Alert - Cakes Wow*

Order ID: *${orderId}*
Customer: ${customerInfo.fullName}
Phone: ${customerInfo.mobileNumber}

📋 *Items:*
${itemsList}

💰 *Total:* ₹${totalAmount}
📅 *Delivery:* ${customerInfo.deliveryDate} (${customerInfo.timeSlot})
📍 *Address:* ${customerInfo.fullAddress}, ${customerInfo.area}, ${customerInfo.pinCode}

✅ Payment Status: PAID
📱 Action Required: Confirm order and start preparation`;

  return message;
};

/**
 * Send Order Confirmation via WhatsApp using WATI API with customer_order_confirmation template
 */
export async function sendOrderConfirmation(phoneNumber, orderData) {
  try {
    // Clean phone number (remove any non-digit characters except +)
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, "");

    // Generate unique broadcast name with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, 14);
    
    const broadcastName = `customer_order_${timestamp}`;

    // Get first cake image URL from order items
    const firstCakeImage = orderData.items && orderData.items.length > 0 
      ? (orderData.items[0].imageUrl || null)
      : null;    // Prepare product list from order items (no newlines for WATI)
    const productList = orderData.items && orderData.items.length > 0
      ? orderData.items.map(item => {
          const weight = item.selectedWeight ? ` (${item.selectedWeight})` : '';
          const quantity = item.quantity > 1 ? ` x ${item.quantity}` : '';
          return `${item.name}${weight}${quantity} - ₹${item.price * item.quantity}`;
        }).join(' | ') // Use pipe separator instead of newlines
      : 'Your delicious cake order';
    
    // Create tracking link
    const trackingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://cakeswow.com'}/order-confirmation/${orderData.orderId}`;

    // Support contact method
    const supportMethod = "WhatsApp at +91-XXXXXXXXXX or email at cakewowsupport@gmail.com";

    const whatsappData = {
      template_name: "customer_order_confirmation", // Updated template name
      broadcast_name: broadcastName,
      parameters: [
        {
          name: "name",
          value: orderData.customerInfo.fullName,
        },
        {
          name: "orderNumber",
          value: orderData.orderId,
        },
        {
          name: "product1",
          value: productList,
        },
        {
          name: "trackingLink",
          value: trackingLink,
        },
        {
          name: "supportMethod",
          value: supportMethod,
        },
      ],
    };

    // Add image if available
    if (firstCakeImage) {
      whatsappData.media = {
        type: "image",
        url: firstCakeImage
      };
    }

    console.log('📱 Sending customer order confirmation WhatsApp:', {
      phone: cleanPhoneNumber,
      template: "customer_order_confirmation",
      orderId: orderData.orderId,
      customerName: orderData.customerInfo.fullName,
      hasImage: !!firstCakeImage
    });

    const response = await fetch(
      `${process.env.WATI_API_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhoneNumber}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          Authorization: `${process.env.WATI_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(whatsappData),
      }
    );

    console.log('WhatsApp API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WhatsApp Customer Order Confirmation API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        phone: cleanPhoneNumber,
        orderId: orderData.orderId
      });
      return {
        success: false,
        error: `WhatsApp API failed with status ${response.status}: ${response.statusText}`,
        details: errorText,
        phone: cleanPhoneNumber,
        orderId: orderData.orderId
      };
    }

    const result = await response.json();
    console.log(`✅ Customer order confirmation sent successfully to ${phoneNumber} for order ${orderData.orderId}`);

    return { 
      success: true, 
      data: result,
      imageIncluded: !!firstCakeImage,
      orderId: orderData.orderId,
      phone: cleanPhoneNumber,
      template: "customer_order_confirmation"
    };
  } catch (error) {
    console.error("WhatsApp Customer Order Confirmation sending failed:", {
      error: error.message,
      stack: error.stack,
      phone: phoneNumber,
      orderId: orderData?.orderId || 'unknown'
    });
    return { 
      success: false, 
      error: error.message,
      phone: phoneNumber,
      orderId: orderData?.orderId || 'unknown'
    };
  }
}

/**
 * Send Owner Notification via WhatsApp using WATI API when new order is received
 */
export async function sendOwnerNotification(orderData) {
  try {
    // Owner phone number from environment variable
    const ownerPhoneNumber = process.env.OWNER_PHONE_NUMBER;
    
    if (!ownerPhoneNumber) {
      console.warn('⚠️ Owner phone number not configured. Skipping owner notification.');
      return {
        success: false,
        error: 'Owner phone number not configured',
        skipped: true
      };
    }

    // Clean owner phone number
    const cleanOwnerPhone = ownerPhoneNumber.replace(/[^\d]/g, "");

    // Generate unique broadcast name with timestamp for owner notification
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, 14);    const ownerBroadcastName = `owner_alert_${timestamp}`;

    // Get first cake image URL from order items
    const firstCakeImage = orderData.items && orderData.items.length > 0 
      ? (orderData.items[0].imageUrl || null)
      : null;

    // Prepare items list for owner
    const itemsList = orderData.items.map(item => 
      `${item.name} ${item.selectedWeight ? `(${item.selectedWeight})` : ''} - ₹${item.price} x ${item.quantity}`
    ).join(', ');

    // Prepare delivery time string
    const deliveryTime = `${orderData.customerInfo.deliveryDate} ${orderData.customerInfo.timeSlot}`;
    
    // Prepare customer address
    const customerAddress = `${orderData.customerInfo.fullAddress}, ${orderData.customerInfo.area}, ${orderData.customerInfo.pinCode}`;
    
    // Admin link for order management
    const adminOrderLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/admin/orders?orderId=${orderData.orderId}`;

    const ownerWhatsappData = {
      template_name: "owner_order_alert", // New template for owner notifications
      broadcast_name: ownerBroadcastName,
      parameters: [
        {
          name: "orderId",
          value: orderData.orderId,
        },
        {
          name: "customerName",
          value: orderData.customerInfo.fullName,
        },
        {
          name: "customerPhone", 
          value: orderData.customerInfo.mobileNumber,
        },
        {
          name: "orderAmount",
          value: orderData.totalAmount.toString(),
        },
        {
          name: "itemsList",
          value: itemsList,
        },
        {
          name: "deliveryTime",
          value: deliveryTime,
        },
        {
          name: "customerAddress",
          value: customerAddress,
        },
        {
          name: "adminLink",
          value: adminOrderLink,
        },
      ],
    };

    // Add image if available
    if (firstCakeImage) {
      ownerWhatsappData.media = {
        type: "image",
        url: firstCakeImage
      };
    }

    console.log('👨‍💼 Sending owner notification WhatsApp:', {
      ownerPhone: cleanOwnerPhone,
      template: "owner_order_alert",
      orderId: orderData.orderId,
      customerName: orderData.customerInfo.fullName,
      orderAmount: orderData.totalAmount,
      hasImage: !!firstCakeImage
    });

    const response = await fetch(
      `${process.env.WATI_API_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber=${cleanOwnerPhone}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          Authorization: `${process.env.WATI_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ownerWhatsappData),
      }
    );

    console.log('Owner WhatsApp API Response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Owner WhatsApp notification API error:", response.status, errorText);
      return {
        success: false,
        error: `Owner WhatsApp API failed with status ${response.status}`,
        details: errorText
      };
    }

    const result = await response.json();
    console.log(`👨‍💼 Owner notification sent successfully for order ${orderData.orderId}`);

    return { 
      success: true, 
      data: result,
      imageIncluded: !!firstCakeImage,
      orderId: orderData.orderId,
      ownerPhone: cleanOwnerPhone
    };
  } catch (error) {
    console.error("Owner WhatsApp notification sending failed:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Send Order Confirmation to Customer AND Owner Notification - Enhanced Version
 * This is the main function to call for complete order messaging with the new customer_order_confirmation template
 */
export async function sendOrderConfirmationWithOwnerNotification(phoneNumber, orderData) {
  const results = {
    customer: null,
    owner: null,
    success: false,
    errors: [],
    startTime: Date.now()
  };

  try {
    console.log(`🚀 Enhanced order confirmations starting for order ${orderData.orderId}...`);

    // 1. Send customer confirmation using robust implementation
    console.log('📱 Sending enhanced customer confirmation...');
    const customerResult = await sendCustomerOrderConfirmationRobust(phoneNumber, orderData);
    results.customer = customerResult;

    if (!customerResult.success) {
      results.errors.push(`Customer notification failed: ${customerResult.error}`);
      console.warn('❌ Customer notification failed, details:', customerResult);
    } else {
      console.log('✅ Customer notification sent successfully');
    }

    // 2. Send owner notification (keep existing logic)
    console.log('👨‍💼 Sending owner notification...');
    const ownerResult = await sendOwnerNotification(orderData);
    results.owner = ownerResult;

    if (!ownerResult.success && !ownerResult.skipped) {
      results.errors.push(`Owner notification failed: ${ownerResult.error}`);
      console.warn('❌ Owner notification failed, details:', ownerResult);
    } else {
      console.log('✅ Owner notification handled successfully');
    }

    // 3. Determine overall success
    const customerSuccess = customerResult.success;
    const ownerSuccess = ownerResult.success || ownerResult.skipped; // Skip is considered success
    
    results.success = customerSuccess && ownerSuccess;
    results.partialSuccess = customerSuccess || ownerSuccess;
    results.duration = Date.now() - results.startTime;

    const finalStatus = {
      customer: customerResult.success ? 'SUCCESS' : 'FAILED',
      owner: ownerResult.success ? 'SUCCESS' : (ownerResult.skipped ? 'SKIPPED' : 'FAILED'),
      overall: results.success ? 'FULL SUCCESS' : (results.partialSuccess ? 'PARTIAL SUCCESS' : 'FAILED'),
      duration: `${results.duration}ms`,
      orderId: orderData.orderId,
      customerPhone: phoneNumber,
      template: 'customer_order_confirmation'
    };

    console.log(`📊 Enhanced order confirmation results:`, finalStatus);

    return results;

  } catch (error) {
    console.error('Critical error in order confirmation process:', error);
    results.errors.push(`Critical error: ${error.message}`);
    return results;
  }
}

/**
 * Send Dual WATI Template Messages - Customer + Owner Alert
 * Sends 'new_order_alert' template to both customer and store owner simultaneously
 * 
 * @param {Object} order - Order object containing notification details
 * @param {string} order.customerNumber - Customer phone with country code (e.g. "919876543210")
 * @param {string} order.ownerNumber - Owner phone with country code (e.g. "919999999999")
 * @param {string} order.orderId - Order ID
 * @param {string} order.customerName - Customer's full name
 * @param {string} order.amount - Order amount
 * @param {string} order.deliveryTime - Delivery date and time
 * @param {string} order.address - Delivery address
 * @returns {Promise<Object>} Results object with customer and owner notification status
 */
export async function notifyNewOrder(order) {
  try {
    console.log(`🚀 Sending dual notifications for order ${order.orderId}...`);

    // Validate required fields
    const requiredFields = ['customerNumber', 'ownerNumber', 'orderId', 'customerName', 'amount', 'deliveryTime', 'address'];
    for (const field of requiredFields) {
      if (!order[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate environment variables
    if (!process.env.WATI_API_ENDPOINT || !process.env.WATI_ACCESS_TOKEN) {
      throw new Error('WATI API credentials not configured. Check WATI_API_ENDPOINT and WATI_ACCESS_TOKEN environment variables.');
    }

    // Clean phone numbers (remove any non-digit characters)
    const cleanCustomerNumber = order.customerNumber.replace(/[^\d]/g, "");
    const cleanOwnerNumber = order.ownerNumber.replace(/[^\d]/g, "");

    // Generate unique broadcast names with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, 14);
    
    const customerBroadcastName = `customer_alert_${timestamp}`;
    const ownerBroadcastName = `owner_alert_${timestamp}`;

    // Prepare customer notification payload
    const customerPayload = {
      template_name: "new_order_alert",
      broadcast_name: customerBroadcastName,
      parameters: [
        {
          name: "orderId",
          value: order.orderId,
        },
        {
          name: "amount",
          value: order.amount.toString(),
        },
        {
          name: "deliveryTime",
          value: order.deliveryTime,
        },
        {
          name: "address",
          value: order.address,
        },
      ],
    };

    // Prepare owner notification payload
    const ownerPayload = {
      template_name: "new_order_alert",
      broadcast_name: ownerBroadcastName,
      parameters: [
        {
          name: "orderId",
          value: order.orderId,
        },
        {
          name: "customerName",
          value: order.customerName,
        },
        {
          name: "amount",
          value: order.amount.toString(),
        },
        {
          name: "deliveryTime",
          value: order.deliveryTime,
        },
        {
          name: "address",
          value: order.address,
        },
      ],
    };

    console.log('📱 Sending parallel notifications:', {
      customerPhone: cleanCustomerNumber,
      ownerPhone: cleanOwnerNumber,
      template: "new_order_alert",
      orderId: order.orderId,
      amount: order.amount
    });

    // Send both messages concurrently using Promise.all
    const [customerResult, ownerResult] = await Promise.all([
      // Customer notification
      fetch(
        `${process.env.WATI_API_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber=${cleanCustomerNumber}`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `${process.env.WATI_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerPayload),
        }
      ).then(async (response) => {
        const result = {
          type: 'customer',
          phone: cleanCustomerNumber,
          success: response.ok,
          status: response.status,
          data: null,
          error: null
        };

        try {
          if (response.ok) {
            result.data = await response.json();
            console.log(`✅ Customer notification sent successfully to ${cleanCustomerNumber}`);
          } else {
            const errorText = await response.text();
            result.error = `Customer notification failed: ${response.status} - ${errorText}`;
            console.error(result.error);
          }
        } catch (parseError) {
          result.error = `Customer notification response parsing failed: ${parseError.message}`;
          console.error(result.error);
        }

        return result;
      }).catch((fetchError) => {
        const result = {
          type: 'customer',
          phone: cleanCustomerNumber,
          success: false,
          status: null,
          data: null,
          error: `Customer notification fetch failed: ${fetchError.message}`
        };
        console.error(result.error);
        return result;
      }),

      // Owner notification
      fetch(
        `${process.env.WATI_API_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber=${cleanOwnerNumber}`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `${process.env.WATI_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ownerPayload),
        }
      ).then(async (response) => {
        const result = {
          type: 'owner',
          phone: cleanOwnerNumber,
          success: response.ok,
          status: response.status,
          data: null,
          error: null
        };

        try {
          if (response.ok) {
            result.data = await response.json();
            console.log(`✅ Owner notification sent successfully to ${cleanOwnerNumber}`);
          } else {
            const errorText = await response.text();
            result.error = `Owner notification failed: ${response.status} - ${errorText}`;
            console.error(result.error);
          }
        } catch (parseError) {
          result.error = `Owner notification response parsing failed: ${parseError.message}`;
          console.error(result.error);
        }

        return result;
      }).catch((fetchError) => {
        const result = {
          type: 'owner',
          phone: cleanOwnerNumber,
          success: false,
          status: null,
          data: null,
          error: `Owner notification fetch failed: ${fetchError.message}`
        };
        console.error(result.error);
        return result;
      })
    ]);

    // Prepare final results
    const results = {
      customer: customerResult,
      owner: ownerResult,
      success: customerResult.success && ownerResult.success,
      partialSuccess: customerResult.success || ownerResult.success,
      orderId: order.orderId,
      timestamp: new Date().toISOString(),
      errors: []
    };

    // Collect errors
    if (!customerResult.success) {
      results.errors.push(customerResult.error);
    }
    if (!ownerResult.success) {
      results.errors.push(ownerResult.error);
    }

    // Log final results
    console.log(`📊 Dual notification results for order ${order.orderId}:`, {
      customer: customerResult.success ? 'SUCCESS' : 'FAILED',
      owner: ownerResult.success ? 'SUCCESS' : 'FAILED',
      overall: results.success ? 'FULL SUCCESS' : (results.partialSuccess ? 'PARTIAL SUCCESS' : 'FAILED'),
      errorCount: results.errors.length
    });

    return results;

  } catch (error) {
    console.error('Critical error in notifyNewOrder:', error);
    
    return {
      customer: { success: false, error: 'Critical error occurred' },
      owner: { success: false, error: 'Critical error occurred' },
      success: false,
      partialSuccess: false,
      orderId: order?.orderId || 'unknown',
      timestamp: new Date().toISOString(),
      errors: [`Critical error: ${error.message}`]
    };
  }
}

/**
 * Enhanced Send Customer Order Confirmation with comprehensive error handling
 * Uses the customer_order_confirmation template from WATI
 */
export async function sendCustomerOrderConfirmationRobust(phoneNumber, orderData) {
  const functionName = 'sendCustomerOrderConfirmationRobust';
  const startTime = Date.now();
  
  try {
    // 1. Validate inputs
    if (!phoneNumber || !orderData) {
      throw new Error('Phone number and order data are required');
    }

    if (!orderData.orderId || !orderData.customerInfo?.fullName) {
      throw new Error('Order ID and customer name are required');
    }

    // 2. Validate environment variables
    if (!process.env.WATI_API_ENDPOINT || !process.env.WATI_ACCESS_TOKEN) {
      throw new Error('WATI API credentials not configured. Check WATI_API_ENDPOINT and WATI_ACCESS_TOKEN environment variables.');
    }

    // 3. Clean and validate phone number
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, "");
    if (cleanPhoneNumber.length < 10) {
      throw new Error(`Invalid phone number: ${phoneNumber}`);
    }

    // 4. Generate unique broadcast name with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, 14);
    
    const broadcastName = `customer_order_${timestamp}_${orderData.orderId.slice(-4)}`;    // 5. Prepare product list with better formatting (no newlines for WATI)
    let productList = 'Your delicious cake order';
    try {
      if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
        productList = orderData.items.map((item, index) => {
          const weight = item.selectedWeight ? ` (${item.selectedWeight})` : '';
          const quantity = item.quantity && item.quantity > 1 ? ` x ${item.quantity}` : '';
          const price = item.price ? ` - ₹${(item.price * (item.quantity || 1)).toFixed(0)}` : '';
          return `${index + 1}. ${item.name || 'Cake'}${weight}${quantity}${price}`;
        }).join(' | '); // Use pipe separator instead of newlines
      }
    } catch (itemError) {
      console.warn('Error formatting product list, using fallback:', itemError.message);
      productList = `Order #${orderData.orderId} - Your delicious cake order`;
    }

    // 6. Create tracking link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cakeswow.com';
    const trackingLink = `${baseUrl}/order-confirmation/${orderData.orderId}`;

    // 7. Support contact method
    const supportMethod = "WhatsApp or email at cakewowsupport@gmail.com";

    // 8. Get first cake image URL
    let firstCakeImage = null;
    try {
      if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
        const firstItem = orderData.items[0];
        firstCakeImage = firstItem.imageUrl || firstItem.imageUrls?.[0] || null;
      }
    } catch (imageError) {
      console.warn('Error getting image URL:', imageError.message);
    }

    // 9. Prepare WhatsApp template data
    const whatsappData = {
      template_name: "customer_order_confirmation",
      broadcast_name: broadcastName,
      parameters: [
        {
          name: "name",
          value: orderData.customerInfo.fullName.trim(),
        },
        {
          name: "orderNumber",
          value: orderData.orderId.toString(),
        },
        {
          name: "product1",
          value: productList,
        },
        {
          name: "trackingLink",
          value: trackingLink,
        },
        {
          name: "supportMethod",
          value: supportMethod,
        },
      ],
    };

    // 10. Add image if available
    if (firstCakeImage && typeof firstCakeImage === 'string' && firstCakeImage.startsWith('http')) {
      whatsappData.media = {
        type: "image",
        url: firstCakeImage
      };
    }

    console.log(`🚀 ${functionName} - Starting WhatsApp send:`, {
      phone: cleanPhoneNumber,
      template: "customer_order_confirmation",
      orderId: orderData.orderId,
      customerName: orderData.customerInfo.fullName,
      hasImage: !!firstCakeImage,
      broadcastName,
      parametersCount: whatsappData.parameters.length
    });

    // 11. Send WhatsApp message with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    const response = await fetch(
      `${process.env.WATI_API_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhoneNumber}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
          Authorization: `${process.env.WATI_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(whatsappData),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    console.log(`📊 ${functionName} - API Response:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      duration: `${duration}ms`,
      orderId: orderData.orderId
    });

    // 12. Handle response
    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.text();
      } catch (textError) {
        errorDetails = 'Could not read error response';
      }

      const errorInfo = {
        status: response.status,
        statusText: response.statusText,
        details: errorDetails,
        phone: cleanPhoneNumber,
        orderId: orderData.orderId,
        template: "customer_order_confirmation",
        duration: `${duration}ms`
      };

      console.error(`❌ ${functionName} - WhatsApp API error:`, errorInfo);
      
      return {
        success: false,
        error: `WhatsApp API failed with status ${response.status}: ${response.statusText}`,
        details: errorDetails,
        phone: cleanPhoneNumber,
        orderId: orderData.orderId,
        duration,
        ...errorInfo
      };
    }

    // 13. Parse successful response
    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.warn(`⚠️ ${functionName} - Could not parse response JSON:`, jsonError.message);
      result = { status: 'sent', message: 'Response received but could not parse JSON' };
    }

    console.log(`✅ ${functionName} - Success:`, {
      phone: cleanPhoneNumber,
      orderId: orderData.orderId,
      customerName: orderData.customerInfo.fullName,
      duration: `${duration}ms`,
      template: "customer_order_confirmation",
      imageIncluded: !!firstCakeImage,
      broadcastName
    });

    return { 
      success: true, 
      data: result,
      imageIncluded: !!firstCakeImage,
      orderId: orderData.orderId,
      phone: cleanPhoneNumber,
      template: "customer_order_confirmation",
      duration,
      customerName: orderData.customerInfo.fullName,
      broadcastName
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Handle different types of errors
    let errorType = 'unknown';
    if (error.name === 'AbortError') {
      errorType = 'timeout';
    } else if (error.message.includes('fetch')) {
      errorType = 'network';
    } else if (error.message.includes('credentials')) {
      errorType = 'configuration';
    } else if (error.message.includes('required')) {
      errorType = 'validation';
    }

    const errorInfo = {
      error: error.message,
      stack: error.stack,
      type: errorType,
      phone: phoneNumber,
      orderId: orderData?.orderId || 'unknown',
      customerName: orderData?.customerInfo?.fullName || 'unknown',
      duration: `${duration}ms`,
      function: functionName
    };

    console.error(`💥 ${functionName} - Critical error:`, errorInfo);
    
    return { 
      success: false, 
      error: error.message,
      type: errorType,
      phone: phoneNumber,
      orderId: orderData?.orderId || 'unknown',
      duration,
      function: functionName
    };
  }
}

/**
 * Send Customer Order Confirmation Only - Simplified wrapper
 * Uses the enhanced robust implementation with customer_order_confirmation template
 */
export async function sendCustomerOrderConfirmation(phoneNumber, orderData) {
  console.log(`📱 Sending customer order confirmation for order ${orderData.orderId}...`);
  
  const result = await sendCustomerOrderConfirmationRobust(phoneNumber, orderData);
  
  if (result.success) {
    console.log(`✅ Customer confirmation sent successfully to ${phoneNumber}`);
  } else {
    console.error(`❌ Customer confirmation failed for ${phoneNumber}:`, result.error);
  }
  
  return result;
}

/**
 * Test function for customer order confirmation
 * Use this to test the WhatsApp template implementation
 */
export async function testCustomerOrderConfirmation() {
  const testOrderData = {
    orderId: "TEST_ORDER_" + Date.now(),
    customerInfo: {
      fullName: "Test Customer",
      deliveryDate: "2024-12-25",
      timeSlot: "2:00 PM - 4:00 PM",
      fullAddress: "123 Test Street",
      area: "Test Area",
      pinCode: "123456"
    },
    items: [
      {
        name: "Chocolate Birthday Cake",
        selectedWeight: "1kg",
        quantity: 1,
        price: 750,
        imageUrl: "https://example.com/cake.jpg"
      },
      {
        name: "Vanilla Cupcakes",
        selectedWeight: "500g",
        quantity: 2,
        price: 300,
        imageUrl: "https://example.com/cupcakes.jpg"
      }
    ],
    totalAmount: 1350
  };

  console.log('🧪 Testing customer order confirmation with test data...');
  
  // Test with a test phone number (should be your test number)
  const testPhoneNumber = "9876543210"; // Replace with your test number
  
  const result = await sendCustomerOrderConfirmationRobust(testPhoneNumber, testOrderData);
  
  console.log('🧪 Test Result:', result);
  
  return result;
}
