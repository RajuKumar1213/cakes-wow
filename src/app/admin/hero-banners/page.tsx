"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoading } from "@/components/Loading";
import AdminNavbar from "@/components/AdminNavbar";
import HeroCarousel from "@/components/HeroCarousel";
import axios from "axios";
import {
  Edit3,
  Trash2,
  Plus,
  Image as ImageIcon,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";

interface HeroBanner {
  _id: string;
  title?: string;
  image: string;
  alt: string;
  href: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const HeroBannersPage = () => {
  const router = useRouter();  
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  
  // To force carousel re-render
  useEffect(() => {
    fetchBanners();
  }, [previewKey]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/hero-banners");
      if (response.data.success) {
        setBanners(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError("Failed to fetch hero banners");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero banner?")) {
      return;
    }

    try {
      const response = await axios.delete(`/api/hero-banners/${id}`);
      if (response.data.success) {
        setBanners(banners.filter(banner => banner._id !== id));
        setPreviewKey(prev => prev + 1); // Refresh preview
      } else {
        setError("Failed to delete hero banner");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      setError("Failed to delete hero banner");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const banner = banners.find(b => b._id === id);
      if (!banner) return;

      const response = await axios.put(`/api/hero-banners/${id}`, {
        ...banner,
        isActive: !isActive,
      });
        if (response.data.success) {
        setBanners(banners.map(b => 
          b._id === id ? { ...b, isActive: !isActive } : b
        ));
        setPreviewKey(prev => prev + 1); // Refresh preview
      } else {
        setError("Failed to update hero banner");
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      setError("Failed to update hero banner");
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b._id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === banners.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newBanners = [...banners];
    const [movedBanner] = newBanners.splice(currentIndex, 1);
    newBanners.splice(newIndex, 0, movedBanner);

    // Update sort orders
    const updatedBanners = newBanners.map((banner, index) => ({
      ...banner,
      sortOrder: index,
    }));    
    setBanners(updatedBanners);
    setPreviewKey(prev => prev + 1); // Refresh preview

    console.log("this is banner index.", newIndex, movedBanner);

    try {
      // Update the moved banner's sort order in the database
      await axios.put(`/api/hero-banners/${id}`, {
        ...movedBanner,
        sortOrder: newIndex,
      });
    } catch (error) {
      console.error("Error updating banner order:", error);
      setError("Failed to update banner order");
      // Revert on error
      fetchBanners();
    }
  };
  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hero Banners</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage carousel banners displayed on the homepage
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/hero-banners/new")}
                className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Banner
              </button>
            </div>
          </div>          {/* Error Message */}
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {/* Hero Carousel Preview */}
          {banners.length > 0 && (
            <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Live Preview
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This is how the carousel will appear on your homepage
              </p>              <div className="bg-white rounded-lg p-4 shadow-sm">
                <HeroCarousel key={previewKey} />
              </div>
            </div>
          )}

          {/* Banners List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Hero Banners</h3>
                      <p className="text-gray-500 mb-4">
                        Create your first hero banner to get started.
                      </p>
                      <button
                        onClick={() => router.push("/admin/hero-banners/new")}
                        className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Banner
                      </button>
                    </td>
                  </tr>
                ) : (
                  banners.map((banner, index) => (                    <tr key={banner._id} className={!banner.isActive ? "opacity-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={banner.image}
                            alt={banner.alt}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {banner.title || "No Title"}
                          </div>
                          <div className="text-sm text-gray-500">{banner.alt}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {banner.href}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(banner._id, banner.isActive)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            banner.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {banner.isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleReorder(banner._id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReorder(banner._id, 'down')}
                            disabled={index === banners.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/admin/hero-banners/${banner._id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(banner._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBannersPage;
