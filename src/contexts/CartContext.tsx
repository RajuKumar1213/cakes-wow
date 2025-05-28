'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number;
  weight: string;
  quantity: number;
  selectedWeight?: string;
  weightOptions?: { weight: string; price: number }[];
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
  isLoading: boolean;
  totalItems: number;
  totalPrice: number;
}

interface CartContextType extends CartState {
  addToCart: (product: any, quantity?: number, selectedWeight?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isInCart: (productId: string) => boolean;
  getCartItemByProductId: (productId: string) => CartItem | undefined;
}

// Action types
type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: any; quantity: number; selectedWeight?: string } }
  | { type: 'REMOVE_FROM_CART'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_WISHLIST'; payload: { product: any } }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: { productId: string } }
  | { type: 'LOAD_CART'; payload: { items: CartItem[]; wishlist: WishlistItem[] } }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean } };

// Initial state
const initialState: CartState = {
  items: [],
  wishlist: [],
  isLoading: false,
  totalItems: 0,
  totalPrice: 0,
};

// Helper functions
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.discountedPrice || item.price;
    return sum + (price * item.quantity);
  }, 0);
  return { totalItems, totalPrice };
};

const generateCartItemId = (productId: string, selectedWeight?: string) => {
  return selectedWeight ? `${productId}-${selectedWeight}` : productId;
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity, selectedWeight } = action.payload;
      const itemId = generateCartItemId(product._id, selectedWeight);
      
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(item => item.id === itemId);
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const weightOption = selectedWeight 
          ? product.weightOptions?.find((w: any) => w.weight === selectedWeight)
          : null;
        
        const newItem: CartItem = {
          id: itemId,
          productId: product._id,
          name: product.name,
          slug: product.slug,
          imageUrl: product.imageUrls?.[0] || '',
          price: weightOption?.price || product.price,
          discountedPrice: product.discountedPrice,
          weight: selectedWeight || product.weightOptions?.[0]?.weight || '1kg',
          quantity,
          selectedWeight,
          weightOptions: product.weightOptions,
        };
        
        newItems = [...state.items, newItem];
      }
      
      const { totalItems, totalPrice } = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }
    
    case 'REMOVE_FROM_CART': {
      const { itemId } = action.payload;
      const newItems = state.items.filter(item => item.id !== itemId);
      const { totalItems, totalPrice } = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { itemId } });
      }
      
      const newItems = state.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      
      const { totalItems, totalPrice } = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }
    
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    }
    
    case 'ADD_TO_WISHLIST': {
      const { product } = action.payload;
      
      // Check if product already exists in wishlist
      const exists = state.wishlist.some(item => item.productId === product._id);
      if (exists) return state;
      
      const newWishlistItem: WishlistItem = {
        id: `wishlist-${product._id}`,
        productId: product._id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrls?.[0] || '',
        price: product.price,
        discountedPrice: product.discountedPrice,
        addedAt: new Date().toISOString(),
      };
      
      return {
        ...state,
        wishlist: [...state.wishlist, newWishlistItem],
      };
    }
    
    case 'REMOVE_FROM_WISHLIST': {
      const { productId } = action.payload;
      const newWishlist = state.wishlist.filter(item => item.productId !== productId);
      
      return {
        ...state,
        wishlist: newWishlist,
      };
    }
    
    case 'LOAD_CART': {
      const { items, wishlist } = action.payload;
      const { totalItems, totalPrice } = calculateTotals(items);
      
      return {
        ...state,
        items,
        wishlist,
        totalItems,
        totalPrice,
        isLoading: false,
      };
    }
    
    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
    }
    
    default:
      return state;
  }
};

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage keys
const CART_STORAGE_KEY = 'bakingo-cart';
const WISHLIST_STORAGE_KEY = 'bakingo-wishlist';

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      
      const items = savedCart ? JSON.parse(savedCart) : [];
      const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      
      dispatch({ type: 'LOAD_CART', payload: { items, wishlist } });
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!state.isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [state.items, state.isLoading]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state.wishlist));
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
      }
    }
  }, [state.wishlist, state.isLoading]);

  // Actions
  const addToCart = (product: any, quantity: number = 1, selectedWeight?: string) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity, selectedWeight } });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { itemId } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const addToWishlist = (product: any) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: { product } });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: { productId } });
  };

  const isInWishlist = (productId: string): boolean => {
    return state.wishlist.some(item => item.productId === productId);
  };

  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId);
  };

  const getCartItemByProductId = (productId: string): CartItem | undefined => {
    return state.items.find(item => item.productId === productId);
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isInCart,
    getCartItemByProductId,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
