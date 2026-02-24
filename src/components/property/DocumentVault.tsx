// =====================================================
// Document Vault Component
// =====================================================
// Purpose: Complete document management system with
//          smart suggestions based on property category
// =====================================================

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Info, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { ListingStrengthMeter } from "./ListingStrengthMeter";
import { DocumentSlot } from "./DocumentSlot";
import { AIReadinessIndicator } from "./AIReadinessIndicator";
import { AIPropertyChat } from "./AIPropertyChat";
import { FloatingAIButton } from "./FloatingAIButton";
import {
  PropertyCategory,
  PropertyDocument,
  PropertyDocumentType,
  getDocumentSlotsForCategory,
  calculateListingStrength,
} from "@/types/propertyCategories";
import {
  uploadPropertyDocument,
  getPropertyDocuments,
  deletePropertyDocument,
  updateDocumentPrivacy,
} from "@/services/propertyDocumentService";
import { toast } from "sonner";

// Pending document type for files selected before property is saved
interface PendingDocument {
  type: PropertyDocumentType;
  label: string;
  file: File;
  previewUrl: string;
}

interface DocumentVaultProps {
  propertyId: string | null; // null for new properties (not yet created)
  propertyCategory: PropertyCategory | null | undefined;
  onStrengthChange?: (score: number) => void;
  className?: string;
  readOnly?: boolean; // New: Read-only mode for buyers
  isBuyerView?: boolean; // New: Buyer-specific UI
}

