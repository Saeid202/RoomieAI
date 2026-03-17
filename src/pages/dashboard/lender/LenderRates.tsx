import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client-simple";
import { getLenderProfile, getLenderRates, createLenderRate, updateLenderRate, deleteLenderRate, getLenderRateHistory } from "@/services/lenderService";
import { LenderProfile, LenderRate, LenderRateHistory, CreateLenderRateInput, LOAN_TYPE_LABELS, TERM_YEARS_OPTIONS } from "@/types/lender";
import { Plus, Edit2, Trash2, History, Percent, DollarSign, Calendar } from "lucide-react";

export default function LenderRates() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<LenderProfile | null>(null);
  const [rates, setRates] = useState<LenderRate[]>([]);
  const [rateHistory, setRateHistory] = useState<LenderRateHistory[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRate, setEditingRate] = useState<LenderRate | null>(null);
  const [formData, setFormData] = useState<CreateLenderRateInput>({
    lender_id: "",
    loan_type: "conventional",
    term_years: 30,
    interest_rate: 0,
    apr: 0,
    points: 0,
    min_loan_amount: 0,
    max_loan_amount: 0,
    min_credit_score: 0,
    effective_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please log in to continue"); return; }
      const lenderProfile = await getLenderProfile(user.id);
      if (lenderProfile) {
        setProfile(lenderProfile);
        setFormData(prev => ({ ...prev, lender_id: lenderProfile.id }));
        const [lenderRates, history] = await Promise.all([
          getLenderRates(lenderProfile.id),
          getLenderRateHistory(lenderProfile.id)
        ]);
        setRates(lenderRates);
        setRateHistory(history);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load rates");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.interest_rate || !formData.loan_type) { toast.error("Please fill in required fields"); return; }
      if (editingRate) {
        await updateLenderRate(editingRate.id, formData);
        toast.success("Rate updated successfully");
        setEditingRate(null);
      } else {
        await createLenderRate(formData);
        toast.success("Rate created successfully");
        setShowAddForm(false);
      }
      setFormData({
        lender_id: profile?.id || "",
        loan_type: "conventional",
        term_years: 30,
        interest_rate: 0,
        apr: 0,
        points: 0,
        min_loan_amount: 0,
        max_loan_amount: 0,
        min_credit_score: 0,
        effective_date: new Date().toISOString().split('T')[0],
      });
      await loadData();
    } catch (error) {
      console.error("Error saving rate:", error);
      toast.error("Failed to save rate");
    }
  };

  const handleDelete = async (rateId: string) => {
    if (!confirm("Are you sure you want to delete this rate?")) return;
    try {
      await deleteLenderRate(rateId);
      toast.success("Rate deleted successfully");
      await loadData();
    } catch (error) {
      console.error("Error deleting rate:", error);
      toast.error("Failed to delete rate");
    }
  };

  const handleEdit = (rate: LenderRate) => {
    setEditingRate(rate);
    setFormData({
      lender_id: rate.lender_id,
      loan_type: rate.loan_type,
      term_years: rate.term_years,
      interest_rate: rate.interest_rate,
      apr: rate.apr || 0,
      points: rate.points,
      min_loan_amount: rate.min_loan_amount || 0,
      max_loan_amount: rate.max_loan_amount || 0,
      min_credit_score: rate.min_credit_score || 0,
      effective_date: rate.effective_date.split('T')[0],
      expiration_date: rate.expiration_date?.split('T')[0],
      notes: rate.notes,
    });
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading rates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 space-y-6 pb-10">
      {/* Page Header */}
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-4 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
              <Percent className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Interest Rates
              </h1>
              <p className="text-sm text-gray-700 font-medium">Manage your mortgage rates</p>
            </div>
          </div>

          <Button
            onClick={() => {
              setShowAddForm(true);
              setEditingRate(null);
              setFormData(prev => ({ ...prev, lender_id: profile?.id || "", effective_date: new Date().toISOString().split('T')[0] }));
            }}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Rate
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingRate) && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 shadow-xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{editingRate ? 'Edit Rate' : 'Add New Rate'}</h3>
              <Button variant="ghost" onClick={() => { setShowAddForm(false); setEditingRate(null); }}>Cancel</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Loan Type *</Label>
                <Select value={formData.loan_type} onValueChange={(value) => setFormData({ ...formData, loan_type: value })}>
                  <SelectTrigger className="border-2 border-purple-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOAN_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Term (Years) *</Label>
                <Select value={String(formData.term_years)} onValueChange={(value) => setFormData({ ...formData, term_years: parseInt(value) })}>
                  <SelectTrigger className="border-2 border-purple-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TERM_YEARS_OPTIONS.map(years => (
                      <SelectItem key={years} value={String(years)}>{years} years</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Interest Rate (%) *</Label>
                <Input type="number" step="0.001" value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) })}
                  className="border-2 border-purple-200" />
              </div>

              <div className="space-y-2">
                <Label>APR (%)</Label>
                <Input type="number" step="0.001" value={formData.apr || ""}
                  onChange={(e) => setFormData({ ...formData, apr: parseFloat(e.target.value) || 0 })}
                  className="border-2 border-purple-200" />
              </div>

              <div className="space-y-2">
                <Label>Points</Label>
                <Input type="number" step="0.001" value={formData.points || ""}
                  onChange={(e) => setFormData({ ...formData, points: parseFloat(e.target.value) || 0 })}
                  className="border-2 border-purple-200" />
              </div>

              <div className="space-y-2">
                <Label>Min Loan Amount ($)</Label>
                <Input type="number" value={formData.min_loan_amount || ""}
                  onChange={(e) => setFormData({ ...formData, min_loan_amount: parseFloat(e.target.value) || 0 })}
                  className="border-2 border-purple-200" />
              </div>

              <div className="space-y-2">
                <Label>Max Loan Amount ($)</Label>
                <Input type="number" value={formData.max_loan_amount || ""}
                  onChange={(e) => setFormData({ ...formData, max_loan_amount: parseFloat(e.target.value) || 0 })}
                  className="border-2 border-purple-200" />
              </div>

              <div className="space-y-2">
                <Label>Min Credit Score</Label>
                <Input type="number" value={formData.min_credit_score || ""}
                  onChange={(e) => setFormData({ ...formData, min_credit_score: parseInt(e.target.value) || 0 })}
                  className="border-2 border-purple-200" />
              </div>

              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input type="date" value={formData.effective_date || ""}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                  className="border-2 border-purple-200" />
              </div>

              <div className="space-y-2">
                <Label>Expiration Date</Label>
                <Input type="date" value={formData.expiration_date || ""}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  className="border-2 border-purple-200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2} className="w-full p-3 border-2 border-purple-200 rounded-md resize-none" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmit}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold">
                {editingRate ? 'Update Rate' : 'Create Rate'}
              </Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingRate(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rates List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Current Rates ({rates.length})</h2>

        {rates.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-8 text-center">
              <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No rates yet. Add your first rate to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rates.map((rate) => (
              <Card
                key={rate.id}
                className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
                  rate.is_active
                    ? 'border-purple-200 bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {LOAN_TYPE_LABELS[rate.loan_type as keyof typeof LOAN_TYPE_LABELS] || rate.loan_type}
                      </span>
                      <p className="text-sm text-gray-500">{rate.term_years} year term</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      rate.is_active ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rate.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900">{rate.interest_rate}%</span>
                      <span className="text-sm text-gray-500">interest rate</span>
                    </div>
                    {rate.apr && <p className="text-sm text-gray-600">APR: {rate.apr}%</p>}
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Min: ${rate.min_loan_amount?.toLocaleString() || 'N/A'}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Max: ${rate.max_loan_amount?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      Effective: {rate.effective_date ? new Date(rate.effective_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(rate)}
                      className="flex-1 border-purple-300 hover:bg-purple-50">
                      <Edit2 className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(rate.id)}
                      className="flex-1 border-red-300 hover:bg-red-50 text-red-600">
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rate History */}
      {rateHistory.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <History className="h-5 w-5 text-purple-600" />
            Rate History
          </h2>
          <Card className="border-2 border-gray-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                {rateHistory.slice(0, 10).map((history) => (
                  <div key={history.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {LOAN_TYPE_LABELS[history.loan_type as keyof typeof LOAN_TYPE_LABELS]} - {history.term_years} years
                      </p>
                      <p className="text-sm text-gray-500">{new Date(history.changed_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      {history.old_rate && history.new_rate && (
                        <p className="font-medium text-gray-900">{history.old_rate}% → {history.new_rate}%</p>
                      )}
                      {history.reason && <p className="text-sm text-gray-500">{history.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
