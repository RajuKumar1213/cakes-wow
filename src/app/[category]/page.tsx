"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { Breadcrumb, Header } from "@/components";
import axios from "axios";

interface Product {
  _id: string;
  name: string;
  slug: string;
  imageUrls: string[];
  price: number;
  discountedPrice?: number;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isEggless?: boolean;
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  group: string;
  type: string;
}

const CategoryPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.category as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(
    async (page = 1, sortBy = "createdAt", sortOrder = "desc") => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          category: categorySlug,
          page: page.toString(),
          limit: "12",
          sortBy,
          sortOrder,
        }); 
        // Add search params from URL
        const search = searchParams.get("search");
        if (search) params.append("search", search);

        const response = await axios.get(`/api/products?${params}`);
        const data = response.data;

        if (data.success) {
          setProducts(data.data.products);
          setTotalCount(data.data.totalCount);
          setCurrentPage(data.data.currentPage);
          setTotalPages(data.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [categorySlug, searchParams]
  );

  const fetchCategory = useCallback(async () => {
    try {
      const response = await axios.get(`/api/categories?slug=${categorySlug}`);
      const data = response.data;

      if (data.success && data.data.length > 0) {
        setCategory(data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  }, [categorySlug]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (categorySlug) {
        await fetchCategory();
        await fetchProducts();
      }
    };

    fetchData();
  }, [categorySlug, searchParams, fetchCategory, fetchProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    fetchProducts(1, sortBy, sortOrder);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: category?.group || "Products", href: "#" },
    { label: category?.name || categorySlug, href: `/${categorySlug}` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Category Header */}
        {category && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 max-w-2xl">{category.description}</p>
            )}
            <div className="mt-4 flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                {category.group}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {category.type}
              </span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <ProductGrid
          products={products}
          loading={loading}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
        />
      </div>
    </div>
  );
};

export default CategoryPage;
