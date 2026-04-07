import { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendCommunityInvite } from '@/services/communityInviteService';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  communityName: string;
}

export function InviteModal({ isOpen, onClose, communityId, communityName }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sentEmails, setSentEmails] = useState<string[]>([]);

  if (!isOpen) return null;

  async function handleSendInvite() {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      await sendCommunityInvite({
        communityId,
        recipientEmail: email,
      });

      setSentEmails(prev => [...prev, email]);
      setEmail('');
      toast.success(`Invite sent to ${email}`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send invite');
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setEmail('');
    setSentEmails([]);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md md:max-w-2xl lg:max-w-5xl w-full overflow-hidden border border-gray-200">
        {/* Premium Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 px-6 py-8 sm:px-8 md:px-16 md:py-16">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-orange-400 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-80 sm:h-80 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/3 w-32 h-32 sm:w-72 sm:h-72 bg-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative">
            <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex items-center gap-2 sm:gap-4 flex-1">
                <div className="p-2 sm:p-4 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 flex-shrink-0">
                  <Mail className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">Invite Friends</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors p-2 sm:p-3 hover:bg-white/10 rounded-lg sm:rounded-xl flex-shrink-0"
              >
                <X className="h-5 w-5 sm:h-8 sm:w-8" />
              </button>
            </div>
            <p className="text-white/95 text-sm sm:text-base md:text-xl leading-relaxed max-w-3xl">
              Grow <span className="font-bold">{communityName}</span> by inviting friends. They'll get an email with a direct join link.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 sm:px-8 sm:py-8 md:px-16 md:py-12 space-y-6 sm:space-y-8 md:space-y-10">
          {/* Email Input Section */}
          <div>
            <label className="block text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-5">
              Friend's Email Address
            </label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="friend@example.com"
                className="flex-1 h-12 sm:h-14 md:h-16 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl sm:rounded-2xl text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 focus-visible:border-violet-600 text-sm sm:text-base md:text-lg font-medium"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !sending) {
                    handleSendInvite();
                  }
                }}
                disabled={sending}
              />
              <Button
                onClick={handleSendInvite}
                disabled={sending || !email.trim()}
                className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 text-white font-bold text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 whitespace-nowrap"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send Invite'}</span>
                <span className="sm:hidden">{sending ? '...' : 'Send'}</span>
              </Button>
            </div>
          </div>

          {/* Sent Emails List */}
          {sentEmails.length > 0 && (
            <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl sm:rounded-3xl border-2 border-emerald-200">
              <p className="text-base sm:text-lg md:text-xl font-bold text-emerald-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-600" />
                Invites Sent ({sentEmails.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {sentEmails.map((sentEmail, idx) => (
                  <div key={idx} className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base md:text-lg text-emerald-800 bg-white/70 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-600 flex-shrink-0" />
                    <span className="truncate">{sentEmail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Section - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl border-2 border-blue-200 text-center">
              <p className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">⚡</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-blue-900 mb-2">Instant Send</p>
              <p className="text-xs sm:text-sm md:text-base text-blue-800">Emails sent immediately to your friends</p>
            </div>
            <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl sm:rounded-3xl border-2 border-pink-200 text-center">
              <p className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">🔗</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-pink-900 mb-2">One Click Join</p>
              <p className="text-xs sm:text-sm md:text-base text-pink-800">Friends join with one direct link</p>
            </div>
            <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl sm:rounded-3xl border-2 border-amber-200 text-center">
              <p className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">♾️</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-amber-900 mb-2">Unlimited</p>
              <p className="text-xs sm:text-sm md:text-base text-amber-800">Send as many invites as you want</p>
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={handleClose}
            className="w-full h-11 sm:h-12 md:h-14 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 font-bold text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
