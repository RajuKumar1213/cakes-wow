import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CategoryCardProps {
  id: string;
  name: string;
  image: string;
  href: string;
  description?: string;
  productCount?: number;
}

const CategoryCard = ({ id, name, image, href }: CategoryCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div
      className="group cursor-pointer bg-white rounded-md shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100/50 w-full max-w-xs mx-auto"
      onClick={handleClick}
    >
      {/* Image Section with optimized aspect ratio */}
      <div className="relative h-36 md:h-48 overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Floating action button */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg">
          <svg className="w-3.5 h-3.5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Category badge if needed */}
       
      </div>
      
      {/* Content Section with improved spacing */}
      <div className="p-4">
        <h3 className="text-lg text-center font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-200 mb-2 leading-tight">
          {name}
        </h3>



      </div>
    </div>
  );
};

export default CategoryCard;
