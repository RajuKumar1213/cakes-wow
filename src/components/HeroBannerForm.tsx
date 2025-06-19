"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import axios from "axios";
import { ArrowLeft, Upload, X } from "lucide-react";
import Image from "next/image";

interface HeroBannerFormProps {
  bannerId?: string;
  isEdit?: boolean;
}

interface HeroBannerData {
  title: string;
  image: string;
  alt: string;
  href: string;
  isActive: boolean;
  sortOrder: number;
}

const HeroBannerForm = ({ bannerId, isEdit = false }: HeroBannerFormProps) => {
  const router = useRouter();
  
  const [formData, setFormData] = useState<HeroBannerData>({
    title: "",
    image: "",
    alt: "",
    href: "",
    isActive: true,
    sortOrder: 0,
  });
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);  useEffect(() => {
    if (isEdit && bannerId) {
      fetchBanner();
    }
  }, [isEdit, bannerId]);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/hero-banners/${bannerId}`);
      if (response.data.success) {
        const banner = response.data.data;
        setFormData({
          title: banner.title || "",
          image: banner.image,
          alt: banner.alt,
          href: banner.href,
          isActive: banner.isActive,
          sortOrder: banner.sortOrder,
        });
        setImagePreview(banner.image);
      }
    } catch (error) {
      console.error("Error fetching banner:", error);
      setError("Failed to fetch hero banner");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.image;

    const formDataUpload = new FormData();
    formDataUpload.append("file", imageFile);

    try {
      setUploading(true);
      const response = await axios.post("/api/upload", formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.data.success) {
        return response.data.url;
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.alt || !formData.href) {
      setError("Alt text and href are required");
      return;
    }

    if (!imageFile && !formData.image) {
      setError("Please select an image");
      return;
    }

    try {
      setLoading(true);
      
      // Upload image if new file is selected
      const imageUrl = await uploadImage();
      
      const dataToSubmit = {
        ...formData,
        image: imageUrl,
      };

      let response;
      if (isEdit && bannerId) {
        response = await axios.put(`/api/hero-banners/${bannerId}`, dataToSubmit);
      } else {
        response = await axios.post("/api/hero-banners", dataToSubmit);
      }

      if (response.data.success) {
        setSuccess(`Hero banner ${isEdit ? "updated" : "created"} successfully!`);
        setTimeout(() => {
          router.push("/admin/hero-banners");
        }, 1500);
      } else {
        setError(response.data.message || `Failed to ${isEdit ? "update" : "create"} hero banner`);
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      setError(`Failed to ${isEdit ? "update" : "create"} hero banner`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : 
              type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, image: "" }));
  };  if (isEdit && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
          <span className="text-gray-600">Loading banner...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.push("/admin/hero-banners")}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? "Edit Hero Banner" : "Add Hero Banner"}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {isEdit ? "Update the hero banner details" : "Create a new hero banner for the carousel"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image *
              </label>
                {imagePreview ? (
                <div className="relative">
                  <div className="relative h-48 w-48 mx-auto rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-gray-500">
                    PNG, JPG, WEBP up to 10MB
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
              
              {!imagePreview && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                />
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter banner title"
              />
            </div>

            {/* Alt Text */}
            <div>
              <label htmlFor="alt" className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text *
              </label>
              <input
                type="text"
                id="alt"
                name="alt"
                value={formData.alt}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter image alt text for accessibility"
              />
            </div>

            {/* Link/Href */}
            <div>
              <label htmlFor="href" className="block text-sm font-medium text-gray-700 mb-2">
                Link URL *
              </label>
              <input
                type="text"
                id="href"
                name="href"
                value={formData.href}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="e.g., /birthday-cakes or /products/cake-name"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter relative URL (e.g., /birthday-cakes) or absolute URL
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                id="sortOrder"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first in the carousel
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active (Show in carousel)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/admin/hero-banners")}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || uploading ? "Saving..." : isEdit ? "Update Banner" : "Create Banner"}
              </button>            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HeroBannerForm;
