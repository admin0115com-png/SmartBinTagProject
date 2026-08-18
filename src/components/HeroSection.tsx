import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { User, Bin } from '../types';
import { mockDb } from '../mockDb';
import {
  ShieldCheck, Bell, MapPin, QrCode, AlertTriangle, ArrowRight, CheckCircle2,
  HelpCircle, Smartphone, UserPlus, Compass, Wifi, Nfc, Activity,
  User as UserIcon, Clock, FileText, BookOpen, Settings, Camera, Check, X, Sparkles, Share2, Plus
} from 'lucide-react';

interface HeroSectionProps {
  setView: (view: string, params?: Record<string, unknown>) => void;
  onEnterSerialDirectly: (action: 'found' | 'damaged' | 'register', serial?: string) => void;
  currentUser?: User | null;
  bins?: Bin[];
  onRefresh?: () => void;
}

// Reliable DiceBear avatar URLs (using stable v9 endpoint)
export const PRELOADED_AVATARS = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&skinColor=d08b5b&hairColor=4a312c&top=theCaesar&clothing=shirtVNeck&clothesColor=ffffff&facialHairProbability=0&mouth=smile&eyes=happy',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&skinColor=d08b5b&top=hijab&facialHairProbability=0&mouth=smile&eyes=happy',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Jack&skinColor=ffdbb4&hairColor=2c1b18&top=hat&hatColor=262626&clothing=hoodie&clothesColor=262626&facialHairProbability=0&mouth=smile&eyes=happy',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Kim&skinColor=ffdbb4&hairColor=2c1b18&top=shortFlat&accessories=prescription02&accessoriesProbability=100&accessoriesColor=f1c40f&facialHairProbability=0&mouth=smile&eyes=happy',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Sara&skinColor=ffdbb4&hairColor=2c1b18&top=straight01&facialHairProbability=0&mouth=smile&eyes=happy',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=George&top=turban&hatColor=ff9900&skinColor=d08b5b&facialHair=beardLight&facialHairProbability=100&mouth=smile&eyes=happy',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Mimi&skinColor=d08b5b&hairColor=2c1b18&top=shortCurly&facialHairProbability=0&mouth=smile&eyes=happy',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver&skinColor=edb98a&hairColor=2c1b18&top=shortWaved&clothing=hoodie&clothesColor=27ae60&facialHairProbability=0&mouth=smile&eyes=happy',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Maya&skinColor=ae5d29&hairColor=2c1b18&top=dreads01&facialHairProbability=0&mouth=smile&eyes=happy',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Liam&skinColor=614335&hairColor=2c1b18&top=curvy&facialHairProbability=0&mouth=smile&eyes=happy'
];

type TagStatus = {
  valid: boolean;
  status: 'Available' | 'Registered' | 'Disabled' | 'Lost' | 'Invalid';
  ownerName?: string;
};

