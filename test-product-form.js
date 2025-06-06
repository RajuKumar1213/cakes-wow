// Test script to reproduce the circular reference error
console.log("Testing ProductForm circular reference issue...");

// Simulate the form data that might be causing the issue
const mockFormData = {
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

// Test 1: Try to JSON.stringify the mock data
try {
  console.log("Test 1: JSON.stringify mock form data");
  const jsonString = JSON.stringify(mockFormData);
  console.log("✅ Mock data serializes successfully");
  console.log("Serialized length:", jsonString.length);
} catch (error) {
  console.log("❌ Error serializing mock data:", error.message);
}

// Test 2: Test the cleaning process from ProductForm
try {
  console.log("\nTest 2: Clean data process from ProductForm");
  const cleanData = JSON.parse(JSON.stringify({
    name: mockFormData.name || "",
    description: mockFormData.description || "",
    shortDescription: mockFormData.shortDescription || "",
    price: mockFormData.price || 0,
    discountedPrice: mockFormData.discountedPrice || 0,
    categories: Array.isArray(mockFormData.categories) ? mockFormData.categories : [],
    tags: Array.isArray(mockFormData.tags) ? mockFormData.tags : [],
    weightOptions: Array.isArray(mockFormData.weightOptions) ? mockFormData.weightOptions : [],
    isAvailable: Boolean(mockFormData.isAvailable),
    isBestseller: Boolean(mockFormData.isBestseller),
    isFeatured: Boolean(mockFormData.isFeatured),
    stockQuantity: mockFormData.stockQuantity || 0,
    minimumOrderQuantity: mockFormData.minimumOrderQuantity || 1,
    preparationTime: mockFormData.preparationTime || "",
    sortOrder: mockFormData.sortOrder || 0,
    ingredients: Array.isArray(mockFormData.ingredients) ? mockFormData.ingredients : [],
    allergens: Array.isArray(mockFormData.allergens) ? mockFormData.allergens : [],
    nutritionalInfo: mockFormData.nutritionalInfo || {},
    metaTitle: mockFormData.metaTitle || "",
    metaDescription: mockFormData.metaDescription || "",
    imageFilesCount: 0,
    imagePreviewsCount: 0
  }));
  
  console.log("✅ Clean data process works successfully");
  console.log("Clean data:", cleanData);
} catch (error) {
  console.log("❌ Error in clean data process:", error.message);
}

// Test 3: Simulate React Hook Form data structure issues
console.log("\nTest 3: Testing potential React Hook Form issues");

// Simulate what might happen with React Hook Form's internal state
const mockReactHookFormData = {
  ...mockFormData,
  // These might be added by React Hook Form internally
  _formValues: mockFormData,
  _formState: {
    errors: {},
    isValid: true,
    isDirty: false
  }
};

// Create a circular reference
mockReactHookFormData._self = mockReactHookFormData;

try {
  JSON.stringify(mockReactHookFormData);
  console.log("✅ No circular reference detected");
} catch (error) {
  console.log("❌ Circular reference detected:", error.message);
  
  // Test the fix
  try {
    const { _formValues, _formState, _self, ...cleanFormData } = mockReactHookFormData;
    const cleanedData = JSON.parse(JSON.stringify(cleanFormData));
    console.log("✅ Circular reference fix works");
  } catch (fixError) {
    console.log("❌ Fix didn't work:", fixError.message);
  }
}

console.log("\nTest completed.");
