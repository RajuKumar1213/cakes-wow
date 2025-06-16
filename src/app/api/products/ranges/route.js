import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product.models";
import Category from "@/models/Category.models";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    // Build base filter for available products
    const filters = { isAvailable: true };
    
    // Add category filter if provided
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filters.categories = categoryDoc._id;
      }
    }    // Get price range - only consider the minimum price for each product
    const priceStats = await Product.aggregate([
      { $match: filters },
      {
        $addFields: {
          // Get the minimum price from either base price or weightOptions
          minProductPrice: {
            $min: {
              $concatArrays: [
                { $cond: [{ $gt: ["$price", 0] }, ["$price"], []] },
                "$weightOptions.price"
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$minProductPrice" },
          maxPrice: { $max: "$minProductPrice" }
        }
      }
    ]);    // Hardcoded standard weight options - simple and clean
    const standardWeights = ['500g', '750g', '1kg', '1.5kg', '2kg', '3kg', '4kg', '5kg'];    // Get available tags
    const tagStats = await Product.aggregate([
      { $match: filters },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Default ranges if no products found
    const defaultPriceRange = { minPrice: 0, maxPrice: 5000 };
    const priceRange = priceStats.length > 0 ? priceStats[0] : defaultPriceRange;

    // Format tags
    const tags = tagStats.map(t => t._id).sort();

    return NextResponse.json({
      success: true,
      data: {
        priceRange: {
          min: Math.floor(priceRange.minPrice),
          max: Math.ceil(priceRange.maxPrice)
        },
        weights: standardWeights, // Use hardcoded clean weights
        tags: tags
      }
    });
  } catch (error) {
    console.error("Get product ranges error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product ranges" },
      { status: 500 }
    );
  }
}
