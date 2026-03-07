import { Clock } from "lucide-react";
import { groupTimeSlotsByPeriod } from "@/utils/calendarHelpers";
import type { TimeSlot } from "@/types/viewingAppointment";

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSlotSelect: (time: string) => void;
}

export function TimeSlotPicker({ slots, selectedSlot, onSlotSelect }: TimeSlotPickerProps) {
  const { morning, afternoon, evening } = groupTimeSlotsByPeriod(slots);

  const renderSlotGroup = (title: string, groupSlots: TimeSlot[]) => {
    if (groupSlots.length === 0) return null;

    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
        <div className="grid grid-cols-2 gap-2">
          {groupSlots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              onClick={() => slot.available && onSlotSelect(slot.time)}
              disabled={!slot.available}
              className={`
                p-3 rounded-lg border text-sm font-medium transition-all
                ${selectedSlot === slot.time
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : slot.available
                    ? 'bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-300 text-gray-700'
                    : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                }
              `}
            >
              <div className="flex items-center justify-center gap-1.5">
                {selectedSlot === slot.time && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                )}
                {!slot.available && selectedSlot !== slot.time && (
                  <span className="text-xs">⊗</span>
                )}
                <span>{slot.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (slots.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No times available</p>
          <p className="text-sm text-gray-400">
            Select a date to see available time slots
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Available Times
      </h3>
      
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6">
        {renderSlotGroup('Morning', morning)}
        {renderSlotGroup('Afternoon', afternoon)}
        {renderSlotGroup('Evening', evening)}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-600"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-gray-300 bg-white"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-[8px]">⊗</div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}
