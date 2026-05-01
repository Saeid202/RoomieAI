import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox, ChevronDown, ChevronUp } from "lucide-react";
import type { ContractorLead } from "@/types/contractor";

interface LeadsInboxProps {
  leads: ContractorLead[];
  onMarkRead: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function LeadsInbox({ leads, onMarkRead }: LeadsInboxProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(lead: ContractorLead) {
    if (expandedId === lead.id) {
      setExpandedId(null);
    } else {
      setExpandedId(lead.id);
      if (!lead.read) {
        onMarkRead(lead.id);
      }
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Inbox className="h-4 w-4 text-violet-600" />
          Leads Inbox
          {leads.filter((l) => !l.read).length > 0 && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 ml-1">
              {leads.filter((l) => !l.read).length} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No leads yet. Share your public page to start receiving inquiries.
          </p>
        ) : (
          <div className="space-y-2">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className={`rounded-lg border transition-colors cursor-pointer ${
                  !lead.read
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-100 bg-gray-50"
                }`}
                onClick={() => toggleExpand(lead)}
              >
                <div className="flex items-center gap-3 p-3">
                  {/* Unread dot */}
                  <div
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      !lead.read ? "bg-blue-500" : "bg-transparent"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          !lead.read
                            ? "font-bold text-gray-900"
                            : "font-medium text-gray-700"
                        }`}
                      >
                        {lead.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {timeAgo(lead.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {lead.phone}
                      {lead.email ? ` · ${lead.email}` : ""}
                    </p>
                    {lead.message && expandedId !== lead.id && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {lead.message}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-gray-400">
                    {expandedId === lead.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === lead.id && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 uppercase font-bold tracking-wide">
                          Phone
                        </span>
                        <p className="text-gray-800 font-medium">{lead.phone}</p>
                      </div>
                      {lead.email && (
                        <div>
                          <span className="text-gray-400 uppercase font-bold tracking-wide">
                            Email
                          </span>
                          <p className="text-gray-800 font-medium">{lead.email}</p>
                        </div>
                      )}
                    </div>
                    {lead.message && (
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wide">
                          Message
                        </span>
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                          {lead.message}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
