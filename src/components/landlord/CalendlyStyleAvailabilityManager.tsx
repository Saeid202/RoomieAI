import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2, Calendar, Save, X } from "lucide-react";
import { toast } from "sonner";
import { viewingAppointmentService } from "@/services/viewingAppointmentService";
import { WeeklyAvailabilityGrid } from "./WeeklyAvailabilityGrid";
import { AvailabilityTimeSlotEditor } from "./AvailabilityTimeSlotEditor";
import type { LandlordAvailability, Property } from "@/types/viewingAppointment";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlotDraft {
  day_of_week: number;
  start_time: string;
  end_time: string;
  tempId?: string;
}

export function CalendlyStyleAvailabilityManager() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<LandlordAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [draftSlots, setDraftSlots] = useState<TimeSlotDraft[]>([]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error("Please log in to manage availability");
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      await loadProperties(user.id);
      await loadAvailability(user.id, null);
    };
    getCurrentUser();
  }, []);

  const loadProperties = async (userId: string) => {
    try {
      const data = await viewingAppointmentService.getLandlordProperties(userId);
      setProperties(data);
    } catch (error) {
      console.error("Error loading properties:", error);
      toast.error("Failed to load properties");
    }
  };

  const loadAvailability = async (userId: string, propertyId: string | null) => {
    try {
      setLoading(true);
      const data = await viewingAppointmentService.getAvailabilityByProperty(userId, propertyId);
      setAvailability(data);
    } catch (error) {
      console.error("Error loading availability:", error);
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyChange = (value: string) => {
    const propertyId = value === "all" ? null : value;
    setSelectedPropertyId(propertyId);
    if (currentUser) {
      loadAvailability(currentUser.id, propertyId);
    }
  };

  const handleDayClick = (dayOfWeek: number) => {
    setEditingDay(dayOfWeek);
    // Load existing slots for this day
    const existingSlots = availability
      .filter(a => a.day_of_week === dayOfWeek)
      .map(a => ({
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
        tempId: a.id
      }));
    setDraftSlots(existingSlots);
  };

  const handleAddSlot = () => {
    if (editingDay === null) return;
    
    setDraftSlots([
      ...draftSlots,
      {
        day_of_week: editingDay,
        start_time: '09:00',
        end_time: '17:00',
        tempId: `temp-${Date.now()}`
      }
    ]);
  };

  const handleUpdateSlot = (tempId: string, updates: Partial<TimeSlotDraft>) => {
    setDraftSlots(draftSlots.map(slot =>
      slot.tempId === tempId ? { ...slot, ...updates } : slot
    ));
  };

  const handleDeleteSlot = (tempId: string) => {
    setDraftSlots(draftSlots.filter(slot => slot.tempId !== tempId));
  };

  const handleSaveDay = async () => {
    if (!currentUser || editingDay === null) return;

    try {
      setSaving(true);

      // Delete all existing slots for this day
      const existingSlots = availability.filter(a => a.day_of_week === editingDay);
      for (const slot of existingSlots) {
        await viewingAppointmentService.deleteAvailability(slot.id);
      }

      // Add new slots
      for (const slot of draftSlots) {
        if (slot.start_time >= slot.end_time) {
          toast.error("End time must be after start time");
          return;
        }

        await viewingAppointmentService.setAvailability({
          user_id: currentUser.id,
          property_id: selectedPropertyId,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_active: true,
        });
      }

      toast.success("Availability updated!");
      setEditingDay(null);
      setDraftSlots([]);
      await loadAvailability(currentUser.id, selectedPropertyId);
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingDay(null);
    setDraftSlots([]);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await viewingAppointmentService.updateAvailability(id, { is_active: !currentStatus });
      toast.success(currentStatus ? "Slot disabled" : "Slot enabled");
      if (currentUser) {
        await loadAvailability(currentUser.id, selectedPropertyId);
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    }
  };

  const handleDeleteSlotPermanent = async (id: string) => {
    if (!confirm("Delete this time slot?")) return;

    try {
      await viewingAppointmentService.deleteAvailability(id);
      toast.success("Slot deleted");
      if (currentUser) {
        await loadAvailability(currentUser.id, selectedPropertyId);
      }
    } catch (error) {
      console.error("Error deleting availability:", error);
      toast.error("Failed to delete slot");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                Set Your Availability
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Choose when you're available for property viewings. Tenants will see these times when booking.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Property Selector */}
          {properties.length > 0 && (
            <div className="bg-white rounded-lg p-4 border-2 border-blue-100">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Select Property
              </label>
              <Select
                value={selectedPropertyId || "all"}
                onValueChange={handlePropertyChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">All Properties</span>
                    </div>
                  </SelectItem>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{property.address || `Property ${property.id.slice(0, 8)}`}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
                {selectedPropertyId
                  ? "⚡ Setting availability for this property only"
                  : "🌐 Setting availability for all your properties"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Schedule</CardTitle>
          <CardDescription>
            Click on any day to set your available hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading your schedule...</p>
            </div>
          ) : (
            <WeeklyAvailabilityGrid
              availability={availability}
              onDayClick={handleDayClick}
              editingDay={editingDay}
              onToggleActive={handleToggleActive}
              onDeleteSlot={handleDeleteSlotPermanent}
            />
          )}
        </CardContent>
      </Card>

      {/* Time Slot Editor Modal */}
      {editingDay !== null && (
        <Card className="border-2 border-blue-400 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Edit {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][editingDay]}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <CardDescription>
              Add or remove time slots for this day
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <AvailabilityTimeSlotEditor
              slots={draftSlots}
              onAddSlot={handleAddSlot}
              onUpdateSlot={handleUpdateSlot}
              onDeleteSlot={handleDeleteSlot}
            />

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button
                onClick={handleSaveDay}
                disabled={saving}
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
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="bg-gray-50 border-2 border-gray-200">
        <CardContent className="pt-6">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>💡</span>
            How It Works
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Click on any day in the weekly calendar to add time slots</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Add multiple time slots per day (e.g., morning and evening)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Tenants will see 30-minute booking slots during your available hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Toggle slots on/off without deleting them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">5.</span>
              <span>Set availability for all properties or specific ones</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
