import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product.models";
import Category from "@/models/Category.models";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    await dbConnect();

    // Build base filter for available products
    const filters = { isAvailable: true };
    
    // Add category filter if provided
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filters.categories = categoryDoc._id;
      }
    }    // Get price range - consider both base prices and weight option prices
    const priceStats = await Product.aggregate([
      { $match: filters },
      {
        $addFields: {
          allPrices: {
            $concatArrays: [
              { $cond: [{ $gt: ["$price", 0] }, ["$price"], []] },
              "$weightOptions.price"
            ]
          }
        }
      },
      { $unwind: "$allPrices" },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$allPrices" },
          maxPrice: { $max: "$allPrices" }
        }
      }
    ]);

    // Get weight options and tags
    const weightStats = await Product.aggregate([
      { $match: filters },
      { $unwind: "$weightOptions" },
      {
        $group: {
          _id: "$weightOptions.weight",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get available tags
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
    ]);    // Default ranges if no products found
    const defaultPriceRange = { minPrice: 0, maxPrice: 5000 };
    const priceRange = priceStats.length > 0 ? priceStats[0] : defaultPriceRange;

    // Format weight options
    const weightOptions = weightStats.map(w => w._id).sort();
    
    // Format tags
    const tags = tagStats.map(t => t._id).sort();

    return NextResponse.json({
      success: true,
      data: {
        priceRange: {
          min: Math.floor(priceRange.minPrice),
          max: Math.ceil(priceRange.maxPrice)
        },
        weights: weightOptions,
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
