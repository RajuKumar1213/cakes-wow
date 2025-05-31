import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  image: string;
  href: string;
}

interface CategorySectionProps {
  title: string;
  categories: Category[];
}

const CategorySection = ({ title, categories }: CategorySectionProps) => {
  const router = useRouter();

  const handleCategoryClick = (href: string) => {
    router.push(href);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{title}</h2>
        </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleCategoryClick(category.href)}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 sm:mb-3 bg-white shadow-md group-hover:shadow-lg transition-shadow">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center group-hover:text-red-500 transition-colors">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
