import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Printer, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// @ts-ignore
import html2pdf from "html2pdf.js";

export default function T3FormPage() {
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
                .from('t3_forms' as any)
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
        related_file_1: "", related_file_2: "",
        reason_1: false,
        service_desc_1: "", service_change_1: "", service_change_date_1_ddmmyyyy: "",
        service_desc_2: "", service_change_2: "", service_change_date_2_ddmmyyyy: "",
        service_desc_3: "", service_change_3: "", service_change_date_3_ddmmyyyy: "",
        move_in_date_ddmmyyyy: "",
        rent_row1_amount: "", rent_row1_from: "", rent_row1_to: "",
        rent_row2_amount: "", rent_row2_from: "", rent_row2_to: "",
        rent_row3_amount: "", rent_row3_from: "", rent_row3_to: "",
        rent_row4_amount: "", rent_row4_from: "", rent_row4_to: "",
        rent_by_month: false, rent_by_week: false, rent_by_other: false, rent_by_other_specify: "",
        reason_2: false,
        base_year_yyyy: "", base_year_total_taxes: "",
        reference_year_yyyy: "", reference_year_total_taxes: "",
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
        const element = document.getElementById('t3-form-document');
        const opt = {
            margin: 0,
            filename: 'T3-Rent-Reduction-Application.pdf',
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
                .from('t3_forms' as any)
                .upsert(upsertData)
                .select()
                .single() as any);

            if (error) throw error;

            if (data) {
                setId(data.id);
                // Update URL without refreshing
                const newUrl = `${window.location.pathname}?id=${data.id}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
                toast({ title: "Draft Saved", description: "Your T3 application has been saved to your drafts." });
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error saving draft", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            {/* Controls */}
            <div className="max-w-[1200px] mx-auto mb-8 flex items-center justify-between no-print">
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
                    <Button onClick={handleSave} disabled={isLoading} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-6 rounded-xl shadow-xl transition-all active:scale-95">
                        <Save className="h-5 w-5" /> {isLoading ? "Saving..." : "Save Draft"}
                    </Button>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                #t3-form-document {
                    --bg-primary: #ffffff;
                    --bg-secondary: #f8fafc;
                    --text-main: #0f172a;
                    --text-muted: #64748b;
                    --accent: #2563eb;
                    --border: #e2e8f0;
                    --ink: #111;
                    
                    background: var(--bg-primary);
                    color: var(--text-main);
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    font-size: 13px;
                    line-height: 1.5;
                    margin: 0 auto;
                    max-width: 1200px;
                    padding: 60px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
                }

                .page {
                    page-break-after: always;
                    margin-bottom: 60px;
                    position: relative;
                    min-height: 1000px;
                    display: flex;
                    flex-direction: column;
                }

                .hdr {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 4px solid var(--text-main);
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }

                .hdr-title {
                    font-weight: 900;
                    font-size: 24px;
                    text-transform: uppercase;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }

                .hdr-subtitle {
                    font-weight: 700;
                    font-size: 16px;
                    color: var(--accent);
                    margin-top: 4px;
                }

                .section-header {
                    background: var(--text-main);
                    color: white;
                    padding: 12px 20px;
                    font-weight: 800;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 40px 0 20px 0;
                    border-radius: 4px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
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

                .input-label {
                    font-weight: 700;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                    color: var(--text-muted);
                }

                input[type="text"], 
                input[type="email"], 
                input[type="tel"], 
                textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid var(--border);
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-main);
                    transition: all 0.2s;
                    background: var(--bg-secondary);
                }

                input:focus, textarea:focus {
                    outline: none;
                    border-color: var(--accent);
                    background: white;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }

                .checkbox-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    border: 2px solid var(--border);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: white;
                }

                .checkbox-card:hover {
                    border-color: var(--accent);
                    background: var(--bg-secondary);
                }

                .checkbox-card.active {
                    border-color: var(--accent);
                    background: rgba(37, 99, 235, 0.05);
                }

                .checkbox-card input[type="checkbox"], 
                .checkbox-card input[type="radio"] {
                    width: 20px;
                    height: 20px;
                    margin-top: 2px;
                }

                .info-box {
                    background: var(--bg-secondary);
                    border-left: 4px solid var(--text-main);
                    padding: 24px;
                    border-radius: 0 12px 12px 0;
                    margin: 20px 0;
                }

                .signature-box {
                    border: 2px solid var(--text-main);
                    padding: 30px;
                    border-radius: 12px;
                    background: white;
                }

                table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin: 20px 0;
                }

                th {
                    background: var(--text-main);
                    color: white;
                    padding: 12px 16px;
                    font-weight: 700;
                    font-size: 11px;
                    text-transform: uppercase;
                    text-align: left;
                }

                td {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border);
                    border-right: 1px solid var(--border);
                }
                
                td:first-child { border-left: 1px solid var(--border); }

                @media print {
                    body { background: white; padding: 0; }
                    #t3-form-document { box-shadow: none; padding: 40px; }
                    .no-print { display: none; }
                    .page { margin-bottom: 0; page-break-after: always; }
                }
            `}</style>

            <div id="t3-form-document">
                {/* PAGE 1 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rent Reduction</div>
                            <div className="hdr-subtitle">FORM T3 • General Information</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm text-right">
                            Read the instructions carefully before completing <br /> this form. Print or type in capital letters.
                            <br /><br />
                            Page 1 of 8
                        </div>
                    </div>

                    <div className="section-header">Part 1: General Information</div>

                    <div className="info-box mb-6">
                        <p className="font-bold text-slate-900 mb-1">Address of the Rental Unit Covered by This Application</p>
                        <p className="text-sm text-slate-500 italic">Provide the full address of the unit where the rent reduction is requested.</p>
                    </div>

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
                            <input type="text" name="rental_street_type" value={formData.rental_street_type} onChange={handleInputChange} />
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

                    <div className="form-grid mt-12">
                        <div className="col-8">
                            <div className="section-header !mt-0 !bg-slate-700">Tenant Names and Address</div>
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

                            <div className="input-group mt-8">
                                <label className="input-label italic underline">Mailing Address (if different from rental unit address)</label>
                                <div className="form-grid mt-2">
                                    <div className="input-group col-3">
                                        <label className="input-label">Unit</label>
                                        <input type="text" name="mailing_unit" value={formData.mailing_unit} onChange={handleInputChange} />
                                    </div>
                                    <div className="input-group col-3">
                                        <label className="input-label">Municipality</label>
                                        <input type="text" name="mailing_municipality" value={formData.mailing_municipality} onChange={handleInputChange} />
                                    </div>
                                    <div className="input-group col-3">
                                        <label className="input-label">Prov.</label>
                                        <input type="text" name="mailing_province" value={formData.mailing_province} onChange={handleInputChange} />
                                    </div>
                                    <div className="input-group col-3">
                                        <label className="input-label">Postal</label>
                                        <input type="text" name="mailing_postal" value={formData.mailing_postal} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-4">
                            <div className="p-8 border-4 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 h-full">
                                <div className="text-center font-black text-slate-300 uppercase tracking-widest text-xs mb-6">Office Use Only</div>
                                <div className="input-group">
                                    <label className="input-label">File Number</label>
                                    <input type="text" name="office_file_number" value={formData.office_file_number} onChange={handleInputChange} className="font-black text-center text-xl h-16 bg-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAGE 2 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rent Reduction</div>
                            <div className="hdr-subtitle">FORM T3 • Reasons for Filing</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 2 of 8</div>
                    </div>

                    <div className="section-header">Landlord's Name and Address</div>
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
                    </div>

                    <div className="section-header !bg-slate-600">Related Applications</div>
                    <div className="info-box">
                        <p className="text-sm">If there are any other applications related to this rental unit, provide the file numbers below.</p>
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

                    <div className="section-header">Part 2: Reasons for Filing</div>

                    <div className={`checkbox-card flex-col items-start gap-6 ${formData.reason_1 ? 'active' : ''}`}>
                        <div className="flex items-start gap-4 w-full">
                            <input type="checkbox" name="reason_1" checked={formData.reason_1} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-lg text-slate-900 block">Reason 1: The landlord reduced or discontinued a service or facility in the last 12 months.</span>
                                <span className="text-sm text-slate-500 mt-1 block italic">Requirement: Provide details for each service or facility below.</span>
                            </div>
                        </div>

                        {formData.reason_1 && (
                            <div className="w-full mt-4 bg-white rounded-xl border-2 border-slate-100 overflow-hidden shadow-sm">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="w-[40%]">Describe the Service or Facility</th>
                                            <th className="w-[30%]">Type of Change</th>
                                            <th className="w-[30%] text-center">Date of Change (dd/mm/yyyy)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[1, 2, 3].map(num => (
                                            <tr key={num}>
                                                <td className="!p-2">
                                                    <input
                                                        type="text"
                                                        name={`service_desc_${num}`}
                                                        value={formData[`service_desc_${num}`]}
                                                        onChange={handleInputChange}
                                                        className="border-0 bg-transparent font-medium"
                                                        placeholder="e.g. Parking space..."
                                                    />
                                                </td>
                                                <td className="!p-2">
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <input
                                                                type="radio"
                                                                name={`service_change_${num}`}
                                                                value="Reduced"
                                                                checked={formData[`service_change_${num}`] === "Reduced"}
                                                                onChange={handleInputChange}
                                                                className="h-4 w-4"
                                                            />
                                                            <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-slate-900">Reduced</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <input
                                                                type="radio"
                                                                name={`service_change_${num}`}
                                                                value="Discontinued"
                                                                checked={formData[`service_change_${num}`] === "Discontinued"}
                                                                onChange={handleInputChange}
                                                                className="h-4 w-4"
                                                            />
                                                            <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-slate-900">Discontinued</span>
                                                        </label>
                                                    </div>
                                                </td>
                                                <td className="!p-2">
                                                    <input
                                                        type="text"
                                                        name={`service_change_date_${num}_ddmmyyyy`}
                                                        value={formData[`service_change_date_${num}_ddmmyyyy`]}
                                                        onChange={handleInputChange}
                                                        className="border-0 bg-transparent text-center font-bold"
                                                        placeholder="dd/mm/yyyy"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* PAGE 3 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rent Reduction</div>
                            <div className="hdr-subtitle">FORM T3 • Rent History & Taxes</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 3 of 8</div>
                    </div>

                    <div className="section-header">Rent History</div>
                    <div className="info-box mb-6 bg-slate-50 border-slate-900">
                        <div className="form-grid items-center gap-4">
                            <div className="col-4">
                                <label className="input-label font-black text-slate-900">Move-in Date</label>
                                <input type="text" name="move_in_date_ddmmyyyy" value={formData.move_in_date_ddmmyyyy} onChange={handleInputChange} placeholder="dd/mm/yyyy" className="font-bold text-center h-12" />
                            </div>
                            <div className="col-8">
                                <p className="text-xs text-slate-500 italic mt-4 italic">Specify when you moved into the rental unit and provide the rent history below.</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-white rounded-xl border-2 border-slate-100 overflow-hidden shadow-sm mb-8">
                        <table>
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="w-[40%]">Rent Amount (per period)</th>
                                    <th className="w-[30%]">From (dd/mm/yyyy)</th>
                                    <th className="w-[30%]">To (dd/mm/yyyy)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4].map(num => (
                                    <tr key={num}>
                                        <td className="!p-2 bg-slate-50/50">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-slate-400">$</span>
                                                <input
                                                    type="text"
                                                    name={`rent_row${num}_amount`}
                                                    value={formData[`rent_row${num}_amount`]}
                                                    onChange={handleInputChange}
                                                    className="border-0 bg-transparent font-black"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </td>
                                        <td className="!p-2">
                                            <input
                                                type="text"
                                                name={`rent_row${num}_from`}
                                                value={formData[`rent_row${num}_from`]}
                                                onChange={handleInputChange}
                                                className="border-0 bg-transparent text-center font-medium"
                                                placeholder="dd/mm/yyyy"
                                            />
                                        </td>
                                        <td className="!p-2">
                                            <input
                                                type="text"
                                                name={`rent_row${num}_to`}
                                                value={formData[`rent_row${num}_to`]}
                                                onChange={handleInputChange}
                                                className="border-0 bg-transparent text-center font-medium"
                                                placeholder="dd/mm/yyyy"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="input-group mb-12">
                        <label className="input-label mb-2">Rent Payment Frequency</label>
                        <div className="flex gap-4">
                            {[
                                { name: 'rent_by_month', label: 'Monthly' },
                                { name: 'rent_by_week', label: 'Weekly' },
                                { name: 'rent_by_other', label: 'Other' }
                            ].map(option => (
                                <label key={option.name} className={`checkbox-card flex-1 ${formData[option.name] ? 'active' : ''}`}>
                                    <input type="checkbox" name={option.name} checked={formData[option.name]} onChange={handleInputChange} />
                                    <span className="font-bold text-sm tracking-tight">{option.label}</span>
                                </label>
                            ))}
                        </div>
                        {formData.rent_by_other && (
                            <div className="mt-4">
                                <input type="text" name="rent_by_other_specify" value={formData.rent_by_other_specify} onChange={handleInputChange} placeholder="Specify other period (e.g., Bi-weekly)" className="bg-white border-2 border-slate-200" />
                            </div>
                        )}
                    </div>

                    <div className={`checkbox-card flex-col items-start gap-6 ${formData.reason_2 ? 'active' : ''}`}>
                        <div className="flex items-start gap-4 w-full">
                            <input type="checkbox" name="reason_2" checked={formData.reason_2} onChange={handleInputChange} />
                            <div className="flex-1">
                                <span className="font-bold text-lg text-slate-900 block">Reason 2: Municipal taxes and charges for the residential complex have decreased.</span>
                                <span className="text-sm text-slate-500 mt-1 block italic">Requirement: Provide the tax details for both the Base Year and Reference Year.</span>
                            </div>
                        </div>

                        {formData.reason_2 && (
                            <div className="w-full mt-4">
                                <div className="bg-white rounded-xl border-2 border-slate-100 overflow-hidden mb-6">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th className="w-[30%]">Comparison Period</th>
                                                <th className="w-[30%]">Calendar Year (yyyy)</th>
                                                <th className="w-[40%]">Total Property Taxes ($)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="font-bold bg-slate-50">Base Year</td>
                                                <td><input type="text" name="base_year_yyyy" value={formData.base_year_yyyy} onChange={handleInputChange} className="border-0 bg-transparent text-center font-bold" placeholder="yyyy" /></td>
                                                <td>
                                                    <div className="flex items-center gap-2 px-2">
                                                        <span className="font-bold text-slate-400">$</span>
                                                        <input type="text" name="base_year_total_taxes" value={formData.base_year_total_taxes} onChange={handleInputChange} className="border-0 bg-transparent font-black" placeholder="0.00" />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-bold bg-slate-50">Reference Year</td>
                                                <td><input type="text" name="reference_year_yyyy" value={formData.reference_year_yyyy} onChange={handleInputChange} className="border-0 bg-transparent text-center font-bold" placeholder="yyyy" /></td>
                                                <td>
                                                    <div className="flex items-center gap-2 px-2">
                                                        <span className="font-bold text-slate-400">$</span>
                                                        <input type="text" name="reference_year_total_taxes" value={formData.reference_year_total_taxes} onChange={handleInputChange} className="border-0 bg-transparent font-black" placeholder="0.00" />
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="info-box bg-amber-50 border-amber-600 m-0">
                                    <p className="text-sm text-amber-900 font-bold uppercase tracking-widest italic">Important Notice:</p>
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                        You <strong>must</strong> attach evidence of property taxes for both years (e.g. final tax bills or statements from the municipality).
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* PAGE 4 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rent Reduction</div>
                            <div className="hdr-subtitle">FORM T3 • Signature</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 4 of 8</div>
                    </div>

                    <div className="section-header">Part 3: Signature</div>
                    <div className="signature-box mb-12">
                        <div className="form-grid items-end gap-12">
                            <div className="input-group col-6">
                                <label className="input-label !text-accent !text-sm">Date Signed (dd/mm/yyyy)</label>
                                <input type="text" name="signature_date_ddmmyyyy" value={formData.signature_date_ddmmyyyy} onChange={handleInputChange} className="h-16 font-black text-center text-2xl border-slate-900 border-4" placeholder="DD/MM/YYYY" />
                            </div>
                            <div className="col-6 space-y-4">
                                <label className="input-label">I am signing this application as:</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['Tenant 1', 'Tenant 2', 'Legal Representative'].map(who => (
                                        <label key={who} className={`checkbox-card py-3 px-6 h-auto ${formData.who_signed === who ? 'active' : ''}`}>
                                            <input type="radio" name="who_signed" value={who} checked={formData.who_signed === who} onChange={handleInputChange} />
                                            <span className="font-bold text-xs uppercase tracking-wider">{who}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section-header !bg-slate-700">Legal Representative Information</div>
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
                            <label className="input-label">LSUC # / License</label>
                            <input type="text" name="rep_lsuc" value={formData.rep_lsuc} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-6">
                            <label className="input-label">Firm / Company</label>
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
                        <div className="input-group col-6">
                            <label className="input-label">Municipality</label>
                            <input type="text" name="rep_municipality" value={formData.rep_municipality} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-3">
                            <label className="input-label">Postal Code</label>
                            <input type="text" name="rep_postal" value={formData.rep_postal} onChange={handleInputChange} />
                        </div>
                        <div className="input-group col-12 mt-4">
                            <label className="input-label !text-accent">Email Address</label>
                            <input type="email" name="rep_email" value={formData.rep_email} onChange={handleInputChange} className="h-14 font-bold border-2 border-accent/20 bg-accent/5" />
                        </div>
                    </div>
                </div>

                {/* PAGE 5 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rent Reduction</div>
                            <div className="hdr-subtitle">FORM T3 • Notices</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 5 of 8</div>
                    </div>

                    <div className="section-header">Important Information</div>
                    <div className="space-y-8">
                        <div className="info-box !border-slate-900 bg-slate-50">
                            <p className="font-bold text-lg mb-2 underline tracking-tight uppercase">Collection of Personal Information</p>
                            <p className="text-slate-700 leading-relaxed italic">
                                The Landlord and Tenant Board (LTB) collects the personal information on this form under the authority of section 185 of the Residential Tenancies Act, 2006.
                                The LTB uses this information to process your application. All information you fill in on this form and any documents you file with the LTB may become
                                part of the LTB's public record and may be made available to the public.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="p-8 bg-slate-900 text-white rounded-[2rem]">
                                <p className="font-bold text-amber-500 uppercase tracking-widest text-xs mb-4">Disclosure 1</p>
                                <p className="text-xl font-medium leading-relaxed italic">"Forms for requesting French-language services or Human Rights accommodation are available at the end of this document."</p>
                            </div>
                            <div className="p-8 border-4 border-slate-100 rounded-[2rem] bg-slate-50">
                                <p className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4">Disclosure 2</p>
                                <p className="text-xl font-bold text-slate-900 leading-tight">Providing false or misleading information is a punishable offense under the Act.</p>
                            </div>
                        </div>

                        <div className="info-box !border-accent bg-blue-50/50">
                            <p className="font-bold text-accent mb-1 uppercase tracking-widest text-xs">Legal Costs</p>
                            <p className="text-slate-800 font-medium">
                                The Board can order one party to pay the legal costs of the other party if appropriate. Ensure all information is accurate to avoid potential cost awards.
                            </p>
                        </div>
                    </div>
                </div>

                {/* PAGE 6 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rent Reduction</div>
                            <div className="hdr-subtitle">FORM T3 • Services & Accommodation</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 6 of 8</div>
                    </div>

                    <div className="section-header">French-Language Services</div>
                    <div className="info-box mb-8">
                        <p className="text-slate-600">The LTB provides services in French. If you or your representative would like your hearing or mediation to be in French, check the box below.</p>
                    </div>

                    <label className={`checkbox-card p-10 mb-12 ${formData.request_french_services ? 'active' : ''}`}>
                        <input type="checkbox" name="request_french_services" checked={formData.request_french_services} onChange={handleInputChange} className="h-8 w-8" />
                        <div className="ml-4">
                            <span className="font-black text-2xl text-slate-900 uppercase tracking-tighter block line-clamp-1">I request French-language services</span>
                            <span className="text-sm text-slate-500 italic mt-1 block">The LTB will ensure a French-speaking adjudicator or mediator is assigned.</span>
                        </div>
                    </label>

                    <div className="section-header !bg-slate-700">Accommodation Requests</div>
                    <div className="info-box mb-8">
                        <p className="text-slate-600 italic">The LTB is committed to providing accessible services in accordance with the Ontario Human Rights Code. If you require accommodation, please specify below.</p>
                    </div>

                    <label className={`checkbox-card p-6 mb-8 ${formData.request_accommodation ? 'active' : ''}`}>
                        <input type="checkbox" name="request_accommodation" checked={formData.request_accommodation} onChange={handleInputChange} className="h-6 w-6" />
                        <span className="font-bold text-slate-900">I require accommodation under the Human Rights Code.</span>
                    </label>

                    {formData.request_accommodation && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <label className="input-label !text-accent">Specify your accommodation requirements:</label>
                            <textarea
                                name="accommodation_explain"
                                value={formData.accommodation_explain}
                                onChange={handleInputChange}
                                className="min-h-[300px] text-lg font-medium p-8 border-4 border-slate-900 rounded-[2rem] shadow-xl"
                                placeholder="Describe the specific accommodation you need (e.g., visual/hearing assistance, physical access, etc.)"
                            ></textarea>
                        </div>
                    )}
                </div>

                {/* PAGE 7 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rent Reduction</div>
                            <div className="hdr-subtitle">FORM T3 • Payment Information</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 7 of 8</div>
                    </div>

                    <div className="section-header">Payment Information</div>
                    <div className="info-box mb-8">
                        <p className="text-slate-600">Select your intended payment method. Note that the LTB requires payment before processing the application.</p>
                    </div>

                    <div className="form-grid gap-6">
                        {[
                            { name: 'pay_online', label: 'Online Payment (Recommended)', sub: 'Pay through the LTB portal.' },
                            { name: 'pay_money_order', label: 'Money Order', sub: 'Payable to the "Minister of Finance".' },
                            { name: 'pay_certified_cheque', label: 'Certified Cheque', sub: 'Must be verified by your bank.' },
                            { name: 'pay_credit_card', label: 'Credit Card', sub: 'Visa, Mastercard, or AMEX.' }
                        ].map(method => (
                            <label key={method.name} className={`checkbox-card col-6 flex-col items-start ${formData[method.name as keyof typeof formData] ? 'active' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" name={method.name} checked={formData[method.name as keyof typeof formData]} onChange={handleInputChange} />
                                    <span className="font-bold text-slate-900">{method.label}</span>
                                </div>
                                <span className="text-xs text-slate-500 mt-2 block ml-8 italic">{method.sub}</span>
                            </label>
                        ))}
                    </div>

                    <div className="mt-12 p-10 bg-slate-900 rounded-[3rem] border-[10px] border-slate-800 shadow-2xl">
                        <div className="input-group">
                            <label className="input-label !text-amber-500 !text-sm mb-4">Official Receipt Number</label>
                            <input
                                type="text"
                                name="receipt_number"
                                value={formData.receipt_number}
                                onChange={handleInputChange}
                                className="h-24 bg-white/5 border-white/20 text-white font-black text-5xl text-center uppercase tracking-[0.3em] rounded-2xl focus:border-amber-500 transition-all outline-none"
                                placeholder="REC-000-000"
                            />
                        </div>
                        <p className="text-center text-white/40 text-xs mt-6 uppercase tracking-widest font-bold">Verification will be performed by LTB Office</p>
                    </div>
                </div>

                {/* PAGE 8 */}
                <div className="page">
                    <div className="hdr">
                        <div className="left">
                            <div className="hdr-title">Tenant Application for a Rent Reduction</div>
                            <div className="hdr-subtitle">FORM T3 • Schedule of Parties</div>
                        </div>
                        <div className="right text-slate-400 font-bold text-sm">Page 8 of 8</div>
                    </div>

                    <div className="section-header">Schedule of Parties</div>
                    <div className="info-box mb-8">
                        <p className="text-sm italic">Use this page to list any additional landlords or tenants who are parties to this application but could not be listed on the first page.</p>
                    </div>

                    <div className="space-y-12">
                        {[1, 2, 3].map(num => (
                            <div key={num} className="p-8 bg-slate-50/50 rounded-3xl border-2 border-slate-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-8 w-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm">{num}</div>
                                    <span className="font-bold text-slate-900 uppercase tracking-widest text-sm">Additional Party Details</span>
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
                                        <label className="input-label">Role (e.g., Additional Tenant, Co-Landlord)</label>
                                        <input type="text" placeholder="Role" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto pt-20 flex justify-between items-end">
                        <div className="opacity-40">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Version: 01/01/2024</p>
                            <p className="text-[10px] text-slate-300 mt-1 italic font-medium uppercase tracking-[0.1em]">RoomieAI Legal Architecture</p>
                        </div>
                        <div className="text-slate-200 font-black text-6xl tracking-tighter italic">T3 COMPLETED</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
