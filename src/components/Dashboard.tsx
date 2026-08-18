import React, { useState, useEffect } from 'react';
import { User, Bin, NotificationItem, BinReport, PrivateMessage, SupportTicket, DeviceSession, AuditLogEntry, RegistrationHistoryItem } from '../types';
import { mockDb } from '../mockDb';
import { 
  PlusCircle, Trash, Trash2, Bell, Calendar, Settings, ArrowRight, Sparkles, 
  MessageSquare, ShieldCheck, Activity, Terminal, Smartphone, 
  CheckCircle, Clock, RefreshCw, FileText, Send, SendHorizontal, AlertTriangle, Eye, EyeOff,
  Volume2, X, ChevronDown, User as UserIcon, Home, Info
} from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  bins: Bin[];
  notifications: NotificationItem[];
  reports: BinReport[];
  setView: (view: string, params?: Record<string, any>) => void;
  onOpenNotifications: () => void;
}

export default function Dashboard({
  currentUser,
  bins,
  notifications,
  reports,
  setView,
  onOpenNotifications
}: DashboardProps) {
  // Real-time synchronization state variables
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'messages' | 'tickets' | 'logs' | 'sessions'>('reports');

  // Filter dropdown state variables for the 7-Tier Panels
  const [reportsFilter, setReportsFilter] = useState<'ALL' | 'FOUND' | 'DAMAGE'>('ALL');
  const [messagesFilter, setMessagesFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [ticketsFilter, setTicketsFilter] = useState<'ALL' | 'CRITICAL_HIGH' | 'MEDIUM_LOW'>('ALL');
  const [logsFilter, setLogsFilter] = useState<'ALL' | 'SECURITY' | 'REGISTRATION'>('ALL');
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);

  // Inspector & Chat Feed State
  const [inspectedReport, setInspectedReport] = useState<BinReport | null>(null);
  const [inspectedTicket, setInspectedTicket] = useState<SupportTicket | null>(null);

  const [chatSerial, setChatSerial] = useState<string>('');
  const [chatMessageText, setChatMessageText] = useState<string>('');
  const [chatSenderName, setChatSenderName] = useState<string>(currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : 'Neighbor Resident');
  const [chatSenderEmail, setChatSenderEmail] = useState<string>(currentUser.email || '');
  const [chatSuccess, setChatSuccess] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Scroll to tabs section helper
  const scrollToTabsSection = (tab: 'reports' | 'messages' | 'tickets' | 'logs', reportFilter?: 'ALL' | 'FOUND' | 'DAMAGE') => {
    setActiveTab(tab);
    if (reportFilter) {
      setReportsFilter(reportFilter);
    }
    setTimeout(() => {
      const el = document.getElementById('tabs-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setChatError(null);
    if (!chatSerial.trim()) {
      setChatError('Please select or enter a Tag Serial Number.');
      return;
    }
    if (!chatMessageText.trim()) {
      setChatError('Please enter a message to send.');
      return;
    }

    const result = mockDb.sendPrivateMessage(
      chatSerial.trim().toUpperCase(),
      chatSenderName.trim() || 'Resident',
      chatSenderEmail.trim() || currentUser.email,
      currentUser.phoneNumber || undefined,
      chatMessageText.trim()
    );

    if (result.success) {
      setChatMessageText('');
      setChatSuccess(true);
      setChatError(null);
      pullRealtimeDatabase();
      setTimeout(() => setChatSuccess(false), 4000);
    } else {
      setChatError(result.error || 'Failed to dispatch chat message.');
    }
  };

  // Live World Time state
  const [liveTime, setLiveTime] = useState(new Date());
  const [activeDashboardAlarm, setActiveDashboardAlarm] = useState<{
    serialNumber: string;
    label: string;
    tone: string;
    time: string;
  } | null>(null);
  const [lastTriggeredMin, setLastTriggeredMin] = useState<string>('');

  // Local state to mimic real-time reactive Nhost collections
  const [dbReports, setDbReports] = useState<BinReport[]>([]);
  const [dbMessages, setDbMessages] = useState<PrivateMessage[]>([]);
  const [dbTickets, setDbTickets] = useState<SupportTicket[]>([]);
  const [dbSessions, setDbSessions] = useState<DeviceSession[]>([]);
  const [dbAuditLogs, setDbAuditLogs] = useState<AuditLogEntry[]>([]);
  const [dbRegHistory, setDbRegHistory] = useState<RegistrationHistoryItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Calculations - defined once for use across all panels
  const userBinSerials = bins.map(b => b.serialNumber);
  const registeredTagsCount = bins.length;
  const collectionAlertsCount = mockDb.getReminders(currentUser.uid).filter(r => r.enabled).length;
  const foundReports = dbReports.filter(r => userBinSerials.includes(r.serialNumber) && r.reportType === 'Found');
  const foundReportsCount = foundReports.length;
  const damageReports = dbReports.filter(r => userBinSerials.includes(r.serialNumber) && r.reportType === 'Damaged');
  const damageReportsCount = damageReports.length;
  const unreadMessages = dbMessages.filter(m => userBinSerials.includes(m.serialNumber) && m.status === 'Unread');
  const unreadMessagesCount = unreadMessages.length;
  const unreadNotificationsCount = notifications.filter(n => !n.read && !n.deleted).length;
  const supportTicketsCount = dbTickets.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatLiveTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', { hour12: false });
  };

  const formatTimeSeconds = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const playSyntheticAlert = (toneName: string) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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
      
      if (toneName === 'Chime Classic') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      } else if (toneName === 'Digital Alert') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      } else if (toneName === 'Eco Sweep') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3);
      } else if (toneName === 'Emerald Ping') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      } else if (toneName === 'Bin Alert High') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
      } else if (toneName === 'Solar Pulse') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      } else if (toneName === 'District Whistle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1500, ctx.currentTime);
      } else if (toneName === 'Radar Echo') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(100, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(600, ctx.currentTime + 0.16);
      } else if (toneName === 'Nhost Sync Ping') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime);
      } else if (toneName === 'Loud Alarm Siren') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
      } else if (toneName === 'Fire Alarm Sound') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.setValueAtTime(0, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(0, ctx.currentTime + 0.25);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
      } else if (toneName === 'Alarm Panic Sound') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        osc.frequency.setValueAtTime(1400, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.16);
        osc.frequency.setValueAtTime(1400, ctx.currentTime + 0.24);
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.32);
        gain.gain.setValueAtTime(0.24, ctx.currentTime);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(329.63, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.25);
      }
      
      gain.gain.setValueAtTime(0.85, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Audio Context failed to start:", e);
    }
  };

  // Real-time automatic alarm schedule trigger checking tied directly to liveWorldClock
  useEffect(() => {
    if (!currentUser) return;

    const hh = String(liveTime.getHours()).padStart(2, '0');
    const mm = String(liveTime.getMinutes()).padStart(2, '0');
    const currentHHMM = `${hh}:${mm}`;

    const todayStr = liveTime.toISOString().split('T')[0];
    const triggerKey = `${todayStr} ${currentHHMM}`;

    if (lastTriggeredMin === triggerKey) return;

    const reminders = mockDb.getReminders(currentUser.uid);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = liveTime.getDay();

    reminders.forEach(rem => {
      if (!rem.enabled) return;

      const colDayIndex = days.indexOf(rem.collectionDay);
      if (colDayIndex === -1) return;

      const dayBeforeIndex = (colDayIndex - 1 + 7) % 7;

      let isMatch = false;
      let alertLabel = '';

      const r1 = rem.reminderOneTime || '18:00';
      if (currentDayIndex === dayBeforeIndex && r1 === currentHHMM) {
        isMatch = true;
        alertLabel = 'Day Before Collection Alert';
      }

      const r2 = rem.reminderTwoTime || '07:00';
      if (currentDayIndex === colDayIndex && r2 === currentHHMM) {
        isMatch = true;
        alertLabel = 'Collection Day Final Alert';
      }

      if (isMatch) {
        setLastTriggeredMin(triggerKey);
        const tone = rem.alarmTone || 'Chime Classic';
        playSyntheticAlert(tone);
        
        mockDb.addNotification(
          currentUser.uid,
          'System',
          `🚨 ${alertLabel}!`,
          `Your bin tag [${rem.serialNumber}] is scheduled. Playing tone: ${tone}`,
          'my-bins'
        );

        setActiveDashboardAlarm({
          serialNumber: rem.serialNumber,
          label: alertLabel,
          tone: tone,
          time: currentHHMM
        });
      }
    });
  }, [liveTime, currentUser, lastTriggeredMin]);

  const pullRealtimeDatabase = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setDbReports(mockDb.getReports());
      setDbMessages(mockDb.getMessages());
      setDbTickets(mockDb.getSupportTickets(currentUser.uid));
      setDbSessions(mockDb.getDeviceSessions(currentUser.uid));
      setDbAuditLogs(mockDb.getAuditLogs(currentUser.uid));
      setDbRegHistory(mockDb.getRegistrationHistory(currentUser.uid));
      setIsSyncing(false);
    }, 400);
  };

  useEffect(() => {
    pullRealtimeDatabase();

    const unsubscribe = mockDb.subscribeToDb(() => {
      setDbReports(mockDb.getReports());
      setDbMessages(mockDb.getMessages());
      setDbTickets(mockDb.getSupportTickets(currentUser.uid));
      setDbSessions(mockDb.getDeviceSessions(currentUser.uid));
      setDbAuditLogs(mockDb.getAuditLogs(currentUser.uid));
      setDbRegHistory(mockDb.getRegistrationHistory(currentUser.uid));
    });

    return () => unsubscribe();
  }, [currentUser, bins, notifications, reports]);

  // Form Submission
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;

    mockDb.submitSupportTicket(
      currentUser.uid,
      ticketSubject.trim(),
      ticketDesc.trim(),
      ticketPriority
    );

    setTicketSubject('');
    setTicketDesc('');
    setTicketPriority('MEDIUM');
    setTicketSuccess(true);
    pullRealtimeDatabase();

    setTimeout(() => setTicketSuccess(false), 4000);
  };

  const handleMarkMessageRead = (messageId: string) => {
    mockDb.markMessageRead(messageId);
    pullRealtimeDatabase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-8 space-y-5 select-none">
      
      {/* Real-time sync connectivity header */}
      {currentUser.accountType === 'admin' ? (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#02241d]/80 border border-[#064e3f] px-5 py-3 rounded-xl text-white">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#45D153] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#45D153]"></span>
            </span>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-100 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Nhost Database:</span> <span className="text-[#45D153]">Real-time Active</span>
              <span className="hidden sm:inline text-emerald-600 font-sans font-normal">|</span>
              <span>LIVE SYSTEM TIME:</span> <span className="text-emerald-300 font-mono font-black">{formatLiveTime(liveTime)} (UTC+1)</span>
            </p>
          </div>
          <div className="flex items-center space-x-4 text-[10px] font-mono text-emerald-400/80">
            <span>Client Ref: <span className="text-[#45D153] font-bold">NHOST_WS_LIVE</span></span>
            <span className="hidden sm:inline">•</span>
            <button 
              onClick={pullRealtimeDatabase}
              className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="Force refresh synchronization"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin text-[#45D153]' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#02241d]/80 border border-[#064e3f] px-5 py-3 rounded-xl text-white">
          <div className="flex items-center space-x-2.5">
            <Clock className="h-4 w-4 text-[#45D153]" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-100 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>LIVE SYSTEM TIME:</span> <span className="text-emerald-300 font-mono font-black">{formatLiveTime(liveTime)} (UTC+1)</span>
            </p>
          </div>
          <div className="text-[10px] font-mono text-emerald-400/80 uppercase">
            <span>Homeowner Profile Sync • Connected</span>
          </div>
        </div>
      )}

      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#02241d] text-white p-6 sm:p-8 rounded-[24px] shadow-2xl border border-[#064e3f] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="z-10 flex items-center gap-4">
          <div className="relative group shrink-0">
            {currentUser.profilePhoto ? (
              <img
                src={currentUser.profilePhoto}
                alt="Profile Avatar"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#45D153] shadow-lg bg-[#04352b]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#45D153] text-[#04352b] font-black text-lg sm:text-xl flex items-center justify-center border-2 border-[#45D153] shadow-lg">
                {currentUser.firstName ? currentUser.firstName[0].toUpperCase() : 'U'}
              </div>
            )}
            <button
              onClick={() => setView('settings')}
              className="absolute -bottom-1 -right-1 bg-[#011a14] border border-[#45D153] p-1 rounded-full text-[#45D153] hover:text-white hover:bg-[#064e3f] transition-all cursor-pointer shadow"
              title="Edit Profile & Avatar in Settings"
              aria-label="Edit Profile & Avatar"
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-widest font-mono uppercase text-white">
              WELCOME: {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : "Lee Smith"}
            </h1>
            <p className="text-white text-xs sm:text-sm font-black mt-1.5 font-mono uppercase tracking-widest">
              OWNER EMAIL: {currentUser.email ? currentUser.email.toUpperCase() : "LEESMITH1345@GMAIL.COM"}
            </p>
          </div>
        </div>
        <div className="z-10 flex flex-wrap gap-2.5">
          <button 
            onClick={() => setView('register-bin')}
            className="flex items-center justify-center space-x-1.5 px-5 py-3 rounded-xl bg-[#45D153] text-white font-black shadow-md hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs cursor-pointer border border-emerald-500/30"
          >
            <PlusCircle className="h-4.5 w-4.5 text-white" />
            <span className="text-white">REGISTER NEW BIN TAG</span>
          </button>
        </div>
      </div>

      {/* Collection Alerts Engine */}
      <div className="bg-[#054337] border border-[#0c624f] hover:border-[#45D153]/40 rounded-[24px] shadow-2xl p-6 text-white relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#45D153]/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#0c624f]/70 pb-5 mb-5">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-[#45D153]/15 border border-[#45D153]/30 rounded-xl flex items-center justify-center text-[#45D153] shadow-md shadow-[#45D153]/5">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight font-sans uppercase text-white">
                Collection Alerts Engine
              </h2>
              <p className="text-xs text-emerald-200/80 font-sans">
                Real-time bin telemetry alarms & automated audio synthesis
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#032f26] border border-[#0c624f] px-4 py-2 rounded-2xl shadow-inner">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#45D153] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#45D153]"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-200/70 font-mono tracking-widest uppercase">CLOCK TIO:</span>
            </div>
            <span className="text-sm font-black text-[#45D153] font-mono tracking-widest drop-shadow-[0_0_10px_rgba(69,209,83,0.3)]">
              {formatTimeSeconds(liveTime)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#45D153] font-mono mb-2 flex items-center justify-between">
            <span>Armed Reminders & Tone Matrix</span>
            <span className="text-emerald-200/70">United Kingdom (GMT+1)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockDb.getReminders(currentUser.uid).length === 0 ? (
              <div className="col-span-full py-6 text-center border border-dashed border-[#0c624f] rounded-2xl bg-[#032f26]/60 text-sm text-gray-300 flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 text-[#45D153]/40" />
                <p className="font-sans text-xs text-emerald-100/70">No active smart tags bound to the alarm matrix.</p>
                <button
                  onClick={() => setView('register-bin')}
                  className="mt-2 px-4 py-1.5 bg-[#45D153] text-[#04352b] text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-400 transition-all cursor-pointer shadow-md"
                >
                  Register Tag Now
                </button>
              </div>
            ) : (
              mockDb.getReminders(currentUser.uid).map((rem) => {
                const tone = rem.alarmTone || 'Chime Classic';
                return (
                  <div 
                    key={rem.reminderId} 
                    className="bg-[#032f26] border border-[#0c624f] p-4 rounded-2xl flex flex-col justify-between space-y-3.5 hover:border-[#45D153]/50 transition-all shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black text-[#45D153] font-mono tracking-wider bg-[#02241d] px-2.5 py-1 rounded-md border border-[#0c624f]">
                          {rem.serialNumber}
                        </span>
                        <div className="mt-2 text-xs font-bold text-white font-sans">
                          {rem.collectionDay} Collection Schedule
                        </div>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${rem.enabled ? 'bg-[#45D153]/20 text-[#45D153] border border-[#45D153]/30' : 'bg-rose-950/40 text-rose-300 border border-rose-900/20'}`}>
                        {rem.enabled ? '● Armed' : '○ Paused'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-emerald-100/70 font-sans border-t border-[#0c624f]/60 pt-3">
                      <div>
                        <span className="block text-[8px] uppercase tracking-widest text-white font-bold">Day Before</span>
                        <span className="font-mono text-white text-xs font-bold">{rem.reminderOneTime || '18:00'}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-widest text-white font-bold">Collection Day</span>
                        <span className="font-mono text-white text-xs font-bold">{rem.reminderTwoTime || '07:00'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#02241d]/80 border border-[#0c624f]/60 px-3 py-2 rounded-xl mt-1 text-[10px]">
                      <span className="text-emerald-100/80 flex items-center gap-1.5">
                        <Volume2 className="h-3 w-3 text-[#45D153]" />
                        Tone: <span className="font-black text-emerald-300 font-mono">{tone}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Core Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-[#04352b] border border-[#064e3f] p-5 rounded-[24px] shadow-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 text-white">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Registered Tags</span>
              <div className="p-2 rounded-lg bg-[#45D153]/10 text-[#45D153] border border-[#45D153]/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-white mt-4">{registeredTagsCount}</p>
            <p className="text-[10px] text-emerald-100/50 mt-1">Total active connected tags</p>
          </div>
          <button onClick={() => setView('my-bins')} className="text-xs text-[#45D153] font-black flex items-center gap-1 mt-6 hover:underline cursor-pointer uppercase tracking-wider">
            <span>Manage Bins</span><ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="bg-[#04352b] border border-[#064e3f] p-5 rounded-[24px] shadow-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 text-white">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Collection Alerts</span>
              <div className="p-2 rounded-lg bg-[#45D153]/10 text-emerald-300 border border-emerald-500/20">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-white mt-4">{collectionAlertsCount}</p>
            <p className="text-[10px] text-emerald-100/50 mt-1">Active scheduled notifications</p>
          </div>
          <button onClick={() => setView('my-bins', { action: 'configure-alerts' })} className="text-xs text-[#45D153] font-black flex items-center gap-1 mt-6 hover:underline cursor-pointer uppercase tracking-wider">
            <span>Configure Alerts</span><ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="bg-[#04352b] border border-[#064e3f] p-5 rounded-[24px] shadow-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 text-white">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Found Reports</span>
              <div className="p-2 rounded-lg bg-[#45D153]/10 text-[#45D153] border border-[#45D153]/20">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-white mt-4">{foundReportsCount}</p>
            <p className="text-[10px] text-emerald-100/50 mt-1">Sticker scanned & bin located</p>
          </div>
          <button onClick={() => scrollToTabsSection('reports', 'FOUND')} className="text-xs text-[#45D153] font-black flex items-center gap-1 mt-6 hover:underline cursor-pointer uppercase tracking-wider">
            <span>Inspect Found</span><ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="bg-[#04352b] border border-[#064e3f] p-5 rounded-[24px] shadow-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 text-white">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Damage Reports</span>
              <div className="p-2 rounded-lg bg-[#45D153]/10 text-amber-400 border border-amber-400/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-white mt-4">{damageReportsCount}</p>
            <p className="text-[10px] text-emerald-100/50 mt-1">Reported structural bin issues</p>
          </div>
          <button onClick={() => scrollToTabsSection('reports', 'DAMAGE')} className="text-xs text-[#45D153] font-black flex items-center gap-1 mt-6 hover:underline cursor-pointer uppercase tracking-wider">
            <span>Inspect Damage</span><ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="bg-[#04352b] border border-[#064e3f] p-5 rounded-[24px] shadow-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 text-white">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Unread Messages</span>
              <div className="p-2 rounded-lg bg-[#45D153]/10 text-[#45D153] border border-[#45D153]/20">
                <MessageSquare className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-white mt-4">{unreadMessagesCount}</p>
            <p className="text-[10px] text-emerald-100/50 mt-1">Neighbour feedback conversations</p>
          </div>
          <button onClick={() => scrollToTabsSection('messages')} className="text-xs text-[#45D153] font-black flex items-center gap-1 mt-6 hover:underline cursor-pointer uppercase tracking-wider">
            <span>Open Chat Feed</span><ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="bg-[#04352b] border border-[#064e3f] p-5 rounded-[24px] shadow-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 text-white">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Notifications</span>
              <div className="p-2 rounded-lg bg-[#45D153]/10 text-emerald-300 border border-emerald-500/20">
                <Bell className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-[#45D153] mt-4">{unreadNotificationsCount}</p>
            <p className="text-[10px] text-emerald-100/50 mt-1">Pending active system alarms</p>
          </div>
          <button onClick={onOpenNotifications} className="text-xs text-[#45D153] font-black flex items-center gap-1 mt-6 hover:underline cursor-pointer uppercase tracking-wider">
            <span>View Alerts Center</span><ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="bg-[#04352b] border border-[#064e3f] p-5 rounded-[24px] shadow-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 text-white">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Support Tickets</span>
              <div className="p-2 rounded-lg bg-[#45D153]/10 text-teal-400 border border-teal-500/20">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-white mt-4">{supportTicketsCount}</p>
            <p className="text-[10px] text-emerald-100/50 mt-1">Registered support concerns</p>
          </div>
          <button onClick={() => scrollToTabsSection('tickets')} className="text-xs text-[#45D153] font-black flex items-center gap-1 mt-6 hover:underline cursor-pointer uppercase tracking-wider">
            <span>Track Tickets</span><ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs Panels Section */}
      <div id="tabs-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8 scroll-mt-6">
        
        <div className="lg:col-span-3 bg-[#054337] border border-[#0c624f] rounded-[24px] shadow-2xl overflow-hidden flex flex-col text-white">
          
          <div className="border-b border-[#0c624f] bg-[#032f26] p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-emerald-200/90 tracking-wider">Select Workspace View:</span>
            </div>

            <div className="relative w-full sm:w-96">
              <button
                type="button"
                onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
                className="w-full flex items-center justify-between bg-[#043b31] text-[#45D153] text-xs font-black uppercase tracking-wider font-mono border-2 border-[#0c624f] hover:border-[#45D153] focus:border-[#45D153] rounded-xl px-4 py-2.5 cursor-pointer transition-all shadow-lg text-left"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {activeTab === 'reports' && <FileText className="h-4 w-4 shrink-0 text-[#45D153]" />}
                  {activeTab === 'messages' && <MessageSquare className="h-4 w-4 shrink-0 text-[#45D153]" />}
                  {activeTab === 'tickets' && <ShieldCheck className="h-4 w-4 shrink-0 text-[#45D153]" />}
                  {activeTab === 'logs' && <Terminal className="h-4 w-4 shrink-0 text-[#45D153]" />}
                  <span className="truncate">
                    {activeTab === 'reports' && `Public Reports & Inspections (${dbReports.length})`}
                    {activeTab === 'messages' && `Chat Feed & Messages (${dbMessages.length})`}
                    {activeTab === 'tickets' && `Support Tickets (${dbTickets.length})`}
                    {activeTab === 'logs' && `Audit Logs & History (${dbAuditLogs.length})`}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-[#45D153] shrink-0 transition-transform duration-200 ml-2 ${isTabDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTabDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsTabDropdownOpen(false)} />
                  <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-[#032f26] border-2 border-[#0c624f] rounded-xl shadow-2xl overflow-hidden divide-y divide-[#0c624f]/60 max-h-64 overflow-y-auto">
                    {(['reports', 'messages', 'tickets', 'logs'] as const).map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => { setActiveTab(tab); setIsTabDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-wider font-mono transition-colors text-left cursor-pointer ${
                          activeTab === tab ? 'bg-[#043b31] text-[#45D153]' : 'text-emerald-100/90 hover:bg-[#043b31] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {tab === 'reports' && <FileText className="h-4 w-4 text-[#45D153]" />}
                          {tab === 'messages' && <MessageSquare className="h-4 w-4 text-[#45D153]" />}
                          {tab === 'tickets' && <ShieldCheck className="h-4 w-4 text-[#45D153]" />}
                          {tab === 'logs' && <Terminal className="h-4 w-4 text-[#45D153]" />}
                          <span>
                            {tab === 'reports' && 'Public Reports & Inspections'}
                            {tab === 'messages' && 'Chat Feed & Messages'}
                            {tab === 'tickets' && 'Support Tickets'}
                            {tab === 'logs' && 'Audit Logs & History'}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#064e3f] text-[#45D153]">
                          {tab === 'reports' && dbReports.length}
                          {tab === 'messages' && dbMessages.length}
                          {tab === 'tickets' && dbTickets.length}
                          {tab === 'logs' && dbAuditLogs.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* TAB 1: REPORTS & INSPECTIONS */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0c624f]/70 pb-4">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-[#45D153] font-mono">Public Bin Reports & Inspect Centre</h3>
                    <p className="text-xs text-emerald-100/80 mt-0.5">Inspect located or damaged bin reports, view finder details, and issue status updates.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#032f26] p-1 rounded-xl border border-[#0c624f]">
                    <button
                      onClick={() => setReportsFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${reportsFilter === 'ALL' ? 'bg-[#45D153] text-[#02241d]' : 'text-emerald-100/70 hover:text-white'}`}
                    >
                      All ({dbReports.length})
                    </button>
                    <button
                      onClick={() => setReportsFilter('FOUND')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${reportsFilter === 'FOUND' ? 'bg-[#45D153] text-[#02241d]' : 'text-emerald-100/70 hover:text-white'}`}
                    >
                      Found Bins ({dbReports.filter(r => r.reportType === 'Found').length})
                    </button>
                    <button
                      onClick={() => setReportsFilter('DAMAGE')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${reportsFilter === 'DAMAGE' ? 'bg-[#45D153] text-[#02241d]' : 'text-emerald-100/70 hover:text-white'}`}
                    >
                      Damaged ({dbReports.filter(r => r.reportType === 'Damaged').length})
                    </button>
                  </div>
                </div>

                {dbReports.filter(r => reportsFilter === 'ALL' ? true : reportsFilter === 'FOUND' ? r.reportType === 'Found' : r.reportType === 'Damaged').length === 0 ? (
                  <div className="text-center py-12 bg-[#032f26] rounded-2xl border border-[#0c624f] p-6">
                    <CheckCircle className="h-10 w-10 text-emerald-400/50 mx-auto mb-3" />
                    <p className="text-sm font-mono text-emerald-100/90">No reports found matching the selected filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dbReports
                      .filter(r => reportsFilter === 'ALL' ? true : reportsFilter === 'FOUND' ? r.reportType === 'Found' : r.reportType === 'Damaged')
                      .map((rep) => (
                        <div key={rep.reportId} className="p-4 bg-[#032f26] border border-[#0c624f] hover:border-[#45D153]/50 rounded-2xl text-xs space-y-3 transition-all shadow-md">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase font-mono tracking-wider ${
                                rep.reportType === 'Found' ? 'bg-[#45D153]/20 text-[#45D153] border border-[#45D153]/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {rep.reportType} Bin Report
                              </span>
                              <h4 className="font-mono font-bold text-white text-sm mt-1">{rep.serialNumber}</h4>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-300 bg-[#02241d] border border-[#0c624f] px-2 py-1 rounded-md">
                              {rep.status || 'Active'}
                            </span>
                          </div>

                          <p className="text-emerald-100/90 leading-relaxed bg-[#02241d]/80 p-2.5 rounded-xl border border-[#0c624f]/60">
                            {rep.description || 'No detailed description provided.'}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#0c624f]/50 text-[11px] font-mono text-emerald-100/70">
                            <span>Reporter: {rep.finderName || 'Anonymous Neighbour'}</span>
                            <span>{new Date(rep.timestamp).toLocaleDateString()}</span>
                          </div>

                          <button
                            onClick={() => setInspectedReport(rep)}
                            className="w-full py-2 bg-[#043b31] hover:bg-[#064e3f] text-[#45D153] border border-[#0c624f] hover:border-[#45D153] rounded-xl font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Inspect Full Details & Actions</span>
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CHAT FEED & MESSAGES */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0c624f]/70 pb-4">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-[#45D153] font-mono">Chat Feed & Direct Messaging</h3>
                    <p className="text-xs text-emerald-100/80 mt-0.5">Communicate with tag finders, bin owners, and local residents instantly.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#032f26] p-1 rounded-xl border border-[#0c624f]">
                    <button
                      onClick={() => setMessagesFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${messagesFilter === 'ALL' ? 'bg-[#45D153] text-[#02241d]' : 'text-emerald-100/70 hover:text-white'}`}
                    >
                      All ({dbMessages.length})
                    </button>
                    <button
                      onClick={() => setMessagesFilter('UNREAD')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${messagesFilter === 'UNREAD' ? 'bg-[#45D153] text-[#02241d]' : 'text-emerald-100/70 hover:text-white'}`}
                    >
                      Unread ({dbMessages.filter(m => m.status === 'Unread').length})
                    </button>
                  </div>
                </div>

                {/* Quick Chat Composer - ONLY FOR ADMIN */}
                {currentUser.accountType === 'admin' ? (
                  <form onSubmit={handleSendChatMessage} className="bg-[#032f26] p-5 rounded-2xl border border-[#0c624f] space-y-4 shadow-md">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#45D153] flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Send Message to Tag Owner / Resident</span>
                    </h4>

                    {chatSuccess && (
                      <div className="p-3 bg-[#064e3f] border border-[#45D153] text-[#45D153] text-xs rounded-xl font-mono flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <span>Message dispatched successfully! It is now synced to the Chat Feed.</span>
                      </div>
                    )}

                    {chatError && (
                      <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl font-mono flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{chatError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-mono text-emerald-100/70 mb-1">Target Tag Serial Number</label>
                        <input
                          type="text"
                          placeholder="e.g. SBT-UK-88219"
                          value={chatSerial}
                          onChange={(e) => setChatSerial(e.target.value.toUpperCase())}
                          className="w-full bg-[#02241d] border border-[#0c624f] rounded-xl px-3 py-2 text-white placeholder-emerald-100/30 focus:border-[#45D153] font-mono uppercase focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-emerald-100/70 mb-1">Your Sender Name</label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={chatSenderName}
                          onChange={(e) => setChatSenderName(e.target.value)}
                          className="w-full bg-[#02241d] border border-[#0c624f] rounded-xl px-3 py-2 text-white placeholder-emerald-100/30 focus:border-[#45D153] font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-emerald-100/70 mb-1">Message Body</label>
                      <textarea
                        rows={2}
                        placeholder="Type your message or instructions..."
                        value={chatMessageText}
                        onChange={(e) => setChatMessageText(e.target.value)}
                        className="w-full bg-[#02241d] border border-[#0c624f] rounded-xl p-3 text-white placeholder-emerald-100/30 focus:border-[#45D153] font-mono text-xs focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#45D153] hover:bg-[#32b53f] text-[#02241d] font-mono font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                    >
                      <Send className="h-4 w-4" />
                      <span>Dispatch Chat Message</span>
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-[#032f26] border border-[#0c624f] rounded-2xl text-xs font-mono text-emerald-300 flex items-center gap-2.5 shadow-sm">
                    <Info className="h-4 w-4 text-[#45D153] shrink-0" />
                    <span>Chat Feed is read-only. Only Municipal Administrators can dispatch messages to residents.</span>
                  </div>
                )}

                {/* Messages List */}
                {dbMessages.filter(m => messagesFilter === 'ALL' ? true : m.status === 'Unread').length === 0 ? (
                  <p className="text-xs text-emerald-100/60 font-mono text-center py-6">No messages found in chat feed.</p>
                ) : (
                  <div className="space-y-3">
                    {dbMessages
                      .filter(m => messagesFilter === 'ALL' ? true : m.status === 'Unread')
                      .map((msg) => (
                        <div key={msg.messageId} className="p-4 bg-[#032f26] border border-[#0c624f] rounded-2xl text-xs space-y-2 shadow-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white text-sm">{msg.senderName}</span>
                              <span className="bg-[#043b31] text-[#45D153] border border-[#0c624f] text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                                Tag: {msg.serialNumber}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-300">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-emerald-100/90 leading-relaxed bg-[#02241d] p-3 rounded-xl border border-[#0c624f]/60">
                            {msg.message}
                          </p>

                          <div className="flex items-center justify-between gap-2 pt-1 text-[11px] font-mono">
                            <span className="text-emerald-100/60">Email: {msg.senderEmail || 'N/A'}</span>
                            <div className="flex items-center gap-3">
                              {currentUser.accountType === 'admin' && (
                                <button
                                  onClick={() => {
                                    setChatSerial(msg.serialNumber);
                                    window.scrollTo({ top: document.getElementById('tabs-section')?.offsetTop || 0, behavior: 'smooth' });
                                  }}
                                  className="text-[#45D153] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Send className="h-3 w-3" />
                                  <span>Reply</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  mockDb.deleteMessage(msg.messageId);
                                  pullRealtimeDatabase();
                                }}
                                className="text-rose-400 hover:text-rose-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SUPPORT TICKETS */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0c624f]/70 pb-4">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-[#45D153] font-mono">Support Tickets Centre</h3>
                    <p className="text-xs text-emerald-100/80 mt-0.5">Submit new help tickets or track resolution status in real-time.</p>
                  </div>
                </div>

                {/* Submit Ticket Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!ticketSubject.trim() || !ticketDesc.trim()) return;
                    mockDb.submitSupportTicket(currentUser.uid, ticketSubject, ticketDesc, ticketPriority);
                    setTicketSubject('');
                    setTicketDesc('');
                    setTicketSuccess(true);
                    pullRealtimeDatabase();
                    setTimeout(() => setTicketSuccess(false), 4000);
                  }}
                  className="bg-[#032f26] p-5 rounded-2xl border border-[#0c624f] space-y-4 shadow-md"
                >
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#45D153] flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>Submit New Support Ticket</span>
                  </h4>

                  {ticketSuccess && (
                    <div className="p-3 bg-[#064e3f] border border-[#45D153] text-[#45D153] text-xs rounded-xl font-mono flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>Ticket submitted successfully! Support team has been notified.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-mono text-emerald-100/70 mb-1">Subject / Issue Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Missing bin tag replacement request"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        className="w-full bg-[#02241d] border border-[#0c624f] rounded-xl px-3 py-2 text-white placeholder-emerald-100/30 focus:border-[#45D153] font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-emerald-100/70 mb-1">Priority Level</label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value as any)}
                        className="w-full bg-[#02241d] border border-[#0c624f] rounded-xl px-3 py-2 text-white focus:border-[#45D153] font-mono focus:outline-none cursor-pointer"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-emerald-100/70 mb-1">Detailed Description</label>
                    <textarea
                      rows={2}
                      placeholder="Describe your issue or query..."
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      className="w-full bg-[#02241d] border border-[#0c624f] rounded-xl p-3 text-white placeholder-emerald-100/30 focus:border-[#45D153] font-mono text-xs focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#45D153] hover:bg-[#32b53f] text-[#02241d] font-mono font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Support Ticket</span>
                  </button>
                </form>

                {/* Tickets List */}
                {dbTickets.length === 0 ? (
                  <p className="text-xs text-emerald-100/60 font-mono text-center py-6">No support tickets submitted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {dbTickets.map((t) => (
                      <div key={t.id} className="p-4 bg-[#032f26] border border-[#0c624f] rounded-2xl text-xs space-y-2 shadow-md">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm">{t.subject}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                              t.priority === 'CRITICAL' ? 'bg-rose-950/80 text-rose-300 border border-rose-800' :
                              t.priority === 'HIGH' ? 'bg-amber-950/80 text-amber-300 border border-amber-800' :
                              'bg-[#043b31] text-[#45D153] border border-[#0c624f]'
                            }`}>
                              {t.priority}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-300 bg-[#02241d] border border-[#0c624f] px-2 py-0.5 rounded-md">
                            {t.status}
                          </span>
                        </div>

                        <p className="text-emerald-100/90 leading-relaxed bg-[#02241d] p-3 rounded-xl border border-[#0c624f]/60">
                          {t.description || t.message}
                        </p>

                        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-100/60 pt-1">
                          <span>Ticket ID: {t.id}</span>
                          <div className="flex items-center gap-3">
                            <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                            <button
                              onClick={() => {
                                mockDb.deleteSupportTicket(t.id);
                                pullRealtimeDatabase();
                              }}
                              className="text-rose-400 hover:text-rose-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: AUDIT LOGS */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#45D153] font-mono">Audit Logs & History</h3>
                {dbAuditLogs.length === 0 ? (
                  <p className="text-xs text-emerald-100/60 font-mono">No audit logs recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {dbAuditLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-[#032f26] border border-[#0c624f] rounded-xl text-xs font-mono flex justify-between items-center shadow-sm">
                        <span className="text-white">{log.action}</span>
                        <span className="text-emerald-300 text-[11px]">{new Date(log.createdAt || log.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INSPECT REPORT MODAL */}
      {inspectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#054337] border-2 border-[#0c624f] rounded-3xl max-w-lg w-full p-6 text-white space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-[#0c624f] pb-4">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase font-mono tracking-wider ${
                  inspectedReport.reportType === 'Found' ? 'bg-[#45D153]/20 text-[#45D153] border border-[#45D153]/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {inspectedReport.reportType} Report
                </span>
                <h3 className="text-lg font-mono font-bold mt-1 text-white">{inspectedReport.serialNumber}</h3>
              </div>
              <button
                onClick={() => setInspectedReport(null)}
                className="p-1.5 rounded-lg bg-[#032f26] border border-[#0c624f] text-emerald-100 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-[#032f26] p-3 rounded-xl border border-[#0c624f] space-y-1">
                <span className="text-emerald-300 font-bold">Reported Issue / Notes:</span>
                <p className="text-emerald-100/90">{inspectedReport.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#032f26] p-3 rounded-xl border border-[#0c624f]">
                <div>
                  <span className="text-emerald-100/60 block">Finder / Reporter:</span>
                  <span className="font-bold text-white">{inspectedReport.finderName || 'Anonymous'}</span>
                </div>
                <div>
                  <span className="text-emerald-100/60 block">Contact Phone:</span>
                  <span className="font-bold text-white">{inspectedReport.finderPhone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-emerald-100/60 block">Postcode:</span>
                  <span className="font-bold text-white">{inspectedReport.postcode || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-emerald-100/60 block">House / Street:</span>
                  <span className="font-bold text-white">{inspectedReport.houseNumber || ''} {inspectedReport.location || ''}</span>
                </div>
              </div>

              {inspectedReport.photoUrl && (
                <div className="bg-[#032f26] p-3 rounded-xl border border-[#0c624f] space-y-1">
                  <span className="text-emerald-300 font-bold block mb-1">Attached Inspection Photo:</span>
                  <img src={inspectedReport.photoUrl} alt="Bin report evidence" className="w-full h-40 object-cover rounded-lg border border-[#0c624f]" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#0c624f]">
              <button
                onClick={() => {
                  const targetBin = bins.find(b => b.serialNumber === inspectedReport.serialNumber);
                  if (targetBin) {
                    mockDb.updateBin(targetBin.binId, { status: 'Active' });
                  }
                  setInspectedReport(null);
                  pullRealtimeDatabase();
                }}
                className="w-full py-2.5 bg-[#45D153] hover:bg-[#32b53f] text-[#02241d] font-mono font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark Bin Status as Recovered / Active</span>
              </button>

              <button
                onClick={() => {
                  setChatSerial(inspectedReport.serialNumber);
                  setInspectedReport(null);
                  scrollToTabsSection('messages');
                }}
                className="w-full py-2 bg-[#032f26] hover:bg-[#064e3f] text-[#45D153] border border-[#0c624f] rounded-xl font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Open Chat Feed for this Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}