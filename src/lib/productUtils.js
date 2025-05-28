/**
 * Utility functions for product and category management
 */
import slugify from 'slugify';

/**
 * Generate a URL-friendly slug from text
 * @param {string} text - The text to convert to slug
 * @returns {string} - URL-friendly slug
 */
export function createSlug(text) {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

/**
 * Generate unique slug for products/categories
 * @param {string} name - Name to create slug from
 * @param {Function} checkExists - Function to check if slug exists
 * @returns {Promise<string>} - Unique slug
 */
export async function generateUniqueSlug(name, checkExists) {
  let baseSlug = createSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Parse and validate price
 * @param {string|number} price - Price to validate
 * @returns {number} - Validated price
 */
export function validatePrice(price) {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice) || numPrice < 0) {
    throw new Error('Invalid price');
  }
  return Math.round(numPrice * 100) / 100; // Round to 2 decimal places
}

/**
 * Validate and sanitize image URLs
 * @param {string[]} urls - Array of image URLs
 * @returns {string[]} - Validated URLs
 */
export function validateImageUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error('At least one image URL is required');
  }

  return urls.filter(url => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
}

/**
 * Create search filters for MongoDB query
 * @param {Object} params - Query parameters
 * @returns {Object} - MongoDB filter object
 */
export function createProductFilters(params) {
  const filters = { isAvailable: true };

  // Category filter
  if (params.category) {
    filters.categories = params.category;
  }

  // Price range filter
  if (params.minPrice || params.maxPrice) {
    filters.price = {};
    if (params.minPrice) {
      filters.price.$gte = parseFloat(params.minPrice);
    }
    if (params.maxPrice) {
      filters.price.$lte = parseFloat(params.maxPrice);
    }
  }
  // Tag filter
  if (params.tags && params.tags.length > 0) {
    const tagArray = Array.isArray(params.tags) ? params.tags : [params.tags];
    const filteredTags = tagArray.filter(tag => tag && tag.trim().length > 0);
    if (filteredTags.length > 0) {
      filters.tags = { $in: filteredTags };
    }
  }

  // Eggless filter
  if (params.isEggless === 'true') {
    filters.isEggless = true;
  }

  // Bestseller filter
  if (params.isBestseller === 'true') {
    filters.isBestseller = true;
  }

  // Featured filter
  if (params.isFeatured === 'true') {
    filters.isFeatured = true;
  }

  // Search term
  if (params.search) {
    filters.$text = { $search: params.search };
  }

  return filters;
}

/**
 * Create sort options for MongoDB query
 * @param {string} sortBy - Sort field
 * @param {string} sortOrder - Sort order (asc/desc)
 * @returns {Object} - MongoDB sort object
 */
export function createSortOptions(sortBy = 'createdAt', sortOrder = 'desc') {
  const validSortFields = [
    'name', 'price', 'createdAt', 'updatedAt', 
    'rating', 'reviewCount', 'sortOrder'
  ];

  if (!validSortFields.includes(sortBy)) {
    sortBy = 'createdAt';
  }

  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
  return { [sortBy]: sortDirection };
}

/**
 * Calculate pagination parameters
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination object
 */
export function calculatePagination(page = 1, limit = 12) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12)); // Max 50 items per page
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
}

/**
 * Format product data for API response
 * @param {Object} product - Product document
 * @returns {Object} - Formatted product
 */
export function formatProductResponse(product) {
  const productObj = product.toObject ? product.toObject() : product;
  
  return {
    ...productObj,
    discountPercentage: product.discountPercentage,
    finalPrice: product.finalPrice,
    // Remove sensitive fields if needed
    // Don't include internal fields in API response
  };
}

/**
 * Validate weight options
 * @param {Array} weightOptions - Weight options to validate
 * @returns {Array} - Validated weight options
 */
export function validateWeightOptions(weightOptions) {
  if (!Array.isArray(weightOptions) || weightOptions.length === 0) {
    return [{ weight: '1kg', price: 0 }]; // Default weight option
  }

  return weightOptions.map(option => ({
    weight: option.weight?.trim() || '1kg',
    price: validatePrice(option.price || 0),
    discountedPrice: option.discountedPrice ? validatePrice(option.discountedPrice) : null,
  }));
}
