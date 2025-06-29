"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  Key,
} from "react";

// Types
export interface AddOn {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
}

export interface CartItem {
  _id: Key | null | undefined;
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
  selectedAddOns?: AddOn[];
  preparationTime?: string; // e.g., "4-6 hours", "3 hours"
  customization?: {
    type: "photo-cake";
    image: File | null;
    message: string;
    imageUrl: string | null;
  };
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
  addToCart: (
    product: any,
    quantity?: number,
    selectedWeight?: string,
    selectedAddOns?: AddOn[]
  ) => void;

  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCartItemAddOns: (itemId: string, addOns: AddOn[]) => void;
  clearCart: () => void;
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isInCart: (productId: string) => boolean;
  getCartItemByProductId: (productId: string) => CartItem | undefined;
}

// Action types
type CartAction =
  | {
    type: "ADD_TO_CART";
    payload: {
      product: any;
      quantity: number;
      selectedWeight?: string;
      selectedAddOns?: AddOn[];
    };
  }
  | { type: "REMOVE_FROM_CART"; payload: { itemId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { itemId: string; quantity: number } }
  | {
    type: "UPDATE_CART_ITEM_ADDONS";
    payload: { itemId: string; addOns: AddOn[] };
  }
  | { type: "CLEAR_CART" }
  | { type: "ADD_TO_WISHLIST"; payload: { product: any } }
  | { type: "REMOVE_FROM_WISHLIST"; payload: { productId: string } }
  | {
    type: "LOAD_CART";
    payload: { items: CartItem[]; wishlist: WishlistItem[] };
  }
  | { type: "SET_LOADING"; payload: { isLoading: boolean } };

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
    const basePrice = item.discountedPrice || item.price;
    const addOnsPrice =
      item.selectedAddOns?.reduce(
        (addOnSum, addOn) => addOnSum + addOn.price,
        0
      ) || 0;
    const itemTotal = (basePrice + addOnsPrice) * item.quantity;
    return sum + itemTotal;
  }, 0);
  return { totalItems, totalPrice };
};

