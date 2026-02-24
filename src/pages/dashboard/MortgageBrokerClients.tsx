import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { fetchAllMortgageProfiles } from "@/services/mortgageBrokerService";
import { MortgageProfile } from "@/types/mortgage";
import {
    Users, Mail, Phone, Calendar, DollarSign, Search,
    Eye, Download, Building2, Briefcase, CreditCard,
    MapPin, Clock, Info, ShieldCheck, Landmark, MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import html2pdf from "html2pdf.js";
import { BrokerFeedbackDialog } from "@/components/mortgage/BrokerFeedbackDialog";

export default function MortgageBrokerClients() {
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<MortgageProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClient, setSelectedClient] = useState<MortgageProfile | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await fetchAllMortgageProfiles();
            setClients(data);
        } catch (error) {
            console.error("Error loading clients:", error);
            toast.error("Failed to load clients");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (client: MortgageProfile) => {
        try {
            setDownloading(client.id);

            // We need to wait for the hidden template to be rendered with the client data
            setSelectedClient(client);

            // Tiny delay to ensure DOM is updated from state change if we were using a ref on a visible element
            // But here we'll use a dynamic element creation or just wait for the modal content if it's open.
            // Better: Use a hidden div specifically for PDF generation.

            setTimeout(async () => {
                const element = document.getElementById(`pdf-content-${client.id}`);
                if (!element) {
                    toast.error("Could not find content to download");
                    setDownloading(null);
                    return;
                }

                const opt = {
                    margin: 10,
                    filename: `Mortgage_Profile_${client.full_name?.replace(/\s+/g, '_') || 'Client'}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                await html2pdf().set(opt).from(element).save();
                toast.success("PDF downloaded successfully");
                setDownloading(null);
            }, 500);

        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF");
            setDownloading(null);
        }
    };

    const filteredClients = clients.filter(client =>
        (client.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (client.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
        <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                <Icon className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
    );

    const DetailItem = ({ label, value, fullWidth = false }: { label: string, value: any, fullWidth?: boolean }) => (
        <div className={`${fullWidth ? 'col-span-full' : 'col-span-1'} space-y-1`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-1 min-h-[1.5rem]">
                {value === true ? "Yes" : value === false ? "No" : value || "N/A"}
            </p>
        </div>
    );

    const ClientDetailsContent = ({ client }: { client: MortgageProfile }) => (
        <div className="p-6 bg-white space-y-6" id={`pdf-content-${client.id}`}>
            {/* PDF Header (only visible in PDF or styled appropriately) */}
            <div className="mb-8 border-b-2 border-purple-200 pb-4">
                <h2 className="text-2xl font-black text-purple-700">Mortgage Profile Report</h2>
                <p className="text-sm text-gray-500">RoomieAI Broker Portal | Generated on {new Date().toLocaleDateString()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Basic Information */}
                <div className="col-span-full">
                    <SectionTitle title="Basic Information" icon={Info} />
                    <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <DetailItem label="Full Name" value={client.full_name} />
                        <DetailItem label="Age" value={client.age} />
                        <DetailItem label="Email Address" value={client.email} />
                        <DetailItem label="Phone Number" value={client.phone_number} />
                        <DetailItem label="Date of Birth" value={client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : null} />
                        <DetailItem label="First-time Buyer?" value={client.first_time_buyer} />
                        <DetailItem label="Borrowing Setup" value={client.buying_with_co_borrower ? "With Co-borrower" : "Alone"} />
                        {client.co_borrower_details && <DetailItem label="Co-borrower Details" value={client.co_borrower_details} fullWidth />}
                    </div>
                </div>

                {/* Employment & Income */}
                <div className="col-span-full">
                    <SectionTitle title="Employment & Income Snapshot" icon={Briefcase} />
                    <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <DetailItem label="Employment Status" value={client.employment_status} />
                        <DetailItem label="Employment Type" value={client.employment_type} />
                        <DetailItem label="Employer/Business Name" value={client.employer_name || client.business_name} />
                        <DetailItem label="Industry" value={client.industry} />
                        <DetailItem label="Operating Duration" value={client.employment_duration || client.business_duration || client.contracting_duration} />
                        <DetailItem label="Annual Income Range" value={client.income_range} />
                        <DetailItem label="Variable Income Types" value={client.variable_income_types?.join(", ")} fullWidth />
                    </div>
                </div>

                {/* Assets & Down Payment */}
                <div className="col-span-full">
                    <SectionTitle title="Assets & Down Payment Snapshot" icon={Landmark} />
                    <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <DetailItem label="Expected Down Payment" value={client.intended_down_payment} />
                        <DetailItem label="Source(s) of Funds" value={client.funding_sources?.join(", ")} />
                        <DetailItem label="Total Liquid Savings" value={client.liquid_savings_balance} />
                        <DetailItem label="Hold Investments?" value={client.has_investments} />
                        <DetailItem label="Investment Value Range" value={client.investment_value_range} />
                        <DetailItem label="Cryptocurrency Assets?" value={client.has_cryptocurrency} />
                        <DetailItem label="Funds Held Outside Canada?" value={client.funds_outside_canada} />
                        {client.funds_outside_canada && <DetailItem label="Funds Country/Region" value={client.funds_country_region} />}
                    </div>
                </div>

                {/* Credit & Debts */}
                <div className="col-span-full">
                    <SectionTitle title="Credit & Debts (Self-Declared)" icon={ShieldCheck} />
                    <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <DetailItem label="Credit Score Range" value={client.credit_score_range} />
                        <DetailItem label="Monthly Debt Payments" value={client.monthly_debt_payments ? `$${client.monthly_debt_payments}` : null} />
                        <DetailItem label="Missed Payments (Last 12mo)?" value={client.missed_payments_last_12_months} />
                        <DetailItem label="Bankruptcy/Proposal History?" value={client.bankruptcy_proposal_history} />
                        <DetailItem label="Additional Notes" value={client.credit_additional_notes} fullWidth />
                    </div>
                </div>

                {/* Property Intent */}
                <div className="col-span-full">
                    <SectionTitle title="Property Intent" icon={MapPin} />
                    <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <DetailItem label="Purchase Price Range" value={client.purchase_price_range} />
                        <DetailItem label="Property Type" value={client.property_type} />
                        <DetailItem label="Intended Use" value={client.intended_use} />
                        <DetailItem label="Target Location" value={client.target_location} />
                        <DetailItem label="Timeline to Buy" value={client.timeline_to_buy} />
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading clients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 space-y-6 pb-10">
            {/* Page Header */}
            <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-4 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Client Directory
                            </h1>
                            <p className="text-sm text-gray-700 font-medium">
                                Manage and review client mortgage applications
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/80 border-purple-200 focus:border-purple-500 rounded-xl"
                        />
                    </div>
                </div>
            </div>

            {/* Clients List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                        <Card key={client.id} className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 bg-gradient-to-br from-white to-purple-50/50">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                            {client.full_name || "Anonymous Client"}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            Joined {new Date(client.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                        <Users className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Mail className="h-4 w-4 text-purple-500" />
                                        {client.email || "No email provided"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Phone className="h-4 w-4 text-purple-500" />
                                        {client.phone_number || "No phone provided"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 pt-2 border-t border-purple-100">
                                        <DollarSign className="h-4 w-4 text-green-500" />
                                        <span className="font-semibold">Target: {client.purchase_price_range || "Not specified"}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-purple-200 hover:bg-purple-50 text-purple-600 flex items-center gap-2"
                                                onClick={() => setSelectedClient(client)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Details
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader className="flex flex-row items-center justify-between pr-8">
                                                <div>
                                                    <DialogTitle className="text-2xl font-black text-gray-900">
                                                        Client Profile: {client.full_name}
                                                    </DialogTitle>
                                                </div>
                                                <Button
                                                    onClick={() => handleDownload(client)}
                                                    disabled={downloading === client.id}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    {downloading === client.id ? "Generating..." : "Download PDF"}
                                                </Button>
                                            </DialogHeader>
                                            <Separator />
                                            <ClientDetailsContent client={client} />
                                        </DialogContent>
                                    </Dialog>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-gray-500 hover:text-purple-600 hover:bg-purple-50 flex items-center gap-2"
                                        onClick={() => handleDownload(client)}
                                        disabled={downloading === client.id}
                                    >
                                        <Download className="h-4 w-4" />
                                        {downloading === client.id ? "Downloading..." : "Quick Download"}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-pink-200 hover:bg-pink-50 text-pink-600 flex items-center gap-2"
                                        onClick={() => {
                                            setSelectedClient(client);
                                            setIsFeedbackOpen(true);
                                        }}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Send Feedback
                                    </Button>
                                </div>

                                <div className="pt-2">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active Application
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-500">No clients found</h3>
                        <p className="text-gray-400">Try adjusting your search or check back later.</p>
                    </div>
                )}
            </div>

            {/* Hidden container for background PDF generation if needed */}
            <div className="hidden">
                {clients.map(client => (
                    <div key={`hidden-pdf-${client.id}`}>
                        <ClientDetailsContent client={client} />
                    </div>
                ))}
            </div>

            {/* Broker Feedback Dialog */}
            {selectedClient && (
                <BrokerFeedbackDialog
                    open={isFeedbackOpen}
                    onOpenChange={setIsFeedbackOpen}
                    profileId={selectedClient.id}
                    clientName={selectedClient.full_name || "Client"}
                    currentStatus={selectedClient.review_status || 'pending_review'}
                />
            )}
        </div>
    );
}
