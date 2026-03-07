import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Trash2, Plus, Clock, Info } from "lucide-react";
import { Label } from "@/components/ui/label";

interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  [dayOfWeek: number]: TimeSlot[];
}

interface PropertyAvailabilitySectionProps {
  availability: DayAvailability;
  allDayChecked: { [key: number]: boolean };
  onAvailabilityChange: (availability: DayAvailability) => void;
  onAllDayChange: (allDayChecked: { [key: number]: boolean }) => void;
}

export function PropertyAvailabilitySection({
  availability,
  allDayChecked,
  onAvailabilityChange,
  onAllDayChange
}: PropertyAvailabilitySectionProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday by default

  const daysOfWeek = [
    { value: 1, label: 'M', fullName: 'Monday' },
    { value: 2, label: 'T', fullName: 'Tuesday' },
    { value: 3, label: 'W', fullName: 'Wednesday' },
    { value: 4, label: 'T', fullName: 'Thursday' },
    { value: 5, label: 'F', fullName: 'Friday' },
    { value: 6, label: 'S', fullName: 'Saturday' },
    { value: 0, label: 'S', fullName: 'Sunday' },
  ];

  // Generate time options (30-minute intervals)
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        times.push(timeStr);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const hour12 = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const handleAllDayChange = (checked: boolean) => {
    const newAllDayChecked = {
      ...allDayChecked,
      [selectedDay]: checked
    };
    onAllDayChange(newAllDayChecked);
    
    // If checked, clear time slots for this day
    if (checked) {
      const newAvailability = {
        ...availability,
        [selectedDay]: []
      };
      onAvailabilityChange(newAvailability);
    }
  };

  const handleAddTimeSlot = () => {
    const newSlot: TimeSlot = {
      startTime: '09:00',
      endTime: '17:00'
    };
    
    const newAvailability = {
      ...availability,
      [selectedDay]: [...(availability[selectedDay] || []), newSlot]
    };
    onAvailabilityChange(newAvailability);
  };

  const handleDeleteTimeSlot = (index: number) => {
    const newAvailability = {
      ...availability,
      [selectedDay]: (availability[selectedDay] || []).filter((_, i) => i !== index)
    };
    onAvailabilityChange(newAvailability);
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const slots = [...(availability[selectedDay] || [])];
    slots[index] = {
      ...slots[index],
      [field]: value
    };
    const newAvailability = {
      ...availability,
      [selectedDay]: slots
    };
    onAvailabilityChange(newAvailability);
  };

  const selectedDayName = daysOfWeek.find(d => d.value === selectedDay)?.fullName || 'Monday';
  const currentDaySlots = availability[selectedDay] || [];
  const isAllDay = allDayChecked[selectedDay] || false;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Set Your Viewing Availability (Optional)</p>
          <p className="text-blue-700">
            Configure when tenants can schedule property viewings. You can skip this and set it up later from the Viewing Appointments page.
          </p>
        </div>
      </div>

      {/* Days Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700">Select Days:</Label>
        <div className="flex gap-2">
          {daysOfWeek.map(day => {
            const hasAvailability = (availability[day.value]?.length > 0) || allDayChecked[day.value];
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayClick(day.value)}
                className={`
                  w-12 h-12 rounded-lg font-semibold text-sm transition-all
                  ${selectedDay === day.value
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2'
                    : hasAvailability
                    ? 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                  }
                `}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-base font-semibold text-gray-900 mb-4">
          For {selectedDayName}:
        </h4>

        {/* All Day Checkbox */}
        <div className="flex items-center space-x-2 mb-6">
          <Checkbox
            id="all-day"
            checked={isAllDay}
            onCheckedChange={handleAllDayChange}
          />
          <Label
            htmlFor="all-day"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            All Day
          </Label>
        </div>

        {/* Time Slots */}
        {!isAllDay && (
          <>
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Time Slots:</Label>
            
            {currentDaySlots.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center mb-4">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No time slots added for this day</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {currentDaySlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <Select
                      value={slot.startTime}
                      onValueChange={(value) => handleTimeChange(index, 'startTime', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>
                            {formatTimeDisplay(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-gray-500 font-medium">–</span>

                    <Select
                      value={slot.endTime}
                      onValueChange={(value) => handleTimeChange(index, 'endTime', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>
                            {formatTimeDisplay(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTimeSlot(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddTimeSlot}
              className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
