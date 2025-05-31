"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

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

interface HeroCarouselProps {
  categories?: Category[];
}

const HeroCarousel = ({ categories = [] }: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Check if we're on mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fallback banners if no categories provided
  const fallbackBanners = [
    {
      id: "1",
      image: "https://cdn.pixabay.com/photo/2017/01/11/11/33/cake-1971552_1280.jpg",
      alt: "Designer Cakes",
      title: "Designer Cakes",
      subtitle: "Celebrate in Style",
      bgColor: "bg-gradient-to-r from-pink-400 to-purple-500",
      href: "/products"
    },
    {
      id: "2",
      image: "https://plus.unsplash.com/premium_photo-1713447395823-2e0b40b75a89?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D",
      alt: "Chocolate Cakes",
      title: "Chocolate Cakes",
      subtitle: "Rich & Delicious",
      bgColor: "bg-gradient-to-r from-orange-400 to-yellow-500",
      href: "/products"
    }
  ];

  // Create banners from categories or use fallback
  const banners = categories.length > 0 
    ? categories.slice(0, 6).map((category) => ({
        id: category._id,
        image: category.imageUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=60",
        alt: category.name,
        title: category.name,
        subtitle: category.description || `Explore ${category.name}`,
        bgColor: "bg-gradient-to-r from-pink-400 to-purple-500",
        href: `/${category.slug}`
      }))
    : fallbackBanners;

  // Calculate maximum slides based on screen size
  const maxSlides = isMobile ? banners.length - 1 : banners.length - 3;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev >= maxSlides) {
          return 0; // Reset to beginning
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [maxSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      if (prev >= maxSlides) {
        return 0; // Reset to beginning
      }
      return prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (prev <= 0) {
        return maxSlides; // Go to end
      }
      return prev - 1;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };
  return (
    <div className="relative w-full py-4 sm:py-8 md:max-w-7xl mx-auto overflow-hidden">
      <div className="container mx-auto px-1 sm:px-2 md:px-4 lg:px-8">
        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          {" "}
          {/* Sliding Container */}
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${
                currentSlide * (isMobile ? 100 : 100 / 3)
              }%)`,
            }}
          >
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`${
                  isMobile ? "w-full" : "w-1/3"
                } flex-shrink-0 px-1 sm:px-3`}
              >                <div
                  className={`relative h-64 sm:h-48 md:h-64 lg:h-80 rounded-lg sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${banner.bgColor}`}
                  onClick={() => router.push(banner.href)}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={banner.image}
                      alt={banner.alt}
                      fill
                      className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-2 sm:p-4 md:p-6">
                    <h3 className="text-2xl sm:text-lg md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 transform group-hover:scale-105 transition-transform duration-300">
                      {banner.title}
                    </h3>
                    <p className="text-sm sm:text-sm md:text-base lg:text-lg opacity-90 transform group-hover:translate-y-1 transition-transform duration-300">
                      {banner.subtitle}
                    </p>

                    {/* Shop Now Button */}
                    <button className="mt-2 sm:mt-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 rounded-full text-xs sm:text-sm font-medium transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>{" "}
        {/* Navigation */}
        <div className="flex items-center justify-center mt-4 sm:mt-6 md:mt-8 space-x-2 sm:space-x-4">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="p-1.5 sm:p-2 md:p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex space-x-1 sm:space-x-2">
            {Array.from({ length: maxSlides + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-red-500 scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="p-1.5 sm:p-2 md:p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
