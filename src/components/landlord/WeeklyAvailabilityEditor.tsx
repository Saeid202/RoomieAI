import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Building2, Trash2, Plus, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { viewingAppointmentService } from "@/services/viewingAppointmentService";
import type { Property } from "@/types/viewingAppointment";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  [dayOfWeek: number]: TimeSlot[];
}

interface PropertyRowProps {
  property: Property;
  isSelected: boolean;
  onEdit: () => void;
  currentUser: any;
}

function PropertyRow({ property, isSelected, onEdit, currentUser }: PropertyRowProps) {
  const [hasAvailability, setHasAvailability] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!currentUser) return;
      try {
        setChecking(true);
        const data = await viewingAppointmentService.getAvailabilityByProperty(currentUser.id, property.id);
        setHasAvailability(data.length > 0);
      } catch (error) {
        console.error("Error checking availability:", error);
      } finally {
        setChecking(false);
      }
    };
    checkAvailability();
  }, [property.id, currentUser]);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <Link
            to={`/dashboard/rent/${property.id}`}
            className="font-medium text-gray-900 hover:text-blue-600 hover:underline flex items-center gap-1.5 group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{property.address || `Property ${property.id.slice(0, 8)}`}</span>
            <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-600" />
          </Link>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-600">
        {property.city && property.state ? `${property.city}, ${property.state}` : '-'}
      </td>
      <td className="py-4 px-4 text-center">
        {checking ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
            Checking...
          </span>
        ) : hasAvailability ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            Has Availability
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Not Set
          </span>
        )}
      </td>
      <td className="py-4 px-4 text-center">
        <Button
          onClick={onEdit}
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className={isSelected ? "bg-blue-600" : ""}
        >
          {isSelected ? 'Editing' : 'Edit'}
        </Button>
      </td>
    </tr>
  );
}