export function DocumentVault({
  propertyId,
  propertyCategory,
  onStrengthChange,
  className = "",
  readOnly = false,
  isBuyerView = false,
}: DocumentVaultProps) {
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<Map<PropertyDocumentType, PendingDocument>>(new Map());
  const [loading, setLoading] = useState(false);
  const [listingStrength, setListingStrength] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  // Get relevant document slots based on category
  const documentSlots = getDocumentSlotsForCategory(propertyCategory);
  const commonSlots = documentSlots.filter(slot => slot.isCommon);
  const categorySlots = documentSlots.filter(slot => !slot.isCommon);

  // Load documents when property ID is available
  useEffect(() => {
    if (propertyId) {
      loadDocuments();
    }
  }, [propertyId]);

  // Calculate listing strength when documents change
  useEffect(() => {
    // Create mock documents for pending files to include in strength calculation
    const pendingAsDocs: PropertyDocument[] = Array.from(pendingDocuments.values()).map(pending => ({
      id: `pending-${pending.type}`,
      property_id: propertyId || 'pending',
      document_type: pending.type,
      document_label: pending.label,
      file_url: pending.previewUrl,
      file_name: pending.file.name,
      file_size: pending.file.size,
      mime_type: pending.file.type,
      is_public: false,
      uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const allDocs = [...documents, ...pendingAsDocs];
    const score = calculateListingStrength(allDocs, propertyCategory);
    setListingStrength(score);
    onStrengthChange?.(score);
  }, [documents, pendingDocuments, propertyCategory, onStrengthChange, propertyId]);

  const loadDocuments = async () => {
    if (!propertyId) return;

    setLoading(true);
    try {
      const docs = await getPropertyDocuments(propertyId);
      console.log('📄 DocumentVault: Loaded documents:', docs);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (type: PropertyDocumentType, label: string, file: File) => {
    if (!propertyId) {
      // Store as pending document with preview
      const previewUrl = URL.createObjectURL(file);
      const pending: PendingDocument = { type, label, file, previewUrl };

      setPendingDocuments(prev => {
        const newMap = new Map(prev);
        newMap.set(type, pending);
        return newMap;
      });

      toast.success(`${label} ready to upload (will be saved when you create the property)`);
      return;
    }

    try {
      const newDoc = await uploadPropertyDocument(
        propertyId,
        file,
        type,
        label,
        false // Default to private
      );
      setDocuments(prev => [...prev, newDoc]);
      toast.success(`${label} uploaded successfully!`);
    } catch (error) {
      throw error; // Re-throw to be handled by DocumentSlot
    }
  };

  const handleDeletePending = (type: PropertyDocumentType) => {
    setPendingDocuments(prev => {
      const newMap = new Map(prev);
      const pending = newMap.get(type);
      if (pending) {
        URL.revokeObjectURL(pending.previewUrl);
        newMap.delete(type);
      }
      return newMap;
    });
  };

  const handleDelete = async (documentId: string) => {
    try {
      await deletePropertyDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      throw error;
    }
  };

  const handlePrivacyToggle = async (documentId: string, isPublic: boolean) => {
    try {
      await updateDocumentPrivacy(documentId, isPublic);
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId ? { ...doc, is_public: isPublic } : doc
        )
      );
    } catch (error) {
      throw error;
    }
  };

  const getDocumentForSlot = (type: PropertyDocumentType): PropertyDocument | null => {
    return documents.find(doc => doc.document_type === type && !doc.deleted_at) || null;
  };

  const getPendingDocumentForSlot = (type: PropertyDocumentType): PendingDocument | null => {
    return pendingDocuments.get(type) || null;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Card */}
      <Card className="border-4 border-purple-300 shadow-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100 border-b-4 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 flex items-center justify-center shadow-xl">
                <FolderOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                    {isBuyerView ? 'Available Documents' : 'Property Document Vault'}
                  </span>
                  {!isBuyerView && (
                    <span className="text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full shadow-md">
                      Optional
                    </span>
                  )}
                </CardTitle>
                <p className="text-sm text-slate-700 mt-1 font-medium">
                  {isBuyerView 
                    ? 'Review property documentation' 
                    : 'Boost your listing credibility with professional documentation'}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Info Banner */}
          {isBuyerView ? (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-4 shadow-md">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-900 mb-2">
                    Document Access Granted
                  </p>
                  <p className="text-xs text-purple-800 leading-relaxed">
                    The seller has granted you access to these documents for your due diligence. 
                    Please contact the owner directly for any questions regarding the Status Certificate or Title.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 shadow-md">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0 shadow-lg">
                  <Info className="h-5 w-5 text-white" />
                </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-purple-900">
                      Why upload documents?
                    </p>
                    <ul className="text-xs text-purple-800 space-y-1 list-disc list-inside">
                      <li>Build trust with serious buyers</li>
                      <li>Speed up the due diligence process</li>
                      <li>Stand out from other listings</li>
                      <li>Control what's public vs. private</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Listing Strength Meter - Hide for buyers */}
            {!isBuyerView && <ListingStrengthMeter score={listingStrength} />}

            {/* AI Readiness Indicator - Show for buyers */}
            {isBuyerView && propertyId && (
              <AIReadinessIndicator
                propertyId={propertyId}
                onOpenChat={() => setShowAIChat(true)}
                variant="full"
              />
            )}

            {/* Buyer-Centric Categories */}
            {isBuyerView ? (
              <>
                {/* Legal Identity */}
                <div className="space-y-6 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 p-6 rounded-2xl border-3 border-purple-200 shadow-lg">
                  <div className="flex items-center gap-3 pb-3 border-b-4 border-purple-300">
                    <span className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-black rounded-full w-10 h-10 flex items-center justify-center shrink-0 shadow-xl">
                      1
                    </span>
                    <div>
                      <h3 className="text-xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Legal Identity
                      </h3>
                      <span className="text-xs font-bold text-purple-600">(Ownership & Tax)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documentSlots
                      .filter(slot => ['title_deed', 'property_tax_bill'].includes(slot.type))
                      .map((slot) => (
                        <DocumentSlot
                          key={slot.type}
                          type={slot.type}
                          label={slot.label}
                          description={slot.description}
                          weight={slot.weight}
                          document={getDocumentForSlot(slot.type)}
                          pendingDocument={getPendingDocumentForSlot(slot.type)}
                          onUpload={(file) => handleUpload(slot.type, slot.label, file)}
                          onDelete={handleDelete}
                          onDeletePending={() => handleDeletePending(slot.type)}
                          onPrivacyToggle={handlePrivacyToggle}
                          disabled={readOnly}
                          readOnly={readOnly}
                          isBuyerView={isBuyerView}
                        />
                      ))}
                  </div>
                </div>

                {/* Property Condition */}
                <div className="space-y-6 bg-gradient-to-br from-pink-50/50 to-purple-50/50 p-6 rounded-2xl border-3 border-pink-200 shadow-lg">
                  <div className="flex items-center gap-3 pb-3 border-b-4 border-pink-300">
                    <span className="bg-gradient-to-br from-pink-600 to-purple-600 text-white text-sm font-black rounded-full w-10 h-10 flex items-center justify-center shrink-0 shadow-xl">
                      2
                    </span>
                    <div>
                      <h3 className="text-xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Property Condition
                      </h3>
                      <span className="text-xs font-bold text-pink-600">(Disclosures & Inspections)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documentSlots
                      .filter(slot => ['disclosures', 'building_inspection'].includes(slot.type))
                      .map((slot) => (
                        <DocumentSlot
                          key={slot.type}
                          type={slot.type}
                          label={slot.label}
                          description={slot.description}
                          weight={slot.weight}
                          document={getDocumentForSlot(slot.type)}
                          pendingDocument={getPendingDocumentForSlot(slot.type)}
                          onUpload={(file) => handleUpload(slot.type, slot.label, file)}
                          onDelete={handleDelete}
                          onDeletePending={() => handleDeletePending(slot.type)}
                          onPrivacyToggle={handlePrivacyToggle}
                          disabled={readOnly}
                          readOnly={readOnly}
                          isBuyerView={isBuyerView}
                        />
                      ))}
                  </div>
                </div>

                {/* Governance */}
                <div className="space-y-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-6 rounded-2xl border-3 border-indigo-200 shadow-lg">
                  <div className="flex items-center gap-3 pb-3 border-b-4 border-indigo-300">
                    <span className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-black rounded-full w-10 h-10 flex items-center justify-center shrink-0 shadow-xl">
                      3
                    </span>
                    <div>
                      <h3 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Governance
                      </h3>
                      <span className="text-xs font-bold text-indigo-600">(Condo Rules & Status)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documentSlots
                      .filter(slot => ['condo_bylaws', 'status_certificate', 'survey_plan'].includes(slot.type))
                      .map((slot) => (
                        <DocumentSlot
                          key={slot.type}
                          type={slot.type}
                          label={slot.label}
                          description={slot.description}
                          weight={slot.weight}
                          document={getDocumentForSlot(slot.type)}
                          pendingDocument={getPendingDocumentForSlot(slot.type)}
                          onUpload={(file) => handleUpload(slot.type, slot.label, file)}
                          onDelete={handleDelete}
                          onDeletePending={() => handleDeletePending(slot.type)}
                          onPrivacyToggle={handlePrivacyToggle}
                          disabled={readOnly}
                          readOnly={readOnly}
                          isBuyerView={isBuyerView}
                        />
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Common Documents Section */}
                <div className="space-y-6 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 p-6 rounded-2xl border-3 border-purple-200 shadow-lg">
                  <div className="flex items-center gap-3 pb-3 border-b-4 border-purple-300">
                    <span className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-sm font-black rounded-full w-10 h-10 flex items-center justify-center shrink-0 shadow-xl">
                      1
                    </span>
                    <div>
                      <h3 className="text-xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Essential Documents
                      </h3>
                      <span className="text-xs font-bold text-purple-600">(For all property types)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {commonSlots.map((slot) => (
                      <DocumentSlot
                        key={slot.type}
                        type={slot.type}
                        label={slot.label}
                        description={slot.description}
                        weight={slot.weight}
                        document={getDocumentForSlot(slot.type)}
                        pendingDocument={getPendingDocumentForSlot(slot.type)}
                        onUpload={(file) => handleUpload(slot.type, slot.label, file)}
                        onDelete={handleDelete}
                        onDeletePending={() => handleDeletePending(slot.type)}
                        onPrivacyToggle={handlePrivacyToggle}
                        disabled={readOnly}
                        readOnly={readOnly}
                        isBuyerView={isBuyerView}
                      />
                    ))}
                  </div>
                </div>

                {/* Category-Specific Documents Section */}
                {categorySlots.length > 0 && propertyCategory && (
                  <div className="space-y-6 bg-gradient-to-br from-pink-50/50 to-purple-50/50 p-6 rounded-2xl border-3 border-pink-200 shadow-lg">
                    <div className="flex items-center gap-3 pb-3 border-b-4 border-pink-300">
                      <span className="bg-gradient-to-br from-pink-600 to-purple-600 text-white text-sm font-black rounded-full w-10 h-10 flex items-center justify-center shrink-0 shadow-xl">
                        2
                      </span>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                          {propertyCategory}-Specific Documents
                        </h3>
                        <Sparkles className="h-5 w-5 text-pink-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categorySlots.map((slot) => (
                        <DocumentSlot
                          key={slot.type}
                          type={slot.type}
                          label={slot.label}
                          description={slot.description}
                          weight={slot.weight}
                          document={getDocumentForSlot(slot.type)}
                          pendingDocument={getPendingDocumentForSlot(slot.type)}
                          onUpload={(file) => handleUpload(slot.type, slot.label, file)}
                          onDelete={handleDelete}
                          onDeletePending={() => handleDeletePending(slot.type)}
                          onPrivacyToggle={handlePrivacyToggle}
                          disabled={readOnly}
                          readOnly={readOnly}
                          isBuyerView={isBuyerView}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* No Category Selected Message */}
            {!propertyCategory && (
              <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600 mb-1">
                  Select a property category first
                </p>
                <p className="text-xs text-slate-500">
                  We'll show you the most relevant documents for your property type
                </p>
              </div>
            )}

            {/* No Property ID Message - Hide for buyers */}
            {!isBuyerView && !propertyId && propertyCategory && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900 mb-1">
                      Documents ready to upload
                    </p>
                    <p className="text-xs text-indigo-800">
                      Click "Create Listing" at the bottom to save your property first.
                      Then you can upload documents by editing the property.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
      </Card>

      {/* Floating AI Button - Only for buyers */}
      {isBuyerView && propertyId && (
        <FloatingAIButton
          propertyId={propertyId}
          onOpenChat={() => setShowAIChat(true)}
        />
      )}

      {/* AI Chat Modal */}
      {isBuyerView && propertyId && (
        <AIPropertyChat
          propertyId={propertyId}
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );
}