export default function HeroSection({
  setView,
  onEnterSerialDirectly,
  currentUser,
  bins = [],
  onRefresh
}: HeroSectionProps) {
  // ==== State ====
  const [serialInput, setSerialInput] = useState('SBT-00000000');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [tagStatus, setTagStatus] = useState<TagStatus>({ valid: true, status: 'Available' });

  // ==== Helpers ====
  const playBeep = useCallback((freq = 880, duration = 0.15) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      console.warn('Audio Context failed to play scanner feedback:', err);
    }
  }, []);

  const handleSelectAvatar = useCallback((url: string) => {
    if (!currentUser) {
      alert('Please log in to change your avatar.');
      return;
    }
    try {
      mockDb.updateUser(currentUser.uid, { profilePhoto: url });
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert(`Failed to save avatar: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [currentUser, onRefresh]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Please select a valid image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarUploadError('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => handleSelectAvatar(reader.result as string);
    reader.onerror = () => setAvatarUploadError('Failed to read image file.');
    reader.readAsDataURL(file);
  }, [handleSelectAvatar]);

  const getBinBgColor = useCallback((color: string) => {
    const c = color.toLowerCase();
    const map: Record<string, string> = {
      brown: 'bg-[#78350f] border-[#92400e]/30',
      red: 'bg-[#f43f5e] border-rose-500/30',
      purple: 'bg-[#8b5cf6] border-violet-500/30',
      green: 'bg-[#059669] border-emerald-500/30',
      blue: 'bg-[#2563eb] border-blue-500/30',
      grey: 'bg-[#4b5563] border-gray-500/30',
      gray: 'bg-[#4b5563] border-gray-500/30'
    };
    return map[c] || 'bg-[#02241d] border-[#064e3f]';
  }, []);

  // ==== Effects ====
  useEffect(() => {
    const trimmed = serialInput.trim().toUpperCase();
    if (!trimmed) {
      setTagStatus({ valid: false, status: 'Invalid' });
      return;
    }

    const validation = mockDb.validateSerialNumber(trimmed);
    if (!validation.valid) {
      setTagStatus({ valid: false, status: 'Invalid' });
    } else {
      const tag = validation.tag;
      setTagStatus({
        valid: true,
        status: (tag?.status as TagStatus['status']) || 'Available',
        ownerName: tag?.ownerId
          ? (tag.ownerId === 'usr-admin-primary' ? 'You' : 'Another User')
          : undefined
      });
    }
  }, [serialInput]);

  // ==== Actions ====
  const handleAction = useCallback((actionType: 'register' | 'found' | 'damaged') => {
    const trimmed = serialInput.trim().toUpperCase();
    const validation = mockDb.validateSerialNumber(trimmed);
    const targetSerial = validation.valid && validation.tag ? validation.tag.serialNumber : serialInput;
    onEnterSerialDirectly(actionType, targetSerial);
  }, [onEnterSerialDirectly, serialInput]);

  const handleSelectPreseededSticker = useCallback((serial: string) => {
    playBeep(660, 0.08);
    setSerialInput(serial);
  }, [playBeep]);

  // ==== Derived Values ====
  const welcomeTag = useMemo(() => {
    return currentUser ? 'WELCOME BACK,' : 'WELCOME,';
  }, [currentUser]);

  const displayName = useMemo(() => {
    return currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'DEMO ACCOUNT - LOGIN/SIGNUP ABOVE';
  }, [currentUser]);

  const binCountLabel = useMemo(() => {
    return bins.length > 0 ? `${bins.length} Active` : '6 Active';
  }, [bins.length]);

  // ==== Render ====
  return (
    <div className="bg-[#04352b] flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-10 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#064e3f]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Block */}
          <div className="lg:col-span-6 flex flex-col space-y-4 lg:space-y-6 text-left z-10 lg:sticky lg:top-24">
            <div className="inline-flex items-center self-start bg-[#45D153]/10 border border-[#45D153]/20 px-3 py-1 rounded-full shadow-inner">
              <span className="text-[10px] font-black tracking-widest text-[#45D153] font-sans uppercase">
                DIGITAL IDENTITY FOR BINS
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight uppercase">
                The <span className="text-[#45D153]">Registration Plate</span> <br className="hidden sm:block" /> for your Bin.
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/85 max-w-xl leading-relaxed opacity-90 font-normal">
                Secure your property, receive collection reminders, and get notified instantly if your bin is found or damaged.
              </p>
            </div>
          </div>

          {/* Right Block */}
          <div className="lg:col-span-6 flex flex-col space-y-5 z-10 select-none">
            {/* Welcome Banner */}
            <div className="w-full bg-[#04352b] border-l-4 border-[#45D153] rounded-r-2xl p-4.5 flex items-center justify-between shadow-lg border border-l-0 border-[#064e3f]">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black tracking-[0.22em] text-[#45D153] block uppercase font-mono">
                  {welcomeTag}
                </span>
                <h2 className="text-base sm:text-2xl font-black text-white tracking-tight uppercase font-sans">
                  {displayName}
                </h2>
              </div>
              <div
                className="relative cursor-pointer group"
                onClick={() => {
                  if (!currentUser) {
                    alert('Please log in to customize your avatar.');
                    setView('login', {});
                  } else {
                    setIsAvatarModalOpen(true);
                  }
                }}
                title="Click to customize avatar"
              >
                {currentUser?.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto}
                    alt="User Avatar"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover shadow-md border-2 border-[#45D153] group-hover:brightness-110 transition-all"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#45D153] flex items-center justify-center text-[#04352b] font-black text-sm shadow-md group-hover:bg-[#5ce06a] transition-all">
                    {currentUser ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase() : 'AK'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#45D153] border-2 border-[#011914] rounded-full animate-pulse pointer-events-none"></span>
              </div>
            </div>

            {/* Dashboard Button */}
            {currentUser && (
              <div className="w-full">
                <button
                  onClick={() => setView('dashboard', {})}
                  className="w-full h-12 bg-gradient-to-r from-[#45D153] to-emerald-400 hover:from-[#5ce06a] hover:to-emerald-300 text-[#04352b] font-black tracking-[0.15em] text-xs rounded-xl flex items-center justify-center gap-2.5 shadow-xl shadow-[#45D153]/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border border-[#45D153]/30"
                >
                  <Activity className="h-4.5 w-4.5 animate-pulse" />
                  <span>LAUNCH SECURE DASHBOARD</span>
                </button>
              </div>
            )}

            {/* Registered Plates Card */}
            <div className="w-full bg-white border border-gray-200 text-gray-900 rounded-[24px] p-5 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center mb-3.5">
                <span className="text-[10px] font-black tracking-widest text-[#047857] uppercase font-sans">
                  REGISTERED STICKERS
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-mono border border-emerald-200">
                  {binCountLabel}
                </span>
              </div>

              <div className="space-y-3 mb-6 max-h-[185px] overflow-y-auto pr-1.5 scroll-smooth custom-scrollbar">
                {bins.length > 0 ? (
                  bins.map((bin) => (
                    <div
                      key={bin.binId}
                      onClick={() => handleSelectPreseededSticker(bin.serialNumber)}
                      className={`${getBinBgColor(bin.binType)} hover:brightness-110 active:scale-[0.99] text-white p-3.5 rounded-2xl flex items-center justify-between border shadow-md cursor-pointer transition-all`}
                      title="Click to load into Tag Scanner"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white/90">
                          <QrCode className="h-5.5 w-5.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black tracking-wider uppercase">{bin.binType} BIN</h4>
                          <span className="text-[10px] font-mono opacity-85">{bin.serialNumber}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold opacity-75 block uppercase">STATUS</span>
                        <span className="text-xs font-black">{bin.status}</span>
                      </div>
                    </div>
                  ))
                ) : currentUser ? (
                  /* User / Admin with no registered bins: render BLANK until new bin tags are registered */
                  <div className="py-8 text-center border-2 border-dashed border-emerald-900/40 rounded-2xl bg-emerald-950/10">
                    <QrCode className="h-8 w-8 text-emerald-600/40 mx-auto mb-2" />
                    <p className="text-xs font-bold text-emerald-200/60 uppercase tracking-wider font-mono">No Registered Stickers Yet</p>
                    <p className="text-[10px] text-emerald-100/40 mt-1">Register a new Smart Bin Tag to place it here.</p>
                  </div>
                ) : (
                  <>
                    {/* Guest registered stickers box: show full demo tags */}
                    {[
                      { type: 'BROWN', serial: 'SBT-00000006', color: 'bg-[#78350f] border-[#92400e]/30', text: 'text-amber-200/80', status: 'In 3 Days' },
                      { type: 'RED', serial: 'SBT-00000010', color: 'bg-[#f43f5e] border-rose-500/30', text: 'text-rose-100/80', status: 'Next Friday' },
                      { type: 'PURPLE', serial: 'SBT-00000008', color: 'bg-[#8b5cf6] border-violet-500/30', text: 'text-violet-100/80', status: 'In 2 weeks' },
                      { type: 'GREEN', serial: 'SBT-00000001', color: 'bg-[#059669] border-emerald-500/30', text: 'text-emerald-100/80', status: 'Tomorrow' },
                      { type: 'BLUE', serial: 'SBT-00000003', color: 'bg-[#2563eb] border-blue-500/30', text: 'text-blue-100/80', status: 'Monday' },
                      { type: 'GREY', serial: 'SBT-00000002', color: 'bg-[#4b5563] border-gray-500/30', text: 'text-gray-200/80', status: 'Next Month' }
                    ].map((demo) => (
                      <div
                        key={demo.serial}
                        onClick={() => handleSelectPreseededSticker(demo.serial)}
                        className={`${demo.color} hover:brightness-110 active:scale-[0.99] text-white p-3.5 rounded-2xl flex items-center justify-between border shadow-md cursor-pointer transition-all`}
                        title="Click to load into Tag Scanner"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white/90">
                            <QrCode className="h-5.5 w-5.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black tracking-wider uppercase">{demo.type} BIN</h4>
                            <span className={`text-[10px] font-mono ${demo.text}`}>{demo.serial}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold opacity-75 block uppercase">COLLECTION</span>
                          <span className="text-xs font-black">{demo.status}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Recent Notifications */}
              <div className="mb-4">
                <span className="text-[10px] font-black tracking-widest text-[#047857] block uppercase mb-3 font-sans">
                  RECENT NOTIFICATIONS
                </span>
                <div className="space-y-2.5">
                  <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl flex items-center space-x-3 shadow-xs">
                    <div className="h-8.5 w-8.5 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-gray-900 block leading-none">Damage Reported</span>
                      <span className="text-[10px] text-gray-500 font-mono">SBT-00045632 • 2h ago</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl flex items-center space-x-3 shadow-xs">
                    <div className="h-8.5 w-8.5 rounded-full bg-emerald-500/10 text-[#047857] flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                      <Bell className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-gray-900 block leading-none">Collection Reminder</span>
                      <span className="text-[10px] text-gray-500 font-mono">Green Bin • Scheduled</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-[9px] font-bold text-gray-400 font-mono uppercase mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-emerald-700">ACTIVE LIVE</span>
                </div>
                <span>SBT-PLATE® V2</span>
              </div>
            </div>

            {/* Tag Scanner */}
            <div className="bg-[#04352b] border border-[#064e3f] rounded-[20px] p-5 w-full shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-[#45D153]/10 border border-[#45D153]/20 flex items-center justify-center text-[#45D153] flex-shrink-0">
                    <QrCode className="h-5 w-5 text-[#45D153]" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black tracking-widest text-[#45D153] uppercase font-sans">
                      TAG SCANNER / BARCODE NUMBER
                    </h3>
                    <p className="text-[10.5px] text-white/80 mt-0.5 leading-relaxed font-sans">
                      Enter or scan high-durability serial code to trigger real-time actions in Nhost database.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-4.5">
                <div className="flex justify-between items-center text-[9px] font-bold text-white font-mono tracking-wider">
                  <label htmlFor="serial-number" className="flex items-center gap-1 text-white">SERIAL NUMBER (8-DIGIT)</label>
                  <span className="text-white/80 text-[8.5px] font-mono">SBT-00000000 TO SBT-50000000</span>
                </div>

                <div className="relative">
                  <input
                    id="serial-number"
                    type="text"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
                    placeholder="SBT-00000000"
                    className="w-full h-11 bg-[#011a14]/95 border border-[#064e3f] focus:border-[#45D153] rounded-lg pl-3 pr-24 text-white font-mono text-sm font-bold tracking-widest placeholder-white/40 outline-none transition-all focus:ring-1 focus:ring-[#45D153]/20"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none select-none">
                    {tagStatus.valid ? (
                      tagStatus.status === 'Available' ? (
                        <span className="bg-emerald-950/80 border border-emerald-500/30 text-[#45D153] text-[9px] font-black font-mono px-2 py-1 rounded-md uppercase tracking-wider">AVAILABLE</span>
                      ) : tagStatus.status === 'Registered' ? (
                        <span className="bg-blue-950/80 border border-blue-500/30 text-blue-300 text-[9px] font-black font-mono px-2 py-1 rounded-md uppercase tracking-wider">
                          REGISTERED {tagStatus.ownerName === 'You' ? '(YOU)' : ''}
                        </span>
                      ) : tagStatus.status === 'Lost' ? (
                        <span className="bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[9px] font-black font-mono px-2 py-1 rounded-md uppercase tracking-wider">LOST TAG</span>
                      ) : (
                        <span className="bg-rose-950/80 border border-rose-500/30 text-rose-300 text-[9px] font-black font-mono px-2 py-1 rounded-md uppercase tracking-wider">DISABLED</span>
                      )
                    ) : (
                      <span className="bg-red-950/80 border border-red-500/30 text-red-300 text-[9px] font-black font-mono px-2 py-1 rounded-md uppercase tracking-wider">INVALID FORMAT</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[9.5px] text-white/80 font-mono mt-1">
                  <Wifi className="h-3 w-3 text-[#45D153] animate-pulse" />
                  <span className="text-white/90">
                    {tagStatus.valid
                      ? tagStatus.status === 'Available'
                        ? 'Unregistered tag. Click REGISTER below to bind with simulated Nhost database.'
                        : tagStatus.status === 'Registered'
                          ? 'Owned tag. Matches registered record in Nhost GraphQL engine.'
                          : tagStatus.status === 'Lost'
                            ? 'Active alert! Tag marked Lost. Tap REPORT LOST to view finder details.'
                            : 'Inactive tag. Registration is disabled by municipal administrator.'
                      : 'Form factor format: SBT- followed by exactly 8 numerical digits.'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => { playBeep(700, 0.1); handleAction('register'); }}
                  disabled={!tagStatus.valid}
                  className="bg-[#059669] hover:bg-[#047857] disabled:bg-[#064e3f]/40 text-white font-black text-[11px] tracking-widest uppercase h-11 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  REGISTER
                </button>
                <button
                  onClick={() => { playBeep(600, 0.1); handleAction('found'); }}
                  disabled={!tagStatus.valid}
                  className="bg-transparent hover:bg-[#064e3f]/30 border border-[#064e3f] disabled:border-[#064e3f]/20 disabled:text-gray-500 text-white font-black text-[11px] tracking-widest uppercase h-11 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <MapPin className="h-4 w-4" />
                  REPORT LOST
                </button>
                <button
                  onClick={() => { playBeep(600, 0.1); handleAction('found'); }}
                  disabled={!tagStatus.valid}
                  className="bg-transparent hover:bg-[#064e3f]/30 border border-[#064e3f] disabled:border-[#064e3f]/20 disabled:text-gray-500 text-white font-black text-[11px] tracking-widest uppercase h-11 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" />
                  FOUND UNREGISTERED
                </button>
                <button
                  onClick={() => { playBeep(600, 0.1); handleAction('damaged'); }}
                  disabled={!tagStatus.valid}
                  className="bg-transparent hover:bg-[#064e3f]/30 border border-[#064e3f] disabled:border-[#064e3f]/20 disabled:text-gray-500 text-white font-black text-[11px] tracking-widest uppercase h-11 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <AlertTriangle className="h-4 w-4" />
                  REPORT DAMAGE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-[#064e3f]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">How It Works</h2>
          <p className="text-emerald-200 mt-3 text-xs sm:text-sm max-w-2xl mx-auto opacity-95">
            An easy, flexible six-step process to secure and track every standard council bin on your property.
          </p>
        </div>
        <div className="border border-[#064e3f] rounded-[24px] overflow-hidden shadow-2xl bg-[#011a14] relative">
          <img
            src="/src/assets/images/bin_tag_garden_mockup_1783859098816.jpg"
            alt="Smart Bin Tag App and Wheelie Bin Mockup"
            className="w-full h-auto object-cover block"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Six-Step Process */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-[#064e3f]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { num: '01', label: 'STEP 1', title: 'Attach Tag', desc: 'Secure the weather-resistant high-durability Smart Bin Tag mount plate directly on your wheelie bin.' },
            { num: '02', label: 'STEP 2', title: 'Scan Barcode', desc: 'Aim your mobile camera or tap standard NFC to scan and reach the registration portal.' },
            { num: '03', label: 'STEP 3', title: 'Sign Up', desc: 'Create a password-protected account and activate email or push verification settings.' },
            { num: '04', label: 'STEP 4', title: 'Input Serial', desc: 'Link your premium identifier (SBT-XXXXXXXX) with your localized street and zip code.' },
            { num: '05', label: 'STEP 5', title: 'Stay Protected', desc: 'Enjoy lightning-fast alerts if your bin gets lost, damaged, or collection is tomorrow.' },
            { num: '06', label: 'OPTIONAL', title: 'Optional Tracker', desc: 'Includes a screw-open internal cavity allowing you to host an Apple AirTag or third-party Bluetooth tracker securely inside.', optional: true }
          ].map((step) => (
            <div key={step.num} className="bg-[#022c22] border border-[#064e3f] p-6 rounded-2xl relative min-h-[190px] flex flex-col justify-between hover:border-[#45D153]/25 transition-all">
              <span className="absolute top-6 right-6 text-2xl font-black text-white font-mono">{step.num}</span>
              <div>
                <span className={`inline-block ${step.optional ? 'bg-[#b45309]' : 'bg-[#45D153]/10 text-[#45D153] border border-[#45D153]/20'} font-mono font-bold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded mb-4`}>
                  {step.label}
                </span>
                <h4 className="text-base font-black text-white uppercase tracking-tight">{step.title}</h4>
                <p className="text-[11px] text-white/70 mt-2 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SAVE APP TO DEVICE */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-[#064e3f]">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#45D153]/10 border border-[#45D153]/30 rounded-full text-[#45D153] text-[10px] font-mono font-black uppercase tracking-widest mb-3">
            <Smartphone className="h-3.5 w-3.5" /> Mobile PWA App Setup
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">SAVE APP TO DEVICE</h2>
          <p className="text-emerald-200 mt-3 text-xs sm:text-sm max-w-2xl mx-auto opacity-95 leading-relaxed">
            Follow these simple steps to save SmartBinTag on your mobile browser for easy, 24/7 instant access wherever you are.
          </p>
        </div>

        {/* Infographic & Guide Banner */}
        <div className="bg-[#011a14] border border-[#064e3f] rounded-[24px] p-4 sm:p-6 shadow-2xl space-y-6">
          <div className="rounded-2xl overflow-hidden border border-[#064e3f] shadow-lg max-w-4xl mx-auto">
            <img
              src="/src/assets/images/save_app_three_phones_hand_1785956916628.jpg"
              alt="Save SmartBinTag App 3-Phone Guide with smartbintagapp.com, Bottom Share Button, and Green SBT App Icon"
              className="w-full h-auto object-cover block"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-[#022c22] border border-[#064e3f] p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#45D153] font-mono font-black text-xs">
                <span className="w-6 h-6 rounded-full bg-[#45D153]/20 flex items-center justify-center text-xs">1</span>
                <span>OPEN SMARTBINTAG APP</span>
              </div>
              <p className="text-xs text-gray-300 leading-snug">
                Open <span className="text-[#45D153] font-mono font-bold">https://smartbintagapp.com</span> in your mobile browser (Safari on iPhone or Chrome on Android).
              </p>
            </div>

            <div className="bg-[#022c22] border border-[#064e3f] p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#45D153] font-mono font-black text-xs">
                <span className="w-6 h-6 rounded-full bg-[#45D153]/20 flex items-center justify-center text-xs">2</span>
                <span>TAP SHARE / MENU</span>
              </div>
              <p className="text-xs text-gray-300 leading-snug">
                Tap the <span className="text-white font-bold inline-flex items-center gap-1"><Share2 className="h-3 w-3 text-[#45D153]" /> Share</span> button on the bottom middle of your phone screen (iOS) or options menu <span className="font-bold">⋮</span> (Android).
              </p>
            </div>

            <div className="bg-[#022c22] border border-[#064e3f] p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#45D153] font-mono font-black text-xs">
                <span className="w-6 h-6 rounded-full bg-[#45D153]/20 flex items-center justify-center text-xs">3</span>
                <span>ADD SBT ICON TO HOME SCREEN</span>
              </div>
              <p className="text-xs text-gray-300 leading-snug">
                Select <span className="text-white font-bold inline-flex items-center gap-1"><Plus className="h-3 w-3 text-[#45D153]" /> Add to Home Screen</span>. The green squircle icon with white <span className="text-white font-black font-sans bg-[#45D153] px-1 py-0.5 rounded text-[10px]">SBT</span> text will save to your phone screen!
              </p>
            </div>

            <div className="bg-[#022c22] border border-[#064e3f] p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#45D153] font-mono font-black text-xs">
                <span className="w-6 h-6 rounded-full bg-[#45D153]/20 flex items-center justify-center text-xs">4</span>
                <span>SWITCH ON NOTIFICATIONS</span>
              </div>
              <p className="text-xs text-gray-300 leading-snug">
                Make sure your phone notifications are switched on so you can be notified when to take out your bin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use Smart Bin Tag? */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-[#064e3f]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">Why Use Smart Bin Tag?</h2>
          <p className="text-emerald-200 mt-3 text-xs sm:text-sm max-w-2xl mx-auto opacity-95">
            Say goodbye to ugly spray paint and permanent marker scribble. Upgrade your wheelie bins to modern cloud intelligence.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: <ShieldCheck className="h-5 w-5" />, title: 'Private Ownership', desc: 'Your address details and name are never publicly displayed. Solves GDPR. Finders look up the serialized database securely.' },
            { icon: <Bell className="h-5 w-5" />, title: 'Instance Reminders', desc: 'Configure custom evening-before and morning-of collection notifications so you never miss another collection window!' },
            { icon: <MapPin className="h-5 w-5" />, title: 'Recover Lost Bins', desc: 'Blown down the street after a storm? Anyone scan the code can note its GPS location and instantly send you a message!' },
            { icon: <Activity className="h-5 w-5" />, title: 'NFC Ready', desc: 'Built to scale. Tap with your smartphone and access instant serial logs without scanning a visual barcode.' },
            { icon: <Wifi className="h-5 w-5" />, title: 'Optional Tracker', desc: 'Includes a screw-open internal cavity allowing you to host an Apple AirTag or third-party Bluetooth tracker securely inside.', optional: true }
          ].map((card, idx) => (
            <div key={idx} className="bg-[#04352b] border border-[#064e3f] p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 relative">
              {card.optional && (
                <span className="absolute top-4 right-4 bg-[#b45309] text-[7px] font-black tracking-widest text-white px-1.5 py-0.5 rounded font-mono uppercase">OPTIONAL</span>
              )}
              <div>
                <div className="h-10 w-10 rounded-lg bg-[#45D153]/10 text-[#45D153] border border-[#45D153]/20 flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">{card.title}</h3>
                <p className="text-[11px] text-white/70 mt-2 leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#011a14] text-gray-400 py-10 px-4 sm:px-6 lg:px-8 border-t border-[#064e3f] mt-auto select-none">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#45D153] rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md shadow-[#45D153]/20 flex-shrink-0 font-sans tracking-tight">
              SBT
            </div>
            <div className="flex flex-col items-start space-y-0.5">
              <span className="font-sans font-black text-xs text-white tracking-widest uppercase">SMART BIN TAG LTD.</span>
              <span className="text-[8px] text-[#45D153] font-mono font-bold tracking-widest uppercase">DISTRICT PLATE SYSTEM</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] font-bold font-sans text-gray-400">
            <button
              onClick={() => setView('eula')}
              className="hover:text-[#45D153] transition-colors cursor-pointer"
            >
              EULA (End User Licence Agreement)
            </button>
            <button
              onClick={() => setView('privacy')}
              className="hover:text-[#45D153] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setView('terms')}
              className="hover:text-[#45D153] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setView('cookie')}
              className="hover:text-[#45D153] transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
            <button
              onClick={() => setView('contact')}
              className="hover:text-[#45D153] text-[#45D153] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Contact &amp; Support Hub</span>
            </button>
            <button
              onClick={() => setView('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Council Integration Program
            </button>
          </div>
        </div>
      </footer>

      {/* Avatar Picker Modal */}
      {isAvatarModalOpen && currentUser && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#02241d] border border-[#064e3f] rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => { setIsAvatarModalOpen(false); setAvatarUploadError(null); }}
              className="absolute top-4 right-4 text-emerald-400/70 hover:text-white p-1 hover:bg-[#04352b] rounded-lg transition-colors cursor-pointer"
              aria-label="Close avatar picker"
            >
              <X className="h-6 w-6" />
            </button>

            <div>
              <span className="text-[10px] text-[#45D153] font-mono tracking-[0.3em] font-bold uppercase block">CUSTOMIZE PROFILE</span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight uppercase">Choose Your Avatar</h2>
              <p className="text-xs text-emerald-300/60 font-sans mt-1">Select from our human cartoon presets or upload your own device photo.</p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold">Human Cartoon Presets</span>
              <div className="grid grid-cols-5 gap-3">
                {PRELOADED_AVATARS.map((avatarUrl, idx) => {
                  const isSelected = currentUser.profilePhoto === avatarUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAvatar(avatarUrl)}
                      className={`relative rounded-full aspect-square border-2 transition-all p-0.5 overflow-hidden hover:scale-105 active:scale-95 cursor-pointer bg-[#04352b] ${
                        isSelected ? 'border-[#45D153] ring-2 ring-[#45D153]/20' : 'border-[#064e3f] hover:border-emerald-400/50'
                      }`}
                      title={`Avatar ${idx + 1}`}
                    >
                      <img
                        src={avatarUrl}
                        alt={`Avatar ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover"
                        loading="lazy"
                      />
                      {isSelected && (
                        <span className="absolute bottom-0 right-0 bg-[#45D153] text-[#04352b] rounded-full p-0.5 border border-[#02241d]">
                          <Check className="h-3 w-3 font-black" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[#064e3f] pt-5 space-y-3">
              <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold block">Upload Custom Image</span>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#064e3f] hover:border-[#45D153]/50 rounded-2xl p-4 transition-colors relative bg-[#011a14]/60 group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Camera className="h-8 w-8 text-emerald-500 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs text-emerald-200 font-bold mt-2 font-sans group-hover:text-white">Drag & Drop or Click to Browse</span>
                <span className="text-[10px] text-emerald-500/60 font-sans mt-0.5">Supports JPEG, PNG, WEBP (Max 2MB)</span>
              </div>
              {avatarUploadError && (
                <p className="text-rose-400 text-xs font-medium text-center font-sans mt-1">❌ {avatarUploadError}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => { setIsAvatarModalOpen(false); setAvatarUploadError(null); }}
                className="px-5 h-11 bg-gradient-to-r from-[#45D153] to-emerald-400 hover:from-[#5ce06a] hover:to-emerald-300 text-[#04352b] text-xs font-black rounded-xl cursor-pointer shadow-lg shadow-[#45D153]/10"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}