import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SpeciallyTrendingCake from "@/models/SpeciallyTrendingCake.models";

export async function POST() {
  try {
    const conn = await dbConnect();
    
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    // Check if data already exists
    const existingCount = await SpeciallyTrendingCake.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Specially trending cakes already seeded",
        data: { count: existingCount }
      });
    }    // Default specially trending cakes data
    const defaultCakes = [
      {
        title: "Chocolate Fantasy Cake",
        image: "/images/aniversary.webp",
        price: 799,
        productSlug: "chocolate-fantasy-cake",
        isActive: true,
        sortOrder: 0,
      },
      {
        title: "Red Velvet Delight",
        image: "/images/birthday1.webp",
        price: 849,
        productSlug: "red-velvet-delight",
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "Vanilla Supreme",
        image: "/images/engagement.webp",
        price: 749,
        productSlug: "vanilla-supreme",
        isActive: true,
        sortOrder: 2,
      },
      {
        title: "Black Forest Special",
        image: "/images/chocolate.webp",
        price: 949,
        productSlug: "black-forest-special",
        isActive: true,
        sortOrder: 3,
      },
    ];

    // Insert the default data
    const insertedCakes = await SpeciallyTrendingCake.insertMany(defaultCakes);

    return NextResponse.json({
      success: true,
      message: "Specially trending cakes seeded successfully",
      data: {
        count: insertedCakes.length,
        cakes: insertedCakes
      }
    });

  } catch (error) {
    console.error("Error seeding specially trending cakes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed specially trending cakes",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
