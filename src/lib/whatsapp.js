// c:\Users\rajuv\Desktop\cakes-wow\src\lib\whatsapp.js

const WATI_API_ENDPOINT = process.env.WATI_API_ENDPOINT;
const WATI_ACCESS_TOKEN = process.env.WATI_ACCESS_TOKEN;

/**
 * Sends a WhatsApp message using the WATI API.
 * @param {string} phoneNumber The recipient's phone number (e.g., "91xxxxxxxxxx").
 * @param {string} templateName The name of the WATI template to use.
 * @param {Array<{ name: string, value: string }>} parameters Array of parameters for the template.
 * @returns {Promise<object>} The response from the WATI API call, including a success flag.
 */
export async function sendWhatsAppMessage(phoneNumber, templateName, parameters) {
  if (!WATI_API_ENDPOINT || !WATI_ACCESS_TOKEN) {
    console.error("WATI API endpoint or access token is not configured in environment variables.");
    return { success: false, error: "WATI API credentials not configured.", watiResult: null };
  }

  const apiUrl = `${WATI_API_ENDPOINT}/api/v1/sendTemplateMessages`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WATI_ACCESS_TOKEN}`
  };

  const body = {
    template_name: templateName,
    broadcast_name: `order_confirmation_${phoneNumber}_${Date.now()}`, // Unique broadcast name
    parameters: parameters,
    receivers: [{ whatsappNumber: phoneNumber }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`WATI API Error for ${phoneNumber} (Template: ${templateName}). Status: ${response.status}. Response:`, responseData);
      return { success: false, error: `WATI API request failed with status ${response.status}`, status: response.status, watiResult: responseData };
    }

    if (responseData.result === false) {
        console.warn(`WATI message for ${phoneNumber} (Template: ${templateName}) reported an issue by WATI. Response:`, responseData);
        return { success: false, error: responseData.message || "WATI reported an issue after submission.", watiResult: responseData };
    }
    
    console.log(`WATI message submitted for ${phoneNumber} (Template: ${templateName}). Response:`, responseData);
    return { success: true, message: "Message submission initiated.", watiResult: responseData };

  } catch (error) {
    console.error(`Error sending WhatsApp message to ${phoneNumber} (Template: ${templateName}):`, error);
    return { success: false, error: error.message || "Network error or failed to parse WATI response.", watiResult: null };
  }
}

/**
 * Sends the customer order confirmation WhatsApp message.
 * @param {object} orderData Object containing order details.
 *   Expected properties:
 *   - customer.name (or customerDetails.name)
 *   - orderId (or _id for order number)
 *   - customer.phone (or customerDetails.phone or shippingAddress.phone)
 *   - items: Array of item objects (e.g., { name: string, quantity: number })
 * @returns {Promise<object>} The result of sending the message, including details for logging.
 */
export async function sendCustomerOrderConfirmation(orderData) {
  const customerName = orderData.customer?.name || orderData.customerDetails?.name || "Valued Customer";
  const orderId = String(orderData.orderId || orderData._id);
  
  let phoneNumber = orderData.customer?.phone || orderData.customerDetails?.phone || orderData.shippingAddress?.phone;

  if (!phoneNumber) {
    console.error(`Phone number not found in orderData for WhatsApp (Order ID: ${orderId}).`);
    return { success: false, error: "Phone number missing in order data.", watiResult: null, forOrder: orderId, forCustomer: customerName, forPhone: null };
  }

  let normalizedPhone = String(phoneNumber).replace(/\D/g, '');
  
  if (normalizedPhone.length === 10) { 
      normalizedPhone = `91${normalizedPhone}`;
  } else if (normalizedPhone.length === 12 && normalizedPhone.startsWith('91')) {
      // Already in 91XXXXXXXXXX format
  } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('0')) {
      normalizedPhone = `91${normalizedPhone.substring(1)}`;
  }
  // Add more specific normalization if needed for other regions or formats.

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const trackingLink = `${appUrl}/orders/${orderId}`;

  let productListString = "Your items are being processed.";
  if (orderData.items && orderData.items.length > 0) {
    productListString = orderData.items
      .map(item => `${item.name} (Qty: ${item.quantity || 1})`)
      .join('\n');
  } else {
    console.warn(`No items found in orderData for WhatsApp message (Order ID: ${orderId}). Using default product string.`);
  }

  const parameters = [
    { name: "name", value: customerName },
    { name: "ordernumber", value: orderId },
    { name: "product1", value: productListString },
    { name: "trackinglink", value: trackingLink },
    { name: "supportmethod", value: "WhatsApp or Call" } 
  ];

  const templateName = "customer_order_confirmation";

  console.log(`Attempting to send '${templateName}' to ${normalizedPhone} for order ${orderId}`);
  const result = await sendWhatsAppMessage(normalizedPhone, templateName, parameters);
  
  return { ...result, forOrder: orderId, forCustomer: customerName, forPhone: normalizedPhone };
}
