import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Clock, Building2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { viewingAppointmentService } from "@/services/viewingAppointmentService";
import type { LandlordAvailability, Property } from "@/types/viewingAppointment";
import { supabase } from "@/integrations/supabase/client";

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function AvailabilityManager() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<LandlordAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth error:", error);
        toast.error("Please log in to manage availability");
        setLoading(false);
        setPropertiesLoading(false);
        return;
      }

      if (!user) {
        console.log("No user logged in");
        toast.error("Please log in to manage availability");
        setLoading(false);
        setPropertiesLoading(false);
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
      setPropertiesLoading(true);
      console.log('Loading properties for user:', userId);
      const data = await viewingAppointmentService.getLandlordProperties(userId);
      console.log('Properties loaded:', data);
      setProperties(data);
    } catch (error) {
      console.error("Error loading properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setPropertiesLoading(false);
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

  const handleAddSlot = async () => {
    if (!currentUser) return;

    // Validate times
    if (newSlot.start_time >= newSlot.end_time) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      await viewingAppointmentService.setAvailability({
        user_id: currentUser.id,
        property_id: selectedPropertyId,
        day_of_week: newSlot.day_of_week,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        is_active: true,
      });

      const propertyName = selectedPropertyId
        ? properties.find(p => p.id === selectedPropertyId)?.address || "property"
        : "all properties";

      toast.success(`Availability added for ${propertyName}!`);
      setShowAddForm(false);
      setNewSlot({ day_of_week: 1, start_time: '09:00', end_time: '17:00' });
      loadAvailability(currentUser.id, selectedPropertyId);
    } catch (error) {
      console.error("Error adding availability:", error);
      toast.error("Failed to add availability");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await viewingAppointmentService.updateAvailability(id, { is_active: !currentStatus });
      toast.success(currentStatus ? "Availability disabled" : "Availability enabled");
      if (currentUser) {
        loadAvailability(currentUser.id, selectedPropertyId);
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this availability slot?")) return;

    try {
      await viewingAppointmentService.deleteAvailability(id);
      toast.success("Availability deleted");
      if (currentUser) {
        loadAvailability(currentUser.id, selectedPropertyId);
      }
    } catch (error) {
      console.error("Error deleting availability:", error);
      toast.error("Failed to delete availability");
    }
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getPropertyName = (propertyId: string | null): string => {
    if (!propertyId) return "All Properties";
    const property = properties.find(p => p.id === propertyId);
    return property?.address || `Property ${propertyId.slice(0, 8)}`;
  };

  // Group by day
  const groupedAvailability = DAYS_OF_WEEK.map(day => ({
    day: day.label,
    dayNum: day.value,
    slots: availability.filter(a => a.day_of_week === day.value)
  })).filter(group => group.slots.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Your Availability</CardTitle>
            <CardDescription>
              Set your general availability for property viewings. Tenants will see these time slots when booking.
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Selector */}
        {propertiesLoading ? (
          <div className="mb-6">
            <Label>Property</Label>
            <div className="p-2 border rounded-md text-gray-400">
              Loading properties...
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You don't have any properties yet. Availability will apply globally once you add properties.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <Label htmlFor="property-selector">Property</Label>
            <Select
              value={selectedPropertyId || "all"}
              onValueChange={handlePropertyChange}
            >
              <SelectTrigger id="property-selector">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>All Properties</span>
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
            <p className="text-sm text-gray-500 mt-1">
              {selectedPropertyId
                ? "Setting availability for this property only"
                : "Setting availability for all properties"}
            </p>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="day">Day of Week</Label>
                  <select
                    id="day"
                    value={newSlot.day_of_week}
                    onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded-md"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start">Start Time</Label>
                    <Input
                      id="start"
                      type="time"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end">End Time</Label>
                    <Input
                      id="end"
                      type="time"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddSlot} className="flex-1">
                    Add Availability
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Availability List */}
        {!currentUser ? (
          <div className="text-center py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800 font-medium mb-2">Authentication Required</p>
              <p className="text-yellow-700 text-sm">
                Please log in to manage your viewing availability
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : groupedAvailability.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No availability set yet</p>
            <p className="text-sm text-gray-400">
              Add your available time slots so tenants can easily book viewings
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedAvailability.map(group => (
              <div key={group.dayNum}>
                <h3 className="font-semibold text-gray-900 mb-2">{group.day}</h3>
                <div className="space-y-2">
                  {group.slots.map(slot => (
                    <div key={slot.id}>
                      <div
                        className="flex items-center justify-between p-4 bg-white border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="font-medium">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                              <Building2 className="h-3 w-3 text-gray-400" />
                              {slot.property_id ? (
                                <Link
                                  to={`/dashboard/rent/${slot.property_id}`}
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                >
                                  <span>{getPropertyName(slot.property_id)}</span>
                                  <Eye className="h-3 w-3" />
                                </Link>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  {getPropertyName(slot.property_id)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`active-${slot.id}`} className="text-sm">
                              {slot.is_active ? 'Active' : 'Inactive'}
                            </Label>
                            <Switch
                              id={`active-${slot.id}`}
                              checked={slot.is_active}
                              onCheckedChange={() => handleToggleActive(slot.id, slot.is_active)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(slot.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">How it works</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Select a property or "All Properties" to set availability</li>
            <li>• Set your availability for each day of the week</li>
            <li>• Tenants will see available 30-minute time slots based on your schedule</li>
            <li>• Global availability applies to all your properties</li>
            <li>• Property-specific availability applies only to that property</li>
            <li>• You can still approve/decline custom time requests from tenants</li>
            <li>• Toggle slots on/off without deleting them</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
