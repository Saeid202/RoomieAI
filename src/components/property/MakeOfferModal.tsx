import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, User, Mail, Phone, Send, Home, MapPin } from "lucide-react";
import { Property } from "@/services/propertyService";

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onSubmit: (offerData: OfferData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface OfferData {
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  offer_amount: string;
  message: string;
}

export function MakeOfferModal({ isOpen, onClose, property, onSubmit, isSubmitting = false }: MakeOfferModalProps) {
  const [formData, setFormData] = useState<OfferData>({
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    offer_amount: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      buyer_name: "",
      buyer_email: "",
      buyer_phone: "",
      offer_amount: "",
      message: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-amber-600" />
            Make an Offer
          </DialogTitle>
          <DialogDescription>
            Submit your offer for this property
          </DialogDescription>
        </DialogHeader>

        {/* Property Info */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-amber-900">
                {property.listing_title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-amber-700 mt-1">
                <MapPin className="h-4 w-4" />
                <span>{property.address}, {property.city}</span>
              </div>
              {(property as any).sales_price && (
                <div className="flex items-center gap-2 text-sm text-amber-700 mt-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">Asking: ${(property as any).sales_price?.toLocaleString()}</span>
                </div>
              )}
            </div>
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
                <Label htmlFor="buyer_name">Full Name *</Label>
                <Input
                  id="buyer_name"
                  value={formData.buyer_name}
                  onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="buyer_email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="buyer_email"
                    type="email"
                    value={formData.buyer_email}
                    onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                    placeholder="john@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="buyer_phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="buyer_phone"
                    type="tel"
                    value={formData.buyer_phone}
                    onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="offer_amount">Offer Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="offer_amount"
                    type="number"
                    value={formData.offer_amount}
                    onChange={(e) => setFormData({ ...formData, offer_amount: e.target.value })}
                    placeholder="500000"
                    className="pl-10"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Message */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <Label htmlFor="message" className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <span>💬</span>
              Additional Message (Optional)
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Include any additional details about your offer, financing, closing timeline, etc..."
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Offer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
