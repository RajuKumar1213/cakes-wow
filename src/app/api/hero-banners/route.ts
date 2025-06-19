import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import HeroBanner from "@/models/HeroBanner.models";

// GET - Fetch all hero banners
export async function GET() {
  try {
    await dbConnect();
    
    const banners = await HeroBanner.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("Error fetching hero banners:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch hero banners" },
      { status: 500 }
    );
  }
}

// POST - Create new hero banner
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { title, image, alt, href, sortOrder } = body;

    // Validate required fields
    if (!image || !alt || !href) {
      return NextResponse.json(
        { success: false, message: "Image, alt text, and href are required" },
        { status: 400 }
      );
    }

    const banner = new HeroBanner({
      title,
      image,
      alt,
      href,
      sortOrder: sortOrder || 0,
    });

    await banner.save();

    return NextResponse.json({
      success: true,
      data: banner,
      message: "Hero banner created successfully",
    });
  } catch (error) {
    console.error("Error creating hero banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create hero banner" },
      { status: 500 }
    );
  }
}
