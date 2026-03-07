import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar,
  CheckCircle, 
  Key,
  FileSignature,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  Download,
  Phone,
  Mail,
  Home
} from 'lucide-react';
import { toast } from 'sonner';

interface ClosingDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyAddress: string;
  closingDate: Date;
  onComplete: () => void;
}

export function ClosingDateModal({ 
  isOpen, 
  onClose, 
  propertyId,
  propertyAddress,
  closingDate,
  onComplete 
}: ClosingDateModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'checklist' | 'complete'>('details');
  const [checklist, setChecklist] = useState({
    reviewedClosingDisclosure: false,
    verifiedWireTransfer: false,
    reviewedTitleInsurance: false,
    reviewedDeed: false,
    confirmedHomeownersInsurance: false,
    reviewedHOADocuments: false,
    confirmedUtilityTransfers: false,
    receivedKeys: false,
    receivedGarageDoorOpeners: false,
    receivedMailboxKeys: false,
    receivedSecurityCodes: false,
    receivedWarranties: false
  });

  const closingTime = '10:00 AM';
  const closingLocation = 'ABC Title & Escrow Office';
  const closingAddress = '123 Main Street, Suite 200';

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allItemsChecked = Object.values(checklist).every(v => v);
  const checkedCount = Object.values(checklist).filter(v => v).length;
  const totalCount = Object.keys(checklist).length;
  const progressPercentage = Math.round((checkedCount / totalCount) * 100);

  const handleComplete = () => {
    if (!allItemsChecked) {
      toast.error('Please complete all checklist items before finishing');
      return;
    }

    onComplete();
    onClose();
    toast.success('🎉 Congratulations! You are now a homeowner!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-purple-600" />
            Closing Day
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b-2 border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'details'
                ? 'text-purple-600 border-b-2 border-purple-600 -mb-0.5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="h-4 w-4 inline mr-2" />
            Details
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'checklist'
                ? 'text-purple-600 border-b-2 border-purple-600 -mb-0.5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileSignature className="h-4 w-4 inline mr-2" />
            Checklist
          </button>
          <button
            onClick={() => setActiveTab('complete')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'complete'
                ? 'text-purple-600 border-b-2 border-purple-600 -mb-0.5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Key className="h-4 w-4 inline mr-2" />
            Complete
          </button>
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Closing Information */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-purple-900 mb-4">Closing Appointment</h3>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="text-lg font-bold text-gray-900">
                        {closingDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-md font-semibold text-purple-600">{closingTime}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-lg font-bold text-gray-900">{closingLocation}</p>
                      <p className="text-sm text-gray-700">{closingAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Property</p>
                      <p className="text-lg font-bold text-gray-900">{propertyAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Who Will Be There</p>
                      <ul className="text-sm text-gray-700 space-y-1 mt-1">
                        <li>• You (Buyer)</li>
                        <li>• Seller</li>
                        <li>• Escrow Officer</li>
                        <li>• Your Real Estate Agent</li>
                        <li>• Seller's Agent</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What to Bring */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">What to Bring</h3>
              <ul className="space-y-2 text-sm text-blue-900">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Government-issued photo ID (Driver's License or Passport)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Cashier's check for remaining closing costs (if not wired)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Proof of homeowner's insurance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Copy of final walkthrough report</span>
                </li>
              </ul>
            </div>

            {/* Important Reminders */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900 mb-2">Important Reminders</p>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• Arrive 10-15 minutes early</li>
                    <li>• Plan for 1-2 hours for the signing process</li>
                    <li>• Read all documents carefully before signing</li>
                    <li>• Ask questions if anything is unclear</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Closing Disclosure
              </Button>
              <Button
                onClick={() => setActiveTab('checklist')}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                View Checklist
              </Button>
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-900">
                  {checkedCount} of {totalCount} items completed
                </span>
                <span className="text-lg font-bold text-purple-600">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Documents to Review & Sign */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-purple-600" />
                Documents to Review & Sign
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.reviewedClosingDisclosure}
                    onCheckedChange={() => toggleChecklistItem('reviewedClosingDisclosure')}
                  />
                  <span className="text-sm text-gray-900">Closing Disclosure (reviewed 3 days ago)</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.verifiedWireTransfer}
                    onCheckedChange={() => toggleChecklistItem('verifiedWireTransfer')}
                  />
                  <span className="text-sm text-gray-900">Verify wire transfer received by escrow</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.reviewedTitleInsurance}
                    onCheckedChange={() => toggleChecklistItem('reviewedTitleInsurance')}
                  />
                  <span className="text-sm text-gray-900">Title Insurance Policy</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.reviewedDeed}
                    onCheckedChange={() => toggleChecklistItem('reviewedDeed')}
                  />
                  <span className="text-sm text-gray-900">Property Deed</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.confirmedHomeownersInsurance}
                    onCheckedChange={() => toggleChecklistItem('confirmedHomeownersInsurance')}
                  />
                  <span className="text-sm text-gray-900">Homeowner's Insurance Confirmation</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.reviewedHOADocuments}
                    onCheckedChange={() => toggleChecklistItem('reviewedHOADocuments')}
                  />
                  <span className="text-sm text-gray-900">HOA Documents (if applicable)</span>
                </div>
              </div>
            </div>

            {/* Post-Closing Tasks */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Home className="h-5 w-5 text-purple-600" />
                Post-Closing Tasks
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.confirmedUtilityTransfers}
                    onCheckedChange={() => toggleChecklistItem('confirmedUtilityTransfers')}
                  />
                  <span className="text-sm text-gray-900">Confirm utility transfers (electric, gas, water)</span>
                </div>
              </div>
            </div>

            {/* Keys & Access */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Key className="h-5 w-5 text-purple-600" />
                Keys & Access Items
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.receivedKeys}
                    onCheckedChange={() => toggleChecklistItem('receivedKeys')}
                  />
                  <span className="text-sm text-gray-900">House keys (all copies)</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.receivedGarageDoorOpeners}
                    onCheckedChange={() => toggleChecklistItem('receivedGarageDoorOpeners')}
                  />
                  <span className="text-sm text-gray-900">Garage door openers</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.receivedMailboxKeys}
                    onCheckedChange={() => toggleChecklistItem('receivedMailboxKeys')}
                  />
                  <span className="text-sm text-gray-900">Mailbox keys</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.receivedSecurityCodes}
                    onCheckedChange={() => toggleChecklistItem('receivedSecurityCodes')}
                  />
                  <span className="text-sm text-gray-900">Security system codes</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={checklist.receivedWarranties}
                    onCheckedChange={() => toggleChecklistItem('receivedWarranties')}
                  />
                  <span className="text-sm text-gray-900">Appliance warranties & manuals</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveTab('details')} className="flex-1">
                Back to Details
              </Button>
              <Button 
                onClick={() => setActiveTab('complete')}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Complete Tab */}
        {activeTab === 'complete' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Finalize Closing</h3>

            {/* Progress Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-blue-900 mb-4">Closing Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Items Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {checkedCount} / {totalCount}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Progress</p>
                  <p className="text-2xl font-bold text-purple-600">{progressPercentage}%</p>
                </div>
              </div>
            </div>

            {/* Validation */}
            {!allItemsChecked && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">Incomplete Checklist</p>
                    <p className="text-xs text-amber-800">
                      Please complete all checklist items before finalizing the closing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {allItemsChecked && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-lg font-bold text-green-900">Ready to Complete!</p>
                    <p className="text-sm text-green-800 mt-1">
                      All items have been completed. You're ready to finalize your home purchase.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    By completing this process, you confirm that:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 mb-4">
                    <li>• All documents have been reviewed and signed</li>
                    <li>• All funds have been transferred</li>
                    <li>• You have received all keys and access items</li>
                    <li>• The property is in acceptable condition</li>
                  </ul>
                  
                  <Button
                    onClick={handleComplete}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg font-bold"
                  >
                    <Key className="h-5 w-5 mr-2" />
                    Complete Closing - I'm a Homeowner!
                  </Button>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <span>Escrow Officer: (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4 text-purple-600" />
                  <span>closing@abctitle.com</span>
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={() => setActiveTab('checklist')} className="w-full">
              Back to Checklist
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
