"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface CategoryShowcaseFormData {
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
}

interface CategoryShowcaseFormProps {
  categoryShowcaseId?: string;
}

export default function CategoryShowcaseForm({ categoryShowcaseId }: CategoryShowcaseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<CategoryShowcaseFormData>({
    name: "",
    slug: "",
    image: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (categoryShowcaseId) {
      fetchCategoryShowcase();
    }
  }, [categoryShowcaseId]);

  const fetchCategoryShowcase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/category-showcases/${categoryShowcaseId}`);
      const data = await response.json();

      if (data.success) {
        setFormData(data.data);
      } else {
        setError(data.message || "Failed to fetch category showcase");
      }
    } catch (error) {
      console.error("Error fetching category showcase:", error);
      setError("Failed to fetch category showcase");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        setError(data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = categoryShowcaseId
        ? `/api/category-showcases/${categoryShowcaseId}`
        : "/api/category-showcases";
      
      const method = categoryShowcaseId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(
          categoryShowcaseId
            ? "Category showcase updated successfully!"
            : "Category showcase created successfully!"
        );
        
        // Redirect after success
        setTimeout(() => {
          router.push("/admin/category-showcases");
        }, 1500);
      } else {
        setError(data.message || "Failed to save category showcase");
      }
    } catch (error) {
      console.error("Error saving category showcase:", error);
      setError("Failed to save category showcase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {categoryShowcaseId ? "Edit" : "Add"} Category Showcase
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {categoryShowcaseId
                  ? "Update category showcase details"
                  : "Create a new category showcase"}
              </p>
            </div>
            <Link
              href="/admin/category-showcases"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL-friendly version of the name (auto-generated)
                </p>
              </div>
            </div>            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  id="sortOrder"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Category Image *
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                {uploading && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </div>
                )}
              </div>
              
              {formData.image && (
                <div className="mt-4">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active (visible on website)
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/category-showcases"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>
                  {loading
                    ? "Saving..."
                    : categoryShowcaseId
                    ? "Update Category"
                    : "Create Category"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
