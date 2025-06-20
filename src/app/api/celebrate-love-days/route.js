import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CelebrateLovedDay from "@/models/CelebrateLovedDay.models";

// GET - Fetch all celebrate loved days
export async function GET() {
  try {
    const conn = await dbConnect();
    
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped",
        data: []
      });
    }

    const celebrateLoveDays = await CelebrateLovedDay.find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: celebrateLoveDays,
    });
  } catch (error) {
    console.error("Error fetching celebrate love days:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch celebrate love days",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Create new celebrate loved day
export async function POST(request) {
  try {
    const conn = await dbConnect();
    
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

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

    // Check if slug already exists
    const existingCelebrateLoveDay = await CelebrateLovedDay.findOne({ slug });
    if (existingCelebrateLoveDay) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug already exists",
        },
        { status: 400 }
      );
    }

    // Create new celebrate loved day
    const newCelebrateLoveDay = new CelebrateLovedDay({
      name,
      slug,
      image,
      productCount: productCount || 0,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
    });

    await newCelebrateLoveDay.save();

    return NextResponse.json(
      {
        success: true,
        message: "Celebrate loved day created successfully",
        data: newCelebrateLoveDay,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating celebrate loved day:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create celebrate loved day",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update multiple celebrate loved days (for reordering)
export async function PUT(request) {
  try {
    const conn = await dbConnect();
    
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        {
          success: false,
          message: "Items array is required",
        },
        { status: 400 }
      );
    }

    // Update sort order for each item
    const updatePromises = items.map(item => 
      CelebrateLovedDay.findByIdAndUpdate(
        item._id,
        { sortOrder: item.sortOrder },
        { new: true }
      )
    );

    const updatedItems = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Celebrate loved days reordered successfully",
      data: updatedItems,
    });
  } catch (error) {
    console.error("Error reordering celebrate loved days:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reorder celebrate loved days",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
