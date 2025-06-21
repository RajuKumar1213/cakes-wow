"use client";

import { useState, useEffect } from "react";
import CategoryCard from "./CategoryCard";

interface CategoryShowcaseItem {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  productCount?: number;
  isActive: boolean;
  sortOrder: number;
}

const CategoryShowcase = () => {
  const [categories, setCategories] = useState<CategoryShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Default categories fallback
  const defaultCategories = [
    {
      _id: "default-1",
      name: "Chocolate Loaded Cakes",
      slug: "chocolate-loaded-cakes",
      image: "/images/chocolate.webp",
      productCount: 25,
      isActive: true,
      sortOrder: 1,
    },
    {
      _id: "default-2",
      name: "Gourmet Cakes",
      slug: "gourment-cakes",
      image: "/images/gourmet.webp",
      isActive: true,
      sortOrder: 2,
    },
    {
      _id: "default-3",
      name: "Photo Cakes",
      slug: "photo-print-cakes",
      image: "/images/photo.webp",
      isActive: true,
      sortOrder: 3,
    },
    {
      _id: "default-4",
      name: "Design Cakes",
      slug: "design-cakes",
      image: "/images/designcake.webp",
      isActive: true,
      sortOrder: 4,
    },
  ];

  useEffect(() => {
    // Show default categories immediately
    setCategories(defaultCategories);
    setLoading(false);

    // Fetch from API in background
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Use fetch with Next.js caching - revalidate every 1 hour (3600 seconds)
      const response = await fetch('/api/category-showcases', {
        // next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching category showcases:', error);
      // Keep default categories on error
    }
  };

  const formatCategoriesForCard = (category: CategoryShowcaseItem) => ({
    id: category._id,
    name: category.name,
    image: category.image,
    href: `/${category.slug}`,
    description: category.description,
    ...(category.productCount && { productCount: category.productCount }),
  });

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-2 md:px-6 lg:px-8">
          <div className="text-center sm:text-left mb-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto justify-items-center">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="w-full">
                <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse mb-3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-2 md:px-6 lg:px-8">
        <div className="text-center sm:text-left mb-6">
          <h2 className="font-poppins text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-3">
            Wow them with <span className="text-pink-600">Every</span> Slice
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto justify-items-center">
          {categories.map((category) => {
            const cardProps = formatCategoriesForCard(category);
            return <CategoryCard key={cardProps.id} {...cardProps} />;
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
