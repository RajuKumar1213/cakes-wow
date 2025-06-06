import { useEffect, useState } from "react";
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

const BestSeller = () => {
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "/api/products?isBestseller=true&limit=8&sortBy=reviewCount&sortOrder=asc"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch bestsellers");
        }

        const data = await response.json();
        setBestsellerProducts(data.data?.products || data.products || []);
      } catch (err) {
        console.error("Error fetching bestsellers:", err);
        setError("Failed to load bestsellers");
        // Fallback to hardcoded data
        setBestsellerProducts([
          {
            _id: "1",
            name: "Chocolate Fantasy Cake",
            slug: "chocolate-fantasy-cake",
            imageUrls: ["/images/aniversary.webp"],
            price: 899,
            discountedPrice: 799,
            rating: 4.5,
            reviewCount: 124,            isBestseller: true,
            categories: [{ name: "Birthday Cakes", slug: "birthday-cakes" }],
          },
          {
            _id: "2",
            name: "Red Velvet Delight",
            slug: "red-velvet-delight",
            imageUrls: ["/images/birthday.webp"],
            price: 999,
            discountedPrice: 849,
            rating: 4.7,            reviewCount: 89,
            isBestseller: true,
            categories: [
              { name: "Anniversary Cakes", slug: "anniversary-cakes" },
            ],
          },
          {
            _id: "3",
            name: "Vanilla Supreme",
            slug: "vanilla-supreme",
            imageUrls: ["/images/engagement.webp"],
            price: 749,
            rating: 4.3,            reviewCount: 156,
            isBestseller: true,
            categories: [
              { name: "Engagement Cakes", slug: "engagement-cakes" },
            ],
          },
          {
            _id: "4",
            name: "Black Forest Special",
            slug: "black-forest-special",
            imageUrls: ["/images/chocolateloaded.webp"],
            price: 1099,
            discountedPrice: 949,
            rating: 4.8,            reviewCount: 203,
            isBestseller: true,
            categories: [{ name: "Premium Cakes", slug: "premium-cakes" }],
          },
          {
            _id: "5",
            name: "Strawberry Bliss",
            slug: "strawberry-bliss",
            imageUrls: ["/images/heart.webp"],
            price: 849,
            discountedPrice: 749,
            rating: 4.4,            reviewCount: 67,
            isBestseller: true,
            categories: [{ name: "Fruit Cakes", slug: "fruit-cakes" }],
          },
          {
            _id: "6",
            name: "Designer Theme Cake",
            slug: "designer-theme-cake",
            imageUrls: ["/images/designcake.webp"],
            price: 1299,
            discountedPrice: 1099,
            rating: 4.9,            reviewCount: 45,
            isBestseller: true,
            categories: [{ name: "Designer Cakes", slug: "designer-cakes" }],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 overflow-hidden">
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-200/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,182,193,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,192,203,0.2),transparent_50%)]"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffc0cb' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-2 md:px-6 lg:px-8">
            {" "}
            <div className="text-center sm:text-left mb-6 md:mb-8">              <h2 className="font-poppins text-2xl md:text-3xl font-semibold text-gray-800 mb-1 md:mb-2">
                Our Best Sellers
              </h2>
              {error && (
                <p className="text-sm text-red-600 mt-2">
                  {error} - Showing sample products
                </p>
              )}
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-md shadow-md animate-pulse"
                  >
                    <div className="h-36 sm:h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-2">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
                {bestsellerProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    {...product}
                    flag="bestseller"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
export default BestSeller;
