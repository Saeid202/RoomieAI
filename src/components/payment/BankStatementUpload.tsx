// Bank Statement Upload Component - Multi-file support
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Loader2, Trash2, FileText, Upload, Plus } from "lucide-react";
import { toast } from "sonner";
import { uploadTenantDocument, deleteTenantDocument, DocumentType } from "@/services/documentUploadService";
import { formatCurrency } from "@/services/feeCalculationService";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface BankStatementAnalysis {
  monthlyIncome: number;
  regularDeposits: Array<{
    amount: number;
    frequency: string;
    description: string;
  }>;
  accountNumber?: string;
  confidence: number;
}

interface UploadedStatement {
  filePath: string;
  fileName: string;
}

interface BankStatementUploadProps {
  userId: string;
  onUploadSuccess?: (filePath: string) => void;
  onAnalysisComplete?: (analysis: BankStatementAnalysis | null) => void;
  bankStatementAnalysis?: BankStatementAnalysis | null;
}

export function BankStatementUpload({
  userId,
  onUploadSuccess,
  onAnalysisComplete,
  bankStatementAnalysis: externalAnalysis,
}: BankStatementUploadProps) {
  const [statements, setStatements] = useState<UploadedStatement[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UploadedStatement | null>(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`${file.name}: only PDF, JPG, PNG allowed`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name}: must be under 10MB`);
      return;
    }

    const result = await uploadTenantDocument(file, userId, 'bank_statement' as DocumentType);
    if (!result.success) {
      toast.error(result.error || `Failed to upload ${file.name}`);
      return;
    }

    const entry: UploadedStatement = { filePath: result.url!, fileName: file.name };
    setStatements(prev => [...prev, entry]);
    toast.success(`${file.name} uploaded`);
    onUploadSuccess?.(result.url!);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTenantDocument(deleteTarget.filePath);
      setStatements(prev => prev.filter(s => s.filePath !== deleteTarget.filePath));
      if (statements.length === 1) onAnalysisComplete?.(null);
      toast.success('Statement removed');
    } catch {
      toast.error('Failed to remove statement');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleAnalyze = async () => {
    if (statements.length === 0) return;
    setAnalyzing(true);
    try {
      // Simulate AI processing across all uploaded statements
      await new Promise(resolve => setTimeout(resolve, 2500));
      const mockAnalysis: BankStatementAnalysis = {
        monthlyIncome: 4500,
        regularDeposits: [
          { amount: 3500, frequency: 'monthly', description: 'Salary deposit' },
          { amount: 1000, frequency: 'monthly', description: 'Freelance income' },
        ],
        accountNumber: '****1234',
        confidence: 0.85 + Math.min(statements.length - 1, 3) * 0.03,
      };
      toast.success('Analysis complete');
      onAnalysisComplete?.(mockAnalysis);
    } catch {
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {/* Drop zone */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
            dragOver ? 'border-purple-400 bg-purple-50' : 'border-slate-300 hover:border-purple-300 hover:bg-slate-50'
          }`}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
            disabled={uploading || analyzing}
          />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            ) : (
              <Upload className="h-6 w-6 text-purple-500" />
            )}
            <p className="text-sm font-medium text-slate-700">
              {uploading ? 'Uploading...' : statements.length > 0 ? 'Add more statements' : 'Drop statements here or click to browse'}
            </p>
            <p className="text-xs text-slate-400">PDF, JPG, PNG · 10MB max per file · multiple files supported</p>
          </div>
        </div>

        {/* Uploaded files list */}
        {statements.length > 0 && (
          <div className="space-y-2">
            {statements.map(s => (
              <div key={s.filePath} className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-700 flex-1 truncate">{s.fileName}</span>
                <button
                  onClick={() => setDeleteTarget(s)}
                  className="h-6 w-6 flex items-center justify-center rounded text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Analyze button */}
        {statements.length > 0 && !externalAnalysis && (
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full"
            style={{ background: 'linear-gradient(to right, #8B5CF6, #FF6B35)' }}
          >
            {analyzing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing {statements.length} statement{statements.length > 1 ? 's' : ''}...</>
            ) : (
              <><Shield className="h-4 w-4 mr-2" /> Analyze {statements.length} Statement{statements.length > 1 ? 's' : ''} with AI</>
            )}
          </Button>
        )}

        {/* Analysis results */}
        {externalAnalysis && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-slate-900">Analysis Complete</p>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Monthly income</span>
              <span className="font-semibold">{formatCurrency(externalAnalysis.monthlyIncome)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Daily contribution</span>
              <span className="font-semibold">{formatCurrency(externalAnalysis.monthlyIncome / 30.4)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Confidence</span>
              <span className="font-semibold">{Math.round(externalAnalysis.confidence * 100)}%</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => { onAnalysisComplete?.(null); }}
            >
              Re-analyze
            </Button>
          </div>
        )}

        {/* Security notice */}
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Shield className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-700">Encrypted & private — used only for income verification</p>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Statement</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{deleteTarget?.fileName}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
