import { Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeSlotDraft {
  day_of_week: number;
  start_time: string;
  end_time: string;
  tempId?: string;
}

interface AvailabilityTimeSlotEditorProps {
  slots: TimeSlotDraft[];
  onAddSlot: () => void;
  onUpdateSlot: (tempId: string, updates: Partial<TimeSlotDraft>) => void;
  onDeleteSlot: (tempId: string) => void;
}

export function AvailabilityTimeSlotEditor({
  slots,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot,
}: AvailabilityTimeSlotEditorProps) {
  
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const validateTimeRange = (startTime: string, endTime: string): string | null => {
    if (startTime >= endTime) {
      return "End time must be after start time";
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Add Slot Button */}
      <Button
        onClick={onAddSlot}
        variant="outline"
        className="w-full border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-600"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Time Slot
      </Button>

      {/* Time Slots List */}
      {slots.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No time slots yet</p>
          <p className="text-sm text-gray-400">Click "Add Time Slot" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot, index) => {
            const error = validateTimeRange(slot.start_time, slot.end_time);
            
            return (
              <div
                key={slot.tempId}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${error 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-blue-200 bg-blue-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Slot Number Badge */}
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${error ? 'bg-red-200 text-red-700' : 'bg-blue-200 text-blue-700'}
                  `}>
                    {index + 1}
                  </div>

                  {/* Time Inputs */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`start-${slot.tempId}`} className="text-xs font-semibold text-gray-700">
                          Start Time
                        </Label>
                        <Input
                          id={`start-${slot.tempId}`}
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => onUpdateSlot(slot.tempId!, { start_time: e.target.value })}
                          className={`mt-1 ${error ? 'border-red-300' : ''}`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(slot.start_time)}
                        </p>
                      </div>

                      <div>
                        <Label htmlFor={`end-${slot.tempId}`} className="text-xs font-semibold text-gray-700">
                          End Time
                        </Label>
                        <Input
                          id={`end-${slot.tempId}`}
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => onUpdateSlot(slot.tempId!, { end_time: e.target.value })}
                          className={`mt-1 ${error ? 'border-red-300' : ''}`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(slot.end_time)}
                        </p>
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <span className="font-medium">⚠️ {error}</span>
                      </div>
                    )}

                    {/* Duration Display */}
                    {!error && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>
                          Duration: {calculateDuration(slot.start_time, slot.end_time)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSlot(slot.tempId!)}
                    className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {slots.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <Clock className="h-5 w-5" />
            <div>
              <p className="font-semibold">
                {slots.length} time slot{slots.length !== 1 ? 's' : ''} configured
              </p>
              <p className="text-sm text-green-700">
                Tenants will see 30-minute booking slots during these hours
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function calculateDuration(startTime: string, endTime: string): string {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const durationMinutes = endMinutes - startMinutes;
  
  if (durationMinutes <= 0) return "Invalid";
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}
