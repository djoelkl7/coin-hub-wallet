import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  LifeBuoy,
  FileQuestion,
  ShieldAlert,
  CreditCard,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultName?: string;
}

const CATEGORIES = [
  { id: 'withdrawal', label: 'Withdrawal & Clearance Processing', icon: CreditCard, description: 'Questions regarding clearance fee or settlement delays' },
  { id: 'account', label: 'Account Access & Security Key', icon: ShieldAlert, description: 'Credentials, signature recovery, and verification' },
  { id: 'transaction', label: 'Transaction & Transfer Inquiry', icon: LifeBuoy, description: 'Status of incoming or outgoing blockchain transfers' },
  { id: 'general', label: 'General Technical Support', icon: FileQuestion, description: 'Wallet interface, network connectivity, or bug report' },
];

export function SupportModal({ isOpen, onClose, defaultEmail = '', defaultName = '' }: SupportModalProps) {
  const [category, setCategory] = useState('withdrawal');
  const [email, setEmail] = useState(defaultEmail || 'Berginjoshua1@gmail.com');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('high');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    category: string;
    createdAt: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = `ZL-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicket({
        id: ticketId,
        category: CATEGORIES.find((c) => c.id === category)?.label || 'General Support',
        createdAt: 'Just now'
      });
    }, 900);
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setMessage('');
    setSubject('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-[#14151a] border border-[#23262f] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-[#1c1e24] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedTicket ? (
          /* Confirmation State */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">Support Ticket Dispatched</h3>
            <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto">
              Your request has been registered with priority handling. An assigned support specialist will review your inquiry.
            </p>

            <div className="my-6 p-4 rounded-xl bg-[#0a0b0d] border border-[#23262f] text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-[#1c1e24]">
                <span className="text-gray-400">Reference Ticket ID:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{submittedTicket.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#1c1e24]">
                <span className="text-gray-400">Issue Category:</span>
                <span className="text-white font-medium truncate max-w-[200px]">{submittedTicket.category}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#1c1e24]">
                <span className="text-gray-400">Account Notification:</span>
                <span className="text-gray-300 font-mono">{email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Response SLA:</span>
                <span className="text-blue-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Within 15-30 minutes
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-[#0052FF] hover:bg-[#0045d8] text-white font-semibold text-xs rounded-xl shadow-lg shadow-[#0052FF]/20 transition-all cursor-pointer"
              >
                Return to Wallet
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 bg-[#1c1e24] hover:bg-[#23262f] text-gray-300 hover:text-white font-semibold text-xs rounded-xl border border-[#2b2f3a] transition-all cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          </div>
        ) : (
          /* Ticket Form */
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#0052FF]/10 text-[#0052FF] border border-[#0052FF]/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Open Support Ticket</h3>
                <p className="text-xs text-[#00C076] font-medium">Zephyr Ledger Technical & Clearance Concierge</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Select Issue Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-[#0052FF]/15 border-[#0052FF] text-white shadow-sm'
                            : 'bg-[#0a0b0d] border-[#23262f] text-gray-400 hover:text-gray-200 hover:border-gray-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-[#0052FF]' : 'text-gray-500'}`} />
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {cat.label}
                          </p>
                          <p className="text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-1">
                            {cat.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0b0d] border border-[#23262f] focus:border-[#0052FF] rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <div className="flex bg-[#0a0b0d] p-1 rounded-xl border border-[#23262f]">
                    {(['normal', 'high', 'urgent'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                          priority === p
                            ? p === 'urgent'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-[#0052FF] text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inquiry regarding clearance fee and settlement"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0b0d] border border-[#23262f] focus:border-[#0052FF] rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Message Description
                  </label>
                  <span className="text-[11px] text-gray-500">{message.length}/500</span>
                </div>
                <textarea
                  rows={4}
                  required
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your issue or question with as much detail as possible..."
                  className="w-full px-3.5 py-2.5 bg-[#0a0b0d] border border-[#23262f] focus:border-[#0052FF] rounded-xl text-xs text-white placeholder-gray-500 outline-none resize-none transition-colors"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="px-6 py-2.5 bg-[#0052FF] hover:bg-[#0045d8] disabled:bg-[#0052FF]/40 text-white font-semibold text-xs rounded-xl shadow-lg shadow-[#0052FF]/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
