import CategoryCard from './CategoryCard';

const CategoryShowcase = () => {
  // Hardcoded categories data
  const categories = [
    {
      id: "1",
      name: "Chocolate Loaded Cakes",
      slug: "chocolate-loaded-cakes",
      image: "/images/chocolateloaded.webp",
      productCount: 25
    },
    {
      id: "2", 
      name: "Gourmet Cakes",
      slug: "gourmet-cakes",

      image: "/images/aniversary2.webp",
    },
    {
      id: "3",
      name: "Photo Cakes",
      slug: "photo-cakes",
      image: "/images/birthday.webp",
    },
    {
      id: "4",
      name: "Design Cakes",
      slug: "design-cakes",
      image: "/images/designcake.webp",
    },

  ];


    
  const formatCategoriesForCard = (category: any) => ({
    id: category.id,
    name: category.name,
    image: category.image,
    href: `/${category.slug}`,
    description: category.description,
    ...(category.productCount && { productCount: category.productCount })
  });
  return (    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center sm:text-left mb-6">
          <h2 className="text-3xl md:text-3xl font-semibold text-gray-800 mb-4">WOW Them with Every Slice!</h2>
          
        </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto justify-items-center">
          {categories.map((category) => {
            const cardProps = formatCategoriesForCard(category);
            return (
              <CategoryCard
                key={cardProps.id}
                {...cardProps}
              />
            );
          })}
        </div>
        
      
      </div>
    </section>
  );
};

export default CategoryShowcase;
