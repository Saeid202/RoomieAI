// This is the NEW card content that should replace the old one
// Starting from line 727 (after the opening <div className="relative p-8...">)

{/* Header - Identity Card */}
<div className="flex items-start justify-between">
    <div 
        className="flex items-center gap-3 cursor-pointer group/profile"
        onClick={() => navigate(`/dashboard/user/${signal.user_id}`)}
    >
        {/* Avatar Placeholder */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white">
            {(signal.creator_name && signal.creator_name !== "Unknown User" 
                ? signal.creator_name.charAt(0).toUpperCase() 
                : "A")}
        </div>
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 group-hover/profile:text-indigo-600 transition-colors">
                    {signal.creator_name && signal.creator_name !== "Unknown User" ? signal.creator_name : "Anonymous Member"}
                </span>
                {(signal.creator_name === 'Mehdi' || signal.creator_name?.includes('Mehdi')) ? (
                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-[10px] font-bold px-2 py-0.5">
                        <Star className="h-2.5 w-2.5 mr-1 fill-white" />
                        SUPER
                    </Badge>
                ) : (
                    <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-bold px-2 py-0.5">
                        <Shield className="h-2.5 w-2.5 mr-1" />
                        VERIFIED
                    </Badge>
                )}
            </div>
            <span className="text-xs text-slate-500 font-medium">{signal.household_type}</span>
        </div>
    </div>
</div>

{/* Financial Highlight - Glass Card */}
<div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl p-6 overflow-hidden shadow-lg">
    {/* Glass morphism overlay */}
    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
    
    {/* Decorative elements */}
    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-teal-400/20 rounded-full blur-xl" />
    
    <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-5 w-5 text-white/90" />
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Investment Capital</span>
        </div>
        <div className="text-4xl font-black text-white tracking-tight">
            {formatCapital(signal.capital_available)}
        </div>
        <p className="text-sm font-semibold text-white/90">Ready to invest immediately</p>
    </div>
</div>

{/* Partnership Goals */}
<div className="space-y-4">
    <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-full" />
        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Partnership Goals</h4>
    </div>
    
    <p className="text-base font-semibold text-slate-800 leading-relaxed">
        {signal.intended_use === 'Live-in'
            ? "Seeking co-buyer for primary residence"
            : signal.intended_use === 'Investment'
                ? "Looking for investment property partner"
                : `Interested in ${signal.intended_use.toLowerCase()} property partnership`}
    </p>

    {/* Info Chips - Modern Design */}
    <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold">
            {signal.intended_use === 'Live-in' ? <Home className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            {signal.intended_use}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold">
            <Clock className="h-4 w-4" />
            {signal.time_horizon}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold">
            <Globe className="h-4 w-4" />
            Flexible Location
        </div>
    </div>
</div>

{/* Additional Notes */}
{signal.notes && (
    <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-sm font-medium text-slate-600 leading-relaxed">
            {signal.notes.length > 120 ? `${signal.notes.substring(0, 120)}...` : signal.notes}
        </p>
    </div>
)}

{/* Action Buttons */}
<div className="pt-4 mt-auto space-y-3">
    {currentUserId === signal.user_id ? (
        <Button
            onClick={() => handleOpenEditModal(signal)}
            variant="outline"
            className="w-full border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold text-sm h-14 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
            <Edit2 className="h-4 w-4" />
            Edit My Signal
        </Button>
    ) : (
        <MessageButton
            salesListingId={null}
            landlordId={signal.user_id}
            className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-700 hover:via-violet-700 hover:to-indigo-700 text-white font-bold text-sm h-16 rounded-xl shadow-[0_8px_24px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.45)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group/button"
        >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/button:translate-x-[200%] transition-transform duration-1000" />
            <Handshake className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Connect & Discuss</span>
        </MessageButton>
    )}
</div>
