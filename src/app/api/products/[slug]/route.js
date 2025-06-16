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
import { logDatabaseQueryTime } from '@/lib/performance';

export async function GET(request, { params }) {
  const startTime = Date.now();
  
  try {
    const { slug } = await params;

    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }
    
    const queryStartTime = Date.now();
    
    // Optimize query with specific field selection and leaner populate
    const product = await Product.findOne({ 
      slug, 
      isAvailable: true 
    })
    .populate('categories', 'name slug') // Only select needed fields
    .select('-__v -updatedAt') // Exclude unnecessary fields
    .lean(); // Use lean() for better performance

    logDatabaseQueryTime('Product.findOne by slug', queryStartTime);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const formattedProduct = formatProductResponse(product);
    
    const totalTime = Date.now() - startTime;
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Product API response time: ${totalTime}ms`);
    }

    return NextResponse.json({
      success: true,
      data: formattedProduct
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
      }
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
    const body = await request.json();    const {
      name,
      description,
      shortDescription,
      price,
      discountedPrice,
      imageUrls,
      categories,
      tags,
      weightOptions,
      isBestseller,
      isFeatured,
      stockQuantity,
      preparationTime,
      ingredients,
      allergens,
      nutritionalInfo,
    } = body;

    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

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
        imageUrls: validatedImageUrls,        categories,
        tags: tags || [],
        weightOptions: validatedWeightOptions,
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

    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

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
