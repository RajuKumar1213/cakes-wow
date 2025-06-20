import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CelebrateLovedDay from "@/models/CelebrateLovedDay.models";

export async function POST() {
  try {
    await dbConnect();
    
    // Clear existing celebrate loved days
    await CelebrateLovedDay.deleteMany({});
    
    // Create default celebrate loved days
    const defaultCelebrateLoveDays = [
      {
        name: "Anniversary Special",
        slug: "all-anniversary-cakes",
        image: "/images/aniversary.webp",
        productCount: 25,
        sortOrder: 0,
        isActive: true,
      },
      {
        name: "Anniversary Elegance",
        slug: "anniversary-elegance",
        image: "/images/aniversary2.webp",
        productCount: 18,
        sortOrder: 1,
        isActive: true,
      },
      {
        name: "Anniversary Celebration",
        slug: "anniversary-celebration",
        image: "/images/aniversary3.webp",
        productCount: 22,
        sortOrder: 2,
        isActive: true,
      },
      {
        name: "Anniversary Memories",
        slug: "anniversary-memories",
        image: "/images/aniversary4.webp",
        productCount: 15,
        sortOrder: 3,
        isActive: true,
      },
    ];
    
    // Insert default celebrate loved days
    const createdCelebrateLoveDays = await CelebrateLovedDay.insertMany(defaultCelebrateLoveDays);
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdCelebrateLoveDays.length} celebrate loved days`,
      data: createdCelebrateLoveDays,
    });
  } catch (error) {
    console.error("Error seeding celebrate loved days:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed celebrate loved days",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
