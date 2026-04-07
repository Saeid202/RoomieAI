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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border border-gray-200">
        {/* Premium Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 px-16 py-16">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-5xl font-bold text-white">Invite Friends</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-xl"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
            <p className="text-white/95 text-xl leading-relaxed max-w-3xl">
              Grow <span className="font-bold">{communityName}</span> by inviting friends. They'll get an email with a direct join link.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-16 py-12 space-y-10">
          {/* Email Input Section */}
          <div>
            <label className="block text-2xl font-bold text-gray-900 mb-5">
              Friend's Email Address
            </label>
            <div className="flex gap-4">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="friend@example.com"
                className="flex-1 h-16 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-2xl text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 focus-visible:border-violet-600 text-lg font-medium"
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
                className="h-16 px-10 bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 text-white font-bold text-lg rounded-2xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 whitespace-nowrap"
              >
                <Send className="h-6 w-6" />
                {sending ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </div>

          {/* Sent Emails List */}
          {sentEmails.length > 0 && (
            <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200">
              <p className="text-xl font-bold text-emerald-900 mb-6 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                Invites Sent ({sentEmails.length})
              </p>
              <div className="grid grid-cols-2 gap-4">
                {sentEmails.map((sentEmail, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-lg text-emerald-800 bg-white/70 px-6 py-4 rounded-2xl font-medium">
                    <div className="w-3 h-3 rounded-full bg-emerald-600 flex-shrink-0" />
                    {sentEmail}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Section - 3 Column Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200 text-center">
              <p className="text-5xl mb-4">⚡</p>
              <p className="text-xl font-bold text-blue-900 mb-2">Instant Send</p>
              <p className="text-base text-blue-800">Emails sent immediately to your friends</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl border-2 border-pink-200 text-center">
              <p className="text-5xl mb-4">🔗</p>
              <p className="text-xl font-bold text-pink-900 mb-2">One Click Join</p>
              <p className="text-base text-pink-800">Friends join with one direct link</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200 text-center">
              <p className="text-5xl mb-4">♾️</p>
              <p className="text-xl font-bold text-amber-900 mb-2">Unlimited</p>
              <p className="text-base text-amber-800">Send as many invites as you want</p>
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={handleClose}
            className="w-full h-14 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 font-bold text-lg rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
