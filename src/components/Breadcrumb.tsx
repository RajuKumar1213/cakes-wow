import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { deflate } from 'zlib';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            {index === items.length - 1 ? (
              <span className="text-gray-500 text-sm font-medium">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-700 hover:text-pink-600 text-sm font-medium transition-colors"
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