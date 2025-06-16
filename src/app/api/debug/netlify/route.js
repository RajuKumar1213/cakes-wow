import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';
import Category from '@/models/Category.models';

export async function GET(request) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }
    
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || 'gourment-cakes';
    
    // Find the category
    const category = await Category.findOne({ slug: categorySlug });
    
    if (!category) {
      return NextResponse.json({
        success: false,
        error: `Category '${categorySlug}' not found`,
        environment: process.env.NODE_ENV,
        availableCategories: await Category.find({}, 'name slug').limit(20).lean()
      });
    }
    
    // Test different filtering approaches
    const results = {
      environment: process.env.NODE_ENV,
      categoryInfo: {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug
      },
      tests: {}
    };
    
    // Test 1: Direct MongoDB query
    const mongoProducts = await Product.find({ 
      categories: category._id 
    }).populate('categories', 'name slug').lean();
    
    results.tests.mongoDirectQuery = {
      count: mongoProducts.length,
      products: mongoProducts.map(p => ({
        _id: p._id.toString(),
        name: p.name,
        categories: p.categories.map(c => ({ name: c.name, slug: c.slug }))
      }))
    };
    
    // Test 2: API simulation
    const allProducts = await Product.find().populate('categories', 'name slug').lean();
    const filteredProducts = allProducts.filter(product => 
      product.categories.some(cat => cat._id.toString() === category._id.toString())
    );
    
    results.tests.jsFiltering = {
      totalProducts: allProducts.length,
      filteredCount: filteredProducts.length,
      products: filteredProducts.map(p => ({
        _id: p._id.toString(),
        name: p.name,
        categories: p.categories.map(c => ({ name: c.name, slug: c.slug }))
      }))
    };
    
    // Test 3: Check if there are any products without categories
    const productsWithoutCategories = allProducts.filter(p => !p.categories || p.categories.length === 0);
    results.tests.productsWithoutCategories = {
      count: productsWithoutCategories.length,
      products: productsWithoutCategories.map(p => ({ _id: p._id.toString(), name: p.name }))
    };
    
    // Test 4: All categories and their product counts
    const allCategories = await Category.find().lean();
    const categoryCounts = {};
    for (const cat of allCategories) {
      const count = await Product.countDocuments({ categories: cat._id });
      categoryCounts[cat.slug] = {
        name: cat.name,
        count: count
      };
    }
    results.tests.categoryProductCounts = categoryCounts;
    
    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Netlify debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        environment: process.env.NODE_ENV,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
