import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';
import { formatProductResponse } from '@/lib/productUtils';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    await dbConnect();

    const product = await Product.findOne({ 
      slug, 
      isAvailable: true 
    })
    .populate('categories', 'name slug group type')
    .lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const formattedProduct = formatProductResponse(product);

    return NextResponse.json({
      success: true,
      data: formattedProduct
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
