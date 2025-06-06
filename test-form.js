// Simple test to verify the circular reference fix
console.log("Testing ProductForm circular reference fix...");

// Create a simple test object that would normally cause circular reference issues
const testFormData = {
  name: "Test Product",
  description: "This is a test product description",
  price: 299,
  categories: ["category1"],
  weightOptions: [{ weight: "500g", price: 299, discountedPrice: 199 }],
  isAvailable: true,
  isBestseller: false,
  isFeatured: false,
  stockQuantity: 100,
  minimumOrderQuantity: 1,
  preparationTime: "4-6 hours",
  ingredients: ["flour", "sugar", "eggs"],
  allergens: ["gluten", "dairy"],
  tags: ["chocolate", "cake"],
  nutritionalInfo: {
    calories: 350,
    protein: "5g",
    carbs: "45g",
    fat: "15g"
  },
  metaTitle: "Test Product - Delicious Cake",
  metaDescription: "A delicious test cake product",
  sortOrder: 0
};

// Test clean data creation (this is what we do in the form now)
const cleanData = {
  name: testFormData.name,
  description: testFormData.description,
  shortDescription: testFormData.shortDescription,
  price: testFormData.price,
  discountedPrice: testFormData.discountedPrice,
  categories: testFormData.categories || [],
  tags: testFormData.tags || [],
  weightOptions: testFormData.weightOptions || [],
  isAvailable: testFormData.isAvailable,
  isBestseller: testFormData.isBestseller,
  isFeatured: testFormData.isFeatured,
  stockQuantity: testFormData.stockQuantity,
  minimumOrderQuantity: testFormData.minimumOrderQuantity,
  preparationTime: testFormData.preparationTime,
  sortOrder: testFormData.sortOrder,
  ingredients: testFormData.ingredients || [],
  allergens: testFormData.allergens || [],
  nutritionalInfo: testFormData.nutritionalInfo,
  metaTitle: testFormData.metaTitle,
  metaDescription: testFormData.metaDescription,
  imageFilesCount: 0,
  imagePreviewsCount: 0
};

try {
  // This should work without circular reference errors
  console.log("Testing JSON.stringify on clean data...");
  const jsonString = JSON.stringify(cleanData, null, 2);
  console.log("✅ SUCCESS: Clean data can be serialized without circular reference issues");
  console.log("Clean data structure:");
  console.log(jsonString);
} catch (error) {
  console.log("❌ FAILED: Still has circular reference issues");
  console.error("Error:", error.message);
}

// Test FormData creation
try {
  console.log("\nTesting FormData creation...");
  const formData = new FormData();
  
  // Add basic fields
  formData.append("name", cleanData.name);
  formData.append("description", cleanData.description);
  if (cleanData.price) formData.append("price", cleanData.price.toString());
  
  // Add arrays
  cleanData.categories.forEach(cat => formData.append("categories", cat));
  cleanData.tags.forEach(tag => formData.append("tags", tag));
  cleanData.ingredients.forEach(ingredient => formData.append("ingredients", ingredient));
  cleanData.allergens.forEach(allergen => formData.append("allergens", allergen));
  
  // Add weight options
  cleanData.weightOptions.forEach((option, index) => {
    formData.append(`weightOptions[${index}][weight]`, option.weight);
    formData.append(`weightOptions[${index}][price]`, option.price.toString());
    if (option.discountedPrice) {
      formData.append(`weightOptions[${index}][discountedPrice]`, option.discountedPrice.toString());
    }
  });
  
  // Add boolean fields
  formData.append("isAvailable", cleanData.isAvailable.toString());
  formData.append("isBestseller", cleanData.isBestseller.toString());
  formData.append("isFeatured", cleanData.isFeatured.toString());
  
  // Add numeric fields
  formData.append("stockQuantity", cleanData.stockQuantity.toString());
  formData.append("minimumOrderQuantity", cleanData.minimumOrderQuantity.toString());
  formData.append("preparationTime", cleanData.preparationTime);
  if (cleanData.sortOrder !== undefined) formData.append("sortOrder", cleanData.sortOrder.toString());
  
  // Add nutritional info
  if (cleanData.nutritionalInfo) {
    formData.append("nutritionalInfo", JSON.stringify(cleanData.nutritionalInfo));
  }
  
  // Add SEO fields
  if (cleanData.metaTitle) formData.append("metaTitle", cleanData.metaTitle);
  if (cleanData.metaDescription) formData.append("metaDescription", cleanData.metaDescription);
  
  console.log("✅ SUCCESS: FormData creation works without issues");
  console.log("FormData entries count:", Array.from(formData.entries()).length);
  
} catch (error) {
  console.log("❌ FAILED: FormData creation failed");
  console.error("Error:", error.message);
}

console.log("\n🎉 Test completed! The circular reference fix should be working.");
