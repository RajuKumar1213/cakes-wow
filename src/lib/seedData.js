import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category.models';
import Product from '@/models/Product.models';
import { generateUniqueSlug } from '@/lib/productUtils';

const sampleCategories = [
  {
    name: "Chocolate Cakes",
    group: "By Flavours",
    type: "Category",
    description: "Indulge in our rich and decadent chocolate cakes, perfect for any celebration.",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
  },
  {
    name: "Vanilla Cakes",
    group: "By Flavours", 
    type: "Category",
    description: "Classic vanilla cakes with smooth, creamy flavor that never goes out of style.",
    imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop"
  },
  {
    name: "Red Velvet Cakes",
    group: "By Flavours",
    type: "Category",
    description: "Luxurious red velvet cakes with cream cheese frosting.",
    imageUrl: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=300&fit=crop"
  },
  {
    name: "Black Forest Cakes",
    group: "By Flavours",
    type: "Category",
    description: "Classic German cakes with chocolate, cherries, and whipped cream.",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
  },
  {
    name: "Strawberry Cakes",
    group: "By Flavours",
    type: "Category",
    description: "Fresh and fruity strawberry cakes perfect for summer celebrations.",
    imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop"
  },
  {
    name: "Butterscotch Cakes",
    group: "By Flavours",
    type: "Category",
    description: "Rich butterscotch flavored cakes with caramel goodness.",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
  },
  {
    name: "Birthday Cakes",
    group: "Trending Cakes",
    type: "Occasion",
    description: "Make every birthday special with our colorful and delicious birthday cakes.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  },
  {
    name: "Anniversary Cakes",
    group: "Trending Cakes",
    type: "Occasion", 
    description: "Celebrate love with our romantic and elegant anniversary cakes.",
    imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop"
  },
  {
    name: "Wedding Cakes",
    group: "Trending Cakes",
    type: "Occasion", 
    description: "Elegant multi-tier cakes perfect for your special day.",
    imageUrl: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&h=300&fit=crop"
  },
  {
    name: "Heart Shaped Cakes",
    group: "By Relationship",
    type: "Relationship",
    description: "Express your love with our beautiful heart-shaped cakes.",
    imageUrl: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=300&fit=crop"
  },
  {
    name: "Cup Cakes",
    group: "Desserts", 
    type: "Dessert",
    description: "Individual sized treats perfect for parties and personal indulgence.",
    imageUrl: "https://images.unsplash.com/photo-1426869981800-95ebf51ce900?w=400&h=300&fit=crop"
  },
  {
    name: "Pastries",
    group: "Desserts", 
    type: "Dessert",
    description: "Flaky, buttery pastries with various fillings and toppings.",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop"
  },
  {
    name: "Brownies",
    group: "Desserts", 
    type: "Dessert",
    description: "Rich, fudgy chocolate brownies for the ultimate indulgence.",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop"
  },
  {
    name: "Kids Theme Cakes",
    group: "Theme Cakes",
    type: "Theme",
    description: "Fun and colorful themed cakes perfect for children's parties.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  },
  {
    name: "Photo Cakes",
    group: "Theme Cakes",
    type: "Special",
    description: "Personalized cakes with edible photo prints for memorable celebrations.",
    imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop"
  }
];

const sampleProducts = [
  {
    name: "Classic Chocolate Truffle Cake",
    description: "A rich and moist chocolate cake layered with smooth chocolate truffle cream. This decadent dessert is perfect for chocolate lovers who crave an intense cocoa experience. Made with premium Belgian chocolate and finished with a glossy chocolate ganache.",
    shortDescription: "Rich chocolate cake with truffle cream and Belgian chocolate ganache.",
    price: 899,
    discountedPrice: 699,
    imageUrls: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop",
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=400&fit=crop"
    ],
    categoryName: "Chocolate Cakes",
    tags: ["chocolate", "truffle", "premium", "bestseller"],
    weightOptions: [
      { weight: "500g", price: 699, discountedPrice: 599 },
      { weight: "1kg", price: 899, discountedPrice: 699 },
      { weight: "2kg", price: 1699, discountedPrice: 1399 }
    ],
    isEggless: false,
    isBestseller: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 245
  },
  {
    name: "Vanilla Bean Birthday Cake",
    description: "A light and fluffy vanilla sponge cake infused with real vanilla beans. Decorated with colorful buttercream flowers and edible pearls, this cake is perfect for making birthday celebrations memorable.",
    shortDescription: "Light vanilla cake with colorful decorations perfect for birthdays.",
    price: 749,
    discountedPrice: 599,
    imageUrls: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop"
    ],
    categoryNames: ["Vanilla Cakes", "Birthday Cakes"],
    tags: ["vanilla", "birthday", "colorful", "celebration"],
    weightOptions: [
      { weight: "500g", price: 599, discountedPrice: 499 },
      { weight: "1kg", price: 749, discountedPrice: 599 },
      { weight: "1.5kg", price: 1099, discountedPrice: 899 }
    ],
    isEggless: true,
    isBestseller: true,
    rating: 4.6,
    reviewCount: 189
  },
  {
    name: "Red Velvet Heart Cake",
    description: "A romantic heart-shaped red velvet cake with layers of cream cheese frosting. The subtle cocoa flavor combined with the tangy cream cheese creates a perfect balance. Ideal for anniversaries and romantic occasions.",
    shortDescription: "Heart-shaped red velvet cake with cream cheese frosting.",
    price: 999,
    discountedPrice: 799,
    imageUrls: [
      "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500&h=400&fit=crop",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&h=400&fit=crop"
    ],
    categoryNames: ["Red Velvet Cakes", "Anniversary Cakes"],
    tags: ["red velvet", "heart shaped", "anniversary", "romantic"],
    weightOptions: [
      { weight: "750g", price: 799, discountedPrice: 699 },
      { weight: "1kg", price: 999, discountedPrice: 799 },
      { weight: "1.5kg", price: 1399, discountedPrice: 1199 }
    ],
    isEggless: false,
    isBestseller: false,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 156
  },
  {
    name: "Chocolate Chip Cupcakes (Set of 6)",
    description: "Soft and fluffy vanilla cupcakes studded with chocolate chips and topped with vanilla buttercream. These individual treats are perfect for parties, office celebrations, or when you want just the right amount of sweetness.",
    shortDescription: "Set of 6 vanilla cupcakes with chocolate chips and buttercream.",
    price: 399,
    discountedPrice: 299,
    imageUrls: [
      "https://images.unsplash.com/photo-1426869981800-95ebf51ce900?w=500&h=400&fit=crop",
      "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500&h=400&fit=crop"
    ],
    categoryName: "Cup Cakes",
    tags: ["cupcakes", "chocolate chip", "party", "individual"],
    weightOptions: [
      { weight: "6 pieces", price: 399, discountedPrice: 299 },
      { weight: "12 pieces", price: 699, discountedPrice: 549 }
    ],
    isEggless: true,
    isBestseller: false,
    rating: 4.4,
    reviewCount: 98
  },
  {
    name: "Double Chocolate Fudge Cake",
    description: "An intensely chocolatey experience with layers of moist chocolate sponge and rich chocolate fudge. Topped with chocolate shavings and a drizzle of chocolate sauce. This is the ultimate cake for serious chocolate enthusiasts.",
    shortDescription: "Ultra-rich double chocolate cake with fudge layers.",
    price: 1099,
    discountedPrice: 899,
    imageUrls: [
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=400&fit=crop",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop"
    ],
    categoryName: "Chocolate Cakes",
    tags: ["double chocolate", "fudge", "intense", "premium"],
    weightOptions: [
      { weight: "1kg", price: 1099, discountedPrice: 899 },
      { weight: "1.5kg", price: 1599, discountedPrice: 1299 },
      { weight: "2kg", price: 2099, discountedPrice: 1699 }
    ],
    isEggless: false,
    isBestseller: true,
    isFeatured: false,
    rating: 4.9,
    reviewCount: 312
  },
  {
    name: "Elegant Vanilla Wedding Cake",
    description: "A sophisticated three-tier vanilla cake perfect for weddings and special celebrations. Each layer is filled with vanilla bean cream and fresh berries. Decorated with elegant white roses and pearl details.",
    shortDescription: "Three-tier vanilla wedding cake with roses and pearl decorations.",
    price: 2499,
    discountedPrice: 1999,
    imageUrls: [
      "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop"
    ],
    categoryNames: ["Vanilla Cakes", "Anniversary Cakes"],
    tags: ["wedding", "three tier", "elegant", "roses"],
    weightOptions: [
      { weight: "2kg", price: 2499, discountedPrice: 1999 },
      { weight: "3kg", price: 3299, discountedPrice: 2699 }
    ],
    isEggless: true,
    isBestseller: false,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 67
  }
];

