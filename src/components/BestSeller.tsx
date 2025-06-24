
"use client"

import { useEffect, useState } from "react";
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
  const [data , setData ] = useState([])
  // const { data, error, isLoading } = useSWR(
  //   '/api/products?isBestseller=true&sortBy=bestsellerOrder&sortOrder=asc',
  // );

  //  fetch(`/api/products?isBestseller=true&sortBy=bestsellerOrder&sortOrder=asc&_=${Date.now()}`, )

    const fetchBestsellers = async () => {
    try {
      const url = `/api/products?isBestseller=true&sortBy=bestsellerOrder&sortOrder=asc&limit=12&_=${Date.now()}`;

      const res = await fetch(url, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (data.success && data.data?.products) {
        setData(data.data.products);
      } 

    } catch (error) {
      console.error("❌ Failed to fetch bestsellers:", error);
    } 
  };

  useEffect(()=> {
    fetchBestsellers()
  }, [])


  return (
    <div className="relative overflow-hidden  bg-pink-50">
      {/* Enhanced pink glowing background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Pink decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200 opacity-20 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-200 opacity-20 rounded-full"></div>
        <svg className="absolute bottom-0 right-0 opacity-20" width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200Z" fill="url(#paint0_radial_101_2)" fillOpacity="0.1" />
          <defs>
            <radialGradient id="paint0_radial_101_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) rotate(90) scale(100)">
              <stop stopColor="#EC4899" />
              <stop offset="1" stopColor="#F472B6" stopOpacity="0.8" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Content with pink accent elements */}
      <div className="relative z-10">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-2 md:px-6 lg:px-8">
            <div className="text-center sm:text-left mb-6 md:mb-8">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-pink-100 mb-3">
                <span className="w-2 h-2 mr-2 rounded-full bg-pink-500 animate-pulse"></span>
                <span className="text-sm font-medium text-pink-700">Trending Now</span>
              </div>
              <h2 className="font-poppins text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-3">
                Our <span className="text-pink-600">Best</span> Sellers
              </h2>
              <p className="text-pink-700/80 max-w-lg">Discover the products everyone is loving right now</p>
              {/* {error && (
                <p className="text-sm text-red-600 mt-2">
                  {error} - Showing sample products
                </p>
              )} */}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {data && data.map((product: Product) => (
                <ProductCard
                  key={product._id}
                  {...product}
                  flag="bestseller"

                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Animation styles */}
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