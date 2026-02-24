$filePath = "src/pages/dashboard/BuyingOpportunities.tsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Step 1: Remove the old span line
$content = $content -replace '<span className="text-\[10px\] font-black text-roomie-purple uppercase tracking-\[0\.2em\] block mb-3 text-opacity-70">.*?</span>\s*', ''

# Step 2: Replace the paragraph text
$content = $content -replace '"I want to co-buy a home to live in together"', '"Seeking co-buyer for primary residence"'
$content = $content -replace '"Looking for a co-buyer for an investment property"', '"Looking for investment property partner"'
$content = $content -replace '`Looking to partner on a \$\{signal\.intended_use\} property`', '`Interested in ${signal.intended_use.toLowerCase()} property partnership`'

# Step 3: Update paragraph styling
$content = $content -replace 'text-\[17px\] font-extrabold text-slate-800 leading-snug mb-4', 'text-base font-semibold text-slate-800 leading-relaxed'

# Step 4: Update comment
$content = $content -replace '/\* Context Chips \*/', '/* Info Chips - Modern Design */'

# Step 5: Update chip styling
$content = $content -replace 'gap-1\.5 px-3 py-1\.5 bg-white text-slate-600 rounded-lg text-\[11px\] font-bold shadow-sm border border-slate-100', 'gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold'
$content = $content -replace 'h-3\.5 w-3\.5 text-roomie-purple', 'h-4 w-4'
$content = $content -replace 'h-3\.5 w-3\.5 text-emerald-500', 'h-4 w-4'
$content = $content -replace 'h-3\.5 w-3\.5 text-amber-500', 'h-4 w-4'
$content = $content -replace 'h-3\.5 w-3\.5 text-blue-500', 'h-4 w-4'

# Step 6: Replace MapPin with Globe
$content = $content -replace '<MapPin className="h-4 w-4" />', '<Globe className="h-4 w-4" />'

# Step 7: Update notes section comment
$content = $content -replace '/\* 4\) Narrative Context \(Optional sentence\) \*/', '/* Additional Notes */'

# Step 8: Update notes section styling
$content = $content -replace '<div className="px-1">\s*<p className="text-\[13px\] font-medium text-slate-400 leading-relaxed italic">\s*\{signal\.notes \?', '{signal.notes && (<div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100"><p className="text-sm font-medium text-slate-600 leading-relaxed">'
$content = $content -replace 'signal\.notes\.length > 100', 'signal.notes.length > 120'
$content = $content -replace '\) : "Open to discussing structure, exit options, and premium locations\."\}\s*</p>\s*</div>', '}</p></div>)}'

# Step 9: Update action buttons comment
$content = $content -replace '/\* 5\) Primary Action \*/', '/* Action Buttons */'

# Step 10: Update button container
$content = $content -replace '<div className="pt-4 mt-auto">', '<div className="pt-4 mt-auto space-y-3">'

# Step 11: Update edit button styling
$content = $content -replace 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-black text-sm h-14 rounded-2xl transition-all active:scale-95 shadow-sm uppercase tracking-widest', 'border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold text-sm h-14 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2'

# Step 12: Add Edit2 icon to edit button
$content = $content -replace '>\s*Edit My Signal\s*</Button>', '><Edit2 className="h-4 w-4" />Edit My Signal</Button>'

# Step 13: Update message button styling
$content = $content -replace 'from-roomie-purple to-indigo-600 hover:from-roomie-purple/90 hover:to-indigo-600/90 text-white font-black text-sm h-14 rounded-2xl shadow-\[0_8px_16px_rgba\(110,89,255,0\.25\)\] transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest', 'from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-700 hover:via-violet-700 hover:to-indigo-700 text-white font-bold text-sm h-16 rounded-xl shadow-[0_8px_24px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.45)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group/button'

# Step 14: Replace MessageSquare with Handshake and update text
$content = $content -replace '<MessageSquare className="h-4 w-4" />\s*Propose Partnership', '{/* Shine effect */}<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/button:translate-x-[200%] transition-transform duration-1000" /><Handshake className="h-5 w-5 relative z-10" /><span className="relative z-10">Connect & Discuss</span>'

# Save the file
Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline

Write-Host "Card redesign complete!"
