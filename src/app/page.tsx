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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />

      {/* Hero Carousel */}
      <div className="relative">
        <HeroCarousel />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 pointer-events-none"></div>
      </div>

      {/* Featured Categories Showcase */}
      <div className="relative bg-white/60 backdrop-blur-sm">
        <CategoryShowcase />
      </div>

      {/* Quick Category Navigation */}
      <div className="relative">
        <CategorySection />
      </div>

      {/* Bestseller Products */}
      <div className="relative bg-gradient-to-r from-red-50/30 via-pink-50/20 to-orange-50/30">
        <BestSeller />
      </div>

      {/* Celebrate the Loved day */}
      <div className="relative bg-white/80 backdrop-blur-sm">
        <CelebratedLovedDay />
      </div>

      <div className="relative bg-gradient-to-r from-purple-50/30 via-pink-50/20 to-red-50/30">
        <SpeciallyTendingCakes />
      </div>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-red-50/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-pink-100/50 transform rotate-12 scale-150"></div>
        </div>
        <div className="container mx-auto px-2 md:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent text-sm font-semibold tracking-wider uppercase">Our Story</span>
            </div>
            <h2 className="font-poppins text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-red-600 bg-clip-text text-transparent mb-8">
              About Us
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-2 md:p-10 shadow-xl border border-white/20">
              <p className="font-inter text-gray-700 leading-relaxed mb-8 text-lg">
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
                className="bg-gradient-to-r from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 text-white px-10 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl group"
                onClick={() => alert("This function is coming soon!")}
              >
                <span className="flex items-center space-x-2">
                  <span>View All Products</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 px-2 bg-gradient-to-br from-gray-50 via-white to-pink-50/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-red-200 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-200 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-orange-200 rounded-full blur-2xl"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent text-sm font-semibold tracking-wider uppercase">Customer Love</span>
            </div>
            <h2 className="font-poppins text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-blue-600 bg-clip-text text-transparent mb-8">
              What our customers say about us!
            </h2>
            <div className="flex justify-center items-center space-x-6 mb-12">
              <div className="text-center">
                <div className="text-7xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-2">4.6</div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="text-left">
                <div className="text-gray-700 font-medium text-lg mb-2">
                  Based On 61,807+ Reviews And Rating
                </div>
                <div className="flex space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      4.4 ⭐
                    </span>
                    <span className="text-gray-600 text-sm">Google</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      4.1 ⭐
                    </span>
                    <span className="text-gray-600 text-sm">Facebook</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-3xl mx-auto border border-white/20 relative">
              <div className="absolute -top-4 left-8">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-3 rounded-full shadow-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-800 italic mb-6 text-xl leading-relaxed font-medium">
                "The cake was super delicious thank you. Amazing quality and taste, definitely ordering again!"
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">mariamelonipaul</p>
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
