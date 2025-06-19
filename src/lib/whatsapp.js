import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

// Helper function to fetch admin WhatsApp number
async function getAdminWhatsAppNumber() {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp`
    );
    if (response.data.success && response.data.whatsappNumber) {
      return response.data.whatsappNumber;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch admin WhatsApp number:", error);
    return null;
  }
}

// Function to send admin notification about new order
export async function sendAdminOrderNotification(orderData) {
  try {
    // Get admin WhatsApp number
    const adminWhatsApp = await getAdminWhatsAppNumber();

    if (!adminWhatsApp) {
      console.log(
        "⚠️ Admin WhatsApp number not configured, skipping notification"
      );
      return {
        success: false,
        error: "Admin WhatsApp number not configured",
      };
    }

    // Clean and format admin phone number
    const cleanPhoneNumber = String(adminWhatsApp).replace(/[^\d]/g, "");

    if (cleanPhoneNumber.length < 10) {
      throw new Error(`Invalid admin phone number format: ${adminWhatsApp}`);
    }

    const formattedNumber =
      cleanPhoneNumber.length === 10
        ? `91${cleanPhoneNumber}`
        : cleanPhoneNumber;

    // console.log("📱 Sending admin order notification:", {
    //   phone: formattedNumber,
    //   template: "new_order_alert",
    //   orderId: orderData.orderId,
    //   customerName: orderData.customerInfo?.fullName || "Customer",
    // });

    // Generate unique broadcast name with date
    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    const broadcastName = `new_order_alert_${currentDate}`;

    // Prepare delivery time string
    const deliveryTime = orderData.deliveryInfo?.deliveryDate
      ? `${orderData.deliveryInfo.deliveryDate} ${
          orderData.deliveryInfo.deliveryTime || ""
        }`
      : "Not specified";

    // Prepare address string
    const address = orderData.deliveryInfo?.address
      ? `${orderData.deliveryInfo.address.street || ""}, ${
          orderData.deliveryInfo.address.area || ""
        }, ${orderData.deliveryInfo.address.city || ""}`.replace(
          /^,\s*|,\s*$/g,
          ""
        )
      : "Not specified";

    // Prepare order items details with customization
    const prepareOrderDetails = () => {
      if (!orderData.items || orderData.items.length === 0) return "No items";

      return orderData.items
        .map((item) => {
          let details = `${item.name}`;
          if (item.selectedWeight) details += ` (${item.selectedWeight})`;
          if (item.customization?.message) {
            details += ` - Name: "${item.customization.message}"`;
          }
          details += ` x${item.quantity}`;
          return details;
        })
        .join(", ");
    };

    const orderDetails = prepareOrderDetails();

    // Get the best available image for the notification (customization image > product image > fallback)
    const getProductImage = () => {
      if (orderData.items?.[0]?.customization?.imageUrl) {
        // For photo cakes, use the custom uploaded image
        return orderData.items[0].customization.imageUrl;
      } else if (orderData.items?.[0]?.imageUrl) {
        // Use the product image
        return orderData.items[0].imageUrl;
      } else {
        // Fallback image
        return "https://cakes-wow.vercel.app/images/cake-default.jpg";
      }
    };

    const productImage = getProductImage();    // Calculate total amount including all items and add-ons
    const calculateTotalAmount = () => {
      const itemsTotal =
        orderData.items?.reduce((total, item) => {
          return total + (item.discountedPrice || item.price) * item.quantity;
        }, 0) || 0;

      const addOnsTotal =
        orderData.addOns?.reduce((total, addOn) => {
          return total + addOn.price * addOn.quantity;
        }, 0) || 0;

      return itemsTotal + addOnsTotal + (orderData.deliveryCharge || 0);
    };    const totalAmount = orderData.totalAmount || calculateTotalAmount();    // Prepare order items details with customization for admin
    const prepareAdminOrderDetails = () => {
      if (!orderData.items || orderData.items.length === 0) return "No items";
      
      return orderData.items.map(item => {
        let details = `${item.name}`;
        if (item.selectedWeight) details += ` (${item.selectedWeight})`;
        if (item.customization?.message) {
          details += ` - Name: "${item.customization.message}"`;
        }
        details += ` x${item.quantity}`;
        return details;
      }).join(", ");
    };

    const adminOrderDetails = prepareAdminOrderDetails();

    const whatsappData = {
      template_name: "new_order_alert",
      broadcast_name: broadcastName,
      parameters: [
        {
          name: "orderId",
          value: orderData.orderId,
        },
        {
          name: "customerName",
          value: orderData.customerInfo?.fullName || "Customer",
        },
        {
          name: "amount",
          value: String(totalAmount),
        },        {
          name: "orderDetails", 
          value: adminOrderDetails,
        },
        {
          name: "deliveryTime",
          value: deliveryTime,
        },
        {
          name: "address",
          value: address,
        },
      ],
    };

    // console.log(
    //   "📡 WATI API Request Data:",
    //   JSON.stringify(whatsappData, null, 2)
    // );

    const response = await fetch(
      `${process.env.WATI_API_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber=${formattedNumber}`,
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

    const responseData = await response.json();

    if (response.ok) {
      // console.log("✅ Admin order notification sent successfully");
      return {
        success: true,
        phone: formattedNumber,
        orderId: orderData.orderId,
        response: responseData,
      };
    } else {
      console.error("❌ Failed to send admin notification:", responseData);
      return {
        success: false,
        error: responseData.message || "Failed to send notification",
        phone: formattedNumber,
        orderId: orderData.orderId,
      };
    }
  } catch (error) {
    console.error("WhatsApp Admin Notification failed:", error);
    return {
      success: false,
      error: error.message,
      orderId: orderData?.orderId || "unknown",
      details: error.stack,
    };
  }
}

export async function sendCustomerOrderSuccessMessage(phoneNumber, orderData) {
  try {
    // Clean phone number (remove any non-digit characters)
    const cleanPhoneNumber = String(phoneNumber).replace(/[^\d]/g, "");

    // Validate that we have a clean 10-digit phone number
    if (cleanPhoneNumber.length < 10) {
      throw new Error(`Invalid phone number format: ${phoneNumber}`);
    }

    // Format it with country code if not already included (for India)
    const formattedNumber =
      cleanPhoneNumber.length === 10
        ? `91${cleanPhoneNumber}`
        : cleanPhoneNumber;

    // Generate unique broadcast name with date
    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    const broadcastName = `customer_order_alert_${currentDate}`;

    // Prepare delivery time string
    const deliveryTime = orderData.deliveryInfo?.deliveryDate
      ? `${orderData.deliveryInfo.deliveryDate} ${
          orderData.deliveryInfo.deliveryTime || ""
        }`
      : "Will be confirmed shortly";

    // Prepare delivery address string
    const deliveryAddress = orderData.deliveryInfo?.address
      ? `${orderData.deliveryInfo.address.street || ""}, ${
          orderData.deliveryInfo.address.area || ""
        }, ${orderData.deliveryInfo.address.city || ""}`.replace(
          /^,\s*|,\s*$/g,
          ""
        )
      : "As provided";    // Prepare item details string with customization info
    const itemDetails = orderData.items
      ?.map((item) => {
        let itemStr = `${item.name}`;
        if (item.selectedWeight) {
          itemStr += ` (${item.selectedWeight})`;
        }
        if (item.customization?.message) {
          itemStr += ` - Name on Cake: "${item.customization.message}"`;
        }
        itemStr += ` - ₹${item.price} x ${item.quantity}`;
        return itemStr;
      })
      .join(", ") || "Order items";

    // Get the best available image for the notification (customization image > product image > fallback)
    const getProductImage = () => {
      if (orderData.items?.[0]?.customization?.imageUrl) {
        // For photo cakes, use the custom uploaded image
        return orderData.items[0].customization.imageUrl;
      } else if (orderData.items?.[0]?.imageUrl) {
        // Use the product image
        return orderData.items[0].imageUrl;
      } else {
        // Fallback image
        return "/logo.webp";
      }
    };
    
    const productImage = getProductImage();
      // Calculate total amount including all items and add-ons
    const calculateTotalAmount = () => {
      const itemsTotal = orderData.items?.reduce((total, item) => {
        return total + ((item.discountedPrice || item.price) * item.quantity);
      }, 0) || 0;
      
      const addOnsTotal = orderData.addOns?.reduce((total, addOn) => {
        return total + (addOn.price * addOn.quantity);
      }, 0) || 0;
      
      return itemsTotal + addOnsTotal + (orderData.deliveryCharge || 0);
    };
    
    const totalAmount = orderData.totalAmount || calculateTotalAmount();
    const whatsappData = {
      template_name: "customer_order_alert",
      broadcast_name: broadcastName,
      parameters: [
        {
          name: "image",
          value: productImage,
        },
        {
          name: "customerName",
          value: orderData.customerInfo?.fullName || "Customer",
        },        {
          name: "orderId",
          value: orderData.orderId,
        },
        {
          name: "amount",
          value: String(totalAmount),
        },
        {
          name: "itemDetails",
          value: itemDetails,
        },
        {
          name: "deliveryTime",
          value: deliveryTime,
        },
        {
          name: "deliveryAddress",
          value: deliveryAddress,
        },
      ],
    };

    const response = await fetch(
      `${process.env.WATI_API_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber=${formattedNumber}`,
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

    const responseData = await response.json();

    await sendAdminOrderNotification(orderData);

    return {
      success: response.ok,
      customerNotification: responseData,
      // adminNotification: adminNotificationResult,
      phone: formattedNumber,
      orderId: orderData.orderId,
    };
  } catch (error) {
    console.error("WhatsApp Customer Message sending failed:", error);
    return {
      success: false,
      error: error.message,
      phone: phoneNumber || "unknown",
      orderId: orderData?.orderId || "unknown",
      details: error.stack,
    };
  }
}
