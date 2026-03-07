import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { viewingAppointmentService } from "@/services/viewingAppointmentService";
import { DateEditorPanel } from "./DateEditorPanel";
import type { LandlordAvailability, Property } from "@/types/viewingAppointment";
import { supabase } from "@/integrations/supabase/client";

interface DateAvailability {
  [dateString: string]: LandlordAvailability[];
}

interface MonthlyCalendarAvailabilityProps {
  preSelectedPropertyId?: string | null;
}

export function MonthlyCalendarAvailability({ preSelectedPropertyId }: MonthlyCalendarAvailabilityProps = {}) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [dateAvailability, setDateAvailability] = useState<DateAvailability>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
      
      // If preSelectedPropertyId is provided, use it
      const initialPropertyId = preSelectedPropertyId || null;
      setSelectedPropertyId(initialPropertyId);
      await loadAvailability(user.id, initialPropertyId);
    };
    getCurrentUser();
  }, [preSelectedPropertyId]);

  // Reload when month/property changes
  useEffect(() => {
    if (currentUser) {
      loadAvailability(currentUser.id, selectedPropertyId);
    }
  }, [currentMonth, currentYear, selectedPropertyId]);

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
      
      // Get start and end of current month view
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      
      // Fetch availability for this date range
      const data = await viewingAppointmentService.getAvailabilityByDateRange(
        userId,
        propertyId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Group by date
      const grouped: DateAvailability = {};
      data.forEach(slot => {
        if (slot.specific_date) {
          if (!grouped[slot.specific_date]) {
            grouped[slot.specific_date] = [];
          }
          grouped[slot.specific_date].push(slot);
        }
      });

      setDateAvailability(grouped);
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
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString);
  };

  const handleCloseEditor = () => {
    setSelectedDate(null);
    if (currentUser) {
      loadAvailability(currentUser.id, selectedPropertyId);
    }
  };

  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{
      date: Date;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPast: boolean;
      hasAvailability: boolean;
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date,
        dateString,
        isCurrentMonth: false,
        isToday: false,
        isPast: date < today,
        hasAvailability: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date,
        dateString,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
        hasAvailability: !!dateAvailability[dateString]?.length,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date,
        dateString,
        isCurrentMonth: false,
        isToday: false,
        isPast: false,
        hasAvailability: false,
      });
    }

    return days;
  };

  const days = generateCalendarDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Set Your Availability
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Click on any date to set your available hours for property viewings
          </CardDescription>
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

      {/* Calendar Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {monthNames[currentMonth]} {currentYear}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="text-blue-600"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading calendar...</p>
            </div>
          ) : (
            <>
              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map(name => (
                  <div
                    key={name}
                    className="text-center text-sm font-semibold text-gray-600 py-2"
                  >
                    {name}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const isClickable = day.isCurrentMonth && !day.isPast;
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => isClickable && handleDateClick(day.dateString)}
                      disabled={!isClickable}
                      className={`
                        relative h-16 rounded-lg border-2 transition-all
                        ${!day.isCurrentMonth ? 'bg-gray-50 border-gray-100 text-gray-300' : ''}
                        ${day.isCurrentMonth && day.isPast ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' : ''}
                        ${day.isCurrentMonth && !day.isPast && !day.hasAvailability ? 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer' : ''}
                        ${day.hasAvailability ? 'bg-green-50 border-green-300 hover:border-green-400 hover:bg-green-100 cursor-pointer' : ''}
                        ${day.isToday ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                      `}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className={`text-lg font-semibold ${day.hasAvailability ? 'text-green-900' : ''}`}>
                          {day.date.getDate()}
                        </span>
                        
                        {/* Availability Indicator */}
                        {day.hasAvailability && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                            <span className="text-[10px] text-green-700 font-medium">
                              {dateAvailability[day.dateString]?.length} slot{dateAvailability[day.dateString]?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        
                        {/* Add Icon for empty dates */}
                        {day.isCurrentMonth && !day.isPast && !day.hasAvailability && (
                          <Plus className="h-3 w-3 text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-green-300 bg-green-50"></div>
                  <span className="text-gray-600">Has availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-gray-200 bg-white"></div>
                  <span className="text-gray-600">No availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-blue-400 ring-2 ring-blue-400 ring-offset-2"></div>
                  <span className="text-gray-600">Today</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Date Editor Panel */}
      {selectedDate && (
        <DateEditorPanel
          date={selectedDate}
          propertyId={selectedPropertyId}
          userId={currentUser?.id}
          existingSlots={dateAvailability[selectedDate] || []}
          onClose={handleCloseEditor}
        />
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
              <span>Select a property from the dropdown (or choose "All Properties")</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Click on any date in the calendar to set your available hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Add multiple time slots per day (e.g., 9am-12pm and 2pm-5pm)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Green dates show you have availability set</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">5.</span>
              <span>Tenants will see 30-minute booking slots during your available hours</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
