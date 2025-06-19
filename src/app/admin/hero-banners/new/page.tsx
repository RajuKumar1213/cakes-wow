"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/components/Loading";
import HeroBannerForm from "@/components/HeroBannerForm";

const NewHeroBannerPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Check if admin token exists by making a request to an admin endpoint
        const response = await fetch('/api/hero-banners', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // If not authenticated, redirect to admin login
          router.push('/admin-login');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin-login');
        return;
      }
      setLoading(false);
    };

    checkAdminAuth();
  }, [router]);

  if (loading) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <HeroBannerForm />;
};

export default NewHeroBannerPage;
