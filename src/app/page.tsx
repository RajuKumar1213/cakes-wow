"use client"
import { Header, HeroCarousel, ProductSection, CategorySection, Footer } from '@/components';
import { useState, useEffect } from 'react';

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
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

export default function Home() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featuredCakes, setFeaturedCakes] = useState<Product[]>([]);
  const [egglessCakes, setEgglessCakes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch bestsellers
        const bestSellersResponse = await fetch('/api/products?isBestseller=true&limit=6');
        const bestSellersData = await bestSellersResponse.json();
        
        // Fetch featured cakes
        const featuredResponse = await fetch('/api/products?isFeatured=true&limit=6');
        const featuredData = await featuredResponse.json();
        
        // Fetch eggless cakes
        const egglessResponse = await fetch('/api/products?isEggless=true&limit=6');
        const egglessData = await egglessResponse.json();

        if (bestSellersData.success) {
          setBestSellers(bestSellersData.data.products);
        }
        if (featuredData.success) {
          setFeaturedCakes(featuredData.data.products);
        }
        if (egglessData.success) {
          setEgglessCakes(egglessData.data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Static category data - this can be fetched from API later if needed
  const flavorCategories = [
    {
      id: '1',
      name: 'Chocolate',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop',
      href: '/chocolate-cakes-1'
    },
    {
      id: '2',
      name: 'Vanilla',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&h=100&fit=crop',
      href: '/vanilla-cakes-1'
    },
    {
      id: '3',
      name: 'Red Velvet',
      image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=100&h=100&fit=crop',
      href: '/red-velvet-cakes-1'
    },
    {
      id: '4',
      name: 'Birthday',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
      href: '/birthday-cakes-1'
    },
    {
      id: '5',
      name: 'Anniversary',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=100&h=100&fit=crop',
      href: '/anniversary-cakes-1'
    },
    {
      id: '6',
      name: 'Bestsellers',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=100&h=100&fit=crop',
      href: '/products?isBestseller=true'
    }
  ];

  const dessertCategories = [
    {
      id: '1',
      name: 'Cup Cakes',
      image: 'https://images.unsplash.com/photo-1426869981800-95ebf51ce900?w=100&h=100&fit=crop',
      href: '/cup-cakes-1'
    },
    {
      id: '2',
      name: 'Eggless Cakes',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop',
      href: '/products?isEggless=true'
    },
    {
      id: '3',
      name: 'Featured Cakes',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=100&h=100&fit=crop',
      href: '/products?isFeatured=true'
    },
    {
      id: '4',
      name: 'All Products',
      image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=100&h=100&fit=crop',
      href: '/products'
    },
    {
      id: '5',
      name: 'Premium Cakes',
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=100&h=100&fit=crop',
      href: '/products?sortBy=price&sortOrder=desc'
    },
    {
      id: '6',
      name: 'New Arrivals',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&h=100&fit=crop',
      href: '/products?sortBy=createdAt&sortOrder=desc'
    }
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-white mx-auto">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="text-xl text-gray-600">Loading amazing cakes...</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white mx-auto ">
      <Header />
      
      {/* Hero Carousel */}
      <HeroCarousel />
      
      {/* Best Sellers Section */}
      <ProductSection
        title="Surprise Your Loved One"
        subtitle="Our Best Sellers"
        products={bestSellers}
        viewAllLink="/products?isBestseller=true"
      />
      
      {/* Featured Cakes Section */}
      <ProductSection
        title="Premium Selection"
        subtitle="Featured Cakes"
        products={featuredCakes}
        viewAllLink="/products?isFeatured=true"
      />
      
      {/* Eggless Cakes Section */}
      <ProductSection
        title="Eggless Delights"
        subtitle="Perfect for Everyone"
        products={egglessCakes}
        viewAllLink="/products?isEggless=true"
      />
      
      {/* Experience Flavours Section */}
      <CategorySection
        title="Experience Flavours"
        categories={flavorCategories}
      />
      
      {/* Looking For Something Else Section */}
      <CategorySection
        title="Looking For Something Else"
        categories={dessertCategories}
      />
      
      {/* About Section */}
      <section className="py-16">
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
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              onClick={() => alert('This function is coming soon!')}
            >
              View All
            </button>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16">
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
            <div className="bg-gray-100 rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-gray-700 italic mb-4">
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
