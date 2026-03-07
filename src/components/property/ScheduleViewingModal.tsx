import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, Mail, Phone, Users, Send, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { viewingAppointmentService } from "@/services/viewingAppointmentService";
import { CalendlyStylePicker } from "@/components/viewing/CalendlyStylePicker";
import type { Property } from "@/services/propertyService";
import type { TimeSlot, LandlordAvailability, ViewingAppointment } from "@/types/viewingAppointment";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onSuccess?: () => void;
}

export function ScheduleViewingModal({ isOpen, onClose, property, onSuccess }: ScheduleViewingModalProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomRequest, setShowCustomRequest] = useState(false);
  const [availability, setAvailability] = useState<LandlordAvailability[]>([]);
  const [bookedAppointments, setBookedAppointments] = useState<ViewingAppointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  const [formData, setFormData] = useState({
    requester_name: "",
    requester_email: "",
    requester_phone: "",
    number_of_attendees: 1,
    additional_message: "",
    custom_date: "",
    custom_time: "",
  });

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Load availability and appointments
  useEffect(() => {
    if (isOpen && property.id) {
      loadAvailabilityData();
    }
  }, [isOpen, property.id]);

  // Generate time slots when date changes
  useEffect(() => {
    if (selectedDate && availability.length > 0) {
      const date = new Date(selectedDate + 'T00:00:00');
      const slots = viewingAppointmentService.generateTimeSlots(date, availability, bookedAppointments);
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, availability, bookedAppointments]);

  const loadAvailabilityData = async () => {
    console.log("📅 Modal loading availability for property:", property);
    try {
      const [availData, appointmentsData] = await Promise.all([
        viewingAppointmentService.getPropertyAvailability(property.id, property.user_id),
        viewingAppointmentService.getPropertyAppointments(property.id)
      ]);
      console.log("📅 Modal received availability:", availData);
      setAvailability(availData);
      setBookedAppointments(appointmentsData);
    } catch (error) {
      console.error("Error loading availability:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please sign in to schedule a viewing");
      return;
    }

    if (!formData.requester_name || !formData.requester_email) {
      toast.error("Please fill in your contact information");
      return;
    }

    // Validate based on booking type
    if (showCustomRequest) {
      if (!formData.custom_date || !formData.custom_time) {
        toast.error("Please select a date and time for your custom request");
        return;
      }
    } else {
      if (!selectedDate || !selectedSlot) {
        toast.error("Please select a date and time slot");
        return;
      }
    }

    try {
      setLoading(true);

      await viewingAppointmentService.createAppointment({
        property_id: property.id,
        landlord_id: property.user_id,
        requester_id: currentUser.id,
        requester_name: formData.requester_name,
        requester_email: formData.requester_email,
        requester_phone: formData.requester_phone || undefined,
        appointment_date: showCustomRequest ? formData.custom_date : selectedDate,
        appointment_time: showCustomRequest ? formData.custom_time : selectedSlot,
        number_of_attendees: formData.number_of_attendees,
        additional_message: formData.additional_message || undefined,
        is_custom_request: showCustomRequest,
      });

      toast.success(
        showCustomRequest
          ? "Custom viewing request sent! The landlord will review and respond."
          : "Viewing appointment requested successfully!"
      );
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Error scheduling viewing:", error);
      toast.error(error.message || "Failed to schedule viewing");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      requester_name: "",
      requester_email: "",
      requester_phone: "",
      number_of_attendees: 1,
      additional_message: "",
      custom_date: "",
      custom_time: "",
    });
    setSelectedDate("");
    setSelectedSlot("");
    setShowCustomRequest(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const hasAvailability = availability.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Schedule a Property Viewing
          </DialogTitle>
          <DialogDescription>
            Request a viewing appointment for {property.listing_title}
          </DialogDescription>
        </DialogHeader>

        {/* Property Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">{property.listing_title}</h3>
          <p className="text-sm text-blue-700">
            {property.address && `${property.address}, `}{property.city}, {property.state}
          </p>

          {/* Debug Info - helpful for troubleshooting availability issues */}
          <div className="mt-2 pt-2 border-t border-blue-100 text-[10px] text-blue-400 flex flex-wrap items-center gap-x-4">
            <span>Prop: {property.id.slice(0, 8)}...</span>
            <span>Owner: {property.user_id?.slice(0, 8)}...</span>
            <span>Slots: {availability.length}</span>
            <span>Active: {availability.filter(a => a.is_active).length}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                loadAvailabilityData();
              }}
              className="ml-auto underline hover:text-blue-600"
            >
              Refresh
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-5">
            <h4 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Your Contact Information
              <span className="text-red-500 text-xl">*</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.requester_name}
                  onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.requester_email}
                    onChange={(e) => setFormData({ ...formData, requester_email: e.target.value })}
                    placeholder="john@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.requester_phone}
                    onChange={(e) => setFormData({ ...formData, requester_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="attendees">Number of Attendees</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="attendees"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.number_of_attendees}
                    onChange={(e) => setFormData({ ...formData, number_of_attendees: parseInt(e.target.value) || 1 })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Calendly-Style Date & Time Picker - Only show when NOT custom request AND has availability */}
          {!showCustomRequest && hasAvailability && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-5">
              <CalendlyStylePicker
                availability={availability}
                availableSlots={availableSlots}
                selectedDate={selectedDate}
                selectedTime={selectedSlot}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot("");
                }}
                onTimeSelect={setSelectedSlot}
              />
            </div>
          )}

          {/* Custom Request Form - Show when custom request is toggled OR no availability */}
          {(showCustomRequest || !hasAvailability) && (
            <div className="space-y-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-5">
              <h4 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                Request Custom Time
                <span className="text-red-500 text-xl">*</span>
              </h4>

              {!hasAvailability && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    The landlord hasn't set availability yet. Submit a custom request and they'll respond with their availability.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom_date">Preferred Date *</Label>
                  <Input
                    id="custom_date"
                    type="date"
                    min={today}
                    value={formData.custom_date}
                    onChange={(e) => setFormData({ ...formData, custom_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="custom_time">Preferred Time *</Label>
                  <Input
                    id="custom_time"
                    type="time"
                    value={formData.custom_time}
                    onChange={(e) => setFormData({ ...formData, custom_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Why this time? (Optional)</Label>
                <Textarea
                  id="reason"
                  value={formData.additional_message}
                  onChange={(e) => setFormData({ ...formData, additional_message: e.target.value })}
                  placeholder="e.g., I work nights and can only view in the morning..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Toggle Custom Request - Collapsible - Only show when there IS availability */}
          {hasAvailability && (
            <div className="border-t-4 border-gray-300 pt-6 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCustomRequest(!showCustomRequest);
                  if (showCustomRequest) {
                    setFormData({ ...formData, custom_date: "", custom_time: "", additional_message: "" });
                  }
                }}
                className={`w-full flex items-center justify-between p-5 rounded-xl transition-all text-left shadow-lg hover:shadow-xl ${
                  showCustomRequest 
                    ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-3 border-blue-500 hover:from-blue-200 hover:to-blue-100' 
                    : 'bg-gradient-to-r from-amber-100 to-amber-50 border-3 border-amber-400 hover:from-amber-200 hover:to-amber-100 animate-pulse'
                }`}
                style={{ borderWidth: '3px' }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${showCustomRequest ? 'bg-blue-200' : 'bg-amber-200'}`}>
                    <AlertCircle className={`h-6 w-6 ${showCustomRequest ? 'text-blue-700' : 'text-amber-700'}`} />
                  </div>
                  <div>
                    <span className={`text-lg font-extrabold ${showCustomRequest ? 'text-blue-900' : 'text-amber-900'}`}>
                      {showCustomRequest ? "✓ Using Custom Time Request" : "Don't see a time that works?"}
                    </span>
                    {!showCustomRequest && (
                      <p className="text-sm font-semibold text-amber-800 mt-1">👆 Click here to request your preferred time</p>
                    )}
                  </div>
                </div>
                {showCustomRequest ? (
                  <ChevronUp className="h-6 w-6 text-blue-700 flex-shrink-0 font-bold" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-amber-700 flex-shrink-0 font-bold" />
                )}
              </button>
            </div>
          )}

          {/* Additional Message (for regular bookings) */}
          {!showCustomRequest && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <Label htmlFor="message" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <span>💬</span>
                Additional Message (Optional)
              </Label>
              <Textarea
                id="message"
                value={formData.additional_message}
                onChange={(e) => setFormData({ ...formData, additional_message: e.target.value })}
                placeholder="Any specific questions or requirements for the viewing..."
                rows={3}
                className="mt-2"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {showCustomRequest ? "Send Custom Request" : "Request Viewing"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
