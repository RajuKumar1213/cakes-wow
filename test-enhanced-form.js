// Advanced test for ProductForm circular reference resolution
console.log("Testing enhanced ProductForm fixes...");

// Simulate React Hook Form data with potential circular references
function createMockReactHookFormData() {
  const mockData = {
    name: "Test Product",
    description: "Test description that is long enough to pass validation",
    shortDescription: "Short desc",
    price: 100,
    discountedPrice: 80,
    categories: ["category1", "category2"],
    tags: ["tag1", "tag2"],
    weightOptions: [{ weight: "500g", price: 100, discountedPrice: 80 }],
    isAvailable: true,
    isBestseller: false,
    isFeatured: false,
    stockQuantity: 100,
    minimumOrderQuantity: 1,
    preparationTime: "4-6 hours",
    sortOrder: 0,
    ingredients: ["flour", "sugar", "eggs"],
    allergens: ["gluten", "eggs"],
    nutritionalInfo: {
      calories: 250,
      protein: "4g",
      carbs: "30g",
      fat: "10g"
    },
    metaTitle: "Test meta title",
    metaDescription: "Test meta description"
  };

  // Add React Hook Form internal properties that might cause circular references
  mockData._formValues = mockData;
  mockData._formState = {
    errors: {},
    isValid: true,
    isDirty: false,
    _ref: mockData // This creates a circular reference
  };
  
  return mockData;
}

// Test the new safe data extraction approach
function testSafeDataExtraction(data) {
  try {
    console.log("Testing safe data extraction...");
    
    // Simulate the imageFiles array
    const imageFiles = [];
    const imagePreviews = [];
    
    // Extract safe data (simulating ProductForm approach)
    const safeData = {
      name: data.name || "",
      description: data.description || "",
      shortDescription: data.shortDescription || "",
      price: data.price || 0,
      discountedPrice: data.discountedPrice || 0,
      categories: Array.isArray(data.categories) ? [...data.categories] : [],
      tags: Array.isArray(data.tags) ? [...data.tags] : [],
      weightOptions: Array.isArray(data.weightOptions) ? data.weightOptions.map(opt => ({
        weight: opt.weight || "",
        price: opt.price || 0,
        discountedPrice: opt.discountedPrice || 0
      })) : [],
      isAvailable: Boolean(data.isAvailable),
      isBestseller: Boolean(data.isBestseller),
      isFeatured: Boolean(data.isFeatured),
      stockQuantity: data.stockQuantity || 0,
      minimumOrderQuantity: data.minimumOrderQuantity || 1,
      preparationTime: data.preparationTime || "",
      sortOrder: data.sortOrder || 0,
      ingredients: Array.isArray(data.ingredients) ? [...data.ingredients] : [],
      allergens: Array.isArray(data.allergens) ? [...data.allergens] : [],
      nutritionalInfo: data.nutritionalInfo ? {
        calories: data.nutritionalInfo.calories || 0,
        protein: data.nutritionalInfo.protein || "",
        carbs: data.nutritionalInfo.carbs || "",
        fat: data.nutritionalInfo.fat || ""
      } : {},
      metaTitle: data.metaTitle || "",
      metaDescription: data.metaDescription || "",
      imageFilesCount: imageFiles.length,
      imagePreviewsCount: imagePreviews.length
    };
    
    // Try to serialize the safe data
    let cleanData;
    try {
      cleanData = JSON.parse(JSON.stringify(safeData));
      console.log("✅ Primary serialization successful");
      return cleanData;
    } catch (serializationError) {
      console.log("⚠️ Primary serialization failed, using fallback...");
      
      // Fallback approach
      cleanData = {
        name: String(safeData.name),
        description: String(safeData.description),
        shortDescription: String(safeData.shortDescription),
        price: Number(safeData.price),
        discountedPrice: Number(safeData.discountedPrice),
        categories: [...safeData.categories],
        tags: [...safeData.tags],
        weightOptions: safeData.weightOptions.map(opt => ({
          weight: String(opt.weight),
          price: Number(opt.price),
          discountedPrice: Number(opt.discountedPrice)
        })),
        isAvailable: Boolean(safeData.isAvailable),
        isBestseller: Boolean(safeData.isBestseller),
        isFeatured: Boolean(safeData.isFeatured),
        stockQuantity: Number(safeData.stockQuantity),
        minimumOrderQuantity: Number(safeData.minimumOrderQuantity),
        preparationTime: String(safeData.preparationTime),
        sortOrder: Number(safeData.sortOrder),
        ingredients: [...safeData.ingredients],
        allergens: [...safeData.allergens],
        nutritionalInfo: {
          calories: Number(safeData.nutritionalInfo.calories),
          protein: String(safeData.nutritionalInfo.protein),
          carbs: String(safeData.nutritionalInfo.carbs),
          fat: String(safeData.nutritionalInfo.fat)
        },
        metaTitle: String(safeData.metaTitle),
        metaDescription: String(safeData.metaDescription),
        imageFilesCount: Number(safeData.imageFilesCount),
        imagePreviewsCount: Number(safeData.imagePreviewsCount)
      };
      
      console.log("✅ Fallback serialization successful");
      return cleanData;
    }
  } catch (error) {
    console.log("❌ Safe data extraction failed:", error.message);
    throw error;
  }
}

// Run the tests
console.log("\n=== Test 1: Direct serialization of circular data ===");
const circularData = createMockReactHookFormData();
try {
  JSON.stringify(circularData);
  console.log("✅ Unexpected: No circular reference detected");
} catch (error) {
  console.log("❌ Expected: Circular reference detected -", error.message);
}

console.log("\n=== Test 2: Safe data extraction from circular data ===");
try {
  const cleanData = testSafeDataExtraction(circularData);
  console.log("✅ Safe data extraction successful");
  console.log("Clean data sample:", {
    name: cleanData.name,
    categoriesCount: cleanData.categories.length,
    weightOptionsCount: cleanData.weightOptions.length
  });
  
  // Verify the clean data can be serialized
  const serialized = JSON.stringify(cleanData);
  console.log("✅ Clean data serialization successful, length:", serialized.length);
} catch (error) {
  console.log("❌ Safe data extraction failed:", error.message);
}

console.log("\n=== Test 3: FormData creation simulation ===");
try {
  const cleanData = testSafeDataExtraction(circularData);
  
  // Simulate FormData creation (can't actually test FormData in Node.js)
  console.log("Simulating FormData creation...");
  const formDataEntries = [];
  
  formDataEntries.push(['name', cleanData.name]);
  formDataEntries.push(['description', cleanData.description]);
  
  cleanData.categories.forEach((categoryId) => {
    formDataEntries.push(['categories', categoryId]);
  });
  
  cleanData.weightOptions.forEach((option, index) => {
    formDataEntries.push([`weightOptions[${index}][weight]`, option.weight]);
    formDataEntries.push([`weightOptions[${index}][price]`, option.price.toString()]);
  });
  
  console.log("✅ FormData simulation successful, entries:", formDataEntries.length);
} catch (error) {
  console.log("❌ FormData simulation failed:", error.message);
}

console.log("\n=== All tests completed ===");
