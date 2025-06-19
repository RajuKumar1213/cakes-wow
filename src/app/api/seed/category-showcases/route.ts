import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CategoryShowcase from "@/models/CategoryShowcase.models";

export async function POST() {
  try {
    await dbConnect();

    // Clear existing category showcases
    await CategoryShowcase.deleteMany({});

    const defaultCategoryShowcases = [
      {
        name: "Chocolate Loaded Cakes",
        slug: "chocolate-loaded-cakes",
        image: "/images/chocolate.webp",
        description: "Rich and decadent chocolate cakes for chocolate lovers",
        productCount: 25,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: "Gourmet Cakes",
        slug: "gourmet-cakes",
        image: "/images/gourmet.webp",
        description: "Premium gourmet cakes with exquisite flavors",
        productCount: 18,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: "Photo Cakes",
        slug: "photo-print-cakes",
        image: "/images/photo.webp",
        description: "Personalized photo cakes for special occasions",
        productCount: 12,
        isActive: true,
        sortOrder: 3,
      },
      {
        name: "Design Cakes",
        slug: "design-cakes",
        image: "/images/designcake.webp",
        description: "Custom designed cakes for every celebration",
        productCount: 30,
        isActive: true,
        sortOrder: 4,
      },
      {
        name: "Anniversary Cakes",
        slug: "anniversary-cakes",
        image: "/images/aniversary.webp",
        description: "Romantic cakes for anniversary celebrations",
        productCount: 15,
        isActive: true,
        sortOrder: 5,
      },
      {
        name: "Birthday Cakes",
        slug: "birthday-cakes",
        image: "/images/birthday1.webp",
        description: "Fun and colorful birthday cakes for all ages",
        productCount: 40,
        isActive: true,
        sortOrder: 6,
      },
    ];

    const createdCategoryShowcases = await CategoryShowcase.insertMany(defaultCategoryShowcases);

    return NextResponse.json({
      success: true,
      message: `${createdCategoryShowcases.length} category showcases seeded successfully`,
      data: createdCategoryShowcases,
    });
  } catch (error) {
    console.error("Error seeding category showcases:", error);
    return NextResponse.json(
      { success: false, message: "Failed to seed category showcases" },
      { status: 500 }
    );
  }
}
