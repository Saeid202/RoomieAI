import { Clock, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LandlordAvailability } from "@/types/viewingAppointment";

interface WeeklyAvailabilityGridProps {
  availability: LandlordAvailability[];
  onDayClick: (dayOfWeek: number) => void;
  editingDay: number | null;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDeleteSlot: (id: string) => void;
}

const DAYS = [
  { num: 1, name: 'Monday', short: 'Mon' },
  { num: 2, name: 'Tuesday', short: 'Tue' },
  { num: 3, name: 'Wednesday', short: 'Wed' },
  { num: 4, name: 'Thursday', short: 'Thu' },
  { num: 5, name: 'Friday', short: 'Fri' },
  { num: 6, name: 'Saturday', short: 'Sat' },
  { num: 0, name: 'Sunday', short: 'Sun' },
];

export function WeeklyAvailabilityGrid({
  availability,
  onDayClick,
  editingDay,
  onToggleActive,
  onDeleteSlot,
}: WeeklyAvailabilityGridProps) {
  
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDaySlots = (dayNum: number) => {
    return availability.filter(a => a.day_of_week === dayNum);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {DAYS.map(day => {
        const slots = getDaySlots(day.num);
        const isEditing = editingDay === day.num;
        const hasSlots = slots.length > 0;
        const activeSlots = slots.filter(s => s.is_active);

        return (
          <div
            key={day.num}
            className={`
              relative rounded-xl border-2 transition-all cursor-pointer
              ${isEditing 
                ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                : hasSlots
                  ? 'border-green-300 bg-green-50 hover:border-green-400 hover:shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
              }
            `}
            onClick={() => onDayClick(day.num)}
          >
            {/* Day Header */}
            <div className={`
              p-4 border-b-2 
              ${isEditing 
                ? 'bg-blue-100 border-blue-300' 
                : hasSlots 
                  ? 'bg-green-100 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }
            `}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-bold text-lg ${isEditing ? 'text-blue-900' : hasSlots ? 'text-green-900' : 'text-gray-700'}`}>
                    {day.name}
                  </h3>
                  {hasSlots && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      {activeSlots.length} of {slots.length} active
                    </p>
                  )}
                </div>
                {isEditing ? (
                  <div className="bg-blue-600 text-white rounded-full p-2">
                    <Clock className="h-4 w-4" />
                  </div>
                ) : hasSlots ? (
                  <div className="bg-green-600 text-white rounded-full p-2">
                    <Clock className="h-4 w-4" />
                  </div>
                ) : (
                  <Plus className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Time Slots */}
            <div className="p-4 space-y-2 min-h-[120px]">
              {slots.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 mb-2">No availability set</p>
                  <p className="text-xs text-gray-400">Click to add hours</p>
                </div>
              ) : (
                slots.map(slot => (
                  <div
                    key={slot.id}
                    className={`
                      group relative p-3 rounded-lg border transition-all
                      ${slot.is_active 
                        ? 'bg-white border-green-200 hover:border-green-300' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                      }
                    `}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`h-3 w-3 flex-shrink-0 ${slot.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${slot.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formatTime(slot.start_time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-400 ml-4">to</span>
                          <span className={`text-sm font-medium ${slot.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formatTime(slot.end_time)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleActive(slot.id, slot.is_active);
                          }}
                          className={`p-1 rounded hover:bg-gray-100 ${slot.is_active ? 'text-green-600' : 'text-gray-400'}`}
                          title={slot.is_active ? 'Disable' : 'Enable'}
                        >
                          {slot.is_active ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSlot(slot.id);
                          }}
                          className="p-1 rounded hover:bg-red-50 text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {!slot.is_active && (
                      <div className="absolute top-1 right-1">
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                          OFF
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Click to Edit Hint */}
            {!isEditing && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/5 rounded-xl pointer-events-none">
                <div className="bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-blue-400">
                  <p className="text-sm font-semibold text-blue-600">Click to edit</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
