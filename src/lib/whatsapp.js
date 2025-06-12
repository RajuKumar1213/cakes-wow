import dotenv from "dotenv";
dotenv.config();


export async function sendCustomerOrderSuccessMessage(phoneNumber, orderData) {
  try {
    // Clean phone number (remove any non-digit characters)
    // const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, "");
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

    console.log("📱 Sending customer order success message:", {
      phone: formattedNumber,
      template: "customer_success_order",
      orderId: orderData.orderId,
      customerName: orderData.customerInfo?.fullName || "Customer",
    });

        // Generate unique broadcast name with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .slice(0, 14);
    const broadcastName = `customer_success_order_${timestamp}`;


    const whatsappData = {
      template_name: "customer_success_order",
      broadcast_name: broadcastName,
      parameters: [
        {
          name: "1",
          value: orderData.customerInfo?.fullName || "Customer",
        },
        {
          name: "2",
          value: orderData.orderId,
        },
        {
          name: "3",
          value: orderData.items
            .map(
              (item) =>
                `${item.name} (${item.selectedWeight || "N/A"}) - ₹${item.price} x ${item.quantity}`
            )
            .join(", ") || "Order items",
        },
        {
          name: "4",
          value: `${process.env.NEXT_PUBLIC_API_URL}/order/${orderData.orderId}`,
        },
        {
          name: "5",
          value: `cakeswowsupport@cakeswow.com`,
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

    console.log("WhatsApp API response:", response);

  } catch (error) {
    console.error("WhatsApp Success Message sending failed:", error);
    return {
      success: false,
      error: error.message,
      phone: phoneNumber || "unknown",
      orderId: orderData?.orderId || "unknown",
      details: error.stack,
    };
  }
}

// send message along with image 


// sendCustomerOrderSuccessMessage(9546953892, {
//   _id: { $oid: "68495a7a793d2b754a1c0aea" },
//   orderId: "CWO20250611001",
//   items: [
//     {
//       productId: { $oid: "68427cdd1e04789414413a88" },
//       name: "Blueberry Cheesecake",
//       price: { $numberInt: "222" },
//       quantity: { $numberInt: "1" },
//       selectedWeight: "0.5 Kg",
//       imageUrl:
//         "https://res.cloudinary.com/dykqvsfd1/image/upload/v1749187802/gdf6lfuehiqrquqkj4xr.webp",
//       _id: { $oid: "68495a7a793d2b754a1c0aeb" },
//     },
//   ],
//   customerInfo: {
//     fullName: "Rajiv kumar",
//     mobileNumber: "9546953892",
//     deliveryDate: { $date: { $numberLong: "1749600000000" } },
//     timeSlot: "11 PM - 12 AM",
//     area: "Abhilekhagaram",
//     pinCode: "500068",
//     fullAddress: "ranchi, doranda",
//     deliveryOccasion: "",
//     relation: "",
//     senderName: "",
//     messageOnCard: "",
//     specialInstructions: "",
//     _id: { $oid: "68495a7a793d2b754a1c0aec" },
//   },
//   totalAmount: { $numberDouble: "424.96" },
//   subtotal: { $numberInt: "222" },
//   deliveryCharge: { $numberInt: "149" },
//   onlineDiscount: { $numberInt: "8" },
//   status: "confirmed",
//   paymentStatus: "paid",
//   paymentMethod: "online",
//   razorpayOrderId: "order_Qfr97P7kiUaB0C",
//   razorpayPaymentId: "pay_Qfr9DgtWIxbkOI",
//   razorpaySignature:
//     "f719a52c2a2d7970c4d49e8f0b83eaac67e21dbfaa7f584776f138a840dd09e3",
//   paymentCompletedAt: { $date: { $numberLong: "1749637779137" } },
//   orderDate: { $date: { $numberLong: "1749637754240" } },
//   estimatedDeliveryDate: { $date: { $numberLong: "1749600000000" } },
//   timeSlot: "11 PM - 12 AM",
//   notes: "",
//   trackingInfo: {
//     orderPlaced: {
//       status: "Order placed successfully",
//       timestamp: { $date: { $numberLong: "1749637754243" } },
//     },
//     confirmed: {
//       timestamp: { $date: { $numberLong: "1749637779139" } },
//       status: "Order confirmed and being prepared",
//     },
//   },
//   createdAt: { $date: { $numberLong: "1749637754244" } },
//   updatedAt: { $date: { $numberLong: "1749637779139" } },
//   __v: { $numberInt: "0" },
// });
