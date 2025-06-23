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

    // Generate unique broadcast name with date
    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    const broadcastName = `admin_order_alert_${currentDate}`;

    // Prepare item details string with customization info
    const itemDetails =
      orderData.items
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

    // add-ons details
    const addOnsDetails =
      orderData.addons
        ?.map((addOn) => {
          return `${addOn.name} - ₹${addOn.price}`;
        })
        .join(", ") || "No add-ons";

    const getProductImage = () => {
      if (orderData.items?.[0]?.imageUrl) {
        return orderData.items[0].imageUrl;
      } else {
        // Fallback image
        return "/logo.webp";
      }
    };
    const productImage = getProductImage();

    const formateDate = () => {
      const date = new Date(orderData.customerInfo?.deliveryDate);

      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear(); // Normal year

      return `${day}-${month}-${year}`;
    };

    const whatsappData = {
      template_name: "admin_order_alert",
      broadcast_name: broadcastName,
      parameters: [
        {
          name: "image",
          value: productImage,
        },
        {
          name: "orderId",
          value: orderData.orderId,
        },
        {
          name: "customerName",
          value: orderData.customerInfo?.fullName || "Customer",
        },
        {
          name: "items",
          value: `${itemDetails} ${
            addOnsDetails ? `, Add-ons: ${addOnsDetails}` : ""
          }`,
        },
        {
          name: "amount",
          value: orderData.totalAmount || "0",
        },
        {
          name: "deliveryTime",
          value: orderData.customerInfo?.timeSlot
            ? `${formateDate()}  - ${orderData.customerInfo.timeSlot || ""}`
            : "Will be confirmed shortly",
        },
        {
          name: "address",
          value: orderData.customerInfo?.fullAddress
            ? orderData.customerInfo?.fullAddress
            : "As provided",
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
    const cleanPhoneNumber = String(phoneNumber).replace(/[^\d]/g, "");

    if (cleanPhoneNumber.length < 10) {
      throw new Error(`Invalid phone number format: ${phoneNumber}`);
    }

    const formattedNumber =
      cleanPhoneNumber.length === 10
        ? `91${cleanPhoneNumber}`
        : cleanPhoneNumber;

    const currentDate = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    const broadcastName = `customer_order_alert_${currentDate}`;

    const formateDate = () => {
      const date = new Date(orderData.customerInfo?.deliveryDate);

      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear(); // Normal year

      return `${day}-${month}-${year}`;
    };

    // Prepare delivery time string
    const deliveryTime = orderData.customerInfo?.timeSlot
      ? `${formateDate()}  - ${orderData.customerInfo.timeSlot || ""}`
      : "Will be confirmed shortly";

    // Prepare delivery address string
    const deliveryAddress = orderData.customerInfo?.fullAddress
      ? orderData.customerInfo?.fullAddress
      : "As provided";

    const itemDetails =
      orderData.items
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

    // add-ons details
    const addOnsDetails =
      orderData.addons
        ?.map((addOn) => {
          return `${addOn.name} - ₹${addOn.price} x ${addOn.quantity}`;
        })
        .join(", ") || "No add-ons";

    const getProductImage = () => {
      if (orderData.items?.[0]?.imageUrl) {
        return orderData.items[0].imageUrl;
      } else {
        // Fallback image
        return "/logo.webp";
      }
    };

    const productImage = getProductImage();

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
        },
        {
          name: "orderId",
          value: orderData.orderId,
        },
        {
          name: "amount",
          value: String(orderData.totalAmount) || "0",
        },
        {
          name: "itemDetails",
          value: `${itemDetails}${
            addOnsDetails ? `, Add-ons: ${addOnsDetails}` : ""
          }`,
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
