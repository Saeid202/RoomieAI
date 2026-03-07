import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Check, X, User, Mail, Phone, Users, MessageSquare, Eye } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { viewingAppointmentService } from "@/services/viewingAppointmentService";
import { WeeklyAvailabilityEditor } from "@/components/landlord/WeeklyAvailabilityEditor";
import type { ViewingAppointment } from "@/types/viewingAppointment";
import { supabase } from "@/integrations/supabase/client";

export default function ViewingAppointments() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<ViewingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth error:", error);
        toast.error("Please log in to view appointments");
        setLoading(false);
        return;
      }

      if (!user) {
        console.log("No user logged in");
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      loadAppointments(user.id);
    };
    getCurrentUser();
  }, []);

  const loadAppointments = async (userId?: string) => {
    const id = userId || currentUser?.id;
    if (!id) return;

    try {
      setLoading(true);
      const data = await viewingAppointmentService.getLandlordAppointments(id);
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId: string) => {
    try {
      await viewingAppointmentService.updateAppointmentStatus(appointmentId, 'confirmed');
      toast.success("Appointment confirmed!");
      loadAppointments();
    } catch (error) {
      console.error("Error approving appointment:", error);
      toast.error("Failed to confirm appointment");
    }
  };

  const handleDecline = async (appointmentId: string, notes?: string) => {
    try {
      await viewingAppointmentService.updateAppointmentStatus(appointmentId, 'declined', notes);
      toast.success("Appointment declined");
      loadAppointments();
    } catch (error) {
      console.error("Error declining appointment:", error);
      toast.error("Failed to decline appointment");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
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

  const filterAppointments = (status: string) => {
    if (status === 'pending') {
      return appointments.filter(apt => apt.status === 'pending');
    }
    if (status === 'upcoming') {
      return appointments.filter(apt => apt.status === 'confirmed');
    }
    return appointments.filter(apt => ['declined', 'cancelled', 'completed'].includes(apt.status));
  };

  const AppointmentCard = ({ appointment }: { appointment: ViewingAppointment }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">{formatDate(appointment.requested_date)}</span>
              <Clock className="h-4 w-4 text-blue-600 ml-2" />
              <span className="font-semibold">{formatTime(appointment.requested_time_slot)}</span>
            </div>

            {(appointment as any).properties && (
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-2">
                  {/* Property Type Badge */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (appointment as any).properties.listing_category === 'sale' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {(appointment as any).properties.listing_category === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                  
                  {/* Property Link */}
                  <Link
                    to={
                      (appointment as any).properties.listing_category === 'sale'
                        ? `/dashboard/property/${appointment.property_id}`
                        : `/dashboard/rent/${appointment.property_id}`
                    }
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>
                      {(appointment as any).properties.listing_title || (appointment as any).properties.address}
                    </span>
                    <Eye className="h-3 w-3" />
                  </Link>
                </div>
                
                {/* Address if title is shown */}
                {(appointment as any).properties.listing_title && (
                  <div className="text-xs text-gray-500 ml-2 pl-16">
                    {(appointment as any).properties.address}{(appointment as any).properties.city ? `, ${(appointment as any).properties.city}` : ''}
                  </div>
                )}
              </div>
            )}

            {appointment.is_custom_request && (
              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Custom Request
              </span>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              appointment.status === 'declined' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
            }`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span>{appointment.requester_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{appointment.requester_email}</span>
          </div>
          {appointment.requester_phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{appointment.requester_phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{appointment.number_of_attendees} attendee(s)</span>
          </div>
        </div>

        {appointment.additional_message && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-700">{appointment.additional_message}</p>
            </div>
          </div>
        )}

        {appointment.status === 'pending' && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => handleApprove(appointment.id)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => handleDecline(appointment.id)}
              variant="outline"
              className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )}

        {appointment.landlord_notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Your notes:</span> {appointment.landlord_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Viewing Appointments</h1>
        <p className="text-gray-600">Manage your property viewing schedule and appointments</p>
      </div>

      {!currentUser ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
                <Calendar className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-yellow-900 mb-2">
                  Authentication Required
                </h2>
                <p className="text-yellow-800 mb-4">
                  Please log in to view and manage your property viewing appointments.
                </p>
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({filterAppointments('pending').length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({filterAppointments('upcoming').length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({filterAppointments('history').length})
            </TabsTrigger>
            <TabsTrigger value="availability">
              Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Review and respond to viewing requests</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : filterAppointments('pending').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending requests
                  </div>
                ) : (
                  filterAppointments('pending').map(apt => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Viewings</CardTitle>
                <CardDescription>Confirmed appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : filterAppointments('upcoming').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming viewings
                  </div>
                ) : (
                  filterAppointments('upcoming').map(apt => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
                <CardDescription>Past and declined appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : filterAppointments('history').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No history yet
                  </div>
                ) : (
                  filterAppointments('history').map(apt => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <WeeklyAvailabilityEditor />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
