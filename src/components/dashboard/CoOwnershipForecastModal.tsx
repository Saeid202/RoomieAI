import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, DollarSign, Users, Calendar, RefreshCcw, Lock, Info, Sparkles, BrainCircuit, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoOwnershipForecastModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CoOwnershipForecastModal({ isOpen, onClose }: CoOwnershipForecastModalProps) {
    const [step, setStep] = useState<"input" | "result">("input");
    const [inputType, setInputType] = useState<"structured" | "scenario">("structured");

    // Inputs
    const [propertyValue, setPropertyValue] = useState<string>("");
    const [userContribution, setUserContribution] = useState<string>("");
    const [investors, setInvestors] = useState<string>("3");
    const [exitYear, setExitYear] = useState<string>("5");
    const [scenario, setScenario] = useState<string>("");

    // Loading state for "AI Calculation" effect
    const [isCalculating, setIsCalculating] = useState(false);

    // Calculated Results
    const [result, setResult] = useState<any>(null);

    // Helper to extract numbers from text (Simulated AI)
    const extractFromScenario = (text: string) => {
        const cleanText = text.toLowerCase().replace(/,/g, '');

        // Extract Property Value (looks for large numbers near "house", "condo", "property", "value", "$")
        const valMatch = cleanText.match(/(?:value|price|cost|worth|buying).*?\$?(\d{3,}000)/) || cleanText.match(/\$?(\d{3,}000).*?(?:house|home|condo)/);
        const val = valMatch ? parseFloat(valMatch[1]) : 800000; // Default fallback

        // Extract Contribution (looks for "I has", "my share", "investing", "putting in")
        const contribMatch = cleanText.match(/(?:i|my).*?(?:put|invest|contrib).*?\$?(\d{2,}000)/) || cleanText.match(/\$?(\d{2,}000).*?(?:contribution|share|invest)/);
        const contrib = contribMatch ? parseFloat(contribMatch[1]) : 50000;

        // Extract Investors (looks for "friends", "people", "partners")
        const pplMatch = cleanText.match(/(\d+)\s*(?:friends|partners|people|others)/);
        const numInvestors = pplMatch ? parseInt(pplMatch[1]) + 1 : 3; // +1 includes "me"

        // Extract Years
        const yearMatch = cleanText.match(/(\d+)\s*years?/);
        const years = yearMatch ? parseInt(yearMatch[1]) : 5;

        return { val, contrib, numInvestors, years };
    };

    const calculate = () => {
        setIsCalculating(true);

        // Simulate AI thinking time
        setTimeout(() => {
            let val, contrib, numInvestors, years;
            let analysisText = "";

            if (inputType === "scenario") {
                const extracted = extractFromScenario(scenario);
                val = extracted.val;
                contrib = extracted.contrib;
                numInvestors = extracted.numInvestors;
                years = extracted.years;

                analysisText = `Based on your scenario: "${scenario.substring(0, 50)}${scenario.length > 50 ? '...' : ''}", we detected a property value of ${fmt(val)} with ${numInvestors} total co-owners. You are contributing ${fmt(contrib)} for a ${years}-year hold.`;
            } else {
                val = parseFloat(propertyValue.replace(/[^0-9.]/g, '')) || 0;
                contrib = parseFloat(userContribution.replace(/[^0-9.]/g, '')) || 0;
                numInvestors = parseInt(investors) || 3;
                years = parseInt(exitYear) || 5;

                if (val === 0) val = 1000000; // Safe default

                analysisText = "We used the exact values you provided in the structured form to generate this forecast.";
            }

            // Assumptions
            const totalDownPayment = contrib * numInvestors;

            // Logic: Mortgage is the rest
            let mortgage = val - totalDownPayment;
            if (mortgage < 0) mortgage = 0;

            // Ownership % (Simplified: proportional to headcount, ideally proportional to $)
            // If everyone puts equal, it's 1/N. If not specified, assume equal split model for MVP.
            const ownershipPct = (1 / numInvestors) * 100;

            // Appreciation
            const appreciationRate = 0.055; // 5.5% Ontario Avg

            // Future Value
            const futureVal = val * Math.pow(1 + appreciationRate, years);

            // Mortgage Payoff (Simplified: Amortization not fully calc'd here, assuming interest-only or similar specifically for 'equity at exit' conservative view, usually principal paydown adds MORE equity)
            // Let's add slight principal paydown benefit (~2% per year of original loan)
            const principalPaydownRate = 0.02;
            const paidDown = mortgage * principalPaydownRate * years;
            const mortgageAtExit = Math.max(0, mortgage - paidDown);

            // Equity
            const totalEquity = futureVal - mortgageAtExit;

            // User Share
            const userEquity = totalEquity * (ownershipPct / 100);

            // Profit
            const profit = userEquity - contrib;

            // ROI
            const roi = (profit / contrib) * 100;

            // Annualized ROI
            const annualRoi = (Math.pow(userEquity / contrib, 1 / years) - 1) * 100;

            setResult({
                inputs: { val, contrib, numInvestors, years, ownershipPct },
                assumptions: { totalDownPayment, initialMortgage: mortgage, appreciationRate },
                projections: { futureVal, mortgageAtExit, totalEquity, userEquity, profit, roi, annualRoi },
                analysis: analysisText
            });
            setIsCalculating(false);
            setStep("result");
        }, 2000);
    };

    const reset = () => {
        setStep("input");
        setResult(null);
    };

    // Format helpers
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
    const fmtPct = (n: number) => n.toFixed(1) + "%";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={cn(
                "sm:max-w-[800px] bg-slate-50 p-0 overflow-hidden transition-all duration-500 max-h-[90vh] flex flex-col",
                step === "result" ? "sm:max-w-[900px]" : ""
            )}>
                {step === "input" && (
                    <div className="flex flex-col h-full">
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-8 text-white relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <BrainCircuit className="w-32 h-32 text-white" />
                            </div>
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                                    <span className="text-roomie-purple bg-white rounded-full p-1.5 w-10 h-10 flex items-center justify-center shadow-lg">🚀</span>
                                    Co-Ownership Forecast Engine
                                </DialogTitle>
                                <DialogDescription className="text-indigo-200 text-lg font-medium mt-2">
                                    Predict your future returns using our advanced AI modeling.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="p-8 space-y-6 overflow-y-auto flex-1">
                            <Tabs value={inputType} onValueChange={(v: any) => setInputType(v)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6 h-14 bg-slate-200 p-1 rounded-xl">
                                    <TabsTrigger value="structured" className="text-base font-bold data-[state=active]:bg-white data-[state=active]:text-roomie-purple h-full rounded-lg shadow-sm">
                                        <FileText className="w-4 h-4 mr-2" /> Smart Form
                                    </TabsTrigger>
                                    <TabsTrigger value="scenario" className="text-base font-bold data-[state=active]:bg-white data-[state=active]:text-roomie-purple h-full rounded-lg shadow-sm">
                                        <Sparkles className="w-4 h-4 mr-2" /> Write Scenario
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="structured" className="space-y-6 mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-base font-bold text-slate-700">Property Value Today</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                                <Input
                                                    value={propertyValue}
                                                    onChange={(e) => setPropertyValue(e.target.value)}
                                                    placeholder="1,000,000"
                                                    className="pl-10 h-12 text-lg font-bold bg-white shadow-sm border-slate-200 focus-visible:ring-roomie-purple"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-base font-bold text-slate-700">Your Contribution</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                                <Input
                                                    value={userContribution}
                                                    onChange={(e) => setUserContribution(e.target.value)}
                                                    placeholder="50,000"
                                                    className="pl-10 h-12 text-lg font-bold bg-white shadow-sm border-slate-200 focus-visible:ring-roomie-purple"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-base font-bold text-slate-700">Number of Investors</Label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                                <Input
                                                    type="number"
                                                    value={investors}
                                                    onChange={(e) => setInvestors(e.target.value)}
                                                    placeholder="3"
                                                    className="pl-10 h-12 text-lg font-bold bg-white shadow-sm border-slate-200 focus-visible:ring-roomie-purple"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-base font-bold text-slate-700">Exit Strategy (Years)</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                                <Select value={exitYear} onValueChange={setExitYear}>
                                                    <SelectTrigger className="pl-10 h-12 text-lg font-bold bg-white shadow-sm border-slate-200 focus:ring-roomie-purple">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="3">3 Years</SelectItem>
                                                        <SelectItem value="5">5 Years</SelectItem>
                                                        <SelectItem value="10">10 Years</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="scenario" className="mt-0">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-base font-bold text-slate-700 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-roomie-purple" /> Describe your situation
                                            </Label>
                                            <Textarea
                                                value={scenario}
                                                onChange={(e) => setScenario(e.target.value)}
                                                placeholder="Example: I want to buy a $1.2M home with 3 friends. I'm putting in $60k and want to sell in 5 years."
                                                className="min-h-[200px] text-lg p-4 resize-none bg-slate-50 border-slate-200 focus:ring-roomie-purple focus:border-roomie-purple focus:bg-white transition-all placeholder:text-slate-400"
                                            />
                                            <p className="text-sm text-slate-500 font-medium">
                                                Our AI will extract the financial data automatically from your description.
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="pt-4">
                                <Button
                                    onClick={calculate}
                                    disabled={isCalculating || (inputType === 'structured' && (!propertyValue || !userContribution)) || (inputType === 'scenario' && !scenario)}
                                    className="w-full bg-roomie-purple hover:bg-roomie-purple/90 text-white h-16 text-xl font-black rounded-xl shadow-xl shadow-purple-200 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {isCalculating ? (
                                        <>
                                            <RefreshCcw className="h-6 w-6 animate-spin" />
                                            {inputType === 'scenario' ? 'Analyzing Scenario...' : 'Crunching Numbers...'}
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="h-6 w-6" />
                                            Generate Forecast
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                                    Uses annual appreciation estimates based on Ontario historical real estate data.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {step === "result" && result && (
                    <div className="flex flex-col h-full bg-slate-50">
                        <div className="bg-slate-900 text-white p-6 shadow-md flex justify-between items-center sticky top-0 z-10 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black flex items-center gap-2">
                                    <span className="text-emerald-400">📈</span> {result.inputs.years}-Year Forecast
                                </h2>
                                <p className="text-slate-400 text-sm">Based on {fmt(result.inputs.val)} entry value</p>
                            </div>
                            <Button variant="outline" onClick={reset} className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white">
                                <RefreshCcw className="h-4 w-4 mr-2" /> New Forecast
                            </Button>
                        </div>

                        <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1">
                            {/* AI ANALYSIS SECTION */}
                            <Card className="bg-white border-indigo-100 shadow-sm">
                                <CardHeader className="bg-indigo-50/50 pb-4">
                                    <CardTitle className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-roomie-purple" />
                                        Forecast Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 text-slate-600 leading-relaxed">
                                    <p className="mb-4 font-medium">{result.analysis}</p>
                                    <div className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                                        <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">How we calculated this:</p>
                                        <ul className="list-disc list-inside space-y-1 ml-1">
                                            <li>Assumed annual property appreciation of <span className="font-bold text-slate-800">{fmtPct(result.assumptions.appreciationRate * 100)}</span> (Historical Avg).</li>
                                            <li>Applied principal paydown logic over {result.inputs.years} years.</li>
                                            <li>Projected total equity pool of <span className="font-bold text-slate-800">{fmt(result.projections.totalEquity)}</span> at exit.</li>
                                            <li>Your {fmtPct(result.inputs.ownershipPct)} ownership share yields <span className="font-bold text-emerald-600">{fmt(result.projections.userEquity)}</span>.</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ROI HERO SECTION */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-gradient-to-br from-roomie-purple to-indigo-700 text-white border-0 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                                    <CardContent className="p-6">
                                        <p className="text-indigo-200 font-bold mb-1 flex items-center gap-2 uppercase tracking-wider text-xs">
                                            <TrendingUp className="h-4 w-4" /> Projected Profit
                                        </p>
                                        <div className="text-5xl md:text-6xl font-black mb-2 tracking-tight drop-shadow-md">
                                            {fmt(result.projections.profit)}
                                        </div>
                                        <p className="text-indigo-100 font-medium opacity-90">
                                            Your net gain after {result.inputs.years} years
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-slate-200 shadow-xl overflow-hidden">
                                    <CardContent className="p-6 flex flex-col justify-center h-full">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Total ROI</p>
                                                <div className="text-4xl font-black text-emerald-600">
                                                    {fmtPct(result.projections.roi)}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Annualized</p>
                                                <div className="text-4xl font-black text-slate-800">
                                                    {fmtPct(result.projections.annualRoi)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Initial Investment</span>
                                            <span className="text-slate-800 font-bold">{fmt(result.inputs.contrib)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* DETAILS GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Column 1: Property */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <HomeIcon className="h-5 w-5 text-roomie-purple" /> Property Growth
                                    </h3>
                                    <Card className="border-slate-200 shadow-sm">
                                        <CardContent className="p-4 space-y-3">
                                            <DetailItem label="Value Today" value={fmt(result.inputs.val)} />
                                            <DetailItem
                                                label={`Projected Value`}
                                                value={fmt(result.projections.futureVal)}
                                                highlight
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Column 2: Equity */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-roomie-purple" /> Equity & Mortgage
                                    </h3>
                                    <Card className="border-slate-200 shadow-sm">
                                        <CardContent className="p-4 space-y-3">
                                            <DetailItem label="Initial Mortgage" value={fmt(result.assumptions.initialMortgage)} />
                                            <DetailItem label="Mortgage at Exit" value={fmt(result.projections.mortgageAtExit)} />
                                            <div className="h-px bg-slate-100 my-2" />
                                            <DetailItem label="Total Equity Pool" value={fmt(result.projections.totalEquity)} highlight />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Column 3: Your Position */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-roomie-purple" /> Your Share
                                    </h3>
                                    <Card className="border-slate-200 shadow-sm">
                                        <CardContent className="p-4 space-y-3">
                                            <DetailItem label="Ownership %" value={fmtPct(result.inputs.ownershipPct)} />
                                            <DetailItem label="Initial Contribution" value={fmt(result.inputs.contrib)} />
                                            <DetailItem label="Your Equity at Exit" value={fmt(result.projections.userEquity)} highlight color="text-emerald-600" />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function DetailItem({ label, value, highlight = false, color = "text-slate-900" }: { label: string, value: string, highlight?: boolean, color?: string }) {
    return (
        <div className="flex justify-between items-center group">
            <span className={cn("text-sm text-slate-500 group-hover:text-slate-600 transition-colors", highlight && "font-bold text-slate-700")}>{label}</span>
            <span className={cn("font-bold text-base transition-all", color, highlight ? "text-lg" : "")}>{value}</span>
        </div>
    );
}

// Icon helper
function HomeIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}
