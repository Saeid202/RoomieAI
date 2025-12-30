import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Printer, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore
import html2pdf from "html2pdf.js";

export default function T2FormPage() {
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
                .from('t2_forms' as any)
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
        rental_street_number: "", rental_street_name: "", rental_street_type: "", rental_direction: "", rental_unit: "", rental_municipality: "", rental_province: "Ontario", rental_postal: "",
        tenant1_first: "", tenant1_last: "", tenant2_first: "", tenant2_last: "",
        mailing_unit: "", mailing_municipality: "", mailing_province: "", mailing_postal: "", day_phone: "", evening_phone: "", fax: "", email: "",
        office_file_number: "",
        landlord_first: "", landlord_last: "", landlord_company: "", landlord_street: "", landlord_unit: "", landlord_municipality: "", landlord_province: "Ontario", landlord_postal: "", landlord_day_phone: "", landlord_evening_phone: "", landlord_fax: "", landlord_email: "",
        other_parties: "",
        move_in_date_ddmmyyyy: "", still_live: "", move_out_date_ddmmyyyy: "",
        related_file_1: "", related_file_2: "",
        reason_1: false, reason_2: false, reason_3: false, reason_4: false, reason_5: false, reason_6: false, reason_7: false,
        reason_numbers: "", reasons_description: "",
        remedy_1: false, current_rent_amount: "", rent_by_month: false, rent_by_week: false, rent_by_other: false, rent_by_other_specify: "", rent_abatement_explain: "",
        remedy_2: false, remedy_2_explain: "",
        remedy_3: false,
        remedy_4: false, end_tenancy_date_ddmmyyyy: "",
        remedy_5: false, remedy_5_total_costs: "", remedy_5_explain: "",
        remedy_6: false, remedy_6_diff_amount: "", remedy_6_month: false, remedy_6_week: false, remedy_6_other: false, remedy_6_other_specify: "", remedy_6_total_owed: "",
        remedy_7: false, remedy_7_total: "", remedy_7_explain: "",
        remedy_8: false, remedy_8_total: "", remedy_8_explain: "",
        remedy_9: false, remedy_9_vacant_yes: false, remedy_9_vacant_no: false, remedy_9_vacant_idk: false,
        remedy_10: false,
        remedy_11: false, remedy_11_explain: "",
        signature_date_ddmmyyyy: "", who_signed: "",
        rep_first: "", rep_last: "", rep_lsuc: "", rep_company: "", rep_mailing_address: "", rep_unit: "", rep_municipality: "", rep_province: "Ontario", rep_postal: "", rep_day_phone: "", rep_evening_phone: "", rep_fax: "", rep_email: "",
        request_french_services: false, request_accommodation: false, accommodation_explain: "",
        pay_money_order: false, pay_certified_cheque: false, pay_credit_card: false
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
        const element = document.getElementById('t2-form-document');
        const opt = {
            margin: 0,
            filename: 'T2-Application-Tenant-Rights.pdf',
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
                .from('t2_forms' as any)
                .upsert(upsertData)
                .select()
                .single() as any);

            if (error) throw error;

            if (data) {
                setId(data.id);
                // Update URL without refreshing
                const newUrl = `${window.location.pathname}?id=${data.id}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
                toast({ title: "Draft Saved", description: "Your T2 application has been saved to your drafts." });
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error saving draft", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            {/* Controls */}
            <div className="max-w-[850px] mx-auto mb-6 flex items-center justify-between no-print">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 font-bold text-slate-600">
                    <ArrowLeft className="h-5 w-5" /> Back
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleDownload} className="gap-2 font-bold border-2 bg-white">
                        <Download className="h-5 w-5" /> Export PDF
                    </Button>
                    <Button variant="outline" onClick={() => window.print()} className="gap-2 font-bold border-2 bg-white">
                        <Printer className="h-5 w-5" /> Print
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black px-6 shadow-lg">
                        <Save className="h-5 w-5" /> {isLoading ? "Saving..." : "Save Draft"}
                    </Button>
                </div>
            </div>

            <style>{`
                #t2-form-document {
                    --ink: #0f172a;
                    --muted: #64748b;
                    --line: #e2e8f0;
                    --accent: #3b82f6;
                    --bg: #ffffff;
                    background: var(--bg);
                    color: var(--ink);
                    font-family: 'Inter', system-ui, sans-serif;
                    font-size: 14px;
                    line-height: 1.5;
                    margin: 0 auto;
                    max-width: 1200px;
                    padding: 60px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
                }
                .page {
                    page-break-after: always;
                    margin-bottom: 60px;
                    background: white;
                }
                .hdr {
                    display: flex; justify-content: space-between; align-items: flex-end;
                    border-bottom: 2px solid var(--ink);
                    padding-bottom: 20px; margin-bottom: 40px;
                }
                .hdr-title { font-weight: 900; font-size: 24px; text-transform: uppercase; letter-spacing: -0.02em; }
                .hdr-subtitle { font-weight: 600; font-size: 14px; color: var(--muted); }

                .section-header {
                    font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
                    background: #f8fafc;
                    padding: 12px 20px; margin: 40px 0 20px;
                    border-left: 4px solid var(--ink);
                    font-size: 13px; color: var(--ink);
                }

                .form-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; margin-bottom: 20px; }
                .col-1 { grid-column: span 1; } .col-2 { grid-column: span 2; } .col-3 { grid-column: span 3; }
                .col-4 { grid-column: span 4; } .col-5 { grid-column: span 5; } .col-6 { grid-column: span 6; }
                .col-7 { grid-column: span 7; } .col-8 { grid-column: span 8; } .col-9 { grid-column: span 9; }
                .col-10 { grid-column: span 10; } .col-11 { grid-column: span 11; } .col-12 { grid-column: span 12; }

                .input-group { display: flex; flex-direction: column; gap: 6px; }
                .input-label { font-weight: 600; font-size: 12px; color: var(--muted); text-transform: uppercase; }
                
                input[type="text"], input[type="email"], input[type="tel"], textarea {
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    padding: 10px 14px;
                    font-size: 14px;
                    transition: all 0.2s;
                    background: #fff;
                }
                input:focus, textarea:focus { 
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    outline: none;
                }

                .checkbox-card {
                    display: flex; gap: 16px; align-items: flex-start;
                    padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px;
                    transition: all 0.2s; cursor: pointer;
                }
                .checkbox-card:hover { border-color: #cbd5e1; background: #f8fafc; }
                .checkbox-card.active { border-color: var(--accent); background: #eff6ff; }
                .checkbox-card input { width: 20px; height: 20px; margin-top: 2px; }

                .info-box {
                    background: #f1f5f9; border-radius: 12px; padding: 24px;
                    border-left: 6px solid #64748b; margin: 20px 0;
                }

                .signature-box {
                    border: 2px dashed #cbd5e1; border-radius: 12px; padding: 40px;
                    text-align: center; margin: 40px 0;
                }

                @media print {
                    body { background: white; padding: 0; }
                    #t2-form-document { box-shadow: none; padding: 0; max-width: 100%; }
                    .no-print { display: none; }
                }
            `}</style>

            <div id="t2-form-document">
                {/* PAGE 1 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Tenant Rights</div>
                            <div className="hdr-subtitle">FORM T2 • Part 1: General Information</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 1 of 11</div>
                    </div>

                    <div className="info-box mb-8">
                        <h3 className="font-bold text-slate-900 mb-2 underline">General Information</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Read the instructions carefully before completing this form. This application is used to ask the Board to determine if the landlord, landlord's agent, or superintendent has violated your tenant rights.
                        </p>
                    </div>

                    <div className="section-header">1. Rental Unit Covered by This Application</div>
                    <div className="form-grid">
                        <div className="input-group col-3">
                            <label className="input-label">Street Number</label>
                            <input type="text" name="rental_street_number" value={formData.rental_street_number} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-9">
                            <label className="input-label">Street Name</label>
                            <input type="text" name="rental_street_name" value={formData.rental_street_name} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Street Type</label>
                            <input type="text" name="rental_street_type" value={formData.rental_street_type} onChange={handleInputChange} placeholder="e.g. St, Ave, Blvd" />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Direction</label>
                            <input type="text" name="rental_direction" value={formData.rental_direction} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Unit/Apt./Suite</label>
                            <input type="text" name="rental_unit" value={formData.rental_unit} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Municipality</label>
                            <input type="text" name="rental_municipality" value={formData.rental_municipality} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Province</label>
                            <input type="text" name="rental_province" value={formData.rental_province} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Postal Code</label>
                            <input type="text" name="rental_postal" value={formData.rental_postal} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="section-header">2. Tenant Information</div>
                    <div className="form-grid">
                        <div className="input-group col-6">
                            <label className="input-label">Tenant 1: First Name</label>
                            <input type="text" name="tenant1_first" value={formData.tenant1_first} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Tenant 1: Last Name</label>
                            <input type="text" name="tenant1_last" value={formData.tenant1_last} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Tenant 2: First Name</label>
                            <input type="text" name="tenant2_first" value={formData.tenant2_first} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Tenant 2: Last Name</label>
                            <input type="text" name="tenant2_last" value={formData.tenant2_last} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="label mt-8 text-slate-400 text-xs font-bold uppercase italic border-b pb-1 mb-4">Mailing Address (if different from above)</div>
                    <div className="form-grid">
                        <div className="input-group col-4">
                            <label className="input-label">Unit/Apt./Suite</label>
                            <input type="text" name="mailing_unit" value={formData.mailing_unit} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Municipality</label>
                            <input type="text" name="mailing_municipality" value={formData.mailing_municipality} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Province</label>
                            <input type="text" name="mailing_province" value={formData.mailing_province} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Postal Code</label>
                            <input type="text" name="mailing_postal" value={formData.mailing_postal} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Day Phone</label>
                            <input type="tel" name="day_phone" value={formData.day_phone} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Evening Phone</label>
                            <input type="tel" name="evening_phone" value={formData.evening_phone} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Fax Number</label>
                            <input type="tel" name="fax" value={formData.fax} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">E-mail Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="mt-12 p-8 bg-slate-900 rounded-xl text-white">
                        <div className="hdr-subtitle mb-4 text-slate-400">OFFICE USE ONLY</div>
                        <div className="form-grid">
                            <div className="input-group col-8">
                                <label className="input-label text-slate-500">File Number</label>
                                <input type="text" name="office_file_number" value={formData.office_file_number} onChange={handleInputChange} className="bg-white/10 border-white/20 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAGE 2 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Tenant Rights</div>
                            <div className="hdr-subtitle">FORM T2 • Landlord & Tenancy Details</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 2 of 11</div>
                    </div>

                    <div className="section-header">3. Landlord's Information</div>
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
                            <label className="input-label">Company Name (if applicable)</label>
                            <input type="text" name="landlord_company" value={formData.landlord_company} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-12">
                            <label className="input-label">Street Address</label>
                            <input type="text" name="landlord_street" value={formData.landlord_street} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Unit/Apt./Suite</label>
                            <input type="text" name="landlord_unit" value={formData.landlord_unit} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Municipality</label>
                            <input type="text" name="landlord_municipality" value={formData.landlord_municipality} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Province</label>
                            <input type="text" name="landlord_province" value={formData.landlord_province} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Postal Code</label>
                            <input type="text" name="landlord_postal" value={formData.landlord_postal} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Day Phone</label>
                            <input type="tel" name="landlord_day_phone" value={formData.landlord_day_phone} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Evening Phone</label>
                            <input type="tel" name="landlord_evening_phone" value={formData.landlord_evening_phone} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">E-mail Address</label>
                            <input type="email" name="landlord_email" value={formData.landlord_email} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="section-header">4. Other Parties</div>
                    <div className="info-box py-4">
                        <p className="text-sm font-bold text-slate-700 mb-4">Are you also applying against your superintendent or landlord's agent?</p>
                        <div className="flex gap-6">
                            {['No', 'Yes'].map(choice => (
                                <label key={choice} className={`checkbox-card flex-1 ${formData.other_parties === choice ? 'active' : ''}`}>
                                    <input type="radio" name="other_parties" value={choice} checked={formData.other_parties === choice} onChange={handleInputChange} />
                                    <span className="font-bold">{choice === 'Yes' ? 'Yes (Attach Schedule of Parties)' : 'No'}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="section-header">5. Tenancy Details</div>
                    <div className="form-grid">
                        <div className="input-group col-6">
                            <label className="input-label">Move-in Date (dd/mm/yyyy)</label>
                            <input type="text" name="move_in_date_ddmmyyyy" value={formData.move_in_date_ddmmyyyy} onChange={handleInputChange} placeholder="01/01/2024" />
                        </div>
                    </div>

                    <div className="info-box py-4 mt-6">
                        <p className="text-sm font-bold text-slate-700 mb-4">Do you still live in the rental unit?</p>
                        <div className="flex gap-6 mb-6">
                            {['Yes', 'No'].map(choice => (
                                <label key={choice} className={`checkbox-card flex-1 ${formData.still_live === choice ? 'active' : ''}`}>
                                    <input type="radio" name="still_live" value={choice} checked={formData.still_live === choice} onChange={handleInputChange} />
                                    <span className="font-bold">{choice}</span>
                                </label>
                            ))}
                        </div>
                        {formData.still_live === 'No' && (
                            <div className="input-group">
                                <label className="input-label">Move-out Date (dd/mm/yyyy)</label>
                                <input type="text" name="move_out_date_ddmmyyyy" value={formData.move_out_date_ddmmyyyy} onChange={handleInputChange} placeholder="31/12/2024" className="max-w-[300px]" />
                            </div>
                        )}
                    </div>

                    <div className="section-header">6. Related Applications</div>
                    <div className="form-grid">
                        <div className="input-group col-6">
                            <label className="input-label">File Number 1</label>
                            <input type="text" name="related_file_1" value={formData.related_file_1} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">File Number 2</label>
                            <input type="text" name="related_file_2" value={formData.related_file_2} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

                {/* PAGE 3 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Tenant Rights</div>
                            <div className="hdr-subtitle">FORM T2 • Part 2: Reasons for Application</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 3 of 11</div>
                    </div>

                    <div className="info-box mb-8">
                        <p className="text-sm italic font-medium leading-relaxed">
                            Shade the box completely next to each of your reasons. For reasons 1-5, the person who caused the problem could be your landlord, agent, or superintendent. For reasons 6-7, only the landlord can be responsible.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Landlord, Agent, or Superintendent Actions:</p>
                        {[
                            { id: 'reason_1', label: 'Reason 1', desc: 'Entered my rental unit illegally.' },
                            { id: 'reason_2', label: 'Reason 2', desc: 'Changed the locks/locking system without giving me replacement keys.' },
                            { id: 'reason_3', label: 'Reason 3', desc: 'Substantially interfered with my reasonable enjoyment of the unit/complex.' },
                            { id: 'reason_4', label: 'Reason 4', desc: 'Harassed, coerced, obstructed, threatened or interfered with me.' },
                            { id: 'reason_5', label: 'Reason 5', desc: 'Withheld or interfered with vital services (heat, fuel, electricity, water) or care services.' }
                        ].map(reason => (
                            <label key={reason.id} className={`checkbox-card ${formData[reason.id] ? 'active' : ''}`}>
                                <input type="checkbox" name={reason.id} checked={formData[reason.id]} onChange={handleInputChange} />
                                <div>
                                    <span className="font-bold text-slate-900 block mb-1">{reason.label}</span>
                                    <span className="text-sm text-slate-600 leading-relaxed">{reason.desc}</span>
                                </div>
                            </label>
                        ))}

                        <p className="font-bold text-xs uppercase tracking-widest text-slate-400 mt-12 mb-4 border-b pb-2">Landlord Specific Actions:</p>
                        {[
                            { id: 'reason_6', label: 'Reason 6', desc: 'Did not give me 72 hours to remove my property after the Sheriff evicted me.' },
                            { id: 'reason_7', label: 'Reason 7', desc: 'Did not give me a written tenancy agreement for my care home unit, or it was missing info.' }
                        ].map(reason => (
                            <label key={reason.id} className={`checkbox-card ${formData[reason.id] ? 'active' : ''}`}>
                                <input type="checkbox" name={reason.id} checked={formData[reason.id]} onChange={handleInputChange} />
                                <div>
                                    <span className="font-bold text-slate-900 block mb-1">{reason.label}</span>
                                    <span className="text-sm text-slate-600 leading-relaxed">{reason.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* PAGE 4 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Tenant Rights</div>
                            <div className="hdr-subtitle">FORM T2 • Explanation of Reasons</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 4 of 11</div>
                    </div>

                    <div className="section-header">Detailed Explanation</div>

                    <div className="form-grid mb-6">
                        <div className="input-group col-4">
                            <label className="input-label">List Reason Number(s)</label>
                            <input type="text" name="reason_numbers" value={formData.reason_numbers} onChange={handleInputChange} placeholder="e.g. 1, 3, 4" className="font-bold text-blue-600" />
                        </div>
                    </div>

                    <div className="info-box mb-6 bg-blue-50/50 border-blue-200">
                        <div className="grid grid-cols-2 gap-4 text-xs font-bold text-blue-700 uppercase tracking-tight">
                            <div>• What happened?</div>
                            <div>• Who caused the problem?</div>
                            <div>• What were the dates/times?</div>
                            <div>• Who was involved?</div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Describe the events in detail:</label>
                        <textarea
                            name="reasons_description"
                            value={formData.reasons_description}
                            onChange={handleInputChange}
                            className="min-h-[500px] leading-relaxed"
                            placeholder="Provide a clear, chronological account of the events..."
                        ></textarea>
                    </div>
                    <p className="text-right text-xs text-slate-400 mt-4 italic">Attach additional sheets if necessary if you need more space.</p>
                </div>

                {/* PAGE 5 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Tenant Rights</div>
                            <div className="hdr-subtitle">FORM T2 • Part 3: Remedies (1-4)</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 5 of 11</div>
                    </div>

                    <div className="section-header">Part 3: Remedies</div>
                    <div className="info-box mb-8">
                        <p className="text-sm italic font-medium leading-relaxed">
                            Shade the box completely next to each remedy you want the Board to order. You can ask for more than one remedy.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Remedy 1 */}
                        <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_1 ? 'active' : ''}`}>
                            <label className="flex gap-4 cursor-pointer">
                                <input type="checkbox" name="remedy_1" checked={formData.remedy_1} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-slate-900 block mb-1">Remedy 1: Rent Abatement</span>
                                    <span className="text-sm text-slate-600">The landlord should pay me a rebate of rent.</span>
                                </div>
                            </label>
                            {formData.remedy_1 && (
                                <div className="form-grid pt-4 border-t border-blue-100">
                                    <div className="input-group col-4">
                                        <label className="input-label">Amount ($)</label>
                                        <input type="text" name="current_rent_amount" value={formData.current_rent_amount} onChange={handleInputChange} placeholder="0.00" />
                                    </div>
                                    <div className="input-group col-12">
                                        <label className="input-label">How was this calculated?</label>
                                        <textarea name="rent_abatement_explain" value={formData.rent_abatement_explain} onChange={handleInputChange} className="min-h-[100px]"></textarea>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Remedy 2 */}
                        <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_2 ? 'active' : ''}`}>
                            <label className="flex gap-4 cursor-pointer">
                                <input type="checkbox" name="remedy_2" checked={formData.remedy_2} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-slate-900 block mb-1">Remedy 2: Stop Activities</span>
                                    <span className="text-sm text-slate-600">The Board should order the landlord/agent/superintendent to stop the activities.</span>
                                </div>
                            </label>
                            {formData.remedy_2 && (
                                <div className="input-group pt-4 border-t border-blue-100">
                                    <label className="input-label">Describe activities to stop:</label>
                                    <textarea name="remedy_2_explain" value={formData.remedy_2_explain} onChange={handleInputChange} className="min-h-[100px]"></textarea>
                                </div>
                            )}
                        </div>

                        {/* Remedy 3 */}
                        <label className={`checkbox-card ${formData.remedy_3 ? 'active' : ''}`}>
                            <input type="checkbox" name="remedy_3" checked={formData.remedy_3} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-slate-900 block mb-1">Remedy 3: Administrative Fine</span>
                                <span className="text-sm text-slate-600">The landlord should pay an administrative fine to the Board.</span>
                            </div>
                        </label>

                        {/* Remedy 4 */}
                        <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_4 ? 'active' : ''}`}>
                            <label className="flex gap-4 cursor-pointer">
                                <input type="checkbox" name="remedy_4" checked={formData.remedy_4} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-slate-900 block mb-1">Remedy 4: Terminate Tenancy</span>
                                    <span className="text-sm text-slate-600">I want to end my tenancy on the date specified below.</span>
                                </div>
                            </label>
                            {formData.remedy_4 && (
                                <div className="input-group pt-4 border-t border-blue-100">
                                    <label className="input-label">Termination Date (dd/mm/yyyy)</label>
                                    <input type="text" name="end_tenancy_date_ddmmyyyy" value={formData.end_tenancy_date_ddmmyyyy} onChange={handleInputChange} placeholder="31/12/2024" className="max-w-[300px]" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PAGE 6 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Tenant Rights</div>
                            <div className="hdr-subtitle">FORM T2 • Part 3: Remedies (5-7)</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 6 of 11</div>
                    </div>

                    <div className="space-y-6 mt-8">
                        {/* Remedy 5 */}
                        <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_5 ? 'active' : ''}`}>
                            <label className="flex gap-4 cursor-pointer">
                                <input type="checkbox" name="remedy_5" checked={formData.remedy_5} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-slate-900 block mb-1">Remedy 5: Repair or Replace Property</span>
                                    <span className="text-sm text-slate-600">The landlord should pay for the costs to repair or replace property damaged/destroyed.</span>
                                </div>
                            </label>
                            {formData.remedy_5 && (
                                <div className="form-grid pt-4 border-t border-blue-100">
                                    <div className="input-group col-4">
                                        <label className="input-label">Total Cost ($)</label>
                                        <input type="text" name="remedy_5_total_costs" value={formData.remedy_5_total_costs} onChange={handleInputChange} placeholder="0.00" />
                                    </div>
                                    <div className="input-group col-12">
                                        <label className="input-label">Itemized List & Cost Breakdown:</label>
                                        <textarea name="remedy_5_explain" value={formData.remedy_5_explain} onChange={handleInputChange} className="min-h-[120px]"></textarea>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="info-box py-6 bg-slate-900 text-white rounded-2xl relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-8 opacity-10">
                                <span className="text-8xl font-black">!</span>
                            </div>
                            <h4 className="text-lg font-black mb-2 text-slate-200 uppercase tracking-widest">Relocation Remedies</h4>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                If the actions of the landlord caused you to move out of your rental unit, you can ask for remedies 6 and/or 7.
                            </p>
                        </div>

                        {/* Remedy 6 */}
                        <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_6 ? 'active' : ''}`}>
                            <label className="flex gap-4 cursor-pointer">
                                <input type="checkbox" name="remedy_6" checked={formData.remedy_6} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-slate-900 block mb-1">Remedy 6: Rent Differential</span>
                                    <span className="text-sm text-slate-600">Differential rent for my new unit (higher rent) for one year.</span>
                                </div>
                            </label>
                            {formData.remedy_6 && (
                                <div className="form-grid pt-4 border-t border-blue-100">
                                    <div className="input-group col-6">
                                        <label className="input-label">Total One-Year Owed ($)</label>
                                        <input type="text" name="remedy_6_total_owed" value={formData.remedy_6_total_owed} onChange={handleInputChange} placeholder="0.00" className="font-bold text-blue-600" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Remedy 7 */}
                        <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_7 ? 'active' : ''}`}>
                            <label className="flex gap-4 cursor-pointer">
                                <input type="checkbox" name="remedy_7" checked={formData.remedy_7} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-slate-900 block mb-1">Remedy 7: Moving and Storage</span>
                                    <span className="text-sm text-slate-600">Payment for moving and storage expenses.</span>
                                </div>
                            </label>
                            {formData.remedy_7 && (
                                <div className="form-grid pt-4 border-t border-blue-100">
                                    <div className="input-group col-4">
                                        <label className="input-label">Total Amount ($)</label>
                                        <input type="text" name="remedy_7_total" value={formData.remedy_7_total} onChange={handleInputChange} placeholder="0.00" />
                                    </div>
                                    <div className="input-group col-12">
                                        <label className="input-label">Calculation Details:</label>
                                        <textarea name="remedy_7_explain" value={formData.remedy_7_explain} onChange={handleInputChange} className="min-h-[100px]"></textarea>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PAGE 7 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Tenant Rights</div>
                            <div className="hdr-subtitle">FORM T2 • Part 3: Remedies (8-11)</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 7 of 11</div>
                    </div>

                    <div className="space-y-6 mt-8">
                        {/* Remedy 8 */}
                        <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_8 ? 'active' : ''}`}>
                            <label className="flex gap-4 cursor-pointer">
                                <input type="checkbox" name="remedy_8" checked={formData.remedy_8} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-slate-900 block mb-1">Remedy 8: Out-of-pocket expenses</span>
                                    <span className="text-sm text-slate-600">Expenses resulting from landlord, agent, or superintendent's actions.</span>
                                </div>
                            </label>
                            {formData.remedy_8 && (
                                <div className="form-grid pt-4 border-t border-blue-100">
                                    <div className="input-group col-4">
                                        <label className="input-label">Total Expenses ($)</label>
                                        <input type="text" name="remedy_8_total" value={formData.remedy_8_total} onChange={handleInputChange} placeholder="0.00" />
                                    </div>
                                    <div className="input-group col-12">
                                        <label className="input-label">Explanation & Breakdown:</label>
                                        <textarea name="remedy_8_explain" value={formData.remedy_8_explain} onChange={handleInputChange} className="min-h-[100px]"></textarea>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reason 2 Specific */}
                        <div className="info-box py-6 bg-slate-50 border-slate-200">
                            <p className="text-sm text-slate-600 font-medium">
                                <span className="font-bold text-slate-900 border-b-2 border-slate-900">Reason 2 specific remedy:</span> Changing locks without giving replacement keys.
                            </p>
                        </div>

                        {/* Remedy 9 */}
                        <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_9 ? 'active' : ''}`}>
                            <label className="flex gap-4 cursor-pointer">
                                <input type="checkbox" name="remedy_9" checked={formData.remedy_9} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-slate-900 block mb-1">Remedy 9: Move Back In</span>
                                    <span className="text-sm text-slate-600">Move back into the unit and landlord must not rent to anyone else.</span>
                                </div>
                            </label>
                        </div>

                        {/* Remedy 10 */}
                        <label className={`checkbox-card ${formData.remedy_10 ? 'active' : ''}`}>
                            <input type="checkbox" name="remedy_10" checked={formData.remedy_10} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-slate-900 block mb-1">Remedy 10: Return Property</span>
                                <span className="text-sm text-slate-600">The landlord must return all my property (Reason 6 relate).</span>
                            </div>
                        </label>

                        {/* Remedy 11 */}
                        <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_11 ? 'active' : ''}`}>
                            <label className="flex gap-4 cursor-pointer">
                                <input type="checkbox" name="remedy_11" checked={formData.remedy_11} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-slate-900 block mb-1">Remedy 11: Other Remedies</span>
                                    <span className="text-sm text-slate-600">Describe any other orders you want the Board to make.</span>
                                </div>
                            </label>
                            {formData.remedy_11 && (
                                <div className="input-group pt-4 border-t border-blue-100">
                                    <label className="input-label">Details of other remedies:</label>
                                    <textarea name="remedy_11_explain" value={formData.remedy_11_explain} onChange={handleInputChange} className="min-h-[150px]"></textarea>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PAGE 8 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Tenant Rights</div>
                            <div className="hdr-subtitle">FORM T2 • Part 4: Signature</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 8 of 11</div>
                    </div>

                    <div className="section-header">Part 4: Signature</div>
                    <div className="signature-box">
                        <div className="form-grid">
                            <div className="input-group col-7">
                                <label className="input-label">Digital Signature</label>
                                <input type="text" className="h-[60px] text-xl font-bold border-2 border-slate-900 text-center" placeholder="Type name to sign" />
                            </div>
                            <div className="input-group col-5">
                                <label className="input-label">Date (dd/mm/yyyy)</label>
                                <input type="text" name="signature_date_ddmmyyyy" value={formData.signature_date_ddmmyyyy} onChange={handleInputChange} className="h-[60px] text-center" />
                            </div>
                        </div>

                        <div className="info-box mt-8 text-left bg-slate-50 border-slate-200">
                            <p className="input-label mb-4">Who has signed the application?</p>
                            <div className="flex gap-4 flex-wrap">
                                {['Tenant 1', 'Tenant 2', 'Legal Representative'].map(who => (
                                    <label key={who} className={`checkbox-card py-3 px-6 rounded-full ${formData.who_signed === who ? 'active' : ''}`}>
                                        <input type="radio" name="who_signed" value={who} checked={formData.who_signed === who} onChange={handleInputChange} />
                                        <span className="font-bold text-sm">{who}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="section-header">Information About the Legal Representative</div>
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
                            <label className="input-label">Law Society Number (LSUC #)</label>
                            <input type="text" name="rep_lsuc" value={formData.rep_lsuc} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Company Name</label>
                            <input type="text" name="rep_company" value={formData.rep_company} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-12">
                            <label className="input-label">Mailing Address</label>
                            <input type="text" name="rep_mailing_address" value={formData.rep_mailing_address} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Unit/Apt.</label>
                            <input type="text" name="rep_unit" value={formData.rep_unit} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Municipality</label>
                            <input type="text" name="rep_municipality" value={formData.rep_municipality} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-2">
                            <label className="input-label">Province</label>
                            <input type="text" name="rep_province" value={formData.rep_province} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-2">
                            <label className="input-label">Postal Code</label>
                            <input type="text" name="rep_postal" value={formData.rep_postal} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Day Phone</label>
                            <input type="tel" name="rep_day_phone" value={formData.rep_day_phone} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">E-mail Address</label>
                            <input type="email" name="rep_email" value={formData.rep_email} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

                {/* PAGE 9 - Information Only */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Tenant Rights</div>
                            <div className="hdr-subtitle">FORM T2 • Legal Information</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 9 of 11</div>
                    </div>

                    <div className="section-header">Collecting Personal Information</div>
                    <div className="info-box py-8 bg-slate-50 border-slate-200">
                        <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                            The Landlord and Tenant Board has the right to collect the information requested on this form to resolve your application under section 185 of the Residential Tenancies Act, 2006. After you file the form, all information related to the proceeding may become publicly available.
                        </p>
                    </div>

                    <div className="section-header">Important Information</div>
                    <div className="space-y-4 mt-8">
                        {[
                            { title: 'French-Language Services', desc: 'You can ask the Board to provide services in French at your hearing.' },
                            { title: 'Accommodation', desc: 'You can request special arrangements under the Human Rights Code to participate in the hearing.' },
                            { title: 'False Information', desc: 'It is an offence to file false or misleading information with the Board.' },
                            { title: 'Application Costs', desc: 'The Board can order either party to pay the other\'s costs.' },
                            { title: 'Rules of Practice', desc: 'The Board has specific rules that explain the application process and how they decide issues.' }
                        ].map((item, idx) => (
                            <div key={idx} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                <span className="font-bold text-slate-900 mr-2">{idx + 1}. {item.title}:</span>
                                <span className="text-sm text-slate-600">{item.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PAGE 10 - French Services & Accommodation */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Services & Accommodation</div>
                            <div className="hdr-subtitle">FORM T2 • Accessibility Requests</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 10 of 11</div>
                    </div>

                    <div className="section-header">Request for Services</div>
                    <div className="space-y-6">
                        <label className={`checkbox-card ${formData.request_french_services ? 'active' : ''}`}>
                            <input type="checkbox" name="request_french_services" checked={formData.request_french_services} onChange={handleInputChange} />
                            <div>
                                <span className="font-bold text-slate-900 block mb-1">French-Language Services</span>
                                <span className="text-sm text-slate-600 leading-relaxed">Check this box if you want the dispute process to be conducted in French.</span>
                            </div>
                        </label>

                        <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.request_accommodation ? 'active' : ''}`}>
                            <label className="flex gap-4 cursor-pointer">
                                <input type="checkbox" name="request_accommodation" checked={formData.request_accommodation} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-slate-900 block mb-1">Human Rights Code Accommodation</span>
                                    <span className="text-sm text-slate-600 opacity-80 leading-relaxed">Check this box if you need accommodation under the Human Rights Code.</span>
                                </div>
                            </label>
                            {formData.request_accommodation && (
                                <div className="input-group pt-4 border-t border-blue-100">
                                    <label className="input-label">Please explain the accommodation required:</label>
                                    <textarea name="accommodation_explain" value={formData.accommodation_explain} onChange={handleInputChange} className="min-h-[200px]" placeholder="Describe your specific needs..."></textarea>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PAGE 11 - Payment Info */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Payment Information</div>
                            <div className="hdr-subtitle">FORM T2 • Fee & Method</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 11 of 11</div>
                    </div>

                    <div className="section-header">Payment Method Selection</div>
                    <div className="info-box py-10 bg-slate-900 text-white rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute left-0 top-0 w-1 h-full bg-blue-500"></div>
                        <div className="relative z-10">
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8">Choose one method:</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { id: 'pay_money_order', label: 'Money Order', icon: '📝' },
                                    { id: 'pay_certified_cheque', label: 'Certified Cheque', icon: '📎' },
                                    { id: 'pay_credit_card', label: 'Credit Card', icon: '💳' }
                                ].map(method => (
                                    <label key={method.id} className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all cursor-pointer ${formData[method.id] ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                        <input type="checkbox" name={method.id} checked={formData[method.id]} onChange={handleInputChange} className="hidden" />
                                        <span className="text-3xl">{method.icon}</span>
                                        <span className="font-black text-sm uppercase tracking-tighter">{method.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-grid mt-12">
                        <div className="col-12 p-6 bg-slate-50 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-4 border-b pb-2">Important Payment Instructions:</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex gap-3">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span>Money orders and certified cheques must be made payable to the <strong className="text-slate-900">"Minister of Finance"</strong>.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span>If paying by credit card and filing by mail/courier, you must complete the <strong className="text-slate-900">Credit Card Payment Form</strong>.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
