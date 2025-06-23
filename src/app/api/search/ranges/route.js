import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }    const conn = await dbConnect();
    
    // Skip during build time or connection issues
    if (conn.isConnectSkipped || conn.error) {
      return NextResponse.json({
        success: true,
        data: { weights: [], tags: [], priceRange: { min: 0, max: 5000 } },
        message: conn.isConnectSkipped ? 'Build phase' : 'Database unavailable'
      });
    }

    // Create base search filter
    const baseSearchFilter = {
      isAvailable: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { shortDescription: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    // Get all products matching search to extract filter options
    const products = await Product.find(baseSearchFilter)
      .select('price discountedPrice weightOptions tags')
      .lean();

    // Extract unique weights
    const weights = new Set();
    products.forEach(product => {
      if (product.weightOptions && Array.isArray(product.weightOptions)) {
        product.weightOptions.forEach(option => {
          if (option.weight) {
            weights.add(option.weight);
          }
        });
      }
    });

    // Extract unique tags
    const tags = new Set();
    products.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => {
          if (tag && tag.trim()) {
            tags.add(tag.trim());
          }
        });
      }
    });

    // Calculate price range
    let minPrice = 0;
    let maxPrice = 5000;
    
    if (products.length > 0) {
      const prices = products.map(product => {
        const price = product.discountedPrice || product.price;
        return typeof price === 'number' ? price : 0;
      }).filter(price => price > 0);
      
      if (prices.length > 0) {
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
        
        // Round to nearest 100
        minPrice = Math.floor(minPrice / 100) * 100;
        maxPrice = Math.ceil(maxPrice / 100) * 100;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        weights: Array.from(weights).sort((a, b) => {
          // Sort weights numerically if possible
          const aNum = parseFloat(a);
          const bNum = parseFloat(b);
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          return a.localeCompare(b);
        }),
        tags: Array.from(tags).sort(),
        priceRange: {
          min: minPrice,
          max: maxPrice
        }
      }
    });

  } catch (error) {
    console.error('Search ranges API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
