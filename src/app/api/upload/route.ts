import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/helpers/uploadOnCloudinary";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary({
      buffer,
      folder: 'cakeswow-hero-banners',
      public_id: `hero-banner-${Date.now()}`,
    });

    if (!uploadResult) {
      return NextResponse.json(
        { success: false, message: "Failed to upload image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: (uploadResult as any).secure_url,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
