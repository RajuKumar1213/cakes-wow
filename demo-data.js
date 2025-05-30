// Demo data for testing admin interface
// Run this in your database or through the API

export const demoCategories = [
  {
    name: "Birthday Cakes",
    slug: "birthday-cakes",
    group: "cakes",
    type: "main",
    description: "Special cakes for birthday celebrations",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400",
    isActive: true
  },
  {
    name: "Chocolate Cakes",
    slug: "chocolate-cakes", 
    group: "cakes",
    type: "sub",
    description: "Rich and delicious chocolate cakes",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    isActive: true
  },
  {
    name: "Pastries",
    slug: "pastries",
    group: "pastries", 
    type: "main",
    description: "Fresh baked pastries and desserts",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    isActive: true
  },
  {
    name: "Eggless Options",
    slug: "eggless",
    group: "cakes",
    type: "filter", 
    description: "Delicious eggless cakes and desserts",
    imageUrl: "https://images.unsplash.com/photo-1562440499-64c9a4d07668?w=400",
    isActive: true
  }
];

export const demoProducts = [
  {
    name: "Classic Chocolate Birthday Cake",
    description: "A rich, moist chocolate cake perfect for birthday celebrations. Made with premium cocoa and topped with smooth chocolate frosting.",
    shortDescription: "Rich chocolate cake with premium frosting",
    price: 599,
    discountedPrice: 499,
    imageUrls: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
      "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500"
    ],
    tags: ["chocolate", "birthday", "premium", "bestseller"],
    weightOptions: [
      { weight: "500g", price: 499 },
      { weight: "1kg", price: 799 },
      { weight: "1.5kg", price: 1099 }
    ],
    isEggless: false,
    isBestseller: true,
    isFeatured: true,
    stockQuantity: 25,
    preparationTime: "3-4 hours"
  },
  {
    name: "Vanilla Delight Eggless Cake", 
    description: "Light and fluffy vanilla cake made without eggs. Perfect for those with dietary restrictions without compromising on taste.",
    shortDescription: "Fluffy vanilla cake, completely eggless",
    price: 449,
    discountedPrice: 399,
    imageUrls: [
      "https://images.unsplash.com/photo-1562440499-64c9a4d07668?w=500"
    ],
    tags: ["vanilla", "eggless", "light", "dietary-friendly"],
    weightOptions: [
      { weight: "500g", price: 399 },
      { weight: "1kg", price: 699 }
    ],
    isEggless: true,
    isBestseller: false,
    isFeatured: false,
    stockQuantity: 15,
    preparationTime: "2-3 hours"
  },
  {
    name: "Fresh Fruit Pastry",
    description: "Delicate pastry filled with seasonal fresh fruits and light cream. A perfect afternoon treat.",
    shortDescription: "Fresh seasonal fruit pastry with cream",
    price: 149,
    imageUrls: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500"
    ],
    tags: ["pastry", "fresh-fruit", "light", "afternoon-treat"],
    weightOptions: [
      { weight: "Individual", price: 149 },
      { weight: "Pack of 6", price: 799 }
    ],
    isEggless: false,
    isBestseller: false,
    isFeatured: true,
    stockQuantity: 30,
    preparationTime: "1-2 hours"
  }
];

// Instructions for seeding data:
console.log('📋 Demo Data Ready!');
console.log('');
console.log('🔧 To seed this data:');
console.log('1. Copy the category objects and POST to /api/categories');
console.log('2. Get the category IDs from the response');
console.log('3. Update product objects with actual category IDs');
console.log('4. POST the products to /api/products');
console.log('');
console.log('🎯 Categories to create:', demoCategories.length);
console.log('🎯 Products to create:', demoProducts.length);
