import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ContractorPublicProfile } from "@/types/contractor";

interface SlugEditorProps {
  profile: ContractorPublicProfile;
  onSave: (slug: string) => Promise<void>;
}

const SLUG_REGEX = /^[a-z0-9-]+$/;

export function SlugEditor({ profile, onSave }: SlugEditorProps) {
  const { toast } = useToast();
  const [slug, setSlug] = useState(profile.slug || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLocked = profile.is_published;

  function validate(value: string): string | null {
    if (!value.trim()) return "Slug cannot be empty";
    if (!SLUG_REGEX.test(value))
      return "Only lowercase letters, digits, and hyphens are allowed";
    if (value.startsWith("-") || value.endsWith("-"))
      return "Slug cannot start or end with a hyphen";
    return null;
  }

  async function handleSave() {
    const validationError = validate(slug);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      await onSave(slug);
      toast({ title: "Slug saved", description: `Your page URL has been updated.` });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: err.message || "Could not save slug.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4 text-violet-600" />
          Page URL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label htmlFor="slug-input">URL Slug</Label>

        {isLocked ? (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700">
            <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="font-mono">{slug}</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              id="slug-input"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase());
                setError(null);
              }}
              placeholder="your-company-name"
              className={`font-mono ${error ? "border-red-400" : ""}`}
            />
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <p className="text-xs text-gray-500">
          Your public page URL:{" "}
          <a
            href={`/pro/${slug || "your-slug"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-violet-600 hover:text-violet-800 hover:underline transition-colors"
          >
            homieai.ca/pro/{slug || "your-slug"}
          </a>
        </p>

        {isLocked && (
          <p className="text-xs text-amber-600">
            Slug is locked while your page is published. Unpublish to change it.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
