import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product.models";
import Category from "@/models/Category.models";
import {  uploadBufferToCloudinary } from "@/helpers/uploadOnCloudinary";
import path from "path";
import {
  createSortOptions,
  calculatePagination,
  formatProductResponse,
  validatePrice,
  validateWeightOptions,
} from "@/lib/productUtils";
import { createEnhancedProductFilters } from "@/lib/enhancedProductUtils";

// Check if Cloudinary environment variables are configured
function checkCloudinaryConfig() {
  const missingVars = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missingVars.push('CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) missingVars.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missingVars.push('CLOUDINARY_API_SECRET');
  
  if (missingVars.length > 0) {
    console.error('Missing Cloudinary environment variables:', missingVars);
    return {
      error: `Cloudinary configuration incomplete. Missing: ${missingVars.join(', ')}. Please check your Vercel environment variables.`,
      missingVars
    };
  }
  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const category = searchParams.get("category");
    const weights = searchParams.getAll("weights");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isBestseller = searchParams.get("isBestseller");
    const isFeatured = searchParams.get("isFeatured");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 12;

    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    // Handle category filter by slug first (before building filters)
    let categoryObjectId = null;
    if (category) {
      console.log("🔍 Looking for category with slug:", category);
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        categoryObjectId = categoryDoc._id;
        console.log("✅ Found category:", categoryDoc.name, "with ID:", categoryObjectId);
      } else {
        console.log("❌ Category not found for slug:", category);
        return NextResponse.json({
          success: true,
          data: {
            products: [],
            pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 },
            filters: { category },
          },
        });
      }
    }    // Build filters using enhanced filtering
    const filters = createEnhancedProductFilters({
      category: categoryObjectId,
      weights,
      minPrice,
      maxPrice,
      isBestseller,
      isFeatured,
      search,
    });

    // Calculate pagination
    const { page: pageNum, limit: limitNum, skip } = calculatePagination(page, limit);    // Create sort options
    const sort = createSortOptions(sortBy, sortOrder, categoryObjectId);
    
    console.log('🔍 API Sorting Debug:', {
      sortBy,
      sortOrder,
      categoryObjectId: categoryObjectId?.toString(),
      sortOptions: sort
    });

    // Handle aggregation for price filtering or category-specific ordering
    let products, total;
    
    if (filters._useAggregation || sort._categorySpecificOrder) {
      // Use aggregation pipeline for price filtering or category-specific ordering
      const aggregationSteps = filters._aggregationSteps || [];
      delete filters._useAggregation;
      delete filters._aggregationSteps;
      
      let pipeline = [
        ...aggregationSteps,
        { $match: filters }
      ];      // Handle category-specific ordering
      if (sort._categorySpecificOrder) {
        pipeline.push(
          // Add a field for category-specific order
          {
            $addFields: {
              categoryDisplayOrder: {
                $let: {
                  vars: {
                    categoryOrder: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$categoryOrders",
                            cond: { $eq: ["$$this.category", categoryObjectId] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: {
                    $ifNull: ["$$categoryOrder.displayOrder", 999999] // Put unordered items at end
                  }
                }
              }
            }
          },
          // Sort by category-specific order, then by creation date
          {
            $sort: {
              categoryDisplayOrder: sort.direction,
              createdAt: -1
            }
          }
        );
      } else {
        pipeline.push({ $sort: sort });
      }
      
      pipeline.push(
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: 'categories',
            localField: 'categories',
            foreignField: '_id',
            as: 'categories'
          }
        }
      );
      
      // Get total count
      const countPipeline = [
        ...aggregationSteps,
        { $match: filters },
        { $count: "total" }
      ];
      
      const [productsResult, countResult] = await Promise.all([
        Product.aggregate(pipeline),
        Product.aggregate(countPipeline)
      ]);
      
      products = productsResult;
      total = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      // Use regular find for other filters
      total = await Product.countDocuments(filters);
      products = await Product.find(filters)
        .populate("categories", "name slug group type")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();
    }    // Format products for response
    const formattedProducts = products.map((product) => ({
      ...product,
      discountPercentage:
        product.discountedPrice && product.price > product.discountedPrice
          ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
          : 0,
      finalPrice: product.discountedPrice || product.price,
    }));

    // Debug: Log the order of products when sorting by displayOrder
    if (sortBy === 'displayOrder' && categoryObjectId) {
      console.log('📋 Products Order Debug:');
      formattedProducts.forEach((product, index) => {
        const categoryOrder = product.categoryOrders?.find(order => 
          order.category?.toString() === categoryObjectId.toString()
        );
        console.log(`${index + 1}. ${product.name} - Display Order: ${categoryOrder?.displayOrder || 'unset'}`);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        filters: { category, weights, minPrice, maxPrice, isBestseller, isFeatured, search, sortBy, sortOrder },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const formData = await request.formData();    // Extract form data
    const name = formData.get("name");
    const description = formData.get("description");
    const priceStr = formData.get("price");
    const price = priceStr ? parseFloat(priceStr) : 0;
    
    const discountedPriceStr = formData.get("discountedPrice");
    const discountedPrice = (discountedPriceStr && parseFloat(discountedPriceStr) > 0)
      ? parseFloat(discountedPriceStr)
      : null;
    
    const preparationTime = formData.get("preparationTime") || "4-6 hours";
    const isBestseller = formData.get("isBestseller") === "true";
    const isFeatured = formData.get("isFeatured") === "true";
    const isAvailable = formData.get("isAvailable") !== "false"; // Default to true
    const bestsellerOrder = formData.get("bestsellerOrder") ? parseInt(formData.get("bestsellerOrder")) : undefined;

    // Get arrays
    const categories = formData.getAll("categories");
    const existingImageUrls = formData.getAll("imageUrls");

    // Process weight options
    const weightOptions = [];
    let index = 0;
    while (formData.has(`weightOptions[${index}][weight]`)) {
      const weight = formData.get(`weightOptions[${index}][weight]`);
      const priceStr = formData.get(`weightOptions[${index}][price]`);
      const price = priceStr ? parseFloat(priceStr) : 0;
      const discountedPrice = formData.get(`weightOptions[${index}][discountedPrice]`);
      
      console.log(`=== Weight Option ${index} Debug ===`);
      console.log("weight:", weight, "Type:", typeof weight);
      console.log("priceStr:", priceStr, "Type:", typeof priceStr);  
      console.log("price:", price, "Type:", typeof price);
      console.log("discountedPrice:", discountedPrice, "Type:", typeof discountedPrice);
      
      // Only add if weight is not empty
      if (weight && weight.trim() !== '') {
        const option = {
          weight: weight.trim(),
          price: price,
        };
        
        // Only add discountedPrice if it exists and is greater than 0
        if (discountedPrice && parseFloat(discountedPrice) > 0) {
          option.discountedPrice = parseFloat(discountedPrice);
        }
        
        weightOptions.push(option);
        console.log(`✅ Added weight option ${index}:`, option);
      } else {
        console.log(`❌ Skipped empty weight option ${index}`);
      }
        index++;
    }
    
    // Validate required fields
    console.log("=== Backend Validation Debug ===");
    console.log("name:", name, "Type:", typeof name, "Length:", name?.length);
    console.log("description:", description, "Type:", typeof description, "Length:", description?.length);
    console.log("categories:", categories, "Type:", typeof categories, "Length:", categories?.length);
    console.log("weightOptions:", weightOptions, "Type:", typeof weightOptions, "Length:", weightOptions?.length);
    console.log("Weight options content:", JSON.stringify(weightOptions, null, 2));
    
    if (!name || !description || !categories.length || weightOptions.length === 0) {
      console.log("❌ Validation failed - missing fields:", {
        hasName: !!name,
        hasDescription: !!description,
        categoriesLength: categories.length,
        weightOptionsLength: weightOptions.length
      });
      return NextResponse.json(
        { error: "Name, description, categories, and weight options are required" },
        { status: 400 }
      );
    }
    
    console.log("✅ All required fields present");

    // Check Cloudinary configuration before processing images
    const imageFiles = formData.getAll("images");
    if (imageFiles.length > 0) {
      const configError = checkCloudinaryConfig();
      if (configError) {
        return NextResponse.json(
          { error: configError.error },
          { status: 500 }
        );
      }
    }

    // Process image uploads
    const imageUrls = [...existingImageUrls];

    for (const imageFile of imageFiles) {
      if (imageFile && imageFile.size > 0) {
        try {
          // Validate file type
          if (!imageFile.type.startsWith("image/")) {
            return NextResponse.json(
              { error: "Only image files are allowed" },
              { status: 400 }
            );
          }

          // Validate file size (5MB limit)
          if (imageFile.size > 5 * 1024 * 1024) {
            return NextResponse.json(
              { error: "Each image must be less than 5MB" },
              { status: 400 }
            );
          }

          // Convert file to buffer
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Generate unique filename
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = path.extname(imageFile.name);
          const baseName = path.basename(imageFile.name, ext);
          const fileName = `${baseName}-${uniqueSuffix}${ext}`;

          // Upload directly to cloudinary from buffer (Vercel-compatible)
          const cloudinaryResponse = await uploadBufferToCloudinary(buffer, fileName);

          if (cloudinaryResponse && cloudinaryResponse.secure_url) {
            imageUrls.push(cloudinaryResponse.secure_url);
          } else {
            return NextResponse.json(
              { error: "Failed to upload image to cloud storage" },
              { status: 500 }
            );
          }
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return NextResponse.json(
            { error: `Failed to process image upload: ${uploadError.message}` },
            { status: 500 }          );
        }
      }
    }

    // Validate that we have at least one image (temporarily disabled for debugging)
    // if (imageUrls.length === 0) {
    //   return NextResponse.json(
    //     { error: "At least one product image is required" },
    //     { status: 400 }
    //   );
    // }

    // Validate categories exist
    const categoryDocs = await Category.find({ _id: { $in: categories } });
    if (categoryDocs.length !== categories.length) {
      return NextResponse.json(
        { error: "One or more categories not found" },
        { status: 400 }
      );
    }
    
    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;
    
    // Ensure slug is unique
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Validate weight options
    const validatedWeightOptions = validateWeightOptions(weightOptions);

    // Validate price (optional)
    const validatedPrice = price > 0 ? validatePrice(price) : 0;
    const validatedDiscountedPrice = discountedPrice && discountedPrice > 0
      ? validatePrice(discountedPrice)
      : null;    // Create product
    const productData = {
      name,
      slug,
      description,
      price: validatedPrice,
      discountedPrice: validatedDiscountedPrice,
      imageUrls: imageUrls,
      categories,
      weightOptions: validatedWeightOptions,
      isBestseller: Boolean(isBestseller),
      isFeatured: Boolean(isFeatured),
      isAvailable: Boolean(isAvailable),
      preparationTime: preparationTime,
      categoryOrders: [], // Will be set by admin later
    };

    // Add bestsellerOrder only if provided
    if (bestsellerOrder !== undefined) {
      productData.bestsellerOrder = bestsellerOrder;
    }

    const product = new Product(productData);

    await product.save();

    // Initialize category orders for each assigned category
    // Set to the highest order + 1 for each category (so new products appear last by default)
    const categoryOrderPromises = categories.map(async (categoryId) => {
      const maxOrder = await Product.aggregate([
        { $match: { "categoryOrders.category": categoryId } },
        { $unwind: "$categoryOrders" },
        { $match: { "categoryOrders.category": categoryId } },
        { $group: { _id: null, maxOrder: { $max: "$categoryOrders.displayOrder" } } }
      ]);
      
      const nextOrder = maxOrder.length > 0 ? (maxOrder[0].maxOrder || 0) + 1 : 1;
      
      // Add category order for this product
      return Product.findByIdAndUpdate(
        product._id,
        {
          $push: {
            categoryOrders: {
              category: categoryId,
              displayOrder: nextOrder
            }
          }
        }
      );
    });

    await Promise.all(categoryOrderPromises);

    // Populate categories for response
    await product.populate("categories", "name slug group type");

    return NextResponse.json(
      {
        success: true,
        data: formatProductResponse(product),
      },
      { status: 201 }
    );  } catch (error) {
    console.error("Create product error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack?.substring(0, 500)
    });

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Product slug already exists" },
        { status: 409 }
      );
    }

    // Return more detailed error for debugging
    return NextResponse.json(
      { 
        error: "Failed to create product", 
        details: error.message,
        errorName: error.name
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const formData = await request.formData();

    // Get product ID
    const id = formData.get("_id");
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required for updates" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }    // Extract form data
    const name = formData.get("name");
    const description = formData.get("description");
    const priceStr = formData.get("price");
    const price = priceStr ? parseFloat(priceStr) : 0;
    
    const discountedPriceStr = formData.get("discountedPrice");
    const discountedPrice = (discountedPriceStr && parseFloat(discountedPriceStr) > 0)
      ? parseFloat(discountedPriceStr)
      : null;
    const preparationTime = formData.get("preparationTime") || "4-6 hours";
    const isBestseller = formData.get("isBestseller") === "true";
    const isFeatured = formData.get("isFeatured") === "true";
    const isAvailable = formData.get("isAvailable") !== "false"; // Default to true
    const bestsellerOrder = formData.get("bestsellerOrder") ? parseInt(formData.get("bestsellerOrder")) : undefined;    // Get arrays
    const categories = formData.getAll("categories");
    const existingImageUrls = formData.getAll("imageUrls");
    const removedImages = formData.getAll("removedImages");

    // Process weight options
    const weightOptions = [];
    let index = 0;
    while (formData.get(`weightOptions[${index}][weight]`)) {
      const weight = formData.get(`weightOptions[${index}][weight]`);
      const price = parseFloat(formData.get(`weightOptions[${index}][price]`)) || 0;
      const discountedPrice = formData.get(`weightOptions[${index}][discountedPrice]`);
      
      const option = {
        weight: weight,
        price: price,
      };
      
      // Only add discountedPrice if it exists and is greater than 0
      if (discountedPrice && parseFloat(discountedPrice) > 0) {
        option.discountedPrice = parseFloat(discountedPrice);
      }      weightOptions.push(option);
      index++;
    }

    // Validate required fields
    if (!name || !description || !categories.length) {
      return NextResponse.json(
        { error: "Name, description, and categories are required" },
        { status: 400 }
      );
    }

    // Validate price (optional)
    const validatedPrice = price > 0 ? validatePrice(price) : 0;
    const validatedDiscountedPrice = discountedPrice
      ? validatePrice(discountedPrice)
      : null;

    // Check Cloudinary configuration before processing images
    const imageFiles = formData.getAll("images");
    if (imageFiles.length > 0) {
      const configError = checkCloudinaryConfig();
      if (configError) {
        return NextResponse.json(
          { error: configError.error },
          { status: 500 }
        );
      }
    }

    // Process image uploads
    const imageUrls = [...existingImageUrls];

    for (const imageFile of imageFiles) {
      if (imageFile && imageFile.size > 0) {
        try {
          // Validate file type
          if (!imageFile.type.startsWith("image/")) {
            return NextResponse.json(
              { error: "Only image files are allowed" },
              { status: 400 }
            );
          }

          // Validate file size (5MB limit)
          if (imageFile.size > 5 * 1024 * 1024) {
            return NextResponse.json(
              { error: "Each image must be less than 5MB" },
              { status: 400 }
            );
          }          // Convert file to buffer
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Generate unique filename
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = path.extname(imageFile.name);
          const baseName = path.basename(imageFile.name, ext);
          const fileName = `${baseName}-${uniqueSuffix}${ext}`;

          // Upload directly to cloudinary from buffer (Vercel-compatible)
          const cloudinaryResponse = await uploadBufferToCloudinary(buffer, fileName);

          if (cloudinaryResponse && cloudinaryResponse.secure_url) {
            imageUrls.push(cloudinaryResponse.secure_url);
          } else {
            return NextResponse.json(
              { error: "Failed to upload image to cloud storage" },
              { status: 500 }
            );
          }        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return NextResponse.json(
            { error: `Failed to process image upload: ${uploadError.message}` },
            { status: 500 }
          );
        }
      }
    }

    // Log removed images for debugging
    if (removedImages.length > 0) {
      console.log("Images to be removed:", removedImages);
      // Here you could add logic to delete the images from Cloudinary if needed
      // For example:
      // for (const removedImageUrl of removedImages) {
      //   try {
      //     await deleteFromCloudinary(removedImageUrl);
      //   } catch (error) {
      //     console.error("Failed to delete image from Cloudinary:", error);
      //   }
      // }
    }

    // Validate that we have at least one image
    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one product image is required" },
        { status: 400 }
      );
    }

    // Validate categories exist
    const categoryDocs = await Category.find({ _id: { $in: categories } });
    if (categoryDocs.length !== categories.length) {
      return NextResponse.json(
        { error: "One or more categories not found" },
        { status: 400 }
      );
    }

    // Update slug if name changed
    let slug = existingProduct.slug;
    if (name !== existingProduct.name) {
      const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Validate weight options
    const validatedWeightOptions = validateWeightOptions(weightOptions);    // Update product
    const updateData = {
      name,
      slug,
      description,
      price: validatedPrice,
      discountedPrice: validatedDiscountedPrice,
      imageUrls: imageUrls,
      categories,
      weightOptions: validatedWeightOptions,
      isBestseller: Boolean(isBestseller),
      isFeatured: Boolean(isFeatured),
      isAvailable: Boolean(isAvailable),
      preparationTime: preparationTime,
      updatedAt: new Date(),
    };

    // Add bestsellerOrder only if provided
    if (bestsellerOrder !== undefined) {
      updateData.bestsellerOrder = bestsellerOrder;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Populate categories for response
    await updatedProduct.populate("categories", "name slug group type");

    return NextResponse.json({
      success: true,
      data: formatProductResponse(updatedProduct),
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Product slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      data: { _id: deletedProduct._id, slug: deletedProduct.slug },
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
