"use client"

import { Search, ArrowLeft, Sparkles, Heart, Star, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import SearchDropdown from "@/components/SearchDropdown";

export default function MobileSearchPage() {
  const router = useRouter();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

  // Real-time search functionality
  const {
    query: searchQuery,
    suggestions,
    isLoading: searchLoading,
    showSuggestions,
    selectedIndex,
    handleQueryChange,
    handleKeyboardNavigation,
    clearSuggestions,
    setShowSuggestions
  } = useSearchSuggestions();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      clearSuggestions();
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    const result = handleKeyboardNavigation(e.key);

    if (result === 'handled') {
      e.preventDefault();
    } else if (result && typeof result === 'object') {
      e.preventDefault();
      clearSuggestions();
      router.push(`/products/${result.slug}`);
    }
  };

  const handleProductClick = (slug: string) => {
    clearSuggestions();
  };

  const handleViewAllResults = () => {
    clearSuggestions();
  };

  const handlePopularSearchClick = (term: string) => {
    handleQueryChange(term);
    clearSuggestions();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowSuggestions]);

  const trendingSearches = [
    { text: "Chocolate Cake", icon: Heart, color: "bg-pink-500" },
    { text: "Birthday Cake", icon: Sparkles, color: "bg-purple-500" },
    { text: "Red Velvet", icon: Star, color: "bg-red-500" },
    { text: "Vanilla Cake", icon: TrendingUp, color: "bg-blue-500" },
  ];
  const recentSearches = [
    "Chocolate Cake",
    "Anniversary Special",
    "Custom Photo Cake",
    "Fresh Fruit Cake"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Search Cakes</h1>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-6">        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-8" ref={searchRef}>
          <div className={`relative transition-all duration-300 ${isInputFocused ? 'transform scale-105' : ''
            }`}>
            <span className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
              <Search className="w-5 h-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="What sweet treat are you craving? 🍰"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                setIsInputFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => setIsInputFocused(false)}
              className={`w-full pl-14 pr-14 py-4 bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 text-gray-800 placeholder-gray-400 text-lg ${isInputFocused
                  ? 'border-pink-300 shadow-pink-200/50'
                  : 'border-gray-100 hover:border-pink-200'
                } focus:outline-none focus:border-pink-400 focus:shadow-xl focus:shadow-pink-200/30`}
              autoFocus
            />
            <button
              type="submit"
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2.5 rounded-xl transition-all duration-300 ${searchQuery.trim()
                  ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-400'
                }`}
            >
              <Search className="w-5 h-5" />
            </button>

            {searchLoading && (
              <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1">
              <SearchDropdown
                products={suggestions.products}
                query={suggestions.query}
                isLoading={searchLoading}
                selectedIndex={selectedIndex}
                onProductClick={(slug) => {
                  handleProductClick(slug);
                  setShowSuggestions(false);
                  router.push(`/products/${slug}`);
                }}
                onViewAllResults={() => {
                  handleViewAllResults();
                  setShowSuggestions(false);
                }}
                onPopularSearchClick={(term) => {
                  handlePopularSearchClick(term);
                  setShowSuggestions(false);
                }}
              />
            </div>
          )}
        </form>


      </div>
    </div>
  );
}


