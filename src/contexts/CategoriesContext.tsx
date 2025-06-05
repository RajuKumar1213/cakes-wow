'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Types
interface Category {
  _id: string;
  name: string;
  slug: string;
  group: string;
  type: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

interface GroupedCategories {
  [group: string]: Category[];
}

interface CategoriesState {
  categories: Category[];
  groupedCategories: GroupedCategories;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface CategoriesContextType extends CategoriesState {
  refreshCategories: () => Promise<void>;
}

// Action types
type CategoriesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CATEGORIES'; payload: { categories: Category[]; groupedCategories: GroupedCategories } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: CategoriesState = {
  categories: [],
  groupedCategories: {},
  loading: false,
  error: null,
  lastFetched: null,
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Reducer
const categoriesReducer = (state: CategoriesState, action: CategoriesAction): CategoriesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload.categories,
        groupedCategories: action.payload.groupedCategories,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Context
const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

// Provider component
export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(categoriesReducer, initialState);

  const fetchCategories = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await axios.get('/api/categories');
       console.log(response.data);
      if (response.data.success) {
        // The API returns grouped categories by default
        const groupedData = response.data.data;
        
        // Create flat array of categories for other uses
        const flatCategories: Category[] = [];
        Object.keys(groupedData).forEach(group => {
          groupedData[group].forEach((category: any) => {
            flatCategories.push({
              ...category,
              group,
              isActive: true,
              sortOrder: 0,
            });
          });
        });
        
        dispatch({
          type: 'SET_CATEGORIES',
          payload: {
            categories: flatCategories,
            groupedCategories: groupedData,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch categories' });
    }
  };

  const refreshCategories = async () => {
    await fetchCategories();
  };

  // Check if cache is valid
  const isCacheValid = () => {
    if (!state.lastFetched) return false;
    return Date.now() - state.lastFetched < CACHE_DURATION;
  };
  // Fetch categories on mount or when cache is invalid
  useEffect(() => {
    if (!isCacheValid()) {
      fetchCategories();
    }
  }, []);

  const value: CategoriesContextType = {
    ...state,
    refreshCategories,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

// Hook to use categories context
export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
