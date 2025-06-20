import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CategoryShowcase from "@/models/CategoryShowcase.models";

// GET - Fetch all category showcases
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Check if it's an admin request (you might want to check headers or query params)
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';
    
    let query = {};
    if (!includeInactive) {
      query = { isActive: true };
    }
    
    const categoryShowcases = await CategoryShowcase.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    // Set cache headers
    const response = NextResponse.json({
      success: true,
      data: categoryShowcases,
    });

    // Cache for 1 hour
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return response;
  } catch (error) {
    console.error("Error fetching category showcases:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch category showcases" },
      { status: 500 }
    );
  }
}

// POST - Create new category showcase
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
      const body = await request.json();
    const { name, slug, image, isActive, sortOrder } = body;

    // Validate required fields
    if (!name || !slug || !image) {
      return NextResponse.json(
        { success: false, message: "Name, slug, and image are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await CategoryShowcase.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category with this slug already exists" },
        { status: 400 }
      );
    }    const categoryShowcase = new CategoryShowcase({
      name,
      slug,
      image,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
    });

    await categoryShowcase.save();

    return NextResponse.json({
      success: true,
      data: categoryShowcase,
      message: "Category showcase created successfully",
    });
  } catch (error) {
    console.error("Error creating category showcase:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category showcase" },
      { status: 500 }
    );
  }
}

// PUT - Reorder category showcases
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, message: "Items array is required" },
        { status: 400 }
      );
    }

    // Update sort order for each item
    const updatePromises = items.map((item, index) =>
      CategoryShowcase.findByIdAndUpdate(item._id, { sortOrder: index })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Category showcases reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering category showcases:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reorder category showcases" },
      { status: 500 }
    );
  }
}
