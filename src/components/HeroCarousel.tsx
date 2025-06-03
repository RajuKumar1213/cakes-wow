"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);

    // Check if we're on a desktop-sized screen
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    // Initialize on mount
    checkScreenSize();

    // Update on resize
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Hardcoded banners array
  const banners = [
    {
      id: "1",
      image: "/images/jungle2.webp",
      alt: "Jungle Cakes",
      // title: "Every Kid Deserves a Cake that Wows!",
      bgColor: "bg-gradient-to-r from-pink-400 to-purple-500",
      href: "/jungle-cakes",
    },
    {
      id: "2",
      image: "/images/aniversary4.webp",
      alt: "engagement",
      // title: "Engaged in Love Celeberated in Cake",
      bgColor: "bg-gradient-to-r from-orange-400 to-yellow-500",
      href: "/engagement-cakes",
    },
    {
      id: "3",
      image: "/images/sweetmomories.webp",
      alt: "Anniversary Cakes",
      // title: "Anniversary Cakes",
      bgColor: "bg-gradient-to-r from-blue-400 to-indigo-500",
      href: "/anniversary-cakes",
    },
    {
      id: "4",
      image: "/images/birthday.webp",
      alt: "birthday",
      title: "Make Every Birthday Special",
      bgColor: "bg-gradient-to-r from-rose-400 to-pink-500",
      href: "/birthday-cakes",
    },
    {
      id: "5",
      image: "/images/bridetobecake.webp",
      alt: "Cupcakes",
      title: "Cupcakes",
      bgColor: "bg-gradient-to-r from-green-400 to-teal-500",
      href: "/products",
    },
  ];
  // Calculate maximum slides based on screen size
  // On mobile: show 1 card at a time (5 total slides)
  // On desktop: show 3 cards at a time (3 total slides since we have 5 cards)
  const maxSlidesMobile = banners.length - 1; // 4 (0-4)
  const maxSlidesDesktop = banners.length - 3; // 2 (0-2)

  // Get current maximum slides based on screen size
  const getMaxSlides = () => (isDesktop ? maxSlidesDesktop : maxSlidesMobile);

  useEffect(() => {
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
  }, [isDesktop]); // Only depend on isDesktop since the other values are derived

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

  // Touch handlers for swipe functionality
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
      <div className="relative w-full py-4 sm:py-8 md:max-w-7xl mx-auto overflow-hidden">
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
                  key={banner.id}
                  className="w-full flex-shrink-0 px-1 sm:px-3 carousel-item"
                >
                  <div
                    className={`relative h-[400px] md:h-[340px]  rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${banner.bgColor}`}
                    onClick={() => router.push(banner.href)}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={banner.image}
                        alt={banner.alt}
                        fill
                        className=" rounded-2xl opacity-80 "
                        priority={index < 4}
                        sizes="(max-width: 788px) 100vw, 33vw"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      />
                    </div>
                    {/* <div className="absolute inset-0 bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-2 sm:p-4 md:p-6">
                      {" "}
                      <h3 className="font-poppins text-2xl sm:text-lg md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 transform group-hover:scale-105 transition-transform duration-300">
                        {banner.title}
                      </h3>
                      <button className="mt-2 sm:mt-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 rounded-full text-xs sm:text-sm font-medium transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        Shop Now
                      </button>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center mt-4 sm:mt-6 md:mt-8 space-x-2 sm:space-x-4">
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

            <div className="flex space-x-1 sm:space-x-2">
              {Array.from({ length: getMaxSlides() + 1 }).map((_, index) => (
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
    </>
  );
};

export default HeroCarousel;
