"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import {
  Search,
  MapPin,
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
  X,
  Heart,
  MoreHorizontal,
  Plus,
  Minus,
  Package,
  Info,
  LogIn,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Login from "./Login";
import SearchDropdown from "./SearchDropdown";

const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { groupedCategories, loading: categoriesLoading } = useCategories();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showLogin, setShowLogin] = useState(false);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(null);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".mobile-menu-trigger")
      ) {
        setIsMobileMenuOpen(false);
      }
      if (
        rightSidebarRef.current &&
        !rightSidebarRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".right-sidebar-trigger")
      ) {
        setIsRightSidebarOpen(false);
      }
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

  // Create navigation structure from dynamic categories
  const navigationItems = Object.keys(groupedCategories).map((group) => ({
    name: group,
    items: groupedCategories[group].map((category) => ({
      name: category.name,
      href: `/${category.slug}`,
      slug: category.slug,
    })),
    hasSubMenu: groupedCategories[group].length > 1,
  }));

  const handleCategoryClick = (categorySlug: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDropdownOpen(null);
    setIsMobileMenuOpen(false);
    router.push(`/${categorySlug}`);
  };

  const handleDropdown = (menu: string) => {
    setIsDropdownOpen(menu);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(null);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(
      expandedCategory === categoryName ? null : categoryName
    );
  };

  return (
    <>
      <header className="bg-white relative z-50">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-50 to-amber-50 shadow-md border-b border-pink-100">
          {/* Left side - Hamburger + Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-trigger p-2.5 hover:bg-gradient-to-r hover:from-pink-200 hover:to-amber-200 rounded-xl transition-all duration-300 transform hover:scale-110 group"
            >
              <Menu className="w-5 h-5 text-pink-600 group-hover:text-pink-700 transition-colors" />
            </button>
            <div
              className="flex items-center cursor-pointer transform hover:scale-105 transition-transform duration-300"
              onClick={() => router.push("/")}
            >
              <Image
                src="/logo.webp"
                alt="cakes wow Logo"
                width={120}
                height={32}
                priority
                className="drop-shadow-lg"
              />
            </div>
          </div>

          {/* Right side - Icons */}
          <div className="flex items-center space-x-1">
            <Link href="/m-search">
              <button className="p-2.5 hover:bg-gradient-to-r hover:from-pink-200 hover:to-amber-200 rounded-xl transition-all duration-300 transform hover:scale-110 group">
                <Search className="w-5 h-5 text-pink-600 group-hover:text-pink-700 transition-colors" />
              </button>
            </Link>
            <Link href="/wishlist">
              <button className="p-2.5 hover:bg-gradient-to-r hover:from-pink-200 hover:to-amber-200 rounded-xl transition-all duration-300 transform hover:scale-110 group">
                <Heart className="w-5 h-5 text-pink-600 group-hover:text-pink-700 transition-colors" />
              </button>
            </Link>
            <Link href="/cart">
              <button className="p-2.5 hover:bg-gradient-to-r hover:from-pink-200 hover:to-amber-200 rounded-xl transition-all duration-300 transform hover:scale-110 relative group">
                <ShoppingCart className="w-5 h-5 text-pink-600 group-hover:text-pink-700 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>
            <button
              className="p-2.5 hover:bg-gradient-to-r hover:from-pink-200 hover:to-amber-200 rounded-xl transition-all duration-300 transform hover:scale-110 right-sidebar-trigger group"
              onClick={() => setIsRightSidebarOpen(true)}
              aria-label="Open more menu"
            >
              <MoreHorizontal className="w-5 h-5 text-pink-600 group-hover:text-pink-700 transition-colors" />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          {/* Main header */}
          <div className="bg-white shadow-lg min-w-screen mx-auto py-5 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-opacity-90">
            <div className="container mx-auto px-8 flex items-center justify-between">
              {/* Logo */}
              <div
                className="flex items-center cursor-pointer transform hover:scale-105 transition-transform duration-300"
                onClick={() => router.push("/")}
              >
                <Image
                  src="/logo.webp"
                  alt="cakes wow Logo"
                  width={150}
                  height={48}
                  className="drop-shadow-md"
                />
              </div>

              {/* Location */}
              <div className="flex items-center space-x-2 cursor-pointer group">
                <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                  <MapPin className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Deliver to</div>
                  <div className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors">Hyderabad</div>
                </div>
              </div>

              {/* Search */}
              <div className="flex-1 max-w-[500px] mx-8" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for cakes, occasions, flavors..."
                      value={searchQuery}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={handleSearchKeyDown}
                      className="w-full pl-12 pr-4 py-3 text-sm text-gray-700 bg-white border border-pink-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-500" />

                    {searchLoading && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {showSuggestions && (
                    <SearchDropdown
                      products={suggestions.products}
                      query={suggestions.query}
                      isLoading={searchLoading}
                      selectedIndex={selectedIndex}
                      onProductClick={handleProductClick}
                      onViewAllResults={handleViewAllResults}
                      onPopularSearchClick={handlePopularSearchClick}
                    />
                  )}
                </form>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-6">
                {user ? (
                  <div className="flex items-center space-x-6">
                    <div
                      className="flex items-center space-x-2 cursor-pointer group"
                      onClick={() => router.push("/profile")}
                    >
                      <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                        <User className="w-5 h-5 text-pink-600" />
                      </div>
                      <span className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors">Profile</span>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-gray-100 hover:bg-pink-100 transition-colors">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex items-center space-x-2 cursor-pointer group"
                    onClick={() => setShowLogin(true)}
                  >
                    <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                      <User className="w-5 h-5 text-pink-600" />
                    </div>
                    <span className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors">Login</span>
                  </div>
                )}

                <div
                  className="flex items-center space-x-2 cursor-pointer group relative"
                  onClick={() => router.push("/cart")}
                >
                  <div className="p-2 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors">
                    <ShoppingCart className="w-5 h-5 text-pink-600" />
                  </div>
                  <span className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors">Cart</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {totalItems}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="bg-gradient-to-r from-pink-50 to-amber-50 shadow-sm mt-21 relative z-40 border-t border-pink-100"
            ref={dropdownRef}
          >
            <div className="container mx-auto px-2 flex items-center justify-center relative">
              <div className="flex items-center justify-start flex-wrap space-x-4 py-2 nav-scroll-container">
                {!categoriesLoading &&
                  Object.keys(groupedCategories).map((group) => {
                    const categoriesByType = groupedCategories[group].reduce(
                      (acc: any, category) => {
                        const type = category.type;
                        if (!acc[type]) {
                          acc[type] = [];
                        }
                        acc[type].push(category);
                        return acc;
                      },
                      {}
                    );

                    return (
                      <div
                        key={group}
                        className="relative flex-shrink-0"
                        onMouseEnter={() => {
                          if (groupedCategories[group].length > 1) {
                            handleDropdown(group.toLowerCase());
                          }
                        }}
                        onMouseLeave={handleMouseLeave}
                      >
                        <button
                          className="flex items-center space-x-1 hover:text-pink-600 font-medium whitespace-nowrap  px-2 py-[6px] rounded-md transition-colors duration-200 group"
                          onClick={(e) => {
                            if (groupedCategories[group].length === 1) {
                              handleCategoryClick(
                                groupedCategories[group][0].slug,
                                e
                              );
                            }
                          }}
                        >
                          <span className="font-extrabold text-sm group-hover:text-pink-600 transition-colors">
                            {group}
                          </span>
                        </button>

                        {isDropdownOpen === group.toLowerCase() &&
                          groupedCategories[group].length > 1 && (
                            <div
                              className={`absolute top-full ${group === "Famous Character Cake" ? "-left-80" : "-left-1"} bg-white backdrop-blur-lg shadow-xl rounded-xl border border-pink-100 overflow-hidden`}
                              style={{
                                boxShadow: "0 20px 40px rgba(249, 168, 212, 0.2), 0 0 20px rgba(249, 168, 212, 0.1)",
                                zIndex: 9999,
                              }}
                            >
                              <div>
                                {Object.keys(categoriesByType).length > 1 ? (
                                  <div className="flex flex-row gap-4">
                                    {Object.entries(categoriesByType).map(
                                      ([type, typeCategories]: [string, any], index: number) => (
                                        <div
                                          key={type}
                                          className={`w-60 p-2 relative overflow-hidden ${index % 2 === 0
                                              ? "bg-gradient-to-br from-pink-50 to-amber-50"
                                              : "bg-white"
                                            }`}
                                        >
                                          <div className="p-4">
                                            <h3 className="text-sm font-bold text-pink-600 mb-2 border-b border-pink-200 pb-2 whitespace-nowrap">
                                              {type}
                                            </h3>
                                            <div className="">
                                              {typeCategories.map((category: any) => (
                                                <button
                                                  key={category._id}
                                                  onClick={(e) =>
                                                    handleCategoryClick(
                                                      category.slug,
                                                      e
                                                    )
                                                  }
                                                  className="flex text-left py-2 px-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-amber-100 hover:text-pink-700 rounded-lg transition-all duration-300 font-medium whitespace-nowrap line-clamp-1 w-full hover:shadow-sm transform hover:scale-105"
                                                >
                                                  {category.name}
                                                </button>
                                              ))}
                                              <div className="flex-grow" />
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div className="p-3 flex flex-col">
                                    {groupedCategories[group].map((category) => (
                                      <button
                                        key={category._id}
                                        onClick={(e) =>
                                          handleCategoryClick(
                                            category.slug,
                                            e
                                          )
                                        }
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-amber-100 hover:text-pink-700 rounded-lg transition-all duration-300 font-medium whitespace-nowrap transform hover:scale-105 hover:shadow-sm"
                                      >
                                        {category.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
                <Link href="/customized-cakes">
                  <span className="font-extrabold text-sm text-gray-800 hover:text-pink-600 cursor-pointer transition-colors">
                    Customized Cakes
                  </span>
                </Link>
              </div>
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-pink-50/50 to-transparent pointer-events-none z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-amber-50/50 to-transparent pointer-events-none z-10"></div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity duration-300">
          <div
            ref={mobileMenuRef}
            className="fixed left-0 top-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-pink-50 to-amber-50 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto"
            style={{
              transform: isMobileMenuOpen
                ? "translateX(0)"
                : "translateX(-100%)",
            }}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-pink-200 bg-white">
              <Image
                src="/logo.webp"
                alt="cakes wow Logo"
                width={120}
                height={20}
                className="cursor-pointer mr-8"
                onClick={() => router.push("/")}
              />
              <button
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-pink-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-pink-600" />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <div className="py-2">
              {!categoriesLoading &&
                Object.keys(groupedCategories).map((group) => (
                  <div
                    key={group}
                    className="border-b border-pink-100 last:border-b-0"
                  >
                    {groupedCategories[group].length > 1 ? (
                      <>
                        <button
                          onClick={() => toggleCategory(group)}
                          className="w-full flex items-center justify-between p-4 hover:bg-pink-50 transition-colors text-left"
                        >
                          <span className="font-medium text-gray-800">
                            {group}
                          </span>
                          {expandedCategory === group ? (
                            <Minus className="w-5 h-5 text-pink-500" />
                          ) : (
                            <Plus className="w-5 h-5 text-pink-500" />
                          )}
                        </button>

                        {expandedCategory === group && (
                          <div className="bg-white border-t border-pink-200">
                            <div className="p-4">
                              {groupedCategories[group].map((category) => (
                                <button
                                  key={category._id}
                                  onClick={(e) =>
                                    handleCategoryClick(category.slug, e)
                                  }
                                  className="block w-full text-left text-sm text-gray-600 hover:text-pink-600 py-2 px-4 hover:bg-pink-50 rounded-lg transition-colors"
                                >
                                  {category.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={(e) =>
                          handleCategoryClick(
                            groupedCategories[group][0].slug,
                            e
                          )
                        }
                        className="block w-full text-left p-4 hover:bg-pink-50 transition-colors font-medium text-gray-800"
                      >
                        {group}
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {/* User Actions in Mobile Menu */}
            <div className="p-4 border-t border-pink-200 space-y-3 bg-white">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      router.push("/orders");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <Package className="w-5 h-5 text-pink-600" />
                    <span className="font-medium text-gray-800">My Orders</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 text-pink-600" />
                    <span className="font-medium text-gray-800">Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-pink-600" />
                    <span className="font-medium text-gray-800">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-pink-50 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-pink-600" />
                  <span className="font-medium text-gray-800">
                    Login/Signup
                  </span>
                </button>
              )}
              <button
                onClick={() => {
                  router.push("/wishlist");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 p-3 hover:bg-pink-50 rounded-lg transition-colors"
              >
                <Heart className="w-5 h-5 text-pink-600" />
                <span className="font-medium text-gray-800">Wishlist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Sidebar Overlay */}
      {isRightSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300">
          <div
            ref={rightSidebarRef}
            className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-pink-50 to-amber-50 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto"
            style={{
              transform: isRightSidebarOpen
                ? "translateX(0)"
                : "translateX(100%)",
            }}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-pink-200 bg-white">
              <h2 className="text-xl font-bold text-pink-600">Menu</h2>
              <button
                onClick={() => setIsRightSidebarOpen(false)}
                className="p-2 hover:bg-pink-100 rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-6 h-6 text-pink-600" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="p-6 flex flex-col space-y-6">
              {/* Login (if no user) */}
              {!user && (
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setIsRightSidebarOpen(false);
                  }}
                  className="flex items-center space-x-3 justify-center w-full py-4 bg-gradient-to-r from-pink-100 to-amber-100 rounded-lg hover:from-pink-200 hover:to-amber-200 transition-colors shadow-md"
                >
                  <LogIn className="w-8 h-8 text-pink-600" />
                  <span className="text-2xl font-bold text-pink-600">Login</span>
                </button>
              )}

              {/* My Orders */}
              {user && (
                <button
                  onClick={() => {
                    router.push("/orders");
                    setIsRightSidebarOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full py-3 px-4 rounded-lg hover:bg-pink-50 transition-colors text-lg font-medium text-gray-800 justify-start"
                >
                  <Package className="w-6 h-6 text-pink-600" />
                  <span>My Orders</span>
                </button>
              )}

              {/* Track Order */}
              <button className="flex items-center space-x-3 w-full py-3 px-4 rounded-lg hover:bg-pink-50 transition-colors text-lg font-medium text-gray-800 justify-start">
                <Package className="w-6 h-6 text-pink-600" />
                <span>Track Order</span>
              </button>

              {/* About Us */}
              <button className="flex items-center space-x-3 w-full py-3 px-4 rounded-lg hover:bg-pink-50 transition-colors text-lg font-medium text-gray-800 justify-start">
                <Info className="w-6 h-6 text-pink-600" />
                <span>About Us</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogin && <Login setShowLogin={setShowLogin} isVisible={showLogin} />}
    </>
  );
};

export default Header;