import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category.models";
import Product from "@/models/Product.models";

export async function GET(request) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    // Get all categories
    const categories = await Category.find({}).lean();
    console.log("📂 All categories:", categories.map(c => ({ name: c.name, slug: c.slug, id: c._id })));

    // Get all products with their categories
    const products = await Product.find({})
      .populate("categories", "name slug")
      .lean();

    console.log("📦 All products with categories:");
    products.forEach(product => {
      console.log(`- ${product.name}: ${product.categories.map(c => c.name).join(', ')}`);
    });

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map(c => ({ name: c.name, slug: c.slug, id: c._id })),
        products: products.map(p => ({
          name: p.name,
          slug: p.slug,
          categories: p.categories.map(c => ({ name: c.name, slug: c.slug }))
        }))
      }
    });
  } catch (error) {
    console.error("Debug categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug data" },
      { status: 500 }
    );
  }
}
