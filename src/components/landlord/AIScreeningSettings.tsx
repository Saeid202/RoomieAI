// =====================================================
// AI Screening Settings Panel
// Landlord configuration for screening rules
// =====================================================

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AIScreeningRules, ScreeningBehaviourMode } from "@/types/aiScreening";
import { Settings, CheckCircle, AlertCircle, Info } from "lucide-react";

export function AIScreeningSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<AIScreeningRules | null>(null);

  // Form state
  const [behaviourMode, setBehaviourMode] = useState<ScreeningBehaviourMode>('report_only');
  const [requireCreditReport, setRequireCreditReport] = useState(true);
  const [requirePayroll, setRequirePayroll] = useState(true);
  const [requireEmploymentLetter, setRequireEmploymentLetter] = useState(false);
  const [requireReferenceLetter, setRequireReferenceLetter] = useState(false);
  const [minCreditScore, setMinCreditScore] = useState(650);
  const [minIncomeRatio, setMinIncomeRatio] = useState(2.5);
  const [minEmploymentMonths, setMinEmploymentMonths] = useState(3);
  const [assessReferenceQuality, setAssessReferenceQuality] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to access settings");
        return;
      }

      // Get landlord profile ID
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_uid', user.id)
        .single();

      if (!profile) {
        toast.error("Landlord profile not found");
        return;
      }

      // Fetch screening rules
      const { data: screeningRules } = await supabase
        .from('ai_screening_rules')
        .select('*')
        .eq('landlord_id', profile.id)
        .is('property_id', null)
        .maybeSingle();

      if (screeningRules) {
        setRules(screeningRules);
        setBehaviourMode(screeningRules.behaviour_mode);
        setRequireCreditReport(screeningRules.require_credit_report);
        setRequirePayroll(screeningRules.require_payroll);
        setRequireEmploymentLetter(screeningRules.require_employment_letter);
        setRequireReferenceLetter(screeningRules.require_reference_letter);
        setMinCreditScore(screeningRules.min_credit_score);
        setMinIncomeRatio(screeningRules.min_income_to_rent_ratio);
        setMinEmploymentMonths(screeningRules.min_employment_months);
        setAssessReferenceQuality(screeningRules.assess_reference_quality);
      }
    } catch (error) {
      console.error('Error loading rules:', error);
      toast.error("Failed to load screening settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to save settings");
        return;
      }

      // Get landlord profile ID
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_uid', user.id)
        .single();

      if (!profile) {
        toast.error("Landlord profile not found");
        return;
      }

      if (rules) {
        // Update existing rules
        const { error } = await supabase
          .from('ai_screening_rules')
          .update({
            behaviour_mode: behaviourMode,
            require_credit_report: requireCreditReport,
            require_payroll: requirePayroll,
            require_employment_letter: requireEmploymentLetter,
            require_reference_letter: requireReferenceLetter,
            min_credit_score: minCreditScore,
            min_income_to_rent_ratio: minIncomeRatio,
            min_employment_months: minEmploymentMonths,
            assess_reference_quality: assessReferenceQuality,
            updated_at: new Date().toISOString(),
          })
          .eq('id', rules.id);

        if (error) throw error;
        toast.success("Screening settings updated");
      } else {
        // Create new rules
        const { error } = await supabase
          .from('ai_screening_rules')
          .insert({
            landlord_id: profile.id,
            behaviour_mode: behaviourMode,
            require_credit_report: requireCreditReport,
            require_payroll: requirePayroll,
            require_employment_letter: requireEmploymentLetter,
            require_reference_letter: requireReferenceLetter,
            min_credit_score: minCreditScore,
            min_income_to_rent_ratio: minIncomeRatio,
            min_employment_months: minEmploymentMonths,
            assess_reference_quality: assessReferenceQuality,
          });

        if (error) throw error;
        toast.success("Screening settings created");
      }

      await loadRules();
    } catch (error) {
      console.error('Error saving rules:', error);
      toast.error("Failed to save screening settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            AI Screening Agent
          </h1>
          <p className="text-sm text-gray-500">Configure how the AI screens rental applications</p>
        </div>
      </div>

      {/* Behaviour Mode */}
      <Card className="border-2 border-purple-100 bg-gradient-to-br from-white to-pink-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Agent Behaviour Mode
            </span>
          </CardTitle>
          <CardDescription>
            Choose how the AI agent handles applications automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModeCard
              title="Report Only"
              description="AI screens and creates a summary. You make the final decision."
              selected={behaviourMode === 'report_only'}
              onClick={() => setBehaviourMode('report_only')}
              icon={<Info className="h-5 w-5" />}
            />
            <ModeCard
              title="Auto-Approve"
              description="Automatically approve applications that meet all your rules."
              selected={behaviourMode === 'auto_approve'}
              onClick={() => setBehaviourMode('auto_approve')}
              icon={<CheckCircle className="h-5 w-5" />}
            />
            <ModeCard
              title="Auto-Decline"
              description="Automatically decline applications that fail hard rules."
              selected={behaviourMode === 'auto_decline'}
              onClick={() => setBehaviourMode('auto_decline')}
              icon={<AlertCircle className="h-5 w-5" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card className="border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Required Documents
            </span>
          </CardTitle>
          <CardDescription>
            Mark which documents are mandatory for screening
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DocumentToggle
            title="Credit Report"
            description="Tenant's credit score and history"
            checked={requireCreditReport}
            onCheckedChange={setRequireCreditReport}
          />
          <DocumentToggle
            title="Payroll Documents"
            description="Last 2 months of income verification"
            checked={requirePayroll}
            onCheckedChange={setRequirePayroll}
          />
          <DocumentToggle
            title="Employment Letter"
            description="Employer verification letter"
            checked={requireEmploymentLetter}
            onCheckedChange={setRequireEmploymentLetter}
          />
          <DocumentToggle
            title="Reference Letter"
            description="Previous landlord or personal reference"
            checked={requireReferenceLetter}
            onCheckedChange={setRequireReferenceLetter}
          />
        </CardContent>
      </Card>

      {/* Screening Thresholds */}
      <Card className="border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              Screening Thresholds
            </span>
          </CardTitle>
          <CardDescription>
            Set the minimum requirements for approval
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="minCreditScore">Minimum Credit Score</Label>
            <Input
              id="minCreditScore"
              type="number"
              min="300"
              max="850"
              value={minCreditScore}
              onChange={(e) => setMinCreditScore(Number(e.target.value))}
              className="border-2 border-purple-200 focus:border-purple-500"
            />
            <p className="text-xs text-gray-500">Typical range: 600-750</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minIncomeRatio">Income-to-Rent Ratio</Label>
            <Input
              id="minIncomeRatio"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={minIncomeRatio}
              onChange={(e) => setMinIncomeRatio(Number(e.target.value))}
              className="border-2 border-purple-200 focus:border-purple-500"
            />
            <p className="text-xs text-gray-500">Example: 2.5x means income must be 2.5x rent</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minEmploymentMonths">Minimum Employment (months)</Label>
            <Input
              id="minEmploymentMonths"
              type="number"
              min="0"
              max="60"
              value={minEmploymentMonths}
              onChange={(e) => setMinEmploymentMonths(Number(e.target.value))}
              className="border-2 border-purple-200 focus:border-purple-500"
            />
            <p className="text-xs text-gray-500">Set to 0 to disable this check</p>
          </div>
          <div className="space-y-2">
            <Label>Reference Quality Assessment</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={assessReferenceQuality}
                onCheckedChange={setAssessReferenceQuality}
              />
              <span className="text-sm text-gray-600">
                {assessReferenceQuality ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-gray-500">AI will assess reference letter quality</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={loadRules}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-semibold"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}

// =====================================================
// Sub-components
// =====================================================

function ModeCard({
  title,
  description,
  selected,
  onClick,
  icon,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected
          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
          : 'border-gray-200 hover:border-purple-300 bg-white'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={selected ? 'text-purple-600' : 'text-gray-400'}>
          {icon}
        </div>
        <h3 className={`font-semibold ${selected ? 'text-purple-700' : 'text-gray-700'}`}>
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

function DocumentToggle({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-purple-100">
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default AIScreeningSettings;