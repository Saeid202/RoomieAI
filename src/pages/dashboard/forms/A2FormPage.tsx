import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Printer, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore
import html2pdf from "html2pdf.js";

interface NSFRow {
    amount: string;
    date: string;
    nsfDate: string;
    bankCharge: string;
    adminCharge: string;
    total: string;
}

const SectionHeader = ({ num, title }: { num: number; title: React.ReactNode }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-white text-xs font-bold flex-shrink-0">
            {num}
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">{title}</h2>
    </div>
);

export default function A2FormPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [id, setId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("part1");

    // Load draft if ID is in URL
    useState(() => {
        const params = new URLSearchParams(window.location.search);
        const draftId = params.get('id');
        if (draftId) {
            setId(draftId);
            loadDraft(draftId);
        }
    });

    async function loadDraft(draftId: string) {
        setIsLoading(true);
        try {
            const { data, error } = await (supabase
                .from('a2_forms' as any)
                .select('*')
                .eq('id', draftId)
                .single() as any);

            if (error) throw error;
            if (data) {
                // Map columns back to formData
                setFormData({
                    applicantType: data.applicant_type,
                    applicantFirst: data.applicant_first_name,
                    applicantLast: data.applicant_last_name,
                    applicantCompany: data.applicant_company,
                    applicantAddress: data.applicant_address,
                    applicantUnit: data.applicant_unit,
                    applicantCity: data.applicant_city,
                    applicantProvince: data.applicant_province,
                    applicantPostal: data.applicant_postal,
                    applicantPhoneDay: data.applicant_phone_day,
                    applicantPhoneEve: data.applicant_phone_eve,
                    applicantEmail: data.applicant_email,
                    rentalAddress: data.rental_address,
                    fileNumber1: data.related_files?.[0] || "",
                    fileNumber2: data.related_files?.[1] || "",
                    t_reason1_refused: data.t_reason1_refused,
                    t_r1_type: data.t_r1_type,
                    t_r1_explanation: data.t_r1_explanation,
                    t_r1_remedy_authorize: data.t_r1_remedy_authorize,
                    t_r1_remedy_person: data.t_r1_remedy_person,
                    t_r1_remedy_end: data.t_r1_remedy_end,
                    t_r1_end_date: data.t_r1_end_date,
                    t_r1_remedy_abatement: data.t_r1_remedy_abatement,
                    t_r1_abatement_amount: String(data.t_r1_abatement_amount || ""),
                    t_r1_abatement_explanation: data.t_r1_abatement_explanation,
                    t_reason2_subtenant_stayed: data.t_reason2_subtenant_stayed,
                    t_r2_move_out_date: data.t_r2_move_out_date,
                    t_r2_remedy_evict: data.t_r2_remedy_evict,
                    t_r2_remedy_comp: data.t_r2_remedy_comp,
                    t_r2_rent_paid: String(data.t_r2_rent_paid || ""),
                    t_r2_rent_period: data.t_r2_rent_period,
                    l_reason1_unauthorized: data.l_reason1_unauthorized,
                    l_r1_aware_date: data.l_r1_aware_date,
                    l_r1_remedy_evict: data.l_r1_remedy_evict,
                    l_r1_remedy_comp: data.l_r1_remedy_comp,
                    l_r1_prev_rent: String(data.l_r1_prev_rent || ""),
                    l_r1_prev_rent_freq: data.l_r1_prev_rent_freq,
                    nsfCharges: data.nsf_charges || [],
                    l_reason2_subtenant_stayed: data.l_reason2_subtenant_stayed,
                    l_r2_move_out_date: data.l_r2_move_out_date,
                    l_reason3_refusal_reasonable: data.l_reason3_refusal_reasonable,
                    l_r3_explanation: data.l_r3_explanation,
                    signerType: data.signer_type,
                    sigFirst: data.signature_first_name,
                    sigLast: data.signature_last_name,
                    sigDate: data.signature_date,
                    repLsuc: data.representative_info?.lsuc || "",
                    repCompany: data.representative_info?.company || "",
                    repAddress: data.representative_info?.address || "",
                    repCity: data.representative_info?.city || "",
                    repProvince: data.representative_info?.province || "ON",
                    repPostal: data.representative_info?.postal || "",
                    repFax: data.representative_info?.fax || "",
                    repEmail: data.representative_info?.email || ""
                });
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error loading draft", description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    const handleDownload = () => {
        const element = document.getElementById('a2-form-content');
        const opt = {
            margin: 10,
            filename: 'A2-Application-Sublet-Assignment.pdf',
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };
        html2pdf().set(opt).from(element).save();
    };

    // Form Data
    const [formData, setFormData] = useState({
        // Part 1
        applicantType: "tenant", // tenant, landlord
        applicantFirst: "",
        applicantLast: "",
        applicantCompany: "",
        applicantAddress: "",
        applicantUnit: "",
        applicantCity: "",
        applicantProvince: "Ontario",
        applicantPostal: "",
        applicantPhoneDay: "",
        applicantPhoneEve: "",
        applicantEmail: "",
        rentalAddress: "",
        fileNumber1: "",
        fileNumber2: "",

        // Part 2 (Tenant)
        t_reason1_refused: false,
        t_r1_type: "assign",
        t_r1_explanation: "",
        t_r1_remedy_authorize: false,
        t_r1_remedy_person: "",
        t_r1_remedy_end: false,
        t_r1_end_date: "",
        t_r1_remedy_abatement: false,
        t_r1_abatement_amount: "",
        t_r1_abatement_explanation: "",

        t_reason2_subtenant_stayed: false,
        t_r2_move_out_date: "",
        t_r2_remedy_evict: false,
        t_r2_remedy_comp: false,
        t_r2_rent_paid: "",
        t_r2_rent_period: "month",

        // Part 3 (Landlord)
        l_reason1_unauthorized: false,
        l_r1_aware_date: "",
        l_r1_remedy_evict: false,
        l_r1_remedy_comp: false,
        l_r1_prev_rent: "",
        l_r1_prev_rent_freq: "month",

        nsfCharges: [] as NSFRow[],

        l_reason2_subtenant_stayed: false,
        l_r2_move_out_date: "",

        l_reason3_refusal_reasonable: false,
        l_r3_explanation: "",

        // Part 4
        signerType: "tenant",
        sigFirst: "",
        sigLast: "",
        sigDate: "",

        // Rep
        repLsuc: "",
        repCompany: "",
        repAddress: "",
        repCity: "",
        repProvince: "ON",
        repPostal: "",
        repFax: "",
        repEmail: ""
    });

    const handleInput = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // NSF Table Helpers
    const addNSFRow = () => {
        setFormData(prev => ({
            ...prev,
            nsfCharges: [...prev.nsfCharges, { amount: "", date: "", nsfDate: "", bankCharge: "", adminCharge: "", total: "" }]
        }));
    };

    const updateNSFRow = (index: number, field: keyof NSFRow, value: string) => {
        const newRows = [...formData.nsfCharges];
        newRows[index][field] = value;
        setFormData(prev => ({ ...prev, nsfCharges: newRows }));
    };

    const removeNSFRow = (index: number) => {
        const newRows = formData.nsfCharges.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, nsfCharges: newRows }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const upsertData = {
                id: id || undefined,
                user_id: user.id,
                applicant_type: formData.applicantType,
                applicant_first_name: formData.applicantFirst,
                applicant_last_name: formData.applicantLast,
                applicant_company: formData.applicantCompany,
                applicant_address: formData.applicantAddress,
                applicant_unit: formData.applicantUnit,
                applicant_city: formData.applicantCity,
                applicant_province: formData.applicantProvince,
                applicant_postal: formData.applicantPostal,
                applicant_phone_day: formData.applicantPhoneDay,
                applicant_phone_eve: formData.applicantPhoneEve,
                applicant_email: formData.applicantEmail,
                rental_address: formData.rentalAddress,
                related_files: [formData.fileNumber1, formData.fileNumber2].filter(Boolean),

                t_reason1_refused: formData.t_reason1_refused,
                t_r1_type: formData.t_r1_type,
                t_r1_explanation: formData.t_r1_explanation,
                t_r1_remedy_authorize: formData.t_r1_remedy_authorize,
                t_r1_remedy_person: formData.t_r1_remedy_person,
                t_r1_remedy_end: formData.t_r1_remedy_end,
                t_r1_end_date: formData.t_r1_end_date || null,
                t_r1_remedy_abatement: formData.t_r1_remedy_abatement,
                t_r1_abatement_amount: parseFloat(formData.t_r1_abatement_amount) || 0,
                t_r1_abatement_explanation: formData.t_r1_abatement_explanation,

                t_reason2_subtenant_stayed: formData.t_reason2_subtenant_stayed,
                t_r2_move_out_date: formData.t_r2_move_out_date || null,
                t_r2_remedy_evict: formData.t_r2_remedy_evict,
                t_r2_remedy_comp: formData.t_r2_remedy_comp,
                t_r2_rent_paid: parseFloat(formData.t_r2_rent_paid) || 0,
                t_r2_rent_period: formData.t_r2_rent_period,

                l_reason1_unauthorized: formData.l_reason1_unauthorized,
                l_r1_aware_date: formData.l_r1_aware_date || null,
                l_r1_remedy_evict: formData.l_r1_remedy_evict,
                l_r1_remedy_comp: formData.l_r1_remedy_comp,
                l_r1_prev_rent: parseFloat(formData.l_r1_prev_rent) || 0,
                l_r1_prev_rent_freq: formData.l_r1_prev_rent_freq,
                nsf_charges: formData.nsfCharges,

                l_reason2_subtenant_stayed: formData.l_reason2_subtenant_stayed,
                l_r2_move_out_date: formData.l_r2_move_out_date || null,
                l_reason3_refusal_reasonable: formData.l_reason3_refusal_reasonable,
                l_r3_explanation: formData.l_r3_explanation,

                signer_type: formData.signerType,
                signature_first_name: formData.sigFirst,
                signature_last_name: formData.sigLast,
                signature_date: formData.sigDate || null,

                representative_info: {
                    lsuc: formData.repLsuc,
                    company: formData.repCompany,
                    address: formData.repAddress,
                    city: formData.repCity,
                    province: formData.repProvince,
                    postal: formData.repPostal,
                    fax: formData.repFax,
                    email: formData.repEmail
                },
                status: 'draft',
                updated_at: new Date().toISOString()
            };

            const { data, error } = await (supabase
                .from('a2_forms' as any)
                .upsert(upsertData)
                .select()
                .single() as any);

            if (error) throw error;
            if (data) {
                setId(data.id);
                const newUrl = `${window.location.pathname}?id=${data.id}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
                toast({ title: "Draft Saved", description: "Form saved successfully to drafts." });
            }
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save form." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full -mx-6 -mt-6">
            {/* Page background */}
            <div className="bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200 px-6 py-8 print:bg-white print:p-0">
                <div id="a2-form-content" className="w-full bg-slate-50 shadow-[0_2px_24px_0_rgba(0,0,0,0.07)] border border-slate-200/60 rounded-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none">

                    {/* Form header */}
                    <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-8 py-6 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Application about a Sublet or an Assignment</h1>
                            <p className="text-slate-500 text-sm mt-1">Tenant or Landlord Application (Residential Tenancies Act, 2006)</p>
                            <p className="text-slate-400 text-xs">Form A2</p>
                        </div>
                        <div className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-bold">LTB - A2</div>
                    </div>


                <div className="px-8 py-8 space-y-10 print:p-0">

                    {/* Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-full min-w-[2rem] min-h-[2rem] flex items-center justify-center text-amber-900 font-bold">!</div>
                        <div>
                            <h3 className="font-semibold text-amber-900">Important Legal Notice</h3>
                            <p className="text-sm text-amber-800">This application is used when a tenant or landlord has a dispute about a sublet or assignment of a rental unit. Select the correct applicant type and complete only the relevant reasons section.</p>
                        </div>
                    </div>

                    {/* Section 1 — Applicant Info */}
                    <div>
                        <SectionHeader num={1} title="Applicant Information" />
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="py-3 bg-slate-50 border-b">
                                    <CardTitle className="text-sm font-medium uppercase text-slate-500">Who is Filing?</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 grid gap-4">
                                    <div className="w-full md:w-1/3">
                                        <Label>I am a:</Label>
                                        <Select value={formData.applicantType} onValueChange={(v) => handleInput("applicantType", v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tenant">Tenant</SelectItem>
                                                <SelectItem value="landlord">Landlord</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>First Name</Label><Input value={formData.applicantFirst} onChange={e => handleInput("applicantFirst", e.target.value)} /></div>
                                        <div className="space-y-1"><Label>Last Name</Label><Input value={formData.applicantLast} onChange={e => handleInput("applicantLast", e.target.value)} /></div>
                                    </div>
                                    <div className="space-y-1"><Label>Company Name (if applicable)</Label><Input value={formData.applicantCompany} onChange={e => handleInput("applicantCompany", e.target.value)} /></div>
                                    <div className="space-y-1"><Label>Street Address</Label><Input value={formData.applicantAddress} onChange={e => handleInput("applicantAddress", e.target.value)} /></div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-1"><Label>City</Label><Input value={formData.applicantCity} onChange={e => handleInput("applicantCity", e.target.value)} /></div>
                                        <div className="space-y-1"><Label>Province</Label><Input value="Ontario" readOnly className="bg-slate-100" /></div>
                                        <div className="space-y-1"><Label>Postal Code</Label><Input value={formData.applicantPostal} onChange={e => handleInput("applicantPostal", e.target.value)} /></div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>Day Phone</Label><Input value={formData.applicantPhoneDay} onChange={e => handleInput("applicantPhoneDay", e.target.value)} /></div>
                                        <div className="space-y-1"><Label>Email</Label><Input value={formData.applicantEmail} onChange={e => handleInput("applicantEmail", e.target.value)} /></div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="py-3 bg-slate-50 border-b">
                                    <CardTitle className="text-sm font-medium uppercase text-slate-500">Rental Unit</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <Label>Address of Rental Unit</Label>
                                    <Textarea value={formData.rentalAddress} onChange={e => handleInput("rentalAddress", e.target.value)} className="mt-1.5" placeholder="Full address of the rental unit" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Section 2 — Tenant Reasons */}
                    <div>
                        <SectionHeader num={2} title={<>Tenant Reasons <span className="text-slate-400 normal-case font-normal">(complete only if you are the Tenant)</span></>} />
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-800 text-sm">
                                Use this section <strong>only</strong> if you are the Tenant filing this application.
                            </div>

                            {/* T Reason 1 */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox checked={formData.t_reason1_refused} onCheckedChange={(c) => handleInput("t_reason1_refused", c)} className="mt-0.5" />
                                        <div>
                                            <CardTitle className="text-base">Reason 1: Unreasonable Refusal</CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">The landlord arbitrarily or unreasonably refused my request to assign or sublet.</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                {formData.t_reason1_refused && (
                                    <CardContent className="space-y-4 border-t pt-4">
                                        <div>
                                            <Label>I requested permission to:</Label>
                                            <RadioGroup value={formData.t_r1_type} onValueChange={v => handleInput("t_r1_type", v)} className="flex space-x-6 mt-2">
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="assign" id="assign" /><Label htmlFor="assign">Assign</Label></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="sublet" id="sublet" /><Label htmlFor="sublet">Sublet</Label></div>
                                            </RadioGroup>
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Explanation of why the refusal was unreasonable</Label>
                                            <Textarea value={formData.t_r1_explanation} onChange={e => handleInput("t_r1_explanation", e.target.value)} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label className="font-semibold">Remedy Requested</Label>
                                            <div className="space-y-3 pl-3 border-l-2 border-slate-200 mt-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox checked={formData.t_r1_remedy_authorize} onCheckedChange={c => handleInput("t_r1_remedy_authorize", c)} />
                                                    <Label>Authorize assignment/sublet to:</Label>
                                                </div>
                                                <Input placeholder="Name of person" value={formData.t_r1_remedy_person} onChange={e => handleInput("t_r1_remedy_person", e.target.value)} className="ml-6 w-1/2" />
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Checkbox checked={formData.t_r1_remedy_end} onCheckedChange={c => handleInput("t_r1_remedy_end", c)} />
                                                    <Label>End tenancy on date:</Label>
                                                </div>
                                                <Input type="date" value={formData.t_r1_end_date} onChange={e => handleInput("t_r1_end_date", e.target.value)} className="ml-6 w-1/3" />
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* T Reason 2 */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox checked={formData.t_reason2_subtenant_stayed} onCheckedChange={(c) => handleInput("t_reason2_subtenant_stayed", c)} className="mt-0.5" />
                                        <div>
                                            <CardTitle className="text-base">Reason 2: Subtenant Overstayed</CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">The subtenant did not move out on the agreed date.</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                {formData.t_reason2_subtenant_stayed && (
                                    <CardContent className="space-y-4 border-t pt-4">
                                        <div className="space-y-1">
                                            <Label>Expected Move-out Date</Label>
                                            <Input type="date" value={formData.t_r2_move_out_date} onChange={e => handleInput("t_r2_move_out_date", e.target.value)} className="w-1/3" />
                                        </div>
                                        <div className="flex gap-6">
                                            <div className="flex items-center space-x-2"><Checkbox checked={formData.t_r2_remedy_evict} onCheckedChange={c => handleInput("t_r2_remedy_evict", c)} /><Label>Evict Subtenant</Label></div>
                                            <div className="flex items-center space-x-2"><Checkbox checked={formData.t_r2_remedy_comp} onCheckedChange={c => handleInput("t_r2_remedy_comp", c)} /><Label>Order Compensation</Label></div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </div>
                    </div>

                    {/* Section 3 — Landlord Reasons */}
                    <div>
                        <SectionHeader num={3} title={<>Landlord Reasons <span className="text-slate-400 normal-case font-normal">(complete only if you are the Landlord)</span></>} />
                        <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-orange-800 text-sm">
                                Use this section <strong>only</strong> if you are the Landlord filing this application.
                            </div>

                            {/* L Reason 1 */}
                            <Card className="border-l-4 border-l-orange-500">
                                <CardHeader>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox checked={formData.l_reason1_unauthorized} onCheckedChange={(c) => handleInput("l_reason1_unauthorized", c)} className="mt-0.5" />
                                        <div>
                                            <CardTitle className="text-base">Reason 1: Unauthorized Occupant</CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">The tenant transferred the tenancy without the landlord's consent.</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                {formData.l_reason1_unauthorized && (
                                    <CardContent className="space-y-4 border-t pt-4">
                                        <div className="space-y-1">
                                            <Label>Date you became aware</Label>
                                            <Input type="date" value={formData.l_r1_aware_date} onChange={e => handleInput("l_r1_aware_date", e.target.value)} className="w-1/3" />
                                        </div>
                                        <div className="flex gap-6">
                                            <div className="flex items-center space-x-2"><Checkbox checked={formData.l_r1_remedy_evict} onCheckedChange={c => handleInput("l_r1_remedy_evict", c)} /><Label>Evict Occupant</Label></div>
                                            <div className="flex items-center space-x-2"><Checkbox checked={formData.l_r1_remedy_comp} onCheckedChange={c => handleInput("l_r1_remedy_comp", c)} /><Label>Order Compensation</Label></div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* L Reason 2 */}
                            <Card className="border-l-4 border-l-orange-500">
                                <CardHeader>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox checked={formData.l_reason2_subtenant_stayed} onCheckedChange={(c) => handleInput("l_reason2_subtenant_stayed", c)} className="mt-0.5" />
                                        <div>
                                            <CardTitle className="text-base">Reason 2: Subtenant Overstayed</CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">The subtenant did not move out after the subtenancy ended.</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                {formData.l_reason2_subtenant_stayed && (
                                    <CardContent className="space-y-4 border-t pt-4">
                                        <div className="space-y-1">
                                            <Label>Subtenant Move-out Date</Label>
                                            <Input type="date" value={formData.l_r2_move_out_date} onChange={e => handleInput("l_r2_move_out_date", e.target.value)} className="w-1/3" />
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* L Reason 3 */}
                            <Card className="border-l-4 border-l-orange-500">
                                <CardHeader>
                                    <div className="flex items-start space-x-3">
                                        <Checkbox checked={formData.l_reason3_refusal_reasonable} onCheckedChange={(c) => handleInput("l_reason3_refusal_reasonable", c)} className="mt-0.5" />
                                        <div>
                                            <CardTitle className="text-base">Reason 3: Reasonable Refusal (Mobile Home)</CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">The landlord's refusal to consent to the assignment was reasonable.</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                {formData.l_reason3_refusal_reasonable && (
                                    <CardContent className="space-y-4 border-t pt-4">
                                        <div className="space-y-1">
                                            <Label>Explanation of why the refusal was reasonable</Label>
                                            <Textarea value={formData.l_r3_explanation} onChange={e => handleInput("l_r3_explanation", e.target.value)} className="mt-1" />
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </div>
                    </div>

                    {/* Section 4 — Signature */}
                    <div>
                        <SectionHeader num={4} title="Signature" />
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader className="py-3 border-b bg-slate-100">
                                    <CardTitle className="text-base">Signer Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    <div className="space-y-1">
                                        <Label>Signed By</Label>
                                        <Select value={formData.signerType} onValueChange={v => handleInput("signerType", v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tenant">Tenant</SelectItem>
                                                <SelectItem value="landlord">Landlord</SelectItem>
                                                <SelectItem value="representative">Representative</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>First Name</Label><Input value={formData.sigFirst} onChange={e => handleInput("sigFirst", e.target.value)} /></div>
                                        <div className="space-y-1"><Label>Last Name</Label><Input value={formData.sigLast} onChange={e => handleInput("sigLast", e.target.value)} /></div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Date Signed</Label>
                                        <Input type="date" value={formData.sigDate} onChange={e => handleInput("sigDate", e.target.value)} className="w-1/2" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="py-3 border-b bg-slate-100">
                                    <CardTitle className="text-base">Related File Numbers</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    <div className="space-y-1">
                                        <Label>File Number 1</Label>
                                        <Input value={formData.fileNumber1} onChange={e => handleInput("fileNumber1", e.target.value)} placeholder="Optional" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>File Number 2</Label>
                                        <Input value={formData.fileNumber2} onChange={e => handleInput("fileNumber2", e.target.value)} placeholder="Optional" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Section 5 — Representative */}
                    <div>
                        <SectionHeader num={5} title={<>Representative Information <span className="text-slate-400 normal-case font-normal">(Optional)</span></>} />
                        <Card>
                            <CardContent className="py-4 grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Representative Name</Label>
                                    <Input value={formData.repLsuc} onChange={e => handleInput("repLsuc", e.target.value)} className="mt-1" placeholder="Full name" />
                                </div>
                                <div className="space-y-1">
                                    <Label>LSUC #</Label>
                                    <Input value={formData.repLsuc} onChange={e => handleInput("repLsuc", e.target.value)} className="mt-1" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Company</Label>
                                    <Input value={formData.repCompany} onChange={e => handleInput("repCompany", e.target.value)} className="mt-1" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Email</Label>
                                    <Input value={formData.repEmail} onChange={e => handleInput("repEmail", e.target.value)} className="mt-1" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Mailing Address</Label>
                                    <Input value={formData.repAddress} onChange={e => handleInput("repAddress", e.target.value)} className="mt-1" />
                                </div>
                                <div className="space-y-1">
                                    <Label>City</Label>
                                    <Input value={formData.repCity} onChange={e => handleInput("repCity", e.target.value)} className="mt-1" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Postal Code</Label>
                                    <Input value={formData.repPostal} onChange={e => handleInput("repPostal", e.target.value)} className="mt-1" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Fax</Label>
                                    <Input value={formData.repFax} onChange={e => handleInput("repFax", e.target.value)} className="mt-1" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>

                    {/* Bottom action bar */}
                    <div className="flex items-center justify-center gap-3 px-8 py-5 border-t border-slate-200 bg-white print:hidden">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-slate-600 hover:text-slate-900">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                        <Button variant="outline" onClick={handleDownload} className="gap-2">
                            <Download className="h-4 w-4" /> Download PDF
                        </Button>
                        <Button variant="outline" onClick={() => window.print()} className="gap-2">
                            <Printer className="h-4 w-4" /> Print
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="gap-2 bg-roomie-purple hover:bg-roomie-purple/90">
                            <Save className="h-4 w-4" /> {isLoading ? "Saving..." : "Save Draft"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
