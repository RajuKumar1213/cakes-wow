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
 * Send Order Confirmation via WhatsApp using WATI API with template and image
 */
export async function sendOrderConfirmation(phoneNumber, orderData) {
  try {
    // Clean phone number (remove any non-digit characters except +)
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, "");

    // Generate unique broadcast name with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, 14);    const broadcastName = `order_review_${timestamp}`;

    // Get first cake image URL from order items
    const firstCakeImage = orderData.items && orderData.items.length > 0 
      ? (orderData.items[0].imageUrl || null)
      : null;

    // Prepare delivery time string
    const deliveryTime = `${orderData.customerInfo.deliveryDate} ${orderData.customerInfo.timeSlot}`;
    
    // Prepare customer address
    const customerAddress = `${orderData.customerInfo.fullAddress}, ${orderData.customerInfo.area}, ${orderData.customerInfo.pinCode}`;
    
    // Create tracking link (you can customize this URL)
    const trackingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/order-confirmation/${orderData.orderId}`;

    const whatsappData = {
      template_name: "order_review", // Template name as specified
      broadcast_name: broadcastName,
      parameters: [
        {
          name: "customerName",
          value: orderData.customerInfo.fullName,
        },
        {
          name: "orderAmount", 
          value: orderData.totalAmount.toString(),
        },
        {
          name: "orderId",
          value: orderData.orderId,
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
          name: "trackingLink",
          value: trackingLink,
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

    console.log('📱 Sending order confirmation WhatsApp:', {
      phone: cleanPhoneNumber,
      template: "order_review",
      orderId: orderData.orderId,
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

    console.log('WhatsApp API Response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WhatsApp Order Confirmation API error:", response.status, errorText);
      return {
        success: false,
        error: `WhatsApp API failed with status ${response.status}`,
        details: errorText
      };
    }

    const result = await response.json();
    console.log(`📱 WhatsApp Order Confirmation sent to ${phoneNumber}: Success`);

    return { 
      success: true, 
      data: result,
      imageIncluded: !!firstCakeImage,
      orderId: orderData.orderId
    };
  } catch (error) {
    console.error("WhatsApp Order Confirmation sending failed:", error);
    return { 
      success: false, 
      error: error.message 
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
 * Send Order Confirmation to Customer AND Owner Notification - Combined Function
 * This is the main function to call for complete order messaging
 */
export async function sendOrderConfirmationWithOwnerNotification(phoneNumber, orderData) {
  const results = {
    customer: null,
    owner: null,
    success: false,
    errors: []
  };

  try {
    console.log(`🚀 Sending order confirmations for order ${orderData.orderId}...`);

    // 1. Send customer confirmation
    console.log('📱 Sending customer confirmation...');
    const customerResult = await sendOrderConfirmation(phoneNumber, orderData);
    results.customer = customerResult;

    if (!customerResult.success) {
      results.errors.push(`Customer notification failed: ${customerResult.error}`);
    }

    // 2. Send owner notification
    console.log('👨‍💼 Sending owner notification...');
    const ownerResult = await sendOwnerNotification(orderData);
    results.owner = ownerResult;

    if (!ownerResult.success && !ownerResult.skipped) {
      results.errors.push(`Owner notification failed: ${ownerResult.error}`);
    }

    // 3. Determine overall success
    const customerSuccess = customerResult.success;
    const ownerSuccess = ownerResult.success || ownerResult.skipped; // Skip is considered success
    
    results.success = customerSuccess && ownerSuccess;

    console.log(`✅ Order confirmation results for ${orderData.orderId}:`, {
      customer: customerResult.success ? 'SUCCESS' : 'FAILED',
      owner: ownerResult.success ? 'SUCCESS' : (ownerResult.skipped ? 'SKIPPED' : 'FAILED'),
      overall: results.success ? 'SUCCESS' : 'PARTIAL/FAILED'
    });

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
