// Enhanced category filtering utility
import mongoose from 'mongoose';

export function createEnhancedProductFilters(params) {
  const filters = { isAvailable: true };

  // Enhanced category filter with better ObjectId handling
  if (params.category) {
    console.log('🔍 Enhanced Filter - Category input:', params.category, 'Type:', typeof params.category);
    
    // Ensure we have a proper ObjectId
    let categoryId;
    if (mongoose.Types.ObjectId.isValid(params.category)) {
      categoryId = new mongoose.Types.ObjectId(params.category);
    } else {
      console.error('❌ Invalid ObjectId for category:', params.category);
      return filters; // Return early with just isAvailable filter
    }
    
    console.log('✅ Enhanced Filter - Using ObjectId:', categoryId.toString());
    
    // Use the $in operator to match the category in the categories array
    filters.categories = { $in: [categoryId] };
    
    console.log('🔧 Enhanced Filter - Final category filter:', JSON.stringify(filters.categories));
  }

  // Tags filter
  if (params.tags && params.tags.length > 0) {
    filters.tags = { $in: params.tags };
  }

  // Weight options filter
  if (params.weights && params.weights.length > 0) {
    filters['weightOptions.weight'] = { $in: params.weights };
  }

  // Price range filter - handle both base price and weight option prices
  if (params.minPrice || params.maxPrice) {
    const priceFilter = [];
    
    // Filter for base price
    const basePriceFilter = {};
    if (params.minPrice) {
      basePriceFilter.$gte = parseFloat(params.minPrice);
    }
    if (params.maxPrice) {
      basePriceFilter.$lte = parseFloat(params.maxPrice);
    }
    
    if (Object.keys(basePriceFilter).length > 0) {
      priceFilter.push({ 
        $and: [
          { price: { $gt: 0 } }, // Has a base price
          { price: basePriceFilter }
        ]
      });
      
      // Also check weight option prices
      priceFilter.push({
        $and: [
          { 'weightOptions.price': { $gt: 0 } },
          { 'weightOptions.price': basePriceFilter }
        ]
      });
      
      filters.$or = priceFilter;
    }
  }

  // Boolean filters
  if (params.isBestseller === 'true' || params.isBestseller === true) {
    filters.isBestseller = true;
  }
  
  if (params.isFeatured === 'true' || params.isFeatured === true) {
    filters.isFeatured = true;
  }

  // Search filter
  if (params.search) {
    const searchRegex = new RegExp(params.search, 'i');
    filters.$or = filters.$or || [];
    filters.$or.push(
      { name: searchRegex },
      { description: searchRegex },
      { shortDescription: searchRegex },
      { tags: { $in: [searchRegex] } }
    );
  }

  console.log('🏁 Enhanced Filter - Final filters:', JSON.stringify(filters, null, 2));
  return filters;
}
