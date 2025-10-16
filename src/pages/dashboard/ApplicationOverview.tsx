import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Download,
  File,
  CheckCircle,
  XCircle,
  Clock,
  Signature,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Document interface
interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploaded_date: string;
  download_url: string;
}

// Contract status interface
interface ContractStatus {
  applicant_signed: boolean;
  applicant_signed_date?: string;
  landlord_signed: boolean;
  landlord_signed_date?: string;
  contract_url?: string;
}

// Mock application data structure
interface ApplicationDetails {
  id: string;
  property_id: string;
  property_name: string;
  property_location: string;
  property_price: number;
  status: "pending" | "under_review" | "approved" | "rejected" | "withdrawn";
  applied_date: string;
  property_image?: string;
  notes?: string;
  documents: Document[];
  contract_status: ContractStatus;
}

// Mock fetch function
const fetchApplicationDetails = async (applicationId: string): Promise<ApplicationDetails> => {
  console.log(`Fetching application details for ${applicationId}`);
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        id: applicationId,
        property_id: "prop_1",
        property_name: "Modern Downtown Apartment",
        property_location: "123 Main St, Toronto, ON",
        property_price: 2500,
        status: "under_review",
        applied_date: "2024-01-15",
        property_image: "/placeholder.svg",
        notes: "Interested in this property for the upcoming semester.",
        documents: [
          {
            id: "doc_1",
            name: "Income Verification Letter.pdf",
            type: "PDF",
            size: "2.3 MB",
            uploaded_date: "2024-01-15T10:30:00Z",
            download_url: "#"
          },
          {
            id: "doc_2",
            name: "Employment Reference.pdf",
            type: "PDF",
            size: "1.8 MB",
            uploaded_date: "2024-01-15T10:35:00Z",
            download_url: "#"
          },
          {
            id: "doc_3",
            name: "Bank Statement.pdf",
            type: "PDF",
            size: "3.1 MB",
            uploaded_date: "2024-01-15T10:40:00Z",
            download_url: "#"
          }
        ],
        contract_status: {
          applicant_signed: true,
          applicant_signed_date: "2024-01-16T14:20:00Z",
          landlord_signed: false,
          contract_url: "#"
        }
      });
    }, 1000)
  );
};

export default function ApplicationOverviewPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { user } = useAuth();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails(applicationId)
        .then((data) => {
          setApplication(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching application:", error);
          setLoading(false);
        });
    }
  }, [applicationId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "withdrawn":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      case "under_review":
        return "👀";
      case "pending":
        return "⏳";
      case "withdrawn":
        return "↩️";
      default:
        return "❓";
    }
  };

  const handleDownloadDocument = (document: Document) => {
    // In a real app, this would trigger the actual download
    console.log(`Downloading document: ${document.name}`);
    // For now, we'll just show an alert
    alert(`Downloading ${document.name}...`);
  };

  const getContractStatusColor = (signed: boolean) => {
    return signed ? "text-green-600" : "text-yellow-600";
  };

  const getContractStatusIcon = (signed: boolean) => {
    return signed ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading application details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
          <p className="text-gray-600 mb-4">The application you're looking for doesn't exist.</p>
          <Link to="/dashboard/applications">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/applications">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Overview</h1>
            <p className="text-gray-600">Application ID: {application.id}</p>
          </div>
        </div>
        <Badge className={`${getStatusColor(application.status)} text-sm`}>
          {getStatusIcon(application.status)} {application.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{application.property_name}</h3>
              <p className="text-gray-600 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {application.property_location}
              </p>
            </div>
            <div className="flex items-center text-lg font-semibold">
              <DollarSign className="w-5 h-5 mr-1" />
              ${application.property_price.toLocaleString()}/month
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              Applied on {new Date(application.applied_date).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <File className="w-5 h-5 mr-2" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.documents.length > 0 ? (
              <div className="space-y-3">
                {application.documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{document.name}</p>
                        <p className="text-xs text-gray-500">
                          {document.type} • {document.size} • {new Date(document.uploaded_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDocument(document)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No documents uploaded</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contract Status */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Signature className="w-5 h-5 mr-2" />
              Contract Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Applicant Signature Status */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Your Signature</h4>
                <div className="flex items-center space-x-3">
                  {getContractStatusIcon(application.contract_status.applicant_signed)}
                  <span className={`font-medium ${getContractStatusColor(application.contract_status.applicant_signed)}`}>
                    {application.contract_status.applicant_signed ? "Signed" : "Pending"}
                  </span>
                </div>
                {application.contract_status.applicant_signed_date && (
                  <p className="text-sm text-gray-600">
                    Signed on {new Date(application.contract_status.applicant_signed_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Landlord Signature Status */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Landlord Signature</h4>
                <div className="flex items-center space-x-3">
                  {getContractStatusIcon(application.contract_status.landlord_signed)}
                  <span className={`font-medium ${getContractStatusColor(application.contract_status.landlord_signed)}`}>
                    {application.contract_status.landlord_signed ? "Signed" : "Waiting for Signature"}
                  </span>
                </div>
                {application.contract_status.landlord_signed_date && (
                  <p className="text-sm text-gray-600">
                    Signed on {new Date(application.contract_status.landlord_signed_date).toLocaleDateString()}
                  </p>
                )}
                {!application.contract_status.landlord_signed && (
                  <p className="text-sm text-yellow-600">
                    The landlord will sign once they review your application
                  </p>
                )}
              </div>
            </div>

            {/* Contract Actions */}
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {application.contract_status.applicant_signed && application.contract_status.landlord_signed ? (
                  <span className="text-green-600 font-medium">✅ Contract is fully executed</span>
                ) : application.contract_status.applicant_signed ? (
                  <span className="text-yellow-600 font-medium">⏳ Waiting for landlord signature</span>
                ) : (
                  <span className="text-gray-600 font-medium">📝 Contract ready for your signature</span>
                )}
              </div>
              <div className="space-x-3">
                <Button variant="outline" size="sm">
                  View Contract
                </Button>
                {!application.contract_status.applicant_signed && (
                  <Button size="sm">
                    Sign Contract
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="outline">
          Download Application
        </Button>
        <Button>
          Contact Landlord
        </Button>
      </div>
    </div>
  );
}
