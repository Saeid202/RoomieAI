// Quick Apply Modal - Simple confirmation for applying with profile data
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Home, 
  User, 
  FileText, 
  CheckCircle2, 
  Loader2,
  MapPin,
  DollarSign
} from "lucide-react";
import { Property } from "@/services/propertyService";
import { TenantProfileData } from "@/utils/profileCompleteness";

interface QuickApplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
  profileData: TenantProfileData;
  onConfirm: (message: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function QuickApplyModal({
  open,
  onOpenChange,
  property,
  profileData,
  onConfirm,
  isSubmitting = false,
}: QuickApplyModalProps) {
  const [message, setMessage] = useState("");

  const handleConfirm = async () => {
    await onConfirm(message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Quick Apply
          </DialogTitle>
          <DialogDescription>
            Your profile and documents will be sent to the landlord
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Property Info */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900">
                  {property.listing_title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{property.address}, {property.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">${property.monthly_rent}/month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Data Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Your Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-slate-500 text-xs">Full Name</p>
                <p className="font-medium text-slate-900">{profileData.full_name}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-slate-500 text-xs">Email</p>
                <p className="font-medium text-slate-900">{profileData.email}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-slate-500 text-xs">Phone</p>
                <p className="font-medium text-slate-900">{profileData.phone}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-slate-500 text-xs">Monthly Income</p>
                <p className="font-medium text-slate-900">
                  ${profileData.monthly_income?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Documents Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Documents Included
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {profileData.reference_letters && (
                <div className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded-lg p-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-900">Reference Letters</span>
                </div>
              )}
              {profileData.employment_letter && (
                <div className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded-lg p-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-900">Employment Letter</span>
                </div>
              )}
              {profileData.credit_score_report && (
                <div className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded-lg p-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-900">Credit Score Report</span>
                </div>
              )}
            </div>
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-base font-semibold">
              Message to Landlord <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Introduce yourself or add any additional information..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] text-base"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
