"use client";

import React from "react";
import { X, ArrowLeft } from "lucide-react";
import { deliveryTypes } from "@/constants/checkout";
import { useCart } from "@/contexts/CartContext";
import {
  getMaxPreparationTime,
  getAvailableTimeSlots,
  isToday,
  getMinimumDeliveryTimeForDisplay,
} from "@/utils/deliveryTimeUtils";

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  deliveryType: "asap" | "scheduled";
  selectedDeliveryTypeId?: string;
  onGoBackToDeliveryType?: () => void;
}

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onTimeSelect,
  selectedDeliveryTypeId,
  onGoBackToDeliveryType,
}) => {  const { items: cartItems } = useCart();

  // Helper function to format date from YYYY/M/DD to DD/MM/YYYY
  const formatDisplayDate = (dateString: string) => {
    try {
      // Handle both YYYY/M/DD and YYYY-MM-DD formats
      const cleanDate = dateString.replace(/\//g, '-');
      const date = new Date(cleanDate);
      
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original if error occurs
    }
  };

  // Get maximum preparation time from cart items
  const maxPreparationTime = getMaxPreparationTime(cartItems);

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Get time slots from the selected delivery type
  const getTimeSlots = () => {
    let allSlots: { value: string; display: string }[] = [];

    if (selectedDeliveryTypeId) {
      const deliveryTypeData = deliveryTypes.find(
        (dt) => dt.id === selectedDeliveryTypeId
      );
      if (deliveryTypeData && deliveryTypeData.timeSlots) {
        const baseSlots = deliveryTypeData.timeSlots.map((slot) => ({
          time: slot.time,
          available: slot.available,
        }));

        // Filter available slots based on preparation time
        const availableSlots = getAvailableTimeSlots(
          baseSlots,
          selectedDate,
          maxPreparationTime
        );

        allSlots = availableSlots.map((slot) => ({
          value: slot.time,
          display: slot.time,
        }));
      }
    } else {
      // Fallback to default time ranges if no delivery type is selected
      const defaultSlots = [
        { time: "11 AM - 1 PM", available: true },
        { time: "1 PM - 3 PM", available: true },
        { time: "3 PM - 6 PM", available: true },
        { time: "6 PM - 9 PM", available: true },
      ];

      const availableSlots = getAvailableTimeSlots(
        defaultSlots,
        selectedDate,
        maxPreparationTime
      );
      allSlots = availableSlots.map((slot) => ({
        value: slot.time,
        display: slot.time,
      }));
    }

    return allSlots;
  };

  const timeSlots = getTimeSlots();

  const handleTimeSelection = (time: string) => {
    onTimeSelect(time);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white rounded-t-3xl md:rounded-lg shadow-xl max-w-md w-full mx-0 md:mx-4 max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden">
        {" "}
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b">
          <div className="flex items-center space-x-2">
            {onGoBackToDeliveryType && (
              <button
                onClick={onGoBackToDeliveryType}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Go back to delivery type selection"
              >
                <ArrowLeft size={18} className="md:w-5 md:h-5 text-gray-600" />
              </button>
            )}            <h3 className="text-base md:text-lg font-semibold">
              Select Time for {formatDisplayDate(selectedDate)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="md:w-5 md:h-5" />
          </button>
        </div>{" "}
        {/* Time Slots */}
        <div className="p-3 md:p-4 flex-1 overflow-y-auto">
          {" "}
          {timeSlots.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">⏰</div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                No Time Slots Available
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                {isToday(selectedDate)
                  ? `Due to ${maxPreparationTime} hours preparation time needed for your cakes, no delivery slots are available for today. Please select a future date.`
                  : "No delivery slots are available for the selected date. Please choose a different date."}
              </p>
              {onGoBackToDeliveryType && (
                <button
                  onClick={onGoBackToDeliveryType}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Choose Different Date
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    onClick={() => handleTimeSelection(slot.value)}
                    className={`p-2 md:p-3 rounded-lg border-2 text-xs md:text-sm font-medium transition-all ${
                      selectedTime === slot.value
                        ? "border-pink-500 bg-pink-50 text-pink-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50"
                    }`}
                  >
                    {slot.display}
                  </button>
                ))}
              </div>
              {/* Special Delivery Messages */}
              {selectedDeliveryTypeId === "midnight" && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-purple-600">🌙</span>
                    <h4 className="text-sm font-semibold text-purple-800">
                      Midnight Delivery
                    </h4>
                  </div>                  <p className="text-xs text-purple-700">
                    We will deliver your product on{" "}
                    {formatDisplayDate(selectedDate)} after 11:00 PM.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        {/* Footer */}
        <div className="p-3 md:p-4 border-t bg-gray-50 flex-shrink-0">
          <p className="text-xs md:text-sm text-gray-600 text-center">
            {timeSlots.length === 0
              ? isToday(selectedDate)
                ? `Earliest delivery: ${getMinimumDeliveryTimeForDisplay(
                    maxPreparationTime
                  )} (${maxPreparationTime}h prep needed). Please select tomorrow.`
                : "No slots available for selected date."
              : isToday(selectedDate)
              ? "Select earliest available time"
              : "Choose your preferred delivery time"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotModal;
