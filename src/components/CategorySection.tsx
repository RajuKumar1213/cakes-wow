"use client";

import { useRouter } from "next/navigation";

const CategorySection = () => {
  const router = useRouter();

  // Hardcoded categories array
  const categories = [
    {
      id: "1",
      name: "Mango",
      slug: "mango-cakes",
      // image: "/images/mango.webp",
      href: "/mango",
    },
    {
      id: "2",
      name: "Chocolate",
      slug: "chocolate-cakes",
      // image: "/images/chocolate.webp",
      href: "/chocolate-loaded-cakes",
    },
    {
      id: "3",
      name: "Rasmali",
      slug: "rasmali-cakes",
      // image: "/images/aniversary.webp",
      href: "/rasmalai",
    },
    {
      id: "4",
      name: "Red Velvet",
      slug: "red-velvet-cakes",
      // image: "/images/aniversary2.webp",
      href: "/red-velvet",
    },
    {
      id: "5",
      name: "Blackforest",
      slug: "blackforest-cakes",
      // image: "/images/designcake.webp",
      href: "/black-forest",
    },
    {
      id: "6",
      name: "Pineapple",
      slug: "pineapple-cakes",
      // image: "/images/engagement.webp",
      href: "/pine-apple",
    },
  ];

  const handleCategoryClick = (href: string) => {
    router.push(href);
  };

  return (
    <section className="pt-16 pb-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center sm:text-left mb-8">          
           <h2 className="font-poppins text-center md:text-left text-2xl md:text-4xl font-bold text-gray-800 mb-4">
              Experience <span className="text-pink-600">Flavour</span>
            </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative h-16 border border-gray-300 rounded-lg overflow-hidden cursor-pointer group shadow-md  transition-all duration-300"
              onClick={() => handleCategoryClick(category.href)}
            >
              {/* Background Image */}
              {/* <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                priority={index < 6}
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16.67vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              /> */}

              {/* Overlay */}
              <div className="absolute inset-0  transition-all duration-300"></div>

              {/* Text Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-black text-sm sm:text-base font-semibold text-center px-2 transform group-hover:scale-105 transition-transform duration-300">
                  {category.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
