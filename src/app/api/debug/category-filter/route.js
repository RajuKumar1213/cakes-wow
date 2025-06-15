import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';
import Category from '@/models/Category.models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || 'gourment-cakes';
    
    await dbConnect();
    
    console.log('🔍 Debug - Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'Present' : 'Missing',
      categorySlug
    });
    
    // Find the category
    const category = await Category.findOne({ slug: categorySlug });
    console.log('📂 Category found:', category ? category.name : 'NOT FOUND');
    
    if (!category) {
      return NextResponse.json({
        success: false,
        error: `Category '${categorySlug}' not found`,
        debug: {
          categorySlug,
          allCategories: await Category.find({}, 'name slug').lean()
        }
      });
    }
    
    // Find products in two ways for comparison
    const productsDirectFilter = await Product.find({ 
      categories: category._id 
    }).populate('categories', 'name slug').lean();
    
    const allProducts = await Product.find().populate('categories', 'name slug').lean();
    const productsWithThisCategory = allProducts.filter(product => 
      product.categories.some(cat => cat._id.toString() === category._id.toString())
    );
    
    // Simulate the API filtering logic
    const filters = { isAvailable: true };
    if (category._id) {
      filters.categories = category._id;
    }
    
    const apiSimulatedProducts = await Product.find(filters)
      .populate('categories', 'name slug')
      .sort({ rating: -1 })
      .limit(24)
      .lean();
    
    return NextResponse.json({
      success: true,
      debug: {
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          isProduction: process.env.NODE_ENV === 'production'
        },
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug
        },
        results: {
          directFilterCount: productsDirectFilter.length,
          jsFilterCount: productsWithThisCategory.length,
          apiSimulatedCount: apiSimulatedProducts.length,
          totalProducts: allProducts.length
        },
        directFilterProducts: productsDirectFilter.map(p => ({
          _id: p._id,
          name: p.name,
          categories: p.categories
        })),
        apiSimulatedProducts: apiSimulatedProducts.map(p => ({
          _id: p._id,
          name: p.name,
          categories: p.categories
        })),
        allProductsCategoryInfo: allProducts.map(p => ({
          _id: p._id,
          name: p.name,
          categoriesCount: p.categories.length,
          categories: p.categories.map(c => ({ name: c.name, slug: c.slug }))
        }))
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
