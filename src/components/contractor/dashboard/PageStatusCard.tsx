import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";
import type { ContractorPublicProfile } from "@/types/contractor";

interface PageStatusCardProps {
  profile: ContractorPublicProfile;
  unreadLeads: number;
  onTogglePublish: () => void;
}

export function PageStatusCard({
  profile,
  unreadLeads,
  onTogglePublish,
}: PageStatusCardProps) {
  const previewUrl = `/pro/${profile.slug}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Page Status
          {profile.is_published ? (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-500">
              Draft
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle */}
        <div className="flex items-center gap-3">
          <Switch
            id="publish-toggle"
            checked={profile.is_published}
            onCheckedChange={onTogglePublish}
          />
          <Label htmlFor="publish-toggle" className="cursor-pointer">
            {profile.is_published ? "Published — visible to the public" : "Draft — not visible to the public"}
          </Label>
        </div>

        {/* Preview link */}
        {profile.is_published && profile.slug && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:underline font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            homieai.ca{previewUrl}
          </a>
        )}

        {/* Unread leads badge */}
        {unreadLeads > 0 && (
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {unreadLeads} unread {unreadLeads === 1 ? "lead" : "leads"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
