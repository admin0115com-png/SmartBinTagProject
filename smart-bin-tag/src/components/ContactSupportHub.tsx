import React, { useState, useRef, useEffect } from 'react';
import { 
  Headset, 
  Mail, 
  MessageSquare, 
  Send, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Maximize2, 
  Minimize2, 
  Paperclip, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Phone, 
  Building2, 
  Lock, 
  QrCode, 
  Sparkles,
  ArrowLeft,
  RefreshCw,
  BellRing
} from 'lucide-react';
import { User, Bin, SupportTicket } from '../types';
import { db } from '../mockDb';

interface ContactSupportHubProps {
  currentUser: User | null;
  bins?: Bin[];
  onBack?: () => void;
  setView: (view: string, data?: any) => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Registration' | 'Reports' | 'Alerts' | 'Account' | 'Security';
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I register my Smart Bin Tag?',
    answer: "Once you purchase your official Smart Bin Tag plate, sign into your secure account from the dashboard, click 'Register Bin Tag', key in or QR-scan your unique SBT serial code, and specify your household details. Your bin immediately receives its secure digital ID.",
    category: 'Registration'
  },
  {
    id: 'faq-2',
    question: 'How do I report a found bin?',
    answer: "Simply scan the tag using your smartphone's camera or chip reader, or go to the public home screen and click 'Report Found Bin'. You can enter brief details or upload photos, sending a private system alert to the registered homeowner.",
    category: 'Reports'
  },
  {
    id: 'faq-3',
    question: 'How do I report a damaged bin?',
    answer: "Use the 'Report Damaged Bin' menu, insert the serial code, describe the container structural damage, and upload visual proof. We automatically direct your report to the respective district authority or homeowner for rapid collection replacement.",
    category: 'Reports'
  },
  {
    id: 'faq-4',
    question: 'How do collection reminders work?',
    answer: "Our reminder platform maps your home authority schedule dynamically. You can toggled alerts on for weekly or fortnightly notifications, receiving automatic emails or in-app alerts at custom intervals before collection day.",
    category: 'Alerts'
  },
  {
    id: 'faq-5',
    question: 'How do push notifications work in school/work hours?',
    answer: "Standard in-app alerts generate instantly whenever a council warning pops or your bin is reported found or damaged. You can change push toggles under standard account security preferences.",
    category: 'Alerts'
  },
  {
    id: 'faq-6',
    question: 'Can I change my email address?',
    answer: "Yes! Navigate to Account Settings within your client dashboard, and type your new primary address. Standard notification channels instantly bind to the latest configuration.",
    category: 'Account'
  },
  {
    id: 'faq-7',
    question: 'Can I delete my account?',
    answer: "Yes! You can permanently delete your account directly inside Account Settings. Scroll down to the bottom 'Danger Zone' and select 'Permanently Delete Account'. This starts a secure multi-step wizard: you'll complete a quick survey about your deletion reason, tick a confirmation box, and pass a second final confirm popup. Upon deletion, your entire user profile, bin records, reminder schedules, and messages are completely purged from both our database and Nhost Database. Crucially, all your registered Smart Bin Tag serials are fully reset to 'Available' status, meaning you or a new owner can easily re-register and use the physical tag as normal later on.",
    category: 'Account'
  },
  {
    id: 'faq-8',
    question: 'Can I transfer a Smart Bin Tag to a new house?',
    answer: "Yes! If you migrate to a new city, remove the registered container from your catalog profile. The SBT-XXXXXXXX chip reverts to 'Available' catalog indexing, permitting next-home binding.",
    category: 'Registration'
  },
  {
    id: 'faq-9',
    question: 'Can someone see my street address from scanning?',
    answer: "Never. Smart Bin Tag utilizes zero-exposure privacy indexes. External finders only view secure anonymous communication masks. Your physical house and personal identity remain absolute secrets.",
    category: 'Security'
  },
  {
    id: 'faq-10',
    question: 'How does AirTag work with Smart Bin Tag?',
    answer: "While AirTaging provides live gps coordinates, Smart Bin Tag provides official authority district plates. Pairing both gives supreme anti-theft telemetry with instant municipal identification.",
    category: 'Security'
  }
];