async function checkCategoryExists(slug) {
  const category = await Category.findOne({ slug });
  return !!category;
}

async function checkProductExists(slug) {
  const product = await Product.findOne({ slug });
  return !!product;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await dbConnect();
    console.log('✅ Database connected');

    // Clear existing data (optional - remove if you want to keep existing data)
    // await Category.deleteMany({});
    // await Product.deleteMany({});
    // console.log('🧹 Cleared existing data');

    // Seed Categories
    console.log('📁 Seeding categories...');
    const categoryMap = {};
    
    for (const categoryData of sampleCategories) {
      const slug = await generateUniqueSlug(categoryData.name, checkCategoryExists);
      
      const category = await Category.findOneAndUpdate(
        { name: categoryData.name },
        {
          ...categoryData,
          slug,
          isActive: true,
          sortOrder: 0
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      
      categoryMap[categoryData.name] = category._id;
      console.log(`  ✅ Created/Updated category: ${categoryData.name}`);
    }

    // Seed Products
    console.log('🎂 Seeding products...');
    
    for (      const productData of sampleProducts) {
      const slug = await generateUniqueSlug(productData.name, checkProductExists);
      
      // Map category names to IDs
      const categories = [];
      if (productData.categoryName) {
        categories.push(categoryMap[productData.categoryName]);
      }
      if (productData.categoryNames) {
        for (const catName of productData.categoryNames) {
          if (categoryMap[catName]) {
            categories.push(categoryMap[catName]);
          }
        }
      }

      await Product.findOneAndUpdate(
        { name: productData.name },
        {
          name: productData.name,
          slug,
          description: productData.description,
          shortDescription: productData.shortDescription,
          price: productData.price,
          discountedPrice: productData.discountedPrice,
          imageUrls: productData.imageUrls,
          categories: [...new Set(categories)], // Remove duplicates
          tags: productData.tags,
          weightOptions: productData.weightOptions,
          isEggless: productData.isEggless,
          isAvailable: true,
          isBestseller: productData.isBestseller,
          isFeatured: productData.isFeatured || false,
          rating: productData.rating,
          reviewCount: productData.reviewCount
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      
      console.log(`  ✅ Created/Updated product: ${productData.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Seeded ${sampleCategories.length} categories and ${sampleProducts.length} products`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

export default seedDatabase;
