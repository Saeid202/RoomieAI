
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPreference } from "@/components/dashboard/types";

// Mock data for buyer inquiries
interface BuyerInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyName: string;
  inquiryDate: string;
  message: string;
  status: 'new' | 'contacted' | 'meeting-scheduled' | 'completed';
  preferenceType: UserPreference;
}

// For demo purposes only - in a real app, we'd fetch this from a database
const mockInquiries: BuyerInquiry[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '(555) 123-4567',
    propertyId: 'prop123',
    propertyName: 'Modern Downtown Condo',
    inquiryDate: '2025-05-10T14:30:00Z',
    message: 'I\'m interested in co-owning this property. Could we discuss financing options?',
    status: 'new',
    preferenceType: 'co-owner'
  },
  {
    id: '2',
    name: 'Morgan Smith',
    email: 'morgan.smith@example.com',
    phone: '(555) 987-6543',
    propertyId: 'prop456',
    propertyName: 'Luxury Loft Apartment',
    inquiryDate: '2025-05-09T09:15:00Z',
    message: 'Looking for a co-owner to split costs on this beautiful property. I can contribute 60% of the down payment.',
    status: 'contacted',
    preferenceType: 'co-owner'
  },
  {
    id: '3',
    name: 'Casey Taylor',
    email: 'casey.t@example.com',
    phone: '(555) 765-4321',
    propertyId: 'prop789',
    propertyName: 'Suburban Family Home',
    inquiryDate: '2025-05-08T16:45:00Z',
    message: 'Interested in a viewing this weekend. Is it still available?',
    status: 'meeting-scheduled',
    preferenceType: null
  }
];

export default function BuyerInquiriesPage() {
  const [inquiries, setInquiries] = useState<BuyerInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    const fetchInquiries = async () => {
      setIsLoading(true);
      try {
        // In a real app, we'd make an API call here
        setTimeout(() => {
          setInquiries(mockInquiries);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching buyer inquiries:", error);
        setIsLoading(false);
      }
    };
    
    fetchInquiries();
  }, []);
  
  const updateInquiryStatus = (id: string, status: BuyerInquiry['status']) => {
    setInquiries(prevInquiries => 
      prevInquiries.map(inquiry => 
        inquiry.id === id ? { ...inquiry, status } : inquiry
      )
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Buyer Inquiries</h1>
        <p className="text-muted-foreground mt-1">Manage potential buyers and co-owners for your properties</p>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p>Loading inquiries...</p>
          </CardContent>
        </Card>
      ) : inquiries.length > 0 ? (
        <div className="space-y-6">
          {inquiries.map(inquiry => (
            <InquiryCard
              key={inquiry.id}
              inquiry={inquiry}
              onUpdateStatus={updateInquiryStatus}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium">No inquiries yet</h3>
            <p className="text-muted-foreground mt-2">
              You haven't received any buyer inquiries yet. When potential buyers contact you, they'll appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface InquiryCardProps {
  inquiry: BuyerInquiry;
  onUpdateStatus: (id: string, status: BuyerInquiry['status']) => void;
}

function InquiryCard({ inquiry, onUpdateStatus }: InquiryCardProps) {
  const getStatusBadge = (status: BuyerInquiry['status']) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      case 'contacted':
        return <Badge className="bg-yellow-500">Contacted</Badge>;
      case 'meeting-scheduled':
        return <Badge className="bg-purple-500">Meeting Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return null;
    }
  };
  
  const getPreferenceBadge = (preference: UserPreference) => {
    if (preference === 'co-owner') {
      return <Badge className="bg-roomie-purple">Co-Owner Interest</Badge>;
    }
    return null;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{inquiry.name}</CardTitle>
              {getStatusBadge(inquiry.status)}
              {getPreferenceBadge(inquiry.preferenceType)}
            </div>
            <CardDescription>Inquiry about: {inquiry.propertyName}</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground mt-2 md:mt-0">
            {formatDate(inquiry.inquiryDate)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Contact Information</p>
              <p className="text-sm">Email: {inquiry.email}</p>
              <p className="text-sm">Phone: {inquiry.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Message</p>
              <p className="text-sm">{inquiry.message}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {inquiry.status === 'new' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onUpdateStatus(inquiry.id, 'contacted')}
              >
                Mark as Contacted
              </Button>
            )}
            {inquiry.status === 'contacted' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onUpdateStatus(inquiry.id, 'meeting-scheduled')}
              >
                Schedule Meeting
              </Button>
            )}
            {inquiry.status === 'meeting-scheduled' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onUpdateStatus(inquiry.id, 'completed')}
              >
                Mark as Completed
              </Button>
            )}
            <Button size="sm" variant="ghost" asChild>
              <a href={`mailto:${inquiry.email}`}>Send Email</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
