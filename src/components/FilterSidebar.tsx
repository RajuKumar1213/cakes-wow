import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { X, RotateCcw, Sliders, ChevronDown, ChevronUp } from "lucide-react";

interface FilterSidebarProps {
  onFilterChange: (filters: Record<string, any>) => void;
  category?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

interface PriceRange {
  min: number;
  max: number;
}

const FilterSidebar = ({ onFilterChange, category, isOpen = false, onClose }: FilterSidebarProps) => {
  // Use ref to store the latest onFilterChange function
  const onFilterChangeRef = useRef(onFilterChange);
  onFilterChangeRef.current = onFilterChange;

  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: 0,
    max: 5000,
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange>({
    min: 0,
    max: 5000,
  });
  const [weightOptions, setWeightOptions] = useState<string[]>([]); const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [isBestseller, setIsBestseller] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track if initial data is loaded
  const initializedForCategoryRef = useRef<string | undefined | null>(null);
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    weight: true,
    type: true,
  });
  // Fetch price ranges and weight options
  useEffect(() => {
    const fetchRanges = async () => {
      // Guard clause: if already initialized for this category, do nothing.
      if (initializedForCategoryRef.current === category && isInitialized) {
        setLoading(false); // Ensure loading is false if we skipped
        return;
      }

      setLoading(true);
      setIsInitialized(false); // Reset initialization flag for a new fetch or different category

      try {
        const params = new URLSearchParams();
        if (category) {
          params.append("category", category);
        }
        const queryString = params.toString();
        const apiUrl = `/api/products/ranges${queryString ? `?${queryString}` : ""
          }`;

        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json(); const newPriceRange = data.data.priceRange || { min: 0, max: 5000 };
          setPriceRange(newPriceRange);
          setSelectedPriceRange(newPriceRange);
          setWeightOptions(data.data.weights || []);
          setIsInitialized(true);
          initializedForCategoryRef.current = category; // Mark this category as successfully initialized
        } else {
          console.error(
            "Failed to fetch ranges: Response not OK",
            response.status
          );
          setPriceRange({ min: 0, max: 5000 });
          setSelectedPriceRange({ min: 0, max: 5000 });
          setWeightOptions([]);
          if (initializedForCategoryRef.current === category) {
            initializedForCategoryRef.current = null;
          }
        }
      } catch (error) {
        console.error("Failed to fetch ranges:", error);
        setPriceRange({ min: 0, max: 5000 });
        setSelectedPriceRange({ min: 0, max: 5000 });
        setWeightOptions([]);
        if (initializedForCategoryRef.current === category) {
          initializedForCategoryRef.current = null;
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRanges();
  }, [category]); // Dependency only on category

  // Memoize selectedWeights as a string to prevent unnecessary re-renders
  const selectedWeightsStr = useMemo(
    () => selectedWeights.join(","),
    [selectedWeights]
  );

  // Track the previous filter values to detect actual changes
  const prevFiltersRef = useRef<string>("");

  // Apply filters when values change (with debounce for price)
  useEffect(() => {
    // Only apply filters if we're initialized and not loading
    if (!isInitialized || loading) {
      return;
    }

    const timeoutId = setTimeout(
      () => {
        const filters: Record<string, any> = {};

        if (selectedPriceRange.min > priceRange.min) {
          filters.minPrice = selectedPriceRange.min;
        }
        if (selectedPriceRange.max < priceRange.max) {
          filters.maxPrice = selectedPriceRange.max;
        } if (selectedWeights.length > 0) {
          filters.weights = selectedWeights;
        }
        if (isBestseller !== null) {
          filters.isBestseller = isBestseller;
        }

        // Create a string representation of current filters to compare
        const filtersStr = JSON.stringify(filters);

        // Only call onFilterChange if filters have actually changed
        if (filtersStr !== prevFiltersRef.current) {
          prevFiltersRef.current = filtersStr;
          onFilterChangeRef.current(filters);
        }
      },
      isDragging ? 0 : 300
    );

    return () => clearTimeout(timeoutId);
  }, [
    selectedPriceRange.min,
    selectedPriceRange.max,
    selectedWeightsStr,
    isBestseller,
    isDragging,
    isInitialized,
    loading,
    priceRange.min,
    priceRange.max,
  ]);

  // Handle price slider drag
  const handlePriceChange = (type: "min" | "max", value: number) => {
    setSelectedPriceRange((prev) => {
      const newRange = { ...prev };
      if (type === "min") {
        newRange.min = Math.min(value, prev.max - 50); // Ensure min is at least 50 less than max
      } else {
        newRange.max = Math.max(value, prev.min + 50); // Ensure max is at least 50 more than min
      }
      return newRange;
    });
  };

  // Handle weight selection
  const handleWeightChange = (weight: string) => {
    setSelectedWeights((prev) =>
      prev.includes(weight)
        ? prev.filter((w) => w !== weight)
        : [...prev, weight]
    );
  };
  // Reset all filters
  const resetFilters = () => {
    setSelectedPriceRange(priceRange);
    setSelectedWeights([]);
    setIsBestseller(null);
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  // Calculate percentage for slider position
  const getSliderPercentage = (value: number, type: "min" | "max") => {
    const range = priceRange.max - priceRange.min;
    return ((value - priceRange.min) / range) * 100;
  };

  // Handle quick price selection
  const handleQuickPriceSelect = (min: number, max: number) => {
    setSelectedPriceRange({ min, max });
  };
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={` rounded-3xl mr-4
          fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:relative lg:w-64 lg:translate-x-0 lg:shadow-lg lg:border-r lg:border-gray-200 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        data-filter-sidebar="true"
        data-testid="filter-sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl p-3 border-b border-gray-200 bg-gradient-to-r from-pink-300 to-orange-100">
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-pink-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetFilters}
              className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="h-full overflow-y-auto pb-20">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Price Range Filter */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection("price")}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Price Range
                  </h3>
                  {expandedSections.price ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>

                {expandedSections.price && (
                  <div className="space-y-4">
                    {/* Price Display */}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹{selectedPriceRange.min}</span>
                      <span>₹{selectedPriceRange.max}</span>
                    </div>
                    {/* Custom Dual Range Slider */}
                    <div className="dual-range-slider relative h-6 bg-gray-100 rounded-lg overflow-hidden">
                      {/* Track */}
                      <div className="absolute inset-0 bg-gray-200 rounded-lg"></div>

                      {/* Active Range */}
                      <div
                        className="absolute top-0 bottom-0 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg"
                        style={{
                          left: `${getSliderPercentage(
                            selectedPriceRange.min,
                            "min"
                          )}%`,
                          right: `${100 -
                            getSliderPercentage(selectedPriceRange.max, "max")
                            }%`,
                        }}
                      ></div>

                      {/* Min Handle */}
                      <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={selectedPriceRange.min}
                        onChange={(e) =>
                          handlePriceChange("min", parseInt(e.target.value))
                        }
                        onMouseDown={() => setIsDragging("min")}
                        onMouseUp={() => setIsDragging(null)}
                        onTouchStart={() => setIsDragging("min")}
                        onTouchEnd={() => setIsDragging(null)}
                        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                      />

                      {/* Max Handle */}
                      <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={selectedPriceRange.max}
                        onChange={(e) =>
                          handlePriceChange("max", parseInt(e.target.value))
                        }
                        onMouseDown={() => setIsDragging("max")}
                        onMouseUp={() => setIsDragging(null)}
                        onTouchStart={() => setIsDragging("max")}
                        onTouchEnd={() => setIsDragging(null)}
                        className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                      />

                      {/* Min Thumb */}
                      <div
                        className="absolute w-5 h-5 bg-white border-2 border-pink-500 rounded-full shadow-lg cursor-pointer transform -translate-y-1/2 top-1/2 transition-all duration-200 hover:scale-110 z-30"
                        style={{
                          left: `calc(${getSliderPercentage(
                            selectedPriceRange.min,
                            "min"
                          )}% - 10px)`,
                        }}
                      />

                      {/* Max Thumb */}
                      <div
                        className="absolute w-5 h-5 bg-white border-2 border-orange-500 rounded-full shadow-lg cursor-pointer transform -translate-y-1/2 top-1/2 transition-all duration-200 hover:scale-110 z-30"
                        style={{
                          left: `calc(${getSliderPercentage(
                            selectedPriceRange.max,
                            "max"
                          )}% - 10px)`,
                        }}
                      />
                    </div>

                    {/* Quick Price Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {[
                        { label: "Under ₹500", min: priceRange.min, max: 500 },
                        { label: "₹500-₹1000", min: 500, max: 1000 },
                        { label: "₹1000-₹2000", min: 1000, max: 2000 },
                        {
                          label: `Over ₹2000`,
                          min: 2000,
                          max: priceRange.max, // Ensure priceRange.max is valid here
                        },
                      ].map((quickRange, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            handleQuickPriceSelect(
                              quickRange.min,
                              quickRange.max
                            )
                          }
                          className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${selectedPriceRange.min === quickRange.min &&
                              selectedPriceRange.max === quickRange.max
                              ? "bg-pink-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                          {quickRange.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Weight Filter */}
              {weightOptions.length > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() => toggleSection("weight")}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Weight Options
                    </h3>
                    {expandedSections.weight ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {expandedSections.weight && (<div className="space-y-2 max-h-48 overflow-y-auto">
                    {weightOptions.map((weight) => (
                      <label
                        key={weight}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 filter-hover ${selectedWeights.includes(weight)
                            ? "active-filter-border"
                            : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                          }`}
                      >
                        <div
                          className={
                            selectedWeights.includes(weight)
                              ? "active-filter-content flex items-center w-full"
                              : "flex items-center w-full"
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedWeights.includes(weight)}
                            onChange={() => handleWeightChange(weight)}
                            className="h-4 w-4 filter-checkbox border-gray-300 rounded focus:ring-pink-500"
                          />
                          <span className="ml-3 text-sm text-gray-700 flex-1">
                            {weight}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  )}
                </div>)}

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
