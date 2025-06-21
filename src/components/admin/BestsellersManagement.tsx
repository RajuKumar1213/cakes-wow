"use client";

import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import {
  ArrowUp,
  ArrowDown,
  Package,
  Star,
  Eye,
  Loader2,
  GripVertical,
} from "lucide-react";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  imageUrls: string[];
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    group: string;
    type: string;
  }>;
  weightOptions: Array<{
    weight: string;
    price: number;
    discountedPrice?: number;
  }>;
  isAvailable: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  preparationTime: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  bestsellerOrder?: number;
}

interface BestsellersManagementProps {
  bestsellers: Product[];
  onUpdate: () => void;
  loading: boolean;
}

export default function BestsellersManagement({ 
  bestsellers, 
  onUpdate, 
  loading 
}: BestsellersManagementProps) {
  const { showSuccess, showError } = useToast();
  const [reorderLoading, setReorderLoading] = useState<string | null>(null);
  const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);

  // Sort bestsellers by bestsellerOrder
  const sortedBestsellers = [...bestsellers].sort((a, b) => 
    (a.bestsellerOrder || 0) - (b.bestsellerOrder || 0)
  );

  const updateBestsellerOrder = async (productId: string, newOrder: number) => {
    setReorderLoading(productId);
    try {
      const formData = new FormData();
      formData.append('bestsellerOrder', newOrder.toString());
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        showSuccess("Success", "Bestseller order updated successfully!");
        onUpdate();
      } else {
        throw new Error(data.message || 'Failed to update order');
      }
    } catch (error) {
      console.error("Failed to update bestseller order:", error);
      showError("Error", "Failed to update bestseller order");
    } finally {
      setReorderLoading(null);
    }
  };

  const moveProduct = async (productId: string, direction: 'up' | 'down') => {
    const currentIndex = sortedBestsellers.findIndex(p => p._id === productId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedBestsellers.length) return;

    // Update the order for the moved product
    await updateBestsellerOrder(productId, newIndex + 1);
  };

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    setDraggedProduct(product);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetProduct: Product) => {
    e.preventDefault();
    if (!draggedProduct || draggedProduct._id === targetProduct._id) return;

    const draggedIndex = sortedBestsellers.findIndex(p => p._id === draggedProduct._id);
    const targetIndex = sortedBestsellers.findIndex(p => p._id === targetProduct._id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Update the dragged product's order to match target position
      updateBestsellerOrder(draggedProduct._id, targetIndex + 1);
    }

    setDraggedProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Loading bestsellers...</span>
      </div>
    );
  }

  if (sortedBestsellers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bestsellers Found</h3>
          <p className="text-gray-600">
            No products are currently marked as bestsellers. Go to the Products tab to mark products as bestsellers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Bestseller Products Order
            </h3>
            <p className="text-gray-600">
              Drag and drop or use the arrow buttons to reorder how bestseller products appear on your website.
            </p>
          </div>
          <div className="flex items-center bg-orange-50 px-4 py-2 rounded-lg">
            <Star className="w-5 h-5 text-orange-500 mr-2" />
            <span className="text-orange-700 font-medium">
              {sortedBestsellers.length} Bestsellers
            </span>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-800">Bestseller Products</h4>
          <p className="text-sm text-gray-600 mt-1">
            Products are displayed in the order shown below (top to bottom)
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {sortedBestsellers.map((product, index) => (
            <div
              key={product._id}
              className="flex items-center p-4 hover:bg-gray-50 transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, product)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, product)}
            >
              {/* Drag Handle */}
              <div className="mr-3 cursor-move text-gray-400 hover:text-gray-600">
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Order Number */}
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                {index + 1}
              </div>

              {/* Product Image */}
              <div className="w-16 h-16 relative rounded-lg overflow-hidden mr-4 flex-shrink-0">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <Image
                    src={product.imageUrls[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-gray-900 truncate">{product.name}</h5>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span className="mr-4">
                    ₹{product.discountedPrice || product.price}
                    {product.discountedPrice && (
                      <span className="ml-2 line-through text-gray-400">
                        ₹{product.price}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>{product.rating}</span>
                    <span className="ml-1">({product.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => moveProduct(product._id, 'up')}
                  disabled={index === 0 || reorderLoading === product._id}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reorderLoading === product._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => moveProduct(product._id, 'down')}
                  disabled={index === sortedBestsellers.length - 1 || reorderLoading === product._id}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reorderLoading === product._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={`/products/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Eye className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-800 mb-2">How to Reorder</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use the ↑ and ↓ buttons to move products up or down</li>
          <li>• Drag and drop products using the ⋮⋮ handle on the left</li>
          <li>• The first product will appear first on your website</li>
          <li>• Changes are saved automatically</li>
        </ul>
      </div>
    </div>
  );
}
