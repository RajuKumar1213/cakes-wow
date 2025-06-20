"use client";

import { useState, useEffect } from "react";
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

export default function AdminAddSpeciallyTrendingCakePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/admin-info");
      if (!response.ok) {
        router.push("/admin-login");
        return;
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/admin-login");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: SpeciallyTrendingCakeFormData) => {
    try {
      const response = await fetch("/api/specially-trending-cakes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/admin/specially-trending-cakes");
      } else {
        alert(result.message || "Failed to create cake");
      }
    } catch (error) {
      console.error("Error creating cake:", error);
      alert("Failed to create cake. Please try again.");
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

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">Add New Specially Trending Cake</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create a new cake for the specially trending cakes section
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-6">
            <SpeciallyTrendingCakeForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </>
  );
}
