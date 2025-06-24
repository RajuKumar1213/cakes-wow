"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminNavbar from "@/components/AdminNavbar";
import SpeciallyTendingCakes from "@/components/SpeciallyTendingCakes";

interface SpeciallyTrendingCakeItem {
  _id: string;
  title: string;
  image: string;
  price: number;
  productSlug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSpeciallyTrendingCakesPage() {
  const [speciallyTrendingCakes, setSpeciallyTrendingCakes] = useState<SpeciallyTrendingCakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchData, setFetchData] = useState(false);

  useEffect(() => {
  fetchSpeciallyTrendingCakes()
  }, [fetchData]);


  const fetchSpeciallyTrendingCakes = async () => {
    try {
      setLoading(true);
      // Fetch all specially trending cakes (including inactive for admin)
      const response = await fetch("/api/specially-trending-cakes");
      const data = await response.json();

      if (data.success) {
        setSpeciallyTrendingCakes(data.data || []);
      } else {
        setError(data.message || "Failed to fetch specially trending cakes");
      }
    } catch (error) {
      console.error("Error fetching specially trending cakes:", error);
      setError("Failed to fetch specially trending cakes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cake?")) {
      return;
    }

    try {
      const response = await fetch(`/api/specially-trending-cakes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSpeciallyTrendingCakes(prev => prev.filter(item => item._id !== id));
      } else {
        setError(data.message || "Failed to delete cake");
      }
    } catch (error) {
      console.error("Error deleting cake:", error);
      setError("Failed to delete cake");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const item = speciallyTrendingCakes.find(item => item._id === id);
      if (!item) return;

      const response = await fetch(`/api/specially-trending-cakes/${id}`, {
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
        setSpeciallyTrendingCakes(prev =>
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
    const newItems = [...speciallyTrendingCakes];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    // Update sort order based on new positions
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));

    // Update local state immediately for better UX
    setSpeciallyTrendingCakes(updatedItems);

    try {
      const reorderData = updatedItems.map((item, index) => ({
        _id: item._id,
        sortOrder: index,
      }));

      const response = await fetch("/api/specially-trending-cakes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: reorderData }),
      });

      const data = await response.json();

      setFetchData(!fetchData)

      if (!data.success) {
        // Revert on error
        setSpeciallyTrendingCakes(speciallyTrendingCakes);
        setError(data.message || "Failed to reorder cakes");
      }
    } catch (error) {
      // Revert on error
      setSpeciallyTrendingCakes(speciallyTrendingCakes);
      console.error("Error reordering cakes:", error);
      setError("Failed to reorder cakes");
    }
  };

  if (!speciallyTrendingCakes) {
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
                <h1 className="text-3xl font-bold text-gray-900">Specially Trending Cakes</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage the specially trending cakes section
                </p>
              </div>
              <Link
                href="/admin/specially-trending-cakes/new"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add New Cake
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
              <SpeciallyTendingCakes />
            </div>
          </div>

          {/* Cakes List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Specially Trending Cakes ({speciallyTrendingCakes.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : speciallyTrendingCakes.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No cakes found. Create your first cake!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {speciallyTrendingCakes
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((cake, index) => (
                    <div key={cake._id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center space-x-4">                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={cake.image}
                            alt={cake.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{cake.title}</h4>
                          <p className="text-sm text-gray-500">Product: /{cake.productSlug}</p>
                          <p className="text-sm font-medium text-gray-900">
                            ₹{cake.price}
                          </p>
                          <p className="text-xs text-gray-400">
                            Order: {cake.sortOrder} | {cake.isActive ? "Active" : "Inactive"}
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
                              index < speciallyTrendingCakes.length - 1 &&
                              handleReorder(index, index + 1)
                            }
                            disabled={index === speciallyTrendingCakes.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            ↓
                          </button>
                        </div>

                        <button
                          onClick={() => handleToggleActive(cake._id, cake.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            cake.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cake.isActive ? "Active" : "Inactive"}
                        </button>

                        <Link
                          href={`/admin/specially-trending-cakes/${cake._id}/edit`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(cake._id)}
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
