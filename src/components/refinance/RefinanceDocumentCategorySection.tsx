import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefinanceDocumentUploadSlot } from './RefinanceDocumentUploadSlot';
import type { DocumentCategoryConfig, RefinanceDocument } from '@/types/refinanceDocument';

interface RefinanceDocumentCategorySectionProps {
  category: DocumentCategoryConfig;
  mortgageProfileId: string;
  documents: RefinanceDocument[];
  onDocumentUploaded: () => void;
  onDocumentDeleted: () => void;
}

export function RefinanceDocumentCategorySection({
  category,
  mortgageProfileId,
  documents,
  onDocumentUploaded,
  onDocumentDeleted
}: RefinanceDocumentCategorySectionProps) {
  return (
    <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">{category.icon}</span>
          {category.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {category.documentTypes.map((docType) => {
          const existingDoc = documents.find(d => d.document_type === docType.type);
          
          return (
            <RefinanceDocumentUploadSlot
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
