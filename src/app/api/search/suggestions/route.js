import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';
import { formatProductResponse } from '@/lib/productUtils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: { products: [] }
      });
    }    const conn = await dbConnect();
    
    // Skip during build time or connection issues
    if (conn.isConnectSkipped || conn.error) {
      return NextResponse.json({
        success: true,
        data: { products: [] },
        message: conn.isConnectSkipped ? 'Build phase' : 'Database unavailable'
      });
    }// Create search filter for live suggestions (unified with main search)
    const searchFilter = {
      isAvailable: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { shortDescription: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };    // Get pagination parameters (for search page compatibility)
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 6, 50);
    const skip = (page - 1) * limit;

    // Get limited results for suggestions (max 6 for header, more for search page)
    const products = await Product.find(searchFilter)
      .populate('categories', 'name slug')
      .select('name shortDescription imageUrls price discountedPrice slug categories tags weightOptions rating reviewCount')
      .sort({ isBestseller: -1, isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(searchFilter);    // Format the products for the suggestion dropdown
    const formattedProducts = products.map(product => {
      // Get the first image URL or use fallback
      const imageUrl = (product.imageUrls && product.imageUrls.length > 0) 
        ? product.imageUrls[0] 
        : '/images/chocolate.webp';
      
      // Get the first weight option price, or fallback to base price
      const firstWeightOption = product.weightOptions && product.weightOptions.length > 0 
        ? product.weightOptions[0] 
        : null;
      
      const displayPrice = firstWeightOption 
        ? (firstWeightOption.discountedPrice || firstWeightOption.price)
        : (product.discountedPrice || product.price);
      
      const originalPrice = firstWeightOption 
        ? firstWeightOption.price
        : product.price;
      
      return {
        _id: product._id,
        name: product.name,
        shortDescription: product.shortDescription,
        imageUrl: imageUrl,
        price: originalPrice,
        discountPrice: displayPrice !== originalPrice ? displayPrice : undefined,
        slug: product.slug,
        category: product.categories?.[0]?.name || 'Cakes',
        categorySlug: product.categories?.[0]?.slug || 'cakes',
        weightOptions: product.weightOptions || [],
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        firstWeightOption: firstWeightOption,
        // Add fields for search page compatibility
        imageUrls: product.imageUrls || [imageUrl],
        discountedPrice: displayPrice !== originalPrice ? displayPrice : undefined,
        isBestseller: product.isBestseller || false,
        categories: product.categories || [],
        tags: product.tags || []
      };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        query: query,
        total: formattedProducts.length,
        // Add pagination info for search page compatibility
        pagination: {
          page,
          limit,
          total,
          pages: totalPages
        },
        search: {
          query,
          resultsCount: total
        }
      }
    });

  } catch (error) {
    console.error('Search suggestions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
