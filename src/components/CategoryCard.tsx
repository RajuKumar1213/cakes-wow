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

const CategoryCard = ({ id, name, image, href, description, productCount }: CategoryCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div
      className="group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100/50 w-full max-w-xs mx-auto"
      onClick={handleClick}
    >
      {/* Image Section with optimized aspect ratio */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
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
        {productCount && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
            <span className="text-xs font-medium text-gray-700">
              {productCount}+ items
            </span>
          </div>
        )}
      </div>
      
      {/* Content Section with improved spacing */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-200 mb-2 leading-tight">
          {name}
        </h3>
        
        {description && (
          <p className="text-sm text-gray-600 mb-3 leading-relaxed overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {description}
          </p>
        )}
        
        {/* Call to action */}
        <div className="flex items-center justify-center pt-2">
          <span className="text-sm text-pink-600 group-hover:text-pink-700 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 group-hover:bg-pink-100 transition-colors duration-200">
            Explore
            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
