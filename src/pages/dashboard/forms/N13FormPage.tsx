import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Printer, Plus, Trash2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore
import html2pdf from "html2pdf.js";

interface WorkDetail {
    planned: string;
    details: string;
}

export default function N13FormPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = () => {
        const element = document.getElementById('n13-form-content');
        const opt = {
            margin: 10,
            filename: 'N13-Notice-to-End-Tenancy.pdf',
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
        rentalAddress: "",
        terminationDate: "",

        // Reasons
        reason: "", // 'demolish', 'repair', 'convert'

        // Work Details
        workDetails: [{ planned: "", details: "" }] as WorkDetail[],

        // Permits
        permitStatus: "", // 'obtained', 'will_obtain', 'not_required'

        // Signature
        sigFirstName: "",
        sigLastName: "",
        sigPhone: "",
        sigDate: "",
        sigTyped: "",

        // Representative
        repName: "",
        repLsuc: "",
        repCompany: "",
        repAddress: "",
        repCity: "",
        repProvince: "Ontario",
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

    const updateWorkRow = (index: number, field: keyof WorkDetail, value: string) => {
        const newRows = [...formData.workDetails];
        newRows[index][field] = value;
        setFormData(prev => ({ ...prev, workDetails: newRows }));
    };

    const addWorkRow = () => {
        setFormData(prev => ({ ...prev, workDetails: [...prev.workDetails, { planned: "", details: "" }] }));
    };

    const removeWorkRow = (index: number) => {
        if (formData.workDetails.length <= 1) return;
        const newRows = formData.workDetails.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, workDetails: newRows }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast({ variant: "destructive", title: "Error", description: "You must be logged in to save." });
                return;
            }

            const { error } = await supabase.from('n13_forms' as any).insert({
                user_id: user.id,
                tenant_names: formData.tenantNames,
                landlord_name: formData.landlordName,
                rental_address: formData.rentalAddress,
                termination_date: formData.terminationDate || null,

                reason: formData.reason,
                work_details: formData.workDetails,
                permit_status: formData.permitStatus,

                signature_first_name: formData.sigFirstName,
                signature_last_name: formData.sigLastName,
                signature_phone: formData.sigPhone,
                signature_date: formData.sigDate || null,
                signature_typed: formData.sigTyped,

                representative_info: {
                    name: formData.repName,
                    lsuc: formData.repLsuc,
                    company: formData.repCompany,
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

            <div id="n13-form-content" className="bg-white shadow-lg border rounded-xl overflow-hidden print:shadow-none print:border-none">
                {/* Header */}
                <div className="bg-slate-50 border-b p-6 flex justify-between items-start print:bg-white print:border-none print:p-0 print:mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 border-none outline-none">Notice to End your Tenancy</h1>
                        <p className="text-slate-500 text-sm mt-1">Because the Landlord Wants to Demolish the Rental Unit, Repair it or Convert it to Another Use</p>
                        <p className="text-slate-400 text-xs">Form N13 (Residential Tenancies Act, 2006)</p>
                    </div>
                    <div className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-bold print:border print:bg-transparent">LTB - N13</div>
                </div>

                <div className="p-8 space-y-8 print:p-0">

                    {/* Warning Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-full min-w-[2rem] min-h-[2rem] flex items-center justify-center text-amber-900 font-bold">!</div>
                        <div>
                            <h3 className="font-semibold text-amber-900">Important Legal Notice</h3>
                            <p className="text-sm text-amber-800">
                                This is a legal notice that could lead to eviction. Extensive notice periods (120 days) and compensation rules apply.
                            </p>
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
                        <CardContent className="py-4">
                            <Label>Full Address</Label>
                            <Textarea
                                placeholder="Street, Unit, City, Postal Code"
                                value={formData.rentalAddress}
                                onChange={(e) => handleInputChange("rentalAddress", e.target.value)}
                                className="mt-1.5"
                            />
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
                                    <Label>I want you to move out by:</Label>
                                    <Input type="date" value={formData.terminationDate} onChange={(e) => handleInputChange("terminationDate", e.target.value)} className="mt-1.5" />
                                </div>
                                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-md flex-1">
                                    <strong>Requirement:</strong>
                                    <p className="mt-1">Must be at least <strong>120 days</strong> after notice and be the <strong>last day of a rental period</strong>.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reasons */}
                    <Card>
                        <CardHeader className="py-3 border-b bg-slate-50">
                            <CardTitle className="text-base font-bold">Reason for Ending Tenancy</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <RadioGroup value={formData.reason} onValueChange={(val) => handleInputChange("reason", val)} className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem value="demolish" id="r1" className="mt-1" />
                                    <div>
                                        <Label htmlFor="r1" className="font-bold text-base cursor-pointer">Reason 1: Demolition</Label>
                                        <p className="text-sm text-slate-600">I intend to demolish the rental unit or the residential complex.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem value="repair" id="r2" className="mt-1" />
                                    <div>
                                        <Label htmlFor="r2" className="font-bold text-base cursor-pointer">Reason 2: Extensive Repairs/Renovations</Label>
                                        <p className="text-sm text-slate-600">I require the rental unit to be vacant to complete extensive repairs or renovations that require a building permit.</p>
                                        <div className="mt-1 bg-slate-50 p-2 text-xs text-slate-500 rounded border">
                                            <strong>Note:</strong> The tenant has the right to move back in after repairs if they notify you in writing.
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem value="convert" id="r3" className="mt-1" />
                                    <div>
                                        <Label htmlFor="r3" className="font-bold text-base cursor-pointer">Reason 3: Conversion</Label>
                                        <p className="text-sm text-slate-600">I intend to convert the rental unit or residential complex to a non-residential use.</p>
                                    </div>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Work Details */}
                    <Card>
                        <CardHeader className="py-3 border-b bg-slate-50">
                            <CardTitle className="text-base font-bold">Details About the Work</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {formData.workDetails.map((row, idx) => (
                                    <div key={idx} className="grid md:grid-cols-[1fr_2fr_auto] gap-4 items-start pb-4 border-b last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <Label>Work Planned</Label>
                                            <Input
                                                value={row.planned}
                                                onChange={(e) => updateWorkRow(idx, "planned", e.target.value)}
                                                placeholder="e.g. Electrical rewiring"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Details</Label>
                                            <Textarea
                                                value={row.details}
                                                onChange={(e) => updateWorkRow(idx, "details", e.target.value)}
                                                placeholder="Description of the work..."
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                        <div className="pt-7">
                                            <Button variant="ghost" size="icon" onClick={() => removeWorkRow(idx)} disabled={formData.workDetails.length === 1} className="text-slate-400 hover:text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addWorkRow} className="mt-2 text-roomie-purple border-roomie-purple hover:bg-roomie-purple/5">
                                    <Plus className="h-4 w-4 mr-2" /> Add More Work Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permits */}
                    <Card>
                        <CardHeader className="py-3 border-b bg-slate-50">
                            <CardTitle className="text-base font-bold">Necessary Permits</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <RadioGroup value={formData.permitStatus} onValueChange={(val) => handleInputChange("permitStatus", val)} className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="obtained" id="p1" />
                                    <Label htmlFor="p1" className="cursor-pointer font-normal">I have obtained the necessary building permits or authorization.</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="will_obtain" id="p2" />
                                    <Label htmlFor="p2" className="cursor-pointer font-normal">I will obtain the necessary building permits or authorization.</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="not_required" id="p3" />
                                    <Label htmlFor="p3" className="cursor-pointer font-normal">No permits or authorization are required.</Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Compensation Info */}
                    <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
                        <h4 className="font-bold mb-2">Compensation Requirements</h4>
                        <p className="mb-2">Depending on the reason and the size of the residential complex, you must either:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-2">
                            <li>Pay the tenant compensation (typically 1-3 months rent), OR</li>
                            <li>Offer another acceptable rental unit.</li>
                        </ul>
                        <p>This compensation must be paid on or before the termination date.</p>
                    </div>

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
                                <div className="space-y-1">
                                    <Label>Signature (Type Name)</Label>
                                    <Input value={formData.sigTyped} onChange={(e) => handleInputChange("sigTyped", e.target.value)} placeholder="Type full name" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-3 border-b bg-slate-50">
                                <CardTitle className="text-base">Office Use / Delivery</CardTitle>
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

                    {/* Representative Info - Optional */}
                    <div className="border rounded-md p-4 bg-slate-50">
                        <h3 className="text-sm font-semibold mb-3 text-slate-600 uppercase">Representative Information (Optional)</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Representative Name</Label>
                                <Input value={formData.repName} onChange={(e) => handleInputChange("repName", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label>LSUC #</Label>
                                <Input value={formData.repLsuc} onChange={(e) => handleInputChange("repLsuc", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label>Company Name</Label>
                                <Input value={formData.repCompany} onChange={(e) => handleInputChange("repCompany", e.target.value)} className="mt-1" />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Mailing Address</Label>
                                <Input value={formData.repAddress} onChange={(e) => handleInputChange("repAddress", e.target.value)} className="mt-1" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
