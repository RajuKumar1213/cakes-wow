"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Banner {
  _id: string;
  image: string;
  alt: string;
  href: string;
  title?: string;
  isActive: boolean;
  sortOrder: number;
}

// Default banners fallback
const defaultBanners: Banner[] = [
  {
    _id: "default-1",
    image: "/images/kid.webp",
    alt: "Jungle Cakes",
    href: "/jungle-cakes",
    isActive: true,
    sortOrder: 1,
  },
  {
    _id: "default-2",
    image: "/images/engagement1.webp",
    alt: "engagement",
    href: "/engagement-cakes",
    isActive: true,
    sortOrder: 2,
  },
  {
    _id: "default-3",
    image: "/images/aniversary5.webp",
    alt: "Anniversary Cakes",
    href: "/anniversary-cakes",
    isActive: true,
    sortOrder: 3,
  },
  {
    _id: "default-4",
    image: "/images/birthday1.webp",
    alt: "birthday",
    title: "Make Every Birthday Special",
    href: "/birthday-cakes",
    isActive: true,
    sortOrder: 4,
  },
  {
    _id: "default-5",
    image: "/images/bridetobe.webp",
    alt: "bride to be cake",
    title: "Bride to Be Cake",
    href: "/bride-to-be-cakes",
    isActive: true,
    sortOrder: 5,
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    // Check if we're on a desktop-sized screen
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Fetch banners from API with caching
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Use fetch with Next.js caching - revalidate every 1 hour (3600 seconds)
        const response = await fetch('/api/hero-banners', {
          next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setBanners(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        // Keep default banners on API failure
      }
    };

    fetchBanners();
  }, []);

  // Calculate maximum slides based on screen size
  const maxSlidesMobile = banners.length - 1;
  const maxSlidesDesktop = banners.length - 3;
  const getMaxSlides = () => (isDesktop ? maxSlidesDesktop : maxSlidesMobile);

  // Auto-slide timer
  useEffect(() => {
    if (!isMounted || banners.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxSlides = getMaxSlides();
        if (prev >= maxSlides) {
          return 0;
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isDesktop, isMounted, banners.length]);
  if (!isMounted || banners.length === 0) {
    return (
      <div className="relative w-full py-4 sm:py-8 md:max-w-7xl md:px-10 mx-auto overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="relative overflow-hidden">
            <div className="flex space-x-1 sm:space-x-3">
              {/* Skeleton loaders for carousel items */}
              <div className="w-full md:w-1/3 flex-shrink-0 px-1 sm:px-3">
                <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden shadow-lg animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
              </div>
              <div className="hidden md:block w-1/3 flex-shrink-0 px-1 sm:px-3">
                <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden shadow-lg animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
              </div>
              <div className="hidden md:block w-1/3 flex-shrink-0 px-1 sm:px-3">
                <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden shadow-lg animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton controls */}
          <div className="flex items-center justify-center mt-4 sm:mt-4 md:mt-6 space-x-2 sm:space-x-4">
            <div className="p-1.5 sm:p-2 md:p-3 rounded-full bg-gray-200 animate-pulse">
              <div className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-gray-300 rounded"></div>
            </div>

            <div className="flex space-x-1 sm:space-x-2">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-300 animate-pulse ${
                    index === 1 ? 'scale-125' : ''
                  }`}
                />
              ))}
            </div>

            <div className="p-1.5 sm:p-2 md:p-3 rounded-full bg-gray-200 animate-pulse">
              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>

        {/* Custom shimmer animation styles */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlides = getMaxSlides();
      if (prev >= maxSlides) {
        return 0;
      }
      return prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlides = getMaxSlides();
      if (prev <= 0) {
        return maxSlides;
      }
      return prev - 1;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <>
      <style jsx>{`
        @media (min-width: 768px) {
          .carousel-item {
            width: 33.333333% !important;
          }
          .carousel-container {
            transform: translateX(-${currentSlide * (100 / 3)}%) !important;
          }
        }
      `}</style>
      <div className="relative w-full py-4 sm:py-8 md:max-w-7xl md:px-10 mx-auto overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out carousel-container"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {banners.map((banner, index) => (
                <div
                  key={banner._id}
                  className="w-full flex-shrink-0 px-1 sm:px-3 carousel-item"
                >
                  <div
                    className={`relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
                    onClick={() => router.push(banner.href)}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={banner.image}
                        alt={banner.alt}
                        fill
                        className="rounded-2xl object-cover brightness-110 saturate-110 contrast-105 hover:brightness-115 hover:saturate-120 transition-all duration-300"
                        priority={index < 3}
                        sizes="(max-width: 788px) 100vw, 33vw"
                        loading={index < 3 ? "eager" : "lazy"}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+ss9ZprMyZbGOdBuPUV5uaKI= "
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center mt-4 sm:mt-4 md:mt-6 space-x-2 sm:space-x-4">
            <button
              onClick={prevSlide}
              className="p-1.5 sm:p-2 md:p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
            >
              <svg
                className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 text-gray-600"
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

            <div className="flex space-x-1 sm:space-x-2">
              {Array.from({ length: getMaxSlides() + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentSlide
                      ? "bg-red-500 scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                    }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-1.5 sm:p-2 md:p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 text-gray-600"
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
    </>
  );
};

export default HeroCarousel;
