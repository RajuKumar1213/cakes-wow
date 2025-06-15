import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';
import Category from '@/models/Category.models';

export async function GET() {
  try {
    await dbConnect();
      // Find gourmet category (note: it's "gourment-cakes" with typo in database)
    const gourmetCategory = await Category.findOne({ slug: 'gourment-cakes' });
    console.log('🔍 Gourmet Category:', gourmetCategory);
    
    if (!gourmetCategory) {
      return NextResponse.json({
        success: false,
        error: 'Gourmet category not found'
      });
    }
    
    // Find all products
    const allProducts = await Product.find().populate('categories', 'name slug').lean();
    console.log('📦 Total Products:', allProducts.length);
    
    // Find products that should belong to gourmet category
    const gourmetProducts = await Product.find({ 
      categories: gourmetCategory._id 
    }).populate('categories', 'name slug').lean();
    
    console.log('🍰 Gourmet Products:', gourmetProducts.length);
    
    // Find all products with their categories for debugging
    const productsWithCategories = allProducts.map(product => ({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      categories: product.categories.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        _id: cat._id
      }))
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        gourmetCategory: {
          _id: gourmetCategory._id,
          name: gourmetCategory.name,
          slug: gourmetCategory.slug
        },
        gourmetProductsCount: gourmetProducts.length,
        gourmetProducts: gourmetProducts.map(p => ({
          _id: p._id,
          name: p.name,
          slug: p.slug,
          categories: p.categories
        })),
        allProductsCount: allProducts.length,
        allProductsWithCategories: productsWithCategories
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
