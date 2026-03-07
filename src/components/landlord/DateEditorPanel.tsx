import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Trash2, Clock, Save, Copy } from "lucide-react";
import { toast } from "sonner";
import { viewingAppointmentService } from "@/services/viewingAppointmentService";
import type { LandlordAvailability } from "@/types/viewingAppointment";

interface DateEditorPanelProps {
  date: string; // YYYY-MM-DD
  propertyId: string | null;
  userId: string;
  existingSlots: LandlordAvailability[];
  onClose: () => void;
}

interface TimeSlotDraft {
  id?: string; // existing slot ID
  start_time: string;
  end_time: string;
  tempId: string;
}

export function DateEditorPanel({
  date,
  propertyId,
  userId,
  existingSlots,
  onClose,
}: DateEditorPanelProps) {
  const [slots, setSlots] = useState<TimeSlotDraft[]>(
    existingSlots.map(slot => ({
      id: slot.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      tempId: slot.id,
    }))
  );
  const [saving, setSaving] = useState(false);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime: string, endTime: string): string => {
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
  };

  const validateTimeRange = (startTime: string, endTime: string): string | null => {
    if (startTime >= endTime) {
      return "End time must be after start time";
    }
    return null;
  };

  const handleAddSlot = () => {
    setSlots([
      ...slots,
      {
        start_time: '09:00',
        end_time: '17:00',
        tempId: `temp-${Date.now()}`
      }
    ]);
  };

  const handleUpdateSlot = (tempId: string, updates: Partial<TimeSlotDraft>) => {
    setSlots(slots.map(slot =>
      slot.tempId === tempId ? { ...slot, ...updates } : slot
    ));
  };

  const handleDeleteSlot = (tempId: string) => {
    setSlots(slots.filter(slot => slot.tempId !== tempId));
  };

  const handleSave = async () => {
    // Validate all slots
    for (const slot of slots) {
      const error = validateTimeRange(slot.start_time, slot.end_time);
      if (error) {
        toast.error(error);
        return;
      }
    }

    try {
      setSaving(true);

      // Delete all existing slots for this date
      for (const existingSlot of existingSlots) {
        await viewingAppointmentService.deleteAvailability(existingSlot.id);
      }

      // Create new slots
      for (const slot of slots) {
        await viewingAppointmentService.setAvailability({
          user_id: userId,
          property_id: propertyId,
          specific_date: date,
          day_of_week: new Date(date + 'T00:00:00').getDay(), // Keep for compatibility
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_active: true,
        });
      }

      toast.success("Availability updated!");
      onClose();
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Delete all time slots for this date?")) return;

    try {
      setSaving(true);

      for (const existingSlot of existingSlots) {
        await viewingAppointmentService.deleteAvailability(existingSlot.id);
      }

      toast.success("All slots deleted");
      onClose();
    } catch (error) {
      console.error("Error deleting slots:", error);
      toast.error("Failed to delete slots");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-2 border-blue-400 shadow-2xl animate-in slide-in-from-bottom-4">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              {formatDate(date)}
            </CardTitle>
            <CardDescription className="mt-1">
              Set your available hours for this date
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Add Slot Button */}
        <Button
          onClick={handleAddSlot}
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
                            onChange={(e) => handleUpdateSlot(slot.tempId, { start_time: e.target.value })}
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
                            onChange={(e) => handleUpdateSlot(slot.tempId, { end_time: e.target.value })}
                            className={`mt-1 ${error ? 'border-red-300' : ''}`}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(slot.end_time)}
                          </p>
                        </div>
                      </div>

                      {/* Error or Duration Display */}
                      {error ? (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <span className="font-medium">⚠️ {error}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <Clock className="h-3 w-3" />
                          <span>Duration: {calculateDuration(slot.start_time, slot.end_time)}</span>
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSlot(slot.tempId)}
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

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t-2">
          <Button
            onClick={handleSave}
            disabled={saving || slots.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          
          {existingSlots.length > 0 && (
            <Button
              onClick={handleClearAll}
              disabled={saving}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
          
          <Button
            onClick={onClose}
            disabled={saving}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
