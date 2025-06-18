"use client"

import { Search, ArrowLeft, Sparkles, Heart, Star, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MobileSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const trendingSearches = [
    { text: "Chocolate Cake", icon: Heart, color: "bg-pink-500" },
    { text: "Birthday Cake", icon: Sparkles, color: "bg-purple-500" },
    { text: "Red Velvet", icon: Star, color: "bg-red-500" },
    { text: "Vanilla Cake", icon: TrendingUp, color: "bg-blue-500" },
  ];

  const recentSearches = [
    "Eggless Chocolate Cake",
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
        <form onSubmit={handleSearch} className="relative mb-8">
          <div className={`relative transition-all duration-300 ${
            isInputFocused ? 'transform scale-105' : ''
          }`}>
            <span className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
              <Search className="w-5 h-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="What sweet treat are you craving? 🍰"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className={`w-full pl-14 pr-14 py-4 bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 text-gray-800 placeholder-gray-400 text-lg ${
                isInputFocused 
                  ? 'border-pink-300 shadow-pink-200/50' 
                  : 'border-gray-100 hover:border-pink-200'
              } focus:outline-none focus:border-pink-400 focus:shadow-xl focus:shadow-pink-200/30`}
              autoFocus
            />
            <button
              type="submit"
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2.5 rounded-xl transition-all duration-300 ${
                searchQuery.trim() 
                  ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Trending Searches */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-pink-500 mr-2" />
            Trending Now
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {trendingSearches.map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(`/search?q=${encodeURIComponent(item.text)}`)}
                className="group relative overflow-hidden bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className={`absolute top-0 right-0 w-12 h-12 ${item.color} rounded-bl-2xl opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${item.color} bg-opacity-10`}>
                    <item.icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="font-medium text-gray-700 text-sm">{item.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Search className="w-5 h-5 text-purple-500 mr-2" />
            Recent Searches
          </h2>
          <div className="space-y-3">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => router.push(`/search?q=${encodeURIComponent(search)}`)}
                className="w-full text-left p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-pink-200 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 group-hover:text-pink-600 transition-colors">{search}</span>
                  <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180 group-hover:text-pink-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
            Quick Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {['🎂 Birthday', '💖 Anniversary', '🍫 Chocolate', '🍓 Strawberry', '🥥 Eggless', '⭐ Premium'].map((category, index) => (
              <button
                key={index}
                onClick={() => router.push(`/search?q=${encodeURIComponent(category.split(' ')[1])}`)}
                className="px-4 py-2 bg-gradient-to-r from-pink-100 to-red-100 text-pink-700 rounded-full text-sm font-medium hover:from-pink-200 hover:to-red-200 transition-all duration-200 transform hover:scale-105"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Tips */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-8">
          <h3 className="font-bold text-purple-800 mb-2">💡 Search Tips</h3>
          <p className="text-purple-700 text-sm leading-relaxed">
            Try searching by flavor, occasion, or special requirements like "eggless" or "sugar-free"
          </p>
        </div>
      </div>
    </div>
  );
}


