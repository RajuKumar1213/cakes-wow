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
