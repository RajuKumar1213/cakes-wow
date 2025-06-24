import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  name: string;
  slug: string;
  imageUrls: string[];
  price: number;
  discountedPrice?: number;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
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

interface SpeciallyTrendingCakeItem {
  _id: string;
  title: string;
  image: string;
  price: number;
  productSlug: string;
  isActive: boolean;
  sortOrder: number;
}

const SpeciallyTendingCakes = () => {
  const [speciallyTrendingCakes, setSpeciallyTrendingCakes] = useState<SpeciallyTrendingCakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Fallback data in case API fails
  const fallbackProducts = [
    {
      _id: "1",
      title: "Chocolate Fantasy Cake",
      image: "/images/aniversary.webp",
      price: 799,
      productSlug: "chocolate-fantasy-cake",
      isActive: true,
      sortOrder: 0,
    },
    {
      _id: "2",
      title: "Red Velvet Delight",
      image: "/images/birthday1.webp",
      price: 849,
      productSlug: "red-velvet-delight",
      isActive: true,
      sortOrder: 1,
    },
    {
      _id: "3",
      title: "Vanilla Supreme",
      image: "/images/engagement.webp",
      price: 749,
      productSlug: "vanilla-supreme",
      isActive: true,
      sortOrder: 2,
    },
    {
      _id: "4",
      title: "Black Forest Special",
      image: "/images/chocolate.webp",
      price: 949,
      productSlug: "black-forest-special",
      isActive: true,
      sortOrder: 3,
    },
  ];

  useEffect(() => {
    fetchSpeciallyTrendingCakes();
  }, []);

  const fetchSpeciallyTrendingCakes = async () => {
    try {
      const response = await fetch('/api/specially-trending-cakes', {cache : "no-cache"});
      const data = await response.json();
      
      if (data.success && data.data) {
        // Filter only active items and sort by sortOrder
        const activeItems = data.data
          .filter((item: SpeciallyTrendingCakeItem) => item.isActive)
          .sort((a: SpeciallyTrendingCakeItem, b: SpeciallyTrendingCakeItem) => a.sortOrder - b.sortOrder);
        
        setSpeciallyTrendingCakes(activeItems);
      } else {
        // Use fallback data
        setSpeciallyTrendingCakes(fallbackProducts);
      }
    } catch (error) {
      console.error('Error fetching specially trending cakes:', error);
      // Use fallback data on error
      setSpeciallyTrendingCakes(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };
  // Convert specially trending cake items to product format for ProductCard
  const convertToProductFormat = (cake: SpeciallyTrendingCakeItem): Product => ({
    _id: cake._id,
    name: cake.title,
    slug: cake.productSlug,
    imageUrls: [cake.image],
    price: cake.price,
    rating: 4.5, // Default rating for showcase
    reviewCount: 100, // Default review count for showcase
    isBestseller: true,
    categories: [{ name: "Featured", slug: "featured" }], // Default category for showcase
  });

  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 overflow-hidden">
        <div className="relative z-10">
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-2 md:px-6 lg:px-8">
              <h2 className="font-poppins text-2xl text-center md:text-left md:text-3xl font-semibold text-gray-800 mb-6">
                Specially Tending Cakes
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-2 md:px-6 lg:px-8">
            <h2 className="font-poppins text-center md:text-left text-2xl md:text-4xl font-bold text-gray-800 mb-6">
              Specially <span className="text-pink-600">Trending</span> Cakes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
              {speciallyTrendingCakes.map((cake) => (
                <ProductCard key={cake._id} {...convertToProductFormat(cake)} flag="bestseller" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>  );
};

export default SpeciallyTendingCakes;
