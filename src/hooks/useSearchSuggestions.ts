import { useState, useEffect, useCallback, useRef } from 'react';

interface SearchProduct {
  _id: string;
  name: string;
  shortDescription: string;
  imageUrl: string;
  price: number;
  discountPrice?: number;
  slug: string;
  category: string;
  categorySlug: string;
}

interface SearchSuggestions {
  products: SearchProduct[];
  query: string;
  total: number;
}

export const useSearchSuggestions = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({
    products: [],
    query: '',
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions({ products: [], query: searchQuery, total: 0 });
      setSelectedIndex(-1);
      // Don't set showSuggestions to false - keep dropdown open to show popular searches
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Cancel previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`,
        {
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        throw new Error(data.error || 'Failed to fetch suggestions');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setSuggestions({ products: [], query: '', total: 0 });
        setSelectedIndex(-1);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback((searchQuery: string) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300); // 300ms delay
  }, [fetchSuggestions]);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);  const clearSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setSuggestions({ products: [], query: '', total: 0 });
    setError(null);
    setSelectedIndex(-1);
  }, []);

  const showDropdown = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  const handleKeyboardNavigation = useCallback((key: string) => {
    if (!showSuggestions || suggestions.products.length === 0) return null;

    switch (key) {
      case 'ArrowDown':
        setSelectedIndex(prev => {
          // For 2-column grid, move down by 2 positions or to next row
          const nextIndex = prev + 2;
          return nextIndex < suggestions.products.length ? nextIndex : Math.min(prev + 1, suggestions.products.length - 1);
        });
        return 'handled';
      case 'ArrowUp':
        setSelectedIndex(prev => {
          // For 2-column grid, move up by 2 positions or to previous row
          const prevIndex = prev - 2;
          return prevIndex >= 0 ? prevIndex : Math.max(prev - 1, -1);
        });
        return 'handled';
      case 'ArrowLeft':
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        return 'handled';
      case 'ArrowRight':
        setSelectedIndex(prev => prev < suggestions.products.length - 1 ? prev + 1 : prev);
        return 'handled';
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.products.length) {
          return suggestions.products[selectedIndex];
        }
        return null;
      case 'Escape':
        clearSuggestions();
        return 'handled';
      default:
        return null;
    }
  }, [showSuggestions, suggestions.products, selectedIndex, clearSuggestions]);

  const resetSearch = useCallback(() => {
    setQuery('');
    clearSuggestions();
  }, [clearSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  return {
    query,
    suggestions,
    isLoading,
    showSuggestions,
    error,
    selectedIndex,
    handleQueryChange,
    handleKeyboardNavigation,
    clearSuggestions,
    showDropdown,
    resetSearch,
    setShowSuggestions
  };
};
