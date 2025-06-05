"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCategories } from "@/contexts/CategoriesContext";
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

const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { groupedCategories, loading: categoriesLoading } = useCategories();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Helper function to handle category navigation
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
        {" "}
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gradient-to-r from-white via-pink-50/30 to-orange-50/30 backdrop-blur-md shadow-lg border-b border-pink-100/50">
          {" "}
          {/* Left side - Hamburger + Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-trigger p-2.5 hover:bg-gradient-to-r hover:from-pink-100 hover:to-orange-100 rounded-xl transition-all duration-300 transform hover:scale-110 group"
            >
              <Menu className="w-5 h-5 text-gray-700 group-hover:text-pink-600 transition-colors" />
            </button>{" "}
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
                className="drop-shadow-md"
              />
            </div>
          </div>{" "}
          {/* Right side - Icons */}
          <div className="flex items-center space-x-1">
            <Link href="/m-search">
              <button className="p-2.5 hover:bg-gradient-to-r hover:from-pink-100 hover:to-orange-100 rounded-xl transition-all duration-300 transform hover:scale-110 group">
                <Search className="w-5 h-5 text-gray-700 group-hover:text-pink-600 transition-colors" />
              </button>
            </Link>
            <Link href="/wishlist">
              <button className="p-2.5 hover:bg-gradient-to-r hover:from-pink-100 hover:to-orange-100 rounded-xl transition-all duration-300 transform hover:scale-110 group">
                <Heart className="w-5 h-5 text-gray-700 group-hover:text-pink-600 transition-colors" />
              </button>
            </Link>{" "}
            <Link href="/cart">
              <button className="p-2.5 hover:bg-gradient-to-r hover:from-pink-100 hover:to-orange-100 rounded-xl transition-all duration-300 transform hover:scale-110 relative group">
                <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-pink-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>
            <button
              className="p-2.5 hover:bg-gradient-to-r hover:from-pink-100 hover:to-orange-100 rounded-xl transition-all duration-300 transform hover:scale-110 right-sidebar-trigger group"
              onClick={() => setIsRightSidebarOpen(true)}
              aria-label="Open more menu"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-700 group-hover:text-pink-600 transition-colors" />
            </button>
          </div>
        </div>{" "}
        {/* Desktop Header */}
        <div className="hidden lg:block">
          {/* Main header */}
          <div className="container bg-white lg:px-10 md:px-10 shadow-md min-w-screen mx-auto py-6 fixed top-0 left-0 right-0 z-50">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <div
                className="flex items-center cursor-pointer"
                onClick={() => router.push("/")}
              >
                <Image
                  src="/logo.webp"
                  alt="cakes wow Logo"
                  width={140}
                  height={48}
                />
              </div>{" "}
              {/* Location */}
              <div className="flex items-center space-x-2 cursor-pointer">
                <MapPin className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-sm text-gray-500">Deliver to</div>
                  <div className="font-medium">Select Location</div>
                </div>
              </div>{" "}
              {/* Search */}
              <div className="flex-1 max-w-lg mx-8">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search for cakes, pastries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>
              </div>{" "}
              {/* Right side */}
              <div className="flex items-center space-x-6">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div
                      className="flex items-center space-x-1 cursor-pointer"
                      onClick={() => router.push("/dashboard")}
                    >
                      <User className="w-5 h-5" />
                      <span>{user.phoneNumber}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex items-center space-x-1 cursor-pointer right-sidebar-trigger"
                    onClick={() => setShowLogin(true)}
                  >
                    <User className="w-5 h-5" />
                    <span>Login/Signup</span>
                  </div>
                )}{" "}
                <div
                  className="flex items-center space-x-1 cursor-pointer relative"
                  onClick={() => router.push("/cart")}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>{" "}
          {/* Desktop Navigation */}
          <nav
            className=" border-gray-200  shadow-sm mt-23 relative z-40"
            ref={dropdownRef}
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.1), 0 -1px 2px rgba(0,0,0,0.1)",
            }}
          >
            <div className="container flex items-center justify-center px-6 relative">
              <div className="flex items-center justify-start flex-wrap space-x-6 py-1 nav-scroll-container">
                {!categoriesLoading &&
                  Object.keys(groupedCategories).map((group) => {
                    // Group categories by type within each group
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
                        {" "}
                        <button
                          className="flex items-center space-x-1 hover:text-red-500 font-medium whitespace-nowrap text-sm px-3 py-2 rounded-md transition-colors duration-200"
                          onClick={(e) => {
                            if (groupedCategories[group].length === 1) {
                              handleCategoryClick(
                                groupedCategories[group][0].slug,
                                e
                              );
                            }
                          }}
                        >
                          <span>{group}</span>
                          {groupedCategories[group].length > 1 && (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>{" "}
                        {isDropdownOpen === group.toLowerCase() &&
                          groupedCategories[group].length > 1 && (
                            <div
                              className={`absolute top-full -left-14 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-pink-100/50 overflow-hidden`}
                              style={{
                                boxShadow:
                                  "0 20px 40px rgba(0,0,0,0.15), 0 0 20px rgba(236, 72, 153, 0.1)",
                                marginTop: "4px",
                                zIndex: 9999,
                              }}
                            >
                              <div>
                                {/* MODIFIED: p-4 to p-3 */}
                                {Object.keys(categoriesByType).length > 1 ? (
                                  // Multiple types - organize by type with dynamic width
                                  <div
                                    className="flex flex-row gap-4" // This class might be overridden by style below
                                    // style={{
                                    //   display: "grid",
                                    //   gridTemplateColumns: `repeat(${Math.min(
                                    //     Object.keys(categoriesByType).length,
                                    //     5
                                    //   )}, minmax(10px, max-content))`,
                                    //   gap: "0rem", // MODIFIED: 1.5rem to 1rem
                                    // }}
                                  >
                                    {Object.entries(categoriesByType).map(
                                      (
                                        [type, typeCategories]: [string, any],
                                        index: number
                                      ) => (
                                        <div
                                          key={type}
                                          className={`w-60 p-2 relative overflow-hidden ${
                                            /* MODIFIED: p-4 to p-2.5 */
                                            index % 2 === 0
                                              ? "bg-gradient-to-br from-pink-50/80 to-orange-50/80"
                                              : "bg-gradient-to-br from-white to-pink-50/30"
                                          }`}
                                        >
                                          {" "}
                                          <div className="p-4">
                                            <h3 className="text-sm font-bold text-gray-900 mb-2 border-b border-pink-200/50 pb-2 whitespace-nowrap bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text">
                                              {type}
                                            </h3>
                                            <div className="">
                                              {typeCategories.map(
                                                (category: any) => (
                                                  <button
                                                    key={category._id}
                                                    onClick={(e) =>
                                                      handleCategoryClick(
                                                        category.slug,
                                                        e
                                                      )
                                                    }
                                                    className="flex text-left py-2 px-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-orange-100 hover:text-pink-700 rounded-lg transition-all duration-300 font-medium whitespace-nowrap line-clamp-1 w-full hover:shadow-sm transform hover:scale-105"
                                                  >
                                                    {category.name}
                                                  </button>
                                                )
                                              )}
                                              <div className="flex-grow" />
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  // Single type - simple list
                                  <div className="p-3 flex flex-col">
                                    {groupedCategories[group].map(
                                      (category) => (
                                        <button
                                          key={category._id}
                                          onClick={(e) =>
                                            handleCategoryClick(
                                              category.slug,
                                              e
                                            )
                                          }
                                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-orange-100 hover:text-pink-700 rounded-lg transition-all duration-300 font-medium whitespace-nowrap transform hover:scale-105 hover:shadow-sm"
                                        >
                                          {category.name}
                                        </button>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
              </div>{" "}
              {/* Gradient fade indicators for scrollable content */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-pink-50/20 to-transparent pointer-events-none z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-pink-50/20 to-transparent pointer-events-none z-10"></div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 bg-opacity-80 z-50 transition-opacity duration-300">
          <div
            ref={mobileMenuRef}
            className="fixed left-0 top-0 h-full w-2/3 bg-white shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto"
            style={{
              transform: isMobileMenuOpen
                ? "translateX(0)"
                : "translateX(-100%)",
            }}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>{" "}
            {/* Search in Mobile Menu */}
            {/* Mobile Menu Items */}
            <div className="py-2">
              {!categoriesLoading &&
                Object.keys(groupedCategories).map((group) => (
                  <div
                    key={group}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    {groupedCategories[group].length > 1 ? (
                      <>
                        <button
                          onClick={() => toggleCategory(group)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="font-medium text-gray-800">
                            {group}
                          </span>
                          {expandedCategory === group ? (
                            <Minus className="w-5 h-5 text-gray-500" />
                          ) : (
                            <Plus className="w-5 h-5 text-gray-500" />
                          )}
                        </button>

                        {expandedCategory === group && (
                          <div className="bg-gray-50 border-t border-gray-200">
                            <div className="p-4">
                              {groupedCategories[group].map((category) => (
                                <button
                                  key={category._id}
                                  onClick={(e) =>
                                    handleCategoryClick(category.slug, e)
                                  }
                                  className="block w-full text-left text-sm text-gray-600 hover:text-red-500 py-2 transition-colors"
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
                        className="block w-full text-left p-4 hover:bg-gray-50 transition-colors font-medium text-gray-800"
                      >
                        {group}
                      </button>
                    )}
                  </div>
                ))}
            </div>{" "}
            {/* User Actions in Mobile Menu */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              {user ? (
                <>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-800">
                      {user.phoneNumber}
                    </span>
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-800">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-800">
                    Login/Signup
                  </span>
                </button>
              )}
              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">Wishlist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Sidebar Overlay */}
      {isRightSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 bg-opacity-50 transition-opacity duration-300 ">
          <div
            ref={rightSidebarRef}
            className="fixed top-0 right-0 h-full w-2/3 max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto"
            style={{
              transform: isRightSidebarOpen
                ? "translateX(0)"
                : "translateX(100%)",
            }}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-red-500">Menu</h2>
              <button
                onClick={() => setIsRightSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            {/* Sidebar Content */}
            <div className="p-6 flex flex-col space-y-8">
              {/* Login (if no user) */}
              <button onClick={() => setShowLogin(true)} className="flex items-center space-x-3 justify-center w-full py-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <LogIn className="w-8 h-8 text-red-500" />
                <span className="text-2xl font-bold text-red-600">Login</span>
              </button>
              {/* Track Order */}
              <button className="flex items-center space-x-3 w-full py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium text-gray-800 justify-start">
                <Package className="w-6 h-6 text-gray-500" />
                <span>Track Order</span>
              </button>
              {/* About Us */}
              <button className="flex items-center space-x-3 w-full py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium text-gray-800 justify-start">
                <Info className="w-6 h-6 text-gray-500" />
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
