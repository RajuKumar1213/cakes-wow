import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';
import { createProductFilters } from '@/lib/productUtils';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Test different queries
    const allProducts = await Product.find({}).lean();
    const availableProducts = await Product.find({ isAvailable: true }).lean();
    
    // Test the filters function
    const filters = createProductFilters({});
    const filteredProducts = await Product.find(filters).lean();
    
    return NextResponse.json({
      success: true,
      data: {
        allProductsCount: allProducts.length,
        availableProductsCount: availableProducts.length,
        filteredProductsCount: filteredProducts.length,
        appliedFilters: filters,
        sampleProduct: allProducts[0] || null,
        sampleAvailableProduct: availableProducts[0] || null
      }
    });
    
  } catch (error) {
    console.error('Debug products error:', error);
    return NextResponse.json(
      { error: 'Failed to debug products', details: error.message },
      { status: 500 }
    );
  }
}
