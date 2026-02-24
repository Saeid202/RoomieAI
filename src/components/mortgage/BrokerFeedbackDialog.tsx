import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BrokerFeedbackTab } from "./BrokerFeedbackTab";
import { MessageSquare } from "lucide-react";

interface BrokerFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  clientName: string;
  currentStatus: string;
}

export function BrokerFeedbackDialog({
  open,
  onOpenChange,
  profileId,
  clientName,
  currentStatus
}: BrokerFeedbackDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-indigo-50/50 border-2 border-purple-200">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-300/20 to-pink-300/20 rounded-full blur-2xl"></div>
        </div>

        <DialogHeader className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center shadow-xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Broker Feedback
              </DialogTitle>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Communicate with {clientName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="relative z-10 mt-4">
          <BrokerFeedbackTab
            profileId={profileId}
            currentStatus={currentStatus as any}
            isBroker={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
