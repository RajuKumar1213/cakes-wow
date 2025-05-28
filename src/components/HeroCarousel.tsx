'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Bakingo-style banner boxes with working images
  const banners = [
    {
      id: 1,
      image: 'https://cdn.pixabay.com/photo/2017/01/11/11/33/cake-1971552_1280.jpg',
      alt: 'Designer Cakes',
      title: 'Designer Cakes',
      subtitle: 'Celebrate in Style',
      bgColor: 'bg-gradient-to-r from-pink-400 to-purple-500'
    },
    {
      id: 2,
      image: 'https://plus.unsplash.com/premium_photo-1713447395823-2e0b40b75a89?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D',
      alt: 'Chocolate Cakes',
      title: 'Chocolate Cakes',
      subtitle: 'Rich & Delicious',
      bgColor: 'bg-gradient-to-r from-orange-400 to-yellow-500'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1508737804141-4c3b688e2546?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2FrZXxlbnwwfHwwfHx8MA%3D%3D',
      alt: 'Anniversary Cakes',
      title: 'Anniversary Cakes',
      subtitle: 'Make Memories Sweet',
      bgColor: 'bg-gradient-to-r from-red-400 to-pink-500'
    },
    {
      id: 4,
      image: 'https://cdn.pixabay.com/photo/2017/05/01/05/18/pastry-2274750_1280.jpg',
      alt: 'Birthday Cakes',
      title: 'Birthday Cakes',
      subtitle: 'Celebrate Every Moment',
      bgColor: 'bg-gradient-to-r from-blue-400 to-indigo-500'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNha2V8ZW58MHx8MHx8fDA%3D',
      alt: 'Photo Cakes',
      title: 'Photo Cakes',
      subtitle: 'Personalized Just for You',
      bgColor: 'bg-gradient-to-r from-green-400 to-blue-500'
    },
    {
      id: 6,
      image: 'https://cdn.pixabay.com/photo/2016/03/27/22/38/cake-1284548_1280.jpg',
      alt: 'Gourmet Cakes',
      title: 'Gourmet Cakes',
      subtitle: 'Premium Quality',
      bgColor: 'bg-gradient-to-r from-purple-400 to-pink-500'
    },
  ];
  
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
  };  return (
    <div className="relative w-full py-4 sm:py-8 md:max-w-7xl mx-auto overflow-hidden">
      <div className="container mx-auto px-1 sm:px-2 md:px-4 lg:px-8">
        {/* Carousel Container */}
        <div className="relative overflow-hidden">          {/* Sliding Container */}
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * (isMobile ? 100 : 100 / 3)}%)` }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className={`${isMobile ? 'w-full' : 'w-1/3'} flex-shrink-0 px-1 sm:px-3`}>
                <div 
                  className={`relative h-64 sm:h-48 md:h-64 lg:h-80 rounded-lg sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${banner.bgColor}`}
                  onClick={() => alert('This function is coming soon!')}
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
                    <h3 className="text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 transform group-hover:scale-105 transition-transform duration-300">
                      {banner.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-90 transform group-hover:translate-y-1 transition-transform duration-300">
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
        </div>        {/* Navigation */}
        <div className="flex items-center justify-center mt-4 sm:mt-6 md:mt-8 space-x-2 sm:space-x-4">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="p-1.5 sm:p-2 md:p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
                    ? 'bg-red-500 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="p-1.5 sm:p-2 md:p-3 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
