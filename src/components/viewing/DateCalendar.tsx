import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCalendarDays, getMonthName, type CalendarDay } from "@/utils/calendarHelpers";

interface DateCalendarProps {
  year: number;
  month: number;
  availabilityDates: Set<string>;
  selectedDate: string | null;
  onDateSelect: (dateString: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

export function DateCalendar({
  year,
  month,
  availabilityDates,
  selectedDate,
  onDateSelect,
  onMonthChange,
}: DateCalendarProps) {
  const days = generateCalendarDays(year, month, availabilityDates, selectedDate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthChange(year - 1, 11);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      onMonthChange(year + 1, 0);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isPast && day.hasAvailability && day.isCurrentMonth) {
      onDateSelect(day.dateString);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="font-semibold text-gray-900">
          {getMonthName(month)} {year}
        </h3>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(name => (
          <div
            key={name}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isDisabled = day.isPast || !day.hasAvailability || !day.isCurrentMonth;
          const isClickable = !isDisabled;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDayClick(day)}
              disabled={isDisabled}
              className={`
                relative h-10 rounded-md text-sm font-medium transition-colors
                ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                ${day.isToday && day.isCurrentMonth ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                ${day.isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                ${!day.isSelected && isClickable ? 'hover:bg-blue-50 text-gray-700' : ''}
                ${isDisabled && !day.isSelected ? 'text-gray-400 cursor-not-allowed' : ''}
                ${isClickable ? 'cursor-pointer' : ''}
              `}
            >
              <span>{day.date.getDate()}</span>
              
              {/* Availability Indicator Dot */}
              {day.hasAvailability && day.isCurrentMonth && !day.isPast && (
                <span className={`
                  absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full
                  ${day.isSelected ? 'bg-white' : 'bg-blue-600'}
                `} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white"></div>
          </div>
          <span>Available dates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md ring-2 ring-blue-400"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
