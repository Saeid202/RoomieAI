import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Printer, Plus, Trash2, Calculator, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore
import html2pdf from "html2pdf.js";

interface RentRow {
    periodFrom: string;
    periodTo: string;
    rentCharged: string;
    rentPaid: string;
    rentOwing: string;
}

export default function N4FormPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = () => {
        const element = document.getElementById('n4-form-content');
        const opt = {
            margin: 10,
            filename: 'N4-Notice-to-End-Tenancy.pdf',
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

        amountOwing: "",
        terminationDate: "",

        // Rent Table
        rentDetails: [
            { periodFrom: "", periodTo: "", rentCharged: "", rentPaid: "", rentOwing: "" },
            { periodFrom: "", periodTo: "", rentCharged: "", rentPaid: "", rentOwing: "" },
            { periodFrom: "", periodTo: "", rentCharged: "", rentPaid: "", rentOwing: "" }
        ] as RentRow[],
        totalRentOwing: "",

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

    // Helper functions for math
    const formatMoney = (val: number) => (Math.round(val * 100) / 100).toFixed(2);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent as keyof typeof prev] as any, [field]: value }
        }));
    };

    // Rent Table Logic
    const updateRentRow = (index: number, field: keyof RentRow, value: string) => {
        const newRows = [...formData.rentDetails];
        newRows[index][field] = value;

        // Auto-calculate owing if charged/paid change
        if (field === 'rentCharged' || field === 'rentPaid') {
            const charged = parseFloat(newRows[index].rentCharged) || 0;
            const paid = parseFloat(newRows[index].rentPaid) || 0;
            // Only update owing if it's positive or user hasn't manually set it to something weird? 
            // The HTML logic was simple: charged - paid.
            newRows[index].rentOwing = formatMoney(charged - paid);
        }

        setFormData(prev => ({ ...prev, rentDetails: newRows }));
    };

    const addRentRow = () => {
        setFormData(prev => ({
            ...prev,
            rentDetails: [...prev.rentDetails, { periodFrom: "", periodTo: "", rentCharged: "", rentPaid: "", rentOwing: "" }]
        }));
    };

    const removeRentRow = (index: number) => {
        const newRows = formData.rentDetails.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, rentDetails: newRows }));
    };

    const calculateTotals = () => {
        const total = formData.rentDetails.reduce((sum, row) => {
            return sum + (parseFloat(row.rentOwing) || 0);
        }, 0);

        const formattedTotal = formatMoney(total);
        setFormData(prev => ({
            ...prev,
            totalRentOwing: formattedTotal,
            amountOwing: formattedTotal // Sync top box
        }));

        return formattedTotal;
    };

    // Effect to auto-recalc total when rows change? 
    // Maybe better to do it explicit or onBlur to avoid jumping values, but reactive is nicer.
    // Let's stick to explicit button or useEffect. The HTML had a button. Let's use useEffect for smooth UX.
    useEffect(() => {
        const total = formData.rentDetails.reduce((sum, row) => {
            return sum + (parseFloat(row.rentOwing) || 0);
        }, 0);
        const formattedTotal = formatMoney(total);
        if (formattedTotal !== formData.totalRentOwing || formattedTotal !== formData.amountOwing) {
            setFormData(prev => ({
                ...prev,
                totalRentOwing: formattedTotal,
                amountOwing: formattedTotal
            }));
        }
    }, [JSON.stringify(formData.rentDetails)]);


    const handleSave = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast({ variant: "destructive", title: "Error", description: "You must be logged in to save." });
                return;
            }

            const { error } = await supabase.from('n4_forms' as any).insert({
                user_id: user.id,
                tenant_names: formData.tenantNames,
                landlord_name: formData.landlordName,
                unit_address: formData.unitAddress,
                unit_city: formData.unitCity,
                unit_province: formData.unitProvince,
                unit_postal_code: formData.unitPostal,

                amount_owing: parseFloat(formData.amountOwing) || 0,
                termination_date: formData.terminationDate || null,

                rent_details: formData.rentDetails,
                total_rent_owing: parseFloat(formData.totalRentOwing) || 0,

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

            <div id="n4-form-content" className="bg-white shadow-lg border rounded-xl overflow-hidden print:shadow-none print:border-none">
                {/* Header */}
                <div className="bg-slate-50 border-b p-6 flex justify-between items-start print:bg-white print:border-none print:p-0 print:mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 border-none outline-none">Notice to End your Tenancy for Non-payment of Rent</h1>
                        <p className="text-slate-500 text-sm mt-1">Form N4 (Residential Tenancies Act, 2006)</p>
                    </div>
                    <div className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-bold print:border print:bg-transparent">LTB - N4</div>
                </div>

                <div className="p-8 space-y-8 print:p-0">

                    {/* Warning Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-full min-w-[2rem] min-h-[2rem] flex items-center justify-center text-amber-900 font-bold">!</div>
                        <div>
                            <h3 className="font-semibold text-amber-900">Important Legal Notice</h3>
                            <p className="text-sm text-amber-800">This notice starts the process to evict a tenant for non-payment. Timeline rules (14 days for monthly) must be strictly followed.</p>
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

                    {/* Amount and Timeline */}
                    <Card className="border-l-4 border-l-roomie-purple">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Payment & Termination</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="w-full md:w-1/2">
                                    <Label className="text-base">I believe you owe me ($)</Label>
                                    <div className="relative mt-1.5">
                                        <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                        <Input
                                            type="number"
                                            value={formData.amountOwing}
                                            readOnly
                                            className="pl-8 bg-slate-50 font-bold text-lg"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Calculated automatically from the table below.</p>
                                </div>
                                <div className="w-full md:w-1/2">
                                    <Label className="text-base">Termination Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.terminationDate}
                                        onChange={(e) => handleInputChange("terminationDate", e.target.value)}
                                        className="mt-1.5"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Must be at least 14 days after notice (monthly/yearly) or 7 days (daily/weekly).</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700">
                                <p className="font-semibold mb-2">Options for the Tenant:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Pay the amount owing by the termination date to void this notice.</li>
                                    <li>Move out by the termination date (tenancy ends).</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rent Calculation Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-lg">Rent Owing Calculation</CardTitle>
                            <Button variant="outline" size="sm" onClick={calculateTotals} className="gap-2">
                                <Calculator className="h-3.5 w-3.5" /> Recalculate Total
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b">
                                            <th className="p-3 text-left font-medium min-w-[120px]">Period From</th>
                                            <th className="p-3 text-left font-medium min-w-[120px]">Period To</th>
                                            <th className="p-3 text-left font-medium min-w-[100px]">Rent Charged ($)</th>
                                            <th className="p-3 text-left font-medium min-w-[100px]">Rent Paid ($)</th>
                                            <th className="p-3 text-left font-medium min-w-[100px]">Rent Owing ($)</th>
                                            <th className="p-3 w-[50px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {formData.rentDetails.map((row, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50/50">
                                                <td className="p-2">
                                                    <Input
                                                        placeholder="dd/mm/yyyy"
                                                        value={row.periodFrom}
                                                        onChange={(e) => updateRentRow(idx, 'periodFrom', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        placeholder="dd/mm/yyyy"
                                                        value={row.periodTo}
                                                        onChange={(e) => updateRentRow(idx, 'periodTo', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={row.rentCharged}
                                                        onChange={(e) => updateRentRow(idx, 'rentCharged', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={row.rentPaid}
                                                        onChange={(e) => updateRentRow(idx, 'rentPaid', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={row.rentOwing}
                                                        onChange={(e) => updateRentRow(idx, 'rentOwing', e.target.value)}
                                                        className="font-semibold bg-red-50 text-red-700"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Button variant="ghost" size="icon" onClick={() => removeRentRow(idx)} className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 font-semibold border-t">
                                        <tr>
                                            <td colSpan={4} className="p-3 text-right">Total Rent Owing:</td>
                                            <td className="p-3 text-lg text-roomie-purple">${formData.totalRentOwing || '0.00'}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <Button variant="outline" size="sm" onClick={addRentRow} className="mt-4 gap-2">
                                <Plus className="h-4 w-4" /> Add Row
                            </Button>
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
                            <div>
                                <Label>Phone</Label>
                                <Input value={formData.repPhone} onChange={(e) => handleInputChange("repPhone", e.target.value)} className="mt-1" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
