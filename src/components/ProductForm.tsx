"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "../contexts/ToastContext";
import axios from "axios";
import { Search, X } from "lucide-react";

// Base schema without images for form validation
const baseProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),  price: z.number().min(0, "Price must be 0 or greater").optional(),
  discountedPrice: z.number().min(0).optional(),
  categories: z.array(z.string()).min(1, "Please select at least one category"),
  weightOptions: z
    .array(
      z.object({        weight: z.string().min(1, "Weight is required"),
        price: z.number().min(0.01, "Price must be greater than 0"),
        discountedPrice: z.number().min(0).optional(),
      })
    )
    .min(1, "At least one weight option is required"),
  isAvailable: z.boolean(),
  isBestseller: z.boolean(),
  preparationTime: z.string().min(1, "Preparation time is required"),
  // Remove images from form schema - we'll handle them separately
});

type ProductFormData = z.infer<typeof baseProductSchema>;

interface ProductFormProps {
  product?: any;
  categories?: any[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories = [],
  onSuccess,
  onCancel,
}) => {
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weightOptions, setWeightOptions] = useState([
    { weight: "", price: 0, discountedPrice: 0 },
  ]); const [categorySearch, setCategorySearch] = useState("");// Determine if editing and has existing images
  const isEditing = !!product;
  const hasExistingImages = !!(product?.imageUrls && product.imageUrls.length > 0);
  // Group and filter categories
  const groupedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return {};

    // Filter categories based on search
    const filteredCategories = categories.filter((cat: any) =>
      cat.name?.toLowerCase().includes(categorySearch.toLowerCase()) ||
      cat.group?.toLowerCase().includes(categorySearch.toLowerCase()) ||
      cat.type?.toLowerCase().includes(categorySearch.toLowerCase())
    );

    // Group by group then by type
    const grouped = filteredCategories.reduce((acc: Record<string, Record<string, any[]>>, cat: any) => {
      const group = cat.group || 'Other';
      const type = cat.type || 'General';

      if (!acc[group]) acc[group] = {};
      if (!acc[group][type]) acc[group][type] = [];

      acc[group][type].push(cat);
      return acc;
    }, {} as Record<string, Record<string, any[]>>);

    return grouped;
  }, [categories, categorySearch]); const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isValid }, reset, } = useForm<ProductFormData>({
      resolver: zodResolver(baseProductSchema),
      mode: "onChange",
      defaultValues: {
        name: "",
        description: "",
        price: 0,
        discountedPrice: 0,        isAvailable: true,
        isBestseller: false,
        categories: [],
        weightOptions: [{ weight: "", price: 0, discountedPrice: 0 }],
        preparationTime: "",
        // Remove images from form default values since we handle them separately
      },
    });


  useEffect(() => {
    if (product) {
      // Set form values
      setValue("name", product.name || "");
      setValue("description", product.description || "");
      setValue("price", product.price || 0);
      setValue("discountedPrice", product.discountedPrice || 0);

      // Handle categories - extract _id if they are objects, otherwise use as is
      const categoryIds = (product.categories || []).map((cat: { _id: any }) =>
        typeof cat === "object" && cat._id ? cat._id : cat
      );
      setValue("categories", categoryIds);

      // Handle weight options - ensure discountedPrice is properly converted
      const safeWeightOptions = (product.weightOptions || []).map((option: any) => ({
        weight: option.weight || "",
        price: typeof option.price === 'number' ? option.price : 0,
        discountedPrice: typeof option.discountedPrice === 'number' ? option.discountedPrice : 0
      }));

      // Ensure we have at least one weight option
      const finalWeightOptions = safeWeightOptions.length > 0
        ? safeWeightOptions
        : [{ weight: "", price: 0, discountedPrice: 0 }];

      setValue("weightOptions", finalWeightOptions);
      setWeightOptions(finalWeightOptions);

      setValue(
        "isAvailable",
        product.isAvailable !== undefined ? product.isAvailable : true
      );      setValue("isBestseller", product.isBestseller || false);
      setValue("preparationTime", product.preparationTime || "");

      // Handle existing images (URLs)
      if (product.imageUrls && product.imageUrls.length > 0) {
        setImagePreviews(product.imageUrls);
        // Note: We can't set actual File objects for existing images,
        // so we'll handle this case differently in form submission
      }
    }
  },

    [product, setValue]); const onSubmit = async (data: ProductFormData) => {
      try {
        console.log("=== ONSUBMIT FUNCTION CALLED ===");      // First, create a safe data object by extracting only the fields we need
        // This prevents any React Hook Form internal properties from causing circular references
        const safeData = {
          name: data.name || "",
          description: data.description || "",
          price: data.price || 0,
          discountedPrice: data.discountedPrice || 0,
          categories: Array.isArray(data.categories) ? [...data.categories] : [],
          weightOptions: Array.isArray(data.weightOptions) ? data.weightOptions.map(opt => ({
            weight: opt.weight || "",
            price: opt.price || 0,
            discountedPrice: opt.discountedPrice || 0
          })) : [],          isAvailable: Boolean(data.isAvailable),
          isBestseller: Boolean(data.isBestseller),
          preparationTime: data.preparationTime || "",
          imageFilesCount: imageFiles.length,
          imagePreviewsCount: imagePreviews.length
        };
        console.log("=== Original data from form ===");
        console.log("data.name:", data.name, "Type:", typeof data.name);
        console.log("data.description:", data.description, "Type:", typeof data.description);
        console.log("data.categories:", data.categories);
        console.log("data.weightOptions:", data.weightOptions);
        console.log("Form errors:", errors);
        console.log("Is form valid:", isValid);        // Add specific weight options validation debugging
        if (errors.weightOptions && Array.isArray(errors.weightOptions)) {
          errors.weightOptions.forEach((error: any, index: number) => {
            if (error) {
              // Weight option validation error
            }
          });
        }        // Now safely serialize the cleaned data
        let cleanData;
        try {
          cleanData = JSON.parse(JSON.stringify(safeData));
        } catch (serializationError) {// Fallback: create clean data manually without JSON.parse/stringify
          cleanData = {
            name: String(safeData.name),
            description: String(safeData.description),
            price: Number(safeData.price),
            discountedPrice: Number(safeData.discountedPrice),
            categories: [...safeData.categories],
            weightOptions: safeData.weightOptions.map(opt => ({
              weight: String(opt.weight),
              price: Number(opt.price),
              discountedPrice: Number(opt.discountedPrice)
            })),            isAvailable: Boolean(safeData.isAvailable),
            isBestseller: Boolean(safeData.isBestseller),
            preparationTime: String(safeData.preparationTime),
            imageFilesCount: Number(safeData.imageFilesCount),
            imagePreviewsCount: Number(safeData.imagePreviewsCount)
          };        }

        // Simple image validationwithout schema to avoid any circular reference issues
        if (!isEditing || !hasExistingImages) {
          // For new products or products without existing images, require at least one image
          if (imageFiles.length === 0) {
            showError("Images Required", "Please upload at least one image");
            return;
          }
        }
        console.log("Image validation passed!");
        setIsSubmitting(true);
        const formData = new FormData();

        // Add basic fields using cleanData to avoid any circular references
        console.log("=== Frontend Form Data Debug ===");
        console.log("cleanData.name:", cleanData.name, "Type:", typeof cleanData.name);
        console.log("cleanData.description:", cleanData.description, "Type:", typeof cleanData.description);
        console.log("cleanData.categories:", cleanData.categories);
        console.log("cleanData.weightOptions:", cleanData.weightOptions);

        formData.append("name", cleanData.name);
        formData.append("description", cleanData.description);
        if (cleanData.price) formData.append("price", cleanData.price.toString());
        if (cleanData.discountedPrice)
          formData.append("discountedPrice", cleanData.discountedPrice.toString());

        // Add array fields - send each item separately for backend to use getAll()
        cleanData.categories.forEach((categoryId: string) => {
          formData.append("categories", categoryId);
        });      // Send weight options as indexed fields
        console.log("=== Frontend Weight Options Debug ===");
        console.log("cleanData.weightOptions:", cleanData.weightOptions);
        cleanData.weightOptions.forEach((option: any, index: number) => {
          console.log(`Sending weightOptions[${index}]:`, option);
          formData.append(`weightOptions[${index}][weight]`, option.weight);
          formData.append(
            `weightOptions[${index}][price]`,
            option.price.toString()
          );
          if (option.discountedPrice && option.discountedPrice > 0) {
            formData.append(
              `weightOptions[${index}][discountedPrice]`,
              option.discountedPrice.toString()
            );
          }
        });        // Add boolean fields
        formData.append("isAvailable", cleanData.isAvailable.toString());
        formData.append("isBestseller", cleanData.isBestseller.toString());

        // Add preparationTime
        formData.append("preparationTime", cleanData.preparationTime);// Handle images - both new uploads and existing URLs
        if (imageFiles.length > 0) {
          imageFiles.forEach((file, index) => {
            // Ensure we're only appending actual File objects
            if (file instanceof File) {
              formData.append("images", file);
            }
          });
        }

        // For existing products, always include existing image URLs
        if (product && product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
          product.imageUrls.forEach((url: string) => {
            // Ensure we're only appending strings, not objects
            if (typeof url === 'string') {
              formData.append("imageUrls", url);
            }
          });
        }

        // if product add id
        if (product) {
          formData.append("_id", product._id);
        }
        if (product) {
          const response = await axios.patch("/api/products", formData);

          if (response.data.success) {
            showSuccess("Success!", "Product updated successfully!");
            // Don't reset form for updates, just close the form
            if (onSuccess) {
              onSuccess();
            }
          }
        } else {
          const response = await axios.post("/api/products", formData);
          if (response.data.success) {
            showSuccess("Success!", "Product created successfully!");
            // Reset form for new products          reset();
            setImageFiles([]);
            setImagePreviews([]);
            setWeightOptions([{ weight: "", price: 0, discountedPrice: 0 }]);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            if (onSuccess) {
              onSuccess();
            }
          }
        }
      } catch (error) {
        // Enhanced error logging to prevent circular reference issues
        console.error("Error submitting product - Type:", typeof error);

        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack (first 500 chars):", error.stack?.substring(0, 500));
        } else {
          console.error("Unknown error type:", String(error));
        }

        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Failed to submit form";
          showError("Error", errorMessage);
        } else if (error instanceof Error) {
          showError("Error", error.message);
        } else {
          showError("Error", "Failed to submit form");
        }
      } finally {
        setIsSubmitting(false);
      }
    };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
      // Escape to cancel
      if (e.key === "Escape") {
        if (onCancel) onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit, onSubmit, onCancel]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      showError(
        "Invalid File Type",
        "Please upload only JPG, PNG, or WebP images"
      );
      return;
    }

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      showError("File Too Large", "Each image must be less than 5MB");
      return;
    }

    if (imageFiles.length + files.length > 5) {
      showError("Maximum Images", "Maximum 5 images allowed");
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Note: We don't set form values for images since we handle them separately
    // This prevents any circular reference issues with File objects
  }; const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    // Note: We don't set form values for images since we handle them separately
  };

  const addWeightOption = () => {
    const updated = [
      ...weightOptions,
      { weight: "", price: 0, discountedPrice: 0 },
    ];
    setWeightOptions(updated);
    setValue("weightOptions", updated);
  };

  const removeWeightOption = (index: number) => {
    const updated = weightOptions.filter((_, i) => i !== index);
    setWeightOptions(updated);
    setValue("weightOptions", updated);
  };
  const updateWeightOption = (index: number, field: string, value: any) => {
    const updated = weightOptions.map((option, i) => {
      if (i === index) {
        let processedValue = value;

        // Ensure numeric fields are properly converted
        if (field === 'price' || field === 'discountedPrice') {
          processedValue = typeof value === 'string' ? parseFloat(value) || 0 : (typeof value === 'number' ? value : 0);
        }

        return { ...option, [field]: processedValue };
      }
      return option;
    });
    setWeightOptions(updated);
    setValue("weightOptions", updated);
    // Trigger validation for weight options after update
    trigger("weightOptions");
  };
  // Removed helper functions for ingredients, allergens, and tags

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col relative">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between rounded-t-xl">
          <h1 className="text-xl font-semibold text-gray-900">
            {product ? "Edit Product" : "Create New Product"}
          </h1>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>        <div className="flex-1 overflow-y-auto p-6 pb-20">{/* Added bottom padding for fixed buttons */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Basic Information
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        {...register("name")}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter product name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Description
                      </label>
                      <textarea
                        {...register("description")}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Detailed product description"
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Pricing
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {" "}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Regular Price (₹)
                        </label>
                        <input
                          {...register("price", {
                            setValueAs: (value) => {
                              if (value === "" || value === null || value === undefined) {
                                return undefined;
                              }
                              const num = Number(value);
                              return isNaN(num) ? undefined : num;
                            },
                          })}
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="0.00 (optional)"
                        />
                        {errors.price && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.price.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discounted Price (₹)
                        </label>{" "}
                        <input
                          {...register("discountedPrice", {
                            setValueAs: (value) => {
                              if (value === "" || value === null || value === undefined) {
                                return undefined;
                              }
                              const num = Number(value);
                              return isNaN(num) ? undefined : num;
                            },
                          })}
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="0.00 (optional)"
                        />
                        {errors.discountedPrice && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.discountedPrice.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weight Options Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Weight Options
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {weightOptions.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <input
                          type="text"
                          value={option.weight}
                          onChange={(e) => {
                            const updated = [...weightOptions];
                            updated[index].weight = e.target.value;
                            setWeightOptions(updated);
                            setValue("weightOptions", updated);
                          }}
                          placeholder="e.g., 500g, 1kg"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          value={option.price}
                          onChange={(e) => {
                            const updated = [...weightOptions];
                            updated[index].price = parseFloat(e.target.value);
                            setWeightOptions(updated);
                            setValue("weightOptions", updated);
                          }}
                          placeholder="Price"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          value={option.discountedPrice || ""}
                          onChange={(e) => {
                            const updated = [...weightOptions];
                            const value = parseFloat(e.target.value);
                            updated[index].discountedPrice = isNaN(value)
                              ? 0
                              : value;
                            setWeightOptions(updated);
                            setValue("weightOptions", updated);
                          }}
                          placeholder="Disc. Price"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeWeightOption(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addWeightOption}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors"
                    >
                      + Add Weight Option
                    </button>
                  </div>                </div>

              </div>{" "}
              {/* Right Column */}
              <div className="space-y-6">
                {/* Images Upload Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Product Images
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors"
                      >
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload images or drag and drop
                        </p>                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 5 images
                        </p>
                      </button>
                    </div>                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock & Settings Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Stock & Settings
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preparation Time
                      </label>
                      <input
                        {...register("preparationTime")}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., 4-6 hours"
                      />
                      {errors.preparationTime && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.preparationTime.message}
                        </p>
                      )}
                    </div>{" "}{/* Boolean toggles */}
                    <div className="space-y-3">
                      <Controller
                        name="isAvailable"
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="sr-only"
                              />
                              <div
                                className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${field.value
                                  ? "bg-gradient-to-r from-green-400 to-green-500 border-green-500"
                                  : "border-gray-300 group-hover:border-green-400"
                                  }`}
                              >
                                {field.value && (
                                  <svg
                                    className="w-4 h-4 text-white absolute top-0.5 left-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                              Available
                            </span>
                          </label>
                        )}
                      />

                      <Controller
                        name="isBestseller"
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center space-x-3 cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="sr-only"
                              />
                              <div
                                className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${field.value
                                  ? "bg-gradient-to-r from-purple-400 to-pink-500 border-pink-500"
                                  : "border-gray-300 group-hover:border-pink-400"
                                  }`}
                              >
                                {field.value && (
                                  <svg
                                    className="w-4 h-4 text-white absolute top-0.5 left-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
                              Bestseller
                            </span>
                          </label>                        )}
                      />
                    </div>
                  </div>
                </div></div>
            </div>

            {/* Categories Section - Placed at the bottom */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-blue-400 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Product Categories</h2>
              </div>

              <div className="space-y-4">
                {/* Search Box */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Categories Selection */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-1">
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(groupedCategories).map(([group, typeGroups]) => (
                      <div key={group} className="mb-4">
                        <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-2 font-medium text-gray-700 rounded-lg mb-2">
                          {group}
                        </div>
                        <div className="pl-2 space-y-4">
                          {Object.entries(typeGroups).map(([type, cats]) => (
                            <div key={`${group}-${type}`} className="mb-2">
                              <div className="text-sm font-medium text-gray-600 mb-1">{type}</div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                {cats.map((cat) => (
                                  <label
                                    key={cat._id}
                                    className="flex items-start p-2 rounded-md hover:bg-gray-50 cursor-pointer group"
                                  >
                                    <input
                                      type="checkbox"
                                      value={cat._id}
                                      {...register("categories")}
                                      className="mt-0.5 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-800 group-hover:text-blue-700 line-clamp-2">
                                      {cat.name}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {errors.categories && (
                  <p className="text-red-500 text-sm">{errors.categories.message}</p>
                )}
              </div>
            </div>

            {/* Debug Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info</h3>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>Form Valid: {isValid ? 'Yes' : 'No'}</p>
                <p>Has Errors: {Object.keys(errors).length > 0 ? 'Yes' : 'No'}</p>
                {/* <p>Errors: {JSON.stringify(errors, null, 2)}</p> */}
                <p>Is Editing: {isEditing ? 'Yes' : 'No'}</p>
                <p>Has Existing Images: {hasExistingImages ? 'Yes' : 'No'}</p>
                <p>Image Files Count: {imageFiles.length}</p>
                <p>Image Previews Count: {imagePreviews.length}</p>
              </div>              <button
                type="button"
                onClick={() => {
                  console.log("=== MANUAL DEBUG TRIGGER ===");
                  try {
                    const currentValues = getValues();
                    console.log("Form data keys:", Object.keys(currentValues));
                    console.log("Form errors keys:", Object.keys(errors));
                    console.log("Is valid:", isValid);
                    console.log("Is editing:", isEditing);
                    console.log("Has existing images:", hasExistingImages);

                    // Safe logging of form values
                    const safeValues = {
                      name: currentValues.name || "",
                      description: currentValues.description?.substring(0, 50) + "..." || "",
                      categoriesCount: Array.isArray(currentValues.categories) ? currentValues.categories.length : 0,
                      weightOptionsCount: Array.isArray(currentValues.weightOptions) ? currentValues.weightOptions.length : 0,
                      price: currentValues.price || 0,
                      isAvailable: currentValues.isAvailable
                    };
                    console.log("Safe form values:", safeValues);

                    trigger(); // Manually trigger validation
                  } catch (debugError) {
                    if (debugError instanceof Error) {
                      console.error("Debug error:", debugError.message);
                    } else {
                      console.error("Debug error:", debugError);
                    }
                  }
                }}
                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded text-xs"              >
                Debug Form
              </button>
            </div>
          </form>
        </div>

        {/* Fixed Submit Buttons at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 rounded-b-xl flex flex-row gap-3 justify-start">
          <button
            type="button"
            onClick={() => {
              reset();
              setImageFiles([]);
              setImagePreviews([]);
              setWeightOptions([
                { weight: "", price: 0, discountedPrice: 0 },
              ]);
              if (fileInputRef.current) fileInputRef.current.value = "";
              if (onCancel) onCancel();
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>            <button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              console.log("=== SUBMIT BUTTON CLICKED ===");
              console.log("Is editing:", isEditing);
              console.log("Has existing images:", hasExistingImages);
              console.log("Image files count:", imageFiles.length);
              console.log("Image previews count:", imagePreviews.length);

              try {
                // Get current form data
                const formData = getValues();
                console.log("Current form data:", formData);

                // Force validation first
                const isFormValid = await trigger();
                console.log("Manual validation result:", isFormValid);

                if (errors && Object.keys(errors).length > 0) {
                  console.log("Form errors:", errors);                  // Show detailed weight options errors
                  if (errors.weightOptions && Array.isArray(errors.weightOptions)) {
                    console.log("Weight options errors details:", errors.weightOptions);
                    errors.weightOptions.forEach((error, index) => {
                      if (error) {
                        console.log(`Weight option ${index} errors:`, error);
                      }
                    });
                  }
                }

                // Always attempt submission for now (to debug the issue)
                console.log("Attempting submission...");
                await onSubmit(formData);

              } catch (error) {
                console.error("Submit button error:", error);
                showError("Error", "Failed to submit form");
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-md hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>{product ? "Update Product" : "Create Product"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
