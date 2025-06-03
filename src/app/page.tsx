"use client";
import {
  Header,
  HeroCarousel,
  CategoryShowcase,
  Footer,
  ProductCard,
  BestSeller,
  CelebratedLovedDay,
  SpeciallyTendingCakes,
} from "@/components";
import CategorySection from "@/components/CategorySection";
import { useEffect } from "react";

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
  isBestseller: boolean;
  isFeatured: boolean;
  discountPercentage: number;
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

// Hardcoded products data for faster loading
const featuredProducts: Product[] = [
  {
    _id: "1",
    name: "Chocolate Truffle Cake",
    slug: "chocolate-truffle-cake",
    imageUrls: ["/images/chocolateloaded.jpg"],
    price: 849,
    discountedPrice: 679,
    finalPrice: 679,
    rating: 4.5,
    reviewCount: 156,
    shortDescription: "Rich chocolate cake with truffle frosting",
    isBestseller: true,
    isFeatured: true,
    discountPercentage: 20,
    categories: [{ name: "Chocolate Cakes", slug: "chocolate-cakes" }],
  },
  {
    _id: "2",
    name: "Anniversary Special Cake",
    slug: "anniversary-special-cake",
    imageUrls: ["/images/aniversary-2.jpg"],
    price: 949,
    discountedPrice: 759,
    finalPrice: 759,
    rating: 4.7,
    reviewCount: 203,
    shortDescription: "Perfect anniversary celebration cake",
    isBestseller: true,
    isFeatured: true,
    discountPercentage: 20,
    categories: [{ name: "Anniversary Cakes", slug: "anniversary-cakes" }],
  },
  {
    _id: "3",
    name: "Heart Shaped Love Cake",
    slug: "heart-shaped-love-cake",
    imageUrls: ["/images/heart.jpg"],
    price: 899,
    discountedPrice: 719,
    finalPrice: 719,
    rating: 4.6,
    reviewCount: 189,
    shortDescription: "Express your love with this beautiful heart cake",
    isBestseller: false,
    isFeatured: true,
    discountPercentage: 20,
    categories: [{ name: "Heart Shaped", slug: "heart-shaped" }],
  },
  {
    _id: "4",
    name: "Birthday Celebration Cake",
    slug: "birthday-celebration-cake",
    imageUrls: ["/images/birthday.jpg"],
    price: 799,
    discountedPrice: 639,
    finalPrice: 639,
    rating: 4.4,
    reviewCount: 142,
    shortDescription: "Make birthdays extra special",
    isBestseller: true,
    isFeatured: true,
    discountPercentage: 20,
    categories: [{ name: "Birthday Cakes", slug: "birthday-cakes" }],
  },
  {
    _id: "5",
    name: "Jungle Theme Kids Cake",
    slug: "jungle-theme-kids-cake",
    imageUrls: ["/images/jungle.png"],
    price: 1099,
    discountedPrice: 879,
    finalPrice: 879,
    rating: 4.8,
    reviewCount: 224,
    shortDescription: "Adventure awaits with this jungle themed cake",
    isBestseller: true,
    isFeatured: true,
    discountPercentage: 20,
    categories: [{ name: "Kids Special", slug: "kids-special" }],
  },
  {
    _id: "6",
    name: "Engagement Bliss Cake",
    slug: "engagement-bliss-cake",
    imageUrls: ["/images/engagement.png"],
    price: 1199,
    discountedPrice: 959,
    finalPrice: 959,
    rating: 4.9,
    reviewCount: 167,
    shortDescription: "Celebrate your engagement in style",
    isBestseller: false,
    isFeatured: true,
    discountPercentage: 20,
    categories: [{ name: "Engagement Cakes", slug: "engagement-cakes" }],
  },
  {
    _id: "7",
    name: "Designer Special Cake",
    slug: "designer-special-cake",
    imageUrls: ["/images/designcake.png"],
    price: 1399,
    discountedPrice: 1119,
    finalPrice: 1119,
    rating: 4.7,
    reviewCount: 198,
    shortDescription: "Unique designer cake for special occasions",
    isBestseller: true,
    isFeatured: true,
    discountPercentage: 20,
    categories: [{ name: "Designer Cakes", slug: "designer-cakes" }],
  },
  {
    _id: "8",
    name: "Anniversary Celebration",
    slug: "anniversary-celebration",
    imageUrls: ["/images/annversary.webp"],
    price: 999,
    discountedPrice: 799,
    finalPrice: 799,
    rating: 4.5,
    reviewCount: 156,
    shortDescription: "Celebrate years of togetherness",
    isBestseller: false,
    isFeatured: true,
    discountPercentage: 20,
    categories: [{ name: "Anniversary Cakes", slug: "anniversary-cakes" }],
  },
];

const bestsellerProducts = featuredProducts.filter((p) => p.isBestseller);

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Featured Categories Showcase */}

      <CategoryShowcase />

      {/* Featured Products */}
      {/* {featuredProducts.length > 0 && (
        <div className="bg-white">
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-2">
                  Featured Products
                </h2>
                <p className="text-sm md:text-base text-gray-600">Handpicked favorites that our customers love the most</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} {...product} />
                ))}
              </div>
              <div className="text-center">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                  onClick={() => alert("This function is coming soon!")}
                >
                  View All
                </button>
              </div>
            </div>
          </section>
        </div>
      )} */}

      {/* Quick Category Navigation */}
      <CategorySection />

      {/* Bestseller Products */}

      <BestSeller />

      {/* Celeberate the Loved day */}
      <CelebratedLovedDay />

      <SpeciallyTendingCakes />

      {/* 
      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              About us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Bakingo is an FSSAI-certified bakery where every dessert tells a
              story! Our bakery came to light intending to make your remarkable
              occasions even sweeter and more memorable. We bake perfection with
              quality ingredients into impeccable cakes, pastries, brownies,
              cupcakes, and much more. We specialise in delivering exuberant
              smiles to our customers in around 30 cities across India,
              including Delhi, Mumbai, Bengaluru, Hyderabad, Ahmedabad, Chennai,
              Kolkata, Pune, and so forth. Bakingo is a haven for dessert lovers
              who want to indulge in scrumptious treats and fill their
              celebrations with cherished memories.
            </p>
            <button
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => alert("This function is coming soon!")}
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What our customers say about us!
            </h2>
            <div className="flex justify-center items-center space-x-4 mb-8">
              <div className="text-6xl font-bold text-red-500">4.6</div>
              <div>
                <div className="text-gray-600">
                  Based On 61807+ Reviews And Rating
                </div>
                <div className="flex space-x-2 mt-2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                    4.4
                  </span>
                  <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    4.1
                  </span>
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
