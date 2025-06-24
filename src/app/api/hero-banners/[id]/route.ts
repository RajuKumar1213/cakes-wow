import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import HeroBanner from "@/models/HeroBanner.models";
import mongoose from "mongoose";

// GET - Fetch single hero banner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid banner ID" },
        { status: 400 }
      );
    }

    const banner = await HeroBanner.findById(id);

    if (!banner) {
      return NextResponse.json(
        { success: false, message: "Hero banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error("Error fetching hero banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch hero banner" },
      { status: 500 }
    );
  }
}

// PUT - Update hero banner
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
        { success: false, message: "Invalid banner ID" },
        { status: 400 }
      );
    }

    const { title, image, alt, href, isActive, sortOrder } = body;

    // Validate required fields
    if (!image || !alt || !href) {
      return NextResponse.json(
        { success: false, message: "Image, alt text, and href are required" },
        { status: 400 }
      );
    }

    const banner = await HeroBanner.findByIdAndUpdate(
      id,
      {
        title,
        image,
        alt,
        href,
        isActive,
        sortOrder,
      },
      { new: true, runValidators: true }
    );

    if (!banner) {
      return NextResponse.json(
        { success: false, message: "Hero banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: banner,
      message: "Hero banner updated successfully",
    });
  } catch (error) {
    console.error("Error updating hero banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update hero banner" },
      { status: 500 }
    );
  }
}

// DELETE - Delete hero banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid banner ID" },
        { status: 400 }
      );
    }

    const banner = await HeroBanner.findByIdAndDelete(id);

    if (!banner) {
      return NextResponse.json(
        { success: false, message: "Hero banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Hero banner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting hero banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete hero banner" },
      { status: 500 }
    );
  }
}
