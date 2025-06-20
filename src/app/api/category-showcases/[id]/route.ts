import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CategoryShowcase from "@/models/CategoryShowcase.models";
import mongoose from "mongoose";

// GET - Fetch single category showcase
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid category showcase ID" },
        { status: 400 }
      );
    }

    const categoryShowcase = await CategoryShowcase.findById(id);
    
    if (!categoryShowcase) {
      return NextResponse.json(
        { success: false, message: "Category showcase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categoryShowcase,
    });
  } catch (error) {
    console.error("Error fetching category showcase:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch category showcase" },
      { status: 500 }
    );
  }
}

// PUT - Update category showcase
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid category showcase ID" },
        { status: 400 }
      );
    }

    const { name, slug, image, isActive, sortOrder } = body;

    // Validate required fields
    if (!name || !slug || !image) {
      return NextResponse.json(
        { success: false, message: "Name, slug, and image are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current item)
    const existingCategory = await CategoryShowcase.findOne({ slug, _id: { $ne: id } });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category with this slug already exists" },
        { status: 400 }
      );
    }    const categoryShowcase = await CategoryShowcase.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        image,
        isActive,
        sortOrder,
      },
      { new: true }
    );

    if (!categoryShowcase) {
      return NextResponse.json(
        { success: false, message: "Category showcase not found" },
        { status: 404 }
      );
    }

    // Set cache revalidation headers
    const response = NextResponse.json({
      success: true,
      data: categoryShowcase,
      message: "Category showcase updated successfully",
    });

    // Invalidate cache
    response.headers.set('Cache-Control', 'no-cache');

    return response;
  } catch (error) {
    console.error("Error updating category showcase:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category showcase" },
      { status: 500 }
    );
  }
}

// DELETE - Delete category showcase
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid category showcase ID" },
        { status: 400 }
      );
    }

    const categoryShowcase = await CategoryShowcase.findByIdAndDelete(id);
    
    if (!categoryShowcase) {
      return NextResponse.json(
        { success: false, message: "Category showcase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category showcase deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category showcase:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category showcase" },
      { status: 500 }
    );
  }
}
