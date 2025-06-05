import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex mb-2 sm:mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mx-1 sm:mx-2" />
            )}            {index === items.length - 1 ? (
              <span className="text-pink-600 font-medium truncate max-w-24 sm:max-w-none">
                {item.label}
              </span>
            ) : item.href === "/products" ? (
              <span className="text-gray-400 font-medium truncate max-w-20 sm:max-w-none cursor-not-allowed">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-700 hover:text-pink-600 font-medium transition-colors truncate max-w-20 sm:max-w-none"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;