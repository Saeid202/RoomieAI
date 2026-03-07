import React, { useState } from 'react';
import { CheckCircle, Clock, FileCheck, DollarSign, Home, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DocumentVerificationModal } from './DocumentVerificationModal';
import { PaymentEscrowSetupModal } from './PaymentEscrowSetupModal';
import { FinalWalkthroughModal } from './FinalWalkthroughModal';
import { ClosingDateModal } from './ClosingDateModal';

interface ClosingProcessViewProps {
  propertyId: string;
}

export function ClosingProcessView({ propertyId }: ClosingProcessViewProps) {
  const [showDocVerification, setShowDocVerification] = useState(false);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [showFinalWalkthrough, setShowFinalWalkthrough] = useState(false);
  const [showClosingDate, setShowClosingDate] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([1])); // Step 1 is completed
  
  // Determine step statuses based on completion
  const getStepStatus = (stepId: number): 'completed' | 'in_progress' | 'pending' => {
    if (completedSteps.has(stepId)) return 'completed';
    
    // Check if previous step is completed
    const previousStepCompleted = stepId === 1 || completedSteps.has(stepId - 1);
    if (previousStepCompleted) return 'in_progress';
    
    return 'pending';
  };

  const closingSteps = [
    {
      id: 1,
      title: 'Offer Acceptance',
      description: 'Your offer has been accepted by the seller',
      status: getStepStatus(1),
      icon: CheckCircle,
      date: completedSteps.has(1) ? 'Completed on Feb 28, 2026' : 'Not Started'
    },
    {
      id: 2,
      title: 'Document Verification',
      description: 'Review and verify all property documents',
      status: getStepStatus(2),
      icon: FileCheck,
      date: completedSteps.has(2) ? 'Completed' : 'In Progress'
    },
    {
      id: 3,
      title: 'Payment & Escrow Setup',
      description: 'Set up payment method and escrow account',
      status: getStepStatus(3),
      icon: DollarSign,
      date: completedSteps.has(3) ? 'Completed' : 'Not Started'
    },
    {
      id: 4,
      title: 'Final Walkthrough',
      description: 'Schedule final property inspection',
      status: getStepStatus(4),
      icon: Home,
      date: completedSteps.has(4) ? 'Completed' : 'Not Started'
    },
    {
      id: 5,
      title: 'Closing Date',
      description: 'Complete the transaction and receive keys',
      status: getStepStatus(5),
      icon: Calendar,
      date: completedSteps.has(5) ? 'Completed' : 'Not Started'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-emerald-600';
      case 'in_progress':
        return 'from-purple-500 to-indigo-600';
      case 'pending':
        return 'from-gray-400 to-gray-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'in_progress':
        return 'from-purple-50 to-indigo-50 border-purple-200';
      case 'pending':
        return 'from-gray-50 to-gray-100 border-gray-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  // Calculate progress percentage
  const progressPercentage = (completedSteps.size / 5) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-purple-900">Closing Progress</h2>
            <p className="text-sm text-purple-700 mt-1">Track your journey to property ownership</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-purple-600">{progressPercentage}%</div>
            <div className="text-xs text-purple-700 font-medium">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 shadow-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900 mb-1">
              Closing Process Assistant
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              This feature helps you track and manage all steps required to close the deal. 
              Complete each step in order to ensure a smooth transaction.
            </p>
          </div>
        </div>
      </div>

      {/* Closing Steps */}
      <div className="space-y-4">
        {closingSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`bg-gradient-to-r ${getStatusBg(step.status)} border-2 rounded-xl p-5 shadow-md transition-all hover:shadow-lg`}
            >
              <div className="flex items-start gap-4">
                {/* Step Number & Icon */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getStatusColor(step.status)} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {index < closingSteps.length - 1 && (
                    <div className="w-0.5 h-12 bg-gradient-to-b from-purple-300 to-transparent" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        step.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : step.status === 'in_progress'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {step.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {step.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                        {step.status === 'completed' ? 'Completed' : step.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">{step.date}</p>

                  {/* Action Button */}
                  {step.status === 'in_progress' && (
                    <Button
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md"
                      size="sm"
                      onClick={() => {
                        if (step.id === 2) {
                          setShowDocVerification(true);
                        } else if (step.id === 3) {
                          setShowPaymentSetup(true);
                        } else if (step.id === 4) {
                          setShowFinalWalkthrough(true);
                        } else if (step.id === 5) {
                          setShowClosingDate(true);
                        }
                      }}
                    >
                      Continue
                    </Button>
                  )}
                  {step.status === 'pending' && (
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      size="sm"
                      disabled
                    >
                      Not Available Yet
                    </Button>
                  )}
                  {step.status === 'completed' && (
                    <Button
                      variant="ghost"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      size="sm"
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-sm text-blue-800 mb-4">
          Our team is here to assist you throughout the closing process. Contact us if you have any questions.
        </p>
        <Button
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          Contact Support
        </Button>
      </div>

      {/* Document Verification Modal */}
      <DocumentVerificationModal
        isOpen={showDocVerification}
        onClose={() => setShowDocVerification(false)}
        propertyId={propertyId}
        onComplete={() => {
          setCompletedSteps(prev => new Set([...prev, 2]));
          toast.success('Document verification completed! Payment & Escrow Setup is now available.');
        }}
      />

      {/* Payment & Escrow Setup Modal */}
      <PaymentEscrowSetupModal
        isOpen={showPaymentSetup}
        onClose={() => setShowPaymentSetup(false)}
        propertyId={propertyId}
        purchasePrice={500000} // This should come from property data
        onComplete={() => {
          setCompletedSteps(prev => new Set([...prev, 3]));
          toast.success('Payment & Escrow setup completed! Final Walkthrough is now available.');
        }}
      />

      {/* Final Walkthrough Modal */}
      <FinalWalkthroughModal
        isOpen={showFinalWalkthrough}
        onClose={() => setShowFinalWalkthrough(false)}
        propertyId={propertyId}
        closingDate={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)} // 14 days from now
        onComplete={() => {
          setCompletedSteps(prev => new Set([...prev, 4]));
          toast.success('Final Walkthrough completed! Ready for closing date.');
        }}
      />

      {/* Closing Date Modal */}
      <ClosingDateModal
        isOpen={showClosingDate}
        onClose={() => setShowClosingDate(false)}
        propertyId={propertyId}
        propertyAddress="123 Example Street, City, State" // This should come from property data
        closingDate={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)} // 14 days from now
        onComplete={() => {
          setCompletedSteps(prev => new Set([...prev, 5]));
          toast.success('🎉 Congratulations! The property is now yours!');
        }}
      />
    </div>
  );
}
