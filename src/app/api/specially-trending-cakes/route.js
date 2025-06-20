import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SpeciallyTrendingCake from "@/models/SpeciallyTrendingCake.models";

// GET - Fetch all specially trending cakes
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

    const speciallyTrendingCakes = await SpeciallyTrendingCake.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: speciallyTrendingCakes,
    });
  } catch (error) {
    console.error("Error fetching specially trending cakes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch specially trending cakes",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Create new specially trending cake
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

    // Create new specially trending cake
    const newCake = new SpeciallyTrendingCake({
      title,
      image,
      price,
      productSlug,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
    });

    await newCake.save();

    return NextResponse.json(
      {
        success: true,
        message: "Specially trending cake created successfully",
        data: newCake,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating specially trending cake:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create specially trending cake",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update multiple specially trending cakes (for reordering)
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
      SpeciallyTrendingCake.findByIdAndUpdate(
        item._id,
        { sortOrder: item.sortOrder },
        { new: true }
      )
    );

    const updatedItems = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Specially trending cakes reordered successfully",
      data: updatedItems,
    });
  } catch (error) {
    console.error("Error reordering specially trending cakes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reorder specially trending cakes",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
