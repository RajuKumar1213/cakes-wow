import { useState } from "react";
import ProductCard from "./ProductCard";
import CategoryCard from "./CategoryCard";

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

const CelebrateLovedDay = () => {
  const categories = [
    {
      id: "1",
      slug: "all-anniversary-cakes",
      image: "/images/aniversary.webp",
      productCount: 25,
    },
    {
      id: "2",
      slug: "all-anniversary-cakes",
      image: "/images/aniversary2.webp",
    },
    {
      id: "3",
      slug: "all-anniversary-cakes",
      image: "/images/aniversary3.webp",
    },
    {
      id: "4",
      slug: "all-anniversary-cakes",
      image: "/images/aniversary4.webp",
    },
  ];

  const formatCategoriesForCard = (category: any) => ({
    id: category.id,
    name: category.name,
    image: category.image,
    href: `/${category.slug}`,
    description: category.description,
    ...(category.productCount && { productCount: category.productCount }),
  });

  return (
    <div className="relative bg-gradient-to-br  overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-2 md:px-6 lg:px-8">            
            <h2 className="font-poppins text-2xl md:text-left md:text-3xl font-semibold text-gray-800 mb-6 text-center">
            Celebrate the Loved Day
          </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
              {categories.map((category) => {
                const cardProps = formatCategoriesForCard(category);
                return <CategoryCard hideTitle={true} key={cardProps.id} {...cardProps} />;
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CelebrateLovedDay;
