import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category, { ICategory } from "@/models/Category.models";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ApiResponse<any>>> {  try {
    await dbConnect();
    
    const { slug } = await params;
    
    const category = await Category.findOne({ 
      slug: slug,
      isActive: true 
    }).lean() as ICategory | null;

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found"
        },
        { status: 404 }
      );
    }    return NextResponse.json({
      success: true,
      data: {
        _id: String(category._id),
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
      }
    });

  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}
