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
    
    // Check if the parameter is an ObjectId (24 hex characters) or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    
    let product;
    if (isObjectId) {
      // Find by ID (for admin operations)
      product = await Product.findById(slug)
        .populate('categories', 'name slug')
        .lean();
    } else {
      // Find by slug (for frontend)
      product = await Product.findOne({ 
        slug, 
        isAvailable: true 
      })
      .populate('categories', 'name slug') // Only select needed fields
      .select('-__v -updatedAt') // Exclude unnecessary fields
      .lean(); // Use lean() for better performance
    }

    logDatabaseQueryTime('Product.findOne by slug/id', queryStartTime);

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
    const contentType = request.headers.get('content-type');
    
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    // Check if the parameter is an ObjectId or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    
    // Find existing product by slug or ID
    let existingProduct;
    if (isObjectId) {
      existingProduct = await Product.findById(slug);
    } else {
      existingProduct = await Product.findOne({ slug });
    }

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    let updateData = {};

    // Handle different content types
    if (contentType && contentType.includes('multipart/form-data')) {      // Handle FormData (from admin panel)
      const formData = await request.formData();
      
      console.log('📦 FormData received:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      // Only update fields that are explicitly provided
      const name = formData.get("name");
      const description = formData.get("description");
      const price = formData.get("price");
      const discountedPrice = formData.get("discountedPrice");
      const isAvailable = formData.get("isAvailable");
      const isBestseller = formData.get("isBestseller");
      const isFeatured = formData.get("isFeatured");
      const preparationTime = formData.get("preparationTime");
      const bestsellerOrder = formData.get("bestsellerOrder");

      // Build update object - only include fields that were explicitly sent
      if (name !== null && name !== undefined) updateData.name = name;
      if (description !== null && description !== undefined) updateData.description = description;
      if (price !== null && price !== undefined) updateData.price = parseFloat(price);
      if (discountedPrice !== null && discountedPrice !== undefined) updateData.discountedPrice = parseFloat(discountedPrice);
      if (preparationTime !== null && preparationTime !== undefined) updateData.preparationTime = preparationTime;
      
      // Boolean fields - only update if explicitly provided
      if (isAvailable !== null && isAvailable !== undefined) {
        updateData.isAvailable = isAvailable === "true";
      }
      if (isBestseller !== null && isBestseller !== undefined) {
        updateData.isBestseller = isBestseller === "true";
      }
      if (isFeatured !== null && isFeatured !== undefined) {
        updateData.isFeatured = isFeatured === "true";
      }
        // Add bestsellerOrder only if provided
      if (bestsellerOrder !== null && bestsellerOrder !== undefined) {
        updateData.bestsellerOrder = parseInt(bestsellerOrder);
      }
      
      console.log('🔧 Update data prepared:', updateData);

      // Handle categories
      const categoriesData = formData.get("categories");
      if (categoriesData) {
        try {
          const categories = JSON.parse(categoriesData);
          if (Array.isArray(categories)) {
            updateData.categories = categories;
          }
        } catch (error) {
          console.error("Failed to parse categories:", error);
        }
      }

      // Handle weight options
      const weightOptionsData = formData.get("weightOptions");
      if (weightOptionsData) {
        try {
          const weightOptions = JSON.parse(weightOptionsData);
          if (Array.isArray(weightOptions)) {
            updateData.weightOptions = weightOptions;
          }
        } catch (error) {
          console.error("Failed to parse weight options:", error);
        }
      }
    } else {
      // Handle JSON data
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
      const Category = require('@/models/Category.models').default;
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

      updateData = {
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
        isBestseller: Boolean(isBestseller),
        isFeatured: Boolean(isFeatured),
        stockQuantity: stockQuantity || 100,
        preparationTime: preparationTime || '4-6 hours',
        ingredients: ingredients || [],
        allergens: allergens || [],
        nutritionalInfo: nutritionalInfo || {},
        updatedAt: new Date(),
      };
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      existingProduct._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categories', 'name slug');

    console.log("✅ Product updated successfully:", updatedProduct.name);

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully"
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Product slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
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

    // Check if the parameter is an ObjectId or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    
    let deletedProduct;
    if (isObjectId) {
      deletedProduct = await Product.findByIdAndDelete(slug);
    } else {
      deletedProduct = await Product.findOneAndDelete({ slug });
    }

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log("✅ Product deleted successfully:", deletedProduct.name);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      data: { _id: deletedProduct._id, slug: deletedProduct.slug }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
