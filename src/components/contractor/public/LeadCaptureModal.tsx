import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitLead } from "@/services/contractorPublicPageService";
import { CheckCircle, Loader2 } from "lucide-react";

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractorId: string;
  contractorName: string;
  slug: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
}

export function LeadCaptureModal({
  open,
  onOpenChange,
  contractorId,
  contractorName,
  slug,
}: LeadCaptureModalProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitLead({
        ...form,
        contractorId,
        sourceSlug: slug,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({ name: "", phone: "", email: "", message: "" });
        onOpenChange(false);
      }, 2000);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: err.message || "Could not send your request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Get a Quote from {contractorName}</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle className="h-14 w-14 text-green-500" />
            <p className="text-lg font-semibold text-gray-900">
              Request sent!
            </p>
            <p className="text-sm text-gray-500">
              {contractorName} will be in touch with you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="lead-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lead-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={errors.name ? "border-red-400" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label htmlFor="lead-phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lead-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                className={errors.phone ? "border-red-400" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Email (optional) */}
            <div className="space-y-1">
              <Label htmlFor="lead-email">Email (optional)</Label>
              <Input
                id="lead-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>

            {/* Message (optional) */}
            <div className="space-y-1">
              <Label htmlFor="lead-message">Message (optional)</Label>
              <Textarea
                id="lead-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Describe your project…"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
              style={{ backgroundColor: "var(--brand)" }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
