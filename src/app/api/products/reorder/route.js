import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product.models";

// PUT - Update product order within a category
export async function PUT(request) {
  try {
    const { productId, categoryId, newOrder } = await request.json();

    if (!productId || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Product ID and Category ID are required" },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Update category-specific order
    const existingOrderIndex = product.categoryOrders.findIndex(
      order => order.category.toString() === categoryId
    );

    if (existingOrderIndex !== -1) {
      // Update existing order
      product.categoryOrders[existingOrderIndex].displayOrder = newOrder;
    } else {
      // Add new category order
      product.categoryOrders.push({
        category: categoryId,
        displayOrder: newOrder
      });
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Product order updated successfully",
      data: product
    });

  } catch (error) {
    console.error("Error updating product order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product order" },
      { status: 500 }
    );
  }
}

// POST - Bulk reorder products within a category
export async function POST(request) {
  try {
    const { categoryId, productOrders } = await request.json();

    console.log('🔄 Bulk reorder request:', { categoryId, productOrdersCount: productOrders?.length });

    if (!categoryId || !Array.isArray(productOrders)) {
      return NextResponse.json(
        { success: false, error: "Category ID and product orders array are required" },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    // Process each product individually for better control and error handling
    const updatePromises = productOrders.map(async ({ productId, displayOrder }) => {
      console.log(`📦 Updating product ${productId} to order ${displayOrder}`);
      
      const product = await Product.findById(productId);
      if (!product) {
        console.warn(`⚠️ Product not found: ${productId}`);
        return null;
      }

      // Find existing category order
      const existingOrderIndex = product.categoryOrders.findIndex(
        order => order.category.toString() === categoryId
      );

      if (existingOrderIndex !== -1) {
        // Update existing order
        product.categoryOrders[existingOrderIndex].displayOrder = displayOrder;
        console.log(`✅ Updated existing order for product ${productId}: ${displayOrder}`);
      } else {
        // Add new category order
        product.categoryOrders.push({
          category: categoryId,
          displayOrder: displayOrder
        });
        console.log(`✅ Added new order for product ${productId}: ${displayOrder}`);
      }

      await product.save();
      return productId;
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r !== null).length;
    
    console.log(`✅ Reorder completed: ${successCount}/${productOrders.length} products updated`);

    return NextResponse.json({
      success: true,
      message: `${successCount} products reordered successfully`,
      updatedCount: successCount
    });

  } catch (error) {
    console.error("Error bulk reordering products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder products" },
      { status: 500 }
    );
  }
}
