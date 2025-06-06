"use client";

import React, { useState, useRef, useEffect } from 'react';

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
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = Math.round((percentage / 100) * (max - min) + min);

    if (isDragging === 'min') {
      onChange([Math.min(newValue, value[1]), value[1]]);
    } else {
      onChange([value[0], Math.max(newValue, value[0])]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, value]);

  const leftPercentage = getPercentage(value[0]);
  const rightPercentage = getPercentage(value[1]);

  return (
    <div className={`relative ${className}`}>
      {/* Track */}
      <div
        ref={sliderRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
      >
        {/* Active range */}
        <div
          className="absolute h-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full"
          style={{
            left: `${leftPercentage}%`,
            width: `${rightPercentage - leftPercentage}%`,
          }}
        />
        
        {/* Min thumb */}
        <div
          className={`absolute w-5 h-5 bg-white border-2 border-pink-500 rounded-full cursor-grab transform -translate-x-1/2 -translate-y-1/2 top-1/2 shadow-lg transition-all duration-150 hover:scale-110 ${
            isDragging === 'min' ? 'scale-110 border-pink-600 shadow-xl' : ''
          }`}
          style={{ left: `${leftPercentage}%` }}
          onMouseDown={handleMouseDown('min')}
        />
        
        {/* Max thumb */}
        <div
          className={`absolute w-5 h-5 bg-white border-2 border-pink-500 rounded-full cursor-grab transform -translate-x-1/2 -translate-y-1/2 top-1/2 shadow-lg transition-all duration-150 hover:scale-110 ${
            isDragging === 'max' ? 'scale-110 border-pink-600 shadow-xl' : ''
          }`}
          style={{ left: `${rightPercentage}%` }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>
    </div>
  );
};

export default DualRangeSlider;
