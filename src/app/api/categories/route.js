import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category.models';

export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find({ isActive: true })
      .sort({ group: 1, sortOrder: 1, name: 1 })
      .lean();

    // Group categories by their group field
    const groupedCategories = categories.reduce((acc, category) => {
      const group = category.group;
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push({
        id: category._id,
        name: category.name,
        slug: category.slug,
        type: category.type,
        description: category.description,
        imageUrl: category.imageUrl,
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: groupedCategories,
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, group, type, description, imageUrl } = await request.json();

    // Validate input
    if (!name || !group || !type) {
      return NextResponse.json(
        { error: 'Name, group, and type are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

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
      description: description || '',
      imageUrl: imageUrl || '',
    });

    await category.save();

    return NextResponse.json({
      success: true,
      data: category,
    }, { status: 201 });

  } catch (error) {
    console.error('Create category error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
