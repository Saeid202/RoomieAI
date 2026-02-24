$filePath = "src/pages/dashboard/BuyingOpportunities.tsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Define the old section to replace (using regex to handle encoding issues)
$oldSection = @'
                                            <span className="text-\[10px\] font-black text-roomie-purple uppercase tracking-\[0\.2em\] block mb-3 text-opacity-70">.*?</span>
                                            <p className="text-\[17px\] font-extrabold text-slate-800 leading-snug mb-4">
                                                \{signal\.intended_use === 'Live-in'
                                                    \? "I want to co-buy a home to live in together"
                                                    : signal\.intended_use === 'Investment'
                                                        \? "Looking for a co-buyer for an investment property"
                                                        : `Looking to partner on a \$\{signal\.intended_use\} property`\}
                                            </p>

                                            /\* Context Chips \*/
                                            <div className="flex flex-wrap gap-2">
                                                <div className="flex items-center gap-1\.5 px-3 py-1\.5 bg-white text-slate-600 rounded-lg text-\[11px\] font-bold shadow-sm border border-slate-100">
                                                    \{signal\.intended_use === 'Live-in' \? <Home className="h-3\.5 w-3\.5 text-roomie-purple" /> : <TrendingUp className="h-3\.5 w-3\.5 text-emerald-500" />\}
                                                    \{signal\.intended_use\}
                                                </div>
                                                <div className="flex items-center gap-1\.5 px-3 py-1\.5 bg-white text-slate-600 rounded-lg text-\[11px\] font-bold shadow-sm border border-slate-100">
                                                    <Clock className="h-3\.5 w-3\.5 text-amber-500" />
                                                    \{signal\.time_horizon\}
                                                </div>
                                                <div className="flex items-center gap-1\.5 px-3 py-1\.5 bg-white text-slate-600 rounded-lg text-\[11px\] font-bold shadow-sm border border-slate-100">
                                                    <MapPin className="h-3\.5 w-3\.5 text-blue-500" />
                                                    Any Location
                                                </div>
                                            </div>
'@

# Define the new section
$newSection = @'
                                            
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
'@

# Replace using regex
$content = $content -replace $oldSection, $newSection

# Save the file
Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline

Write-Host "Replacement complete!"
