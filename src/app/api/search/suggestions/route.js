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
    }

    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        data: { products: [] }
      });
    }

    // Create search filter for live suggestions
    const searchFilter = {
      isAvailable: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { shortDescription: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };    // Get limited results for suggestions (max 6 items)
    const products = await Product.find(searchFilter)
      .populate('categories', 'name slug')
      .select('name shortDescription imageUrls price discountedPrice slug categories tags weightOptions rating reviewCount')
      .sort({ isBestseller: -1, isFeatured: -1, createdAt: -1 })
      .limit(6)
      .lean();    // Format the products for the suggestion dropdown
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
        firstWeightOption: firstWeightOption
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        query: query,
        total: formattedProducts.length
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
