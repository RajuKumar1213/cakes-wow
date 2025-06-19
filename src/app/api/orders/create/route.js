import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order.models";
import { generateOrderId } from "@/lib/serverOrderUtils";
import { uploadToCloudinary } from "@/helpers/uploadOnCloudinary";

/**
 * POST /api/orders/create
 * Create order in database with pending payment status
 */
export async function POST(request) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const orderData = await request.json();

    // Validate required fields
    const requiredFields = ["items", "customerInfo", "totalAmount"];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate customer info
    const { customerInfo } = orderData;
    const requiredCustomerFields = [
      "fullName",
      "mobileNumber",
      "deliveryDate",
      "timeSlot",
      "area",
      "fullAddress",
    ];
    for (const field of requiredCustomerFields) {
      if (!customerInfo[field]) {
        return NextResponse.json(
          { error: `Customer ${field} is required` },
          { status: 400 }
        );
      }
    } // Validate mobile number - clean and validate
    const cleanMobileNumber = customerInfo.mobileNumber
      .replace(/\s+/g, "")
      .replace(/^\+91/, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobileNumber)) {
      return NextResponse.json(
        {
          error: `Invalid mobile number format. Expected 10 digits starting with 6-9. Received: ${customerInfo.mobileNumber}`,
        },
        { status: 400 }
      );
    }

    // Use cleaned mobile number
    customerInfo.mobileNumber = cleanMobileNumber;

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }    // Generate unique order ID
    const orderId = await generateOrderId();    // Process items and handle photo cake image uploads
    console.log('🔍 Processing', orderData.items.length, 'items for photo cake customization...');
    console.log('🔐 Cloudinary config check:', {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
    });
    
    const processedItems = await Promise.all(
      orderData.items.map(async (item, index) => {        console.log(`📦 Item ${index + 1}:`, {
          name: item.name,
          hasCustomization: !!item.customization,
          customizationType: item.customization?.type,
          hasImageUrl: !!item.customization?.imageUrl
        });
        
        // Photo cake items should already have imageUrl from checkout upload
        if (item.customization && item.customization.type === 'photo-cake') {
          console.log('📸 Processing photo cake item:', item.name);
          
          if (item.customization.imageUrl) {
            console.log('✅ Photo cake has uploaded image URL:', item.customization.imageUrl);
          } else {
            console.log('⚠️ Photo cake missing image URL - upload may have failed');
          }
          
          // Just save the item as-is since upload already happened in checkout
          return {
            ...item,
            customization: {
              type: item.customization.type,
              message: item.customization.message || '',
              imageUrl: item.customization.imageUrl || null
            }
          };
        }
        
        // Return item as-is if no photo cake customization
        console.log('📝 Item processed without customization');
        return item;
      })
    );

    console.log('🔄 Processed', processedItems.length, 'items for order', orderId);// Process add-ons if they exist
    let processedAddons = [];
    if (orderData.selectedAddOns && Array.isArray(orderData.selectedAddOns) && orderData.selectedAddOns.length > 0) {
      processedAddons = orderData.selectedAddOns.map(addon => ({
        addOnId: addon._id || addon.addOnId,
        name: addon.name,
        price: addon.price,
        quantity: orderData.addOnQuantities?.[addon._id] || 1,
        image: addon.image || "",
      }));
      console.log('🎁 Processing addons:', processedAddons);
      console.log('🎁 Original addon data:', orderData.selectedAddOns);
    } else {
      console.log('🎁 No addons in order data');
    }    // Create order in database with payment pending status
    const order = new Order({
      orderId,
      items: processedItems, // Use processed items with uploaded images
      addons: processedAddons,
      customerInfo: orderData.customerInfo,totalAmount: orderData.totalAmount,
      subtotal: orderData.subtotal || orderData.totalAmount,
      deliveryCharge: orderData.deliveryCharge || 0,
      onlineDiscount: 0, // No discount applied
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: orderData.paymentMethod || "online", // Default to online, will be updated later
      orderDate: new Date(),
      estimatedDeliveryDate: new Date(orderData.customerInfo.deliveryDate),
      timeSlot: orderData.customerInfo.timeSlot,
      notes: orderData.notes || "",
    });    // Save order to database
    const savedOrder = await order.save();
    console.log('💾 Saved order addons:', savedOrder.addons);

    // Return success response with order details
    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",        order: {
          id: savedOrder._id.toString(),
          orderId: savedOrder.orderId,
          totalAmount: savedOrder.totalAmount,
          status: savedOrder.status,
          paymentStatus: savedOrder.paymentStatus,
          customerInfo: savedOrder.customerInfo,
          estimatedDeliveryDate: savedOrder.estimatedDeliveryDate,
          timeSlot: savedOrder.timeSlot,          items: savedOrder.items, // Now contains permanent Cloudinary URLs
          addons: savedOrder.addons,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Invalid order data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
