'use client';

import React from 'react';
import { X } from 'lucide-react';

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  deliveryType: 'asap' | 'scheduled';
}

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onTimeSelect,
  deliveryType
}) => {
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

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 21; // 9 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = hour <= 12 
          ? `${hour === 0 ? 12 : hour}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`
          : `${hour - 12}:${minute.toString().padStart(2, '0')} PM`;
        
        slots.push({ value: time, display: displayTime });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSelection = (time: string) => {
    onTimeSelect(time);
    onClose();
  };  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white rounded-t-3xl md:rounded-lg shadow-xl max-w-md w-full mx-0 md:mx-4 max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden">{/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b">
          <h3 className="text-base md:text-lg font-semibold">
            Select Time for {selectedDate}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="md:w-5 md:h-5" />
          </button>
        </div>        {/* Time Slots */}
        <div className="p-3 md:p-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
            {timeSlots.map((slot) => (
              <button
                key={slot.value}
                onClick={() => handleTimeSelection(slot.value)}
                className={`p-2 md:p-3 rounded-lg border-2 text-xs md:text-sm font-medium transition-all ${
                  selectedTime === slot.value
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50'
                }`}
              >
                {slot.display}
              </button>
            ))}
          </div>        </div>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t bg-gray-50 flex-shrink-0">
          <p className="text-xs md:text-sm text-gray-600 text-center">
            {deliveryType === 'asap' 
              ? 'Select earliest available time' 
              : 'Choose your preferred delivery time'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotModal;