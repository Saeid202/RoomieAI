import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Printer, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore
import html2pdf from "html2pdf.js";

export default function T5FormPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [id, setId] = useState<string | null>(null);

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
                .from('t5_forms' as any)
                .select('*')
                .eq('id', draftId)
                .single() as any);

            if (error) throw error;
            if (data && data.form_data) {
                setFormData(data.form_data);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error loading draft", description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    const [formData, setFormData] = useState<any>({
        rental_street_number: "", rental_street_name: "", rental_street_type: "", rental_direction: "", rental_unit: "", rental_municipality: "", rental_prov: "Ontario", rental_postal: "",
        landlord_first: "", landlord_last: "", landlord_company: "", landlord_street_address: "", landlord_unit: "", landlord_municipality: "", landlord_prov: "Ontario", landlord_postal: "", landlord_day_phone: "", landlord_evening_phone: "", landlord_fax: "", landlord_email: "",
        tenant1_first: "", tenant1_last: "", tenant2_first: "", tenant2_last: "", tenant_current_address: "", tenant_current_unit: "", tenant_current_municipality: "", tenant_current_prov: "", tenant_current_postal: "", tenant_day_phone: "", tenant_evening_phone: "", tenant_fax: "", tenant_email: "",
        related_file_1: "", related_file_2: "",
        move_out_date_ddmmyyyy: "",
        reason_1: false, reason_2: false, reason_3: false, reason_4: false,
        describe_in_detail: "",
        remedy_1: false, remedy1_rent_abatement_amount: "", remedy1_my_rent_was: "", remedy1_by_month: false, remedy1_by_week: false, remedy1_by_other: false, remedy1_by_other_specify: "", remedy1_how_calculated: "",
        remedy_2: false,
        remedy_3: false, remedy3_difference_amount: "", remedy3_each_month: false, remedy3_each_week: false, remedy3_each_other: false, remedy3_each_other_specify: "", remedy3_total_owed: "",
        remedy_4: false, remedy4_expenses_total: "", remedy4_how_calculated: "",
        remedy_5: false, remedy5_general_comp_amount: "", remedy5_how_calculated: "",
        remedy_6: false, remedy6_other_remedies: "",
        signature_text: "", signature_date_ddmmyyyy: "", who_signed: "",
        rep_first: "", rep_last: "", rep_lsuc: "", rep_company: "", rep_mailing_address: "", rep_unit: "", rep_municipality: "", rep_prov: "Ontario", rep_postal: "", rep_day_phone: "", rep_evening_phone: "", rep_fax: "", rep_email: "",
        request_french_services: false, request_accommodation: false, accommodation_explain: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev: any) => ({ ...prev, [name]: checked }));
        } else if (type === 'radio') {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleDownload = () => {
        const element = document.getElementById('t5-form-document');
        const opt = {
            margin: 0,
            filename: 'T5-Bad-Faith-Eviction-Application.pdf',
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };
        html2pdf().set(opt).from(element).save();
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({ variant: "destructive", title: "Authentication required", description: "Please log in to save your application." });
                setIsLoading(false);
                return;
            }

            const upsertData = {
                id: id || undefined,
                user_id: user.id,
                form_data: formData,
                rental_address: `${formData.rental_street_number} ${formData.rental_street_name}, ${formData.rental_municipality}`,
                tenant_name: `${formData.tenant1_first} ${formData.tenant1_last}`,
                status: 'draft',
                updated_at: new Date().toISOString()
            };

            const { data, error } = await (supabase
                .from('t5_forms' as any)
                .upsert(upsertData)
                .select()
                .single() as any);

            if (error) throw error;

            if (data) {
                setId(data.id);
                // Update URL without refreshing
                const newUrl = `${window.location.pathname}?id=${data.id}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
                toast({ title: "Draft Saved", description: "Your T5 application has been saved to your drafts." });
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error saving draft", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
            {/* Controls */}
            <div className="max-w-[1200px] mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4 no-print">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 font-bold text-slate-600 self-start">
                    <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <div className="flex flex-wrap gap-3 justify-center">
                    <Button variant="outline" onClick={handleDownload} className="gap-2 font-bold border-2 bg-white hover:bg-slate-50 hover:text-blue-600 transition-all">
                        <Download className="h-5 w-5" /> Export PDF
                    </Button>
                    <Button variant="outline" onClick={() => window.print()} className="gap-2 font-bold border-2 bg-white hover:bg-slate-50 hover:text-blue-600 transition-all">
                        <Printer className="h-5 w-5" /> Print
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-md transition-all">
                        <Save className="h-5 w-5" /> {isLoading ? "Saving..." : "Save Draft"}
                    </Button>
                </div>
            </div>

            <style>{`
                #t5-form-document {
                    --ink: #1e293b;
                    --muted: #64748b;
                    --line: #cbd5e1;
                    --accent: #2563eb;
                    --bg: #fff;
                    background: transparent;
                    color: var(--ink);
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    font-size: 14px;
                    line-height: 1.5;
                    margin: 0 auto;
                    max-width: 1200px;
                }
                .page {
                    background: var(--bg);
                    padding: 60px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    margin-bottom: 40px;
                    position: relative;
                    border: 1px solid var(--line);
                }
                @media print {
                    .page {
                        box-shadow: none;
                        border: none;
                        padding: 0;
                        margin-bottom: 0;
                        page-break-after: always;
                    }
                    body { background: white; }
                    .no-print { display: none; }
                }
                .hdr {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    border-bottom: 2px solid var(--ink);
                    padding-bottom: 20px; margin-bottom: 30px;
                }
                .hdr-title { font-weight: 800; font-size: 24px; color: var(--ink); letter-spacing: -0.02em; }
                .hdr-subtitle { font-weight: 600; font-size: 18px; color: var(--muted); }
                
                .section-header {
                    background: #f1f5f9;
                    padding: 12px 20px;
                    margin: 40px 0 20px 0;
                    border-left: 4px solid var(--accent);
                    font-weight: 800;
                    font-size: 16px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .info-box {
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    border-radius: 8px;
                    padding: 24px;
                    margin-bottom: 30px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .col-12 { grid-column: span 12; }
                .col-6 { grid-column: span 6; }
                .col-4 { grid-column: span 4; }
                .col-3 { grid-column: span 3; }
                .col-8 { grid-column: span 8; }

                .input-group { display: flex; flex-direction: column; gap: 6px; }
                .input-label { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; }
                
                input[type="text"], input[type="email"], input[type="tel"], textarea {
                    border: 1px solid var(--line);
                    border-radius: 6px;
                    padding: 10px 14px;
                    font-size: 14px;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                input:focus, textarea:focus {
                    outline: none;
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }
                
                .checkbox-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 16px;
                    border: 1px solid var(--line);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .checkbox-card:hover { border-color: var(--accent); background: #f8fafc; }
                .checkbox-card.active { border-color: var(--accent); background: #eff6ff; }
                .checkbox-card input { margin-top: 4px; width: 18px; height: 18px; }

                .signature-box {
                    border: 2px dashed var(--line);
                    padding: 30px;
                    border-radius: 8px;
                    margin-top: 20px;
                }
            `}</style>

            <div id="t5-form-document">
                {/* IMPORTANT INFO PAGE */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Landlord Gave a Notice of Termination in Bad Faith</div>
                            <div className="hdr-subtitle">FORM T5 • Important Information</div>
                        </div>
                    </div>

                    <div className="info-box">
                        <h3 className="text-xl font-bold text-blue-900 mb-4 underline">Application Summary</h3>
                        <p className="font-semibold text-slate-700 mb-6">Use this form to apply to the Landlord and Tenant Board (LTB) if you are a former tenant who moved out because the landlord gave you an N12 or N13 notice in bad faith.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-white/50 rounded-lg">
                                <h4 className="font-bold text-blue-800 mb-2">Relevant Notices</h4>
                                <ul className="list-disc ml-5 space-y-1 text-slate-600">
                                    <li><strong>N12:</strong> Notice for Landlord, Purchaser or Family Member to move in.</li>
                                    <li><strong>N13:</strong> Notice for Demolition, Repair or Conversion.</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-white/50 rounded-lg">
                                <h4 className="font-bold text-blue-800 mb-2">Deadlines & Fees</h4>
                                <ul className="list-disc ml-5 space-y-1 text-slate-600">
                                    <li><strong>Reasons 1-3:</strong> 1 year from move-out.</li>
                                    <li><strong>Reason 4:</strong> 2 years from move-out.</li>
                                    <li><strong>Filing Fee:</strong> $53.00 for the first unit.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 text-slate-600 italic">
                        <p>1. Ensure all four parts of this application are completed accurately.</p>
                        <p>2. If you require French-language services or accessibility accommodation, complete the supplemental form at the end.</p>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest no-print">
                        <span>RoomieAI Legal Document Assistant</span>
                        <span>Official Form T5 (2025 Standard)</span>
                    </div>
                </div>

                {/* PAGE 1: PART 1 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Landlord Gave a Notice of Termination in Bad Faith</div>
                            <div className="hdr-subtitle">FORM T5 • Part 1: General Information</div>
                        </div>
                        <div className="right text-slate-400 font-bold">Page 1 of 6</div>
                    </div>

                    <div className="section-header">1. Address of the Rental Unit</div>
                    <div className="form-grid">
                        <div className="input-group col-3">
                            <label className="input-label">Street Number</label>
                            <input type="text" name="rental_street_number" value={formData.rental_street_number} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Street Name</label>
                            <input type="text" name="rental_street_name" value={formData.rental_street_name} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Street Type</label>
                            <input type="text" name="rental_street_type" value={formData.rental_street_type} onChange={handleInputChange} placeholder="St, Ave, Blvd" />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Direction</label>
                            <input type="text" name="rental_direction" value={formData.rental_direction} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Unit/Apt./Suite</label>
                            <input type="text" name="rental_unit" value={formData.rental_unit} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Municipality (City/Town)</label>
                            <input type="text" name="rental_municipality" value={formData.rental_municipality} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Province</label>
                            <input type="text" name="rental_prov" value={formData.rental_prov} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Postal Code</label>
                            <input type="text" name="rental_postal" value={formData.rental_postal} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="section-header">2. Landlord's Information</div>
                    <div className="form-grid">
                        <div className="input-group col-6">
                            <label className="input-label">First Name</label>
                            <input type="text" name="landlord_first" value={formData.landlord_first} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Last Name</label>
                            <input type="text" name="landlord_last" value={formData.landlord_last} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-12">
                            <label className="input-label">Company Name (If applicable)</label>
                            <input type="text" name="landlord_company" value={formData.landlord_company} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-12">
                            <label className="input-label">Mailing Address</label>
                            <input type="text" name="landlord_street_address" value={formData.landlord_street_address} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Unit</label>
                            <input type="text" name="landlord_unit" value={formData.landlord_unit} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-5">
                            <label className="input-label">Municipality</label>
                            <input type="text" name="landlord_municipality" value={formData.landlord_municipality} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-2">
                            <label className="input-label">Prov.</label>
                            <input type="text" name="landlord_prov" value={formData.landlord_prov} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-2">
                            <label className="input-label">Postal</label>
                            <input type="text" name="landlord_postal" value={formData.landlord_postal} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="section-header">3. Former Tenant's Current Information</div>
                    <div className="form-grid">
                        <div className="input-group col-6">
                            <label className="input-label">First Name</label>
                            <input type="text" name="tenant1_first" value={formData.tenant1_first} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Last Name</label>
                            <input type="text" name="tenant1_last" value={formData.tenant1_last} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-12">
                            <label className="input-label">Current Mailing Address</label>
                            <input type="text" name="tenant_current_address" value={formData.tenant_current_address} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Unit</label>
                            <input type="text" name="tenant_current_unit" value={formData.tenant_current_unit} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-5">
                            <label className="input-label">Municipality</label>
                            <input type="text" name="tenant_current_municipality" value={formData.tenant_current_municipality} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-2">
                            <label className="input-label">Province</label>
                            <input type="text" name="tenant_current_prov" value={formData.tenant_current_prov} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-2">
                            <label className="input-label">Postal Code</label>
                            <input type="text" name="tenant_current_postal" value={formData.tenant_current_postal} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

                {/* PAGE 2 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Landlord Gave a Notice of Termination in Bad Faith</div>
                            <div className="hdr-subtitle">FORM T5 • Part 2: Reasons & Tenancy Info</div>
                        </div>
                        <div className="right text-slate-400 font-bold">Page 2 of 6</div>
                    </div>

                    <div className="section-header">4. Related Applications</div>
                    <div className="form-grid">
                        <div className="input-group col-6">
                            <label className="input-label">File Number (Application 1)</label>
                            <input type="text" name="related_file_1" value={formData.related_file_1} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">File Number (Application 2)</label>
                            <input type="text" name="related_file_2" value={formData.related_file_2} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="section-header">5. Tenancy Details</div>
                    <div className="form-grid">
                        <div className="input-group col-4">
                            <label className="input-label font-bold text-slate-900">Move-Out Date (dd/mm/yyyy)</label>
                            <input type="text" name="move_out_date_ddmmyyyy" value={formData.move_out_date_ddmmyyyy} onChange={handleInputChange} placeholder="31/12/2024" />
                        </div>
                    </div>

                    <div className="section-header">Part 2: Reasons for Application</div>
                    <div className="space-y-4">
                        <p className="font-bold text-slate-700 italic border-b pb-2 mb-4">Shade the boxes that apply to your situation:</p>
                        {[
                            { id: 'reason_1', label: 'Reason 1: Landlord gave Form N12 claiming Landlord or family member intended to move in.' },
                            { id: 'reason_2', label: 'Reason 2: Landlord gave Form N12 claiming a Purchaser or their family member intended to move in.' },
                            { id: 'reason_3', label: 'Reason 3: Landlord gave Form N13 for Demolition, Repair or Conversion.' },
                            { id: 'reason_4', label: 'Reason 4: Landlord gave Form N13 for repairs, I gave written notice to move back in, but was denied my right of first refusal.' }
                        ].map(reason => (
                            <label key={reason.id} className={`checkbox-card ${formData[reason.id as keyof typeof formData] ? 'active' : ''}`}>
                                <input type="checkbox" name={reason.id} checked={formData[reason.id as keyof typeof formData]} onChange={handleInputChange} />
                                <div>
                                    <span className="font-bold block mb-1">{reason.label.split(':')[0]}</span>
                                    <span className="text-slate-600">{reason.label.split(':')[1]}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* PAGE 3 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Landlord Gave a Notice of Termination in Bad Faith</div>
                            <div className="hdr-subtitle">FORM T5 • Explanation & Remedies</div>
                        </div>
                        <div className="right text-slate-400 font-bold">Page 3 of 6</div>
                    </div>

                    <div className="section-header">Detailed Explanation</div>
                    <div className="input-group">
                        <label className="input-label">Explain in detail why you believe the notice was was given in bad faith:</label>
                        <textarea
                            name="describe_in_detail"
                            value={formData.describe_in_detail}
                            onChange={handleInputChange}
                            className="min-h-[300px]"
                            placeholder="Example: The unit was listed for a higher rent 1 month after I moved out, or I saw a new tenant moving in who is not a family member of the landlord."
                        ></textarea>
                    </div>

                    <div className="section-header">Part 3: Remedies</div>
                    <p className="mb-6 font-bold text-slate-700">Shade the boxes for the remedies you wish the Board to order:</p>

                    <div className="space-y-6">
                        <div className={`checkbox-card p-6 ${formData.remedy_1 ? 'active' : ''}`}>
                            <input type="checkbox" name="remedy_1" checked={formData.remedy_1} onChange={handleInputChange} className="mt-2" />
                            <div className="flex-1">
                                <span className="text-lg font-bold text-slate-900 block mb-2">Remedy 1: Rent Abatement</span>
                                <p className="text-sm text-slate-500 mb-6">The landlord should pay me a rent abatement. Indicate the amount you are requesting below:</p>

                                <div className="form-grid">
                                    <div className="input-group col-4">
                                        <label className="input-label">Requested Amount ($)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                                            <input type="text" name="remedy1_rent_abatement_amount" value={formData.remedy1_rent_abatement_amount} onChange={handleInputChange} className="pl-8" placeholder="0.00" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAGE 4 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Landlord Gave a Notice of Termination in Bad Faith</div>
                            <div className="hdr-subtitle">FORM T5 • Remedies (Continued)</div>
                        </div>
                        <div className="right text-slate-400 font-bold">Page 4 of 6</div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-slate-50 border rounded-xl">
                            <div className="input-group">
                                <label className="input-label text-blue-800">For Remedy 1, explain how you calculated the rent abatement:</label>
                                <textarea name="remedy1_how_calculated" value={formData.remedy1_how_calculated} onChange={handleInputChange} className="bg-white" placeholder="Example: 50% of monthly rent for the last 6 months..."></textarea>
                            </div>
                        </div>

                        <div className={`checkbox-card p-6 ${formData.remedy_2 ? 'active' : ''}`}>
                            <input type="checkbox" name="remedy_2" checked={formData.remedy_2} onChange={handleInputChange} />
                            <div>
                                <span className="text-lg font-bold text-slate-900 block mb-1">Remedy 2: Administrative Fine</span>
                                <p className="text-sm text-slate-500">The landlord should be ordered to pay an administrative fine to the Board.</p>
                            </div>
                        </div>

                        <div className={`checkbox-card p-6 block ${formData.remedy_3 ? 'active' : ''}`}>
                            <div className="flex gap-4 mb-4">
                                <input type="checkbox" name="remedy_3" checked={formData.remedy_3} onChange={handleInputChange} />
                                <span className="text-lg font-bold text-slate-900">Remedy 3: Rent Difference & Moving Costs</span>
                            </div>
                            <div className="form-grid ml-10">
                                <div className="input-group col-6">
                                    <label className="input-label">Higher rent for 1 year ($)</label>
                                    <input type="text" name="remedy3_difference_amount" value={formData.remedy3_difference_amount} onChange={handleInputChange} placeholder="0.00" />
                                </div>
                                <div className="input-group col-6">
                                    <label className="input-label">Total amount owed ($)</label>
                                    <input type="text" name="remedy3_total_owed" value={formData.remedy3_total_owed} onChange={handleInputChange} placeholder="0.00" />
                                </div>
                            </div>
                        </div>

                        <div className={`checkbox-card p-6 block ${formData.remedy_4 ? 'active' : ''}`}>
                            <div className="flex gap-4 mb-4">
                                <input type="checkbox" name="remedy_4" checked={formData.remedy_4} onChange={handleInputChange} />
                                <span className="text-lg font-bold text-slate-900">Remedy 4: Out-of-Pocket Expenses</span>
                            </div>
                            <div className="ml-10 space-y-4">
                                <div className="form-grid">
                                    <div className="input-group col-4">
                                        <label className="input-label">Total expenses ($)</label>
                                        <input type="text" name="remedy4_expenses_total" value={formData.remedy4_expenses_total} onChange={handleInputChange} placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Describe your expenses below:</label>
                                    <textarea name="remedy4_how_calculated" value={formData.remedy4_how_calculated} onChange={handleInputChange} className="bg-white min-h-[100px]" placeholder="Itemize costs (e.g. moving truck, storage fees, packing supplies)..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAGE 5 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Landlord Gave a Notice of Termination in Bad Faith</div>
                            <div className="hdr-subtitle">FORM T5 • Remedies (Continued)</div>
                        </div>
                        <div className="right text-slate-400 font-bold">Page 5 of 6</div>
                    </div>

                    <div className="space-y-6">
                        <div className={`checkbox-card p-6 block ${formData.remedy_5 ? 'active' : ''}`}>
                            <div className="flex gap-4 mb-4">
                                <input type="checkbox" name="remedy_5" checked={formData.remedy_5} onChange={handleInputChange} />
                                <span className="text-lg font-bold text-slate-900">Remedy 5: General Compensation</span>
                            </div>
                            <div className="ml-10 space-y-4">
                                <div className="form-grid">
                                    <div className="input-group col-5">
                                        <label className="input-label">Compensation Amount ($)</label>
                                        <input type="text" name="remedy5_general_comp_amount" value={formData.remedy5_general_comp_amount} onChange={handleInputChange} placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Explain how you calculated this amount:</label>
                                    <textarea name="remedy5_how_calculated" value={formData.remedy5_how_calculated} onChange={handleInputChange} className="bg-white min-h-[150px]"></textarea>
                                </div>
                            </div>
                        </div>

                        <div className={`checkbox-card p-6 block ${formData.remedy_6 ? 'active' : ''}`}>
                            <div className="flex gap-4 mb-4">
                                <input type="checkbox" name="remedy_6" checked={formData.remedy_6} onChange={handleInputChange} />
                                <span className="text-lg font-bold text-slate-900">Remedy 6: Other Remedies</span>
                            </div>
                            <div className="ml-10">
                                <div className="input-group">
                                    <label className="input-label">Describe any other remedies you are requesting from the LTB:</label>
                                    <textarea name="remedy6_other_remedies" value={formData.remedy6_other_remedies} onChange={handleInputChange} className="bg-white min-h-[200px]"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAGE 6 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Landlord Gave a Notice of Termination in Bad Faith</div>
                            <div className="hdr-subtitle">FORM T5 • Part 4: Signature</div>
                        </div>
                        <div className="right text-slate-400 font-bold">Page 1 of 6</div>
                    </div>

                    <div className="section-header">Signatory Information</div>
                    <div className="signature-box bg-slate-50/50">
                        <div className="form-grid">
                            <div className="input-group col-8">
                                <label className="input-label">Digital Signature (Type Full Name)</label>
                                <input type="text" name="signature_text" value={formData.signature_text} onChange={handleInputChange} className="h-16 text-2xl font-serif italic" placeholder="Your Name" />
                            </div>
                            <div className="input-group col-4">
                                <label className="input-label">Date (dd/mm/yyyy)</label>
                                <input type="text" name="signature_date_ddmmyyyy" value={formData.signature_date_ddmmyyyy} onChange={handleInputChange} className="h-16 text-xl text-center" />
                            </div>
                        </div>

                        <div className="mt-8">
                            <label className="input-label mb-4 block">Who is signing this application?</label>
                            <div className="flex flex-wrap gap-6">
                                {['Tenant 1', 'Tenant 2', 'Legal Representative'].map(choice => (
                                    <label key={choice} className="flex items-center gap-2 cursor-pointer group">
                                        <input type="radio" name="who_signed" value={choice} checked={formData.who_signed === choice} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" />
                                        <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{choice}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="section-header">Legal Representative (If applicable)</div>
                    <div className="form-grid">
                        <div className="input-group col-6">
                            <label className="input-label">First Name</label>
                            <input type="text" name="rep_first" value={formData.rep_first} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Last Name</label>
                            <input type="text" name="rep_last" value={formData.rep_last} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">LSUC / Law Society #</label>
                            <input type="text" name="rep_lsuc" value={formData.rep_lsuc} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Firm Name</label>
                            <input type="text" name="rep_company" value={formData.rep_company} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-12">
                            <label className="input-label">Contact Email</label>
                            <input type="email" name="rep_email" value={formData.rep_email} onChange={handleInputChange} placeholder="representative@lawfirm.com" />
                        </div>
                    </div>
                </div>

                {/* EXTRA PAGES - Accessibility */}
                <div className="page bg-slate-900 border-none no-print">
                    <div className="max-w-[800px] mx-auto bg-white p-12 rounded-2xl shadow-2xl">
                        <div className="text-center mb-10 border-b-2 border-amber-100 pb-8">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Hearing & Accessibility</h2>
                            <p className="text-amber-600 font-bold uppercase text-sm tracking-widest">Supplemental Information</p>
                        </div>

                        <div className="space-y-8">
                            <label className="checkbox-card p-6 block hover:bg-slate-50 border-2">
                                <div className="flex gap-4">
                                    <input type="checkbox" name="request_french_services" checked={formData.request_french_services} onChange={handleInputChange} className="w-6 h-6" />
                                    <div>
                                        <span className="text-xl font-bold text-slate-900 block mb-1">French Language Services</span>
                                        <p className="text-slate-500">Check this box if you want the Board to conduct the proceeding in French.</p>
                                    </div>
                                </div>
                            </label>

                            <label className="checkbox-card p-6 block hover:bg-slate-50 border-2">
                                <div className="flex gap-4">
                                    <input type="checkbox" name="request_accommodation" checked={formData.request_accommodation} onChange={handleInputChange} className="w-6 h-6" />
                                    <div>
                                        <span className="text-xl font-bold text-slate-900 block mb-1">Accessibility Accommodation</span>
                                        <p className="text-slate-500">Check this box if you require accommodation under the Human Rights Code.</p>
                                    </div>
                                </div>
                            </label>

                            <div className="input-group mt-6">
                                <label className="input-label font-bold text-slate-400">If you requested accommodation, please explain below:</label>
                                <textarea name="accommodation_explain" value={formData.accommodation_explain} onChange={handleInputChange} className="min-h-[150px] border-2" placeholder="Describe your requirements..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
