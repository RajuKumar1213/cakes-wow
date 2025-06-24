"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminNavbar from "@/components/AdminNavbar";
import CelebrateLovedDay from "@/components/CelebrateLovedDay";

interface CelebrateLoveDayItem {
  _id: string;
  name: string;
  slug: string;
  image: string;
  productCount?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCelebrateLoveDaysPage() {
  const [celebrateLoveDays, setCelebrateLoveDays] = useState<CelebrateLoveDayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchData, setFetchData] = useState(false)



  const fetchCelebrateLoveDays = async () => {
    try {
      setLoading(true);
      // Fetch all celebrate love days (including inactive for admin)
      const response = await fetch("/api/celebrate-love-days", { cache: "no-cache" });
      const data = await response.json();

      if (data.success) {
        setCelebrateLoveDays(data.data || []);
      } else {
        setError(data.message || "Failed to fetch celebrate love days");
      }
    } catch (error) {
      console.error("Error fetching celebrate love days:", error);
      setError("Failed to fetch celebrate love days");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCelebrateLoveDays()
  }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/celebrate-love-days/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setCelebrateLoveDays(prev => prev.filter(item => item._id !== id));
      } else {
        setError(data.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const item = celebrateLoveDays.find(item => item._id === id);
      if (!item) return;

      const response = await fetch(`/api/celebrate-love-days/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCelebrateLoveDays(prev =>
          prev.map(item =>
            item._id === id ? { ...item, isActive: !currentStatus } : item
          )
        );
      } else {
        setError(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status");
    }
  };
  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newItems = [...celebrateLoveDays];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    // Update sort order based on new positions
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));

    // Update local state immediately for better UX
    setCelebrateLoveDays(updatedItems);

    try {
      const reorderData = updatedItems.map((item, index) => ({
        _id: item._id,
        sortOrder: index,
      }));

      const response = await fetch("/api/celebrate-love-days", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: reorderData }),
      });

      const data = await response.json();

      if (!data.success) {
        // Revert on error
        setCelebrateLoveDays(celebrateLoveDays);
        setError(data.message || "Failed to reorder items");
      }
      setFetchData(!fetchData)
    } catch (error) {
      // Revert on error
      setCelebrateLoveDays(celebrateLoveDays);
      console.error("Error reordering items:", error);
      setError("Failed to reorder items");
    }
  };

  if (!celebrateLoveDays) {
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
                <h1 className="text-3xl font-bold text-gray-900">Celebrate Love Days</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage the celebrate loved day section
                </p>
              </div>
              <Link
                href="/admin/celebrate-love-days/new"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add New Item
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Live Preview</h2>
            <div className="border rounded-lg overflow-hidden">
              <CelebrateLovedDay />
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Celebrate Love Day Items ({celebrateLoveDays.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : celebrateLoveDays.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No items found. Create your first item!</p>
              </div>
            ) : (<div className="divide-y divide-gray-200">
              {celebrateLoveDays
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item, index) => (
                  <div key={item._id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">/{item.slug}</p>
                        {item.productCount !== undefined && (
                          <p className="text-sm text-gray-500">{item.productCount} products</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Order: {item.sortOrder} | {item.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Reorder arrows */}
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() =>
                            index > 0 && handleReorder(index, index - 1)
                          }
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() =>
                            index < celebrateLoveDays.length - 1 &&
                            handleReorder(index, index + 1)
                          }
                          disabled={index === celebrateLoveDays.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggleActive(item._id, item.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${item.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </button>

                      <Link
                        href={`/admin/celebrate-love-days/${item._id}/edit`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
