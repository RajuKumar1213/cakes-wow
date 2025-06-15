import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product.models";
import Category from "@/models/Category.models";
import { uploadOnCloudinary, uploadBufferToCloudinary } from "@/helpers/uploadOnCloudinary";
import fs from "fs";
import path from "path";
import {
  createProductFilters,
  createSortOptions,
  calculatePagination,
  formatProductResponse,
  generateUniqueSlug,
  validatePrice,
  validateImageUrls,
  validateWeightOptions,
} from "@/lib/productUtils";

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

    await dbConnect();

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
    }

    // Build filters
    const filters = createProductFilters({
      category: categoryObjectId,
      weights,
      minPrice,
      maxPrice,
      isBestseller,
      isFeatured,
      search,
    });

    // Calculate pagination
    const { page: pageNum, limit: limitNum, skip } = calculatePagination(page, limit);

    // Create sort options
    const sort = createSortOptions(sortBy, sortOrder);

    // Get total count and products
    const total = await Product.countDocuments(filters);
    const products = await Product.find(filters)
      .populate("categories", "name slug group type")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Format products for response
    const formattedProducts = products.map((product) => ({
      ...product,
      discountPercentage:
        product.discountedPrice && product.price > product.discountedPrice
          ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
          : 0,
      finalPrice: product.discountedPrice || product.price,
    }));

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
    await dbConnect();

    const formData = await request.formData();

    // Extract form data
    const name = formData.get("name");
    const description = formData.get("description");
    const price = parseFloat(formData.get("price")) || 0;
    
    const discountedPrice = formData.get("discountedPrice")
      ? parseFloat(formData.get("discountedPrice"))
      : null;
    const preparationTime = formData.get("preparationTime") || "4-6 hours";
    const isBestseller = formData.get("isBestseller") === "true";
    const isFeatured = formData.get("isFeatured") === "true";
    const isAvailable = formData.get("isAvailable") !== "false"; // Default to true

    // Get arrays
    const categories = formData.getAll("categories");
    const existingImageUrls = formData.getAll("imageUrls");

    // Process weight options
    const weightOptions = [];
    let index = 0;
    while (formData.get(`weightOptions[${index}][weight]`)) {
      const weight = formData.get(`weightOptions[${index}][weight]`);
      const optionPrice = parseFloat(formData.get(`weightOptions[${index}][price]`));
      const optionDiscountedPrice = formData.get(`weightOptions[${index}][discountedPrice]`)
        ? parseFloat(formData.get(`weightOptions[${index}][discountedPrice]`))
        : null;
      
      weightOptions.push({
        weight: weight,
        price: optionPrice,
        discountedPrice: optionDiscountedPrice,
      });
      index++;
    }

    // Validate required fields
    if (!name || !description || !categories.length || weightOptions.length === 0) {
      return NextResponse.json(
        { error: "Name, description, categories, and weight options are required" },
        { status: 400 }
      );
    }

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
            { status: 500 }
          );
        }
      }
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

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Validate weight options
    const validatedWeightOptions = validateWeightOptions(weightOptions);

    // Create product
    const product = new Product({
      name,
      slug,
      description,
      price,
      discountedPrice,
      imageUrls: imageUrls,
      categories,
      weightOptions: validatedWeightOptions,
      isBestseller: Boolean(isBestseller),
      isFeatured: Boolean(isFeatured),
      isAvailable: Boolean(isAvailable),
      preparationTime: preparationTime,
    });

    await product.save();

    // Populate categories for response
    await product.populate("categories", "name slug group type");

    return NextResponse.json(
      {
        success: true,
        data: formatProductResponse(product),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Product slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();

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
    }

    // Extract form data
    const name = formData.get("name");
    const description = formData.get("description");
    const price = parseFloat(formData.get("price"));
    const discountedPrice = formData.get("discountedPrice")
      ? parseFloat(formData.get("discountedPrice"))
      : null;
    const preparationTime = formData.get("preparationTime") || "4-6 hours";
    const isBestseller = formData.get("isBestseller") === "true";
    const isFeatured = formData.get("isFeatured") === "true";
    const isAvailable = formData.get("isAvailable") !== "false"; // Default to true

    // Get arrays
    const categories = formData.getAll("categories");
    const existingImageUrls = formData.getAll("imageUrls");

    // Process weight options
    const weightOptions = [];
    let index = 0;
    while (formData.get(`weightOptions[${index}][weight]`)) {
      const weight = formData.get(`weightOptions[${index}][weight]`);
      const optionPrice = parseFloat(formData.get(`weightOptions[${index}][price]`));
      const optionDiscountedPrice = formData.get(`weightOptions[${index}][discountedPrice]`)
        ? parseFloat(formData.get(`weightOptions[${index}][discountedPrice]`))
        : null;
      
      weightOptions.push({
        weight: weight,
        price: optionPrice,
        discountedPrice: optionDiscountedPrice,
      });
      index++;
    }

    // Validate required fields
    if (!name || !description || !price || !categories.length) {
      return NextResponse.json(
        { error: "Name, description, price, and categories are required" },
        { status: 400 }
      );
    }

    // Validate price
    const validatedPrice = validatePrice(price);
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
            { status: 500 }
          );
        }
      }
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
    const validatedWeightOptions = validateWeightOptions(weightOptions);

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
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
      },
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

    await dbConnect();

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
