import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CategoryShowcase from "@/models/CategoryShowcase.models";

export async function POST() {
  try {
    await dbConnect();
    
    // Clear existing category showcases
    await CategoryShowcase.deleteMany({});
    
    // Create default category showcases
    const defaultCategoryShowcases = [
      {
        name: "Chocolate Art",
        slug: "chocolate-art",
        image: "/images/chocolate.webp",
        sortOrder: 0,
        isActive: true,
      },
      {
        name: "Birthday Special",
        slug: "birthday-special",
        image: "/images/birthday1.webp",
        sortOrder: 1,
        isActive: true,
      },
      {
        name: "Anniversary Collection",
        slug: "anniversary-collection",
        image: "/images/aniversary.webp",
        sortOrder: 2,
        isActive: true,
      },
      {
        name: "Wedding Dreams",
        slug: "wedding-dreams",
        image: "/images/engagement.webp",
        sortOrder: 3,
        isActive: true,
      },
      {
        name: "Jungle Adventure",
        slug: "jungle-adventure",
        image: "/images/jungle.webp",
        sortOrder: 4,
        isActive: true,
      },
      {
        name: "Photo Memories",
        slug: "photo-memories",
        image: "/images/photo.webp",
        sortOrder: 5,
        isActive: true,
      },
    ];
    
    // Insert default category showcases
    const createdShowcases = await CategoryShowcase.insertMany(defaultCategoryShowcases);
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${createdShowcases.length} category showcases`,
      data: createdShowcases,
    });
  } catch (error) {
    console.error("Error seeding category showcases:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed category showcases",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}