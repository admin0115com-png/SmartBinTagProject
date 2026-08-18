import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { User, NotificationItem, ActiveAlarmData } from '../types';
import { LogOut, Bell, Shield, User as UserIcon, Trash, Volume2, X, Home, Smartphone, PlusSquare, CheckCircle, Share, Settings, Square } from 'lucide-react';
import { mockDb } from '../mockDb';

interface NavigationProps {
  currentUser: User | null;
  currentView: string;
  setView: (view: string, params?: Record<string, unknown>) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onLogout: () => void;
  activeAlarm?: ActiveAlarmData | null;
  setActiveAlarm?: (alarm: ActiveAlarmData | null) => void;
}

export default function Navigation({
  currentUser,
  currentView,
  setView,
  notifications,
  onOpenNotifications,
  onLogout,
  activeAlarm: propActiveAlarm,
  setActiveAlarm: propSetActiveAlarm
}: NavigationProps) {
  // ==== State ====
  const [time, setTime] = useState(() => new Date());
  const [localActiveAlarm, setLocalActiveAlarm] = useState<ActiveAlarmData | null>(null);
  
  const activeAlarm = propActiveAlarm !== undefined ? propActiveAlarm : localActiveAlarm;
  const setActiveAlarm = propSetActiveAlarm || setLocalActiveAlarm;

  const [isSnoozed, setIsSnoozed] = useState<boolean>(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  const [lastTriggeredMin, setLastTriggeredMin] = useState<string>('');
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Listen for native PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Unlock Web Audio context on first user touch/click
  useEffect(() => {
    const unlockAudio = () => {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        let ctx = (window as any).__sbtAudioCtx;
        if (!ctx || ctx.state === 'closed') {
          ctx = new AudioContextClass();
          (window as any).__sbtAudioCtx = ctx;
        }
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
    };
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowInstallModal(true);
      }
    } else {
      setShowInstallModal(true);
    }
  }, [deferredPrompt]);

  // ==== Derived Values ====
  const unreadCount = useMemo(() => {
    return notifications.filter(item => !item.read).length;
  }, [notifications]);

  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    const adminEmails = ['admin0115@gmail.com', 'admin0115.com@gmail.com'];
    return adminEmails.includes(currentUser.email) || currentUser.accountType === 'admin';
  }, [currentUser]);

  // ==== Helpers ====
  const formatTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, []);

  const playSyntheticAlert = useCallback((toneName: string) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      let ctx = (window as any).__sbtAudioCtx;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AudioContextClass();
        (window as any).__sbtAudioCtx = ctx;
      }
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.75, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);

      switch (toneName) {
        case 'Chime Classic':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
          break;
        case 'Digital Alert':
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
          break;
        case 'Eco Sweep':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3);
          break;
        case 'Emerald Ping':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(987.77, ctx.currentTime);
          break;
        case 'Bin Alert High':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1200, ctx.currentTime);
          break;
        case 'Solar Pulse':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.5, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          break;
        case 'District Whistle':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1500, ctx.currentTime);
          break;
        case 'Radar Echo':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.setValueAtTime(100, ctx.currentTime + 0.08);
          osc.frequency.setValueAtTime(600, ctx.currentTime + 0.16);
          break;
        case 'Nhost Sync Ping':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
          break;
        case 'Loud Alarm Siren':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.15);
          osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.22, ctx.currentTime);
          break;
        case 'Fire Alarm Sound':
          osc.type = 'square';
          osc.frequency.setValueAtTime(1200, ctx.currentTime);
          osc.frequency.setValueAtTime(0, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.15);
          osc.frequency.setValueAtTime(0, ctx.currentTime + 0.25);
          osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          break;
        case 'Alarm Panic Sound':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(900, ctx.currentTime);
          osc.frequency.setValueAtTime(1400, ctx.currentTime + 0.08);
          osc.frequency.setValueAtTime(900, ctx.currentTime + 0.16);
          osc.frequency.setValueAtTime(1400, ctx.currentTime + 0.24);
          osc.frequency.setValueAtTime(900, ctx.currentTime + 0.32);
          gain.gain.setValueAtTime(0.24, ctx.currentTime);
          break;
        default:
          osc.type = 'sine';
          osc.frequency.setValueAtTime(329.63, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.25);
      }

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (err) {
      console.warn('Audio Context failed to start:', err);
    }
  }, []);

  // ==== Effects ====
  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Continuous sound loop when active alarm is triggered and not snoozed
  useEffect(() => {
    if (!activeAlarm || isSnoozed) return;
    
    // Immediate sound
    playSyntheticAlert(activeAlarm.tone);
    
    // Continuous repeat sound every 900ms until Snoozed or Stopped
    const audioInterval = setInterval(() => {
      playSyntheticAlert(activeAlarm.tone);
    }, 900);

    return () => clearInterval(audioInterval);
  }, [activeAlarm, isSnoozed, playSyntheticAlert]);

  // Check if snooze timer expired
  useEffect(() => {
    if (isSnoozed && snoozeUntil && Date.now() >= snoozeUntil) {
      setIsSnoozed(false);
      setSnoozeUntil(null);
    }
  }, [time, isSnoozed, snoozeUntil]);

  // Collection & Morning Alarm Checker (Syncs with real-time web clock)
  useEffect(() => {
    if (!currentUser) return;

    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');
    const currentHHMM = `${hh}:${mm}`;
    const ampmHour = time.getHours() % 12 || 12;
    const ampmStr = time.getHours() >= 12 ? 'PM' : 'AM';
    const formatted12hTime = `${String(ampmHour).padStart(2, '0')}:${mm} ${ampmStr}`;

    const todayStr = time.toISOString().split('T')[0];
    const triggerKey = `${todayStr} ${currentHHMM}`;

    if (lastTriggeredMin === triggerKey) return;

    // 1. Check User Bins
    const userBins = mockDb.getBins(currentUser.uid);
    userBins.forEach(bin => {
      // Check Evening Before Alarm
      if (bin.beforeCollectionEnabled && bin.beforeCollectionTime) {
        const timeMatch = bin.beforeCollectionTime.toUpperCase() === formatted12hTime.toUpperCase() ||
                          bin.beforeCollectionTime === currentHHMM;
        const dateMatch = !bin.beforeCollectionDate || bin.beforeCollectionDate === todayStr;

        if (timeMatch && dateMatch) {
          setLastTriggeredMin(triggerKey);
          setIsSnoozed(false);
          const tone = bin.alarmTone || 'Chime Classic';
          setActiveAlarm({
            serialNumber: bin.serialNumber,
            label: 'Evening Before Collection Alarm',
            tone,
            time: formatted12hTime
          });
          mockDb.addNotification(
            currentUser.uid,
            'System',
            `🚨 Evening Before Collection Alarm!`,
            `Your Smart Bin Tag [${bin.serialNumber}] collection is scheduled for tomorrow.`,
            'my-bins'
          );
          return;
        }
      }

      // Check Collection Day Morning Alarm
      if (bin.collectionDayEnabled && bin.collectionDayTime) {
        const timeMatch = bin.collectionDayTime.toUpperCase() === formatted12hTime.toUpperCase() ||
                          bin.collectionDayTime === currentHHMM;
        const dateMatch = !bin.collectionDayDate || bin.collectionDayDate === todayStr;

        if (timeMatch && dateMatch) {
          setLastTriggeredMin(triggerKey);
          setIsSnoozed(false);
          const tone = bin.alarmTone || 'Chime Classic';
          setActiveAlarm({
            serialNumber: bin.serialNumber,
            label: 'Collection Day Morning Alarm',
            tone,
            time: formatted12hTime
          });
          mockDb.addNotification(
            currentUser.uid,
            'System',
            `🚨 Collection Day Morning Alarm!`,
            `Your Smart Bin Tag [${bin.serialNumber}] collection is TODAY!`,
            'my-bins'
          );
          return;
        }
      }
    });

    // 2. Check Reminders
    const reminders = mockDb.getReminders(currentUser.uid);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = time.getDay();

    reminders.forEach(rem => {
      if (!rem.enabled) return;
      const colDayIndex = days.indexOf(rem.collectionDay);
      if (colDayIndex === -1) return;

      const dayBeforeIndex = (colDayIndex - 1 + 7) % 7;
      let isMatch = false;
      let alertLabel = '';

      const r1 = rem.reminderOneTime || '18:00';
      if (currentDayIndex === dayBeforeIndex && (r1 === currentHHMM || r1 === formatted12hTime)) {
        isMatch = true;
        alertLabel = 'Evening Before Collection Alarm';
      }

      const r2 = rem.reminderTwoTime || '07:00';
      if (currentDayIndex === colDayIndex && (r2 === currentHHMM || r2 === formatted12hTime)) {
        isMatch = true;
        alertLabel = 'Collection Day Morning Alarm';
      }

      if (isMatch) {
        setLastTriggeredMin(triggerKey);
        setIsSnoozed(false);
        const tone = rem.alarmTone || 'Chime Classic';
        mockDb.addNotification(
          currentUser.uid,
          'System',
          `🚨 ${alertLabel}!`,
          `Your bin tag [${rem.serialNumber}] is scheduled. Playing tone: ${tone}`,
          'my-bins'
        );
        setActiveAlarm({
          serialNumber: rem.serialNumber,
          label: alertLabel,
          tone,
          time: currentHHMM
        });
      }
    });
  }, [time, currentUser, lastTriggeredMin]);

  // ==== Render ====
  return (
    <>
      {/* Desktop Header */}
      <header
        id="desktop-header"
        className="sticky top-0 z-40 w-full bg-[#04352b]/95 backdrop-blur-md text-white shadow-lg border-b border-[#064e3f]/40 h-16 flex items-center px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Brand Logo */}
          <div
            id="brand-logo"
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            onClick={() => setView(currentUser ? 'dashboard' : 'home', {})}
          >
            <div className="w-9 h-9 bg-[#45D153] rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md shadow-[#45D153]/15 group-hover:scale-105 transition-all">
              SBT
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-xs sm:text-sm md:text-base tracking-wide uppercase leading-none">
                Smart Bin Tag
              </span>
              <span className="text-[7.5px] sm:text-[8px] text-[#45D153] font-mono tracking-[0.22em] font-bold leading-none mt-1">
                DISTRICT PLATE SYSTEM
              </span>
            </div>
          </div>

          {/* Admin Badge */}
          {isAdmin && (
            <div className="hidden lg:flex items-center">
              <span className="px-3 py-1 text-[9px] font-black bg-amber-500 text-slate-950 rounded-full animate-pulse shadow-sm shadow-amber-500/10">
                🛡️ ADMIN SECURITY ACCESS ACTIVE
              </span>
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setView('login', {})}
                  className="bg-[#45D153] hover:bg-[#5ce06a] text-[#011a14] font-black text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded-lg shadow-sm shadow-[#45D153]/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  LOGIN
                </button>
                <button
                  onClick={() => setView('register', {})}
                  className="bg-[#45D153] hover:bg-[#5ce06a] text-[#011a14] font-black text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded-lg shadow-sm shadow-[#45D153]/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  SIGN UP
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Top Actions */}
                <div className="flex md:hidden items-center gap-1.5">
                  <button
                    onClick={() => setView('home', {})}
                    className={`flex items-center gap-1 px-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      currentView === 'home' ? 'text-[#45D153]' : 'text-emerald-200 hover:text-white'
                    }`}
                    title="Home Screen"
                  >
                    {currentUser.profilePhoto ? (
                      <img
                        src={currentUser.profilePhoto}
                        alt="Avatar"
                        className="w-4.5 h-4.5 rounded-full object-cover border border-[#45D153]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full bg-[#45D153] text-[#04352b] font-black text-[8px] flex items-center justify-center">
                        {currentUser.firstName ? currentUser.firstName[0] : 'U'}
                      </div>
                    )}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setView('admin', {})}
                      className="w-6 h-6 rounded-full bg-[#45D153] ring-2 ring-amber-500 hover:ring-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      title="Admin Control Panel"
                    >
                      <Shield className="h-3 w-3 text-[#04352b]" />
                    </button>
                  )}

                  <button
                    onClick={() => setView('settings', {})}
                    className="flex items-center justify-center p-1.5 rounded-lg text-emerald-300 hover:text-white transition-all cursor-pointer"
                    title="Account Settings"
                  >
                    <Settings className="h-4 w-4 text-[#45D153]" />
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-rose-950/40 text-rose-300 border border-rose-900/30 hover:bg-rose-900/50 hover:text-white transition-all cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>

                {/* Desktop Navigation */}
                <nav id="desktop-nav" className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setView('dashboard', {})}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      currentView === 'dashboard' ? 'text-[#45D153]' : 'text-gray-100 hover:text-[#45D153]'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setView('my-bins', {})}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      currentView === 'my-bins' ? 'text-[#45D153]' : 'text-gray-100 hover:text-[#45D153]'
                    }`}
                  >
                    My Bins
                  </button>
                  <button
                    onClick={() => setView('register-bin', {})}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      currentView === 'register-bin' ? 'text-[#45D153]' : 'text-gray-100 hover:text-[#45D153]'
                    }`}
                  >
                    Register Tag
                  </button>

                  {/* Home & Avatar button positioned in-between Register Tag and Admin */}
                  <button
                    onClick={() => setView('home', {})}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                      currentView === 'home' ? 'text-[#45D153]' : 'text-gray-100 hover:text-[#45D153]'
                    }`}
                    title="Home Screen"
                  >
                    {currentUser.profilePhoto ? (
                      <img
                        src={currentUser.profilePhoto}
                        alt="Avatar"
                        className="w-4.5 h-4.5 rounded-full object-cover border border-[#45D153]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full bg-[#45D153] text-[#04352b] font-black text-[8px] flex items-center justify-center">
                        {currentUser.firstName ? currentUser.firstName[0] : 'U'}
                      </div>
                    )}
                    <span>Home</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setView('admin', {})}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                        currentView.startsWith('admin')
                          ? 'text-amber-300'
                          : 'text-gray-100 hover:text-amber-300'
                      }`}
                    >
                      <Shield className="h-3.5 w-3.5 text-amber-400" />
                      Admin
                    </button>
                  )}

                  <div className="h-4 w-[1px] bg-emerald-900/50 mx-1.5"></div>

                  {/* Notifications */}
                  <button
                    onClick={onOpenNotifications}
                    className="relative p-1.5 rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer"
                    aria-label="Open notifications"
                  >
                    <Bell className="h-4.5 w-4.5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-1 ring-[#04352b]">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Account Settings as Cog Icon Only */}
                  <button
                    onClick={() => setView('settings', {})}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                      currentView === 'settings'
                        ? 'text-[#45D153]'
                        : 'text-gray-200 hover:text-[#45D153]'
                    }`}
                    title="Account Settings"
                  >
                    <Settings className="h-4.5 w-4.5 text-[#45D153]" />
                  </button>

                  <div className="h-4 w-[1px] bg-emerald-900/50 mx-1.5"></div>

                  {/* Logout */}
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-rose-950/30 text-rose-300 border border-rose-900/30 hover:bg-rose-900/40 hover:text-white transition-all cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Log Out</span>
                  </button>
                </nav>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {currentUser && (
        <nav
          id="mobile-bottom-nav"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#032e25] border-t border-[#064e3f]/50 text-gray-300 shadow-2xl backdrop-blur-md bg-opacity-95 pb-safe-bottom"
        >
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
            <button
              onClick={() => setView('home', {})}
              className={`flex flex-col items-center justify-center w-16 h-full gap-0.5 transition-all ${
                currentView === 'home' ? 'text-[#45D153] scale-105' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Home className="h-5 w-5" />
                {currentUser.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto}
                    alt="Avatar"
                    className="w-3 h-3 rounded-full object-cover border border-[#45D153] absolute -bottom-1 -right-1"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#45D153] text-[#04352b] font-black text-[6px] flex items-center justify-center absolute -bottom-1 -right-1">
                    {currentUser.firstName ? currentUser.firstName[0] : 'U'}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold">Home</span>
            </button>

            <button
              onClick={() => setView('my-bins', {})}
              className={`flex flex-col items-center justify-center w-16 h-full gap-0.5 transition-all ${
                currentView === 'my-bins' ? 'text-[#45D153] scale-105' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Trash className="h-5 w-5" />
              <span className="text-[10px] font-bold">My Bins</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className={`flex flex-col items-center justify-center w-16 h-full gap-0.5 relative transition-all ${
                currentView === 'notifications' ? 'text-[#45D153] scale-105' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-4 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-1 ring-[#04352b]">
                  {unreadCount}
                </span>
              )}
              <span className="text-[10px] font-bold">Alerts</span>
            </button>

            <button
              onClick={() => setView('settings', {})}
              className={`flex flex-col items-center justify-center w-16 h-full gap-0.5 transition-all ${
                currentView === 'settings' ? 'text-[#45D153] scale-105' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-[10px] font-bold">Settings</span>
            </button>
          </div>
        </nav>
      )}

      {/* Active Alarm Overlay */}
      {activeAlarm && (
        <div className="fixed bottom-6 right-6 z-[100] w-96 bg-[#02241d] border-2 border-[#45D153] rounded-2xl p-4 shadow-2xl text-white animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-full flex items-center justify-center text-white ${isSnoozed ? 'bg-amber-500' : 'bg-[#45D153] animate-pulse'}`}>
                <Volume2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-widest text-[#45D153] uppercase font-mono">
                  {activeAlarm.label}
                </h4>
                <p className="text-sm font-black text-white mt-0.5">{activeAlarm.serialNumber}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${isSnoozed ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'}`}>
                    {isSnoozed ? 'Snoozed (5 mins)' : 'Continuous Alarm Active'}
                  </span>
                  <span className="text-[10px] text-emerald-200/80 font-mono font-bold">{activeAlarm.tone}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setActiveAlarm(null); setIsSnoozed(false); }}
              className="p-1 rounded-md hover:bg-[#064e3f] text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Stop alarm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                setIsSnoozed(true);
                setSnoozeUntil(Date.now() + 5 * 60 * 1000);
              }}
              className={`flex-1 py-2 font-black text-xs rounded-xl transition-all uppercase tracking-wider font-mono flex items-center justify-center gap-1 cursor-pointer ${
                isSnoozed
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-300'
              }`}
            >
              ⏰ {isSnoozed ? 'Snoozed' : 'Snooze 5 Mins'}
            </button>
            <button
              onClick={() => { setActiveAlarm(null); setIsSnoozed(false); }}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all uppercase tracking-wider font-mono cursor-pointer shadow-md shadow-rose-900/40"
            >
              ⏹️ Stop Alarm
            </button>
          </div>
        </div>
      )}

      {/* Add to Home Screen Guide Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
          <div className="max-w-md w-full bg-[#02241d] rounded-2xl border-2 border-[#45D153]/40 p-6 text-white space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-[#011a14] hover:bg-[#064e3f] text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#064e3f] pb-4">
              <div className="h-11 w-11 bg-[#45D153]/15 border border-[#45D153]/30 rounded-xl flex items-center justify-center text-[#45D153]">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">Add to Home Screen</h3>
                <p className="text-[11px] text-emerald-200/70 font-medium">Install Smart Bin Tag for instant 1-tap app access</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-[#011a14] p-3.5 rounded-xl border border-[#064e3f] space-y-2">
                <div className="flex items-center gap-2 text-[#45D153] font-bold text-xs uppercase tracking-wider">
                  <Share className="h-4 w-4" />
                  <span>iOS (Safari)</span>
                </div>
                <p className="text-emerald-100/80 text-[11px] leading-relaxed">
                  1. Tap the <strong className="text-white font-semibold">Share icon</strong> at the bottom of your Safari browser window.<br />
                  2. Scroll down and tap <strong className="text-white font-semibold">'Add to Home Screen'</strong>.<br />
                  3. Tap <strong className="text-[#45D153] font-semibold">'Add'</strong> in the top right corner.
                </p>
              </div>

              <div className="bg-[#011a14] p-3.5 rounded-xl border border-[#064e3f] space-y-2">
                <div className="flex items-center gap-2 text-[#45D153] font-bold text-xs uppercase tracking-wider">
                  <PlusSquare className="h-4 w-4" />
                  <span>Android (Chrome)</span>
                </div>
                <p className="text-emerald-100/80 text-[11px] leading-relaxed">
                  1. Tap the <strong className="text-white font-semibold">3 dots menu</strong> in the upper right corner of Chrome.<br />
                  2. Select <strong className="text-white font-semibold">'Add to Home screen'</strong> or <strong className="text-white font-semibold">'Install app'</strong>.<br />
                  3. Confirm by tapping <strong className="text-[#45D153] font-semibold">'Add'</strong>.
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('App URL copied to clipboard! Open in Safari or Chrome to add to home screen.');
                }}
                className="flex-1 h-11 bg-[#011a14] hover:bg-[#064e3f] text-emerald-200 border border-[#064e3f] font-bold uppercase tracking-wider text-[11px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowInstallModal(false)}
                className="flex-1 h-11 bg-[#45D153] hover:bg-[#5ce06a] text-[#04352b] font-black uppercase tracking-wider text-[11px] rounded-xl transition-all cursor-pointer shadow-md shadow-[#45D153]/20 flex items-center justify-center"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}