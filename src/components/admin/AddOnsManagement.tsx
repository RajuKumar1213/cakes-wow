"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Loader2,
  Grid3X3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import AddOnForm from "@/components/AddOnForm";

interface AddOn {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface AddOnsManagementProps {
  onLoadingChange?: (loading: boolean) => void;
}

export default function AddOnsManagement({ onLoadingChange }: AddOnsManagementProps) {
  const { showSuccess, showError } = useToast();
  // State management
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [filteredAddons, setFilteredAddons] = useState<AddOn[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddOnForm, setShowAddOnForm] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | undefined>();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [addonsLoading, setAddonsLoading] = useState(false);

  // Load addons on mount
  useEffect(() => {
    fetchAddOns();
  }, []);

  // Update loading state
  useEffect(() => {
    onLoadingChange?.(addonsLoading);
  }, [addonsLoading, onLoadingChange]);
  // Filter and sort addons
  useEffect(() => {
    let filtered = addons;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(addon =>
        addon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort addons
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredAddons(filtered);
  }, [addons, searchTerm, sortBy, sortOrder]);

  // Fetch addons
  const fetchAddOns = async () => {
    setAddonsLoading(true);
    try {
      const response = await fetch('/api/addons');
      const data = await response.json();
      
      if (data.success) {
        setAddons(data.data);
      } else {
        showError("Error", "Failed to load add-ons");
      }
    } catch (error) {
      console.error('Failed to fetch add-ons:', error);
      showError("Error", "Failed to load add-ons");
    } finally {
      setAddonsLoading(false);
    }
  };

  // Delete addon
  const handleDeleteAddOn = async (addonId: string) => {
    if (!confirm("Are you sure you want to delete this add-on?")) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/addons/${addonId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess("Success", "Add-on deleted successfully!");
        fetchAddOns();
      } else {
        showError("Error", data.error || "Failed to delete add-on");
      }
    } catch (error) {
      console.error('Failed to delete add-on:', error);
      showError("Error", "Failed to delete add-on");
    } finally {
      setDeleteLoading(false);
    }
  };
  // Handle sort
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderTableView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Add-on
                  {sortBy === 'name' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center gap-1">
                  Price
                  {sortBy === 'price' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center gap-1">
                  Rating
                  {sortBy === 'rating' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('created')}
              >
                <div className="flex items-center gap-1">
                  Created
                  {sortBy === 'created' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAddons.map((addon) => (
              <tr key={addon._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {addon.image ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={addon.image}
                          alt={addon.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {addon.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ₹{addon.price}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(addon.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{addon.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(addon.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingAddOn(addon);
                        setShowAddOnForm(true);
                      }}
                      className="text-orange-600 hover:text-orange-900 transition-colors"
                      title="Edit Add-on"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddOn(addon._id)}
                      disabled={deleteLoading}
                      className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                      title="Delete Add-on"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredAddons.map((addon) => (
        <div key={addon._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-video bg-gray-200 relative">
            {addon.image ? (
              <img
                src={addon.image}
                alt={addon.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
              {addon.name}
            </h3>
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold text-gray-900">
                ₹{addon.price}
              </div>
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(addon.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">{addon.rating}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-3">
              {new Date(addon.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingAddOn(addon);
                  setShowAddOnForm(true);
                }}
                className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteAddOn(addon._id)}
                disabled={deleteLoading}
                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                title="Delete Add-on"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search add-ons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
              />
            </div>            {/* Category Filter - Removed since AddOn interface doesn't have categories */}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${viewMode === 'table'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${viewMode === 'grid'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Grid
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowAddOnForm(true)}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Add-on
          </button>
        </div>        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
          <div>
            Showing {filteredAddons.length} of {addons.length} add-ons
            {searchTerm && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Search: "{searchTerm}"
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <span className="font-medium capitalize">{sortBy}</span>
            <span className="text-xs">({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})</span>
          </div>
        </div>
      </div>

      {/* Add-ons Display */}
      {addonsLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading add-ons...</p>
          </div>
        </div>
      ) : filteredAddons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Add-ons Found</h3>            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "No add-ons match your current search."
                : "Get started by creating your first add-on."
              }
            </p>
            <button
              onClick={() => setShowAddOnForm(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Add-on
            </button>
          </div>
        </div>
      ) : (
        viewMode === 'table' ? renderTableView() : renderGridView()
      )}

      {/* Add-on Form Modal */}
      {showAddOnForm && (
        <AddOnForm
          addOn={editingAddOn}
          onCancel={() => {
            setShowAddOnForm(false);
            setEditingAddOn(undefined);
          }}
          onSuccess={() => {
            setShowAddOnForm(false);
            setEditingAddOn(undefined);
            fetchAddOns();
          }}
        />
      )}
    </>
  );
}
