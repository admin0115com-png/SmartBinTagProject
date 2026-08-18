import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X, Settings2, ExternalLink, ChevronRight, Lock, Eye, Zap } from 'lucide-react';

export interface CookiePreferences {
  necessary: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  performance: boolean;
  timestamp: string;
}

interface CookieConsentBannerProps {
  onNavigate: (view: 'cookie' | 'privacy' | 'terms') => void;
  forceOpen?: boolean;
  onClose?: () => void;
}

export const COOKIE_STORAGE_KEY = 'smart_bin_cookie_consent';

export default function CookieConsentBanner({ onNavigate, forceOpen = false, onClose }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showManageModal, setShowManageModal] = useState<boolean>(false);

  // Preference toggles
  const [functionalConsent, setFunctionalConsent] = useState<boolean>(true);
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(false);
  const [performanceConsent, setPerformanceConsent] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!saved) {
      // Show on first load
      setIsVisible(true);
    } else {
      try {
        const parsed: CookiePreferences = JSON.parse(saved);
        setFunctionalConsent(parsed.functional ?? true);
        setAnalyticsConsent(parsed.analytics ?? false);
        setPerformanceConsent(parsed.performance ?? true);
      } catch (err) {
        setIsVisible(true);
      }
    }
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setIsVisible(true);
      setShowManageModal(true);
    }
  }, [forceOpen]);

  const saveConsent = (prefs: { functional: boolean; analytics: boolean; performance: boolean }) => {
    const payload: CookiePreferences = {
      necessary: true,
      functional: prefs.functional,
      analytics: prefs.analytics,
      performance: prefs.performance,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(payload));
    setIsVisible(false);
    setShowManageModal(false);
    if (onClose) onClose();
  };

  const handleAcceptAll = () => {
    setFunctionalConsent(true);
    setAnalyticsConsent(true);
    setPerformanceConsent(true);
    saveConsent({ functional: true, analytics: true, performance: true });
  };

  const handleEssentialOnly = () => {
    setFunctionalConsent(false);
    setAnalyticsConsent(false);
    setPerformanceConsent(false);
    saveConsent({ functional: false, analytics: false, performance: false });
  };

  const handleSaveCustom = () => {
    saveConsent({
      functional: functionalConsent,
      analytics: analyticsConsent,
      performance: performanceConsent
    });
  };

  if (!isVisible && !forceOpen) return null;

  return (
    <>
      {/* FLOATING BOTTOM BANNER */}
      {!showManageModal && (
        <div 
          id="cookie-consent-popup"
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-0 left-0 right-0 z-[140] p-3 sm:p-5 flex justify-center pointer-events-none animate-fade-in"
        >
          <div className="w-full max-w-4xl bg-[#021c16]/95 backdrop-blur-md border-2 border-[#064e3f] hover:border-[#45D153]/50 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 pointer-events-auto space-y-4 transition-all">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#064e3f]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#45D153]/10 border border-[#45D153]/30 flex items-center justify-center text-[#45D153]">
                  <Cookie className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <span>Cookie & Storage Preferences</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#064e3f] text-[#45D153] rounded border border-[#45D153]/20">
                      SBT-CK-2026-V1
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-200/70 font-mono">
                    UK GDPR & PECR Compliant • Nhost Database Infrastructure
                  </p>
                </div>
              </div>

              {/* Quick links to legal documents */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <button
                  onClick={() => onNavigate('cookie')}
                  className="text-emerald-300 hover:text-[#45D153] underline cursor-pointer"
                >
                  Cookie Policy
                </button>
                <span className="text-emerald-500/50">&bull;</span>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="text-emerald-300 hover:text-[#45D153] underline cursor-pointer"
                >
                  Privacy Policy
                </button>
                <span className="text-emerald-500/50">&bull;</span>
                <button
                  onClick={() => onNavigate('terms')}
                  className="text-emerald-300 hover:text-[#45D153] underline cursor-pointer"
                >
                  Terms
                </button>
              </div>
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed">
              We use strictly necessary cookies and local storage technologies powered by <strong>Nhost database & authentication</strong> to keep you securely signed in, maintain bin collection schedules offline, and protect your account. With your permission, we also use optional functional and performance technologies to enhance your experience.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowManageModal(true)}
                className="px-3.5 py-2 bg-[#064e3f]/40 hover:bg-[#064e3f] text-emerald-200 hover:text-white text-xs font-mono font-bold rounded-xl border border-[#064e3f] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Settings2 className="h-3.5 w-3.5 text-[#45D153]" />
                <span>Customise Preferences</span>
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="px-4 py-2 bg-[#011a14] hover:bg-[#064e3f]/60 text-emerald-200 hover:text-white text-xs font-mono font-bold rounded-xl border border-[#064e3f] transition-all cursor-pointer text-center"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-5 py-2 bg-[#45D153] hover:bg-[#38b544] text-[#02241d] text-xs font-mono font-black rounded-xl shadow-lg shadow-[#45D153]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Accept All Cookies</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED MANAGE PREFERENCES MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
          <div className="max-w-xl w-full bg-[#02241d] rounded-2xl border-2 border-[#064e3f] p-6 sm:p-7 text-white space-y-5 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between border-b border-[#064e3f] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#45D153]/10 border border-[#45D153]/30 rounded-xl flex items-center justify-center text-[#45D153]">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    Customise Cookie Preferences
                  </h3>
                  <p className="text-[11px] text-emerald-300/70 font-mono">
                    Ref: SBT-CK-2026-V1 • Smart Bin Tag Privacy Controls
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowManageModal(false);
                  if (forceOpen && onClose) onClose();
                }}
                className="p-1.5 bg-[#064e3f]/40 hover:bg-[#064e3f] text-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Choose which categories of cookies and storage technologies you allow on Smart Bin Tag. Strictly necessary cookies cannot be disabled as they are required for security, Nhost authentication, and core database interactions.
            </p>

            {/* Category Cards */}
            <div className="space-y-3">
              
              {/* Category 1: Strictly Necessary */}
              <div className="p-3.5 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#45D153]" />
                    <span className="text-xs font-black uppercase text-white tracking-wider">
                      1. Strictly Necessary Storage & Cookies
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#064e3f] text-[#45D153] font-bold rounded">
                    ALWAYS ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/70">
                  Required for Nhost user authentication, secure JWT session management, CSRF prevention, and basic app routing. Cannot be turned off.
                </p>
              </div>

              {/* Category 2: Functional Storage */}
              <div className="p-3.5 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-black uppercase text-white tracking-wider">
                      2. Functional Preferences
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={functionalConsent}
                      onChange={(e) => setFunctionalConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#45D153]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-emerald-200/70">
                  Remembers your collection notification schedules, selected alarm tones, theme choices, and local UI preferences.
                </p>
              </div>

              {/* Category 3: Performance & PWA Storage */}
              <div className="p-3.5 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-black uppercase text-white tracking-wider">
                      3. Performance & PWA Offline Storage
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={performanceConsent}
                      onChange={(e) => setPerformanceConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#45D153]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-emerald-200/70">
                  Caches progressive web app resources and bin schedules locally for rapid loading and offline availability.
                </p>
              </div>

              {/* Category 4: Analytics */}
              <div className="p-3.5 bg-[#011a14] border border-[#064e3f] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-black uppercase text-white tracking-wider">
                      4. Anonymous Analytics & Diagnostics
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsConsent}
                      onChange={(e) => setAnalyticsConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#45D153]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-emerald-200/70">
                  Helps us diagnose crash logs, errors, and optimise platform performance. No personal identifiers are ever sold or shared with third-party advertisers.
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#064e3f]">
              <button
                type="button"
                onClick={() => {
                  setShowManageModal(false);
                  onNavigate('cookie');
                }}
                className="text-xs font-mono text-emerald-300 hover:text-[#45D153] underline cursor-pointer flex items-center gap-1"
              >
                <span>Read Full Cookie Policy</span>
                <ExternalLink className="h-3 w-3" />
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-[#064e3f]/40 hover:bg-[#064e3f] text-emerald-200 text-xs font-mono font-bold rounded-xl border border-[#064e3f] cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#45D153] hover:bg-[#38b544] text-[#02241d] text-xs font-mono font-black rounded-xl shadow-md cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
