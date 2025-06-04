import { useState } from "react";
import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  name: string;
  slug: string;
  imageUrls: string[];
  price: number;
  discountedPrice?: number;  rating: number;
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

const SpeciallyTendingCakes = () => {
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([
    {
      _id: "1",
      name: "Chocolate Fantasy Cake",
      slug: "chocolate-fantasy-cake",
      imageUrls: ["/images/aniversary.webp"],
      price: 899,
      discountedPrice: 799,      rating: 4.5,
      reviewCount: 124,
      isBestseller: true,
      categories: [{ name: "Birthday Cakes", slug: "birthday-cakes" }],
    },
    {
      _id: "2",
      name: "Red Velvet Delight",
      slug: "red-velvet-delight",
      imageUrls: ["/images/birthday.webp"],
      price: 999,
      discountedPrice: 849,      rating: 4.7,
      reviewCount: 89,
      isBestseller: true,
      categories: [{ name: "Anniversary Cakes", slug: "anniversary-cakes" }],
    },
    {
      _id: "3",
      name: "Vanilla Supreme",
      slug: "vanilla-supreme",
      imageUrls: ["/images/engagement.webp"],
      price: 749,      rating: 4.3,
      reviewCount: 156,
      isBestseller: true,
      categories: [{ name: "Engagement Cakes", slug: "engagement-cakes" }],
    },
    {
      _id: "4",
      name: "Black Forest Special",
      slug: "black-forest-special",
      imageUrls: ["/images/chocolateloaded.webp"],
      price: 1099,
      discountedPrice: 949,      rating: 4.8,
      reviewCount: 203,
      isBestseller: true,
      categories: [{ name: "Premium Cakes", slug: "premium-cakes" }],
    },
  ]);

  return (
    <div className="relative bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100  overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-2 md:px-6 lg:px-8">            <h2 className="font-poppins text-2xl text-center md:text-left md:text-3xl font-semibold text-gray-800 mb-6">
              Specially Tending Cakes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
              {bestsellerProducts.map((product) => (
                <ProductCard key={product._id} {...product} flag="bestseller" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SpeciallyTendingCakes;
