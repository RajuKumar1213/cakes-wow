import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category.models";

// TypeScript interfaces
interface CategoryDocument {
  _id: string;
  name: string;
  slug: string;
  group: string;
  type: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface GroupedCategories {
  [key: string]: {
    _id: string;
    name: string;
    slug: string;
    type: string;
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<CategoryDocument[] | GroupedCategories>>> {
  try {
    await dbConnect();    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1, name: 1 })
      .lean();

    // If format=all is requested, return all categories as flat array
    if (format === "all") {
      const allCategories: CategoryDocument[] = categories.map((category: any) => ({
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        group: category.group,
        type: category.type,
        description: category.description,
        imageUrl: category.imageUrl,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));

      return NextResponse.json({
        success: true,
        data: allCategories,
      });
    }    // Default: Group categories by their group field
    const groupedCategories: GroupedCategories = categories.reduce((acc: GroupedCategories, category: any) => {
      const group = category.group;
      if (!acc[group]) {
        acc[group] = [];
      }      acc[group].push({
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        type: category.type,
      });
      return acc;
    }, {} as GroupedCategories);

    return NextResponse.json({
      success: true,
      data: groupedCategories,
    });  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<CategoryDocument>>> {
  try {
    await dbConnect();

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const group = formData.get('group') as string;
    const type = formData.get('type') as string;

    // Validate input
    if (!group || !type) {
      return NextResponse.json(
        { success: false, error: "Group and type are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug exists and make it unique
    let slug = baseSlug;
    let counter = 1;
    while (await Category.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const category = new Category({
      name,
      slug,
      group,
      type,
    });

    await category.save();

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create category error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Category name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// route for updating a category 

export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse<CategoryDocument>>> {
  try {
    await dbConnect();    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const group = formData.get('group') as string;
    const type = formData.get('type') as string;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    if (!name || !group || !type) {
      return NextResponse.json(
        { success: false, error: "Name, group, and type are required" },
        { status: 400 }
      );
    }

    // Find existing category
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }      );
    }

    // Generate new slug if name changed
    let slug = existingCategory.slug;
    if (name !== existingCategory.name) {
      const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check if slug exists and make it unique (excluding current category)
      slug = baseSlug;
      let counter = 1;
      while (await Category.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        group,
        type,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, error: "Failed to update category" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error: any) {
    console.error("Update category error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Category name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse<null>>> {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the category
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