export default function ContactSupportHub({
  currentUser,
  bins = [],
  onBack,
  setView
}: ContactSupportHubProps) {
  // Form States
  const [selectedTopic, setSelectedTopic] = useState<string>('General Support');
  const [subject, setSubject] = useState<string>('General Inquiries & Account Setup');
  const [customerName, setCustomerName] = useState<string>(currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : '');
  const [email, setEmail] = useState<string>(currentUser ? currentUser.email : '');
  const [phoneNumber, setPhoneNumber] = useState<string>(currentUser?.phoneNumber || '');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [preferredResponse, setPreferredResponse] = useState<'IN_APP' | 'EMAIL' | 'PHONE'>('IN_APP');
  
  // Attachment
  const [attachment, setAttachment] = useState<{ name: string; size: number; dataUrl?: string } | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // FAQ Accordion & Search state
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-2': false,
    'faq-3': false,
    'faq-4': false,
    'faq-5': false,
    'faq-6': false,
    'faq-7': false,
    'faq-8': false,
    'faq-9': false,
    'faq-10': false
  });

  // User's tickets tab
  const [activeTab, setActiveTab] = useState<'request' | 'tickets'>('request');
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      const tickets = db.getSupportTickets(currentUser.uid);
      setUserTickets(tickets);
    }
  }, [currentUser, submittedTicket]);

  // Topic Select Handler
  const handleSelectTopic = (topic: string, defaultSubject: string) => {
    setSelectedTopic(topic);
    setSubject(defaultSubject);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Attachment handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setAttachmentError('Attachment exceeds maximum allowed size of 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        size: file.size,
        dataUrl: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('A valid email address is required.');
      return;
    }
    if (message.trim().length < 20) {
      setFormError(`Message is too short (${message.trim().length}/20 min characters required).`);
      return;
    }
    if (message.length > 5000) {
      setFormError('Message exceeds maximum 5000 character limit.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const userId = currentUser ? currentUser.uid : `anon-${Date.now()}`;
      const refCode = `SBT-TK-${Math.floor(100000 + Math.random() * 900000)}`;

      const newTicket = db.submitSupportTicket(
        userId,
        subject,
        message,
        selectedTopic === 'Technical Problem' ? 'HIGH' : selectedTopic === 'Lost Access' ? 'CRITICAL' : 'MEDIUM',
        {
          customerName: customerName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
          serialNumber: serialNumber.trim() || undefined,
          category: selectedTopic,
          preferredResponse: preferredResponse,
          attachmentName: attachment?.name,
          attachmentData: attachment?.dataUrl,
          referenceCode: refCode
        }
      );

      // Create confirmation notification in mockDb
      if (currentUser) {
        db.addNotification(
          currentUser.uid,
          'System',
          `Help Request Received: ${refCode}`,
          `Your support ticket regarding "${subject}" has been queued. SLA response expected within 1 to 72 hours.`
        );
      }

      setIsSubmitting(false);
      setSubmittedTicket(newTicket);
    }, 600);
  };

  const handleCopyRef = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const toggleFaq = (id: string) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAllFaqs = () => {
    const next: Record<string, boolean> = {};
    FAQ_ITEMS.forEach(f => { next[f.id] = true; });
    setExpandedFaqs(next);
  };

  const collapseAllFaqs = () => {
    const next: Record<string, boolean> = {};
    FAQ_ITEMS.forEach(f => { next[f.id] = false; });
    setExpandedFaqs(next);
  };

  const filteredFaqs = FAQ_ITEMS.filter(f => 
    f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
    f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
    f.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div id="contact-support-hub" className="min-h-screen bg-[#01140e] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* TOP BAR / BACK NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#064e3f]">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#064e3f]/40 hover:bg-[#064e3f] text-emerald-200 hover:text-white rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer border border-[#064e3f]"
              >
                <ArrowLeft className="h-4 w-4 text-[#45D153]" />
                <span>BACK</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#45D153] animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest">
                DESK STATUS: ONLINE • NHOST ACTIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300/80">
            <Clock className="h-3.5 w-3.5 text-[#45D153]" />
            <span>Mon–Fri 09:00–17:00 GMT</span>
          </div>
        </div>

        {/* HERO BANNER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#02241d] via-[#021c16] to-[#011a14] border border-[#064e3f] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-4">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#45D153]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-[#45D153]/15 text-[#45D153] border border-[#45D153]/30 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Headset className="h-3.5 w-3.5" />
              CONTACT &amp; SUPPORT HUB
            </span>
            <span className="px-3 py-1 bg-[#064e3f]/60 text-emerald-300 border border-[#064e3f] rounded-lg text-xs font-mono">
              ZERO-TRUST PORTAL
            </span>
          </div>

          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight font-sans">
              Connect With Our Desk
            </h1>
            <p className="text-emerald-200/90 text-sm sm:text-base leading-relaxed">
              The Digital Registration Plate for Your Wheelie Bin. Need help? Our dedicated support staff is on standby to assist you with account configurations, tag registry parameters, damage reports, and council services integration.
            </p>
          </div>

          {/* Tab Switcher if user has tickets */}
          {currentUser && userTickets.length > 0 && (
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('request')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'request'
                    ? 'bg-[#45D153] text-[#02241d] shadow-md'
                    : 'bg-[#064e3f]/40 text-emerald-200 hover:bg-[#064e3f]'
                }`}
              >
                Send Help Request
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tickets')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'tickets'
                    ? 'bg-[#45D153] text-[#02241d] shadow-md'
                    : 'bg-[#064e3f]/40 text-emerald-200 hover:bg-[#064e3f]'
                }`}
              >
                <span>My Active Tickets</span>
                <span className="px-1.5 py-0.2 bg-emerald-950 text-[#45D153] text-[10px] rounded-full font-bold">
                  {userTickets.length}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SELECT CONTACT MODE / QUERY TOPIC (3 Interactive Cards) */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#064e3f]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#45D153]" />
              <h2 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                SELECT CONTACT MODE / QUERY TOPIC
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">
              3 Dedicated Channels
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: General Support */}
            <div 
              onClick={() => handleSelectTopic('General Support', 'General Inquiries & Account Setup')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                selectedTopic === 'General Support'
                  ? 'bg-[#02241d] border-[#45D153] shadow-lg shadow-[#45D153]/10 ring-1 ring-[#45D153]'
                  : 'bg-[#021c16]/90 border-[#064e3f] hover:border-emerald-500/50 hover:bg-[#02241d]'
              }`}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#064e3f]/60 text-[#45D153] flex items-center justify-center font-bold">
                  <Headset className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white font-sans group-hover:text-[#45D153] transition-colors">
                  General Support
                </h3>
                <p className="text-xs text-emerald-200/70 font-mono">
                  Get help using Smart Bin Tag.
                </p>
              </div>
              <div className="pt-4 mt-2">
                <button
                  type="button"
                  className={`w-full py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                    selectedTopic === 'General Support'
                      ? 'bg-[#45D153] text-[#02241d]'
                      : 'bg-[#064e3f]/50 text-emerald-200 group-hover:bg-[#45D153] group-hover:text-[#02241d]'
                  }`}
                >
                  Contact Support
                </button>
              </div>
            </div>

            {/* Card 2: Technical Problem */}
            <div 
              onClick={() => handleSelectTopic('Technical Problem', 'Technical Problem / App Bug Report')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                selectedTopic === 'Technical Problem'
                  ? 'bg-[#02241d] border-[#45D153] shadow-lg shadow-[#45D153]/10 ring-1 ring-[#45D153]'
                  : 'bg-[#021c16]/90 border-[#064e3f] hover:border-emerald-500/50 hover:bg-[#02241d]'
              }`}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#064e3f]/60 text-amber-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white font-sans group-hover:text-[#45D153] transition-colors">
                  Technical Problem
                </h3>
                <p className="text-xs text-emerald-200/70 font-mono">
                  Report an issue with the app.
                </p>
              </div>
              <div className="pt-4 mt-2">
                <button
                  type="button"
                  className={`w-full py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                    selectedTopic === 'Technical Problem'
                      ? 'bg-[#45D153] text-[#02241d]'
                      : 'bg-[#064e3f]/50 text-emerald-200 group-hover:bg-[#45D153] group-hover:text-[#02241d]'
                  }`}
                >
                  Report Bug
                </button>
              </div>
            </div>

            {/* Card 3: Lost Access */}
            <div 
              onClick={() => handleSelectTopic('Lost Access', 'Lost Access & Account Sign-In')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                selectedTopic === 'Lost Access'
                  ? 'bg-[#02241d] border-[#45D153] shadow-lg shadow-[#45D153]/10 ring-1 ring-[#45D153]'
                  : 'bg-[#021c16]/90 border-[#064e3f] hover:border-emerald-500/50 hover:bg-[#02241d]'
              }`}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#064e3f]/60 text-emerald-300 flex items-center justify-center font-bold">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white font-sans group-hover:text-[#45D153] transition-colors">
                  Lost Access
                </h3>
                <p className="text-xs text-emerald-200/70 font-mono">
                  Need help signing in?
                </p>
              </div>
              <div className="pt-4 mt-2">
                <button
                  type="button"
                  className={`w-full py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                    selectedTopic === 'Lost Access'
                      ? 'bg-[#45D153] text-[#02241d]'
                      : 'bg-[#064e3f]/50 text-emerald-200 group-hover:bg-[#45D153] group-hover:text-[#02241d]'
                  }`}
                >
                  Account Support
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN SPLIT: FORM (Left/Center) + DESK COORDINATES (Right) */}
        {/* ======================================================== */}
        <div ref={formRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: SECURE HELP REQUEST FORM */}
          <div className="lg:col-span-7 bg-[#021c16]/95 border border-[#064e3f] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="border-b border-[#064e3f] pb-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#45D153]" />
                  <h2 className="text-lg font-black text-white uppercase tracking-tight font-sans">
                    Send Secure Help Request
                  </h2>
                </div>
                <p className="text-xs text-emerald-200/70 font-mono">
                  Topic: <span className="text-[#45D153] font-bold">{selectedTopic}</span> • Zero-Trust Isolation
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#064e3f]/60 text-emerald-300 rounded">
                256-Bit Encrypted
              </span>
            </div>

            {/* Submission Confirmation Receipt */}
            {submittedTicket ? (
              <div className="p-6 bg-[#011a14] border border-[#45D153] rounded-2xl space-y-5 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#45D153]/20 text-[#45D153] flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase font-sans">
                      Help Request Dispatched
                    </h3>
                    <p className="text-xs text-emerald-300 font-mono">
                      Your ticket has been logged and synced with Nhost Database.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#02241d] border border-[#064e3f] rounded-xl space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#064e3f]">
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">REFERENCE CODE</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#45D153] font-black text-sm">{submittedTicket.referenceCode || submittedTicket.id}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyRef(submittedTicket.referenceCode || submittedTicket.id)}
                        className="p-1 hover:bg-[#064e3f] rounded text-emerald-300 cursor-pointer"
                        title="Copy Reference Code"
                      >
                        {copiedRef ? <Check className="h-3.5 w-3.5 text-[#45D153]" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-emerald-400/80 block">Subject:</span>
                      <span className="text-white font-bold truncate block">{submittedTicket.subject}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400/80 block">Estimated SLA:</span>
                      <span className="text-[#45D153] font-bold">1 to 72 Hours</span>
                    </div>
                    <div>
                      <span className="text-emerald-400/80 block">Preferred Mode:</span>
                      <span className="text-white">{submittedTicket.preferredResponse || 'In-App Message'}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400/80 block">Logged Timestamp:</span>
                      <span className="text-white">{new Date(submittedTicket.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicket(null);
                      setMessage('');
                      setAttachment(null);
                    }}
                    className="flex-1 py-2.5 bg-[#45D153] hover:bg-[#3dbb4a] text-[#02241d] font-mono font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    Submit Another Request
                  </button>
                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => setView('dashboard')}
                      className="px-4 py-2.5 bg-[#064e3f]/60 hover:bg-[#064e3f] text-emerald-200 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Go to Dashboard
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {formError && (
                  <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs font-mono text-rose-200 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* SUBJECT DROPDOWN */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    SUBJECT DROPDOWN *
                  </label>
                  <div className="relative">
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#011a14] border border-[#064e3f] focus:border-[#45D153] rounded-xl text-xs text-white outline-none font-mono transition-colors appearance-none cursor-pointer"
                    >
                      <option value="General Inquiries & Account Setup">General Support &amp; Account Setup</option>
                      <option value="Technical Problem / App Bug Report">Technical Problem / App Bug Report</option>
                      <option value="Lost Access & Account Sign-In">Lost Access &amp; Account Sign-In</option>
                      <option value="Bin Tag Registration & Scanning Parameter">Bin Tag Registration &amp; Scanning Parameter</option>
                      <option value="Bin Damage & Municipal Replacement">Bin Damage &amp; Municipal Replacement</option>
                      <option value="Other Inquiries">Other Inquiries</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 pointer-events-none" />
                  </div>
                </div>

                {/* CUSTOMER NAME & EMAIL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                      CUSTOMER NAME (REQUIRED) *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 bg-[#011a14] border border-[#064e3f] focus:border-[#45D153] rounded-xl text-xs text-white placeholder-emerald-400/30 outline-none font-mono transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                      EMAIL ADDRESS (REQUIRED) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full px-3.5 py-2.5 bg-[#011a14] border border-[#064e3f] focus:border-[#45D153] rounded-xl text-xs text-white placeholder-emerald-400/30 outline-none font-mono transition-colors"
                    />
                  </div>
                </div>

                {/* PHONE NUMBER & SMART BIN TAG SERIAL NUMBER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-emerald-400/80 uppercase tracking-wider block">
                      PHONE NUMBER (OPTIONAL)
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +44 7700 900077"
                      className="w-full px-3.5 py-2.5 bg-[#011a14] border border-[#064e3f] focus:border-[#45D153] rounded-xl text-xs text-white placeholder-emerald-400/30 outline-none font-mono transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-emerald-400/80 uppercase tracking-wider block">
                      SMART BIN TAG SERIAL NUMBER (OPTIONAL)
                    </label>
                    {bins.length > 0 ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={serialNumber}
                          onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                          placeholder="e.g. SBT-00000001"
                          list="user-bins-list"
                          className="w-full px-3.5 py-2.5 bg-[#011a14] border border-[#064e3f] focus:border-[#45D153] rounded-xl text-xs text-white placeholder-emerald-400/30 outline-none font-mono transition-colors uppercase"
                        />
                        <datalist id="user-bins-list">
                          {bins.map((b) => (
                            <option key={b.binId} value={b.serialNumber}>
                              {b.serialNumber} - {b.binType} Bin ({b.street})
                            </option>
                          ))}
                        </datalist>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. SBT-00000001"
                        className="w-full px-3.5 py-2.5 bg-[#011a14] border border-[#064e3f] focus:border-[#45D153] rounded-xl text-xs text-white placeholder-emerald-400/30 outline-none font-mono transition-colors uppercase"
                      />
                    )}
                  </div>
                </div>

                {/* MESSAGE BODY */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                      MESSAGE BODY (REQUIRED) *
                    </label>
                    <span className={`text-[10px] font-mono ${
                      message.length < 20 
                        ? 'text-amber-400' 
                        : message.length > 5000 
                        ? 'text-rose-400' 
                        : 'text-emerald-400'
                    }`}>
                      {message.length}/5000 characters (Min 20)
                    </span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide full details regarding your query, registration serials, account access, or technical issue..."
                    className="w-full px-3.5 py-3 bg-[#011a14] border border-[#064e3f] focus:border-[#45D153] rounded-xl text-xs text-white placeholder-emerald-400/30 outline-none font-mono transition-colors resize-y leading-relaxed"
                  ></textarea>
                </div>

                {/* ATTACHMENT UPLOAD */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-emerald-400/80 uppercase tracking-wider block">
                    ATTACHMENT UPLOAD (OPTIONAL)
                  </label>
                  
                  {attachment ? (
                    <div className="p-3 bg-[#011a14] border border-[#45D153]/50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Paperclip className="h-4 w-4 text-[#45D153] shrink-0" />
                        <div className="truncate">
                          <span className="text-xs font-mono text-white font-bold truncate block">
                            {attachment.name}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400/70">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="p-1 text-emerald-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove attachment"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#064e3f] hover:border-[#45D153]/60 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#011a14]/60 group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Paperclip className="h-6 w-6 text-emerald-400/60 mx-auto group-hover:text-[#45D153] transition-colors" />
                      <p className="text-xs font-mono text-emerald-200 mt-1 font-bold">
                        Drop your JPG, PNG, or PDF here or browse file
                      </p>
                      <p className="text-[10px] font-mono text-emerald-400/50 mt-0.5">
                        Maximum allowed size: 10MB
                      </p>
                    </div>
                  )}

                  {attachmentError && (
                    <p className="text-xs font-mono text-rose-400">❌ {attachmentError}</p>
                  )}
                </div>

                {/* PREFERRED RESPONSE MODE */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    PREFERRED RESPONSE MODE
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    
                    <button
                      type="button"
                      onClick={() => setPreferredResponse('IN_APP')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        preferredResponse === 'IN_APP'
                          ? 'bg-[#02241d] border-[#45D153] ring-1 ring-[#45D153]'
                          : 'bg-[#011a14] border-[#064e3f] hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                        <MessageSquare className="h-3.5 w-3.5 text-[#45D153]" />
                        <span>In-App Message</span>
                      </div>
                      <p className="text-[10px] font-mono text-emerald-300/60 mt-1">
                        Secure web alert
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredResponse('EMAIL')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        preferredResponse === 'EMAIL'
                          ? 'bg-[#02241d] border-[#45D153] ring-1 ring-[#45D153]'
                          : 'bg-[#011a14] border-[#064e3f] hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                        <Mail className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Direct Email</span>
                      </div>
                      <p className="text-[10px] font-mono text-emerald-300/60 mt-1">
                        Inbox reply
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredResponse('PHONE')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        preferredResponse === 'PHONE'
                          ? 'bg-[#02241d] border-[#45D153] ring-1 ring-[#45D153]'
                          : 'bg-[#011a14] border-[#064e3f] hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                        <Phone className="h-3.5 w-3.5 text-emerald-400" />
                        <span>SMS / Phone</span>
                      </div>
                      <p className="text-[10px] font-mono text-emerald-300/60 mt-1">
                        Urgent follow-up
                      </p>
                    </button>

                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-[#45D153] to-emerald-400 hover:from-[#56dc63] hover:to-emerald-300 text-[#02241d] font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#45D153]/15 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>ENCRYPTING &amp; DISPATCHING...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>SEND SECURE HELP REQUEST</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Right Column: DESK COORDINATES & SYSTEM NOTICES */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* DESK COORDINATES CARD */}
            <div className="bg-[#021c16]/95 border border-[#064e3f] rounded-3xl p-6 shadow-xl space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#064e3f]">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#45D153]" />
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                    DESK COORDINATES
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#064e3f]/60 text-emerald-300 rounded">
                  Official Channels
                </span>
              </div>

              <div className="space-y-3.5 font-mono text-xs">
                
                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold uppercase text-[10px] block">
                    General Support Email
                  </span>
                  <a 
                    href="mailto:support@smartbintagapp.com" 
                    className="text-[#45D153] hover:underline flex items-center gap-1.5 font-bold"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>support@smartbintagapp.com</span>
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold uppercase text-[10px] block">
                    Business Email
                  </span>
                  <a 
                    href="mailto:support@smartbintag.com" 
                    className="text-[#45D153] hover:underline flex items-center gap-1.5 font-bold"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>support@smartbintag.com</span>
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold uppercase text-[10px] block">
                    Council Integration Email
                  </span>
                  <a 
                    href="mailto:support@smartbintag.com" 
                    className="text-[#45D153] hover:underline flex items-center gap-1.5 font-bold"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>support@smartbintag.com</span>
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold uppercase text-[10px] block">
                    Official Site URL
                  </span>
                  <a 
                    href="https://smartbintag.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#45D153] hover:underline flex items-center gap-1.5 font-bold"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>https://smartbintag.com</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-[#064e3f] space-y-1">
                  <span className="text-emerald-400 font-bold uppercase text-[10px] block">
                    Corporate Operating Hours
                  </span>
                  <p className="text-white font-bold">
                    Monday – Friday
                  </p>
                  <p className="text-emerald-200/80 text-[11px]">
                    09:00 – 17:00 (London GMT)
                  </p>
                </div>

              </div>

            </div>

            {/* SLA DISPATCH PROMISE */}
            <div className="bg-[#021c16]/95 border border-[#064e3f] rounded-3xl p-5 shadow-xl space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#45D153] font-bold uppercase tracking-wider text-[11px]">
                <Clock className="h-4 w-4" />
                <span>SLA DISPATCH PROMISE</span>
              </div>
              <p className="text-emerald-100/90 leading-relaxed text-[11px]">
                1 to 72 Hours response SLA for standard tickets. Extended weekend delays may occur depending on ticket category or country locale.
              </p>
            </div>

            {/* OPERATIONS NOTICE */}
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-3xl p-5 shadow-xl space-y-2 font-mono text-xs text-amber-200">
              <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                <AlertTriangle className="h-4 w-4" />
                <span>⚠️ OPERATIONS NOTICE</span>
              </div>
              <p className="text-amber-200/90 leading-relaxed text-[11px]">
                Emergency telephone support is strictly unavailable. Report immediate council code violations directly to district local authorities.
              </p>
            </div>

            {/* ZERO-TRUST PORTAL */}
            <div className="bg-[#021c16]/95 border border-[#45D153]/30 rounded-3xl p-5 shadow-xl space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#45D153] font-bold uppercase tracking-wider text-[11px]">
                <ShieldCheck className="h-4 w-4" />
                <span>ZERO-TRUST PORTAL</span>
              </div>
              <p className="text-emerald-200/80 leading-relaxed text-[11px]">
                Smart Bin Tag ensures military-grade isolation. Support records are bound specifically to authenticated user profiles or encrypted tracking reference keys.
              </p>
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* FREQUENTLY ASKED QUESTIONS (Dropdown Boxes) */}
        {/* ======================================================== */}
        <div className="bg-[#021c16]/95 border border-[#064e3f] rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          
          <div className="border-b border-[#064e3f] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#45D153]" />
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-sans">
                  Frequently Asked Questions
                </h2>
              </div>
              <p className="text-xs font-mono font-bold text-[#45D153] tracking-wider uppercase">
                TOP ANSWERS ABOUT REGISTRATIONS, DAMAGE AND SAFETY
              </p>
            </div>

            {/* Expand / Collapse All */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAllFaqs}
                className="px-3 py-1.5 bg-[#064e3f]/50 hover:bg-[#064e3f] text-emerald-200 text-xs font-mono font-bold rounded-xl border border-[#064e3f] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Maximize2 className="h-3 w-3 text-[#45D153]" />
                <span>EXPAND ALL</span>
              </button>
              <button
                type="button"
                onClick={collapseAllFaqs}
                className="px-3 py-1.5 bg-[#064e3f]/50 hover:bg-[#064e3f] text-emerald-200 text-xs font-mono font-bold rounded-xl border border-[#064e3f] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Minimize2 className="h-3 w-3 text-emerald-400" />
                <span>COLLAPSE ALL</span>
              </button>
            </div>
          </div>

          {/* Search FAQ */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/60" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search frequently asked questions..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#011a14] border border-[#064e3f] focus:border-[#45D153] rounded-xl text-xs text-white placeholder-emerald-400/30 outline-none font-mono transition-colors"
            />
            {faqSearch && (
              <button
                type="button"
                onClick={() => setFaqSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/60 hover:text-white text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* 10 ACCORDION DROPDOWN BOXES */}
          <div className="space-y-3 pt-2">
            {filteredFaqs.map((faq, index) => {
              const isExpanded = !!expandedFaqs[faq.id];
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isExpanded 
                      ? 'bg-[#02241d] border-[#45D153]/50 shadow-md' 
                      : 'bg-[#011a14]/80 border-[#064e3f] hover:border-emerald-500/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#064e3f]/60 text-[#45D153] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white font-sans group-hover:text-[#45D153] transition-colors">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block text-[9px] font-mono px-2 py-0.5 bg-[#064e3f]/40 text-emerald-300 rounded">
                        {faq.category}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-[#45D153]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-emerald-400/70 group-hover:text-white" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-[#064e3f]/40 text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans animate-in fade-in duration-150">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center bg-[#011a14] border border-[#064e3f] rounded-2xl text-xs font-mono text-emerald-300">
                No matching questions found for &quot;{faqSearch}&quot;.
              </div>
            )}
          </div>

          {/* FOOTER / ZERO-TRUST BADGE */}
          <div className="mt-8 pt-6 border-t border-[#064e3f] text-center space-y-1">
            <p className="text-xs font-mono text-emerald-300 font-bold">
              &copy; 2026 Smart Bin Tag (smartbintag.com / smartbintagapp.com). All Rights Reserved.
            </p>
            <p className="text-[11px] font-mono text-emerald-400/60">
              Zero-Trust Secure Registry • Powered by Nhost Database Infrastructure
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
