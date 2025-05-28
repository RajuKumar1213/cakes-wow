import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product.models';
import Category from '@/models/Category.models';

export async function GET() {
  try {
    await dbConnect();
    
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    
    const products = await Product.find().limit(2).lean();
    const categories = await Category.find().limit(2).lean();

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          products: productCount,
          categories: categoryCount
        },
        samples: {
          products,
          categories
        }
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
