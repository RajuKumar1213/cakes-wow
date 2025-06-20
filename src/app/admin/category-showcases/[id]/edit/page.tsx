"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CategoryShowcaseForm from "@/components/CategoryShowcaseForm";
import AdminNavbar from "@/components/AdminNavbar";

export default function EditCategoryShowcasePage() {
  const params = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const categoryShowcaseId = params.id as string;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/admin-info");
      if (!response.ok) {
        window.location.href = "/admin-login";
        return;
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth error:", error);
      window.location.href = "/admin-login";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <CategoryShowcaseForm categoryShowcaseId={categoryShowcaseId} />
    </>
  );
}