const generateCartItemId = (productId: string, selectedWeight?: string) => {
  return selectedWeight ? `${productId}-${selectedWeight}` : productId;
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { product, quantity, selectedWeight, selectedAddOns } =
        action.payload;
      const itemId = generateCartItemId(product._id, selectedWeight);

      // Check if item already exists
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === itemId
      );
      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Get weight option for price calculation when updating existing item
        const weightOption = selectedWeight
          ? product.weightOptions?.find((w: any) => w.weight === selectedWeight)
          : null;

        // Update existing item quantity and preserve preparation time
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? {
              ...item,
              quantity: item.quantity + quantity,
              price: weightOption?.price || product.price,
              discountedPrice:
                weightOption?.discountedPrice || product.discountedPrice,
              selectedAddOns: selectedAddOns || item.selectedAddOns,
              preparationTime:
                product.preparationTime || item.preparationTime, // Ensure prep time is updated
              customization: product.customization || item.customization, // Update customization if provided
            }
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
          imageUrl: product.imageUrls?.[0] || "",
          price: weightOption?.price || product.price,
          discountedPrice:
            weightOption?.discountedPrice || product.discountedPrice,
          weight: selectedWeight || product.weightOptions?.[0]?.weight || "1kg",
          quantity,
          selectedWeight,
          weightOptions: product.weightOptions,
          selectedAddOns: selectedAddOns || [],
          preparationTime: product.preparationTime, // Add preparation time from product
          customization: product.customization, // Add customization data for photo cakes
          _id: undefined,
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

    case "REMOVE_FROM_CART": {
      const { itemId } = action.payload;
      const newItems = state.items.filter((item) => item.id !== itemId);
      const { totalItems, totalPrice } = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case "UPDATE_QUANTITY": {
      const { itemId, quantity } = action.payload;

      if (quantity <= 0) {
        return cartReducer(state, {
          type: "REMOVE_FROM_CART",
          payload: { itemId },
        });
      }

      const newItems = state.items.map((item) =>
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

    case "CLEAR_CART": {
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    }

    case "ADD_TO_WISHLIST": {
      const { product } = action.payload;

      // Check if product already exists in wishlist
      const exists = state.wishlist.some(
        (item) => item.productId === product._id
      );
      if (exists) return state;

      const newWishlistItem: WishlistItem = {
        id: `wishlist-${product._id}`,
        productId: product._id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrls?.[0] || "",
        price: product.price,
        discountedPrice: product.discountedPrice,
        addedAt: new Date().toISOString(),
      };

      return {
        ...state,
        wishlist: [...state.wishlist, newWishlistItem],
      };
    }

    case "REMOVE_FROM_WISHLIST": {
      const { productId } = action.payload;
      const newWishlist = state.wishlist.filter(
        (item) => item.productId !== productId
      );

      return {
        ...state,
        wishlist: newWishlist,
      };
    }

    case "LOAD_CART": {
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

    case "SET_LOADING": {
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
    }

    case "UPDATE_CART_ITEM_ADDONS": {
      const { itemId, addOns } = action.payload;
      const newItems = state.items.map((item) =>
        item.id === itemId ? { ...item, selectedAddOns: addOns } : item
      );

      const { totalItems, totalPrice } = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    default:
      return state;
  }
};

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage keys
const CART_STORAGE_KEY = "bakingo-cart";
const WISHLIST_STORAGE_KEY = "bakingo-wishlist";

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

      dispatch({ type: "LOAD_CART", payload: { items, wishlist } });
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      dispatch({ type: "SET_LOADING", payload: { isLoading: false } });
    }
  }, []);
  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!state.isLoading) {
      try {
        // Create a lightweight version of cart items for storage
        const itemsToStore = state.items.map(item => ({
          ...item,
          // For photo cakes, remove the File object to save space
          customization: item.customization ? {
            ...item.customization,
            image: null, // Remove File object, keep imageUrl
            imageUrl: item.customization.imageUrl
          } : item.customization
        }));
        
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(itemsToStore));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
        
        // If storage quota exceeded, try to clear some space
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn("localStorage quota exceeded, attempting cleanup...");
          try {
            // Clear old pending orders and other non-essential data
            localStorage.removeItem('pending-order');
            localStorage.removeItem('bakingo-selected-addons');
            localStorage.removeItem('bakingo-addon-quantities');
            
            // Try again with minimal data
            const minimalItems = state.items.map(item => ({
              id: item.id,
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              weight: item.weight,
              customization: item.customization ? {
                type: item.customization.type,
                message: item.customization.message,
                imageUrl: item.customization.imageUrl,
                image: null
              } : undefined
            }));
            
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(minimalItems));
            console.log("Cart saved with minimal data after cleanup");
          } catch (retryError) {
            console.error("Failed to save cart even after cleanup:", retryError);
          }
        }
      }
    }
  }, [state.items, state.isLoading]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      try {
        localStorage.setItem(
          WISHLIST_STORAGE_KEY,
          JSON.stringify(state.wishlist)
        );
      } catch (error) {
        console.error("Error saving wishlist to localStorage:", error);
      }
    }
  }, [state.wishlist, state.isLoading]);
  // Actions
  const addToCart = (
    product: any,
    quantity: number = 1,
    selectedWeight?: string,
    selectedAddOns?: AddOn[]
  ) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { product, quantity, selectedWeight, selectedAddOns },
    });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { itemId } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { itemId, quantity } });
  };

  const updateCartItemAddOns = (itemId: string, addOns: AddOn[]) => {
    dispatch({ type: "UPDATE_CART_ITEM_ADDONS", payload: { itemId, addOns } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const addToWishlist = (product: any) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: { product } });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: { productId } });
  };

  const isInWishlist = (productId: string): boolean => {
    return state.wishlist.some((item) => item.productId === productId);
  };

  const isInCart = (productId: string): boolean => {
    return state.items.some((item) => item.productId === productId);
  };

  const getCartItemByProductId = (productId: string): CartItem | undefined => {
    return state.items.find((item) => item.productId === productId);
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateCartItemAddOns,
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
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
