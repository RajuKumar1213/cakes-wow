import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';
import { formatProductResponse, createProductFilters } from '@/lib/productUtils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Redirect to unified search suggestions API for consistency
    // This maintains backward compatibility while using the unified search logic
    const url = new URL(request.url);
    const suggestionUrl = url.origin + '/api/search/suggestions?' + searchParams.toString();
    
    try {
      const response = await fetch(suggestionUrl);
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error redirecting to suggestions API:', error);
      // Fallback to original logic if redirect fails
    }const conn = await dbConnect();
    
    // Skip during build time or connection issues
    if (conn.isConnectSkipped || conn.error) {
      return NextResponse.json({
        success: true,
        data: { products: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } },
        search: { query, resultsCount: 0 },
        message: conn.isConnectSkipped ? 'Build phase' : 'Database unavailable'
      });
    }

    // Create base search filter using text search and regex for flexibility
    const baseSearchFilter = {
      isAvailable: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { shortDescription: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };    // Get filtering parameters
    const filterParams = {
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      weights: searchParams.getAll('weights'),
      tags: searchParams.getAll('tags'),
      isBestseller: searchParams.get('isBestseller'),
      isFeatured: searchParams.get('isFeatured')
    };
    
    console.log('Search API - Filter params:', filterParams);
    
    const filters = createProductFilters(filterParams);
    
    console.log('Search API - Created filters:', filters);
    
    // Combine search filter with other filters
    const combinedFilters = {
      ...baseSearchFilter,
      ...filters
    };
    
    console.log('Search API - Combined filters:', JSON.stringify(combinedFilters, null, 2));

    // Get pagination parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 12, 50);
    const skip = (page - 1) * limit;    // Get sorting parameters - default to same as suggestions API
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');
    
    let sortOptions;
    if (sortBy) {
      sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    } else {
      // Default sorting to match suggestions API
      sortOptions = { isBestseller: -1, isFeatured: -1, createdAt: -1 };
    }// Execute search query with filters
    const [products, total] = await Promise.all([
      Product.find(combinedFilters)
        .populate('categories', 'name slug group type')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(combinedFilters)
    ]);

    // Format response
    const formattedProducts = products.map(formatProductResponse);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
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
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
