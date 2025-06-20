import ProductCard from "./ProductCard";
import useSWR from "swr";

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

const fetcher = (...args: [input: RequestInfo, init?: RequestInit]) => fetch(...args).then(res => res.json())

export default function BestSeller() {
  const {data, error, isLoading} = useSWR('/api/products?isBestseller=true&limit=8&sortBy=reviewCount&sortOrder=asc', fetcher);

  return (
    <div className="relative overflow-hidden py-10">
      {/* Glowing background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100 opacity-10 rounded-full"></div>
        <svg className="absolute bottom-0 right-0" width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200Z" fill="url(#paint0_radial_101_2)" fillOpacity="0.05"/>
          <defs>
            <radialGradient id="paint0_radial_101_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) rotate(90) scale(100)">
              <stop stopColor="#F472B6"/>
              <stop offset="1" stopColor="#FB7185" stopOpacity="0"/>
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-2 md:px-6 lg:px-8">
            <div className="text-center sm:text-left mb-6 md:mb-8">
              <h2 className="font-poppins text-2xl md:text-3xl font-semibold text-gray-800 mb-1 md:mb-2">
                Our Best Sellers
              </h2>
              <p className="text-sm text-gray-600">Products loved by thousands</p>
              {error && (
                <p className="text-sm text-red-600 mt-2">
                  {error} - Showing sample products
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
              {data && data.data.products && data.data.products.map((product: Product) => (
                <ProductCard key={product._id} {...product} flag="bestseller" />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Add these styles for the animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}