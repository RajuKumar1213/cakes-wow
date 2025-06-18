import React from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryPageClient from "./CategoryPageClient";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountedPrice?: number;
  imageUrls: string[];
  rating: number;
  reviewCount: number;
  shortDescription: string;
  isBestseller: boolean;
  categories: Array<{ name: string; slug: string }>;
  tags: string[];
  weightOptions: Array<{
    weight: string;
    price: number;
    discountedPrice?: number;
  }>;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

// Server-side data fetching functions
async function fetchCategory(slug: string): Promise<Category | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/categories/${slug}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

async function fetchProducts(categorySlug: string): Promise<{ products: Product[], pagination: any }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    // Use displayOrder first to respect admin ordering, fallback to rating
    const apiUrl = `${baseUrl}/api/products?category=${categorySlug}&sortBy=displayOrder&sortOrder=asc&limit=24&page=1`;
    
    console.log('📦 Fetching products with category-specific ordering:', apiUrl);
      const response = await fetch(apiUrl, {
      cache: 'no-store', // Disable caching temporarily to test ordering
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`❌ Products API failed:`, response.status, response.statusText);
      return { products: [], pagination: { page: 1, limit: 24, total: 0, pages: 0 } };
    }
    
    const data = await response.json();

    console.log('✅ Products fetched:', data.data?.products?.length || 0, 'products');
    
    return data.success ? {
      products: data.data.products || [],
      pagination: data.data.pagination || { page: 1, limit: 24, total: 0, pages: 0 }
    } : { products: [], pagination: { page: 1, limit: 24, total: 0, pages: 0 } };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], pagination: { page: 1, limit: 24, total: 0, pages: 0 } };
  }
}

async function fetchFilterOptions(categorySlug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/products/ranges?category=${categorySlug}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );
    
    if (!response.ok) {
      return { weights: [], tags: [], priceRange: { min: 0, max: 5000 } };
    }
    
    const data = await response.json();
    return data.success ? {
      weights: data.data.weights || [],
      tags: data.data.tags || [],
      priceRange: data.data.priceRange || { min: 0, max: 5000 }
    } : { weights: [], tags: [], priceRange: { min: 0, max: 5000 } };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return { weights: [], tags: [], priceRange: { min: 0, max: 5000 } };
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = await fetchCategory(categorySlug);
  
  if (!category) {
    return {
      title: 'Category Not Found | Cakes Wow',
      description: 'The category you are looking for does not exist.',
    };
  }

  return {
    title: `${category.name} | Cakes Wow`,
    description: category.description || `Shop ${category.name} at Cakes Wow`,
    openGraph: {
      title: `${category.name} | Cakes Wow`,
      description: category.description || `Shop ${category.name} at Cakes Wow`,
      images: category.imageUrl ? [category.imageUrl] : [],
    },
  };
}

// Main Server Component
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  
  // Fetch all data in parallel on the server
  const [category, productsData, filterOptions] = await Promise.all([
    fetchCategory(categorySlug),
    fetchProducts(categorySlug),
    fetchFilterOptions(categorySlug)
  ]);

  // If category doesn't exist, show 404
  if (!category) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: category.name, href: `/${categorySlug}` },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <h1 className="text-2xl bg-white font-bold text-red-500 text-center py-4">{category?.name}</h1>
        <div className="bg-white ">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>        
        {/* Client-side interactive component */}
        <CategoryPageClient
          initialCategory={category}
          initialProducts={productsData.products}
          categorySlug={categorySlug}
          initialFilterOptions={filterOptions}
          initialPagination={productsData.pagination}
        />
      </div>
      <Footer />
    </>
  );
}
