"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CategoryShowcase from "@/components/CategoryShowcase";
import AdminNavbar from "@/components/AdminNavbar";

interface CategoryShowcaseItem {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  productCount?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoryShowcasesPage() {
  const [categoryShowcases, setCategoryShowcases] = useState<CategoryShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reordered, setReordered] = useState(false)



  const fetchCategoryShowcases = async () => {
    try {
      setLoading(true);
      // Fetch all category showcases (including inactive for admin)
      const response = await fetch("/api/category-showcases?includeInactive=true", {
        cache: 'no-store',
      });
      
      const data = await response.json();

      if (data.success) {
        setCategoryShowcases(data.data);
      } else {
        setError(data.message || "Failed to fetch category showcases");
      }
    } catch (error) {
      console.error("Error fetching category showcases:", error);
      setError("Failed to fetch category showcases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryShowcases()
  }, [reordered])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category showcase?")) {
      return;
    }

    try {
      const response = await fetch(`/api/category-showcases/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setCategoryShowcases(prev => prev.filter(item => item._id !== id));
      } else {
        setError(data.message || "Failed to delete category showcase");
      }
    } catch (error) {
      console.error("Error deleting category showcase:", error);
      setError("Failed to delete category showcase");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const categoryShowcase = categoryShowcases.find(item => item._id === id);
      if (!categoryShowcase) return;

      const response = await fetch(`/api/category-showcases/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...categoryShowcase,
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCategoryShowcases(prev =>
          prev.map(item =>
            item._id === id ? { ...item, isActive: !currentStatus } : item
          )
        );
      } else {
        setError(data.message || "Failed to update category showcase");
      }
    } catch (error) {
      console.error("Error updating category showcase:", error);
      setError("Failed to update category showcase");
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newItems = [...categoryShowcases];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    // Update local state immediately for better UX
    setCategoryShowcases(newItems);

    try {
      const response = await fetch("/api/category-showcases", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: newItems }),
      });

      const data = await response.json();

      if (!data.success) {
        // Revert on error
        setCategoryShowcases(categoryShowcases);
        setError(data.message || "Failed to reorder category showcases");
      }

      setReordered(true)

    } catch (error) {
      // Revert on error
      setCategoryShowcases(categoryShowcases);
      console.error("Error reordering category showcases:", error);
      setError("Failed to reorder category showcases");
    }
  };

  if (!categoryShowcases) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
        </div>
      </div>
    );
  }
  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Category Showcases</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage the category showcase section
                </p>
              </div>
              <Link
                href="/admin/category-showcases/new"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add New Category
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Live Preview */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            <CategoryShowcase />
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                All Category Showcases ({categoryShowcases.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading category showcases...</p>
              </div>
            ) : categoryShowcases.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No category showcases found</p>
                <Link
                  href="/admin/category-showcases/new"
                  className="mt-2 inline-block text-red-600 hover:text-red-700"
                >
                  Create your first category showcase
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryShowcases.map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-500">
                              {item.description.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(item._id, item.isActive)}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                              }`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            <button
                              onClick={() =>
                                index > 0 && handleReorder(index, index - 1)
                              }
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() =>
                                index < categoryShowcases.length - 1 &&
                                handleReorder(index, index + 1)
                              }
                              disabled={index === categoryShowcases.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              ↓
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/category-showcases/${item._id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}        </div>
        </div>
      </div>
    </>
  );
}
