import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  name: string;
  slug: string;
  imageUrls: string[];
  price: number;
  discountedPrice: number;
  finalPrice: number;  rating: number;
  reviewCount: number;
  shortDescription: string;
  isBestseller: boolean;
  isFeatured: boolean;
  discountPercentage: number;
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

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductSection = ({
  title,
  subtitle,
  products,
  viewAllLink,
}: ProductSectionProps) => {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-2 md:px-4 lg:px-6 xl:px-8">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm md:text-base text-gray-600">{subtitle}</p>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8 md:px-8">
          {products.map((product) => (
            <ProductCard key={product._id} {...product} />
          ))}
        </div>
        {viewAllLink && (
          <div className="text-center">
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              onClick={() => alert("This function is coming soon!")}
            >
              View All
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
