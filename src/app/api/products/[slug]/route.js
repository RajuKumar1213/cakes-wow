import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';
import Category from '@/models/Category.models';
import { 
  formatProductResponse, 
  validatePrice, 
  validateImageUrls, 
  validateWeightOptions 
} from '@/lib/productUtils';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    await dbConnect();

    const product = await Product.findOne({ 
      slug, 
      isAvailable: true 
    })
    .populate('categories', 'name slug group type')
    .lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const formattedProduct = formatProductResponse(product);

    return NextResponse.json({
      success: true,
      data: formattedProduct
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const {
      name,
      description,
      shortDescription,
      price,
      discountedPrice,
      imageUrls,
      categories,
      tags,
      weightOptions,
      isEggless,
      isBestseller,
      isFeatured,
      stockQuantity,
      preparationTime,
      ingredients,
      allergens,
      nutritionalInfo,
    } = body;

    await dbConnect();

    // Find existing product by slug or ID
    const existingProduct = await Product.findOne({ 
      $or: [{ slug }, { _id: slug }] 
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!name || !description || !price || !imageUrls || !categories) {
      return NextResponse.json(
        { error: 'Name, description, price, imageUrls, and categories are required' },
        { status: 400 }
      );
    }

    // Validate price
    const validatedPrice = validatePrice(price);
    const validatedDiscountedPrice = discountedPrice ? validatePrice(discountedPrice) : null;

    // Validate discount price
    if (validatedDiscountedPrice && validatedDiscountedPrice >= validatedPrice) {
      return NextResponse.json(
        { error: 'Discounted price must be less than regular price' },
        { status: 400 }
      );
    }

    // Validate image URLs
    const validatedImageUrls = validateImageUrls(imageUrls);

    // Validate categories exist
    const categoryDocs = await Category.find({ _id: { $in: categories } });
    if (categoryDocs.length !== categories.length) {
      return NextResponse.json(
        { error: 'One or more categories not found' },
        { status: 400 }
      );
    }

    // Generate new slug if name changed
    let newSlug = existingProduct.slug;
    if (name !== existingProduct.name) {
      const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      newSlug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug: newSlug, _id: { $ne: existingProduct._id } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Validate weight options
    const validatedWeightOptions = validateWeightOptions(weightOptions);

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      existingProduct._id,
      {
        name,
        slug: newSlug,
        description,
        shortDescription: shortDescription || '',
        price: validatedPrice,
        discountedPrice: validatedDiscountedPrice,
        imageUrls: validatedImageUrls,
        categories,
        tags: tags || [],
        weightOptions: validatedWeightOptions,
        isEggless: Boolean(isEggless),
        isBestseller: Boolean(isBestseller),
        isFeatured: Boolean(isFeatured),
        stockQuantity: stockQuantity || 100,
        preparationTime: preparationTime || '4-6 hours',
        ingredients: ingredients || [],
        allergens: allergens || [],
        nutritionalInfo: nutritionalInfo || {},
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('categories', 'name slug group type');

    return NextResponse.json({
      success: true,
      data: formatProductResponse(updatedProduct),
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { slug } = await params;

    await dbConnect();

    // Find and delete product by slug or ID
    const deletedProduct = await Product.findOneAndDelete({ 
      $or: [{ slug }, { _id: slug }] 
    });

    if (!deletedProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      data: { _id: deletedProduct._id, slug: deletedProduct.slug }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