export function WeeklyAvailabilityEditor() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday by default
  const [dayAvailability, setDayAvailability] = useState<DayAvailability>({});
  const [allDayChecked, setAllDayChecked] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (currentUser) {
      loadAvailability(currentUser.id, selectedPropertyId);
    }
  }, [selectedPropertyId]);

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
      
      // Group by day of week
      const grouped: DayAvailability = {};
      const allDayStatus: { [key: number]: boolean } = {};
      
      data.forEach(slot => {
        const day = slot.day_of_week;
        if (!grouped[day]) {
          grouped[day] = [];
        }
        
        // Check if it's an "all day" slot (00:00 to 23:59 or similar)
        if (slot.start_time === '00:00:00' && slot.end_time === '23:59:00') {
          allDayStatus[day] = true;
        } else {
          grouped[day].push({
            id: slot.id,
            startTime: slot.start_time.substring(0, 5), // HH:MM
            endTime: slot.end_time.substring(0, 5),
          });
        }
      });

      setDayAvailability(grouped);
      setAllDayChecked(allDayStatus);
    } catch (error) {
      console.error("Error loading availability:", error);
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  // Check if a specific property has availability
  const checkPropertyAvailability = async (propertyId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const data = await viewingAppointmentService.getAvailabilityByProperty(currentUser.id, propertyId);
      return data.length > 0;
    } catch (error) {
      console.error("Error checking property availability:", error);
      return false;
    }
  };

  const handlePropertyChange = (value: string) => {
    const propertyId = value === "all" ? null : value;
    setSelectedPropertyId(propertyId);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const handleAllDayChange = (checked: boolean) => {
    setAllDayChecked(prev => ({
      ...prev,
      [selectedDay]: checked
    }));
    
    // If checked, clear time slots for this day
    if (checked) {
      setDayAvailability(prev => ({
        ...prev,
        [selectedDay]: []
      }));
    }
  };

  const handleAddTimeSlot = () => {
    const newSlot: TimeSlot = {
      startTime: '09:00',
      endTime: '17:00'
    };
    
    setDayAvailability(prev => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newSlot]
    }));
  };

  const handleDeleteTimeSlot = (index: number) => {
    setDayAvailability(prev => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).filter((_, i) => i !== index)
    }));
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setDayAvailability(prev => {
      const slots = [...(prev[selectedDay] || [])];
      slots[index] = {
        ...slots[index],
        [field]: value
      };
      return {
        ...prev,
        [selectedDay]: slots
      };
    });
  };

  const handleSaveChanges = async () => {
    if (!currentUser) {
      toast.error("Please log in to save changes");
      return;
    }

    try {
      setSaving(true);

      // Delete all existing availability for this property (or all properties if null)
      const existingData = await viewingAppointmentService.getAvailabilityByProperty(
        currentUser.id,
        selectedPropertyId
      );
      
      for (const slot of existingData) {
        await viewingAppointmentService.deleteAvailability(slot.id);
      }

      // Save new availability
      for (const [dayStr, slots] of Object.entries(dayAvailability)) {
        const day = parseInt(dayStr);
        
        for (const slot of slots) {
          await viewingAppointmentService.setAvailability({
            user_id: currentUser.id,
            property_id: selectedPropertyId,
            day_of_week: day,
            start_time: `${slot.startTime}:00`,
            end_time: `${slot.endTime}:00`,
            is_active: true
          });
        }
      }

      // Save "All Day" slots
      for (const [dayStr, isAllDay] of Object.entries(allDayChecked)) {
        if (isAllDay) {
          const day = parseInt(dayStr);
          await viewingAppointmentService.setAvailability({
            user_id: currentUser.id,
            property_id: selectedPropertyId,
            day_of_week: day,
            start_time: '00:00:00',
            end_time: '23:59:00',
            is_active: true
          });
        }
      }

      toast.success("Availability saved successfully!");
      await loadAvailability(currentUser.id, selectedPropertyId);
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const selectedDayName = daysOfWeek.find(d => d.value === selectedDay)?.fullName || 'Monday';
  const currentDaySlots = dayAvailability[selectedDay] || [];
  const isAllDay = allDayChecked[selectedDay] || false;

  return (
    <div className="space-y-6">
      {/* Properties Table */}
      {properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Your Properties
            </CardTitle>
            <CardDescription>
              Click on a property to edit its viewing availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Property Address</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Availability Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(property => (
                    <PropertyRow 
                      key={property.id} 
                      property={property}
                      isSelected={selectedPropertyId === property.id}
                      onEdit={() => handlePropertyChange(property.id)}
                      currentUser={currentUser}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Set Weekly Availability
            {selectedPropertyId && (
              <span className="text-base font-normal text-gray-600">
                for {properties.find(p => p.id === selectedPropertyId)?.address || 'Selected Property'}
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {selectedPropertyId 
              ? "Set availability for the selected property"
              : "Select a property from the table above to set its availability"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Editor Card */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading availability...</p>
            </div>
          ) : (
            <>
              {/* Days Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Days:</h3>
                <div className="flex gap-2">
                  {daysOfWeek.map(day => {
                    const hasAvailability = (dayAvailability[day.value]?.length > 0) || allDayChecked[day.value];
                    return (
                      <button
                        key={day.value}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  For {selectedDayName}:
                </h3>

                {/* All Day Checkbox */}
                <div className="flex items-center space-x-2 mb-6">
                  <Checkbox
                    id="all-day"
                    checked={isAllDay}
                    onCheckedChange={handleAllDayChange}
                  />
                  <label
                    htmlFor="all-day"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    All Day
                  </label>
                </div>

                {/* Time Slots */}
                {!isAllDay && (
                  <>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Time Slots:</h4>
                    
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveChanges}
          disabled={saving || loading}
          className="bg-blue-600 hover:bg-blue-700 px-8"
          size="lg"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-gray-50 border-2 border-gray-200">
        <CardContent className="pt-6">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>💡</span>
            How It Works
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Select a property from the dropdown (or choose "All Properties")</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Click on a day button (M, T, W, etc.) to edit that day's availability</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Check "All Day" for full-day availability, or add specific time slots</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Add multiple time slots per day (e.g., 9am-12pm and 2pm-5pm)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">5.</span>
              <span>Click "Save Changes" to apply your availability schedule</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
