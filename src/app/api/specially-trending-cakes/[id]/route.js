import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SpeciallyTrendingCake from "@/models/SpeciallyTrendingCake.models";

// GET - Fetch single specially trending cake
export async function GET(request, { params }) {
  try {
    const conn = await dbConnect();
    
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped",
        data: null
      });
    }

    const { id } = params;
    const cake = await SpeciallyTrendingCake.findById(id).lean();

    if (!cake) {
      return NextResponse.json(
        {
          success: false,
          message: "Specially trending cake not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cake,
    });
  } catch (error) {
    console.error("Error fetching specially trending cake:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch specially trending cake",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update specially trending cake
export async function PUT(request, { params }) {
  try {
    const conn = await dbConnect();
    
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const { id } = params;
    const body = await request.json();
    const { 
      title, 
      image, 
      price, 
      productSlug, 
      isActive, 
      sortOrder 
    } = body;

    // Validate required fields
    if (!title || !image || !price || !productSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, image, price, and product slug are required",
        },
        { status: 400 }
      );
    }

    // Update the cake
    const updatedCake = await SpeciallyTrendingCake.findByIdAndUpdate(
      id,
      {
        title,
        image,
        price,
        productSlug,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCake) {
      return NextResponse.json(
        {
          success: false,
          message: "Specially trending cake not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Specially trending cake updated successfully",
      data: updatedCake,
    });
  } catch (error) {
    console.error("Error updating specially trending cake:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update specially trending cake",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete specially trending cake
export async function DELETE(request, { params }) {
  try {
    const conn = await dbConnect();
    
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const { id } = params;

    const deletedCake = await SpeciallyTrendingCake.findByIdAndDelete(id);

    if (!deletedCake) {
      return NextResponse.json(
        {
          success: false,
          message: "Specially trending cake not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Specially trending cake deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting specially trending cake:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete specially trending cake",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
