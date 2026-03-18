import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, X } from 'lucide-react';

interface RateLimitConfig {
  global_enabled: string;
  max_requests: string;
  time_window_minutes: string;
  cleanup_after_days: string;
}

interface RateLimitConfigPanelProps {
  config: RateLimitConfig;
  onUpdateConfig: (key: string, value: string) => Promise<void>;
  isLoading: boolean;
}

export function RateLimitConfigPanel({ config, onUpdateConfig, isLoading }: RateLimitConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<RateLimitConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleChange = (key: keyof RateLimitConfig, value: string) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await onUpdateConfig('global_enabled', localConfig.global_enabled);
      await onUpdateConfig('max_requests', localConfig.max_requests);
      await onUpdateConfig('time_window_minutes', localConfig.time_window_minutes);
      setHasChanges(false);
      toast({
        title: 'Configuration saved',
        description: 'Rate limit settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Limit Configuration</CardTitle>
        <CardDescription>
          Configure document processing rate limits. Changes take effect immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Enable Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Rate Limiting Globally</Label>
            <p className="text-sm text-muted-foreground">
              When disabled, all document processing requests will be allowed without rate limiting.
            </p>
          </div>
          <Switch
            checked={localConfig.global_enabled === 'true'}
            onCheckedChange={(checked) => handleChange('global_enabled', checked ? 'true' : 'false')}
            disabled={isLoading}
          />
        </div>

        {/* Max Requests */}
        <div className="space-y-2">
          <Label htmlFor="max_requests">Maximum Requests (1-1000)</Label>
          <Input
            id="max_requests"
            type="number"
            min={1}
            max={1000}
            value={localConfig.max_requests}
            onChange={(e) => handleChange('max_requests', e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Maximum number of documents a user can process per time window.
          </p>
        </div>

        {/* Time Window */}
        <div className="space-y-2">
          <Label htmlFor="time_window_minutes">Time Window (minutes, 1-1440)</Label>
          <Input
            id="time_window_minutes"
            type="number"
            min={1}
            max={1440}
            value={localConfig.time_window_minutes}
            onChange={(e) => handleChange('time_window_minutes', e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Duration of the time window for rate limiting (in minutes).
          </p>
        </div>

        {/* Cleanup Days (read-only display) */}
        <div className="space-y-2">
          <Label htmlFor="cleanup_after_days">Audit Log Retention (days)</Label>
          <Input
            id="cleanup_after_days"
            type="number"
            value={localConfig.cleanup_after_days}
            disabled
            className="bg-muted"
          />
          <p className="text-sm text-muted-foreground">
            Number of days to retain audit log entries (read-only).
          </p>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}