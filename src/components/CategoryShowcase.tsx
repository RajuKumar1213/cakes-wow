import CategoryCard from './CategoryCard';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
}

interface CategoryShowcaseProps {
  title: string;
  subtitle?: string;
  categories: Category[];
  maxItems?: number;
}

const CategoryShowcase = ({ title, subtitle, categories, maxItems = 8 }: CategoryShowcaseProps) => {  const displayCategories = categories.slice(0, maxItems);
  
  // Function to get fallback image based on category name
  const getFallbackImage = (categoryName: string) => {
    const fallbackImages = [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&q=80', // Cake
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&q=80', // Pastry
      'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=300&fit=crop&q=80', // Cupcake
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&q=80', // Cookies
    ];
    
    // Use category name to consistently select the same image for the same category
    const hash = categoryName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return fallbackImages[hash % fallbackImages.length];
  };
  
  const formatCategoriesForCard = (category: Category) => ({
    id: category._id,
    name: category.name,
    image: category.imageUrl || getFallbackImage(category.name),
    href: `/${category.slug}`,
    description: category.description || `Delicious ${category.name.toLowerCase()} made with premium ingredients and lots of love.`,
    ...(category.productCount && { productCount: category.productCount })
  });
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>
          )}
        </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto justify-items-center">
          {displayCategories.map((category) => {
            const cardProps = formatCategoriesForCard(category);
            return (
              <CategoryCard
                key={cardProps.id}
                {...cardProps}
              />
            );
          })}
        </div>
        
        {categories.length > maxItems && (
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              View All Categories
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryShowcase;
