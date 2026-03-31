import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function ShareButton({
  title,
  text,
  url,
  className,
  variant = 'outline',
  size = 'default',
  showLabel = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = text || `Check out ${title} on HomieAI`;

  const handleShare = async () => {
    // Check if native share is supported
    if (!navigator.share) {
      // Fallback to clipboard
      await copyToClipboard();
      return;
    }

    try {
      await navigator.share({
        title,
        text: shareText,
        url: shareUrl,
      });
      setError(null);
    } catch (err) {
      // User cancelled or share failed
      if ((err as Error).name !== 'AbortError') {
        setError('Failed to share. Please try copying the link instead.');
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy link. Please try again.');
    }
  };

  // Check if native sharing is supported
  const isNativeShareSupported = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={isNativeShareSupported ? handleShare : copyToClipboard}
        className={className}
      >
        {copied ? (
          <Check className="w-4 h-4 mr-2" />
        ) : (
          <Share2 className="w-4 h-4 mr-2" />
        )}
        {showLabel && (copied ? 'Copied!' : 'Share')}
      </Button>

      {error && (
        <p className="text-xs text-destructive mt-1 absolute whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}

// Hook for sharing property listings
export function useShareProperty(property: {
  id: string;
  title: string;
  address: string;
}) {
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/property/${property.id}`
    : '';

  return {
    share: async () => {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.address}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        return 'copied';
      }
    },
    shareUrl,
  };
}