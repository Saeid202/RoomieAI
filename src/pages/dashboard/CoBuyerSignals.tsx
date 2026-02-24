// =====================================================
// Co-Buyer Signals Page
// =====================================================
// Purpose: Display verified co-buyers looking for partnerships
// =====================================================

import { CoBuyerSignalCard } from "@/components/cobuyer/CoBuyerSignalCard";

export default function CoBuyerSignals() {
  // Example data - replace with actual API call
  const coBuyerSignals = [
    {
      buyerType: "Single buyer",
      userType: "End-user (Live-in)",
      capitalMin: 30000,
      capitalMax: 40000,
      intent: "Primary residence (co-living)",
      location: "Flexible location",
      timeline: "1–2 year horizon",
      notes: "Open to discussing structure and exit terms",
    },
    {
      buyerType: "Couple",
      userType: "End-user (Live-in)",
      capitalMin: 50000,
      capitalMax: 75000,
      intent: "Primary residence (co-living)",
      location: "Downtown Toronto",
      timeline: "6–12 months",
      notes: "Looking for 2-bedroom condo. Prefer established buildings with amenities.",
    },
    {
      buyerType: "Single buyer",
      userType: "Investor",
      capitalMin: 100000,
      capitalMax: 150000,
      intent: "Investment property (rental income)",
      location: "GTA suburbs",
      timeline: "3–6 months",
      notes: "Experienced investor seeking co-ownership for rental property. Open to property management discussions.",
    },
  ];

  return (
    <div className="w-full px-6 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Co-Buyer Signals
        </h1>
        <p className="text-slate-600 text-base">
          Verified individuals looking to co-purchase residential properties
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border-2 border-slate-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Signals</p>
          <p className="text-2xl font-bold text-slate-900">{coBuyerSignals.length}</p>
        </div>
        <div className="bg-white rounded-lg border-2 border-purple-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-purple-600 mb-1">Active This Week</p>
          <p className="text-2xl font-bold text-purple-700">2</p>
        </div>
        <div className="bg-white rounded-lg border-2 border-pink-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-pink-600 mb-1">Avg. Capital</p>
          <p className="text-2xl font-bold text-pink-700">$65K</p>
        </div>
        <div className="bg-white rounded-lg border-2 border-indigo-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-indigo-600 mb-1">Matches</p>
          <p className="text-2xl font-bold text-indigo-700">5</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {coBuyerSignals.map((signal, index) => (
          <CoBuyerSignalCard
            key={index}
            profile={signal}
            onViewDetails={() => console.log("View details:", index)}
            onProposePartnership={() => console.log("Propose partnership:", index)}
          />
        ))}
      </div>
    </div>
  );
}
