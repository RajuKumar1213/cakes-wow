"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, Save, ImageIcon } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import axios from "axios";

interface AddOn {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface AddOnFormProps {
  addOn?: AddOn;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddOnForm({ addOn, onSuccess, onCancel }: AddOnFormProps) {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    rating: "4.5",
  });

  // Initialize form data when editing
  useEffect(() => {
    if (addOn) {
      setFormData({
        name: addOn.name,
        price: addOn.price.toString(),
        rating: addOn.rating.toString(),
      });
      setImagePreview(addOn.image);
    }
  }, [addOn]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        showError("Error", "Please select a valid image file");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError("Error", "Add-on name is required");
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      showError("Error", "Valid price is required");
      return;
    }

    if (!addOn && !imageFile) {
      showError("Error", "Image is required for new add-ons");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      submitData.append("price", formData.price);
      submitData.append("rating", formData.rating);
      
      if (imageFile) {
        submitData.append("image", imageFile);
      }

      let response;
      if (addOn) {
        // Update existing add-on
        response = await axios.patch(`/api/addons/?id=${addOn._id}`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Create new add-on
        response = await axios.post("/api/addons", submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.success) {
        showSuccess(
          "Success",
          `Add-on ${addOn ? "updated" : "created"} successfully!`
        );
        onSuccess();
      } else {
        throw new Error(response.data.message || "Failed to save add-on");
      }
    } catch (error: any) {
      console.error("Error saving add-on:", error);
      showError(
        "Error",
        error.response?.data?.message || "Failed to save add-on"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {addOn ? "Edit Add-On" : "Create New Add-On"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add-On Image {!addOn && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-start gap-4">
              {/* Current/Preview Image */}
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={imagePreview}
                      alt="Add-on preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {imagePreview ? "Change Image" : "Upload Image"}
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 400x400px, JPG or PNG format
                </p>
              </div>
            </div>
          </div>

          {/* Add-On Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add-On Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter add-on name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              placeholder="Enter rating"
              min="0"
              max="5"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Rating between 0 and 5 (default: 4.5)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {addOn ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {addOn ? "Update Add-On" : "Create Add-On"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
