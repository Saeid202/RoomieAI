import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentUploadSlot } from './DocumentUploadSlot';
import type { DocumentCategoryConfig, MortgageDocument } from '@/types/mortgageDocument';

interface DocumentCategorySectionProps {
  category: DocumentCategoryConfig;
  mortgageProfileId: string;
  documents: MortgageDocument[];
  onDocumentUploaded: () => void;
  onDocumentDeleted: () => void;
}

export function DocumentCategorySection({
  category,
  mortgageProfileId,
  documents,
  onDocumentUploaded,
  onDocumentDeleted
}: DocumentCategorySectionProps) {
  return (
    <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">{category.icon}</span>
          {category.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {category.documentTypes.map((docType) => {
          const existingDoc = documents.find(d => d.document_type === docType.type);
          
          return (
            <DocumentUploadSlot
              key={docType.type}
              documentType={docType}
              category={category.category}
              mortgageProfileId={mortgageProfileId}
              existingDocument={existingDoc}
              onDocumentUploaded={onDocumentUploaded}
              onDocumentDeleted={onDocumentDeleted}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
