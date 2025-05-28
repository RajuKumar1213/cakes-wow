import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';
import Category from '@/models/Category.models';
import { 
  createProductFilters, 
  createSortOptions, 
  calculatePagination,
  formatProductResponse,
  validatePrice,
  validateImageUrls,
  validateWeightOptions
} from '@/lib/productUtils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const category = searchParams.get('category');
    const tags = searchParams.getAll('tags');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isEggless = searchParams.get('isEggless');
    const isBestseller = searchParams.get('isBestseller');
    const isFeatured = searchParams.get('isFeatured');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 12;

    await dbConnect();    // Build filters
    const filters = createProductFilters({
      category,
      tags,
      minPrice,
      maxPrice,
      isEggless,
      isBestseller,
      isFeatured,
      search,
    });

    // Handle category filter by slug
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filters.categories = categoryDoc._id;
      } else {
        // Category not found, return empty results
        return NextResponse.json({
          success: true,
          data: {
            products: [],
            pagination: {
              page: 1,
              limit: parseInt(limit),
              total: 0,
              pages: 0,
            },
            filters: { category }
          },
        });
      }
    }

    // Calculate pagination
    const { page: pageNum, limit: limitNum, skip } = calculatePagination(page, limit);

    // Create sort options
    const sort = createSortOptions(sortBy, sortOrder);

    // Get total count for pagination
    const total = await Product.countDocuments(filters);

    // Fetch products
    const products = await Product.find(filters)
      .populate('categories', 'name slug group type')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Format products for response
    const formattedProducts = products.map(product => ({
      ...product,
      discountPercentage: product.discountedPrice && product.price > product.discountedPrice
        ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
        : 0,
      finalPrice: product.discountedPrice || product.price,
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        filters: {
          category,
          tags,
          minPrice,
          maxPrice,
          isEggless,
          isBestseller,
          isFeatured,
          search,
          sortBy,
          sortOrder,
        },
      },
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
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

    // Validate required fields
    if (!name || !description || !price || !imageUrls || !categories) {
      return NextResponse.json(
        { error: 'Name, description, price, imageUrls, and categories are required' },
        { status: 400 }
      );
    }

    await dbConnect();

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

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Validate weight options
    const validatedWeightOptions = validateWeightOptions(weightOptions);

    // Create product
    const product = new Product({
      name,
      slug,
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
    });

    await product.save();

    // Populate categories for response
    await product.populate('categories', 'name slug group type');

    return NextResponse.json({
      success: true,
      data: formatProductResponse(product),
    }, { status: 201 });

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
