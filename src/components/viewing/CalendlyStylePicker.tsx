import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { DateCalendar } from "./DateCalendar";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { getDatesWithAvailability } from "@/utils/calendarHelpers";
import type { LandlordAvailability, TimeSlot } from "@/types/viewingAppointment";

interface CalendlyStylePickerProps {
  availability: LandlordAvailability[];
  availableSlots: TimeSlot[];
  selectedDate: string | null;
  selectedTime: string | null;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
}

export function CalendlyStylePicker({
  availability,
  availableSlots,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: CalendlyStylePickerProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [availabilityDates, setAvailabilityDates] = useState<Set<string>>(new Set());

  // Calculate dates with availability for the current month view
  useEffect(() => {
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    const dates = getDatesWithAvailability(availability, startDate, endDate);
    setAvailabilityDates(dates);
  }, [currentYear, currentMonth, availability]);

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTime) return null;

    const date = new Date(selectedDate + 'T00:00:00');
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const hour12 = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    return `${dateStr} at ${timeStr}`;
  };

  const selectedDateTime = formatSelectedDateTime();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CalendarIcon className="h-5 w-5 text-gray-700" />
        <h3 className="font-semibold text-gray-900">Select Date & Time</h3>
        <span className="text-red-500">*</span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Calendar */}
        <DateCalendar
          year={currentYear}
          month={currentMonth}
          availabilityDates={availabilityDates}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onMonthChange={handleMonthChange}
        />

        {/* Right: Time Slots */}
        <TimeSlotPicker
          slots={availableSlots}
          selectedSlot={selectedTime}
          onSlotSelect={onTimeSelect}
        />
      </div>

      {/* Selection Summary */}
      {selectedDateTime && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Selected</p>
            <p className="text-sm text-green-700">{selectedDateTime}</p>
          </div>
        </div>
      )}
    </div>
  );
}
