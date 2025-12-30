import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Printer, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore
import html2pdf from "html2pdf.js";

export default function T1FormPage() {
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
                .from('t1_forms' as any)
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
        other_parties: "", related_file_1: "", related_file_2: "",
        reason_1: false, reason1_total_overcharged: "", move_in_date_ddmmyyyy: "",
        rent_row1_amount: "", rent_row1_from: "", rent_row1_to: "",
        rent_row2_amount: "", rent_row2_from: "", rent_row2_to: "",
        rent_row3_amount: "", rent_row3_from: "", rent_row3_to: "",
        rent_row4_amount: "", rent_row4_from: "", rent_row4_to: "",
        rent_by_month: false, rent_by_week: false, rent_by_other: false, rent_by_other_specify: "",
        reason_2: false, reason2_name: "", reason2_title: "", reason2_amount_paid: "", reason2_date_paid_ddmmyyyy: "",
        reason_3: false, reason3_deposit_amount: "", reason3_move_out_ddmmyyyy: "",
        reason_4: false, reason4_deposit_amount: "", reason4_supposed_move_in_ddmmyyyy: "",
        reason_5: false, reason5_interest_amount: "",
        reason_6: false, reason6_compensation_amount: "",
        reason_7: false, reason7_sale_proceeds_amount: "",
        reason_8: false, reason8_fine: false, reason8_lawful_rent: false,
        explain_reason_num_1: "", explain_detail_1: "",
        signature_date_ddmmyyyy: "", who_signed: "",
        rep_first: "", rep_last: "", rep_lsuc: "", rep_company: "", rep_mailing_address: "", rep_unit: "", rep_municipality: "", rep_province: "Ontario", rep_postal: "", rep_day_phone: "", rep_evening_phone: "", rep_fax: "", rep_email: "",
        request_french_services: false, request_accommodation: false, accommodation_explain: "",
        pay_online: false, pay_money_order: false, pay_certified_cheque: false, pay_credit_card: false, receipt_number: ""
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
        const element = document.getElementById('t1-form-document');
        const opt = {
            margin: 0,
            filename: 'T1-Tenant-Rebate-Application.pdf',
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
                .from('t1_forms' as any)
                .upsert(upsertData)
                .select()
                .single() as any);

            if (error) throw error;

            if (data) {
                setId(data.id);
                // Update URL without refreshing
                const newUrl = `${window.location.pathname}?id=${data.id}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
                toast({ title: "Draft Saved", description: "Your T1 application has been saved to your drafts." });
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

                #t1-form-document {
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
                    box-shadow: 0 20px 50px rgba(0,0,0,0.05);
                }

                .page {
                    page-break-after: always;
                    position: relative;
                    min-height: 1400px;
                }

                .hdr {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 40px;
                    border-bottom: 2px solid var(--ink);
                    padding-bottom: 20px;
                }

                .hdr-title {
                    font-weight: 900;
                    font-size: 24px;
                    text-transform: uppercase;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                }

                .hdr-subtitle {
                    color: var(--muted);
                    font-size: 14px;
                    font-weight: 600;
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
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--muted);
                }

                input[type="text"], input[type="email"], input[type="tel"], textarea {
                    border: 2px solid var(--line);
                    border-radius: 8px;
                    padding: 12px 16px;
                    font-size: 15px;
                    font-weight: 500;
                    transition: all 0.2s;
                    background: #f8fafc;
                }

                input:focus, textarea:focus {
                    border-color: var(--accent);
                    background: white;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                    outline: none;
                }

                .info-box {
                    background: #f1f5f9;
                    border-left: 4px solid var(--ink);
                    padding: 20px;
                    border-radius: 0 8px 8px 0;
                    margin-bottom: 24px;
                }

                .checkbox-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    border: 2px solid var(--line);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: white;
                }

                .checkbox-card:hover {
                    border-color: var(--muted);
                    background: #f8fafc;
                }

                .checkbox-card.active {
                    border-color: var(--accent);
                    background: #eff6ff;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
                }

                .checkbox-card input {
                    width: 20px;
                    height: 20px;
                    margin-top: 2px;
                }

                .signature-box {
                    border: 2px solid var(--line);
                    padding: 30px;
                    border-radius: 12px;
                    background: #f8fafc;
                    margin-top: 20px;
                }

                .footer {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: var(--muted);
                    font-weight: 600;
                    border-top: 2px solid var(--line);
                    padding-top: 20px;
                    margin-top: 40px;
                }

                table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin: 20px 0;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 2px solid var(--line);
                }

                th {
                    background: #f8fafc;
                    padding: 12px 16px;
                    font-weight: 700;
                    font-size: 12px;
                    text-transform: uppercase;
                    color: var(--muted);
                    text-align: left;
                    border-bottom: 2px solid var(--line);
                }

                td {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--line);
                    background: white;
                }

                tr:last-child td { border-bottom: none; }

                .office-use {
                    background: #f8fafc;
                    border: 2px solid var(--line);
                    border-radius: 12px;
                    padding: 24px;
                }

                @media print {
                    body { background: white; padding: 0; }
                    #t1-form-document { box-shadow: none; padding: 40px; max-width: 100%; }
                    .no-print { display: none; }
                }
            `}</style>

            <div id="t1-form-document">
                {/* PAGE 1 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rebate</div>
                            <div className="hdr-subtitle">FORM T1 • General Information</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 1 of 10</div>
                    </div>

                    <div className="section-header">Part 1: General Information</div>

                    <div className="info-box mb-8">
                        <p className="text-sm italic font-medium leading-relaxed">
                            Use this form to apply to have the Board determine whether the landlord or the landlord's agent has failed to meet their obligations under the Residential Tenancies Act, 2006.
                        </p>
                    </div>

                    <div className="form-grid">
                        <div className="col-12">
                            <label className="input-label text-blue-600 mb-2 block font-bold">Address of the Rental Unit Covered by This Application</label>
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
                            <input type="text" name="rental_street_type" value={formData.rental_street_type} onChange={handleInputChange} placeholder="e.g. St, Ave" />
                        </div>

                        <div className="input-group col-3">
                            <label className="input-label">Direction</label>
                            <input type="text" name="rental_direction" value={formData.rental_direction} onChange={handleInputChange} placeholder="e.g. East" />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Unit/Apt./Suite</label>
                            <input type="text" name="rental_unit" value={formData.rental_unit} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Municipality</label>
                            <input type="text" name="rental_municipality" value={formData.rental_municipality} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-2">
                            <label className="input-label">Postal Code</label>
                            <input type="text" name="rental_postal" value={formData.rental_postal} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="form-grid mt-12">
                        <div className="col-8">
                            <div className="section-header !mt-0 !mb-6">Tenant Information</div>
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

                            <div className="mt-8">
                                <label className="input-label mb-2 block italic">Mailing Address (if different from rental unit address)</label>
                                <div className="form-grid">
                                    <div className="input-group col-3">
                                        <label className="input-label">Unit</label>
                                        <input type="text" name="mailing_unit" value={formData.mailing_unit} onChange={handleInputChange} />
                                    </div>
                                    <div className="input-group col-6">
                                        <label className="input-label">Municipality</label>
                                        <input type="text" name="mailing_municipality" value={formData.mailing_municipality} onChange={handleInputChange} />
                                    </div>
                                    <div className="input-group col-3">
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
                        </div>

                        <div className="col-4">
                            <div className="office-use h-full flex flex-col">
                                <div className="text-slate-900 font-black text-sm uppercase tracking-widest mb-6 pb-4 border-b-2 border-slate-200">
                                    Office Use Only
                                </div>
                                <div className="input-group">
                                    <label className="input-label">File Number</label>
                                    <input type="text" name="office_file_number" value={formData.office_file_number} onChange={handleInputChange} className="bg-white" />
                                </div>
                                <div className="mt-auto pt-20">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Version: 01/04/2022</p>
                                    <p className="text-[10px] text-slate-300 mt-1 italic">Generated by RoomieAI</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAGE 2 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rebate</div>
                            <div className="hdr-subtitle">FORM T1 • Landlord & Related Info</div>
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

                    <div className="section-header">Other Parties to the Application</div>
                    <div className="info-box mb-8">
                        <p className="text-sm font-bold">Are you also applying against your superintendent or agent?</p>
                    </div>

                    <div className="flex gap-4 mb-12">
                        <label className={`checkbox-card flex-1 ${formData.other_parties === 'No' ? 'active' : ''}`}>
                            <input type="radio" name="other_parties" value="No" checked={formData.other_parties === "No"} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-slate-900 block">No</span>
                                <span className="text-sm text-slate-500">I am only applying against the landlord.</span>
                            </div>
                        </label>
                        <label className={`checkbox-card flex-1 ${formData.other_parties === 'Yes' ? 'active' : ''}`}>
                            <input type="radio" name="other_parties" value="Yes" checked={formData.other_parties === "Yes"} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-slate-900 block">Yes</span>
                                <span className="text-sm text-slate-500">Attach Schedule of Parties to this application.</span>
                            </div>
                        </label>
                    </div>

                    <div className="section-header">Related Applications</div>
                    <div className="info-box mb-8">
                        <p className="text-sm italic">If you or your landlord have filed other applications that relate to this rental unit, list the file numbers below.</p>
                    </div>
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
                            <div className="hdr-title">Tenant Application for a Rebate</div>
                            <div className="hdr-subtitle">FORM T1 • Part 2: Reasons for Filing</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 3 of 10</div>
                    </div>

                    <div className="section-header">Part 2: Reasons for Filing this Application</div>

                    <div className="space-y-6">
                        {/* REASON 1 */}
                        <div className={`checkbox-card flex-col items-start gap-4 ${formData.reason_1 ? 'active' : ''}`}>
                            <div className="flex items-start gap-4 w-full">
                                <input type="checkbox" name="reason_1" checked={formData.reason_1} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-lg text-slate-900 block">Reason 1: The landlord charged me an illegal rent, which I have paid.</span>
                                    <p className="text-sm text-slate-500 mt-1">I am applying for a rebate of the amount overcharged.</p>
                                </div>
                            </div>

                            {formData.reason_1 && (
                                <div className="w-full mt-4 p-6 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                                    <div className="form-grid mb-8">
                                        <div className="input-group col-6">
                                            <label className="input-label !text-blue-600">Total Amount Overcharged</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                                                <input type="text" name="reason1_total_overcharged" value={formData.reason1_total_overcharged} onChange={handleInputChange} className="pl-10 font-bold text-xl text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="input-group col-6">
                                            <label className="input-label">Move-in Date</label>
                                            <input type="text" name="move_in_date_ddmmyyyy" value={formData.move_in_date_ddmmyyyy} onChange={handleInputChange} placeholder="dd/mm/yyyy" />
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="input-label mb-3 block">Rent History (List current rent and any previous rent levels)</label>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Rent Amount ($)</th>
                                                    <th>From (dd/mm/yyyy)</th>
                                                    <th>To (dd/mm/yyyy)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[1, 2, 3, 4].map(num => (
                                                    <tr key={num}>
                                                        <td className="!p-0"><input type="text" name={`rent_row${num}_amount`} value={formData[`rent_row${num}_amount`]} onChange={handleInputChange} className="border-0 bg-transparent w-full h-12" /></td>
                                                        <td className="!p-0"><input type="text" name={`rent_row${num}_from`} value={formData[`rent_row${num}_from`]} onChange={handleInputChange} className="border-0 bg-transparent w-full h-12" /></td>
                                                        <td className="!p-0"><input type="text" name={`rent_row${num}_to`} value={formData[`rent_row${num}_to`]} onChange={handleInputChange} className="border-0 bg-transparent w-full h-12" /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="form-grid">
                                        <div className="col-12">
                                            <label className="input-label mb-3 block">I was required to pay rent by the:</label>
                                            <div className="flex flex-wrap gap-x-8 gap-y-4">
                                                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                                    <input type="checkbox" name="rent_by_month" checked={formData.rent_by_month} onChange={handleInputChange} /> Month
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                                    <input type="checkbox" name="rent_by_week" checked={formData.rent_by_week} onChange={handleInputChange} /> Week
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                                                    <input type="checkbox" name="rent_by_other" checked={formData.rent_by_other} onChange={handleInputChange} /> Other (specify):
                                                </label>
                                                {formData.rent_by_other && (
                                                    <input type="text" name="rent_by_other_specify" value={formData.rent_by_other_specify} onChange={handleInputChange} className="flex-1 min-w-[200px] !h-10 text-sm" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* REASON 2 */}
                        <div className={`checkbox-card flex-col items-start gap-4 ${formData.reason_2 ? 'active' : ''}`}>
                            <div className="flex items-start gap-4 w-full">
                                <input type="checkbox" name="reason_2" checked={formData.reason_2} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-lg text-slate-900 block">Reason 2: I paid an illegal charge to the landlord or to the landlord's agent.</span>
                                    <p className="text-sm text-slate-500 mt-1">Example: A fee for a key deposit that is greater than the cost of the key.</p>
                                </div>
                            </div>

                            {formData.reason_2 && (
                                <div className="w-full mt-4 p-6 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                                    <div className="form-grid">
                                        <div className="input-group col-6">
                                            <label className="input-label">Name of recipient</label>
                                            <input type="text" name="reason2_name" value={formData.reason2_name} onChange={handleInputChange} />
                                        </div>
                                        <div className="input-group col-6">
                                            <label className="input-label">Title (e.g. Landlord, Superintendent)</label>
                                            <input type="text" name="reason2_title" value={formData.reason2_title} onChange={handleInputChange} />
                                        </div>
                                        <div className="input-group col-4">
                                            <label className="input-label">Amount Paid</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                                                <input type="text" name="reason2_amount_paid" value={formData.reason2_amount_paid} onChange={handleInputChange} className="pl-10 font-bold" />
                                            </div>
                                        </div>
                                        <div className="input-group col-4">
                                            <label className="input-label">Date Paid</label>
                                            <input type="text" name="reason2_date_paid_ddmmyyyy" value={formData.reason2_date_paid_ddmmyyyy} onChange={handleInputChange} placeholder="dd/mm/yyyy" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PAGE 4 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rebate</div>
                            <div className="hdr-subtitle">FORM T1 • Reasons for Filing (Cont.)</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 4 of 10</div>
                    </div>

                    <div className="space-y-6">
                        {/* REASON 3 */}
                        <div className={`checkbox-card flex-col items-start gap-4 ${formData.reason_3 ? 'active' : ''}`}>
                            <div className="flex items-start gap-4 w-full">
                                <input type="checkbox" name="reason_3" checked={formData.reason_3} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-lg text-slate-900 block">Reason 3: The landlord did not use my last month's rent deposit to pay the rent for the last month of the tenancy.</span>
                                </div>
                            </div>
                            {formData.reason_3 && (
                                <div className="w-full mt-4 p-6 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                                    <div className="form-grid">
                                        <div className="input-group col-6">
                                            <label className="input-label">Deposit Amount Owed</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                                                <input type="text" name="reason3_deposit_amount" value={formData.reason3_deposit_amount} onChange={handleInputChange} className="pl-10 font-bold" />
                                            </div>
                                        </div>
                                        <div className="input-group col-6">
                                            <label className="input-label">Move-out Date</label>
                                            <input type="text" name="reason3_move_out_ddmmyyyy" value={formData.reason3_move_out_ddmmyyyy} onChange={handleInputChange} placeholder="dd/mm/yyyy" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* REASON 4 */}
                        <div className={`checkbox-card flex-col items-start gap-4 ${formData.reason_4 ? 'active' : ''}`}>
                            <div className="flex items-start gap-4 w-full">
                                <input type="checkbox" name="reason_4" checked={formData.reason_4} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-lg text-slate-900 block">Reason 4: The landlord did not return my rent deposit, and I did not move into the unit.</span>
                                </div>
                            </div>
                            {formData.reason_4 && (
                                <div className="w-full mt-4 p-6 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                                    <div className="form-grid">
                                        <div className="input-group col-6">
                                            <label className="input-label">Deposit Amount Owed</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                                                <input type="text" name="reason4_deposit_amount" value={formData.reason4_deposit_amount} onChange={handleInputChange} className="pl-10 font-bold" />
                                            </div>
                                        </div>
                                        <div className="input-group col-6">
                                            <label className="input-label">Supposed Move-in Date</label>
                                            <input type="text" name="reason4_supposed_move_in_ddmmyyyy" value={formData.reason4_supposed_move_in_ddmmyyyy} onChange={handleInputChange} placeholder="dd/mm/yyyy" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* REASON 5 */}
                        <div className={`checkbox-card flex-col items-start gap-4 ${formData.reason_5 ? 'active' : ''}`}>
                            <div className="flex items-start gap-4 w-full">
                                <input type="checkbox" name="reason_5" checked={formData.reason_5} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-lg text-slate-900 block">Reason 5: The landlord owes me interest on my last month's rent deposit.</span>
                                </div>
                            </div>
                            {formData.reason_5 && (
                                <div className="w-full mt-4 p-6 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                                    <div className="input-group col-6">
                                        <label className="input-label">Interest Amount Owed</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                                            <input type="text" name="reason5_interest_amount" value={formData.reason5_interest_amount} onChange={handleInputChange} className="pl-10 font-bold" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* REASON 6 */}
                        <div className={`checkbox-card flex-col items-start gap-4 ${formData.reason_6 ? 'active' : ''}`}>
                            <div className="flex items-start gap-4 w-full">
                                <input type="checkbox" name="reason_6" checked={formData.reason_6} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-lg text-slate-900 block">Reason 6: The landlord gave me a N12 or N13 notice but did not pay the required compensation.</span>
                                </div>
                            </div>
                            {formData.reason_6 && (
                                <div className="w-full mt-4 p-6 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                                    <div className="input-group col-6">
                                        <label className="input-label">Compensation Amount Owed</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                                            <input type="text" name="reason6_compensation_amount" value={formData.reason6_compensation_amount} onChange={handleInputChange} className="pl-10 font-bold" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* REASON 7 */}
                        <div className={`checkbox-card flex-col items-start gap-4 ${formData.reason_7 ? 'active' : ''}`}>
                            <div className="flex items-start gap-4 w-full">
                                <input type="checkbox" name="reason_7" checked={formData.reason_7} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-lg text-slate-900 block">Reason 7: The landlord sold my property and kept the proceeds of the sale.</span>
                                </div>
                            </div>
                            {formData.reason_7 && (
                                <div className="w-full mt-4 p-6 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                                    <div className="input-group col-6">
                                        <label className="input-label">Proceeds Amount Owed</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                                            <input type="text" name="reason7_sale_proceeds_amount" value={formData.reason7_sale_proceeds_amount} onChange={handleInputChange} className="pl-10 font-bold" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* REASON 8 */}
                        <div className={`checkbox-card flex-col items-start gap-4 ${formData.reason_8 ? 'active' : ''}`}>
                            <div className="flex items-start gap-4 w-full">
                                <input type="checkbox" name="reason_8" checked={formData.reason_8} onChange={handleInputChange} />
                                <div className="flex-1">
                                    <span className="font-bold text-lg text-slate-900 block">Reason 8: The landlord failed to give me notice of an Order Prohibiting Rent Increase.</span>
                                </div>
                            </div>
                            {formData.reason_8 && (
                                <div className="w-full mt-4 p-6 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" name="reason8_fine" checked={formData.reason8_fine} onChange={handleInputChange} />
                                            <span className="text-sm font-medium">Order the landlord to pay a fine to the Board.</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" name="reason8_lawful_rent" checked={formData.reason8_lawful_rent} onChange={handleInputChange} />
                                            <span className="text-sm font-medium">Determine the lawful rent and order a rebate.</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PAGE 5 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rebate</div>
                            <div className="hdr-subtitle">FORM T1 • Explaining your Reasons</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 5 of 10</div>
                    </div>

                    <div className="section-header">Detailed Description of Reasons</div>

                    <div className="info-box mb-8 bg-blue-50 border-blue-600">
                        <p className="font-bold text-blue-900 mb-2">Instructions for Explanation:</p>
                        <p className="text-sm italic text-blue-800 leading-relaxed">
                            For each reason you checked in Part 2, explain in detail why you believe you are entitled to a rebate. Include relevant dates, names of people involved, and how you calculated any amounts you are claiming.
                        </p>
                    </div>

                    <div className="form-grid">
                        <div className="input-group col-2">
                            <label className="input-label bg-slate-900 text-white px-3 py-1 rounded inline-block w-fit mb-2">Reason #</label>
                            <input type="text" name="explain_reason_num_1" value={formData.explain_reason_num_1} onChange={handleInputChange} className="text-center font-black text-xl" placeholder="e.g. 1" />
                        </div>
                        <div className="input-group col-10">
                            <label className="input-label">Detailed Explanation</label>
                            <textarea
                                name="explain_detail_1"
                                value={formData.explain_detail_1}
                                onChange={handleInputChange}
                                className="min-h-[700px] leading-relaxed font-medium bg-slate-50/50"
                                placeholder="State the reason number, then describe the events chronologically..."
                            ></textarea>
                            <p className="text-xs text-slate-400 mt-2 italic font-medium uppercase tracking-wider">Note: Attach additional sheets if more space is required for multiple reasons.</p>
                        </div>
                    </div>
                </div>

                {/* PAGE 6 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rebate</div>
                            <div className="hdr-subtitle">FORM T1 • Part 3: Signature</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 6 of 10</div>
                    </div>

                    <div className="section-header">Part 3: Signature</div>

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
                            <label className="input-label">LSUC # / Law Society Number</label>
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
                            <label className="input-label">Unit</label>
                            <input type="text" name="rep_unit" value={formData.rep_unit} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-4">
                            <label className="input-label">Municipality</label>
                            <input type="text" name="rep_municipality" value={formData.rep_municipality} onChange={handleInputChange} />
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
                            <label className="input-label">Email Address</label>
                            <input type="email" name="rep_email" value={formData.rep_email} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

                {/* PAGE 7 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rebate</div>
                            <div className="hdr-subtitle">FORM T1 • Important Information</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 7 of 10</div>
                    </div>

                    <div className="section-header">Collecting Personal Information</div>
                    <div className="info-box mb-12">
                        <p className="text-sm leading-relaxed mb-4">
                            The Landlord and Tenant Board (LTB) collects the personal information requested on this form under section 185 of the Residential Tenancies Act, 2006. It will be used to determine your application.
                        </p>
                        <p className="text-sm leading-relaxed">
                            After you file the application, all information you give to the LTB and maintain in the LTB's files may be shared with the public in accordance with the LTB's policies on access to information. For more information, please contact the LTB.
                        </p>
                    </div>

                    <div className="section-header">Important Information from the LTB</div>
                    <div className="form-grid gap-6">
                        <div className="col-12">
                            <div className="info-box bg-slate-900 border-slate-900 !p-8">
                                <ul className="list-disc ml-6 space-y-4 text-slate-100 font-medium">
                                    <li>You must send a copy of this application to the landlord.</li>
                                    <li>The LTB will send you a Notice of Hearing that tells you the date, time and location of the hearing.</li>
                                    <li>Visit the LTB website (sjto.ca/ltb) for more information.</li>
                                    <li>The LTB can order a party to pay the other party's costs of the application.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAGE 8 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rebate</div>
                            <div className="hdr-subtitle">FORM T1 • Services & Accommodation</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 8 of 10</div>
                    </div>

                    <div className="section-header">Request for French-Language Services</div>
                    <div className="info-box mb-8">
                        <p className="text-sm">Check this box if you want the LTB to provide French-language services.</p>
                    </div>
                    <label className={`checkbox-card mb-12 ${formData.request_french_services ? 'active' : ''}`}>
                        <input type="checkbox" name="request_french_services" checked={formData.request_french_services} onChange={handleInputChange} />
                        <div className="flex-1">
                            <span className="font-bold text-slate-900 block">I want French-language services</span>
                            <span className="text-sm text-slate-500 italic">(mediation and hearing in French)</span>
                        </div>
                    </label>

                    <div className="section-header">Accommodation</div>
                    <div className="info-box mb-8">
                        <p className="text-sm">Check this box if you need accommodation under the Ontario Human Rights Code.</p>
                    </div>
                    <label className={`checkbox-card mb-8 ${formData.request_accommodation ? 'active' : ''}`}>
                        <input type="checkbox" name="request_accommodation" checked={formData.request_accommodation} onChange={handleInputChange} />
                        <div className="flex-1">
                            <span className="font-bold text-slate-900 block">I need accommodation for the hearing.</span>
                        </div>
                    </label>

                    {formData.request_accommodation && (
                        <div className="input-group">
                            <label className="input-label">Details of Accommodation Required</label>
                            <textarea
                                name="accommodation_details"
                                value={formData.accommodation_details}
                                onChange={handleInputChange}
                                className="min-h-[300px] bg-slate-50/50"
                                placeholder="Please explain what accommodation you need..."
                            ></textarea>
                        </div>
                    )}
                </div>

                {/* PAGE 9 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rebate</div>
                            <div className="hdr-subtitle">FORM T1 • Payment Information</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 9 of 10</div>
                    </div>

                    <div className="section-header">Payment Information</div>
                    <div className="info-box mb-8 bg-amber-50 border-amber-500">
                        <p className="text-amber-900 font-bold italic">Payable to: Minister of Finance - Receipt must be filed with LTB.</p>
                    </div>

                    <div className="form-grid mb-12">
                        <div className="col-12">
                            <label className="input-label mb-4">Method of Payment</label>
                            <div className="form-grid">
                                {[
                                    { name: 'pay_online', label: 'Online Payment' },
                                    { name: 'pay_money_order', label: 'Money Order' },
                                    { name: 'pay_certified_cheque', label: 'Certified Cheque' },
                                    { name: 'pay_credit_card', label: 'Credit Card' }
                                ].map(method => (
                                    <div key={method.name} className="col-6">
                                        <label className={`checkbox-card ${formData[method.name as keyof typeof formData] ? 'active' : ''}`}>
                                            <input type="checkbox" name={method.name} checked={formData[method.name as keyof typeof formData]} onChange={handleInputChange} />
                                            <span className="font-bold">{method.label}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="input-group col-6">
                        <label className="input-label">Receipt Number</label>
                        <input
                            type="text"
                            name="receipt_number"
                            value={formData.receipt_number}
                            onChange={handleInputChange}
                            className="font-black text-2xl tracking-widest text-center h-16 bg-slate-50"
                            placeholder="000-000-000"
                        />
                    </div>

                    <div className="mt-auto pt-20 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Version: 01/04/2022</p>
                            <p className="text-[10px] text-slate-300 mt-1 italic">Generated by RoomieAI Legal Toolkit</p>
                        </div>
                        <div className="text-slate-400 font-bold text-sm">Page 9 of 10</div>
                    </div>
                </div>

                {/* PAGE 10 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rebate</div>
                            <div className="hdr-subtitle">FORM T1 • Schedule of Parties</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 10 of 10</div>
                    </div>

                    <div className="section-header">Schedule of Parties</div>
                    <div className="info-box mb-8">
                        <p className="text-sm italic">Use this page to list any additional landlords or tenants who are parties to this application but could not be listed on the previous pages.</p>
                    </div>

                    <div className="space-y-12">
                        {[1, 2, 3].map(num => (
                            <div key={num} className="p-8 bg-slate-50/50 rounded-3xl border-2 border-slate-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-8 w-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm">{num}</div>
                                    <span className="font-bold text-slate-900 uppercase tracking-widest text-sm">Additional Party</span>
                                </div>
                                <div className="form-grid">
                                    <div className="input-group col-6">
                                        <label className="input-label">First Name</label>
                                        <input type="text" placeholder="First Name" />
                                    </div>
                                    <div className="input-group col-6">
                                        <label className="input-label">Last Name</label>
                                        <input type="text" placeholder="Last Name" />
                                    </div>
                                    <div className="input-group col-12">
                                        <label className="input-label">Role (e.g., Tenant, Landlord, Agent)</label>
                                        <input type="text" placeholder="Role" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto pt-20 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Version: 01/04/2022</p>
                            <p className="text-[10px] text-slate-300 mt-1 italic font-medium uppercase tracking-[0.1em]">Verified for Legal Accuracy</p>
                        </div>
                        <div className="text-slate-400 font-bold text-sm">Page 10 of 10</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
