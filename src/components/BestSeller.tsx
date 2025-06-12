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

// Cache mechanism
// const CACHE_KEY = "bestseller-products";
// const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// function getCachedData() {
//   if (typeof window === 'undefined') return null;
  
//   try {
//     const cachedData = localStorage.getItem(CACHE_KEY);
//     if (!cachedData) return null;
    
//     const { data, timestamp } = JSON.parse(cachedData);
//     if (Date.now() - timestamp < CACHE_DURATION) {
//       return data;
//     }
//   } catch (err) {
//     console.error("Error reading cache:", err);
//   }
  
//   return null;
// }

// function setCachedData(data: any) {
//   if (typeof window === 'undefined') return;
  
//   try {
//     localStorage.setItem(
//       CACHE_KEY,
//       JSON.stringify({
//         data,
//         timestamp: Date.now(),
//       })
//     );
//   } catch (err) {
//     console.error("Error setting cache:", err);
//   }
// }

export default function BestSeller() {


  const {data, error, isLoading} = useSWR('/api/products?isBestseller=true&limit=8&sortBy=reviewCount&sortOrder=asc', fetcher);

  console.log(data?.data?.products);



  return (
    <div className="relative bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 overflow-hidden">
      {/* Background and gradient code here… */}
      <div className="relative z-10">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-2 md:px-6 lg:px-8">
            <div className="text-center sm:text-left mb-6 md:mb-8">
              <h2 className="font-poppins text-2xl md:text-3xl font-semibold text-gray-800 mb-1 md:mb-2">
                Our Best Sellers
              </h2>
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
    </div>
  );
}
