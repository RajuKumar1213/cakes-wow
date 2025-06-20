"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import SpeciallyTrendingCakeForm from "@/components/SpeciallyTrendingCakeForm";

interface SpeciallyTrendingCakeFormData {
  title: string;
  image: string;
  price: number;
  productSlug: string;
  isActive: boolean;
  sortOrder: number;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminEditSpeciallyTrendingCakePage({ params }: PageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cakeData, setCakeData] = useState<SpeciallyTrendingCakeFormData | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    checkAuthAndFetchData();
  }, [id]);

  const checkAuthAndFetchData = async () => {
    try {
      // Check authentication
      const authResponse = await fetch("/api/auth/admin-info");
      if (!authResponse.ok) {
        router.push("/admin-login");
        return;
      }
      
      setIsAuthenticated(true);
        // Fetch cake data
      const cakeResponse = await fetch(`/api/specially-trending-cakes/${id}`);
      const cakeResult = await cakeResponse.json();

      if (cakeResult.success) {
        setCakeData(cakeResult.data);
      } else {
        setError(cakeResult.message || "Failed to fetch cake data");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch cake data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: SpeciallyTrendingCakeFormData) => {
    try {
      const response = await fetch(`/api/specially-trending-cakes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/admin/specially-trending-cakes");
      } else {
        alert(result.message || "Failed to update cake");
      }
    } catch (error) {
      console.error("Error updating cake:", error);
      alert("Failed to update cake. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/admin/specially-trending-cakes")}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Back to List
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!cakeData) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Cake not found</p>
            <button
              onClick={() => router.push("/admin/specially-trending-cakes")}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Back to List
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">Edit Specially Trending Cake</h1>
              <p className="mt-1 text-sm text-gray-500">
                Update the cake information
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6">
            <SpeciallyTrendingCakeForm
              initialData={cakeData}
              onSubmit={handleSubmit}
              isEditing={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
