import { useState, useEffect } from "react";
import CategoryCard from "./CategoryCard";



interface CelebrateLoveDayItem {
  _id: string;
  name: string;
  slug: string;
  image: string;
  productCount?: number;
  isActive: boolean;
  sortOrder: number;
}


const CelebrateLovedDay = () => {
  const [celebrateLoveDays, setCelebrateLoveDays] = useState<CelebrateLoveDayItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback data in case API fails
  const fallbackCategories = [
    {
      _id: "1",
      name: "Anniversary Special",
      slug: "all-anniversary-cakes",
      image: "/images/aniversary.webp",
      productCount: 25,
      isActive: true,
      sortOrder: 0,
    },
    {
      _id: "2",
      name: "Anniversary Elegance",
      slug: "anniversary-elegance",
      image: "/images/aniversary2.webp",
      productCount: 18,
      isActive: true,
      sortOrder: 1,
    },
    {
      _id: "3",
      name: "Anniversary Celebration",
      slug: "anniversary-celebration",
      image: "/images/aniversary3.webp",
      productCount: 22,
      isActive: true,
      sortOrder: 2,
    },
    {
      _id: "4",
      name: "Anniversary Memories",
      slug: "anniversary-memories",
      image: "/images/aniversary4.webp",
      productCount: 15,
      isActive: true,
      sortOrder: 3,
    },
  ];

  useEffect(() => {
    fetchCelebrateLoveDays();
  }, []);

  const fetchCelebrateLoveDays = async () => {
    try {
      const response = await fetch('/api/celebrate-love-days', {
        cache: "no-cache"
      });
      const data = await response.json();

      if (data.success && data.data) {
        // Filter only active items and sort by sortOrder
        const activeItems = data.data
          .filter((item: CelebrateLoveDayItem) => item.isActive)
          .sort((a: CelebrateLoveDayItem, b: CelebrateLoveDayItem) => a.sortOrder - b.sortOrder);

        setCelebrateLoveDays(activeItems);
      } else {
        // Use fallback data
        setCelebrateLoveDays(fallbackCategories);
      }
    } catch (error) {
      console.error('Error fetching celebrate love days:', error);
      // Use fallback data
      setCelebrateLoveDays(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  const formatCategoriesForCard = (category: CelebrateLoveDayItem) => ({
    id: category._id,
    name: category.name,
    image: category.image,
    href: `/${category.slug}`,
    ...(category.productCount && { productCount: category.productCount }),
  });

  if (loading) {
    return (
      <div className="relative bg-gradient-to-br overflow-hidden">
        <div className="relative z-10">
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-2 md:px-6 lg:px-8">
              <h2 className="font-poppins text-2xl md:text-left md:text-3xl font-semibold text-gray-800 mb-6 text-center">
                Celebrate the Loved Day
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br  overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-2 md:px-6 lg:px-8">
            <h2 className="font-poppins text-center md:text-left text-2xl md:text-4xl font-bold text-gray-800 mb-6">
              Celebrate the <span className="text-pink-600">Loved</span> Day
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
              {celebrateLoveDays.map((category) => {
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
