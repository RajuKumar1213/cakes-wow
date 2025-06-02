import Image from "next/image";
import { useRouter } from "next/navigation";

const CategorySection = () => {
  const router = useRouter();

  // Hardcoded categories array
  const categories = [
    {
      id: "1",
      name: "Mango",
      slug: "mango-cakes",
      image: "/images/heart.jpg",
      href: "/mango-cakes",
    },
    {
      id: "2",
      name: "Chocolate",
      slug: "chocolate-cakes",
      image: "/images/chocolate.jpg",
      href: "/chocolate-cakes",
    },
    {
      id: "3",
      name: "Rasmali",
      slug: "rasmali-cakes",
      image: "/images/kid1.png",
      href: "/rasmali-cakes",
    },
    {
      id: "4",
      name: "Red Velvet",
      slug: "red-velvet-cakes",
      image: "/images/red-velvet.jpg",
      href: "/red-velvet-cakes",
    },
    {
      id: "5",
      name: "Blackforest",
      slug: "blackforest-cakes",
      image: "/images/blackforest.jpg",
      href: "/blackforest-cakes",
    },
    {
      id: "6",
      name: "Pineapple",
      slug: "pineapple-cakes",
      image: "/images/pineapple.jpg",
      href: "/pineapple-cakes",
    },
    {
      id: "7",
      name: "Butterscotch",
      slug: "butterscotch-cakes",
      image: "/images/butterscotch.jpg",
      href: "/butterscotch-cakes",
    },
    {
      id: "8",
      name: "Kit Kat",
      slug: "kit-kat-cakes",
      image: "/images/kit-kat.jpg",
      href: "/kit-kat-cakes",
    },
  ];

  const handleCategoryClick = (href: string) => {
    router.push(href);
  };

  return (
    <section className="py-12 bg-gray-50 md:px-10 px-4">
      <div className="container mx-auto ">
        <div className=" mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Experience Flavour
          </h2>
        </div>{" "}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6 px-4 md:px-0">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative h-16 rounded-lg overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300"
              onClick={() => handleCategoryClick(category.href)}
            >
              {/* Background Image */}
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-opacity-30 transition-all duration-300"></div>

              {/* Text Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-md sm:text-md font-semibold text-center px-2 transform group-hover:scale-105 transition-transform duration-300">
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
