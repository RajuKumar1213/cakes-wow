'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  ArrowLeft,
  Package,
  DollarSign,
  Star,
  Camera,
  Save,
  X
} from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  weightOptions: { weight: string; price: number }[];
}

const ProductCard = ({ product, onEdit, onDelete, onToggleStatus }: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div className="relative">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
        product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {product.isActive ? 'Active' : 'Inactive'}
      </div>
    </div>
    
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
      
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
        {product.originalPrice && (
          <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
        )}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span className="bg-gray-100 px-2 py-1 rounded">{product.category}</span>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{product.rating} ({product.reviewCount})</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-1"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(product.id, !product.isActive)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            product.isActive 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {product.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const ProductForm = ({ product, onSave, onCancel }: {
  product?: Product;
  onSave: (productData: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    category: product?.category || 'cakes',
    imageUrl: product?.imageUrl || '',
    weightOptions: product?.weightOptions || [{ weight: '500g', price: 0 }]
  });

  const categories = ['cakes', 'pastries', 'cookies', 'breads', 'desserts', 'chocolates'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined
    });
  };

  const addWeightOption = () => {
    setFormData(prev => ({
      ...prev,
      weightOptions: [...prev.weightOptions, { weight: '', price: 0 }]
    }));
  };

  const removeWeightOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      weightOptions: prev.weightOptions.filter((_, i) => i !== index)
    }));
  };

  const updateWeightOption = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      weightOptions: prev.weightOptions.map((option, i) => 
        i === index ? { ...option, [field]: field === 'price' ? Number(value) : value } : option
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (₹) - Optional
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Weight Options
                </label>
                <button
                  type="button"
                  onClick={addWeightOption}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  Add Option
                </button>
              </div>
              <div className="space-y-2">
                {formData.weightOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Weight (e.g., 500g)"
                      value={option.weight}
                      onChange={(e) => updateWeightOption(index, 'weight', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Additional Price"
                      value={option.price}
                      onChange={(e) => updateWeightOption(index, 'price', e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {formData.weightOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWeightOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t">
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {product ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminProducts() {
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Chocolate Truffle Cake',
        description: 'Rich chocolate cake with truffle frosting',
        price: 850,
        originalPrice: 1000,
        category: 'cakes',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        rating: 4.8,
        reviewCount: 124,
        isActive: true,
        createdAt: '2024-01-15',
        weightOptions: [
          { weight: '500g', price: 0 },
          { weight: '1kg', price: 400 },
          { weight: '2kg', price: 900 }
        ]
      },
      {
        id: '2',
        name: 'Red Velvet Cake',
        description: 'Classic red velvet with cream cheese frosting',
        price: 750,
        category: 'cakes',
        imageUrl: 'https://images.unsplash.com/photo-1586985289906-406988974504?w=400',
        rating: 4.6,
        reviewCount: 89,
        isActive: true,
        createdAt: '2024-01-14',
        weightOptions: [
          { weight: '500g', price: 0 },
          { weight: '1kg', price: 350 }
        ]
      },
      {
        id: '3',
        name: 'Chocolate Chip Cookies',
        description: 'Freshly baked chocolate chip cookies',
        price: 250,
        category: 'cookies',
        imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
        rating: 4.5,
        reviewCount: 67,
        isActive: false,
        createdAt: '2024-01-13',
        weightOptions: [
          { weight: '250g', price: 0 },
          { weight: '500g', price: 200 }
        ]
      }
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      // Update existing product
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...productData }
          : p
      ));
      addToast('Product updated successfully!', 'success');
    } else {
      // Add new product
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        rating: 0,
        reviewCount: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      setProducts(prev => [newProduct, ...prev]);
      addToast('Product created successfully!', 'success');
    }
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast('Product deleted successfully!', 'success');
    }
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, isActive } : p
    ));
    addToast(`Product ${isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  const categories = ['all', 'cakes', 'pastries', 'cookies', 'breads', 'desserts', 'chocolates'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Product Management</h1>
            </div>
            <button
              onClick={handleAddProduct}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first product.'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={handleAddProduct}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(undefined);
          }}
        />
      )}
    </div>
  );
}
