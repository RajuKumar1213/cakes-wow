"use client"
import { Header, HeroCarousel, CategorySection, CategoryShowcase, ProductSection, Footer } from '@/components';
import { useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  slug: string;
  group: string;
  type: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  imageUrls: string[];
  price: number;
  discountedPrice: number;
  finalPrice: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  isEggless: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  discountPercentage: number;
  weightOptions?: Array<{
    weight: string;
    price: number;
    discountedPrice?: number;
  }>;
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<{[key: string]: Category[]}>({});
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [egglessProducts, setEgglessProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on page load
    
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get('/api/categories?format=all');
        const categoriesData = categoriesResponse.data;
        
        if (categoriesData.success) {
          const categories = categoriesData.data;
          setCategories(categories);
          
          // Group categories by their group field
          const grouped = categories.reduce((acc: {[key: string]: Category[]}, category: Category) => {
            if (!acc[category.group]) {
              acc[category.group] = [];
            }
            acc[category.group].push(category);
            return acc;
          }, {});
          
          setGroupedCategories(grouped);
        }

        // Fetch featured products
        const featuredResponse = await axios.get('/api/products?isFeatured=true&limit=8');
        if (featuredResponse.data.success) {
          setFeaturedProducts(featuredResponse.data.data.products);
        }

        // Fetch bestseller products
        const bestsellerResponse = await axios.get('/api/products?isBestseller=true&limit=8');
        if (bestsellerResponse.data.success) {
          setBestsellerProducts(bestsellerResponse.data.data.products);
        }

        // Fetch eggless products
        const egglessResponse = await axios.get('/api/products?isEggless=true&limit=8');
        if (egglessResponse.data.success) {
          setEgglessProducts(egglessResponse.data.data.products);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to format categories for CategorySection
  const formatCategoriesForSection = (categoryList: Category[]) => {
    return categoryList.map(category => ({
      id: category._id,
      name: category.name,
      image: category.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop',
      href: `/${category.slug}`
    }));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white mx-auto">
        <Header />
        <div className="flex justify-center items-center h-96">
            <Loading size="lg" text="Loading..." className="text-pink-400" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Carousel */}
      <HeroCarousel categories={categories} />
      
      {/* Featured Categories Showcase */}
      {categories.length > 0 && (
        <CategoryShowcase
          title="Explore Our Delicious Categories"
          subtitle="Discover our wide range of freshly baked treats made with love"
          categories={categories}
          maxItems={6}
        />
      )}
      
      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="bg-white">
          <ProductSection
            title="Featured Products"
            subtitle="Handpicked favorites that our customers love the most"
            products={featuredProducts}
            viewAllLink="/products?featured=true"
          />
        </div>
      )}
      
      {/* Quick Category Navigation */}
      {Object.entries(groupedCategories).slice(0, 2).map(([groupName, categoryList], index) => (
        <div key={groupName} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
          <CategorySection
            title={`${groupName} Collection`}
            categories={formatCategoriesForSection(categoryList)}
          />
        </div>
      ))}
      
      {/* Bestseller Products */}
      {bestsellerProducts.length > 0 && (
        <div className="relative bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 overflow-hidden">
          {/* Texture overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-200/20 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,182,193,0.3),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,192,203,0.2),transparent_50%)]"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffc0cb' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }}></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <ProductSection
              title="Bestsellers"
              subtitle="Most loved treats that keep our customers coming back"
              products={bestsellerProducts}
              viewAllLink="/products?bestseller=true"
            />
          </div>
        </div>
      )}
      
      {/* Eggless Products */}
      {egglessProducts.length > 0 && (
        <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(134,239,172,0.2),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(110,231,183,0.15),transparent_50%)]"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2386efac' fill-opacity='0.08'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <ProductSection
              title="Eggless Delights"
              subtitle="Delicious eggless options for everyone to enjoy"
              products={egglessProducts}
              viewAllLink="/products?eggless=true"
            />
          </div>
        </div>
      )}
      
      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              About us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Bakingo is an FSSAI-certified bakery where every dessert tells a story! Our
              bakery came to light intending to make your remarkable occasions even sweeter and
              more memorable. We bake perfection with quality ingredients into impeccable cakes,
              pastries, brownies, cupcakes, and much more. We specialise in delivering
              exuberant smiles to our customers in around 30 cities across India, including Delhi,
              Mumbai, Bengaluru, Hyderabad, Ahmedabad, Chennai, Kolkata, Pune, and so forth.
              Bakingo is a haven for dessert lovers who want to indulge in scrumptious treats
              and fill their celebrations with cherished memories.
            </p>
            <button 
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => alert('This function is coming soon!')}
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What our customers say about us!
            </h2>
            <div className="flex justify-center items-center space-x-4 mb-8">
              <div className="text-6xl font-bold text-red-500">4.6</div>
              <div>
                <div className="text-gray-600">Based On 61807+ Reviews And Rating</div>
                <div className="flex space-x-2 mt-2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">4.4</span>
                  <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm">4.1</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
              <p className="text-gray-700 italic mb-4 text-lg">
                "The cake was super delicious thank you."
              </p>
              <p className="font-medium text-gray-800">- mariamelonipaul</p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
