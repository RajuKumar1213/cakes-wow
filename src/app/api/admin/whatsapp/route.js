import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin.models";

// GET - Get admin's WhatsApp number
export async function GET(request) {
  try {
    // Check if we have environment variables required for database connection
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find the single admin (there's only one admin in the system)
    const admin = await Admin.findOne({});
    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      whatsappNumber: admin.whatsappNumber || "",
    });
  } catch (error) {
    console.error("Error fetching WhatsApp number:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update admin's WhatsApp number
export async function PUT(request) {
  try {
    // Check if we have environment variables required for database connection
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { whatsappNumber } = body;

    // Validate WhatsApp number format (Indian mobile number)
    if (whatsappNumber && !/^[6-9]\d{9}$/.test(whatsappNumber)) {
      return NextResponse.json(
        { error: "Invalid WhatsApp number format. Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find and update the single admin (there's only one admin in the system)
    const admin = await Admin.findOne({});
    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // Update the WhatsApp number
    admin.whatsappNumber = whatsappNumber || undefined;
    await admin.save();

    return NextResponse.json({
      success: true,
      message: whatsappNumber 
        ? "WhatsApp number updated successfully" 
        : "WhatsApp number removed successfully",
      whatsappNumber: admin.whatsappNumber || "",
    });
  } catch (error) {
    console.error("Error updating WhatsApp number:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation error: " + error.message },
        { status: 400 }
      );
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "This WhatsApp number is already in use" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
