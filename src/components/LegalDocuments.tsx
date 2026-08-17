import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Shield, ArrowLeft, Download, Printer, Copy, Check, Search, 
  ExternalLink, ChevronRight, ChevronDown, Lock, Bell, AlertTriangle, HelpCircle, 
  CheckCircle2, Compass, BookmarkCheck, Scale, Mail, Globe, Sparkles,
  Maximize2, Minimize2, CheckSquare, ShieldCheck, Cookie
} from 'lucide-react';

interface LegalDocumentsProps {
  initialTab?: 'eula' | 'privacy' | 'terms' | 'cookie';
  onBack: () => void;
  setView: (view: string, params?: Record<string, any>) => void;
}

export default function LegalDocuments({
  initialTab = 'privacy',
  onBack,
  setView
}: LegalDocumentsProps) {
  const [activeTab, setActiveTab] = useState<'eula' | 'privacy' | 'terms' | 'cookie'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('privacy-sec-1');
  
  // Privacy Policy Accordion State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (let i = 1; i <= 24; i++) {
      initial[`privacy-sec-${i}`] = true;
    }
    return initial;
  });

  // Terms of Service Accordion State
  const [termsExpandedSections, setTermsExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (let i = 1; i <= 25; i++) {
      initial[`terms-sec-${i}`] = true;
    }
    return initial;
  });

  // Cookie Policy Accordion State
  const [cookieExpandedSections, setCookieExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (let i = 1; i <= 14; i++) {
      initial[`cookie-sec-${i}`] = true;
    }
    return initial;
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (id.startsWith('privacy-sec')) {
      setExpandedSections(prev => ({ ...prev, [id]: true }));
    } else if (id.startsWith('terms-sec')) {
      setTermsExpandedSections(prev => ({ ...prev, [id]: true }));
    } else if (id.startsWith('cookie-sec')) {
      setCookieExpandedSections(prev => ({ ...prev, [id]: true }));
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    for (let i = 1; i <= 24; i++) {
      allExpanded[`privacy-sec-${i}`] = true;
    }
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    for (let i = 1; i <= 24; i++) {
      allCollapsed[`privacy-sec-${i}`] = false;
    }
    setExpandedSections(allCollapsed);
  };

  const toggleTermsSection = (id: string) => {
    setTermsExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAllTerms = () => {
    const allExpanded: Record<string, boolean> = {};
    for (let i = 1; i <= 25; i++) {
      allExpanded[`terms-sec-${i}`] = true;
    }
    setTermsExpandedSections(allExpanded);
  };

  const collapseAllTerms = () => {
    const allCollapsed: Record<string, boolean> = {};
    for (let i = 1; i <= 25; i++) {
      allCollapsed[`terms-sec-${i}`] = false;
    }
    setTermsExpandedSections(allCollapsed);
  };

  const toggleCookieSection = (id: string) => {
    setCookieExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAllCookies = () => {
    const allExpanded: Record<string, boolean> = {};
    for (let i = 1; i <= 14; i++) {
      allExpanded[`cookie-sec-${i}`] = true;
    }
    setCookieExpandedSections(allExpanded);
  };

  const collapseAllCookies = () => {
    const allCollapsed: Record<string, boolean> = {};
    for (let i = 1; i <= 14; i++) {
      allCollapsed[`cookie-sec-${i}`] = false;
    }
    setCookieExpandedSections(allCollapsed);
  };

  const handleCopyText = () => {
    const docElement = document.getElementById('legal-document-content');
    if (docElement) {
      navigator.clipboard.writeText(docElement.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // EULA Sections
  const eulaSections = [
    { num: '01', id: 'eula-sec-1', title: '1. Introduction' },
    { num: '02', id: 'eula-sec-2', title: '2. About Smart Bin Tag' },
    { num: '03', id: 'eula-sec-3', title: '3. Licence Granted' },
    { num: '04', id: 'eula-sec-4', title: '4. Ownership' },
    { num: '05', id: 'eula-sec-5', title: '5. User Accounts & Eligibility' },
    { num: '06', id: 'eula-sec-6', title: '6. Smart Bin Tag Registration' },
    { num: '07', id: 'eula-sec-7', title: '7. Notifications' },
    { num: '08', id: 'eula-sec-8', title: '8. Public Reporting' },
    { num: '09', id: 'eula-sec-9', title: '9. Anonymous Messaging' },
    { num: '010', id: 'eula-sec-10', title: '10. AirTag and Third-Party Tracking Devices' },
    { num: '011', id: 'eula-sec-11', title: '11. Acceptable Use' },
    { num: '012', id: 'eula-sec-12', title: '12. Collection Reminder Information' },
    { num: '013', id: 'eula-sec-13', title: '13. Availability' },
    { num: '014', id: 'eula-sec-14', title: '14. Software Updates' },
    { num: '015', id: 'eula-sec-15', title: '15. Privacy' },
    { num: '016', id: 'eula-sec-16', title: '16. Intellectual Property Protection' },
    { num: '017', id: 'eula-sec-17', title: '17. Disclaimer' },
    { num: '018', id: 'eula-sec-18', title: '18. Limitation of Liability' },
    { num: '019', id: 'eula-sec-19', title: '19. Suspension or Termination' },
    { num: '020', id: 'eula-sec-20', title: '20. Changes to this Agreement' },
    { num: '021', id: 'eula-sec-21', title: '21. Governing Law' },
    { num: '022', id: 'eula-sec-22', title: '22. Contact Details' }
  ];

  // Privacy Policy Sections (24 Items)
  const privacySections = [
    { num: '01', id: 'privacy-sec-1', title: '1. Introduction', keywords: 'welcome agreement services' },
    { num: '02', id: 'privacy-sec-2', title: '2. Who We Are', keywords: 'data controller company nhost database' },
    { num: '03', id: 'privacy-sec-3', title: '3. Information We Collect', keywords: 'account registration serial number reports messages device technical' },
    { num: '04', id: 'privacy-sec-4', title: '4. How We Use Your Information', keywords: 'manage verify collection reminders anonymous customer support' },
    { num: '05', id: 'privacy-sec-5', title: '5. Legal Basis for Processing', keywords: 'gdpr contract consent legitimate interests legal obligations' },
    { num: '06', id: 'privacy-sec-6', title: '6. Information We Do Not Publicly Share', keywords: 'shield hidden name email address phone password private' },
    { num: '07', id: 'privacy-sec-7', title: '7. Public Reporting', keywords: 'lost damaged scan reporter anonymous' },
    { num: '08', id: 'privacy-sec-8', title: '8. Photos', keywords: 'photographs upload stored secure private' },
    { num: '09', id: 'privacy-sec-9', title: '9. Location Information', keywords: 'gps coordinates maps optional address' },
    { num: '010', id: 'privacy-sec-10', title: '10. Apple AirTag & Third-Party Tracking Devices', keywords: 'bluetooth airtag apple find my hardware' },
    { num: '011', id: 'privacy-sec-11', title: '11. Cookies', keywords: 'sessions storage browser preferences' },
    { num: '012', id: 'privacy-sec-12', title: '12. Analytics', keywords: 'crash reports statistics diagnostic usage' },
    { num: '013', id: 'privacy-sec-13', title: '13. Push Notifications', keywords: 'alarms reminders alerts announcements' },
    { num: '014', id: 'privacy-sec-14', title: '14. Email Communications', keywords: 'verification password resets updates' },
    { num: '015', id: 'privacy-sec-15', title: '15. Data Security', keywords: 'https tls encrypted nhost auth database security' },
    { num: '016', id: 'privacy-sec-16', title: '16. Data Retention', keywords: 'delete account records compliance duration' },
    { num: '017', id: 'privacy-sec-17', title: '17. Your Rights', keywords: 'access correct delete restrict export withdraw complaint' },
    { num: '018', id: 'privacy-sec-18', title: '18. UK GDPR & International Privacy Laws', keywords: 'uk gdpr dpa 2018 data protection controller safeguards' },
    { num: '019', id: 'privacy-sec-19', title: '19. Children\'s Privacy', keywords: 'age 16 minors youth policy' },
    { num: '020', id: 'privacy-sec-20', title: '20. Third-Party Services', keywords: 'nhost database nhost storage nhost auth maps providers' },
    { num: '021', id: 'privacy-sec-21', title: '21. Fraud Prevention', keywords: 'security spam investigation breach' },
    { num: '022', id: 'privacy-sec-22', title: '22. Changes to this Privacy Policy', keywords: 'updates revisions notice acceptance' },
    { num: '023', id: 'privacy-sec-23', title: '23. Contact Us', keywords: 'support email ico data protection commissioner' },
    { num: '024', id: 'privacy-sec-24', title: '24. Acceptance', keywords: 'confirmation registration acknowledge terms' }
  ];

  // Terms of Service Sections (25 Items)
  const termsSections = [
    { num: '01', id: 'terms-sec-1', title: '1. Acceptance of These Terms', keywords: 'acceptance agree bound legal service pwa website' },
    { num: '02', id: 'terms-sec-2', title: '2. About Smart Bin Tag', keywords: 'wheelie bin platform reminders messaging registration schedule' },
    { num: '03', id: 'terms-sec-3', title: '3. Eligibility', keywords: 'age 16 registration information accurate laws' },
    { num: '04', id: 'terms-sec-4', title: '4. User Accounts', keywords: 'password credentials security unauthorised access email' },
    { num: '05', id: 'terms-sec-5', title: '5. Registering Smart Bin Tags', keywords: 'serial numbers disputes ownership authorise tamper' },
    { num: '06', id: 'terms-sec-6', title: '6. Ownership', keywords: 'digital association physical bins council landlord lawful' },
    { num: '07', id: 'terms-sec-7', title: '7. Reporting Lost or Damaged Bins', keywords: 'public reports lost found damaged spam good faith' },
    { num: '08', id: 'terms-sec-8', title: '8. Anonymous Messaging', keywords: 'messaging anonymous finders owner privacy spam harass' },
    { num: '09', id: 'terms-sec-9', title: '9. Collection Reminders', keywords: 'schedules calendar accuracy authority council convenience' },
    { num: '010', id: 'terms-sec-10', title: '10. Push Notifications', keywords: 'alarms reminders alerts announcements preferences' },
    { num: '011', id: 'terms-sec-11', title: '11. Email Communications', keywords: 'verification password resets updates marketing' },
    { num: '012', id: 'terms-sec-12', title: '12. Apple AirTag & Third-Party Tracking Devices', keywords: 'bluetooth airtag apple find my battery third party' },
    { num: '013', id: 'terms-sec-13', title: '13. Availability of the Service', keywords: 'uptime maintenance outages network interruption' },
    { num: '014', id: 'terms-sec-14', title: '14. Acceptable Use', keywords: 'unauthorised access reverse engineer malicious false reports breach' },
    { num: '015', id: 'terms-sec-15', title: '15. Intellectual Property', keywords: 'software source code nhost database trademarks logos documentation' },
    { num: '016', id: 'terms-sec-16', title: '16. User Content', keywords: 'photographs messages licence rights upload store' },
    { num: '017', id: 'terms-sec-17', title: '17. Disclaimer', keywords: 'as is recovery prevention accuracy guarantee' },
    { num: '018', id: 'terms-sec-18', title: '18. Limitation of Liability', keywords: 'damage liability fines missed collections data loss' },
    { num: '019', id: 'terms-sec-19', title: '19. Indemnity', keywords: 'indemnify hold harmless claims breach losses' },
    { num: '020', id: 'terms-sec-20', title: '20. Suspension and Termination', keywords: 'suspend terminate account delete breach risk' },
    { num: '021', id: 'terms-sec-21', title: '21. Changes to the Service', keywords: 'features discontinue modify notify' },
    { num: '022', id: 'terms-sec-22', title: '22. Changes to These Terms', keywords: 'updates revisions notice effective' },
    { num: '023', id: 'terms-sec-23', title: '23. Governing Law', keywords: 'england and wales jurisdiction courts' },
    { num: '024', id: 'terms-sec-24', title: '24. Contact Information', keywords: 'smart bin tag website email support' },
    { num: '025', id: 'terms-sec-25', title: '25. Acceptance', keywords: 'confirm registration agreement bound' }
  ];

  // Cookie Policy Sections (14 Items)
  const cookieSections = [
    { num: '01', id: 'cookie-sec-1', title: '1. Introduction', keywords: 'welcome terms pwa website agreement smart bin tag' },
    { num: '02', id: 'cookie-sec-2', title: '2. What Are Cookies?', keywords: 'what are cookies definition local storage indexeddb service workers authentication tokens session' },
    { num: '03', id: 'cookie-sec-3', title: '3. Why We Use Cookies', keywords: 'why we use authenticate sessions preferences settings security fraud prevention pwa' },
    { num: '04', id: 'cookie-sec-4', title: '4. Types of Cookies We Use', keywords: 'types strictly necessary functional analytics performance nhost authentication csrf' },
    { num: '05', id: 'cookie-sec-5', title: '5. Notification Preferences & Local Storage', keywords: 'notification preferences local storage indexeddb offline synchronised account' },
    { num: '06', id: 'cookie-sec-6', title: '6. Progressive Web App (PWA) Storage', keywords: 'progressive web app pwa service workers cache nhost database authentication' },
    { num: '07', id: 'cookie-sec-7', title: '7. Third-Party Services', keywords: 'third-party nhost database cloud services postgresql graphql storage google maps platform' },
    { num: '08', id: 'cookie-sec-8', title: '8. Apple AirTag & Third-Party Tracking Devices', keywords: 'apple airtag bluetooth tracking devices ecosystem find my' },
    { num: '09', id: 'cookie-sec-9', title: '9. Cookie Consent & Management', keywords: 'cookie consent banner preferences browser settings essential' },
    { num: '010', id: 'cookie-sec-10', title: '10. Privacy', keywords: 'privacy policy personal information rights gdpr' },
    { num: '011', id: 'cookie-sec-11', title: '11. Cookie Retention', keywords: 'retention periods session cookies authentication preferences local storage table' },
    { num: '012', id: 'cookie-sec-12', title: '12. Children\'s Privacy', keywords: 'children 16 years age protection investigate remove' },
    { num: '013', id: 'cookie-sec-13', title: '13. Changes to this Cookie Policy', keywords: 'changes updates revision version acceptance' },
    { num: '014', id: 'cookie-sec-14', title: '14. Contact Us', keywords: 'contact information email website support company compliance' }
  ];

  // Filtered Privacy Sections
  const filteredPrivacySections = useMemo(() => {
    if (!searchQuery.trim()) return privacySections;
    const q = searchQuery.toLowerCase();
    return privacySections.filter(sec => 
      sec.title.toLowerCase().includes(q) || 
      sec.keywords.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Terms Sections
  const filteredTermsSections = useMemo(() => {
    if (!searchQuery.trim()) return termsSections;
    const q = searchQuery.toLowerCase();
    return termsSections.filter(sec => 
      sec.title.toLowerCase().includes(q) || 
      sec.keywords.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Cookie Sections
  const filteredCookieSections = useMemo(() => {
    if (!searchQuery.trim()) return cookieSections;
    const q = searchQuery.toLowerCase();
    return cookieSections.filter(sec => 
      sec.title.toLowerCase().includes(q) || 
      sec.keywords.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#03221b] text-slate-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#021c16]/90 border border-[#064e3f] p-4 sm:p-5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 bg-[#064e3f]/60 hover:bg-[#064e3f] text-[#45D153] hover:text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border border-[#45D153]/20"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to App</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-[#45D153]" />
                <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  {activeTab === 'cookie' ? 'COOKIE HUB' : activeTab === 'terms' ? 'TERMS HUB' : 'LEGAL CENTRE'}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#064e3f]/80 text-emerald-300 border border-[#45D153]/30 rounded">
                  {activeTab === 'cookie' 
                    ? 'Ref: SBT-CK-2026-V1' 
                    : activeTab === 'terms' 
                      ? 'Ref: SBT-TOS-2026-V3' 
                      : activeTab === 'eula' 
                        ? 'Ref: SBT-EULA-2026-V3' 
                        : 'Ref: SBT-PV-2026-V3'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/60 font-mono">
                {activeTab === 'cookie'
                  ? 'Cookie Policy • How we use cookies and similar technologies to power your application'
                  : activeTab === 'terms' 
                    ? 'Terms of Service • Operating rules & digital service agreements' 
                    : activeTab === 'eula' 
                      ? 'End User Licence Agreement for Smart Bin Tag Platform' 
                      : 'Official agreements & compliance standards for Smart Bin Tag Platform'}
              </p>
            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-[#064e3f]/40 hover:bg-[#064e3f] text-emerald-100 text-xs font-mono rounded-lg border border-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy Full Document Text"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#45D153]" /> : <Copy className="h-3.5 w-3.5 text-emerald-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#064e3f]/40 hover:bg-[#064e3f] text-emerald-100 text-xs font-mono rounded-lg border border-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Print Document"
            >
              <Printer className="h-3.5 w-3.5 text-emerald-400" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#064e3f] pb-3">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-[#45D153] text-[#02241d] shadow-lg shadow-[#45D153]/20 font-black'
                : 'bg-[#021c16] text-emerald-200/70 hover:text-white border border-[#064e3f]/60'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('eula')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'eula'
                ? 'bg-[#45D153] text-[#02241d] shadow-lg shadow-[#45D153]/20 font-black'
                : 'bg-[#021c16] text-emerald-200/70 hover:text-white border border-[#064e3f]/60'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>End User Licence Agreement (EULA)</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'bg-[#45D153] text-[#02241d] shadow-lg shadow-[#45D153]/20 font-black'
                : 'bg-[#021c16] text-emerald-200/70 hover:text-white border border-[#064e3f]/60'
            }`}
          >
            <BookmarkCheck className="h-4 w-4" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('cookie')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'cookie'
                ? 'bg-[#45D153] text-[#02241d] shadow-lg shadow-[#45D153]/20 font-black'
                : 'bg-[#021c16] text-emerald-200/70 hover:text-white border border-[#064e3f]/60'
            }`}
          >
            <Cookie className="h-4 w-4" />
            <span>Cookie Policy</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PRIVACY POLICY CONTENT (SBT-PV-2026-V3) */}
        {/* ======================================================== */}
        {activeTab === 'privacy' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: TABLE OF CONTENTS (Sticky Sidebar) */}
            <div className="lg:col-span-4 bg-[#021c16]/95 border border-[#064e3f] rounded-2xl p-5 shadow-xl lg:sticky lg:top-20 max-h-[85vh] overflow-y-auto custom-scrollbar space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#064e3f]">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#45D153]" />
                  <span className="font-mono text-xs font-black uppercase text-white tracking-wider">
                    TABLE OF CONTENTS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#45D153] font-bold bg-[#064e3f]/50 px-2 py-0.5 rounded">
                  24 Clauses
                </span>
              </div>

              {/* SEARCH POLICY CLAUSES */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH POLICY CLAUSES..."
                  className="w-full bg-[#011a14] border border-[#064e3f] focus:border-[#45D153] rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-emerald-100 placeholder:text-emerald-500/50 outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-white"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Accordion Controls: EXPAND ALL / COLLAPSE SECTIONS */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={expandAll}
                  className="py-1.5 px-2 bg-[#064e3f]/40 hover:bg-[#064e3f] border border-[#45D153]/30 text-[#45D153] rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all uppercase"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span>EXPAND ALL</span>
                </button>
                <button
                  onClick={collapseAll}
                  className="py-1.5 px-2 bg-[#064e3f]/40 hover:bg-[#064e3f] border border-emerald-500/30 text-emerald-200 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all uppercase"
                >
                  <Minimize2 className="h-3 w-3" />
                  <span>COLLAPSE SECTIONS</span>
                </button>
              </div>

              {/* Quick Navigation Links */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#064e3f]/60">
                <button
                  onClick={() => setActiveTab('eula')}
                  className="py-1.5 px-2 bg-[#011a14] hover:bg-[#064e3f]/50 border border-[#064e3f] text-emerald-300 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all truncate"
                >
                  <FileText className="h-3 w-3 text-[#45D153]" />
                  <span>Read EULA</span>
                </button>
                <button
                  onClick={() => setActiveTab('terms')}
                  className="py-1.5 px-2 bg-[#011a14] hover:bg-[#064e3f]/50 border border-[#064e3f] text-emerald-300 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all truncate"
                >
                  <BookmarkCheck className="h-3 w-3 text-[#45D153]" />
                  <span>Read Terms</span>
                </button>
              </div>

              {/* Table of Contents List */}
              <div className="space-y-1">
                {filteredPrivacySections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between cursor-pointer group ${
                      activeSection === sec.id
                        ? 'bg-[#064e3f] text-[#45D153] font-bold border border-[#45D153]/40'
                        : 'text-emerald-100/75 hover:bg-[#064e3f]/40 hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">{sec.title}</span>
                    <span className="text-[10px] text-emerald-400/60 font-mono px-1.5 py-0.5 rounded bg-[#011a14]/60 group-hover:text-[#45D153]">
                      {sec.num}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Full Privacy Policy Content */}
            <div 
              id="legal-document-content" 
              className="lg:col-span-8 bg-[#021c16]/95 border border-[#064e3f] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-6 text-emerald-50 text-sm leading-relaxed"
            >
              
              {/* Document Header */}
              <div className="border-b border-[#064e3f] pb-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#45D153]/10 border border-[#45D153]/30 rounded-full text-xs font-mono text-[#45D153] font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>LEGAL CENTRE &bull; SBT-PV-2026-V3</span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-emerald-400/80 bg-[#011a14] px-3 py-1 border border-[#064e3f] rounded-lg">
                    EFFECTIVE DATE: <span className="text-[#45D153]">13 August 2026</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    Privacy Policy | Smart Bin Tag
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-[#45D153] font-mono mt-1">
                    The Digital Registration Plate for Your Wheelie Bin
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('eula')}
                    className="text-xs text-[#45D153] hover:underline font-mono font-bold flex items-center gap-1"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Read EULA Document</span>
                  </button>
                  <span className="text-emerald-500/40">&bull;</span>
                  <button
                    onClick={() => setActiveTab('terms')}
                    className="text-xs text-[#45D153] hover:underline font-mono font-bold flex items-center gap-1"
                  >
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    <span>Read Terms of Service</span>
                  </button>
                </div>
              </div>

              {/* 1. Introduction */}
              <section id="privacy-sec-1" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-1')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">1.</span> Introduction
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">01</span>
                    {expandedSections['privacy-sec-1'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-1'] && (
                  <div className="space-y-3 pt-1">
                    <p className="font-semibold text-emerald-300">Welcome to Smart Bin Tag.</p>
                    <p>
                      Your privacy is important to us. This Privacy Policy explains how Smart Bin Tag collects, uses, stores, protects, and shares your personal information when you use our website, Progressive Web App (PWA), mobile features, and related services.
                    </p>
                    <p>
                      By creating an account, registering a Smart Bin Tag, or using any part of our services, you agree to this Privacy Policy. Please read it carefully to understand how we handle your personal information.
                    </p>
                  </div>
                )}
              </section>

              {/* 2. Who We Are */}
              <section id="privacy-sec-2" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-2')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">2.</span> Who We Are
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">02</span>
                    {expandedSections['privacy-sec-2'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-2'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Smart Bin Tag is the data controller responsible for the personal information collected through the Smart Bin Tag website, Progressive Web App (PWA), and related services.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#011a14] border border-[#064e3f] rounded-xl p-4 text-xs font-mono">
                      <div>
                        <span className="text-emerald-400 block font-bold text-[10px] uppercase">Company Name:</span>
                        <span className="text-white font-bold">Smart Bin Tag</span>
                      </div>
                      <div>
                        <span className="text-emerald-400 block font-bold text-[10px] uppercase">Official Website:</span>
                        <a href="https://smartbintag.com" target="_blank" rel="noreferrer" className="text-[#45D153] hover:underline flex items-center gap-1">
                          <span>https://smartbintag.com</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div>
                        <span className="text-emerald-400 block font-bold text-[10px] uppercase">Application Website:</span>
                        <a href="https://smartbintagapp.com" target="_blank" rel="noreferrer" className="text-[#45D153] hover:underline flex items-center gap-1">
                          <span>https://smartbintagapp.com</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div>
                        <span className="text-emerald-400 block font-bold text-[10px] uppercase">Support & Privacy Email:</span>
                        <a href="mailto:support@smartbintagapp.com" className="text-[#45D153] hover:underline flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>support@smartbintagapp.com</span>
                        </a>
                      </div>
                    </div>
                    <p>
                      Smart Bin Tag uses trusted third-party service providers, including Nhost database and backend infrastructure, to securely host and process information required to operate our services. These providers process personal information on our behalf in accordance with applicable laws and their contractual obligations.
                    </p>
                    <p className="text-xs text-emerald-200/70">
                      For further information about Nhost's security and privacy practices, please refer to Nhost's Privacy Policy.
                    </p>
                  </div>
                )}
              </section>

              {/* 3. Information We Collect */}
              <section id="privacy-sec-3" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-3')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">3.</span> Information We Collect
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">03</span>
                    {expandedSections['privacy-sec-3'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-3'] && (
                  <div className="space-y-4 pt-1 text-xs sm:text-sm">
                    
                    {/* Account Information */}
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <h4 className="font-mono font-black text-[#45D153] uppercase text-xs">Account Information</h4>
                      <p className="text-emerald-100/90">When you create an account, we may collect:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4 list-disc text-emerald-200/90 text-xs">
                        <li>First and last name</li>
                        <li>Email address</li>
                        <li>Password (managed securely through Nhost Authentication)</li>
                        <li>Optional phone number</li>
                        <li>Optional profile photograph</li>
                        <li>Account creation date</li>
                        <li>Last login date</li>
                        <li>Account status</li>
                      </ul>
                      <p className="text-[11px] font-mono font-bold text-amber-300 pt-1">
                        🔒 Passwords are never stored in plain text by Smart Bin Tag.
                      </p>
                    </div>

                    {/* Smart Bin Registration Information */}
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <h4 className="font-mono font-black text-[#45D153] uppercase text-xs">Smart Bin Registration Information</h4>
                      <p className="text-emerald-100/90">When registering a Smart Bin Tag we may collect:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4 list-disc text-emerald-200/90 text-xs">
                        <li>Smart Bin Tag serial number</li>
                        <li>Bin type</li>
                        <li>Optional property name</li>
                        <li>House number</li>
                        <li>Street</li>
                        <li>Town</li>
                        <li>County</li>
                        <li>Postcode</li>
                        <li>Country</li>
                        <li>Optional notes</li>
                        <li>Registration date</li>
                      </ul>
                      <p className="text-[11px] font-mono font-bold text-[#45D153] pt-1">
                        🔒 This information is private and is not publicly displayed.
                      </p>
                    </div>

                    {/* Reports */}
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <h4 className="font-mono font-black text-[#45D153] uppercase text-xs">Reports</h4>
                      <p className="text-emerald-100/90">When someone reports a lost or damaged Smart Bin Tag we may collect:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4 list-disc text-emerald-200/90 text-xs">
                        <li>Tag serial number</li>
                        <li>Report type</li>
                        <li>Date and time</li>
                        <li>Finder message</li>
                        <li>Optional finder name</li>
                        <li>Optional finder email</li>
                        <li>Optional finder telephone number</li>
                        <li>Optional GPS location</li>
                        <li>Optional address information</li>
                        <li>Uploaded photographs</li>
                      </ul>
                    </div>

                    {/* Messages */}
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <h4 className="font-mono font-black text-[#45D153] uppercase text-xs">Messages</h4>
                      <p className="text-emerald-100/90">When someone sends a message to a registered owner we collect:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4 list-disc text-emerald-200/90 text-xs">
                        <li>Sender name</li>
                        <li>Sender email</li>
                        <li>Optional telephone number</li>
                        <li>Message contents</li>
                        <li>Date and time</li>
                      </ul>
                      <p className="text-[11px] text-emerald-300">
                        Contact information is only shared if voluntarily supplied by the sender.
                      </p>
                    </div>

                    {/* Device Information */}
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <h4 className="font-mono font-black text-[#45D153] uppercase text-xs">Device Information</h4>
                      <p className="text-emerald-100/90">We automatically collect limited technical information including:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4 list-disc text-emerald-200/90 text-xs">
                        <li>Device type</li>
                        <li>Browser</li>
                        <li>Operating system</li>
                        <li>Screen resolution</li>
                        <li>IP address</li>
                        <li>Language</li>
                        <li>Country</li>
                        <li>Time zone</li>
                        <li>Application version</li>
                        <li>Error logs</li>
                        <li>Usage statistics</li>
                      </ul>
                    </div>

                    {/* Notification Information */}
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <h4 className="font-mono font-black text-[#45D153] uppercase text-xs">Notification Information</h4>
                      <p className="text-emerald-100/90">To provide reminders we may store:</p>
                      <ul className="space-y-1 pl-4 list-disc text-emerald-200/90 text-xs">
                        <li>Push notification tokens</li>
                        <li>Notification preferences</li>
                        <li>Reminder schedules</li>
                        <li>Communication history</li>
                      </ul>
                    </div>

                  </div>
                )}
              </section>

              {/* 4. How We Use Your Information */}
              <section id="privacy-sec-4" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-4')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">4.</span> How We Use Your Information
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">04</span>
                    {expandedSections['privacy-sec-4'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-4'] && (
                  <div className="space-y-3 pt-1">
                    <p>We use your information to:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                      {[
                        'Create and manage your account',
                        'Register Smart Bin Tags',
                        'Verify ownership',
                        'Deliver collection reminders',
                        'Send notifications',
                        'Relay found or damaged bin reports',
                        'Deliver anonymous messages',
                        'Prevent fraud and misuse',
                        'Improve our services',
                        'Provide customer support',
                        'Comply with legal obligations'
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-[#011a14] border border-[#064e3f]/80 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 text-[#45D153] shrink-0" />
                          <span className="text-emerald-100">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* 5. Legal Basis for Processing */}
              <section id="privacy-sec-5" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-5')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">5.</span> Legal Basis for Processing
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">05</span>
                    {expandedSections['privacy-sec-5'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-5'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Where required by applicable data protection laws, including the UK General Data Protection Regulation (UK GDPR), we process your personal information only where we have a lawful basis to do so.
                    </p>
                    <p className="text-xs font-mono text-emerald-300 font-bold">These include:</p>
                    
                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="p-3.5 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-1">
                        <h4 className="font-mono font-bold text-[#45D153]">Performance of a Contract</h4>
                        <p className="text-emerald-100/90">
                          To create and manage your Smart Bin Tag account, register Smart Bin Tags, provide reminders, notifications, and deliver the services you request.
                        </p>
                      </div>

                      <div className="p-3.5 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-1">
                        <h4 className="font-mono font-bold text-[#45D153]">Consent</h4>
                        <p className="text-emerald-100/90">
                          Where you choose to receive optional marketing communications, enable certain notification features, or provide optional information.
                        </p>
                      </div>

                      <div className="p-3.5 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-1">
                        <h4 className="font-mono font-bold text-[#45D153]">Legitimate Interests</h4>
                        <p className="text-emerald-100/90">
                          To improve our services, maintain platform security, investigate fraud or misuse, analyse service performance, and provide customer support.
                        </p>
                      </div>

                      <div className="p-3.5 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-1">
                        <h4 className="font-mono font-bold text-[#45D153]">Legal Obligations</h4>
                        <p className="text-emerald-100/90">
                          Where we are required to retain or disclose information to comply with applicable laws or lawful requests.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* 6. Information We Do Not Publicly Share */}
              <section id="privacy-sec-6" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-6')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">6.</span> Information We Do Not Publicly Share
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">06</span>
                    {expandedSections['privacy-sec-6'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-6'] && (
                  <div className="space-y-3 pt-1">
                    <div className="p-4 bg-emerald-950/40 border border-[#45D153]/40 rounded-xl space-y-2">
                      <p className="font-bold text-white text-sm">
                        People who scan a Smart Bin Tag do not have access to your personal information.
                      </p>
                      <p className="text-xs text-emerald-300 font-mono">We do not publicly display:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-4 list-disc text-emerald-200/90 text-xs">
                        <li>Your name</li>
                        <li>Your email address</li>
                        <li>Your telephone number</li>
                        <li>Your home address</li>
                        <li>Your password</li>
                        <li>Private account information</li>
                      </ul>
                    </div>
                    <p className="text-xs text-emerald-200/80">
                      We will only disclose personal information where required by law or where necessary to provide our services.
                    </p>
                  </div>
                )}
              </section>

              {/* 7. Public Reporting */}
              <section id="privacy-sec-7" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-7')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">7.</span> Public Reporting
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">07</span>
                    {expandedSections['privacy-sec-7'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-7'] && (
                  <div className="space-y-2 pt-1">
                    <p>Members of the public may report a lost or damaged Smart Bin Tag without creating an account.</p>
                    <p>Reports are securely delivered to the registered owner.</p>
                    <p className="text-emerald-300 font-medium">
                      Reporters do not receive information about the registered owner, and owners only receive contact details that the reporter voluntarily provides.
                    </p>
                  </div>
                )}
              </section>

              {/* 8. Photos */}
              <section id="privacy-sec-8" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-8')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">8.</span> Photos
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">08</span>
                    {expandedSections['privacy-sec-8'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-8'] && (
                  <div className="space-y-2 pt-1">
                    <p>Photographs submitted with reports:</p>
                    <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Are securely stored.</li>
                      <li>Are only accessible to the registered owner.</li>
                      <li>May be accessed by authorised administrators where necessary.</li>
                      <li>Are never published publicly without permission.</li>
                    </ul>
                  </div>
                )}
              </section>

              {/* 9. Location Information */}
              <section id="privacy-sec-9" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-9')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">9.</span> Location Information
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">09</span>
                    {expandedSections['privacy-sec-9'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-9'] && (
                  <div className="space-y-2 pt-1">
                    <p className="font-semibold text-emerald-300">Providing location information is optional.</p>
                    <p>Where supplied, location information is used only to:</p>
                    <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Show where a bin was reported.</li>
                      <li>Help owners recover misplaced bins.</li>
                      <li>Display report locations within the owner's account.</li>
                    </ul>
                    <p className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-200">
                      🔒 Smart Bin Tag does not continuously track users or collect live GPS location information.
                    </p>
                  </div>
                )}
              </section>

              {/* 10. Apple AirTag & Third-Party Tracking Devices */}
              <section id="privacy-sec-10" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-10')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">10.</span> Apple AirTag & Third-Party Tracking Devices
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">010</span>
                    {expandedSections['privacy-sec-10'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-10'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Certain Smart Bin Tag products are designed to accommodate Apple AirTags or compatible third-party Bluetooth tracking devices.
                    </p>
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2 text-xs">
                      <p className="font-mono font-bold text-[#45D153] uppercase">These tracking devices:</p>
                      <ul className="space-y-1 pl-4 list-disc text-emerald-100/90">
                        <li>Are entirely optional.</li>
                        <li>Are not manufactured or operated by Smart Bin Tag.</li>
                        <li>Operate independently using the manufacturer's tracking platform.</li>
                        <li>Are subject to the manufacturer's own Privacy Policy and Terms of Service.</li>
                      </ul>
                    </div>
                    <p className="text-xs text-emerald-200/80">
                      Smart Bin Tag cannot access AirTag or third-party tracking locations and does not receive location data from these devices.
                    </p>
                  </div>
                )}
              </section>

              {/* 11. Cookies */}
              <section id="privacy-sec-11" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-11')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">11.</span> Cookies
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">011</span>
                    {expandedSections['privacy-sec-11'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-11'] && (
                  <div className="space-y-2 pt-1">
                    <p>We use cookies and similar technologies to:</p>
                    <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Maintain secure login sessions.</li>
                      <li>Remember preferences.</li>
                      <li>Improve security.</li>
                      <li>Ensure the website functions correctly.</li>
                    </ul>
                    <p className="text-xs text-emerald-200/70">
                      You may disable cookies through your browser settings, although some features may not function correctly.
                    </p>
                  </div>
                )}
              </section>

              {/* 12. Analytics */}
              <section id="privacy-sec-12" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-12')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">12.</span> Analytics
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">012</span>
                    {expandedSections['privacy-sec-12'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-12'] && (
                  <div className="space-y-2 pt-1">
                    <p>We may collect anonymous usage information including:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-5 list-disc text-emerald-100/90 text-xs">
                      <li>Device types</li>
                      <li>Browsers</li>
                      <li>Operating systems</li>
                      <li>Feature usage</li>
                      <li>Crash reports</li>
                      <li>Performance statistics</li>
                    </ul>
                    <p className="text-xs text-emerald-300">
                      This information helps us improve reliability, performance, and user experience.
                    </p>
                  </div>
                )}
              </section>

              {/* 13. Push Notifications */}
              <section id="privacy-sec-13" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-13')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">13.</span> Push Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">013</span>
                    {expandedSections['privacy-sec-13'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-13'] && (
                  <div className="space-y-2 pt-1">
                    <p>Where enabled, Smart Bin Tag may send:</p>
                    <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Collection reminders</li>
                      <li>Lost bin notifications</li>
                      <li>Damaged bin reports</li>
                      <li>Security alerts</li>
                      <li>Service announcements</li>
                    </ul>
                    <p className="text-xs text-emerald-300">
                      Notification preferences can be changed at any time within your account settings.
                    </p>
                  </div>
                )}
              </section>

              {/* 14. Email Communications */}
              <section id="privacy-sec-14" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-14')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">14.</span> Email Communications
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">014</span>
                    {expandedSections['privacy-sec-14'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-14'] && (
                  <div className="space-y-2 pt-1">
                    <p>We may send emails relating to:</p>
                    <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Account verification</li>
                      <li>Password resets</li>
                      <li>Collection reminders</li>
                      <li>Community reports</li>
                      <li>Service updates</li>
                    </ul>
                    <p className="text-xs text-emerald-300">
                      Marketing emails are only sent where you have chosen to receive them.
                    </p>
                  </div>
                )}
              </section>

              {/* 15. Data Security */}
              <section id="privacy-sec-15" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-15')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">15.</span> Data Security
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">015</span>
                    {expandedSections['privacy-sec-15'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-15'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, disclosure, alteration, or destruction.
                    </p>
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2 text-xs">
                      <p className="font-mono font-bold text-[#45D153] uppercase">Security measures include:</p>
                      <ul className="space-y-1.5 pl-4 list-disc text-emerald-100/90">
                        <li>HTTPS/TLS encrypted connections</li>
                        <li>Nhost Authentication</li>
                        <li>Nhost Database Security & Hasura Role Permissions</li>
                        <li>Role-based access controls</li>
                        <li>Secure cloud infrastructure provided by Nhost database and storage</li>
                      </ul>
                    </div>
                    <p className="text-xs text-emerald-200/70">
                      No online service can guarantee absolute security; however, we continually review and improve our security practices.
                    </p>
                  </div>
                )}
              </section>

              {/* 16. Data Retention */}
              <section id="privacy-sec-16" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-16')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">16.</span> Data Retention
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">016</span>
                    {expandedSections['privacy-sec-16'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-16'] && (
                  <div className="space-y-2 pt-1">
                    <p>
                      We retain your personal information only for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.
                    </p>
                    <p className="text-xs text-emerald-300">
                      If you delete your account, we will delete or anonymise your personal information unless we are legally required to retain certain records for a longer period.
                    </p>
                  </div>
                )}
              </section>

              {/* 17. Your Rights */}
              <section id="privacy-sec-17" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-17')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">17.</span> Your Rights
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">017</span>
                    {expandedSections['privacy-sec-17'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-17'] && (
                  <div className="space-y-3 pt-1">
                    <p>Depending on your location and applicable law, you may have the right to:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Access your personal information.</li>
                      <li>Correct inaccurate information.</li>
                      <li>Delete your personal information.</li>
                      <li>Restrict processing.</li>
                      <li>Object to certain processing activities.</li>
                      <li>Receive a copy of your data.</li>
                      <li>Withdraw consent where consent is relied upon.</li>
                      <li>Lodge a complaint with the relevant data protection authority.</li>
                    </ul>
                    <p className="text-xs text-emerald-300 font-mono font-bold">
                      You can also update your profile information, export your Smart Bin Tag data, and delete your account at any time.
                    </p>
                  </div>
                )}
              </section>

              {/* 18. UK GDPR & International Privacy Laws */}
              <section id="privacy-sec-18" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-18')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">18.</span> UK GDPR & International Privacy Laws
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">018</span>
                    {expandedSections['privacy-sec-18'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-18'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Smart Bin Tag complies with applicable data protection legislation, including the UK GDPR, the Data Protection Act 2018, and, where applicable, the EU GDPR.
                    </p>
                    <p className="font-semibold text-emerald-300">
                      Smart Bin Tag acts as the Data Controller for personal information collected through our services.
                    </p>
                    <p className="text-xs text-emerald-200/80">
                      Some personal information may be processed by trusted third-party service providers located outside the United Kingdom or European Economic Area. Where this occurs, appropriate safeguards are implemented in accordance with applicable data protection laws.
                    </p>
                  </div>
                )}
              </section>

              {/* 19. Children's Privacy */}
              <section id="privacy-sec-19" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-19')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">19.</span> Children's Privacy
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">019</span>
                    {expandedSections['privacy-sec-19'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-19'] && (
                  <div className="space-y-2 pt-1">
                    <p className="font-semibold text-emerald-300">Smart Bin Tag is intended for users aged 16 years or older.</p>
                    <p>We do not knowingly collect personal information from children under the age of 16.</p>
                    <p className="text-xs text-emerald-200/70">
                      If we become aware that such information has been collected, we will take reasonable steps to delete it.
                    </p>
                  </div>
                )}
              </section>

              {/* 20. Third-Party Services */}
              <section id="privacy-sec-20" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-20')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">20.</span> Third-Party Services
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">020</span>
                    {expandedSections['privacy-sec-20'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-20'] && (
                  <div className="space-y-3 pt-1">
                    <p>We use carefully selected third-party providers to operate our services, including:</p>
                    <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Nhost Authentication</li>
                      <li>Nhost Database (PostgreSQL / Hasura GraphQL)</li>
                      <li>Nhost Storage</li>
                      <li>Google Maps Platform</li>
                      <li>Email delivery providers</li>
                    </ul>
                    <p className="text-xs text-emerald-200/80">
                      These providers process personal information only as necessary to deliver the services we request.
                    </p>
                    <p className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-xs font-mono text-[#45D153] font-bold">
                      🔒 We do not sell personal information to advertisers or data brokers.
                    </p>
                  </div>
                )}
              </section>

              {/* 21. Fraud Prevention */}
              <section id="privacy-sec-21" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-21')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">21.</span> Fraud Prevention
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">021</span>
                    {expandedSections['privacy-sec-21'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-21'] && (
                  <div className="space-y-2 pt-1">
                    <p>
                      To protect our users and maintain platform security, we may investigate suspicious activity including fraudulent registrations, spam, misuse, or attempts to compromise our systems.
                    </p>
                    <p className="text-xs text-rose-300 font-semibold">
                      Accounts found to be in breach of our Terms may be suspended or permanently removed.
                    </p>
                  </div>
                )}
              </section>

              {/* 22. Changes to this Privacy Policy */}
              <section id="privacy-sec-22" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-22')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">22.</span> Changes to this Privacy Policy
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">022</span>
                    {expandedSections['privacy-sec-22'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-22'] && (
                  <div className="space-y-2 pt-1">
                    <p>
                      We may update this Privacy Policy from time to time to reflect changes in our services, legal obligations, or business practices.
                    </p>
                    <p>
                      Where appropriate, we will notify users through the application, by email, or by publishing an updated version on our website.
                    </p>
                    <p className="text-xs text-emerald-300">
                      Continued use of Smart Bin Tag following publication of changes constitutes acceptance of the updated Privacy Policy.
                    </p>
                  </div>
                )}
              </section>

              {/* 23. Contact Us */}
              <section id="privacy-sec-23" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <button 
                  onClick={() => toggleSection('privacy-sec-23')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">23.</span> Contact Us
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">023</span>
                    {expandedSections['privacy-sec-23'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-23'] && (
                  <div className="space-y-3 pt-1">
                    <p>If you have questions about this Privacy Policy or how we handle your personal information, please contact us at:</p>
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-1 text-xs font-mono">
                      <p className="text-white font-bold text-sm">Smart Bin Tag</p>
                      <p>
                        Email:{' '}
                        <a href="mailto:support@smartbintagapp.com" className="text-[#45D153] hover:underline font-bold">
                          support@smartbintagapp.com
                        </a>
                      </p>
                    </div>
                    <p className="text-xs text-emerald-200/80">
                      If you are not satisfied with our response, you may have the right to lodge a complaint with your local data protection authority, including the UK Information Commissioner's Office (ICO), where applicable.
                    </p>
                  </div>
                )}
              </section>

              {/* 24. Acceptance */}
              <section id="privacy-sec-24" className="space-y-4 pt-2 scroll-mt-24">
                <button 
                  onClick={() => toggleSection('privacy-sec-24')}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">24.</span> Acceptance
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">024</span>
                    {expandedSections['privacy-sec-24'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </button>
                {expandedSections['privacy-sec-24'] && (
                  <div className="space-y-3 pt-1">
                    <div className="p-4 bg-[#011a14] border border-[#45D153]/40 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-[#45D153] font-mono font-bold text-xs">
                        <CheckSquare className="h-4 w-4" />
                        <span>Active Confirmation Standard</span>
                      </div>
                      <p className="text-xs sm:text-sm">
                        During registration, users must actively confirm that they have read and accepted this Privacy Policy.
                      </p>
                      <p className="text-xs text-emerald-200">
                        By creating an account, registering a Smart Bin Tag, using our website, or using any Smart Bin Tag services, you acknowledge that you have read and understood this Privacy Policy.
                      </p>
                    </div>

                    <div className="pt-6 border-t border-[#064e3f] text-center space-y-2">
                      <p className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider uppercase">
                        END OF DOCUMENT
                      </p>
                      <p className="text-xs font-mono text-emerald-200/60">
                        Smart Bin Tag Security & Compliance Bureau &bull; &copy; 2026. All Rights Reserved.
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-[#064e3f]">
                      <button
                        onClick={() => scrollToSection('privacy-sec-1')}
                        className="text-xs font-mono font-bold text-[#45D153] hover:underline cursor-pointer"
                      >
                        &uarr; Back to Top of Table of Contents
                      </button>
                      <button
                        onClick={onBack}
                        className="px-4 py-2 bg-[#45D153] hover:bg-[#38b544] text-[#02241d] font-mono font-bold text-xs rounded-xl cursor-pointer shadow-md"
                      >
                        Return to Application
                      </button>
                    </div>
                  </div>
                )}
              </section>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: EULA DOCUMENT CONTENT */}
        {/* ======================================================== */}
        {activeTab === 'eula' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: DOCUMENT INDEX (Sticky Sidebar) */}
            <div className="lg:col-span-4 bg-[#021c16]/95 border border-[#064e3f] rounded-2xl p-5 shadow-xl lg:sticky lg:top-20 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-[#064e3f] mb-3">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#45D153]" />
                  <span className="font-mono text-xs font-black uppercase text-white tracking-wider">
                    DOCUMENT INDEX
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#45D153] font-bold bg-[#064e3f]/50 px-2 py-0.5 rounded">
                  22 Sections
                </span>
              </div>

              {/* Quick Navigation Links */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('privacy')}
                  className="py-1.5 px-2 bg-[#064e3f]/40 hover:bg-[#064e3f] border border-[#45D153]/30 text-[#45D153] rounded-lg text-[11px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Shield className="h-3 w-3" />
                  <span>Read Privacy Policy</span>
                </button>
                <button
                  onClick={() => setActiveTab('terms')}
                  className="py-1.5 px-2 bg-[#064e3f]/40 hover:bg-[#064e3f] border border-[#45D153]/30 text-[#45D153] rounded-lg text-[11px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <BookmarkCheck className="h-3 w-3" />
                  <span>Read Terms of Service</span>
                </button>
              </div>

              {/* Index Items List */}
              <div className="space-y-1">
                {eulaSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between cursor-pointer group ${
                      activeSection === sec.id
                        ? 'bg-[#064e3f] text-[#45D153] font-bold border border-[#45D153]/40'
                        : 'text-emerald-100/75 hover:bg-[#064e3f]/40 hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">{sec.title}</span>
                    <span className="text-[10px] text-emerald-400/60 font-mono px-1.5 py-0.5 rounded bg-[#011a14]/60 group-hover:text-[#45D153]">
                      {sec.num}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Full EULA Content */}
            <div 
              id="legal-document-content" 
              className="lg:col-span-8 bg-[#021c16]/95 border border-[#064e3f] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8 text-emerald-50 text-sm leading-relaxed"
            >
              
              {/* Document Header */}
              <div className="border-b border-[#064e3f] pb-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#45D153]/10 border border-[#45D153]/30 rounded-full text-xs font-mono text-[#45D153] font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Official End User Licence Agreement</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  End User Licence Agreement ("EULA")
                </h2>
                <p className="text-xs text-emerald-200/70 font-mono">
                  Smart Bin Tag Platform &bull; Effective Date: Permanent Continuous Release &bull; Version 2.4.0
                </p>
                
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('privacy')}
                    className="text-xs text-[#45D153] hover:underline font-mono font-bold flex items-center gap-1"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Read Privacy Policy</span>
                  </button>
                  <span className="text-emerald-500/40">&bull;</span>
                  <button
                    onClick={() => setActiveTab('terms')}
                    className="text-xs text-[#45D153] hover:underline font-mono font-bold flex items-center gap-1"
                  >
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    <span>Read Terms of Service</span>
                  </button>
                </div>
              </div>

              {/* 1. Introduction */}
              <section id="eula-sec-1" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">1.</span> Introduction
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">01</span>
                </div>
                <p className="font-semibold text-emerald-300">Welcome to Smart Bin Tag.</p>
                <p>
                  This End User Licence Agreement ("EULA") is a legally binding agreement between you ("User", "you", "your") and Smart Bin Tag ("we", "our", "us") governing your use of the Smart Bin Tag website, Progressive Web App (PWA), software, services and associated features.
                </p>
                <p>
                  By creating an account, installing the application, registering a Smart Bin Tag or using any part of the Smart Bin Tag service, you agree to this EULA.
                </p>
                <p className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-200 text-xs">
                  ⚠️ If you do not agree to this agreement, you must not use the application or register any Smart Bin Tag devices.
                </p>
              </section>

              {/* 2. About Smart Bin Tag */}
              <section id="eula-sec-2" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">2.</span> About Smart Bin Tag
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">02</span>
                </div>
                <p>Smart Bin Tag is a digital identification platform that allows users to:</p>
                <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>Register wheelie bins.</li>
                  <li>Link a Smart Bin Tag serial number to an account.</li>
                  <li>Receive collection reminders.</li>
                  <li>Receive push notifications, in-app notifications, and email notifications.</li>
                  <li>Report lost, found, or damaged bins to registered owners securely and anonymously.</li>
                  <li>Receive anonymous messages from members of the public concerning bins.</li>
                  <li>Manage multiple wheelie bins.</li>
                  <li>View municipal collection schedules.</li>
                  <li>Install and utilize the application on mobile phones, tablets, and desktop devices.</li>
                </ul>
                <p className="font-semibold text-emerald-300">
                  Smart Bin Tag is designed to help reclaim lost/misplaced bins while protecting the absolute privacy of bin homeowners at all times.
                </p>
              </section>

              {/* 3. Licence Granted */}
              <section id="eula-sec-3" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">3.</span> Licence Granted
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">03</span>
                </div>
                <p>
                  We grant you a limited, non-exclusive, non-transferable, and revocable licence to use the Smart Bin Tag platform solely for your personal or authorized business use.
                </p>
                <p>Under this licence, you may:</p>
                <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>Use the application on supported hardware and devices.</li>
                  <li>Register valid Smart Bin Tags.</li>
                  <li>Configure and receive collection triggers or safety notifications.</li>
                  <li>Report found or damaged bins.</li>
                  <li>Manage your registered bin list and schedule rules.</li>
                </ul>
                <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-rose-200 text-xs font-mono font-bold">
                  ⚠️ You do not own the software or any of its algorithms. You are licensed only to use it in accordance with this agreement.
                </div>
              </section>

              {/* 4. Ownership */}
              <section id="eula-sec-4" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">4.</span> Ownership
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">04</span>
                </div>
                <p>
                  All software, database structures, source code, branding assets, graphic icons, logos, trademarks, and design parameters remain the exclusive intellectual property of Smart Bin Tag.
                </p>
                <p>
                  Nothing in this agreement transfers ownership, patents, copyrights, or other intellectual rights to you. You are strictly forbidden from copying, cloning, reproducing, or redistributing any part of this application without explicit written consent.
                </p>
              </section>

              {/* 5. User Accounts & Eligibility */}
              <section id="eula-sec-5" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">5.</span> User Accounts & Eligibility
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">05</span>
                </div>
                <p>
                  To register an account, utilize advanced features (such as managing bins or receiving customized alerts), or use any part of the service, you must be at least 16 years of age (or the minimum legal age in your jurisdiction).
                </p>
                <p>You agree to:</p>
                <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>Provide accurate and complete registration data.</li>
                  <li>Keep your access passwords and keys secure.</li>
                  <li>Keep your contact email addresses updated.</li>
                  <li>Notify us immediately if your security credentials are compromised.</li>
                </ul>
                <p>You are solely responsible for all administrative activity occurring under your registered user profile.</p>
                <p className="text-xs text-emerald-300">
                  We do not knowingly collect personal information from children under the age of 16. If we detect an account created by a user under 16, we reserve the right to suspend or delete the profile immediately.
                </p>
              </section>

              {/* 6. Smart Bin Tag Registration */}
              <section id="eula-sec-6" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">6.</span> Smart Bin Tag Registration
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">06</span>
                </div>
                <p>Each physical Smart Bin Tag contains:</p>
                <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>A unique alphanumeric serial number (Format e.g. <span className="font-mono text-[#45D153]">SBT-XXXXXXXX</span>).</li>
                  <li>A unique high-resolution QR code or NFC transmitter chip for easy scanning.</li>
                </ul>
                <p>When interacting with the platform:</p>
                <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>Users may manually input their Smart Bin Tag serial code after opening the app or website.</li>
                  <li>Users may also access reporting or registration screens instantly by scanning the QR code or tapping the NFC tag using a compatible smart phone device.</li>
                </ul>
                <p>
                  A physical Smart Bin Tag can only be associated with one user account at a time. Alternate registration claims are forbidden unless ownership is formally deleted or transferred. Smart Bin Tag retains authority to resolve any registered ownership disputes.
                </p>
              </section>

              {/* 7. Notifications */}
              <section id="eula-sec-7" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">7.</span> Notifications
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">07</span>
                </div>
                <p>Smart Bin Tag provides optional reminders and notification categories, including:</p>
                <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>Collection schedule reminders</li>
                  <li>Bin found alerts</li>
                  <li>Damaged container reports</li>
                  <li>Public anonymous messages</li>
                  <li>Security updates and account alerts</li>
                  <li>Registration and update confirmations</li>
                </ul>
                <p className="text-emerald-300 font-medium">These may be delivered via: Push Notifications, Email, and In-App Notifications.</p>
                <div className="p-3 bg-[#064e3f]/30 border border-[#45D153]/30 rounded-xl space-y-1 text-xs">
                  <p className="font-mono font-bold text-[#45D153]">Default collection reminder schedules:</p>
                  <p>&bull; 6:00 PM the evening before calendar collection day</p>
                  <p>&bull; 7:00 AM on the morning of calendar collection day</p>
                </div>
                <p>Users may customize their notification preferences and reminder times at any time within the application settings.</p>
                <p className="text-xs text-emerald-200/70">
                  Note: Successful notification delivery is dependent on third-party mail hubs, device settings, operating system notification permissions, and network coverage; delivery cannot be guaranteed under all circumstances.
                </p>
              </section>

              {/* 8. Public Reporting */}
              <section id="eula-sec-8" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">8.</span> Public Reporting
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">08</span>
                </div>
                <p>Members of the public or municipal collectors may scan a tag to report a bin as Lost, Found, or Damaged.</p>
                <div className="p-3.5 bg-emerald-950/40 border border-[#45D153]/40 rounded-xl text-emerald-200 text-xs font-medium space-y-1">
                  <div className="flex items-center gap-1.5 text-[#45D153] font-mono font-black">
                    <Lock className="h-4 w-4" />
                    <span>Strict Privacy Shield</span>
                  </div>
                  <p>The reporting flow NEVER reveals the owner's name, email, telephone number, street address, or exact property location.</p>
                </div>
                <p>All reported information is structured on the server side and securely relayed to the registered owner's account inbox asynchronously.</p>
              </section>

              {/* 9. Anonymous Messaging */}
              <section id="eula-sec-9" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">9.</span> Anonymous Messaging
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">09</span>
                </div>
                <p>
                  Members of the public may transmit an anonymous text notification to the bin owner concerning its status or safety coordinates.
                </p>
                <p>
                  These messages are relayed securely through the database proxy. Under no circumstances is the owner's personal email or profile identity disclosed to the submitter, unless the owner voluntarily elects to disclose contact variables.
                </p>
              </section>

              {/* 10. AirTag and Third-Party Tracking Devices */}
              <section id="eula-sec-10" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">10.</span> AirTag and Third-Party Tracking Devices
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">010</span>
                </div>
                <p>
                  Certain versions of our Smart Bin Tag hardware plate products contain structured mounting compartments configured to securely accommodate an Apple AirTag or other compatible Bluetooth tracking device.
                </p>
                <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2 text-xs">
                  <p className="font-mono font-bold text-[#45D153] uppercase">Important Notices:</p>
                  <ul className="space-y-1.5 pl-4 list-disc text-emerald-100/80">
                    <li>Smart Bin Tag does not manufacture, package, sell, calibrate, or distribute Apple AirTags or external track tags.</li>
                    <li>Smart Bin Tag does not collect, receive, parse, store, or monitor any Bluetooth coordinate or live GPS location data generated by AirTag devices.</li>
                    <li>AirTag tracking operates completely independently within Apple's proprietary Find My network and mobile software application.</li>
                  </ul>
                </div>
                <p className="text-xs text-emerald-200/70">
                  We hold no authority, access, or responsibility concerning AirTag operational uptime, location readings, accuracy, or software failures. Users are fully responsible for mounting Bluetooth tracking devices in compliance with local privacy, tracking, and surveillance laws.
                </p>
              </section>

              {/* 11. Acceptable Use */}
              <section id="eula-sec-11" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">11.</span> Acceptable Use
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">011</span>
                </div>
                <p>
                  You agree to use Smart Bin Tag responsibly and in compliance with all applicable local, national, and international laws. Specifically, you agree not to:
                </p>
                <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>Misuse, crack, or interfere with our application interface.</li>
                  <li>Impersonate any municipal employee, council officer, or other user.</li>
                  <li>Submit fraudulent, false, misleading or spam reports (e.g. reporting a safe, present bin as lost or damaged).</li>
                  <li>Harass, stalk, or bother other users via the anonymous communication portal.</li>
                  <li>Attempt to break platform authentication walls or run unauthorized scripts.</li>
                  <li>Reverse engineer, decompile, or copy the source code of the Smart Bin Tag website or PWA environment.</li>
                </ul>
                <p className="text-xs text-rose-300 font-semibold">
                  Suspected violations will lead to immediate profile suspension, tag termination, or reports to local enforcement authorities.
                </p>
              </section>

              {/* 12. Collection Reminder Information */}
              <section id="eula-sec-12" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">12.</span> Collection Reminder Information
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">012</span>
                </div>
                <p>
                  All garbage, recycling, food scrap, and garden waste calendars and schedules rendered in the app are compile-based approximations provided as a digital convenience.
                </p>
                <p>
                  Users remain completely responsible for inspecting official schedules, flyers, or portals dispatched by their respective local council or authority. Smart Bin Tag cannot guarantee the absolute accuracy, update status, change notices, or validity of official council calendars.
                </p>
              </section>

              {/* 13. Availability */}
              <section id="eula-sec-13" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">13.</span> Availability
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">013</span>
                </div>
                <p>
                  We strive to provide reliable and uninterrupted server access. However, because our service relies on external cloud hosting networks and cellular systems, we cannot guarantee that:
                </p>
                <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>The online dashboard or reporting forms will be accessible at all moments.</li>
                  <li>Reminders or messages will always successfully route without cellular packet loss.</li>
                  <li>Updates and notifications will execute in real-time under network failures.</li>
                </ul>
                <p className="text-xs text-emerald-200/70">
                  Temporary downtime for server architecture maintenance or security updates may occur without notice.
                </p>
              </section>

              {/* 14. Software Updates */}
              <section id="eula-sec-14" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">14.</span> Software Updates
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">014</span>
                </div>
                <p>
                  We regularly optimize the Smart Bin Tag platform by publishing hotfixes, UI improvements, browser optimizations, and mandatory security patches.
                </p>
                <p>
                  These updates are applied automatically on our progressive servers and PWAs. Some system updates may require immediate adoption or browser cache refreshes of the platform to maintain secure operational functions.
                </p>
              </section>

              {/* 15. Privacy */}
              <section id="eula-sec-15" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">15.</span> Privacy
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">015</span>
                </div>
                <p>
                  Your personal information is handled with extreme security protocols. Please audit our comprehensive{' '}
                  <button onClick={() => setActiveTab('privacy')} className="text-[#45D153] underline font-bold cursor-pointer">
                    Privacy Policy
                  </button>{' '}
                  to monitor what data variables we store and how they are parsed.
                </p>
                <p>
                  By registering an account with Smart Bin Tag, you agree to our data parsing, notification delivery, and database handling practices in accordance with our legal privacy guidelines.
                </p>
              </section>

              {/* 16. Intellectual Property Protection */}
              <section id="eula-sec-16" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">16.</span> Intellectual Property Protection
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">016</span>
                </div>
                <p>
                  All copyright, database, design patent, proprietary graphics, layouts, logo assets, CSS scripts, and source layouts are owned by Smart Bin Tag.
                </p>
                <p>
                  You may not copy, emulate, modify, decompile, resell, white-label, license, or commercially exploit any software, visual layouts, or product patterns associated without our written legal certification.
                </p>
              </section>

              {/* 17. Disclaimer */}
              <section id="eula-sec-17" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">17.</span> Disclaimer
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">017</span>
                </div>
                <p>Smart Bin Tag assists registered users in mapping, tagging, and organizing physical wheelie containers. We do not guarantee:</p>
                <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>The physical recovery of any stolen, missing, or blown-away bins.</li>
                  <li>The total prevention of theft, tampering, or malicious vandalism.</li>
                  <li>The accuracy of municipal garbage truck schedules or council collections.</li>
                  <li>The error-free transmission of private messages or anonymous report alerts.</li>
                </ul>
                <p className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-emerald-300 text-xs font-mono">
                  The platform and adhesive tag registrations are provided strictly on an "as is" and "as available" basis without warranties of any sort.
                </p>
              </section>

              {/* 18. Limitation of Liability */}
              <section id="eula-sec-18" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">18.</span> Limitation of Liability
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">018</span>
                </div>
                <p>
                  To the maximum extent permitted by applicable law, Smart Bin Tag, its officers, directors, employees, contractors, design engineers, partners, and affiliates shall not be liable for:
                </p>
                <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>Loss, theft, or damage to wheelie bins, containers, or other property.</li>
                  <li>Municipal fines, penalties, or charges incurred by users.</li>
                  <li>Missed waste collections, collection schedule changes, delays, overflowing bins, or spoilage of waste.</li>
                  <li>Loss of data, loss of profits, loss of business, or any indirect, incidental, special, exemplary, punitive, or consequential damages arising from or relating to the use of the App.</li>
                  <li>Temporary unavailability of the App, server outages, notification failures, network interruptions, or communication errors that are beyond our reasonable control.</li>
                </ul>
                <p>
                  The App is provided as a reminder and information service only. Users remain responsible for ensuring that their bins are presented for collection in accordance with their local waste collection authority's requirements.
                </p>
                <p>
                  Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited under applicable law, including liability for:
                </p>
                <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>death or personal injury caused by negligence;</li>
                  <li>fraud or fraudulent misrepresentation; or</li>
                  <li>any other liability that applicable consumer protection laws prohibit from being excluded or limited.</li>
                </ul>
              </section>

              {/* 19. Suspension or Termination */}
              <section id="eula-sec-19" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">19.</span> Suspension or Termination
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">019</span>
                </div>
                <p>
                  We retain full authority to suspend, lock, freeze, or permanently terminate homeowner profiles or register accounts who:
                </p>
                <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                  <li>Violate or breach any paragraph configured in this EULA.</li>
                  <li>Deploy deceitful, malicious, or fabricated reporting entries.</li>
                  <li>Abuse, spam, or harass residents using the proxy chat system.</li>
                  <li>Compromise platform security or integrity.</li>
                </ul>
                <p className="text-xs text-emerald-300">
                  Homeowners may delete their profiles, remove notifications, and de-register tags completely at any time inside the Account Settings view.
                </p>
              </section>

              {/* 20. Changes to this Agreement */}
              <section id="eula-sec-20" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">20.</span> Changes to this Agreement
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">020</span>
                </div>
                <p>
                  We may update, edit, expand, or modify this End User Licence Agreement (EULA) periodically to reflect system updates, regulatory changes, or revised policies.
                </p>
                <p>
                  The updated layout will always be cataloged and viewable inside the application. Continued interaction with Smart Bin Tag after updates are published acts as complete acceptance of the updated terms.
                </p>
              </section>

              {/* 21. Governing Law */}
              <section id="eula-sec-21" className="space-y-3 pt-2 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">21.</span> Governing Law
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">021</span>
                </div>
                <p>
                  This End User Licence Agreement (EULA) and any associated disputes shall be governed by, construed, and enforced in accordance with the laws of England and Wales.
                </p>
                <p>
                  Any disputes or legal actions shall be resolved exclusively in the courts of England and Wales, unless local consumer protection codes strictly require resolution elsewhere.
                </p>
              </section>

              {/* 22. Contact Details */}
              <section id="eula-sec-22" className="space-y-4 pt-2 scroll-mt-24 border-t border-[#064e3f] mt-8">
                <div className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span className="text-[#45D153] font-mono">22.</span> Contact Details
                  </h3>
                  <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">022</span>
                </div>
                <p>
                  For questions, inquiries, complaints, or feedback regarding this End User Licence Agreement (EULA), please contact our administration desk:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#011a14] border border-[#064e3f] rounded-2xl p-5 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-emerald-400 font-bold block uppercase text-[10px]">Company Name</span>
                    <span className="text-white font-bold text-sm">Smart Bin Tag</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-emerald-400 font-bold block uppercase text-[10px]">Official Website</span>
                    <a href="https://smartbintag.com" target="_blank" rel="noreferrer" className="text-[#45D153] hover:underline flex items-center gap-1">
                      <span>https://smartbintag.com</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-emerald-400 font-bold block uppercase text-[10px]">Application Access</span>
                    <a href="https://smartbintagapp.com" target="_blank" rel="noreferrer" className="text-[#45D153] hover:underline flex items-center gap-1">
                      <span>https://smartbintagapp.com</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-emerald-400 font-bold block uppercase text-[10px]">Support Email Desk</span>
                    <a href="mailto:support@smartbintagapp.com" className="text-[#45D153] hover:underline flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>support@smartbintagapp.com</span>
                    </a>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#064e3f]">
                  <button
                    onClick={() => scrollToSection('eula-sec-1')}
                    className="text-xs font-mono font-bold text-[#45D153] hover:underline cursor-pointer"
                  >
                    &uarr; Back to Top of Index
                  </button>
                  <button
                    onClick={onBack}
                    className="px-4 py-2 bg-[#45D153] hover:bg-[#38b544] text-[#02241d] font-mono font-bold text-xs rounded-xl cursor-pointer shadow-md"
                  >
                    Return to Application
                  </button>
                </div>
              </section>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: TERMS OF SERVICE CONTENT (SBT-TOS-2026-V3) */}
        {/* ======================================================== */}
        {activeTab === 'terms' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: DOCUMENT INDEX (Sticky Sidebar) */}
            <div className="lg:col-span-4 bg-[#021c16]/95 border border-[#064e3f] rounded-2xl p-5 shadow-xl lg:sticky lg:top-20 max-h-[85vh] overflow-y-auto custom-scrollbar space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#064e3f]">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#45D153]" />
                  <span className="font-mono text-xs font-black uppercase text-white tracking-wider">
                    DOCUMENT INDEX
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#45D153] font-bold bg-[#064e3f]/50 px-2 py-0.5 rounded">
                  25 Clauses
                </span>
              </div>

              {/* SEARCH TERMS */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH TERMS..."
                  className="w-full bg-[#011a14] border border-[#064e3f] focus:border-[#45D153] rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-emerald-100 placeholder:text-emerald-500/50 outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-white cursor-pointer"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Accordion Controls: EXPAND ALL / COLLAPSE ALL */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={expandAllTerms}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#064e3f]/40 hover:bg-[#064e3f] text-emerald-300 text-[11px] font-mono font-bold rounded-lg border border-[#45D153]/20 transition-all cursor-pointer"
                >
                  <Maximize2 className="h-3 w-3 text-[#45D153]" />
                  <span>EXPAND ALL</span>
                </button>
                <button
                  onClick={collapseAllTerms}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#064e3f]/40 hover:bg-[#064e3f] text-emerald-300 text-[11px] font-mono font-bold rounded-lg border border-[#45D153]/20 transition-all cursor-pointer"
                >
                  <Minimize2 className="h-3 w-3 text-emerald-400" />
                  <span>COLLAPSE ALL</span>
                </button>
              </div>

              {/* Quick Switch Links */}
              <div className="flex flex-col gap-1.5 p-2 bg-[#011a14] rounded-xl border border-[#064e3f]/60 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('eula')}
                  className="text-left text-emerald-300 hover:text-[#45D153] hover:underline flex items-center justify-between py-1 px-2 rounded hover:bg-[#064e3f]/30 cursor-pointer"
                >
                  <span>Read EULA Document</span>
                  <ChevronRight className="h-3 w-3 text-emerald-400" />
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className="text-left text-emerald-300 hover:text-[#45D153] hover:underline flex items-center justify-between py-1 px-2 rounded hover:bg-[#064e3f]/30 cursor-pointer"
                >
                  <span>Read Privacy Policy</span>
                  <ChevronRight className="h-3 w-3 text-emerald-400" />
                </button>
              </div>

              {/* List of Filtered Index Links */}
              <div className="space-y-1 pt-1">
                {filteredTermsSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                      activeSection === sec.id
                        ? 'bg-[#45D153] text-[#02241d] font-bold shadow-md shadow-[#45D153]/10'
                        : 'text-emerald-200/80 hover:bg-[#064e3f]/60 hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">{sec.title}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${
                      activeSection === sec.id
                        ? 'bg-[#02241d] text-[#45D153] font-bold'
                        : 'bg-[#011a14] text-emerald-400 group-hover:bg-[#064e3f]'
                    }`}>
                      {sec.num}
                    </span>
                  </button>
                ))}
                {filteredTermsSections.length === 0 && (
                  <div className="p-4 text-center text-xs font-mono text-emerald-400/60 bg-[#011a14] rounded-xl">
                    No matching clauses found.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Full Terms of Service Content */}
            <div id="legal-document-content" className="lg:col-span-8 bg-[#021c16]/95 border border-[#064e3f] rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6 text-emerald-50 text-sm leading-relaxed">
              
              {/* Document Header */}
              <div className="border-b border-[#064e3f] pb-6 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#45D153]/10 border border-[#45D153]/30 rounded-full text-xs font-mono text-[#45D153] font-bold">
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    <span>TERMS HUB</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-[#064e3f]/40 px-2.5 py-1 rounded-md border border-[#064e3f]">
                    Ref: SBT-TOS-2026-V3
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  Terms of Service | Smart Bin Tag
                </h2>
                
                <p className="text-sm font-semibold text-[#45D153]">
                  The Digital Registration Plate for Your Wheelie Bin
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono text-emerald-200/70">
                  <span className="bg-[#011a14] px-2.5 py-1 rounded border border-[#064e3f]">
                    LAST UPDATED: 13 August 2026
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveTab('eula')} className="text-emerald-300 hover:text-[#45D153] underline cursor-pointer">
                      Read EULA Document
                    </button>
                    <span>&bull;</span>
                    <button onClick={() => setActiveTab('privacy')} className="text-emerald-300 hover:text-[#45D153] underline cursor-pointer">
                      Read Privacy Policy
                    </button>
                  </div>
                </div>

                {searchQuery && (
                  <div className="mt-3 p-2.5 bg-[#45D153]/10 border border-[#45D153]/30 rounded-xl flex items-center justify-between text-xs font-mono text-[#45D153]">
                    <span>Filtered by query: "{searchQuery}" ({filteredTermsSections.length} clauses)</span>
                    <button onClick={() => setSearchQuery('')} className="underline cursor-pointer">Clear Search</button>
                  </div>
                )}
              </div>

              {/* 1. Acceptance of These Terms */}
              <section id="terms-sec-1" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-1')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">1.</span> Acceptance of These Terms
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">01</span>
                    {termsExpandedSections['terms-sec-1'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-1'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      These Terms of Service ("Terms") govern your access to and use of the Smart Bin Tag website, Progressive Web App (PWA), Smart Bin Tag products, and related services.
                    </p>
                    <p>
                      By creating an account, registering a Smart Bin Tag, using our website or application, or accessing any part of the Service, you agree to be legally bound by these Terms.
                    </p>
                    <p className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-300">
                      If you do not agree to these Terms, you must not use Smart Bin Tag.
                    </p>
                  </div>
                )}
              </section>

              {/* 2. About Smart Bin Tag */}
              <section id="terms-sec-2" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-2')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">2.</span> About Smart Bin Tag
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">02</span>
                    {termsExpandedSections['terms-sec-2'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-2'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Smart Bin Tag is a digital platform designed to help users identify, register, and manage wheelie bins and other compatible waste containers.
                    </p>
                    <p className="font-mono font-bold text-[#45D153] text-xs uppercase">Our services include:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Registering Smart Bin Tags</li>
                      <li>Managing multiple registered bins</li>
                      <li>Collection reminders</li>
                      <li>Push, email, and in-app notifications</li>
                      <li>Anonymous reporting of lost or damaged bins</li>
                      <li>Anonymous messaging between finders and registered owners</li>
                      <li>Viewing local waste collection schedules (where available)</li>
                    </ul>
                    <div className="p-3.5 bg-emerald-950/40 border border-[#45D153]/40 rounded-xl text-emerald-200 text-xs font-medium">
                      Smart Bin Tag is an independent private service and is not affiliated with, operated by, or endorsed by any local authority, council, or waste collection provider.
                    </div>
                  </div>
                )}
              </section>

              {/* 3. Eligibility */}
              <section id="terms-sec-3" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-3')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">3.</span> Eligibility
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">03</span>
                    {termsExpandedSections['terms-sec-3'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-3'] && (
                  <div className="space-y-3 pt-1">
                    <p>To use Smart Bin Tag you must:</p>
                    <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Be at least 16 years of age, or the minimum legal age in your jurisdiction.</li>
                      <li>Provide accurate and complete registration information.</li>
                      <li>Keep your account information up to date.</li>
                      <li>Use the Service in accordance with all applicable laws.</li>
                    </ul>
                  </div>
                )}
              </section>

              {/* 4. User Accounts */}
              <section id="terms-sec-4" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-4')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">4.</span> User Accounts
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">04</span>
                    {termsExpandedSections['terms-sec-4'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-4'] && (
                  <div className="space-y-3 pt-1">
                    <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
                    <p className="font-mono font-bold text-[#45D153] text-xs uppercase">You agree to:</p>
                    <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Keep your password secure.</li>
                      <li>Notify us immediately of any suspected unauthorised access.</li>
                      <li>Keep your email address current.</li>
                      <li>Ensure information provided during registration is accurate.</li>
                    </ul>
                    <p className="text-xs text-emerald-200/80">
                      You are responsible for activities carried out using your account unless they result from our failure to maintain reasonable security measures.
                    </p>
                  </div>
                )}
              </section>

              {/* 5. Registering Smart Bin Tags */}
              <section id="terms-sec-5" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-5')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">5.</span> Registering Smart Bin Tags
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">05</span>
                    {termsExpandedSections['terms-sec-5'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-5'] && (
                  <div className="space-y-3 pt-1">
                    <p>By registering a Smart Bin Tag you confirm that:</p>
                    <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>You own the Smart Bin Tag or are authorised to register it.</li>
                      <li>The information provided is accurate.</li>
                      <li>You will not attempt to register tags belonging to another person without permission.</li>
                      <li>You will not tamper with or alter Smart Bin Tag serial numbers.</li>
                      <li>A Smart Bin Tag may only be registered to one account at any one time.</li>
                      <li>Where ownership is disputed, Smart Bin Tag may request reasonable evidence before transferring ownership.</li>
                    </ul>
                  </div>
                )}
              </section>

              {/* 6. Ownership */}
              <section id="terms-sec-6" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-6')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">6.</span> Ownership
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">06</span>
                    {termsExpandedSections['terms-sec-6'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-6'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Registering a Smart Bin Tag does not transfer ownership of a wheelie bin or waste container.
                    </p>
                    <p>
                      Smart Bin Tag only records the digital association between a Smart Bin Tag and a registered account.
                    </p>
                    <p className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-300">
                      Ownership of physical bins remains with the lawful owner, local authority, landlord, housing association, or other relevant organisation.
                    </p>
                  </div>
                )}
              </section>

              {/* 7. Reporting Lost or Damaged Bins */}
              <section id="terms-sec-7" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-7')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">7.</span> Reporting Lost or Damaged Bins
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">07</span>
                    {termsExpandedSections['terms-sec-7'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-7'] && (
                  <div className="space-y-3 pt-1">
                    <p>Members of the public may submit reports regarding lost, found, or damaged Smart Bin Tags.</p>
                    <p className="font-mono font-bold text-[#45D153] text-xs uppercase">Reports must:</p>
                    <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Be truthful.</li>
                      <li>Be submitted in good faith.</li>
                      <li>Not contain unlawful, offensive, misleading, or abusive content.</li>
                    </ul>
                    <p className="text-xs text-rose-300 font-semibold">
                      False reports, spam, harassment, or misuse of the reporting system may result in suspension or termination of access.
                    </p>
                  </div>
                )}
              </section>

              {/* 8. Anonymous Messaging */}
              <section id="terms-sec-8" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-8')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">8.</span> Anonymous Messaging
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">08</span>
                    {termsExpandedSections['terms-sec-8'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-8'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Smart Bin Tag allows members of the public to send messages to registered owners without revealing the owner's personal information.
                    </p>
                    <p className="font-mono font-bold text-[#45D153] text-xs uppercase">Users agree not to use the messaging system to:</p>
                    <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Send spam.</li>
                      <li>Harass other users.</li>
                      <li>Send unlawful or offensive material.</li>
                      <li>Advertise products or services.</li>
                      <li>Threaten or intimidate others.</li>
                    </ul>
                    <p className="text-xs text-emerald-200/80">
                      We reserve the right to review reports of misuse and take appropriate action.
                    </p>
                  </div>
                )}
              </section>

              {/* 9. Collection Reminders */}
              <section id="terms-sec-9" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-9')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">9.</span> Collection Reminders
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">09</span>
                    {termsExpandedSections['terms-sec-9'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-9'] && (
                  <div className="space-y-3 pt-1">
                    <p>Collection reminders are provided for convenience only.</p>
                    <p>
                      Reminder accuracy depends on information provided by users, local authority schedules, notification permissions, internet connectivity, and third-party services.
                    </p>
                    <p className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-300">
                      Users remain responsible for confirming official collection dates with their local waste collection authority.
                    </p>
                  </div>
                )}
              </section>

              {/* 10. Push Notifications */}
              <section id="terms-sec-10" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-10')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">10.</span> Push Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">010</span>
                    {termsExpandedSections['terms-sec-10'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-10'] && (
                  <div className="space-y-3 pt-1">
                    <p>Smart Bin Tag may send push notifications relating to:</p>
                    <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Collection reminders</li>
                      <li>Lost or found bin reports</li>
                      <li>Damaged bin reports</li>
                      <li>Security alerts</li>
                      <li>Service announcements</li>
                    </ul>
                    <p className="text-xs text-emerald-200/80">
                      You may change your notification preferences at any time through your account settings.
                    </p>
                  </div>
                )}
              </section>

              {/* 11. Email Communications */}
              <section id="terms-sec-11" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-11')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">11.</span> Email Communications
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">011</span>
                    {termsExpandedSections['terms-sec-11'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-11'] && (
                  <div className="space-y-3 pt-1">
                    <p>We may send emails relating to:</p>
                    <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Account verification</li>
                      <li>Password resets</li>
                      <li>Collection reminders</li>
                      <li>Community reports</li>
                      <li>Important service updates</li>
                    </ul>
                    <p className="text-xs text-emerald-200/80">
                      Marketing emails will only be sent where you have chosen to receive them.
                    </p>
                  </div>
                )}
              </section>

              {/* 12. Apple AirTag & Third-Party Tracking Devices */}
              <section id="terms-sec-12" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-12')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">12.</span> Apple AirTag & Third-Party Tracking Devices
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">012</span>
                    {termsExpandedSections['terms-sec-12'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-12'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Certain Smart Bin Tag products are designed to accommodate Apple AirTags or compatible third-party Bluetooth tracking devices.
                    </p>
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2 text-xs">
                      <p className="font-mono font-bold text-[#45D153] uppercase">Smart Bin Tag:</p>
                      <ul className="space-y-1.5 pl-4 list-disc text-emerald-100/80">
                        <li>Does not manufacture these devices.</li>
                        <li>Does not operate or monitor these devices.</li>
                        <li>Does not receive tracking information from these devices.</li>
                        <li>Has no access to Apple Find My, Samsung SmartThings Find, or similar tracking networks.</li>
                      </ul>
                    </div>
                    <p className="text-xs text-emerald-200/70">
                      Users remain solely responsible for the installation, maintenance, battery replacement, and lawful use of third-party tracking devices.
                    </p>
                  </div>
                )}
              </section>

              {/* 13. Availability of the Service */}
              <section id="terms-sec-13" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-13')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">13.</span> Availability of the Service
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">013</span>
                    {termsExpandedSections['terms-sec-13'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-13'] && (
                  <div className="space-y-3 pt-1">
                    <p>We aim to provide a reliable and secure service but do not guarantee uninterrupted availability.</p>
                    <p className="font-mono font-bold text-[#45D153] text-xs uppercase">The Service may occasionally be unavailable due to:</p>
                    <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Maintenance</li>
                      <li>Software updates</li>
                      <li>Network failures</li>
                      <li>Third-party service interruptions</li>
                      <li>Circumstances beyond our reasonable control</li>
                    </ul>
                  </div>
                )}
              </section>

              {/* 14. Acceptable Use */}
              <section id="terms-sec-14" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-14')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">14.</span> Acceptable Use
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">014</span>
                    {termsExpandedSections['terms-sec-14'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-14'] && (
                  <div className="space-y-3 pt-1">
                    <p className="font-mono font-bold text-[#45D153] text-xs uppercase">You agree not to:</p>
                    <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Attempt to gain unauthorised access to our systems.</li>
                      <li>Reverse engineer or copy our software.</li>
                      <li>Upload malicious software.</li>
                      <li>Register fraudulent Smart Bin Tags.</li>
                      <li>Submit false reports.</li>
                      <li>Harass or abuse other users.</li>
                      <li>Impersonate another person or organisation.</li>
                      <li>Interfere with the operation or security of the Service.</li>
                    </ul>
                    <p className="text-xs text-rose-300 font-semibold">
                      We may suspend or terminate accounts that breach these Terms.
                    </p>
                  </div>
                )}
              </section>

              {/* 15. Intellectual Property */}
              <section id="terms-sec-15" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-15')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">15.</span> Intellectual Property
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">015</span>
                    {termsExpandedSections['terms-sec-15'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-15'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      All intellectual property rights in Smart Bin Tag, including software, source code, databases (powered by Nhost database infrastructure), trademarks, logos, graphics, website content, and documentation, remain the exclusive property of Smart Bin Tag.
                    </p>
                    <p className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-300">
                      Nothing in these Terms transfers ownership of any intellectual property to you.
                    </p>
                  </div>
                )}
              </section>

              {/* 16. User Content */}
              <section id="terms-sec-16" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-16')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">16.</span> User Content
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">016</span>
                    {termsExpandedSections['terms-sec-16'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-16'] && (
                  <div className="space-y-3 pt-1">
                    <p>You retain ownership of photographs, messages, and other content that you submit.</p>
                    <p>
                      By submitting content, you grant Smart Bin Tag a non-exclusive, worldwide, royalty-free licence to host, store, process, transmit, and display that content solely for the purpose of operating and improving the Service.
                    </p>
                    <p className="text-xs text-emerald-200/80">
                      You confirm that you have the necessary rights to submit any content you upload.
                    </p>
                  </div>
                )}
              </section>

              {/* 17. Disclaimer */}
              <section id="terms-sec-17" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-17')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">17.</span> Disclaimer
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">017</span>
                    {termsExpandedSections['terms-sec-17'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-17'] && (
                  <div className="space-y-3 pt-1">
                    <p>Smart Bin Tag is provided as an information and notification service.</p>
                    <p className="font-mono font-bold text-[#45D153] text-xs uppercase">We do not guarantee:</p>
                    <ul className="space-y-1 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Recovery of lost or stolen bins.</li>
                      <li>Prevention of theft or vandalism.</li>
                      <li>Accuracy of collection schedules.</li>
                      <li>Delivery of every notification.</li>
                      <li>Continuous availability of the Service.</li>
                    </ul>
                    <p className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-300">
                      The Service is provided on an "as is" and "as available" basis to the maximum extent permitted by law.
                    </p>
                  </div>
                )}
              </section>

              {/* 18. Limitation of Liability */}
              <section id="terms-sec-18" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-18')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">18.</span> Limitation of Liability
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">018</span>
                    {termsExpandedSections['terms-sec-18'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-18'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      To the maximum extent permitted by applicable law, Smart Bin Tag, its officers, directors, employees, contractors, affiliates, and partners shall not be liable for:
                    </p>
                    <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Loss, theft, or damage to wheelie bins or other property.</li>
                      <li>Municipal fines, penalties, or charges.</li>
                      <li>Missed waste collections, schedule changes, delays, overflowing bins, or spoilage of waste.</li>
                      <li>Loss of data, loss of profits, loss of business, or any indirect, incidental, special, exemplary, punitive, or consequential damages arising from or relating to the use of the Service.</li>
                      <li>Temporary unavailability of the Service, notification failures, server outages, network interruptions, or communication failures beyond our reasonable control.</li>
                    </ul>
                    <p className="text-xs text-emerald-200/80">
                      The Service is provided as a reminder and information platform only. Users remain responsible for presenting their bins for collection in accordance with the requirements of their local waste collection authority.
                    </p>
                    <div className="p-3.5 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2 text-xs">
                      <p className="font-mono font-bold text-[#45D153] uppercase">
                        Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited, including liability for:
                      </p>
                      <ul className="space-y-1 pl-4 list-disc text-emerald-100/80">
                        <li>Death or personal injury caused by negligence.</li>
                        <li>Fraud or fraudulent misrepresentation.</li>
                        <li>Any other liability that applicable law prohibits from being excluded or limited.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </section>

              {/* 19. Indemnity */}
              <section id="terms-sec-19" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-19')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">19.</span> Indemnity
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">019</span>
                    {termsExpandedSections['terms-sec-19'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-19'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      You agree to indemnify and hold harmless Smart Bin Tag, its officers, employees, contractors, and affiliates from claims, damages, losses, liabilities, and expenses arising from:
                    </p>
                    <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>Your breach of these Terms.</li>
                      <li>Your unlawful conduct.</li>
                      <li>Your misuse of the Service.</li>
                      <li>Your infringement of another person's rights.</li>
                    </ul>
                  </div>
                )}
              </section>

              {/* 20. Suspension and Termination */}
              <section id="terms-sec-20" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-20')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">20.</span> Suspension and Termination
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">020</span>
                    {termsExpandedSections['terms-sec-20'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-20'] && (
                  <div className="space-y-3 pt-1">
                    <p>We may suspend or terminate your account if we reasonably believe that:</p>
                    <ul className="space-y-1.5 pl-5 list-disc text-emerald-100/90 text-xs sm:text-sm">
                      <li>These Terms have been breached.</li>
                      <li>Fraudulent or malicious activity has occurred.</li>
                      <li>The security or integrity of the Service is at risk.</li>
                      <li>Continued access could adversely affect other users or the Service.</li>
                    </ul>
                    <p className="text-xs text-emerald-300">
                      You may delete your account at any time through your account settings.
                    </p>
                  </div>
                )}
              </section>

              {/* 21. Changes to the Service */}
              <section id="terms-sec-21" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-21')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">21.</span> Changes to the Service
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">021</span>
                    {termsExpandedSections['terms-sec-21'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-21'] && (
                  <div className="space-y-3 pt-1">
                    <p>We may add, modify, suspend, or discontinue features or functionality at any time.</p>
                    <p className="text-xs text-emerald-200/80">
                      Where changes materially affect the Service, we will make reasonable efforts to notify users.
                    </p>
                  </div>
                )}
              </section>

              {/* 22. Changes to These Terms */}
              <section id="terms-sec-22" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-22')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">22.</span> Changes to These Terms
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">022</span>
                    {termsExpandedSections['terms-sec-22'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-22'] && (
                  <div className="space-y-3 pt-1">
                    <p>We may update these Terms from time to time.</p>
                    <p>
                      Where appropriate, we will notify users of significant changes through the website, application, or email.
                    </p>
                    <p className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-300">
                      Your continued use of the Service after changes become effective constitutes acceptance of the updated Terms.
                    </p>
                  </div>
                )}
              </section>

              {/* 23. Governing Law */}
              <section id="terms-sec-23" className="space-y-3 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-23')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">23.</span> Governing Law
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">023</span>
                    {termsExpandedSections['terms-sec-23'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-23'] && (
                  <div className="space-y-3 pt-1">
                    <p>These Terms are governed by the laws of England and Wales.</p>
                    <p className="text-xs text-emerald-200/80">
                      Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales, except where applicable consumer protection laws provide otherwise.
                    </p>
                  </div>
                )}
              </section>

              {/* 24. Contact Information */}
              <section id="terms-sec-24" className="space-y-4 pt-2 scroll-mt-24 border-b border-[#064e3f]/40 pb-5">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-24')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">24.</span> Contact Information
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">024</span>
                    {termsExpandedSections['terms-sec-24'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-24'] && (
                  <div className="space-y-4 pt-1">
                    <p>If you have any questions regarding these Terms, please contact us:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#011a14] border border-[#064e3f] rounded-2xl p-5 text-xs font-mono">
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-bold block uppercase text-[10px]">Company Name</span>
                        <span className="text-white font-bold text-sm">Smart Bin Tag</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-bold block uppercase text-[10px]">Official Website</span>
                        <a href="https://smartbintag.com" target="_blank" rel="noreferrer" className="text-[#45D153] hover:underline flex items-center gap-1">
                          <span>https://smartbintag.com</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-bold block uppercase text-[10px]">Application Access</span>
                        <a href="https://smartbintagapp.com" target="_blank" rel="noreferrer" className="text-[#45D153] hover:underline flex items-center gap-1">
                          <span>https://smartbintagapp.com</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-bold block uppercase text-[10px]">Email Desk</span>
                        <a href="mailto:support@smartbintagapp.com" className="text-[#45D153] hover:underline flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>support@smartbintagapp.com</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* 25. Acceptance */}
              <section id="terms-sec-25" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleTermsSection('terms-sec-25')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">25.</span> Acceptance
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">025</span>
                    {termsExpandedSections['terms-sec-25'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {termsExpandedSections['terms-sec-25'] && (
                  <div className="space-y-3 pt-1">
                    <p>During registration you must actively confirm that you have read and agree to these Terms of Service.</p>
                    <p className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-300">
                      By creating an account, registering a Smart Bin Tag, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms.
                    </p>
                  </div>
                )}
              </section>

              {/* CORPORATE CERTIFICATION SIGN-OFF */}
              <div className="mt-8 pt-6 border-t border-[#064e3f] space-y-3">
                <div className="p-4 bg-[#011a14] border border-[#45D153]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#45D153] tracking-widest uppercase block">
                      CORPORATE CERTIFICATION SIGN-OFF
                    </span>
                    <p className="text-xs font-mono text-emerald-200 font-bold">
                      Smart Bin Tag Licensing Council • © 2026. All Rights Reserved.
                    </p>
                    <p className="text-[11px] font-mono text-emerald-400/60">
                      Document Ref: SBT-TOS-2026-V3 • Enforced under the Laws of England & Wales
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollToSection('terms-sec-1')}
                      className="px-3 py-2 bg-[#064e3f]/50 hover:bg-[#064e3f] text-[#45D153] text-xs font-mono font-bold rounded-xl border border-[#45D153]/20 cursor-pointer"
                    >
                      &uarr; Top of Terms
                    </button>
                    <button
                      onClick={onBack}
                      className="px-4 py-2 bg-[#45D153] hover:bg-[#38b544] text-[#02241d] font-mono font-bold text-xs rounded-xl cursor-pointer shadow-md"
                    >
                      Return to App
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: COOKIE POLICY CONTENT (SBT-CK-2026-V1) */}
        {/* ======================================================== */}
        {activeTab === 'cookie' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: TABLE OF CONTENTS (Sticky Sidebar) */}
            <div className="lg:col-span-4 bg-[#021c16]/95 border border-[#064e3f] rounded-2xl p-5 shadow-xl lg:sticky lg:top-20 max-h-[85vh] overflow-y-auto custom-scrollbar space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#064e3f]">
                <div className="flex items-center gap-2">
                  <Cookie className="h-4 w-4 text-[#45D153]" />
                  <span className="text-xs font-mono font-black text-white uppercase tracking-wider">
                    DOCUMENT INDEX
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-[#064e3f]/60 px-2 py-0.5 rounded">
                  14 Clauses
                </span>
              </div>

              {/* SEARCH TERMS */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-emerald-400/80 uppercase tracking-wider block">
                  SEARCH TERMS
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-400/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cookie policy..."
                    className="w-full pl-9 pr-3 py-2 bg-[#011a14] border border-[#064e3f] focus:border-[#45D153] rounded-xl text-xs text-white placeholder-emerald-200/30 outline-none font-mono transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400/60 hover:text-white text-xs"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {/* EXPAND ALL / COLLAPSE ALL TOGGLES */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={expandAllCookies}
                  className="px-2.5 py-1.5 bg-[#064e3f]/40 hover:bg-[#064e3f] text-emerald-200 text-[10px] font-mono font-bold rounded-lg border border-emerald-500/20 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Maximize2 className="h-3 w-3 text-[#45D153]" />
                  <span>EXPAND ALL</span>
                </button>
                <button
                  type="button"
                  onClick={collapseAllCookies}
                  className="px-2.5 py-1.5 bg-[#064e3f]/40 hover:bg-[#064e3f] text-emerald-200 text-[10px] font-mono font-bold rounded-lg border border-emerald-500/20 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Minimize2 className="h-3 w-3 text-emerald-400" />
                  <span>COLLAPSE ALL</span>
                </button>
              </div>

              {/* CLAUSE NAVIGATION LIST */}
              <div className="space-y-1 pt-2">
                {filteredCookieSections.map((sec) => {
                  const isCurrentActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between group cursor-pointer ${
                        isCurrentActive 
                          ? 'bg-[#45D153]/20 text-[#45D153] font-bold border border-[#45D153]/30 shadow-sm' 
                          : 'text-emerald-100/70 hover:bg-[#064e3f]/40 hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-2">{sec.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        isCurrentActive 
                          ? 'bg-[#45D153] text-[#02241d]' 
                          : 'bg-[#064e3f]/50 text-emerald-300 group-hover:bg-[#064e3f]'
                      }`}>
                        {sec.num}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* QUICK DOCUMENT NAVIGATOR */}
              <div className="pt-4 border-t border-[#064e3f] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 block">
                  Other Documents
                </span>
                <button
                  onClick={() => {
                    setActiveTab('privacy');
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 bg-[#011a14] hover:bg-[#064e3f]/50 border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-200 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Read Privacy Policy</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#45D153]" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('terms');
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 bg-[#011a14] hover:bg-[#064e3f]/50 border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-200 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Read Terms of Service</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#45D153]" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('eula');
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 bg-[#011a14] hover:bg-[#064e3f]/50 border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-200 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Read EULA Document</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#45D153]" />
                </button>
              </div>

            </div>

            {/* Right Column: DOCUMENT CONTENT ACCORDION */}
            <div id="legal-document-content" className="lg:col-span-8 bg-[#021c16]/95 border border-[#064e3f] rounded-2xl p-6 sm:p-8 shadow-xl space-y-8 text-emerald-100/90 text-sm leading-relaxed">
              
              {/* Document Banner */}
              <div className="border-b border-[#064e3f] pb-6 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#45D153]/15 text-[#45D153] border border-[#45D153]/30 rounded-lg text-xs font-mono font-bold">
                    COOKIE HUB
                  </span>
                  <span className="px-2.5 py-1 bg-[#064e3f]/60 text-emerald-300 border border-[#064e3f] rounded-lg text-xs font-mono">
                    Ref: SBT-CK-2026-V1
                  </span>
                  <span className="px-2.5 py-1 bg-[#064e3f]/40 text-emerald-300 rounded-lg text-xs font-mono ml-auto">
                    LAST UPDATED: 13 August 2026
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Cookie Policy | Smart Bin Tag
                </h2>
                <p className="text-emerald-200/80 font-mono text-xs">
                  How we use cookies and similar technologies to power your application
                </p>
              </div>

              {/* 1. Introduction */}
              <section id="cookie-sec-1" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-1')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">1.</span> Introduction
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">01</span>
                    {cookieExpandedSections['cookie-sec-1'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-1'] && (
                  <div className="space-y-3 pt-1">
                    <p>Welcome to Smart Bin Tag.</p>
                    <p>
                      This Cookie Policy explains how Smart Bin Tag (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) uses cookies and similar technologies when you visit our website, install or use our Progressive Web App (PWA), or use any of our related services.
                    </p>
                    <p>
                      This Cookie Policy should be read alongside our Privacy Policy, Terms of Service, and End User Licence Agreement (EULA).
                    </p>
                    <p>
                      By continuing to use Smart Bin Tag, you acknowledge this Cookie Policy and your selected cookie preferences.
                    </p>
                  </div>
                )}
              </section>

              {/* 2. What Are Cookies? */}
              <section id="cookie-sec-2" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-2')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">2.</span> What Are Cookies?
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">02</span>
                    {cookieExpandedSections['cookie-sec-2'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-2'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Cookies are small text files that are stored on your browser or device when you visit a website or use certain online services.
                    </p>
                    <p>
                      Smart Bin Tag also uses similar technologies, including Local Storage, IndexedDB, service workers, and secure authentication tokens, to provide functionality within our Progressive Web App (PWA).
                    </p>
                    <p>These technologies help us:</p>
                    <ul className="list-disc pl-5 space-y-1 text-emerald-200/90 font-mono text-xs">
                      <li>Keep you securely signed in.</li>
                      <li>Remember your preferences.</li>
                      <li>Improve application performance.</li>
                      <li>Protect your account.</li>
                      <li>Support offline functionality where available.</li>
                      <li>Maintain the security and reliability of our services.</li>
                    </ul>
                    <p>
                      Some cookies are deleted when you close your browser (session cookies), while others remain for a limited period to remember your preferences.
                    </p>
                  </div>
                )}
              </section>

              {/* 3. Why We Use Cookies */}
              <section id="cookie-sec-3" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-3')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">3.</span> Why We Use Cookies
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">03</span>
                    {cookieExpandedSections['cookie-sec-3'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-3'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Smart Bin Tag uses cookies and similar technologies only where necessary to operate, secure, and improve our services.
                    </p>
                    <p>These technologies help us:</p>
                    <ul className="list-disc pl-5 space-y-1 text-emerald-200/90 font-mono text-xs">
                      <li>Authenticate users securely.</li>
                      <li>Maintain active login sessions.</li>
                      <li>Remember cookie preferences.</li>
                      <li>Remember notification settings.</li>
                      <li>Store accessibility and interface preferences.</li>
                      <li>Improve website and application performance.</li>
                      <li>Protect against fraud and unauthorised access.</li>
                      <li>Support the operation of our Progressive Web App (PWA).</li>
                    </ul>
                    <div className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-300">
                      We do not sell, rent, or trade cookie information to advertisers or data brokers.
                    </div>
                  </div>
                )}
              </section>

              {/* 4. Types of Cookies We Use */}
              <section id="cookie-sec-4" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-4')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">4.</span> Types of Cookies We Use
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">04</span>
                    {cookieExpandedSections['cookie-sec-4'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-4'] && (
                  <div className="space-y-4 pt-1">
                    
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-[#45D153] uppercase font-mono">
                          A. STRICTLY NECESSARY COOKIES
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#064e3f] text-white rounded">
                          ESSENTIAL
                        </span>
                      </div>
                      <p className="text-xs">These cookies and similar technologies are essential for Smart Bin Tag to operate securely.</p>
                      <p className="text-xs font-bold text-emerald-300">They may be used for:</p>
                      <ul className="list-disc pl-5 space-y-0.5 text-emerald-200/90 font-mono text-xs">
                        <li>User authentication</li>
                        <li>Secure login sessions</li>
                        <li>Nhost Authentication</li>
                        <li>CSRF protection</li>
                        <li>Security monitoring</li>
                        <li>Session management</li>
                      </ul>
                      <p className="text-[11px] text-emerald-400/80 font-mono pt-1">
                        These cookies cannot be disabled because the Service cannot function correctly without them.
                      </p>
                    </div>

                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <h4 className="text-sm font-black text-emerald-300 uppercase font-mono">
                        B. FUNCTIONAL COOKIES
                      </h4>
                      <p className="text-xs font-bold text-emerald-300">These remember your preferences, including:</p>
                      <ul className="list-disc pl-5 space-y-0.5 text-emerald-200/90 font-mono text-xs">
                        <li>Theme selection</li>
                        <li>Language preferences</li>
                        <li>Accessibility settings</li>
                        <li>Reminder schedules</li>
                        <li>Notification preferences</li>
                        <li>User interface settings</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <h4 className="text-sm font-black text-emerald-300 uppercase font-mono">
                        C. ANALYTICS COOKIES
                      </h4>
                      <p className="text-xs">Where enabled, analytics technologies help us understand how Smart Bin Tag is used.</p>
                      <p className="text-xs font-bold text-emerald-300">Examples include:</p>
                      <ul className="list-disc pl-5 space-y-0.5 text-emerald-200/90 font-mono text-xs">
                        <li>Popular pages</li>
                        <li>Browser types</li>
                        <li>Device categories</li>
                        <li>Operating systems</li>
                        <li>Error reports</li>
                        <li>Performance statistics</li>
                      </ul>
                      <p className="text-[11px] text-emerald-400/80 font-mono pt-1">
                        Analytics cookies are only used where you have provided your consent.
                      </p>
                    </div>

                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <h4 className="text-sm font-black text-emerald-300 uppercase font-mono">
                        D. PERFORMANCE TECHNOLOGIES
                      </h4>
                      <p className="text-xs font-bold text-emerald-300">Performance cookies and similar technologies help improve:</p>
                      <ul className="list-disc pl-5 space-y-0.5 text-emerald-200/90 font-mono text-xs">
                        <li>Loading speed</li>
                        <li>Resource caching</li>
                        <li>Application responsiveness</li>
                        <li>Progressive Web App functionality</li>
                        <li>Overall reliability</li>
                      </ul>
                    </div>

                  </div>
                )}
              </section>

              {/* 5. Notification Preferences & Local Storage */}
              <section id="cookie-sec-5" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-5')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">5.</span> Notification Preferences &amp; Local Storage
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">05</span>
                    {cookieExpandedSections['cookie-sec-5'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-5'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Smart Bin Tag stores notification preferences, reminder schedules, and selected application settings within your account.
                    </p>
                    <p>
                      Certain non-sensitive settings may also be stored locally on your device using browser storage technologies such as Local Storage or IndexedDB to improve performance and support offline functionality.
                    </p>
                    <p>
                      These settings are synchronised securely with your Smart Bin Tag account where appropriate.
                    </p>
                  </div>
                )}
              </section>

              {/* 6. Progressive Web App (PWA) Storage */}
              <section id="cookie-sec-6" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-6')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">6.</span> Progressive Web App (PWA) Storage
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">06</span>
                    {cookieExpandedSections['cookie-sec-6'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-6'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Smart Bin Tag uses modern Progressive Web App (PWA) technologies, including service workers and browser storage, to improve performance and reliability.
                    </p>
                    <p>These technologies may:</p>
                    <ul className="list-disc pl-5 space-y-1 text-emerald-200/90 font-mono text-xs">
                      <li>Cache application resources.</li>
                      <li>Improve loading times.</li>
                      <li>Enable limited offline functionality.</li>
                      <li>Support installation of the application on compatible devices.</li>
                    </ul>
                    <div className="p-3 bg-[#011a14] border border-[#064e3f] rounded-xl text-xs font-mono text-emerald-300">
                      Sensitive personal information is not intentionally stored in browser cookies. Authentication and account security are managed using secure technologies provided by Nhost database and authentication.
                    </div>
                  </div>
                )}
              </section>

              {/* 7. Third-Party Services */}
              <section id="cookie-sec-7" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-7')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">7.</span> Third-Party Services
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">07</span>
                    {cookieExpandedSections['cookie-sec-7'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-7'] && (
                  <div className="space-y-4 pt-1">
                    <p>Smart Bin Tag relies on trusted third-party providers to operate certain features of the Service.</p>
                    
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <h4 className="text-xs font-black uppercase text-[#45D153] font-mono">
                        NHOST DATABASE &amp; CLOUD SERVICES
                      </h4>
                      <ul className="list-disc pl-5 space-y-0.5 text-xs text-emerald-200/90 font-mono">
                        <li>Nhost Authentication</li>
                        <li>Nhost PostgreSQL / GraphQL Database</li>
                        <li>Nhost Storage</li>
                        <li>Nhost Functions &amp; Cloud Messaging</li>
                      </ul>
                      <p className="text-xs text-emerald-100/80 pt-1">
                        These services securely process information on our behalf to provide authentication, database storage, file storage, and push notifications.
                      </p>
                    </div>

                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                      <h4 className="text-xs font-black uppercase text-white font-mono">
                        GOOGLE MAPS PLATFORM
                      </h4>
                      <p className="text-xs text-emerald-100/80">
                        Where enabled, Google Maps is used to display optional map information relating to lost or found Smart Bin Tags.
                      </p>
                    </div>

                    <p className="text-xs">
                      These providers may use cookies or similar technologies necessary for the secure operation of their services.
                    </p>
                    <p className="text-xs">
                      For more information about how these providers process personal information, please refer to their respective Privacy Policies.
                    </p>
                  </div>
                )}
              </section>

              {/* 8. Apple AirTag & Third-Party Tracking Devices */}
              <section id="cookie-sec-8" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-8')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">8.</span> Apple AirTag &amp; Third-Party Tracking Devices
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">08</span>
                    {cookieExpandedSections['cookie-sec-8'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-8'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Certain Smart Bin Tag products are designed to accommodate Apple AirTags or other compatible Bluetooth tracking devices.
                    </p>
                    <p className="font-bold text-white">Smart Bin Tag:</p>
                    <ul className="list-disc pl-5 space-y-1 text-emerald-200/90 font-mono text-xs">
                      <li>Does not access AirTag location information.</li>
                      <li>Does not receive Bluetooth tracking data.</li>
                      <li>Does not integrate with Apple&apos;s Find My network or similar tracking services.</li>
                    </ul>
                    <p>
                      Any tracking performed by these devices operates entirely within the manufacturer&apos;s own ecosystem and is governed by that manufacturer&apos;s Privacy Policy and Terms of Service.
                    </p>
                  </div>
                )}
              </section>

              {/* 9. Cookie Consent & Management */}
              <section id="cookie-sec-9" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-9')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">9.</span> Cookie Consent &amp; Management
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">09</span>
                    {cookieExpandedSections['cookie-sec-9'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-9'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      When you first visit Smart Bin Tag, you may be presented with a cookie consent banner.
                    </p>
                    <p>Depending on your location, you may choose to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-emerald-200/90 font-mono text-xs">
                      <li>Accept all cookies.</li>
                      <li>Reject non-essential cookies.</li>
                      <li>Manage individual cookie preferences.</li>
                    </ul>
                    <p>
                      Essential cookies required for the operation and security of the Service cannot be disabled through the consent banner.
                    </p>
                    <p>
                      You may also control cookies through your browser settings. Please note that disabling essential cookies may affect the functionality of the Service.
                    </p>
                  </div>
                )}
              </section>

              {/* 10. Privacy */}
              <section id="cookie-sec-10" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-10')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">10.</span> Privacy
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">010</span>
                    {cookieExpandedSections['cookie-sec-10'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-10'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      Cookies and similar technologies do not change how Smart Bin Tag collects or processes your personal information.
                    </p>
                    <p>
                      Information collected through cookies is handled in accordance with our Privacy Policy.
                    </p>
                    <p>
                      For full details about the personal information we collect, how it is used, how long it is retained, and your privacy rights, please refer to our Privacy Policy.
                    </p>
                  </div>
                )}
              </section>

              {/* 11. Cookie Retention */}
              <section id="cookie-sec-11" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-11')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">11.</span> Cookie Retention
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">011</span>
                    {cookieExpandedSections['cookie-sec-11'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-11'] && (
                  <div className="space-y-3 pt-1">
                    <p>Cookie and storage retention periods vary depending on their purpose.</p>
                    <p className="font-bold text-white">Generally:</p>
                    
                    {/* Retention Table */}
                    <div className="overflow-x-auto border border-[#064e3f] rounded-xl bg-[#011a14]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#021c16] border-b border-[#064e3f] text-[#45D153]">
                          <tr>
                            <th className="p-3">Technology</th>
                            <th className="p-3">Typical Retention</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#064e3f]/60 text-emerald-100/90">
                          <tr>
                            <td className="p-3 font-bold text-white">Session Cookies</td>
                            <td className="p-3">Until the browser session ends</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-white">Authentication Sessions (Nhost JWT)</td>
                            <td className="p-3">While required for secure login</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-white">Preference Settings</td>
                            <td className="p-3">Until changed or removed</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-white">Local Storage &amp; IndexedDB</td>
                            <td className="p-3">Until cleared by the user or application</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-bold text-white">Analytics Cookies</td>
                            <td className="p-3">In accordance with your consent and the provider&apos;s retention settings</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-xs text-emerald-300/80">
                      Retention periods may change as our services evolve.
                    </p>
                  </div>
                )}
              </section>

              {/* 12. Children's Privacy */}
              <section id="cookie-sec-12" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-12')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">12.</span> Children&apos;s Privacy
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">012</span>
                    {cookieExpandedSections['cookie-sec-12'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-12'] && (
                  <div className="space-y-3 pt-1">
                    <p>Smart Bin Tag is intended for users aged 16 years or older.</p>
                    <p>
                      We do not knowingly use cookies or similar technologies to collect personal information from children under the age of 16.
                    </p>
                    <p>
                      If you believe we have unintentionally collected information relating to a child, please contact us so we can investigate and, where appropriate, remove the information.
                    </p>
                  </div>
                )}
              </section>

              {/* 13. Changes to this Cookie Policy */}
              <section id="cookie-sec-13" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-13')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">13.</span> Changes to this Cookie Policy
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">013</span>
                    {cookieExpandedSections['cookie-sec-13'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-13'] && (
                  <div className="space-y-3 pt-1">
                    <p>
                      We may update this Cookie Policy from time to time to reflect changes in our services, applicable laws, or the technologies we use.
                    </p>
                    <p>
                      The latest version will always be available through our website and application.
                    </p>
                    <p>
                      Your continued use of Smart Bin Tag after any updates constitutes acceptance of the revised Cookie Policy.
                    </p>
                  </div>
                )}
              </section>

              {/* 14. Contact Us */}
              <section id="cookie-sec-14" className="space-y-3 pt-2 scroll-mt-24">
                <div 
                  onClick={() => toggleCookieSection('cookie-sec-14')}
                  className="flex items-center justify-between border-b border-[#064e3f]/60 pb-2 cursor-pointer group"
                >
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 group-hover:text-[#45D153] transition-colors">
                    <span className="text-[#45D153] font-mono">14.</span> Contact Us
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#45D153] font-bold bg-[#064e3f]/40 px-2 py-0.5 rounded">014</span>
                    {cookieExpandedSections['cookie-sec-14'] ? <ChevronDown className="h-4 w-4 text-emerald-400" /> : <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </div>
                </div>
                {cookieExpandedSections['cookie-sec-14'] && (
                  <div className="space-y-4 pt-1">
                    <p>
                      If you have any questions about this Cookie Policy or how Smart Bin Tag uses cookies and similar technologies, please contact us.
                    </p>
                    <div className="p-4 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2 text-xs font-mono">
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-bold block uppercase text-[10px]">Company Name</span>
                        <span className="text-white font-bold text-sm">Smart Bin Tag</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-bold block uppercase text-[10px]">Website</span>
                        <a href="https://smartbintag.com" target="_blank" rel="noreferrer" className="text-[#45D153] hover:underline flex items-center gap-1">
                          <span>https://smartbintag.com</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-bold block uppercase text-[10px]">Application</span>
                        <a href="https://smartbintagapp.com" target="_blank" rel="noreferrer" className="text-[#45D153] hover:underline flex items-center gap-1">
                          <span>https://smartbintagapp.com</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-bold block uppercase text-[10px]">Email</span>
                        <a href="mailto:support@smartbintagapp.com" className="text-[#45D153] hover:underline flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>support@smartbintagapp.com</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* COOKIE REGULATORY COMPLIANCE SIGN-OFF */}
              <div className="mt-8 pt-6 border-t border-[#064e3f] space-y-3">
                <div className="p-4 bg-[#011a14] border border-[#45D153]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#45D153] tracking-widest uppercase block">
                      COOKIE REGULATORY COMPLIANCE
                    </span>
                    <p className="text-xs font-mono text-emerald-200 font-bold">
                      UK GDPR &amp; PECR Cookie Framework • &copy; 2026. All Rights Reserved.
                    </p>
                    <p className="text-[11px] font-mono text-emerald-400/60">
                      Document Ref: SBT-CK-2026-V1 • Powered by Nhost Database Infrastructure
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollToSection('cookie-sec-1')}
                      className="px-3 py-2 bg-[#064e3f]/50 hover:bg-[#064e3f] text-[#45D153] text-xs font-mono font-bold rounded-xl border border-[#45D153]/20 cursor-pointer"
                    >
                      &uarr; Top of Cookies
                    </button>
                    <button
                      onClick={onBack}
                      className="px-4 py-2 bg-[#45D153] hover:bg-[#38b544] text-[#02241d] font-mono font-bold text-xs rounded-xl cursor-pointer shadow-md"
                    >
                      Return to App
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
