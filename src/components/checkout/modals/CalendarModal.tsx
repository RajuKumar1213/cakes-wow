import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { 
  getMaxPreparationTime, 
  shouldShowTodayInCalendar,
  getEarliestDeliveryDate
} from '@/utils/deliveryTimeUtils';

interface CalendarModalProps {
  isOpen: boolean;
  isClosing: boolean;
  currentMonth: Date;
  selectedDate: Date | null;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
  generateCalendarDays: () => Date[];
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  isClosing,
  currentMonth,
  selectedDate,
  onClose,
  onDateSelect,
  onMonthChange,
  generateCalendarDays,
}) => {
  const { items: cartItems } = useCart();
  
  // Calculate maximum preparation time from cart
  const maxPrepTime = getMaxPreparationTime(cartItems);
  
  // Get the earliest available delivery date
  const earliestDeliveryDate = getEarliestDeliveryDate(maxPrepTime);
  
  // Check if today should be shown
  const showToday = shouldShowTodayInCalendar(maxPrepTime);

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  if (!isOpen) return null;
  // Fix for timezone issues - use local date formatting instead of ISO string
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let minSelectableDate: Date;
  if (showToday) {
    minSelectableDate = today;
  } else {
    minSelectableDate = new Date(earliestDeliveryDate);
    minSelectableDate.setHours(0, 0, 0, 0); // Ensure it's at midnight
  }

  return (
    <div
      className={`fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >      <div
        className={`bg-white rounded-t-3xl md:rounded-3xl p-3 md:p-6 max-w-md w-full mx-0 md:mx-4 max-h-[80vh] md:max-h-[90vh] flex flex-col shadow-2xl transform transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between mb-4 md:mb-6 flex-shrink-0">
          <div>            <h3 className="text-sm md:text-lg font-semibold text-gray-900">
              Choose Delivery Date
            </h3>
            <p className="text-gray-600 text-xs mt-1">
              {!showToday 
                ? `Due to ${maxPrepTime}h prep time, delivery available from ${earliestDeliveryDate.toLocaleDateString()}`
                : 'Pick the perfect day for your sweet delivery 🎂'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <svg
              className="w-4 h-4 md:w-6 md:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Calendar Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <button
              onClick={() => onMonthChange('prev')}
              className="p-1 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <h4 className="text-base md:text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h4>
            <button
              onClick={() => onMonthChange('next')}
              className="p-1 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1 md:mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center py-1 md:py-2">
                <span className="text-xs font-medium text-gray-500">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 mb-4">            {generateCalendarDays().map((date, index) => {
              const isSelected = selectedDate && 
                formatDate(selectedDate) === formatDate(date);
              const isToday = formatDate(date) === formatDate(today);
              const isPast = date < minSelectableDate; // Use minSelectableDate instead of today
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isDisabledDueToPrep = !showToday && isToday; // Disable today if prep time doesn't allow it

              return (
                <button
                  key={index}
                  onClick={() => !isPast && !isDisabledDueToPrep && onDateSelect(formatDate(date))}
                  disabled={isPast || isDisabledDueToPrep}
                  className={`
                    aspect-square rounded-lg text-xs md:text-sm font-medium transition-all duration-200 transform hover:scale-105
                    ${isSelected
                      ? "bg-orange-500 text-white shadow-lg"
                      : isToday && !isDisabledDueToPrep
                      ? "bg-orange-100 text-orange-700 ring-2 ring-orange-500"
                      : isPast || isDisabledDueToPrep
                      ? "text-gray-300 opacity-50 cursor-not-allowed"
                      : isCurrentMonth
                      ? "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      : "text-gray-400 opacity-60"
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>        {/* Action Buttons - Fixed at bottom */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 pt-4 md:pt-4 border-t border-gray-100 flex-shrink-0 mt-auto">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 md:px-3 md:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm md:text-xs lg:text-sm"
          >
            Cancel
          </button>
          {selectedDate && (
            <button
              onClick={() => {
                onClose();
                setTimeout(() => {
                  // This would be handled by parent component
                }, 150);
              }}
              className="flex-1 px-4 py-3 md:px-3 md:py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm md:text-xs lg:text-sm"
            >
              Confirm Date
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
