// =====================================================
// AI Screening Summary Card
// Shows on Applications page beside "View Contracts"
// =====================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIScreeningResult, RuleEvaluation } from "@/types/aiScreening";
import { CheckCircle, XCircle, AlertTriangle, Clock, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface AIScreeningSummaryCardProps {
  screeningResult: AIScreeningResult;
  onApprove?: () => void;
  onDecline?: () => void;
  onViewDetails?: () => void;
}

export function AIScreeningSummaryCard({
  screeningResult,
  onApprove,
  onDecline,
  onViewDetails,
}: AIScreeningSummaryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const { overall_result, confidence_score, ai_summary, rule_results, missing_documents } = screeningResult;

  const resultConfig = {
    approved: {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      badgeColor: 'bg-green-100 text-green-700',
      badgeText: 'AI Approved',
    },
    declined: {
      icon: <XCircle className="h-6 w-6 text-red-500" />,
      bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
      borderColor: 'border-red-200',
      badgeColor: 'bg-red-100 text-red-700',
      badgeText: 'AI Declined',
    },
    conditional: {
      icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
      bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200',
      badgeColor: 'bg-yellow-100 text-yellow-700',
      badgeText: 'Conditional',
    },
    pending: {
      icon: <Clock className="h-6 w-6 text-gray-500" />,
      bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
      borderColor: 'border-gray-200',
      badgeColor: 'bg-gray-100 text-gray-700',
      badgeText: 'Pending Review',
    },
    error: {
      icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      badgeColor: 'bg-orange-100 text-orange-700',
      badgeText: 'Error',
    },
  };

  const config = resultConfig[overall_result] || resultConfig.pending;

  const passCount = rule_results.filter((r) => r.result === 'pass').length;
  const failCount = rule_results.filter((r) => r.result === 'fail').length;
  const conditionalCount = rule_results.filter((r) => r.result === 'conditional').length;

  return (
    <Card className={`border-2 ${config.borderColor} ${config.bgColor} shadow-lg`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.badgeColor}`}>
              {config.badgeText}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Confidence: {Math.round(confidence_score * 100)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Summary */}
        <p className="text-sm text-gray-700 font-medium">{ai_summary}</p>

        {/* Quick Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">{passCount} passed</span>
          </div>
          {failCount > 0 && (
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-gray-600">{failCount} failed</span>
            </div>
          )}
          {conditionalCount > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600">{conditionalCount} conditional</span>
            </div>
          )}
        </div>

        {/* Missing Documents */}
        {missing_documents.length > 0 && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Missing Documents</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {missing_documents.map((doc) => (
                <span
                  key={doc}
                  className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full"
                >
                  {formatDocType(doc)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Rule Details */}
        {expanded && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            {rule_results.map((rule, index) => (
              <RuleResultItem key={index} rule={rule} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> View Details
              </>
            )}
          </Button>
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              Full Review
            </Button>
          )}
          {overall_result !== 'declined' && onApprove && (
            <Button
              size="sm"
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </Button>
          )}
          {overall_result !== 'approved' && onDecline && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onDecline}
            >
              Decline
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Sub-components
// =====================================================

function RuleResultItem({ rule }: { rule: RuleEvaluation }) {
  const statusConfig = {
    pass: { icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: 'text-green-700' },
    fail: { icon: <XCircle className="h-4 w-4 text-red-500" />, color: 'text-red-700' },
    conditional: { icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-700' },
    not_applicable: { icon: <Clock className="h-4 w-4 text-gray-400" />, color: 'text-gray-500' },
  };

  const config = statusConfig[rule.result];

  return (
    <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg text-sm">
      {config.icon}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{rule.rule_name.replace(/_/g, ' ')}</span>
          {rule.is_hard_rule && (
            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
              Hard
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{rule.details}</p>
      </div>
    </div>
  );
}

function formatDocType(docType: string): string {
  const labels: Record<string, string> = {
    credit_report: 'Credit Report',
    payroll: 'Payroll',
    employment_letter: 'Employment Letter',
    reference_letter: 'Reference Letter',
  };
  return labels[docType] || docType;
}

export default AIScreeningSummaryCard;