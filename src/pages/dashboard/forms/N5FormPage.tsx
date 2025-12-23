import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Save, FileText, Printer, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore
import html2pdf from "html2pdf.js";

interface Incident {
    date: string;
    details: string;
}

export default function N5FormPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = () => {
        const element = document.getElementById('n5-form-content');
        const opt = {
            margin: 10,
            filename: 'N5-Notice-to-End-Tenancy.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        } as any;
        html2pdf().set(opt).from(element).save();
    };

    // Form Stats
    const [formData, setFormData] = useState({
        tenantNames: "",
        landlordName: "",
        unitAddress: "",
        unitCity: "",
        unitProvince: "Ontario",
        unitPostal: "",
        terminationDate: "",

        // Reason 1
        reason1Selected: false,
        reason1NoticeType: "first", // first | second

        // Reason 2
        reason2Selected: false,
        reason2NoticeType: "first",
        r2Values: {
            repair: false,
            replace: false,
            payRepair: false,
            payReplace: false,
            arrangements: false,
            repairAmount: "",
            replaceAmount: ""
        },

        // Reason 3
        reason3Selected: false,
        reason3NoticeType: "first",
        r3ReduceTo: "",

        // Events
        events: [{ date: "", details: "" }, { date: "", details: "" }] as Incident[],

        // Signature
        sigFirstName: "",
        sigLastName: "",
        sigPhone: "",
        sigDate: "",
        sigLandlordRep: "",

        // Representative
        repName: "",
        repLsuc: "",
        repCompany: "",
        repPhone: "",
        repAddress: "",
        repCity: "",
        repProvince: "ON",
        repPostal: "",
        repFax: "",

        // Office Use
        officeFileNumber: "",
        deliveryMethods: {
            inPerson: false,
            mail: false,
            courier: false,
            email: false,
            efile: false,
            fax: false,
            fl: false
        }
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent as keyof typeof prev] as any, [field]: value }
        }));
    };

    const updateEvent = (index: number, field: keyof Incident, value: string) => {
        const newEvents = [...formData.events];
        newEvents[index][field] = value;
        setFormData(prev => ({ ...prev, events: newEvents }));
    };

    const addEventRow = () => {
        setFormData(prev => ({ ...prev, events: [...prev.events, { date: "", details: "" }] }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast({ variant: "destructive", title: "Error", description: "You must be logged in to save." });
                return;
            }

            const { error } = await supabase.from('n5_forms' as any).insert({
                user_id: user.id,
                tenant_names: formData.tenantNames,
                landlord_name: formData.landlordName,
                unit_address: formData.unitAddress,
                unit_city: formData.unitCity,
                unit_province: formData.unitProvince,
                unit_postal_code: formData.unitPostal,
                termination_date: formData.terminationDate || null,

                reason1_selected: formData.reason1Selected,
                reason1_notice_type: formData.reason1NoticeType,

                reason2_selected: formData.reason2Selected,
                reason2_notice_type: formData.reason2NoticeType,
                reason2_details: formData.r2Values,

                reason3_selected: formData.reason3Selected,
                reason3_notice_type: formData.reason3NoticeType,
                reason3_details: { reduce_to: formData.r3ReduceTo },

                events_details: formData.events,

                signature_first_name: formData.sigFirstName,
                signature_last_name: formData.sigLastName,
                signature_phone: formData.sigPhone,
                signature_date: formData.sigDate || null,

                representative_info: {
                    name: formData.repName,
                    lsuc: formData.repLsuc,
                    company: formData.repCompany,
                    phone: formData.repPhone,
                    address: formData.repAddress,
                    city: formData.repCity,
                    province: formData.repProvince,
                    postal: formData.repPostal,
                    fax: formData.repFax
                },

                delivery_method: formData.deliveryMethods,
                status: 'draft'
            });

            if (error) throw error;

            toast({ title: "Saved", description: "Form saved successfully to drafts." });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save form." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex gap-2">
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

            <div id="n5-form-content" className="bg-white shadow-lg border rounded-xl overflow-hidden print:shadow-none print:border-none">
                {/* Header */}
                <div className="bg-slate-50 border-b p-6 flex justify-between items-start print:bg-white print:border-none print:p-0 print:mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 border-none outline-none">Notice to End your Tenancy</h1>
                        <p className="text-slate-500 text-sm mt-1">For Interfering with Others, Damage or Overcrowding</p>
                        <p className="text-xs text-slate-400 mt-1">Form N5 (Residential Tenancies Act, 2006)</p>
                    </div>
                    <div className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-bold print:border print:bg-transparent">LTB - N5</div>
                </div>

                <div className="p-8 space-y-8 print:p-0">

                    {/* Warning Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-full min-w-[2rem] min-h-[2rem] flex items-center justify-center text-amber-900 font-bold">!</div>
                        <div>
                            <h3 className="font-semibold text-amber-900">Important Legal Notice</h3>
                            <p className="text-sm text-amber-800">This is a legal notice that could lead to the tenant being evicted from their home. Ensure all information is accurate.</p>
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="py-3 bg-slate-50 border-b">
                                <CardTitle className="text-sm font-medium uppercase text-slate-500">To (Tenant)</CardTitle>
                            </CardHeader>
                            <CardContent className="py-4">
                                <Label htmlFor="tenantNames">Tenant's Name(s)</Label>
                                <Input
                                    id="tenantNames"
                                    placeholder="e.g. John Doe, Jane Doe"
                                    value={formData.tenantNames}
                                    onChange={(e) => handleInputChange("tenantNames", e.target.value)}
                                    className="mt-1.5"
                                />
                                <p className="text-xs text-slate-400 mt-1">Include full names of all tenants sitting on the lease.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-3 bg-slate-50 border-b">
                                <CardTitle className="text-sm font-medium uppercase text-slate-500">From (Landlord)</CardTitle>
                            </CardHeader>
                            <CardContent className="py-4">
                                <Label htmlFor="landlordName">Landlord's Name</Label>
                                <Input
                                    id="landlordName"
                                    placeholder="e.g. ABC Properties Inc."
                                    value={formData.landlordName}
                                    onChange={(e) => handleInputChange("landlordName", e.target.value)}
                                    className="mt-1.5"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rental Unit */}
                    <Card>
                        <CardHeader className="py-3 bg-slate-50 border-b">
                            <CardTitle className="text-base font-semibold">Address of Rental Unit</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4 grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label>Street Address / Unit #</Label>
                                <Input value={formData.unitAddress} onChange={(e) => handleInputChange("unitAddress", e.target.value)} />
                            </div>
                            <div>
                                <Label>City/Town</Label>
                                <Input value={formData.unitCity} onChange={(e) => handleInputChange("unitCity", e.target.value)} />
                            </div>
                            <div>
                                <Label>Province</Label>
                                <Input value="Ontario" readOnly className="bg-slate-50" />
                            </div>
                            <div>
                                <Label>Postal Code</Label>
                                <Input value={formData.unitPostal} onChange={(e) => handleInputChange("unitPostal", e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Termination Date */}
                    <Card className="border-l-4 border-l-roomie-purple">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Termination Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                                <div className="w-full md:w-1/3">
                                    <Label>Date you want tenancy to end (dd/mm/yyyy)</Label>
                                    <Input type="date" value={formData.terminationDate} onChange={(e) => handleInputChange("terminationDate", e.target.value)} className="mt-1.5" />
                                </div>
                                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-md flex-1">
                                    <strong>Note:</strong>
                                    <ul className="list-disc pl-4 mt-1 space-y-1">
                                        <li>For a <strong>First N5</strong>: Date must be at least <strong>20 days</strong> after giving notice.</li>
                                        <li>For a <strong>Second N5</strong>: Date must be at least <strong>14 days</strong> after giving notice.</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reasons Section */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Reasons for Ending Tenancy</h2>

                        {/* Reason 1 */}
                        <Card className={`mb-4 transition-all ${formData.reason1Selected ? 'ring-2 ring-slate-900 border-transparent' : ''}`}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="reason1"
                                        checked={formData.reason1Selected}
                                        onCheckedChange={(c) => handleInputChange("reason1Selected", c === true)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 space-y-3">
                                        <Label htmlFor="reason1" className="text-base font-semibold cursor-pointer">
                                            Reason 1: Substantial Interference
                                        </Label>
                                        <p className="text-sm text-slate-600">The tenant (or their guest) has substantially interfered with another tenant's or the landlord's reasonable enjoyment or lawful rights.</p>

                                        {formData.reason1Selected && (
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2">
                                                <Label className="mb-2 block">Which Notice is this?</Label>
                                                <RadioGroup value={formData.reason1NoticeType} onValueChange={(v) => handleInputChange("reason1NoticeType", v)}>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="first" id="r1-first" />
                                                        <Label htmlFor="r1-first">First N5 (Allow 7 days for correction)</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="second" id="r1-second" />
                                                        <Label htmlFor="r1-second">Second N5 (No correction period)</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reason 2 */}
                        <Card className={`mb-4 transition-all ${formData.reason2Selected ? 'ring-2 ring-slate-900 border-transparent' : ''}`}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="reason2"
                                        checked={formData.reason2Selected}
                                        onCheckedChange={(c) => handleInputChange("reason2Selected", c === true)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 space-y-3">
                                        <Label htmlFor="reason2" className="text-base font-semibold cursor-pointer">
                                            Reason 2: Damage
                                        </Label>
                                        <p className="text-sm text-slate-600">Wilful or negligent damage to the rental unit or complex.</p>

                                        {formData.reason2Selected && (
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2 space-y-4">
                                                <div>
                                                    <Label className="mb-2 block">Notice Type</Label>
                                                    <RadioGroup value={formData.reason2NoticeType} onValueChange={(v) => handleInputChange("reason2NoticeType", v)}>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="first" id="r2-first" />
                                                            <Label htmlFor="r2-first">First N5</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="second" id="r2-second" />
                                                            <Label htmlFor="r2-second">Second N5</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Remedies (Select acceptable corrections)</Label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox checked={formData.r2Values.repair} onCheckedChange={(c) => handleNestedChange("r2Values", "repair", c)} id="fix-repair" />
                                                            <Label htmlFor="fix-repair">Repair damage</Label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox checked={formData.r2Values.replace} onCheckedChange={(c) => handleNestedChange("r2Values", "replace", c)} id="fix-replace" />
                                                            <Label htmlFor="fix-replace">Replace item</Label>
                                                        </div>

                                                        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 mt-2">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Checkbox checked={formData.r2Values.payRepair} onCheckedChange={(c) => handleNestedChange("r2Values", "payRepair", c)} id="pay-repair" />
                                                                    <Label htmlFor="pay-repair">Pay for Repair ($)</Label>
                                                                </div>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    disabled={!formData.r2Values.payRepair}
                                                                    value={formData.r2Values.repairAmount}
                                                                    onChange={(e) => handleNestedChange("r2Values", "repairAmount", e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Checkbox checked={formData.r2Values.payReplace} onCheckedChange={(c) => handleNestedChange("r2Values", "payReplace", c)} id="pay-replace" />
                                                                    <Label htmlFor="pay-replace">Pay for Replacement ($)</Label>
                                                                </div>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    disabled={!formData.r2Values.payReplace}
                                                                    value={formData.r2Values.replaceAmount}
                                                                    onChange={(e) => handleNestedChange("r2Values", "replaceAmount", e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Details/Events */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details of Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-4">List the specific dates, times, and details of the incidents leading to this notice.</p>
                            <div className="space-y-4">
                                {formData.events.map((evt, idx) => (
                                    <div key={idx} className="grid md:grid-cols-[180px_1fr] gap-4 items-start">
                                        <div className="space-y-1">
                                            <Label>Date/Time</Label>
                                            <Input
                                                placeholder="dd/mm/yyyy hh:mm"
                                                value={evt.date}
                                                onChange={(e) => updateEvent(idx, "date", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Description</Label>
                                            <Textarea
                                                placeholder="Describe what happened, who was involved..."
                                                value={evt.details}
                                                onChange={(e) => updateEvent(idx, "details", e.target.value)}
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addEventRow} className="mt-2">
                                    + Add Another Incident
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Signature */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="py-3 border-b bg-slate-50">
                                <CardTitle className="text-base">Signature</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>First Name</Label>
                                        <Input value={formData.sigFirstName} onChange={(e) => handleInputChange("sigFirstName", e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Last Name</Label>
                                        <Input value={formData.sigLastName} onChange={(e) => handleInputChange("sigLastName", e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Phone</Label>
                                    <Input value={formData.sigPhone} onChange={(e) => handleInputChange("sigPhone", e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Date Signed</Label>
                                    <Input type="date" value={formData.sigDate} onChange={(e) => handleInputChange("sigDate", e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-3 border-b bg-slate-50">
                                <CardTitle className="text-base">Office Use Only / Delivery</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-1">
                                    <Label>File Number</Label>
                                    <Input value={formData.officeFileNumber} onChange={(e) => handleInputChange("officeFileNumber", e.target.value)} placeholder="Optional" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Method of Service</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {['inPerson', 'mail', 'courier', 'email', 'fax'].map((m) => (
                                            <div key={m} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`del-${m}`}
                                                    checked={(formData.deliveryMethods as any)[m]}
                                                    onCheckedChange={(c) => handleNestedChange("deliveryMethods", m, c)}
                                                />
                                                <Label htmlFor={`del-${m}`} className="capitalize">{m.replace(/([A-Z])/g, ' $1')}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}

// NOTE: Please ensure the 'n5_forms' table exists in Supabase before saving.
