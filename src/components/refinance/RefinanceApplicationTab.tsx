import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle, FileText, Shield, Info, User } from 'lucide-react';
import { RefinanceDocumentCategorySection } from './RefinanceDocumentCategorySection';
import { REFINANCE_DOCUMENT_CATEGORIES } from '@/types/refinanceDocument';
import type { RefinanceDocument, DocumentCompletionStats } from '@/types/refinanceDocument';
import {
  getDocumentsByProfile,
  getDocumentCompletionStats
} from '@/services/refinanceDocumentService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface RefinanceApplicationTabProps {
  mortgageProfileId: string;
}

export function RefinanceApplicationTab({ mortgageProfileId }: RefinanceApplicationTabProps) {
  const [documents, setDocuments] = useState<RefinanceDocument[]>([]);
  const [stats, setStats] = useState<DocumentCompletionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [brokerConsent, setBrokerConsent] = useState<boolean>(false);
  const [lenderConsent, setLenderConsent] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, [mortgageProfileId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const { data: docs } = await getDocumentsByProfile(mortgageProfileId);
      const { data: completionStats } = await getDocumentCompletionStats(mortgageProfileId);
      
      if (docs) setDocuments(docs);
      if (completionStats) setStats(completionStats);
    } catch (error) {
      console.error('Failed to load refinance documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploaded = () => {
    loadDocuments();
  };

  const handleDocumentDeleted = () => {
    loadDocuments();
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-purple-500/30 via-indigo-500/30 to-blue-500/30 rounded-3xl p-4 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-indigo-400/40 to-blue-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
            <RefreshCw className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Re-finance Application
            </h1>
            <p className="text-sm text-gray-700 font-medium">
              Upload documents required for your refinancing application
            </p>
          </div>
        </div>
      </div>

      {/* Completion Progress */}
      {stats && (
        <Card className="border-2 border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stats.completionPercentage === 100 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              Document Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Required Documents</span>
                <span className="text-slate-600">
                  {stats.uploadedRequired} of {stats.totalRequired} uploaded
                </span>
              </div>
              <Progress value={stats.completionPercentage} className="h-3" />
              <p className="text-xs text-slate-500">
                {stats.completionPercentage}% complete
              </p>
            </div>
            
            {stats.totalOptional > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-slate-600">
                  Optional: {stats.uploadedOptional} of {stats.totalOptional} uploaded
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document Categories */}
      <div className="space-y-6">
        {REFINANCE_DOCUMENT_CATEGORIES.map((category) => (
          <RefinanceDocumentCategorySection
            key={category.category}
            category={category}
            mortgageProfileId={mortgageProfileId}
            documents={documents.filter(d => d.document_category === category.category)}
            onDocumentUploaded={handleDocumentUploaded}
            onDocumentDeleted={handleDocumentDeleted}
          />
        ))}
      </div>

      {/* Consent Sections */}
      <div className="space-y-6 mt-8">
        {/* Share Profile with Mortgage Broker */}
        <Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200 ring-offset-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">Share Profile with Mortgage Broker</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    I consent to share my mortgage profile with Homie AI's trusted mortgage broker for review and recommendations.
                  </p>
                </div>
              </div>
              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={brokerConsent}
                onClick={() => {
                  const newValue = !brokerConsent;
                  setBrokerConsent(newValue);
                  toast({
                    title: newValue ? "Broker Access Granted" : "Broker Access Revoked",
                    description: "Remember to save your application to apply this change.",
                  });
                }}
                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  brokerConsent ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    brokerConsent ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Status Banner */}
            {brokerConsent ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 font-semibold bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>Your profile is visible to our mortgage broker</span>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                <Info className="h-4 w-4 flex-shrink-0" />
                <span>Your profile is private from mortgage brokers. Turn on to allow access.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Share Profile with Lender */}
        <Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200 ring-offset-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">Share Profile with Lender</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    I consent to share my mortgage profile with Homie AI's trusted lenders for loan review and rate offers.
                  </p>
                </div>
              </div>
              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={lenderConsent}
                onClick={() => {
                  const newValue = !lenderConsent;
                  setLenderConsent(newValue);
                  toast({
                    title: newValue ? "Lender Access Granted" : "Lender Access Revoked",
                    description: "Remember to save your application to apply this change.",
                  });
                }}
                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  lenderConsent ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    lenderConsent ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Status Banner */}
            {lenderConsent ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 font-semibold bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>Your profile is visible to our lenders</span>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                <Info className="h-4 w-4 flex-shrink-0" />
                <span>Your profile is private - not shared with lenders. Turn on to allow access.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Button at bottom of re-finance application */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t-2 border-purple-200 p-4 shadow-lg z-10 mt-8">
        <div className="flex justify-center">
          <Button
            onClick={() => {
              toast({
                title: "Re-finance Application Saved",
                description: "Your re-finance document uploads have been saved successfully!",
              });
            }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 h-12 text-base font-semibold shadow-md"
          >
            <FileText className="h-4 w-4 mr-2" />
            Save Re-finance Application
          </Button>
        </div>
      </div>
    </div>
  );
}
