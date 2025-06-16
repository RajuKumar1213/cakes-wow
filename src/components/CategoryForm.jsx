import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Save, Plus } from "lucide-react";
import { Spinner } from "./Loading";
import axios from "axios";
import { useToast } from "@/contexts/ToastContext";


// Validation schema with better messages
const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-&'()]+$/, "Name contains invalid characters").optional(),
  group: z
    .string()
    .min(1, "Group is required")
    .max(50, "Group name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-&'()]+$/, "Group contains invalid characters"),
  type: z
    .string()
    .min(1, "Type is required")
    .max(50, "Type name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-&'()]+$/, "Type contains invalid characters"),
});

export default function CategoryForm({ category, onCancel, setLoadData }) {
    const { showSuccess, showError } = useToast();
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(categorySchema),    defaultValues: {
      name: category?.name || "",
      group: category?.group || "",
      type: category?.type || "",
    },
  });
  const [existingGroups, setExistingGroups] = useState([]);
  const [existingTypes, setExistingTypes] = useState([]);
  const [showCustomGroup, setShowCustomGroup] = useState(false);
  const [showCustomType, setShowCustomType] = useState(false);


  // Watch form values for dynamic behavior
  const watchedGroup = watch("group");
  const watchedType = watch("type");

  // Fetch existing groups and types from database
  useEffect(() => {
    const fetchExistingOptions = async () => {
      try {
        const response = await fetch("/api/categories?format=all");
        const data = await response.json();

        if (data.success) {
          const groups = [...new Set(data.data.map((cat) => cat.group))];
          const types = [...new Set(data.data.map((cat) => cat.type))];
          setExistingGroups(groups);
          setExistingTypes(types);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchExistingOptions();
  }, []);
  // Reset form when category prop changes
  useEffect(() => {
    if (category) {
      reset({
        name: category.name || "",
        group: category.group || "",
        type: category.type || "",
      });
    }
  }, [category, reset]);

  // Check if current group/type values exist in existing options
  useEffect(() => {
    if (watchedGroup && !existingGroups.includes(watchedGroup)) {
      setShowCustomGroup(true);
    } else if (watchedGroup && existingGroups.includes(watchedGroup)) {
      setShowCustomGroup(false);
    }
  }, [watchedGroup, existingGroups]);

  useEffect(() => {
    if (watchedType && !existingTypes.includes(watchedType)) {
      setShowCustomType(true);
    } else if (watchedType && existingTypes.includes(watchedType)) {
      setShowCustomType(false);
    }  }, [watchedType, existingTypes]);
  const onSubmit = async (data) => {
    try {
      // Create FormData for API submission
      const formDataToSend = new FormData();
      formDataToSend.append("name", data.name);
      formDataToSend.append("group", data.group);
      formDataToSend.append("type", data.type);

      //update the category if it exists, otherwise create a new one
      if(category) {
        formDataToSend.append("id", category._id);
        const response = await axios.patch("/api/categories", formDataToSend);

        if (response.data.success) {
          showSuccess("success", "Category updated successfully!");
          onCancel();
          setLoadData(true);
        }
      }
      else {
        const response = await axios.post("/api/categories", formDataToSend);

        if (response.data.success) {
          showSuccess("success", "Category created successfully!");
          onCancel();
          setLoadData(true);
        }
      }

    } catch (error) {
      console.error("Form submission error:", error);
      showError("Error", error.response?.data?.error || "Failed to submit form");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-poppins text-2xl font-bold text-gray-900">
              {category ? "Edit Category" : "Add New Category"}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>{" "}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group *
              </label>
              <div className="space-y-2">
                {!showCustomGroup ? (
                  <div className="flex gap-2">
                    <Controller
                      name="group"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) => {
                            if (e.target.value === "custom") {
                              setShowCustomGroup(true);
                              setValue("group", "");
                            } else {
                              field.onChange(e);
                            }
                          }}
                          className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            errors.group ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Select existing group...</option>
                          {existingGroups.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                          <option value="custom">+ Add New Group</option>
                        </select>
                      )}
                    />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Controller
                      name="group"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter new group name (e.g., For Girlfriend, Jungle Theme)"
                          className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            errors.group ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomGroup(false);
                        setValue("group", "");
                      }}
                      className="px-3 py-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {errors.group && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.group.message}
                </p>
              )}
            </div>{" "}
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <div className="space-y-2">
                {!showCustomType ? (
                  <div className="flex gap-2">
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) => {
                            if (e.target.value === "custom") {
                              setShowCustomType(true);
                              setValue("type", "");
                            } else {
                              field.onChange(e);
                            }
                          }}
                          className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            errors.type ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Select existing type...</option>
                          {existingTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                          <option value="custom">+ Add New Type</option>
                        </select>
                      )}
                    />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter new type (e.g., Romantic, Adventure, Superhero)"
                          className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            errors.type ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomType(false);
                        setValue("type", "");
                      }}
                      className="px-3 py-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.type.message}
                </p>
              )}
            </div>
          </div>
{/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter category name"
                />
              )}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSubmitting && <Spinner />}
              {category ? "Update Category" : "Create Category"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          {/* Examples Section */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-5 rounded-lg border border-orange-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              💡 Category Examples & Guidelines
            </h3>

            <div className="space-y-4 text-xs text-gray-700">
              {/* Group Examples */}
              <div className="bg-white/60 p-3 rounded-md">
                <h4 className="font-semibold text-orange-700 mb-2">
                  📂 Groups (Main Categories):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>Occasions:</strong>
                    <div className="ml-2 text-gray-600">
                      • "Birthday Special"
                      <br />
                      • "Anniversary Cakes"
                      <br />
                      • "Wedding Collection"
                      <br />• "Valentine's Day"
                    </div>
                  </div>
                  <div>
                    <strong>Relationships:</strong>
                    <div className="ml-2 text-gray-600">
                      • "For Girlfriend"
                      <br />
                      • "For Mom"
                      <br />
                      • "For Kids"
                      <br />• "For Husband"
                    </div>
                  </div>
                  <div>
                    <strong>Themes:</strong>
                    <div className="ml-2 text-gray-600">
                      • "Superhero Cakes"
                      <br />
                      • "Jungle Theme"
                      <br />
                      • "Princess Theme"
                      <br />• "Sports Theme"
                    </div>
                  </div>
                  <div>
                    <strong>Premium:</strong>
                    <div className="ml-2 text-gray-600">
                      • "Designer Cakes"
                      <br />
                      • "Luxury Collection"
                      <br />
                      • "Artisan Special"
                      <br />• "Custom Creations"
                    </div>
                  </div>
                </div>
              </div>

              {/* Type Examples */}
              <div className="bg-white/60 p-3 rounded-md">
                <h4 className="font-semibold text-pink-700 mb-2">
                  🏷️ Types (Sub-Categories):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>Styles:</strong>
                    <div className="ml-2 text-gray-600">
                      • "Romantic" • "Adventure"
                      <br />
                      • "Elegant" • "Fun & Quirky"
                      <br />• "Minimalist" • "Extravagant"
                    </div>
                  </div>
                  <div>
                    <strong>Characters:</strong>
                    <div className="ml-2 text-gray-600">
                      • "Batman" • "Princess"
                      <br />
                      • "Unicorn" • "Superhero"
                      <br />• "Cartoon" • "Movie Theme"
                    </div>
                  </div>
                </div>
              </div>

              {/* Name Examples */}
              <div className="bg-white/60 p-3 rounded-md">
                <h4 className="font-semibold text-blue-700 mb-2">
                  🎂 Category Names (Specific Products):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600">
                  <div>
                    • "Red Velvet Heart Cake"
                    <br />
                    • "Chocolate Batman Cake"
                    <br />
                    • "Pink Princess Castle"
                    <br />• "Football Stadium Cake"
                  </div>
                  <div>
                    • "Golden Anniversary Cake"
                    <br />
                    • "Jungle Safari Adventure"
                    <br />
                    • "Unicorn Rainbow Delight"
                    <br />• "Mom's Garden Cake"
                  </div>
                </div>
              </div>

              {/* Real Example */}
              <div className="bg-orange-100 p-3 rounded-md border border-orange-300">
                <h4 className="font-semibold text-orange-800 mb-2">
                  ✨ Complete Example:
                </h4>                <div className="bg-white p-2 rounded border text-gray-700">
                  <strong>Name:</strong> "Pink Heart Romantic Cake"
                  <br />
                  <strong>Group:</strong> "For Girlfriend"
                  <br />
                  <strong>Type:</strong> "Romantic"
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">
                  💭 Pro Tips:
                </h4>
                <ul className="text-gray-600 space-y-1">
                  <li>
                    • Use descriptive names that customers can easily search for
                  </li>
                  <li>
                    • Groups should be broad categories, Types should be
                    specific styles
                  </li>
                  <li>
                    • Think about how customers browse: "I want a cake for my
                    girlfriend that's romantic"
                  </li>
                  <li>
                    • You can create unlimited custom groups and types - be
                    creative! 🎨
                  </li>
                </ul>
              </div>
            </div>
          </div>{" "}
          {/* Submit Buttons */}
        </form>
      </div>
    </div>
  );
}
