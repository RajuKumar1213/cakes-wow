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
  }  // Simple, robust weight options filter - normalize weight formatting for consistent filtering
  if (params.weights && params.weights.length > 0) {
    // Map standard weights to all possible variations with simple string matching
    const weightVariations = {
      '500g': ['500g', '500 g', '0.5kg', '0.5 kg', '0.5 Kg', '0.5Kg', '500G'],
      '750g': ['750g', '750 g', '0.75kg', '0.75 kg', '0.75 Kg', '0.75Kg', '750G'],
      '1kg': ['1kg', '1 kg', '1 Kg', '1Kg', '1000g', '1000 g', '1KG'],
      '1.5kg': ['1.5kg', '1.5 kg', '1.5 Kg', '1.5Kg', '1500g', '1500 g', '1.5KG'],
      '2kg': ['2kg', '2 kg', '2 Kg', '2Kg', '2000g', '2000 g', '2KG'],
      '3kg': ['3kg', '3 kg', '3 Kg', '3Kg', '3000g', '3000 g', '3KG'],
      '4kg': ['4kg', '4 kg', '4 Kg', '4Kg', '4000g', '4000 g', '4KG'],
      '5kg': ['5kg', '5 kg', '5 Kg', '5Kg', '5000g', '5000 g', '5KG'],
    };
    
    // Get all possible variations of the selected weights
    const allPossibleWeights = [];
    params.weights.forEach(weight => {
      if (weightVariations[weight]) {
        allPossibleWeights.push(...weightVariations[weight]);
      }
    });
    
    if (allPossibleWeights.length > 0) {
      filters['weightOptions.weight'] = { $in: allPossibleWeights };
    }
  }
  // Price range filter - filter by minimum price of each product only
  if (params.minPrice || params.maxPrice) {
    const aggregationPipeline = [];
    
    // First, calculate the minimum price for each product
    aggregationPipeline.push({
      $addFields: {
        minProductPrice: {
          $min: {
            $concatArrays: [
              { $cond: [{ $gt: ["$price", 0] }, ["$price"], []] },
              "$weightOptions.price"
            ]
          }
        }
      }
    });
    
    // Then filter by that minimum price
    const priceFilter = {};
    if (params.minPrice) {
      priceFilter.$gte = parseFloat(params.minPrice);
    }
    if (params.maxPrice) {
      priceFilter.$lte = parseFloat(params.maxPrice);
    }
    
    if (Object.keys(priceFilter).length > 0) {
      filters.minProductPrice = priceFilter;
      // Store the aggregation info so we can use it in the query
      filters._useAggregation = true;
      filters._aggregationSteps = aggregationPipeline;
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
