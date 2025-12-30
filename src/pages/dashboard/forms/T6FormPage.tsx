import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Printer, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore
import html2pdf from "html2pdf.js";

export default function T6FormPage() {
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
                .from('t6_forms' as any)
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
        move_in_date_ddmmyyyy: "", still_live: "", move_out_date_ddmmyyyy: "",
        related_file_1: "", related_file_2: "",
        maintenance_describe_in_detail: "", first_told_landlord_ddmmyyyy: "",
        remedy_1: false, current_rent_amount: "", rent_by_month: false, rent_by_week: false, rent_by_other: false, rent_by_other_specify: "", rent_abatement_explain: "",
        remedy_2: false, remedy_2_total_costs: "", remedy_2_explain: "",
        remedy_3: false, remedy_3_total: "", remedy_3_explain: "",
        remedy_4: false, remedy_4_total_costs: "", remedy_4_explain: "",
        remedy_5: false, remedy_5_explain: "",
        remedy_6: false, remedy_6_explain: "",
        remedy_7: false,
        remedy_8: false, end_tenancy_date_ddmmyyyy: "",
        remedy_9: false, remedy_9_explain: "",
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
        const element = document.getElementById('t6-form-document');
        const opt = {
            margin: 0,
            filename: 'T6-Application-Maintenance.pdf',
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
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
                .from('t6_forms' as any)
                .upsert(upsertData)
                .select()
                .single() as any);

            if (error) throw error;

            if (data) {
                setId(data.id);
                // Update URL without refreshing
                const newUrl = `${window.location.pathname}?id=${data.id}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
                toast({ title: "Draft Saved", description: "Your T6 application has been saved to your drafts." });
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
            {/* Controls */}
            <div className="max-w-[1200px] mx-auto mb-6 flex items-center justify-between no-print">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 font-bold text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="h-5 w-5" /> Back to Dashboard
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleDownload} className="gap-2 font-bold border-2 bg-white hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="h-5 w-5" /> Export PDF
                    </Button>
                    <Button variant="outline" onClick={() => window.print()} className="gap-2 font-bold border-2 bg-white hover:bg-slate-50 transition-all shadow-sm">
                        <Printer className="h-5 w-5" /> Print
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black px-6 shadow-lg transition-all active:scale-95">
                        <Save className="h-5 w-5" /> {isLoading ? "Saving..." : "Save Draft"}
                    </Button>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                #t6-form-document {
                    --ink: #0f172a;
                    --muted: #64748b;
                    --line: #e2e8f0;
                    --accent: #2563eb;
                    --bg: #ffffff;
                    background: var(--bg);
                    color: var(--ink);
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    line-height: 1.5;
                    margin: 0 auto;
                    max-width: 1200px;
                    padding: 60px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
                }

                .page {
                    page-break-after: always;
                    margin: 0 auto 60px auto;
                    position: relative;
                }

                .page:last-child { page-break-after: auto; margin-bottom: 0; }

                .hdr {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    padding-bottom: 24px;
                    margin-bottom: 40px;
                    border-bottom: 2px solid var(--ink);
                }

                .hdr-title {
                    font-weight: 900;
                    font-size: 28px;
                    text-transform: uppercase;
                    letter-spacing: -0.025em;
                    line-height: 1;
                }

                .hdr-subtitle {
                    font-weight: 600;
                    font-size: 16px;
                    color: var(--accent);
                    margin-top: 4px;
                }

                .section-header {
                    background: var(--ink);
                    color: white;
                    padding: 12px 20px;
                    font-weight: 800;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 40px 0 24px;
                    border-radius: 4px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .col-1 { grid-column: span 1; }
                .col-2 { grid-column: span 2; }
                .col-3 { grid-column: span 3; }
                .col-4 { grid-column: span 4; }
                .col-5 { grid-column: span 5; }
                .col-6 { grid-column: span 6; }
                .col-7 { grid-column: span 7; }
                .col-8 { grid-column: span 8; }
                .col-9 { grid-column: span 9; }
                .col-10 { grid-column: span 10; }
                .col-11 { grid-column: span 11; }
                .col-12 { grid-column: span 12; }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .input-label {
                    font-weight: 700;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                    color: var(--muted);
                }

                input[type="text"], 
                input[type="email"], 
                input[type="tel"], 
                textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--line);
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                    background: #f8fafc;
                }

                input:focus, textarea:focus {
                    outline: none;
                    border-color: var(--accent);
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }

                .info-box {
                    background: #f1f5f9;
                    border-radius: 12px;
                    padding: 24px;
                    border-left: 4px solid var(--ink);
                }

                .checkbox-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    border: 1px solid var(--line);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #fff;
                }

                .checkbox-card:hover {
                    border-color: var(--accent);
                    background: #f0f7ff;
                }

                .checkbox-card.active {
                    border-color: var(--accent);
                    background: #eff6ff;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
                }

                .checkbox-card input[type="checkbox"],
                .checkbox-card input[type="radio"] {
                    width: 20px;
                    height: 20px;
                    margin-top: 2px;
                }

                .signature-box {
                    border: 2px dashed var(--line);
                    border-radius: 12px;
                    padding: 40px;
                    text-align: center;
                    background: #f8fafc;
                }

                .office-use {
                    background: #f8fafc;
                    border: 2px solid var(--line);
                    border-radius: 12px;
                    padding: 24px;
                }

                @media print {
                    body { background: white; padding: 0; }
                    #t6-form-document { box-shadow: none; padding: 0; max-width: 100%; }
                    .no-print { display: none; }
                }
            `}</style>

            <div id="t6-form-document">
                {/* PAGE 1 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Maintenance</div>
                            <div className="hdr-subtitle">FORM T6 • Tenant Application</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 1 of 10</div>
                    </div>

                    <div className="section-header">Part 1: General Information</div>

                    <div className="info-box mb-8">
                        <p className="text-sm italic font-medium leading-relaxed">
                            Use this form to apply to have the Board determine whether the landlord has failed to maintain the rental unit or residential complex in a good state of repair, or has failed to comply with health, safety, housing and maintenance standards.
                        </p>
                    </div>

                    <div className="form-grid">
                        <div className="col-12">
                            <label className="input-label text-blue-600 mb-2 block">Address of the Rental Unit Covered by This Application</label>
                        </div>
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
                            <input type="text" name="rental_street_type" value={formData.rental_street_type} onChange={handleInputChange} placeholder="e.g. St, Ave, Blvd" />
                        </div>

                        <div className="input-group col-3">
                            <label className="input-label">Direction</label>
                            <input type="text" name="rental_direction" value={formData.rental_direction} onChange={handleInputChange} placeholder="e.g. East" />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Unit/Apt./Suite</label>
                            <input type="text" name="rental_unit" value={formData.rental_unit} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Municipality</label>
                            <input type="text" name="rental_municipality" value={formData.rental_municipality} onChange={handleInputChange} />
                        </div>

                        <div className="input-group col-6">
                            <label className="input-label">Province</label>
                            <input type="text" name="rental_province" value={formData.rental_province} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Postal Code</label>
                            <input type="text" name="rental_postal" value={formData.rental_postal} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="form-grid mt-12">
                        <div className="col-8">
                            <label className="input-label text-blue-600 mb-4 block">Tenant Names and Address</label>
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

                            <label className="input-label mt-8 mb-4 block italic">Mailing Address (if it is different from the rental unit)</label>
                            <div className="form-grid">
                                <div className="input-group col-3">
                                    <label className="input-label">Unit/Apt</label>
                                    <input type="text" name="mailing_unit" value={formData.mailing_unit} onChange={handleInputChange} />
                                </div>
                                <div className="input-group col-9">
                                    <label className="input-label">Municipality</label>
                                    <input type="text" name="mailing_municipality" value={formData.mailing_municipality} onChange={handleInputChange} />
                                </div>
                                <div className="input-group col-6">
                                    <label className="input-label">Province</label>
                                    <input type="text" name="mailing_province" value={formData.mailing_province} onChange={handleInputChange} />
                                </div>
                                <div className="input-group col-6">
                                    <label className="input-label">Postal Code</label>
                                    <input type="text" name="mailing_postal" value={formData.mailing_postal} onChange={handleInputChange} />
                                </div>
                                <div className="input-group col-6">
                                    <label className="input-label">Day Phone</label>
                                    <input type="tel" name="day_phone" value={formData.day_phone} onChange={handleInputChange} />
                                </div>
                                <div className="input-group col-6">
                                    <label className="input-label">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>

                        <div className="col-4">
                            <div className="office-use h-full">
                                <div className="input-label mb-4 border-b pb-2">Office Use Only</div>
                                <div className="input-group mb-4">
                                    <label className="input-label">File Number</label>
                                    <input type="text" name="office_file_number" value={formData.office_file_number} onChange={handleInputChange} className="bg-white" />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-auto pt-20">v. 01/04/2022</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAGE 2 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Maintenance</div>
                            <div className="hdr-subtitle">FORM T6 • Landlord & Tenancy Details</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 2 of 10</div>
                    </div>

                    <div className="section-header">Landlord's Information</div>

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
                            <label className="input-label">Unit/Apt</label>
                            <input type="text" name="landlord_unit" value={formData.landlord_unit} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Municipality</label>
                            <input type="text" name="landlord_municipality" value={formData.landlord_municipality} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Postal Code</label>
                            <input type="text" name="landlord_postal" value={formData.landlord_postal} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Day Phone</label>
                            <input type="tel" name="landlord_day_phone" value={formData.landlord_day_phone} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Email Address</label>
                            <input type="email" name="landlord_email" value={formData.landlord_email} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="section-header">Tenancy Details</div>
                    <div className="form-grid">
                        <div className="input-group col-6">
                            <label className="input-label">When did you move into the rental unit?</label>
                            <input type="text" name="move_in_date_ddmmyyyy" value={formData.move_in_date_ddmmyyyy} onChange={handleInputChange} placeholder="dd/mm/yyyy" />
                        </div>
                        <div className="col-12 mt-4">
                            <label className="input-label mb-3 block">Do you still live in the rental unit?</label>
                            <div className="flex gap-4">
                                <label className={`checkbox-card flex-1 ${formData.still_live === 'Yes' ? 'active' : ''}`}>
                                    <input type="radio" name="still_live" value="Yes" checked={formData.still_live === "Yes"} onChange={handleInputChange} />
                                    <span className="font-bold">Yes</span>
                                </label>
                                <label className={`checkbox-card flex-1 ${formData.still_live === 'No' ? 'active' : ''}`}>
                                    <input type="radio" name="still_live" value="No" checked={formData.still_live === "No"} onChange={handleInputChange} />
                                    <span className="font-bold">No</span>
                                </label>
                            </div>
                        </div>
                        {formData.still_live === 'No' && (
                            <div className="input-group col-6 mt-4">
                                <label className="input-label">When did you move out?</label>
                                <input type="text" name="move_out_date_ddmmyyyy" value={formData.move_out_date_ddmmyyyy} onChange={handleInputChange} placeholder="dd/mm/yyyy" />
                            </div>
                        )}
                    </div>

                    <div className="section-header">Related Applications</div>
                    <div className="form-grid">
                        <div className="col-12">
                            <p className="text-sm text-slate-500 mb-4 font-medium italic">If you or your landlord have filed other applications that relate to this rental unit, list the file numbers below.</p>
                        </div>
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
                            <div className="hdr-title">Application about Maintenance</div>
                            <div className="hdr-subtitle">FORM T6 • Part 2: Reasons for Filing</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 3 of 10</div>
                    </div>

                    <div className="section-header">Part 2: Reasons for Filing this Application</div>

                    <div className="info-box mb-8">
                        <p className="font-bold text-slate-900 mb-2">I am applying because the landlord has not repaired or maintained the unit/complex or complied with standards.</p>
                        <p className="text-sm italic text-slate-600 leading-relaxed">
                            Describe in detail the repairs or maintenance that you believe have not been done or the standards that have not been complied with.
                        </p>
                    </div>

                    <div className="info-box bg-blue-50 border-blue-600 mb-8 items-center">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4 font-semibold text-blue-900 text-xs uppercase tracking-wider">
                            <div>• What is the problem?</div>
                            <div>• Date each problem started?</div>
                            <div>• Has it been repaired? By whom?</div>
                            <div>• Who caused it?</div>
                            <div>• How was the landlord informed?</div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Detailed Explanation</label>
                        <textarea
                            name="maintenance_describe_in_detail"
                            value={formData.maintenance_describe_in_detail}
                            onChange={handleInputChange}
                            className="min-h-[450px] leading-relaxed"
                            placeholder="Provide a clear, chronological account of the maintenance issues..."
                        ></textarea>
                    </div>

                    <div className="form-grid mt-8">
                        <div className="input-group col-4">
                            <label className="input-label">When did you first tell the landlord?</label>
                            <input
                                type="text"
                                name="first_told_landlord_ddmmyyyy"
                                value={formData.first_told_landlord_ddmmyyyy}
                                onChange={handleInputChange}
                                placeholder="dd/mm/yyyy"
                                className="font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* PAGE 4 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Application about Maintenance</div>
                            <div className="hdr-subtitle">FORM T6 • Part 3: Remedies (1-2)</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 4 of 10</div>
                    </div>

                    <div className="section-header">Part 3: Remedies</div>
                    <div className="info-box mb-8 text-sm italic font-medium leading-relaxed">
                        The remedies listed below are orders the Board can make. Shade the box completely next to each remedy you want the Board to order.
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
                                <div className="form-grid pt-4 border-t border-blue-100 italic font-medium">
                                    <div className="input-group col-4">
                                        <label className="input-label">Total Abatement ($)</label>
                                        <input type="text" name="remedy_1_amount" value={formData.remedy_1_amount} onChange={handleInputChange} placeholder="0.00" />
                                    </div>
                                    <div className="input-group col-4">
                                        <label className="input-label">Current Rent ($)</label>
                                        <input type="text" name="current_rent_amount" value={formData.current_rent_amount} onChange={handleInputChange} placeholder="0.00" />
                                    </div>
                                    <div className="col-4">
                                        <label className="input-label">Paid by:</label>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                                <input type="checkbox" name="rent_by_month" checked={formData.rent_by_month} onChange={handleInputChange} /> Month
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                                <input type="checkbox" name="rent_by_week" checked={formData.rent_by_week} onChange={handleInputChange} /> Week
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 text-sm">
                                                <input type="checkbox" name="rent_by_other" checked={formData.rent_by_other} onChange={handleInputChange} /> Other
                                            </label>
                                        </div>
                                        {formData.rent_by_other && (
                                            <input
                                                type="text"
                                                name="rent_by_other_specify"
                                                value={formData.rent_by_other_specify}
                                                onChange={handleInputChange}
                                                placeholder="Specify..."
                                                className="mt-2 text-xs h-8"
                                            />
                                        )}
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
                                    <span className="font-bold text-slate-900 block mb-1">Remedy 2: Damaged/Destroyed Property</span>
                                    <span className="text-sm text-slate-600">The landlord should pay for the costs to repair or replace property that was damaged, destroyed or disposed of.</span>
                                </div>
                            </label>
                            {formData.remedy_2 && (
                                <div className="form-grid pt-4 border-t border-blue-100">
                                    <div className="input-group col-4">
                                        <label className="input-label">Total Replacement Costs ($)</label>
                                        <input type="text" name="remedy_2_total_costs" value={formData.remedy_2_total_costs} onChange={handleInputChange} placeholder="0.00" />
                                    </div>
                                    <div className="input-group col-12">
                                        <label className="input-label">Detailed Item & Cost List:</label>
                                        <textarea name="remedy_2_explain" value={formData.remedy_2_explain} onChange={handleInputChange} className="min-h-[120px]" placeholder="Item names, description of damage, and individual costs..."></textarea>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="footer">
                    <div>RoomieAI Assistance</div>
                    <div>Page 4 of 10</div>
                </div>
            </div>

            {/* PAGE 5 */}
            <div className="page">
                <div className="hdr">
                    <div className="left">
                        <div className="hdr-title">Application about Maintenance</div>
                        <div className="hdr-subtitle">FORM T6 • Part 3: Remedies (3-5)</div>
                    </div>
                    <div className="right text-slate-400 font-bold text-sm">Page 5 of 10</div>
                </div>

                <div className="section-header">Part 3: Remedies (Continued)</div>

                <div className="space-y-6">
                    {/* Remedy 3 */}
                    <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_3 ? 'active' : ''}`}>
                        <label className="flex gap-4 cursor-pointer">
                            <input type="checkbox" name="remedy_3" checked={formData.remedy_3} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-slate-900 block mb-1">Remedy 3: Out-of-pocket Expenses</span>
                                <span className="text-sm text-slate-600">The landlord should pay me for the out-of-pocket expenses I have paid or will pay.</span>
                            </div>
                        </label>
                        {formData.remedy_3 && (
                            <div className="form-grid pt-4 border-t border-blue-100">
                                <div className="input-group col-4">
                                    <label className="input-label">Total Out-of-Pocket ($)</label>
                                    <input type="text" name="remedy_3_total" value={formData.remedy_3_total} onChange={handleInputChange} placeholder="0.00" />
                                </div>
                                <div className="input-group col-12">
                                    <label className="input-label">How was this calculated?</label>
                                    <textarea name="remedy_3_explain" value={formData.remedy_3_explain} onChange={handleInputChange} className="min-h-[100px]"></textarea>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Remedy 4 */}
                    <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_4 ? 'active' : ''}`}>
                        <label className="flex gap-4 cursor-pointer">
                            <input type="checkbox" name="remedy_4" checked={formData.remedy_4} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-slate-900 block mb-1">Remedy 4: Payment for Work Done</span>
                                <span className="text-sm text-slate-600">I have done or will do the repairs/work. The landlord should pay me for this work.</span>
                            </div>
                        </label>
                        {formData.remedy_4 && (
                            <div className="form-grid pt-4 border-t border-blue-100">
                                <div className="input-group col-4">
                                    <label className="input-label">Cost for My Work ($)</label>
                                    <input type="text" name="remedy_4_total_costs" value={formData.remedy_4_total_costs} onChange={handleInputChange} placeholder="0.00" />
                                </div>
                                <div className="input-group col-12">
                                    <label className="input-label">Explain work done & calculation:</label>
                                    <textarea name="remedy_4_explain" value={formData.remedy_4_explain} onChange={handleInputChange} className="min-h-[100px]"></textarea>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Remedy 5 */}
                    <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_5 ? 'active' : ''}`}>
                        <label className="flex gap-4 cursor-pointer">
                            <input type="checkbox" name="remedy_5" checked={formData.remedy_5} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-slate-900 block mb-1">Remedy 5: Authorization to do Work</span>
                                <span className="text-sm text-slate-600">I want the Board to allow me to do the work and order the landlord to pay me for it.</span>
                            </div>
                        </label>
                        {formData.remedy_5 && (
                            <div className="input-group pt-4 border-t border-blue-100">
                                <label className="input-label">Describe work planned and specific costs:</label>
                                <textarea name="remedy_5_explain" value={formData.remedy_5_explain} onChange={handleInputChange} className="min-h-[120px]"></textarea>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PAGE 6 */}
            <div className="page">
                <div className="hdr">
                    <div className="left">
                        <div className="hdr-title">Application about Maintenance</div>
                        <div className="hdr-subtitle">FORM T6 • Part 3: Remedies (6-9)</div>
                    </div>
                    <div className="right text-slate-400 font-bold text-sm">Page 6 of 10</div>
                </div>

                <div className="section-header">Part 3: Remedies (Continued)</div>

                <div className="space-y-6">
                    {/* Remedy 6 */}
                    <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_6 ? 'active' : ''}`}>
                        <label className="flex gap-4 cursor-pointer">
                            <input type="checkbox" name="remedy_6" checked={formData.remedy_6} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-slate-900 block mb-1">Remedy 6: Mandatory Repairs</span>
                                <span className="text-sm text-slate-600">The Board should order the landlord to do the repairs, replacement or other work.</span>
                            </div>
                        </label>
                        {formData.remedy_6 && (
                            <div className="input-group pt-4 border-t border-blue-100">
                                <label className="input-label">Specify what the Landlord MUST do:</label>
                                <textarea name="remedy_6_explain" value={formData.remedy_6_explain} onChange={handleInputChange} className="min-h-[120px]" placeholder="Be specific about the required outcomes..."></textarea>
                            </div>
                        )}
                    </div>

                    {/* Remedy 7 */}
                    <label className={`checkbox-card ${formData.remedy_7 ? 'active' : ''}`}>
                        <input type="checkbox" name="remedy_7" checked={formData.remedy_7} onChange={handleInputChange} />
                        <div className="flex-1">
                            <span className="font-bold text-slate-900 block mb-1">Remedy 7: Prohibit Rent Increase</span>
                            <span className="text-sm text-slate-600">The Board should order that the landlord cannot increase the rent until the work is complete.</span>
                        </div>
                    </label>

                    {/* Remedy 8 */}
                    <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_8 ? 'active' : ''}`}>
                        <label className="flex gap-4 cursor-pointer">
                            <input type="checkbox" name="remedy_8" checked={formData.remedy_8} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-slate-900 block mb-1">Remedy 8: Terminate Tenancy</span>
                                <span className="text-sm text-slate-600">I want to end my tenancy on the date specified below.</span>
                            </div>
                        </label>
                        {formData.remedy_8 && (
                            <div className="input-group pt-4 border-t border-blue-100">
                                <label className="input-label">Termination Date (dd/mm/yyyy)</label>
                                <input type="text" name="end_tenancy_date_ddmmyyyy" value={formData.end_tenancy_date_ddmmyyyy} onChange={handleInputChange} placeholder="31/12/2024" className="max-w-[300px]" />
                            </div>
                        )}
                    </div>

                    {/* Remedy 9 */}
                    <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.remedy_9 ? 'active' : ''}`}>
                        <label className="flex gap-4 cursor-pointer">
                            <input type="checkbox" name="remedy_9" checked={formData.remedy_9} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-slate-900 block mb-1">Remedy 9: Other Remedies</span>
                                <span className="text-sm text-slate-600">I want the Board to order other remedies as described below.</span>
                            </div>
                        </label>
                        {formData.remedy_9 && (
                            <div className="input-group pt-4 border-t border-blue-100">
                                <label className="input-label">Explanation of other remedies:</label>
                                <textarea name="remedy_9_explain" value={formData.remedy_9_explain} onChange={handleInputChange} className="min-h-[120px]"></textarea>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PAGE 7 */}
            <div className="page">
                <div className="hdr">
                    <div className="left">
                        <div className="hdr-title">Application about Maintenance</div>
                        <div className="hdr-subtitle">FORM T6 • Part 4: Signature</div>
                    </div>
                    <div className="right text-slate-400 font-bold text-sm">Page 7 of 10</div>
                </div>

                <div className="section-header">Part 4: Signature</div>

                <div className="form-grid mb-12">
                    <div className="col-8">
                        <div className="signature-box">
                            <div className="input-group">
                                <label className="input-label">Signature</label>
                                <div className="h-16 border-b-2 border-slate-900/10 flex items-end pb-2 italic text-slate-400">Sign Here</div>
                            </div>
                        </div>
                    </div>
                    <div className="input-group col-4">
                        <label className="input-label">Date (dd/mm/yyyy)</label>
                        <input type="text" name="signature_date_ddmmyyyy" value={formData.signature_date_ddmmyyyy} onChange={handleInputChange} placeholder="dd/mm/yyyy" className="font-bold text-xl h-16" />
                    </div>
                </div>

                <div className="input-group mb-12">
                    <label className="input-label mb-4">Who has signed the application?</label>
                    <div className="flex gap-4">
                        {['Tenant 1', 'Tenant 2', 'Legal Representative'].map(signer => (
                            <label key={signer} className={`checkbox-card flex-1 ${formData.who_signed === signer ? 'active' : ''}`}>
                                <input type="radio" name="who_signed" value={signer} checked={formData.who_signed === signer} onChange={handleInputChange} />
                                <span className="font-bold">{signer}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="section-header">Information about the Legal Representative</div>
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
                        <label className="input-label">LSUC #</label>
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
                    <div className="input-group col-3">
                        <label className="input-label">Unit/Apt</label>
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
                    <div className="input-group col-3">
                        <label className="input-label">Postal Code</label>
                        <input type="text" name="rep_postal" value={formData.rep_postal} onChange={handleInputChange} />
                    </div>
                    <div className="input-group col-6">
                        <label className="input-label">Day Phone</label>
                        <input type="tel" name="rep_day_phone" value={formData.rep_day_phone} onChange={handleInputChange} />
                    </div>
                    <div className="input-group col-6">
                        <label className="input-label">Evening Phone</label>
                        <input type="tel" name="rep_evening_phone" value={formData.rep_evening_phone} onChange={handleInputChange} />
                    </div>
                    <div className="input-group col-12">
                        <label className="input-label">Email Address</label>
                        <input type="email" name="rep_email" value={formData.rep_email} onChange={handleInputChange} />
                    </div>
                </div>
            </div>

            {/* PAGE 8 */}
            <div className="page">
                <div className="hdr">
                    <div className="left">
                        <div className="hdr-title">Application about Maintenance</div>
                        <div className="hdr-subtitle">FORM T6 • Important Information</div>
                    </div>
                    <div className="right text-slate-400 font-bold text-sm">Page 8 of 10</div>
                </div>

                <div className="section-header">Collecting Personal Information</div>
                <div className="info-box mb-12">
                    <p className="leading-relaxed text-slate-700">
                        The Landlord and Tenant Board has the right to collect the information requested on this form to resolve your application under section 185 of the Residential Tenancies Act, 2006. After you file the form, all information you give to the Board may become publicly available and may be included in a Board order.
                    </p>
                </div>

                <div className="section-header">Important Information from the LTB</div>
                <div className="space-y-4">
                    {[
                        { title: 'French Language Services', text: 'You can ask the Board to provide services in French.' },
                        { title: 'Accommodation', text: 'You can request arrangements under the Ontario Human Rights Code.' },
                        { title: 'Offence', text: 'It is an offence to file false or misleading information.' },
                        { title: 'Costs', text: 'The Board can order one party to pay the other party\'s application costs.' },
                        { title: 'Guidelines', text: 'Read the Board\'s Rules of Practice for more information.' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <div className="font-bold text-blue-600">{idx + 1}.</div>
                            <div>
                                <span className="font-bold text-slate-900 mr-2">{item.title}:</span>
                                <span className="text-slate-600">{item.text}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 uppercase tracking-widest font-bold text-sm bg-slate-50/30">
                    OFFICE USE ONLY
                </div>
            </div>

            {/* PAGE 9 */}
            <div className="page">
                <div className="hdr">
                    <div className="left">
                        <div className="hdr-title">Application about Maintenance</div>
                        <div className="hdr-subtitle">FORM T6 • Services & Accommodations</div>
                    </div>
                    <div className="right text-slate-400 font-bold text-sm">Page 9 of 10</div>
                </div>

                <div className="section-header">Request for French-Language Services</div>
                <label className={`checkbox-card mb-12 ${formData.request_french_services ? 'active' : ''}`}>
                    <input type="checkbox" name="request_french_services" checked={formData.request_french_services} onChange={handleInputChange} />
                    <div className="flex-1">
                        <span className="font-bold text-slate-900 block mb-1">French-Language Services</span>
                        <span className="text-sm text-slate-600">I want the Board to provide services in French.</span>
                    </div>
                </label>

                <div className="section-header">Request for Accommodation</div>
                <div className={`checkbox-card flex-col items-stretch gap-4 ${formData.request_accommodation ? 'active' : ''}`}>
                    <label className="flex gap-4 cursor-pointer">
                        <input type="checkbox" name="request_accommodation" checked={formData.request_accommodation} onChange={handleInputChange} />
                        <div className="flex-1">
                            <span className="font-bold text-slate-900 block mb-1">Human Rights Code Accommodation</span>
                            <span className="text-sm text-slate-600">I require accommodation under the Ontario Human Rights Code.</span>
                        </div>
                    </label>
                    {formData.request_accommodation && (
                        <div className="input-group pt-4 border-t border-blue-100">
                            <label className="input-label">Explain the accommodation required:</label>
                            <textarea name="accommodation_explain" value={formData.accommodation_explain} onChange={handleInputChange} className="min-h-[200px]" placeholder="Please describe the specific arrangements needed..."></textarea>
                        </div>
                    )}
                </div>
            </div>

            {/* PAGE 10 */}
            <div className="page">
                <div className="hdr">
                    <div className="left">
                        <div className="hdr-title">Application about Maintenance</div>
                        <div className="hdr-subtitle">FORM T6 • Payment Information</div>
                    </div>
                    <div className="right text-slate-400 font-bold text-sm">Page 10 of 10</div>
                </div>

                <div className="section-header">Part 5: Payment Information</div>

                <div className="info-box mb-8 text-sm italic">
                    Shade the box completely next to the method you are using to pay the fee.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { name: 'pay_money_order', label: 'Money Order' },
                        { name: 'pay_certified_cheque', label: 'Certified Cheque' },
                        { name: 'pay_credit_card', label: 'Credit Card' }
                    ].map(method => (
                        <label key={method.name} className={`checkbox-card h-32 flex-col justify-center items-center text-center ${formData[method.name as keyof typeof formData] ? 'active' : ''}`}>
                            <input type="checkbox" name={method.name} checked={formData[method.name as keyof typeof formData] as boolean} onChange={handleInputChange} />
                            <span className="font-bold text-slate-900 mt-2">{method.label}</span>
                        </label>
                    ))}
                </div>

                <div className="info-box bg-slate-50 border-slate-300">
                    <div className="space-y-4 text-slate-600">
                        <p className="flex gap-3"><span className="text-blue-600 font-bold">•</span> Money orders and certified cheques must be made payable to the <strong>"Minister of Finance"</strong>.</p>
                        <p className="flex gap-3"><span className="text-blue-600 font-bold">•</span> If you are paying by credit card, you must also complete the <strong>Credit Card Payment Form</strong> and submit it along with your application.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
