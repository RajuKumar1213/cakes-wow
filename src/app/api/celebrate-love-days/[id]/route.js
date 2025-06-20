import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CelebrateLovedDay from "@/models/CelebrateLovedDay.models";

// GET - Fetch single celebrate loved day
export async function GET(request, { params }) {
  try {
    const conn = await dbConnect();
    
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const { id } = params;
    const celebrateLoveDay = await CelebrateLovedDay.findById(id).lean();

    if (!celebrateLoveDay) {
      return NextResponse.json(
        {
          success: false,
          message: "Celebrate loved day not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: celebrateLoveDay,
    });
  } catch (error) {
    console.error("Error fetching celebrate loved day:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch celebrate loved day",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update single celebrate loved day
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
    const { name, slug, image, productCount, isActive, sortOrder } = body;

    // Validate required fields
    if (!name || !slug || !image) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, slug, and image are required",
        },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current item)
    const existingCelebrateLoveDay = await CelebrateLovedDay.findOne({ 
      slug, 
      _id: { $ne: id } 
    });
    
    if (existingCelebrateLoveDay) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug already exists",
        },
        { status: 400 }
      );
    }

    // Update celebrate loved day
    const updatedCelebrateLoveDay = await CelebrateLovedDay.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        image,
        productCount: productCount || 0,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCelebrateLoveDay) {
      return NextResponse.json(
        {
          success: false,
          message: "Celebrate loved day not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Celebrate loved day updated successfully",
      data: updatedCelebrateLoveDay,
    });
  } catch (error) {
    console.error("Error updating celebrate loved day:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update celebrate loved day",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete single celebrate loved day
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
    const deletedCelebrateLoveDay = await CelebrateLovedDay.findByIdAndDelete(id);

    if (!deletedCelebrateLoveDay) {
      return NextResponse.json(
        {
          success: false,
          message: "Celebrate loved day not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Celebrate loved day deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting celebrate loved day:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete celebrate loved day",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
