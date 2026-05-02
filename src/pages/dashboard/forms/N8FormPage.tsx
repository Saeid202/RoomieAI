import { useState } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Printer, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore
import html2pdf from "html2pdf.js";

interface Incident {
    date: string;
    details: string;
}

const SectionHeader = ({ num, title }: { num: number; title: React.ReactNode }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-white text-xs font-bold flex-shrink-0">
            {num}
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">{title}</h2>
    </div>
);

export default function N8FormPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = () => {
        const element = document.getElementById('n8-form-content');
        const opt = {
            margin: 10,
            filename: 'N8-Notice-to-End-Tenancy.pdf',
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

        // Reasons
        reason1Selected: false,
        reason2Selected: false,
        reason3Selected: false,
        reason4Selected: false,
        reason5Selected: false,

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

            const { error } = await supabase.from('n8_forms' as any).insert({
                user_id: user.id,
                tenant_names: formData.tenantNames,
                landlord_name: formData.landlordName,
                unit_address: formData.unitAddress,
                unit_city: formData.unitCity,
                unit_province: formData.unitProvince,
                unit_postal_code: formData.unitPostal,
                termination_date: formData.terminationDate || null,

                reason1_selected: formData.reason1Selected,
                reason2_selected: formData.reason2Selected,
                reason3_selected: formData.reason3Selected,
                reason4_selected: formData.reason4Selected,
                reason5_selected: formData.reason5Selected,

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
        <div className="min-h-screen w-full -mx-6 -mt-6">
            {/* Page background */}
            <div className="bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200 px-6 py-8 print:bg-white print:p-0">
            <div id="n8-form-content" className="w-full bg-slate-50 shadow-[0_2px_24px_0_rgba(0,0,0,0.07)] border border-slate-200/60 rounded-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
                {/* Form header */}
                <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-8 py-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 border-none outline-none">Notice to End your Tenancy at the End of the Term</h1>
                        <p className="text-slate-500 text-sm mt-1">Form N8 (Residential Tenancies Act, 2006)</p>
                    </div>
                    <div className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-bold print:border print:bg-transparent">LTB - N8</div>
                </div>

                <div className="px-8 py-8 space-y-10 print:p-0">

                    {/* Warning Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-full min-w-[2rem] min-h-[2rem] flex items-center justify-center text-amber-900 font-bold">!</div>
                        <div>
                            <h3 className="font-semibold text-amber-900">Important Legal Notice</h3>
                            <p className="text-sm text-amber-800">This is a legal notice that could lead to the tenant being evicted from their home. Ensure all information is accurate.</p>
                        </div>
                    </div>

                    {/* Section 1 — Parties */}
                    <div>
                        <SectionHeader num={1} title="Parties Involved" />
                        <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="py-3 bg-slate-100 border-b">
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
                            <CardHeader className="py-3 bg-slate-100 border-b">
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
                    </div>

                    {/* Section 2 — Address */}
                    <div>
                        <SectionHeader num={2} title="Address of Rental Unit" />
                    <Card>
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
                                <Input value="Ontario" readOnly className="bg-slate-100" />
                            </div>
                            <div>
                                <Label>Postal Code</Label>
                                <Input value={formData.unitPostal} onChange={(e) => handleInputChange("unitPostal", e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                    </div>

                    {/* Section 3 — Termination Date */}
                    <div>
                        <SectionHeader num={3} title="Termination Date" />
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
                                    <p className="mt-1">For most tenancies, the termination date must be at least <strong>60 days</strong> after the notice is given and must be the <strong>last day of the rental period</strong>.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    </div>

                    {/* Section 4 — Reasons for Ending Tenancy */}
                    <div>
                        <SectionHeader num={4} title="Reasons for Ending Tenancy" />
                        <p className="text-sm text-slate-500 mb-4">Select the reason(s) for ending the tenancy.</p>

                        {/* Reason 1 */}
                        <Card className={`mb-3 transition-all ${formData.reason1Selected ? 'ring-2 ring-slate-900 border-transparent' : ''}`}>
                            <CardContent className="py-4 flex items-start gap-3">
                                <Checkbox
                                    id="reason1"
                                    checked={formData.reason1Selected}
                                    onCheckedChange={(c) => handleInputChange("reason1Selected", c === true)}
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="reason1" className="text-base font-semibold cursor-pointer">
                                        Reason 1: Persistent Late Payment
                                    </Label>
                                    <p className="text-sm text-slate-600">You have persistently paid your rent late.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reason 2 */}
                        <Card className={`mb-3 transition-all ${formData.reason2Selected ? 'ring-2 ring-slate-900 border-transparent' : ''}`}>
                            <CardContent className="py-4 flex items-start gap-3">
                                <Checkbox
                                    id="reason2"
                                    checked={formData.reason2Selected}
                                    onCheckedChange={(c) => handleInputChange("reason2Selected", c === true)}
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="reason2" className="text-base font-semibold cursor-pointer">
                                        Reason 2: Subsidized Housing Disqualification
                                    </Label>
                                    <p className="text-sm text-slate-600">You no longer qualify to live in public or subsidized housing.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reason 3 */}
                        <Card className={`mb-3 transition-all ${formData.reason3Selected ? 'ring-2 ring-slate-900 border-transparent' : ''}`}>
                            <CardContent className="py-4 flex items-start gap-3">
                                <Checkbox
                                    id="reason3"
                                    checked={formData.reason3Selected}
                                    onCheckedChange={(c) => handleInputChange("reason3Selected", c === true)}
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="reason3" className="text-base font-semibold cursor-pointer">
                                        Reason 3: Employee Housing Ended
                                    </Label>
                                    <p className="text-sm text-slate-600">I made the unit available to you as a condition of your employment and your employment has ended.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reason 4 */}
                        <Card className={`mb-3 transition-all ${formData.reason4Selected ? 'ring-2 ring-slate-900 border-transparent' : ''}`}>
                            <CardContent className="py-4 flex items-start gap-3">
                                <Checkbox
                                    id="reason4"
                                    checked={formData.reason4Selected}
                                    onCheckedChange={(c) => handleInputChange("reason4Selected", c === true)}
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="reason4" className="text-base font-semibold cursor-pointer">
                                        Reason 4: Condo Purchase Agreement Terminated
                                    </Label>
                                    <p className="text-sm text-slate-600">Your tenancy was created as a result of an Agreement of Purchase for a proposed condo unit, and that agreement has been terminated.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reason 5 */}
                        <Card className={`mb-3 transition-all ${formData.reason5Selected ? 'ring-2 ring-slate-900 border-transparent' : ''}`}>
                            <CardContent className="py-4 flex items-start gap-3">
                                <Checkbox
                                    id="reason5"
                                    checked={formData.reason5Selected}
                                    onCheckedChange={(c) => handleInputChange("reason5Selected", c === true)}
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="reason5" className="text-base font-semibold cursor-pointer">
                                        Reason 5: Rehab/Therapeutic Services Ended
                                    </Label>
                                    <p className="text-sm text-slate-600">You are occupying the unit to receive rehabilitative or therapeutic services and the period has ended.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Section 5 — Details of Events */}
                    <div>
                        <SectionHeader num={5} title="Details of Events" />
                    <Card>
                        <CardHeader className="bg-slate-100 border-b">
                            <CardTitle>Details of Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-4">List the specific dates, times, and details of the incidents supporting your reason(s).</p>
                            <div className="space-y-4">
                                {formData.events.map((evt, idx) => (
                                    <div key={idx} className="grid md:grid-cols-[180px_1fr] gap-4 items-start">
                                        <div className="space-y-1">
                                            <Label>Date</Label>
                                            <Input
                                                placeholder="dd/mm/yyyy"
                                                value={evt.date}
                                                onChange={(e) => updateEvent(idx, "date", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Details</Label>
                                            <Textarea
                                                placeholder="Describe what happened..."
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
                    </div>

                    {/* Section 6 — Signature & Delivery */}
                    <div>
                        <SectionHeader num={6} title="Signature &amp; Delivery" />
                        <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="py-3 border-b bg-slate-100">
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
                            <CardHeader className="py-3 border-b bg-slate-100">
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
        </div>
    );
}
