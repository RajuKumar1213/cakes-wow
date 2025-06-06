"use client";

import React, { useState, useRef, useCallback } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
}

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const getPercentage = (val: number) => {
    return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
  };
  const handleStart = (thumb: 'min' | 'max') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(thumb);
  };

  const getClientX = (e: MouseEvent | TouchEvent): number => {
    if ('touches' in e) {
      return e.touches[0]?.clientX || 0;
    }
    return e.clientX;
  };

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const clientX = getClientX(e);
      const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const newValue = min + (percentage / 100) * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      if (isDragging === 'min') {
        onChange([Math.min(clampedValue, value[1]), value[1]]);
      } else {
        onChange([value[0], Math.max(clampedValue, value[0])]);
      }
    },
    [isDragging, min, max, step, value, onChange]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      
      // Touch events for mobile
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);
  return (
    <div className={`relative w-full py-4 select-none ${className}`}>
      {/* Track container with proper overflow hidden */}
      <div className="relative w-full h-2 px-2 touch-none">
        <div
          ref={trackRef}
          className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
        >
          {/* Active range */}
          <div
            className="absolute top-0 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
            style={{
              left: `${minPercentage}%`,
              width: `${Math.max(0, maxPercentage - minPercentage)}%`,
            }}
          />
        </div>
          {/* Min thumb - positioned absolutely within the track container */}
        <button
          type="button"
          className={`absolute top-1/2 w-5 h-5 bg-white border-2 border-pink-500 rounded-full transform -translate-y-1/2 -translate-x-1/2 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 z-20 touch-none select-none ${
            isDragging === 'min' ? 'scale-110 border-pink-600 shadow-xl' : ''
          }`}
          style={{ 
            left: `calc(${minPercentage}% + 8px)`, // 8px offset for padding
          }}
          onMouseDown={handleStart('min')}
          onTouchStart={handleStart('min')}
        />
        
        {/* Max thumb - positioned absolutely within the track container */}
        <button
          type="button"
          className={`absolute top-1/2 w-5 h-5 bg-white border-2 border-purple-500 rounded-full transform -translate-y-1/2 -translate-x-1/2 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 z-20 touch-none select-none ${
            isDragging === 'max' ? 'scale-110 border-purple-600 shadow-xl' : ''
          }`}
          style={{ 
            left: `calc(${maxPercentage}% + 8px)`, // 8px offset for padding
          }}
          onMouseDown={handleStart('max')}
          onTouchStart={handleStart('max')}
        />
      </div>
    </div>
  );
};

export default DualRangeSlider;
