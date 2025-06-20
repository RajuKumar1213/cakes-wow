"use client";

import { useState } from "react";

interface SpeciallyTrendingCakeFormData {
  title: string;
  image: string;
  price: number;
  productSlug: string;
  isActive: boolean;
  sortOrder: number;
}

interface SpeciallyTrendingCakeFormProps {
  initialData?: SpeciallyTrendingCakeFormData;
  onSubmit: (data: SpeciallyTrendingCakeFormData) => Promise<void>;
  isEditing?: boolean;
}

const SpeciallyTrendingCakeForm = ({
  initialData,
  onSubmit,
  isEditing = false,
}: SpeciallyTrendingCakeFormProps) => {  const [formData, setFormData] = useState<SpeciallyTrendingCakeFormData>({
    title: initialData?.title || "",
    image: initialData?.image || "",
    price: initialData?.price || 0,
    productSlug: initialData?.productSlug || "",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    sortOrder: initialData?.sortOrder || 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : 
              type === "checkbox" ? (e.target as HTMLInputElement).checked : 
              value,
    }));

    // Auto-generate product slug from title
    if (name === "title" && !isEditing) {
      const slug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setFormData(prev => ({ ...prev, productSlug: slug }));
    }
  };
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({ ...prev, image: result.url }));
      } else {
        throw new Error(result.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      if (!formData.title || !formData.productSlug || !formData.image || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Cake Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Product Slug */}
        <div>
          <label htmlFor="productSlug" className="block text-sm font-medium text-gray-700">
            Product Slug *
          </label>
          <input
            type="text"
            id="productSlug"
            name="productSlug"
            value={formData.productSlug}
            onChange={handleInputChange}
            required
            placeholder="e.g., chocolate-fantasy-cake"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            This should match the slug of the actual product in your catalog
          </p>
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
            Sort Order
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleInputChange}
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Is Active */}
        <div className="flex items-center md:col-span-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active (Display on homepage)
          </label>
        </div>
      </div>      {/* Image Upload */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Showcase Image *
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
        />
        {formData.image && (
          <div className="mt-2">
            <img
              src={formData.image}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}
        {isUploading && (
          <p className="mt-2 text-sm text-gray-500">Uploading image...</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Cake" : "Create Cake"}
        </button>
      </div>
    </form>
  );
};

export default SpeciallyTrendingCakeForm;
