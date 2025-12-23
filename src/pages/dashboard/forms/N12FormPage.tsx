import { useState } from "react";
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

export default function N12FormPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = () => {
        const element = document.getElementById('n12-form-content');
        const opt = {
            margin: 10,
            filename: 'N12-Notice-to-End-Tenancy.pdf',
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

        // Reason 1 (Landlord/Family)
        r1_me: false,
        r1_spouse: false,
        r1_child: false,
        r1_parent: false,
        r1_spouse_child: false,
        r1_spouse_parent: false,
        r1_caregiver: false,

        // Reason 2 (Purchaser)
        r2_purchaser: false,
        r2_spouse: false,
        r2_child: false,
        r2_parent: false,
        r2_spouse_child: false,
        r2_spouse_parent: false,
        r2_caregiver: false,

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

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast({ variant: "destructive", title: "Error", description: "You must be logged in to save." });
                return;
            }

            // Consolidate checkbox data for storage
            const occupantDetails = {
                reason1: {
                    me: formData.r1_me, spouse: formData.r1_spouse, child: formData.r1_child,
                    parent: formData.r1_parent, spouse_child: formData.r1_spouse_child,
                    spouse_parent: formData.r1_spouse_parent, caregiver: formData.r1_caregiver
                },
                reason2: {
                    purchaser: formData.r2_purchaser, spouse: formData.r2_spouse, child: formData.r2_child,
                    parent: formData.r2_parent, spouse_child: formData.r2_spouse_child,
                    spouse_parent: formData.r2_spouse_parent, caregiver: formData.r2_caregiver
                }
            };

            // Determine primary reason type
            let reasonType = null;
            if (Object.values(occupantDetails.reason1).some(v => v)) reasonType = 'landlord';
            else if (Object.values(occupantDetails.reason2).some(v => v)) reasonType = 'purchaser';

            const { error } = await supabase.from('n12_forms' as any).insert({
                user_id: user.id,
                tenant_names: formData.tenantNames,
                landlord_name: formData.landlordName,
                rental_address: formData.rentalAddress,
                termination_date: formData.terminationDate || null,

                reason_type: reasonType,
                occupant_details: occupantDetails,

                signature_first_name: formData.sigFirstName,
                signature_last_name: formData.sigLastName,
                signature_phone: formData.sigPhone,
                signature_date: formData.sigDate || null,

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

            <div id="n12-form-content" className="bg-white shadow-lg border rounded-xl overflow-hidden print:shadow-none print:border-none">
                {/* Header */}
                <div className="bg-slate-50 border-b p-6 flex justify-between items-start print:bg-white print:border-none print:p-0 print:mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 border-none outline-none">Notice to End your Tenancy</h1>
                        <p className="text-slate-500 text-sm mt-1">Because the Landlord, a Purchaser or a Family Member Requires the Rental Unit</p>
                        <p className="text-slate-400 text-xs">Form N12 (Residential Tenancies Act, 2006)</p>
                    </div>
                    <div className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-bold print:border print:bg-transparent">LTB - N12</div>
                </div>

                <div className="p-8 space-y-8 print:p-0">

                    {/* Warning Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-full min-w-[2rem] min-h-[2rem] flex items-center justify-center text-amber-900 font-bold">!</div>
                        <div>
                            <h3 className="font-semibold text-amber-900">Important Legal Notice</h3>
                            <p className="text-sm text-amber-800">
                                This is a legal notice that could lead to the tenant being evicted.
                                <strong> Note:</strong> You must usually pay the tenant 1 month's rent as compensation by the termination date.
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
                                    <p className="mt-1">Must be at least <strong>60 days</strong> after the notice is given and be the <strong>last day of a rental period</strong>.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reason 1: Landlord's Own Use */}
                    <Card>
                        <CardHeader className="py-3 border-b bg-slate-50">
                            <CardTitle className="text-base font-bold">Reason 1: Landlord's Own Use</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm text-slate-600 mb-4">
                                A person listed below intends to move in and occupy the rental unit for at least one year.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                                {[
                                    ['r1_me', 'Me'],
                                    ['r1_spouse', 'My spouse'],
                                    ['r1_child', 'My child'],
                                    ['r1_parent', 'My parent'],
                                    ['r1_spouse_child', "My spouse's child"],
                                    ['r1_spouse_parent', "My spouse's parent"],
                                    ['r1_caregiver', 'A person who will provide care services to one of the above']
                                ].map(([key, label]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox id={key} checked={(formData as any)[key]} onCheckedChange={(c) => handleInputChange(key, c === true)} />
                                        <Label htmlFor={key} className="font-normal cursor-pointer">{label}</Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reason 2: Purchaser's Use */}
                    <Card>
                        <CardHeader className="py-3 border-b bg-slate-50">
                            <CardTitle className="text-base font-bold">Reason 2: Purchaser's Own Use</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm text-slate-600 mb-4">
                                I have signed an Agreement of Purchase and Sale and the following person intends to move in for at least one year.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                                {[
                                    ['r2_purchaser', 'The purchaser'],
                                    ['r2_spouse', "The purchaser's spouse"],
                                    ['r2_child', "The purchaser's child"],
                                    ['r2_parent', "The purchaser's parent"],
                                    ['r2_spouse_child', "The purchaser's spouse's child"],
                                    ['r2_spouse_parent', "The purchaser's spouse's parent"],
                                    ['r2_caregiver', 'A person who will provide care services to one of the above']
                                ].map(([key, label]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox id={key} checked={(formData as any)[key]} onCheckedChange={(c) => handleInputChange(key, c === true)} />
                                        <Label htmlFor={key} className="font-normal cursor-pointer">{label}</Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info/Compensate */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Important Information</h4>
                        <ul className="list-disc pl-5 text-sm text-blue-900 space-y-1">
                            <li>The landlord must pay the tenant an amount equal to one month's rent as compensation OR offer the tenant another rental unit that is acceptable to them.</li>
                            <li>This compensation must be paid on or before the termination date.</li>
                        </ul>
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
                            <div className="md:col-span-2">
                                <Label>Mailing Address</Label>
                                <Input value={formData.repAddress} onChange={(e) => handleInputChange("repAddress", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label>City</Label>
                                <Input value={formData.repCity} onChange={(e) => handleInputChange("repCity", e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label>Postal</Label>
                                <Input value={formData.repPostal} onChange={(e) => handleInputChange("repPostal", e.target.value)} className="mt-1" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
