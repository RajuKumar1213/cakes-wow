"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "../contexts/ToastContext";
import axios from "axios";

// Base schema without images for form validation
const baseProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  price: z.number().min(0, "Price must be greater than 0").optional(),
  discountedPrice: z.number().min(0).optional(),
  categories: z.array(z.string()).min(1, "Please select at least one category"),
  tags: z.array(z.string()).optional(),
  weightOptions: z
    .array(
      z.object({
        weight: z.string().min(1, "Weight is required"),
        price: z.number().min(0.01, "Price must be greater than 0"),
        discountedPrice: z.number().min(0).optional(),
      })
    )
    .min(1, "At least one weight option is required"),

  isAvailable: z.boolean(),
  isBestseller: z.boolean(),
  isFeatured: z.boolean(),
  stockQuantity: z.number().min(0, "Stock quantity cannot be negative"),
  minimumOrderQuantity: z
    .number()
    .min(1, "Minimum order quantity must be at least 1"),
  preparationTime: z.string().min(1, "Preparation time is required"),
  ingredients: z
    .array(z.string())
    .min(1, "Please list at least one ingredient"),
  allergens: z.array(z.string()).optional(),
  nutritionalInfo: z
    .object({
      calories: z.number().min(0).optional(),
      protein: z.string().optional(),
      carbs: z.string().optional(),
      fat: z.string().optional(),
    })
    .optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  sortOrder: z.number().min(0).optional(),
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
  ]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [allergens, setAllergens] = useState<string[]>([]);
  const [newAllergen, setNewAllergen] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");  // Determine if editing and has existing images
  const isEditing = !!product;
  const hasExistingImages = !!(product?.imageUrls && product.imageUrls.length > 0); const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isValid },
    reset, } = useForm<ProductFormData>({
      resolver: zodResolver(baseProductSchema),
      mode: "onChange",
      defaultValues: {
        name: "",
        description: "",
        shortDescription: "",
        price: 0,
        discountedPrice: 0,
        isAvailable: true,
        isBestseller: false,
        isFeatured: false,
        stockQuantity: 100,
        minimumOrderQuantity: 1,
        sortOrder: 0,
        categories: [],
        tags: [],
        weightOptions: [{ weight: "", price: 0, discountedPrice: 0 }],
        ingredients: [],
        allergens: [],
        preparationTime: "",
        nutritionalInfo: {
          calories: 0,
          protein: "",
          carbs: "",
          fat: "",
        },
        metaTitle: "",
        metaDescription: "",
        // Remove images from form default values since we handle them separately
      },
    });
  useEffect(() => {
    if (product) {
      // Set form values
      setValue("name", product.name || "");
      setValue("description", product.description || "");
      setValue("shortDescription", product.shortDescription || "");
      setValue("price", product.price || 0);
      setValue("discountedPrice", product.discountedPrice || 0);

      // Handle categories - extract _id if they are objects, otherwise use as is
      const categoryIds = (product.categories || []).map((cat: { _id: any }) =>
        typeof cat === "object" && cat._id ? cat._id : cat
      );
      setValue("categories", categoryIds);
      setValue("tags", product.tags || []);
      setValue(
        "weightOptions",
        product.weightOptions || [{ weight: "", price: 0, discountedPrice: 0 }]
      ); setValue(
        "isAvailable",
        product.isAvailable !== undefined ? product.isAvailable : true
      );
      setValue("isBestseller", product.isBestseller || false);
      setValue("isFeatured", product.isFeatured || false);
      setValue("stockQuantity", product.stockQuantity || 100);
      setValue("minimumOrderQuantity", product.minimumOrderQuantity || 1);
      setValue("preparationTime", product.preparationTime || "");
      setValue("sortOrder", product.sortOrder || 0);
      setValue("ingredients", product.ingredients || []);
      setValue("allergens", product.allergens || []);
      setValue(
        "nutritionalInfo",
        product.nutritionalInfo || {
          calories: 0,
          protein: "",
          carbs: "",
          fat: "",
        }
      );
      setValue("metaTitle", product.metaTitle || "");
      setValue("metaDescription", product.metaDescription || "");

      // Set state variables
      setWeightOptions(
        product.weightOptions || [{ weight: "", price: 0, discountedPrice: 0 }]
      );
      setIngredients(product.ingredients || []);
      setAllergens(product.allergens || []);
      setTags(product.tags || []);

      // Handle existing images (URLs)
      if (product.imageUrls && product.imageUrls.length > 0) {
        setImagePreviews(product.imageUrls);
        // Note: We can't set actual File objects for existing images,
        // so we'll handle this case differently in form submission
      }
    }
  }, [product, setValue]); const onSubmit = async (data: ProductFormData) => {
    try {
      console.log("=== ONSUBMIT FUNCTION CALLED ===");

      // First, create a safe data object by extracting only the fields we need
      // This prevents any React Hook Form internal properties from causing circular references
      const safeData = {
        name: data.name || "",
        description: data.description || "",
        shortDescription: data.shortDescription || "",
        price: data.price || 0,
        discountedPrice: data.discountedPrice || 0,
        categories: Array.isArray(data.categories) ? [...data.categories] : [],
        tags: Array.isArray(data.tags) ? [...data.tags] : [],
        weightOptions: Array.isArray(data.weightOptions) ? data.weightOptions.map(opt => ({
          weight: opt.weight || "",
          price: opt.price || 0,
          discountedPrice: opt.discountedPrice || 0
        })) : [],
        isAvailable: Boolean(data.isAvailable),
        isBestseller: Boolean(data.isBestseller),
        isFeatured: Boolean(data.isFeatured),
        stockQuantity: data.stockQuantity || 0,
        minimumOrderQuantity: data.minimumOrderQuantity || 1,
        preparationTime: data.preparationTime || "",
        sortOrder: data.sortOrder || 0,
        ingredients: Array.isArray(data.ingredients) ? [...data.ingredients] : [],
        allergens: Array.isArray(data.allergens) ? [...data.allergens] : [],
        nutritionalInfo: data.nutritionalInfo ? {
          calories: data.nutritionalInfo.calories || 0,
          protein: data.nutritionalInfo.protein || "",
          carbs: data.nutritionalInfo.carbs || "",
          fat: data.nutritionalInfo.fat || ""
        } : {},
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        imageFilesCount: imageFiles.length,
        imagePreviewsCount: imagePreviews.length
      };
      // Now safely serialize the cleaned data
      let cleanData;
      try {
        cleanData = JSON.parse(JSON.stringify(safeData));
        console.log("✅ Data serialization successful");
      } catch (serializationError) {
        console.error("❌ Serialization failed, using fallback approach");
        // Fallback: create clean data manually without JSON.parse/stringify
        cleanData = {
          name: String(safeData.name),
          description: String(safeData.description),
          shortDescription: String(safeData.shortDescription),
          price: Number(safeData.price),
          discountedPrice: Number(safeData.discountedPrice),
          categories: [...safeData.categories],
          tags: [...safeData.tags],
          weightOptions: safeData.weightOptions.map(opt => ({
            weight: String(opt.weight),
            price: Number(opt.price),
            discountedPrice: Number(opt.discountedPrice)
          })),
          isAvailable: Boolean(safeData.isAvailable),
          isBestseller: Boolean(safeData.isBestseller),
          isFeatured: Boolean(safeData.isFeatured),
          stockQuantity: Number(safeData.stockQuantity),
          minimumOrderQuantity: Number(safeData.minimumOrderQuantity),
          preparationTime: String(safeData.preparationTime),
          sortOrder: Number(safeData.sortOrder),
          ingredients: [...safeData.ingredients],
          allergens: [...safeData.allergens],
          nutritionalInfo: {
            calories: Number(safeData.nutritionalInfo.calories),
            protein: String(safeData.nutritionalInfo.protein),
            carbs: String(safeData.nutritionalInfo.carbs),
            fat: String(safeData.nutritionalInfo.fat)
          },
          metaTitle: String(safeData.metaTitle),
          metaDescription: String(safeData.metaDescription),
          imageFilesCount: Number(safeData.imageFilesCount),
          imagePreviewsCount: Number(safeData.imagePreviewsCount)
        };
      }
      console.log("Form submitted with clean data:", cleanData);
      console.log("Form validation errors count:", Object.keys(errors).length);
      console.log("Is editing:", isEditing);
      console.log("Has existing images:", hasExistingImages);
      console.log("Image files count:", imageFiles.length);
      console.log("Image previews count:", imagePreviews.length);

      // Simple image validation without schema to avoid any circular reference issues
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
      formData.append("name", cleanData.name);
      formData.append("description", cleanData.description);
      if (cleanData.shortDescription)
        formData.append("shortDescription", cleanData.shortDescription);
      if (cleanData.price) formData.append("price", cleanData.price.toString());
      if (cleanData.discountedPrice)
        formData.append("discountedPrice", cleanData.discountedPrice.toString());      // Add array fields - send each item separately for backend to use getAll()
      cleanData.categories.forEach((categoryId: string) => {
        formData.append("categories", categoryId);
      });

      cleanData.tags.forEach((tag: string) => {
        formData.append("tags", tag);
      });

      // Send weight options as indexed fields
      cleanData.weightOptions.forEach((option: any, index: number) => {
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
      });

      cleanData.ingredients.forEach((ingredient: string) => {
        formData.append("ingredients", ingredient);
      });

      cleanData.allergens.forEach((allergen: string) => {
        formData.append("allergens", allergen);
      });// Add boolean fields
      formData.append("isAvailable", cleanData.isAvailable.toString());
      formData.append("isBestseller", cleanData.isBestseller.toString());
      formData.append("isFeatured", cleanData.isFeatured.toString());

      // Add numeric fields
      formData.append("stockQuantity", cleanData.stockQuantity.toString());
      formData.append(
        "minimumOrderQuantity",
        cleanData.minimumOrderQuantity.toString()
      );
      formData.append("preparationTime", cleanData.preparationTime);
      if (cleanData.sortOrder !== undefined)
        formData.append("sortOrder", cleanData.sortOrder.toString());

      // Add nutritional info if provided
      if (cleanData.nutritionalInfo) {
        formData.append(
          "nutritionalInfo",
          JSON.stringify(cleanData.nutritionalInfo)
        );
      }

      // Add SEO fields
      if (cleanData.metaTitle) formData.append("metaTitle", cleanData.metaTitle);
      if (cleanData.metaDescription)
        formData.append("metaDescription", cleanData.metaDescription);// Handle images - both new uploads and existing URLs
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
          // Reset form for new products
          reset();
          setImageFiles([]);
          setImagePreviews([]);
          setWeightOptions([{ weight: "", price: 0, discountedPrice: 0 }]);
          setIngredients([]);
          setAllergens([]);
          setTags([]);
          setNewIngredient("");
          setNewAllergen("");
          setNewTag("");
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
    const updated = weightOptions.map((option, i) =>
      i === index ? { ...option, [field]: value } : option
    );
    setWeightOptions(updated);
    setValue("weightOptions", updated);
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      const updated = [...ingredients, newIngredient.trim()];
      setIngredients(updated);
      setValue("ingredients", updated);
      setNewIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
    setValue("ingredients", updated);
  };

  const addAllergen = () => {
    if (newAllergen.trim() && !allergens.includes(newAllergen.trim())) {
      const updated = [...allergens, newAllergen.trim()];
      setAllergens(updated);
      setValue("allergens", updated);
      setNewAllergen("");
    }
  };

  const removeAllergen = (index: number) => {
    const updated = allergens.filter((_, i) => i !== index);
    setAllergens(updated);
    setValue("allergens", updated);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updated = [...tags, newTag.trim()];
      setTags(updated);
      setValue("tags", updated);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    const updated = tags.filter((_, i) => i !== index);
    setTags(updated);
    setValue("tags", updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
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
        </div>
        <div className="p-6">
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
                        Short Description
                      </label>
                      <input
                        {...register("shortDescription")}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Brief product description"
                      />
                      {errors.shortDescription && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.shortDescription.message}
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
                        </label>                        <input
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
                        </label>{" "}                        <input
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
                  </div>
                </div>

                {/* Category & Tags Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
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
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Categories & Tags
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categories
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {" "}
                        {categories.map((cat) => (
                          <Controller
                            key={cat._id || cat}
                            name="categories"
                            control={control}
                            render={({ field }) => {
                              return (
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={field.value?.includes(
                                      cat._id || cat
                                    )}
                                    onChange={(e) => {
                                      const current = field.value || [];
                                      if (e.target.checked) {
                                        field.onChange([
                                          ...current,
                                          cat._id || cat,
                                        ]);
                                      } else {
                                        field.onChange(
                                          current.filter(
                                            (c) => c !== (cat._id || cat)
                                          )
                                        );
                                      }
                                    }}
                                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {cat.name || cat}
                                  </span>
                                </label>
                              );
                            }}
                          />
                        ))}
                      </div>
                      {errors.categories && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.categories.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          onKeyPress={(e) =>
                            e.key === "Enter" && (e.preventDefault(), addTag())
                          }
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="ml-2 text-orange-500 hover:text-orange-700"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity
                        </label>
                        <input
                          {...register("stockQuantity", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="100"
                        />
                        {errors.stockQuantity && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.stockQuantity.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Order Qty
                        </label>
                        <input
                          {...register("minimumOrderQuantity", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="1"
                        />
                        {errors.minimumOrderQuantity && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.minimumOrderQuantity.message}
                          </p>
                        )}
                      </div>
                    </div>
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
                    </div>{" "}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort Order
                      </label>
                      <input
                        {...register("sortOrder", {
                          valueAsNumber: true,
                          setValueAs: (value) => {
                            return isNaN(value) || value === ""
                              ? undefined
                              : value;
                          },
                        })}
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                      />
                      {errors.sortOrder && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.sortOrder.message}
                        </p>
                      )}
                    </div>                    {/* Boolean toggles */}
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
                          </label>
                        )}
                      />

                      <Controller
                        name="isFeatured"
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
                                  ? "bg-gradient-to-r from-blue-400 to-indigo-500 border-indigo-500"
                                  : "border-gray-300 group-hover:border-indigo-400"
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
                            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                              Featured
                            </span>
                          </label>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Ingredients & Allergens Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-400 rounded-lg flex items-center justify-center">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Ingredients & Allergens
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ingredients
                      </label>
                      <div className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={newIngredient}
                          onChange={(e) => setNewIngredient(e.target.value)}
                          placeholder="Add an ingredient"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addIngredient())
                          }
                        />
                        <button
                          type="button"
                          onClick={addIngredient}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      {ingredients.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {ingredients.map((ingredient, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 rounded px-3 py-1"
                            >
                              <span className="text-sm text-gray-800">
                                {ingredient}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeIngredient(index)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.ingredients && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.ingredients.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allergens
                      </label>
                      <div className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={newAllergen}
                          onChange={(e) => setNewAllergen(e.target.value)}
                          placeholder="Add an allergen"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addAllergen())
                          }
                        />
                        <button
                          type="button"
                          onClick={addAllergen}
                          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      {allergens.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {allergens.map((allergen, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 rounded px-3 py-1"
                            >
                              <span className="text-sm text-gray-800">
                                {allergen}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeAllergen(index)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.allergens && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.allergens.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nutritional Info & SEO Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
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
                      Nutrition & SEO
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {" "}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Calories
                        </label>
                        <input
                          {...register("nutritionalInfo.calories", {
                            valueAsNumber: true,
                            setValueAs: (value) => {
                              return isNaN(value) || value === ""
                                ? undefined
                                : value;
                            },
                          })}
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="e.g., 250"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Protein
                        </label>
                        <input
                          {...register("nutritionalInfo.protein")}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="e.g., 4g"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Carbs
                        </label>
                        <input
                          {...register("nutritionalInfo.carbs")}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="e.g., 30g"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fat
                        </label>
                        <input
                          {...register("nutritionalInfo.fat")}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="e.g., 10g"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Title
                      </label>
                      <input
                        {...register("metaTitle")}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="SEO meta title (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        {...register("metaDescription")}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="SEO meta description (optional)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>            {/* Debug Section */}
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
              </div>
              <button
                type="button" onClick={() => {
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
                      tagsCount: Array.isArray(currentValues.tags) ? currentValues.tags.length : 0,
                      weightOptionsCount: Array.isArray(currentValues.weightOptions) ? currentValues.weightOptions.length : 0,
                      ingredientsCount: Array.isArray(currentValues.ingredients) ? currentValues.ingredients.length : 0,
                      price: currentValues.price || 0,
                      isAvailable: currentValues.isAvailable,
                      stockQuantity: currentValues.stockQuantity || 0
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
                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded text-xs"
              >
                Debug Form
              </button>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setImageFiles([]);
                  setImagePreviews([]);
                  setWeightOptions([
                    { weight: "", price: 0, discountedPrice: 0 },
                  ]);
                  setIngredients([]);
                  setAllergens([]);
                  setTags([]);
                  setNewIngredient("");
                  setNewAllergen("");
                  setNewTag("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  if (onCancel) onCancel();
                }}
                className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={async (e) => {
                  console.log("=== SUBMIT BUTTON CLICKED ===");
                  console.log("Form errors:", errors);
                  console.log("Is valid:", isValid);
                  console.log("Form data:", getValues());
                  console.log("Is editing:", isEditing);
                  console.log("Has existing images:", hasExistingImages);
                  console.log("Image files count:", imageFiles.length);
                  console.log("Image previews count:", imagePreviews.length);

                  // Force validation
                  const isFormValid = await trigger();
                  console.log("Manual validation result:", isFormValid);
                  console.log("Errors after validation:", errors);

                  if (!isFormValid) {
                    console.log("Form is invalid, preventing submission");
                    e.preventDefault();
                    return;
                  }
                }}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
