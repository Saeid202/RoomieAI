// Calendar utility functions for the Calendly-style date picker

export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  hasAvailability: boolean;
  isSelected: boolean;
}

export function generateCalendarDays(
  year: number,
  month: number,
  availabilityDates: Set<string>,
  selectedDate: string | null
): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    const dateString = formatDateString(date);
    days.push({
      date,
      dateString,
      isCurrentMonth: false,
      isToday: false,
      isPast: date < today,
      hasAvailability: false,
      isSelected: false,
    });
  }

  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = formatDateString(date);
    days.push({
      date,
      dateString,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isPast: date < today,
      hasAvailability: availabilityDates.has(dateString),
      isSelected: dateString === selectedDate,
    });
  }

  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    const dateString = formatDateString(date);
    days.push({
      date,
      dateString,
      isCurrentMonth: false,
      isToday: false,
      isPast: false,
      hasAvailability: false,
      isSelected: false,
    });
  }

  return days;
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}

export function getDatesWithAvailability(
  availability: any[],
  startDate: Date,
  endDate: Date
): Set<string> {
  const dates = new Set<string>();
  
  // For each day in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    // Check if there's availability for this day of week
    const hasAvailability = availability.some(
      avail => avail.day_of_week === dayOfWeek && avail.is_active
    );
    
    if (hasAvailability) {
      dates.add(formatDateString(currentDate));
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

export function groupTimeSlotsByPeriod(slots: any[]): {
  morning: any[];
  afternoon: any[];
  evening: any[];
} {
  const morning: any[] = [];
  const afternoon: any[] = [];
  const evening: any[] = [];

  slots.forEach(slot => {
    const [hours] = slot.time.split(':').map(Number);
    
    if (hours < 12) {
      morning.push(slot);
    } else if (hours < 17) {
      afternoon.push(slot);
    } else {
      evening.push(slot);
    }
  });

  return { morning, afternoon, evening };
}
