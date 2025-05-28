import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';
import { formatProductResponse } from '@/lib/productUtils';

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

    await dbConnect();

    // Create search filter using text search and regex for flexibility
    const searchFilter = {
      isAvailable: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { shortDescription: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    // Get pagination parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 12, 50);
    const skip = (page - 1) * limit;

    // Get sorting parameters
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    // Execute search query
    const [products, total] = await Promise.all([
      Product.find(searchFilter)
        .populate('categories', 'name slug group type')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(searchFilter)
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
