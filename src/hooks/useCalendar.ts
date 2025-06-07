import { useState, useCallback } from 'react';

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const generateCalendarDays = useCallback(() => {
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    const startOfCalendar = new Date(startOfMonth);
    const endOfCalendar = new Date(endOfMonth);

    // Start from Sunday
    startOfCalendar.setDate(
      startOfCalendar.getDate() - startOfCalendar.getDay()
    );
    // End on Saturday
    endOfCalendar.setDate(
      endOfCalendar.getDate() + (6 - endOfCalendar.getDay())
    );

    const days = [];
    const currentDate = new Date(startOfCalendar);

    while (currentDate <= endOfCalendar) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth]);

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return {
    currentMonth,
    selectedDate,
    setSelectedDate,
    generateCalendarDays,
    isDateDisabled,
    isDateSelected,
    formatMonthYear,
    navigateMonth,
    getMinDate,
  };
}
