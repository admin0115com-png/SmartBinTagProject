import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Smartphone, 
  Check, 
  X, 
  Share2, 
  PlusSquare, 
  Volume2
} from 'lucide-react';
import { 
  requestPushNotificationPermission, 
  getNotificationPermissionState, 
  syncNotificationSettingsToNhost 
} from '../lib/pushNotifications';

interface DeviceNotificationPermissionBannerProps {
  userId?: string;
}

const ALARM_TONES = [
  'Chime Classic',
  'Digital Alert',
  'Eco Sweep',
  'Emerald Ping',
  'Bin Alert High',
  'Solar Pulse',
  'District Whistle',
  'Radar Echo',
  'Nhost Sync Ping',
  'Snooze Harmony',
  'Loud Alarm Siren',
  'Fire Alarm Sound',
  'Alarm Panic Sound'
];

/**
 * Web Audio API synthesizer for the 13 selectable alarm tones
 */
function playSyntheticTone(toneName: string) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (toneName) {
      case 'Digital Alert':
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'Eco Sweep':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'Emerald Ping':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1046.5, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'Bin Alert High':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1760, now + 0.15);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'Solar Pulse':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
        break;

      case 'District Whistle':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.linearRampToValueAtTime(2200, now + 0.2);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'Radar Echo':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'Nhost Sync Ping':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.12);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'Snooze Harmony':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'Loud Alarm Siren':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.25);
        osc.frequency.linearRampToValueAtTime(600, now + 0.5);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;

      case 'Fire Alarm Sound':
        osc.type = 'square';
        osc.frequency.setValueAtTime(950, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;

      case 'Alarm Panic Sound':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.15);
        osc.frequency.linearRampToValueAtTime(1400, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
        break;

      case 'Chime Classic':
      default:
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
    }
  } catch (err) {
    console.warn('[Audio] Failed to synthesize preview tone:', err);
  }
}

export default function DeviceNotificationPermissionBanner({ userId }: DeviceNotificationPermissionBannerProps) {
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [selectedTone, setSelectedTone] = useState('Chime Classic');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('sbt_notif_banner_dismissed') === 'true';
  });

  useEffect(() => {
    const checkState = () => {
      const state = getNotificationPermissionState();
      setPermissionState(state.permission);

      const isAppleIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIos(isAppleIos);

      const isPwaStandalone = window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isPwaStandalone);
    };

    checkState();
  }, []);

  const handlePreviewTone = (tone: string) => {
    setSelectedTone(tone);
    setIsPlayingAudio(true);
    playSyntheticTone(tone);
    setTimeout(() => setIsPlayingAudio(false), 800);
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const result = await requestPushNotificationPermission(userId);
      setPermissionState(result);

      if (result === 'granted') {
        if (userId) {
          await syncNotificationSettingsToNhost(userId, true);
        }

        setTestSuccess(true);
        setTimeout(() => setTestSuccess(false), 5000);
      } else if (result === 'denied') {
        alert('Notification permission was blocked. To receive alerts, please enable notifications in your browser or phone Settings.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('sbt_notif_banner_dismissed', 'true');
  };

  if (permissionState === 'granted' || (isDismissed && permissionState !== 'default')) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-2 select-none">
      <div className="bg-gradient-to-r from-[#02241d] via-[#04352b] to-[#011a14] border-2 border-[#45D153]/60 rounded-2xl p-3.5 sm:p-5 shadow-2xl relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#45D153]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 sm:gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#45D153]/20 border border-[#45D153]/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(69,209,83,0.3)]">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#45D153]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm md:text-base font-black text-white uppercase tracking-tight font-sans">
                  Phone & Tablet Collection Alerts
                </h4>
                <span className="px-1.5 py-0.5 rounded bg-[#45D153]/20 text-[#45D153] border border-[#45D153]/40 text-[9px] sm:text-[10px] font-black uppercase font-mono tracking-wider">
                  Native Push & Audio
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/80 mt-0.5 sm:mt-1 max-w-2xl font-sans leading-relaxed">
                Receive bin collection reminders (Evening Before & Morning) directly on your lock screen—<strong>even when closed</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            {/* Tone Selector & Preview */}
            <div className="flex items-center gap-1 bg-[#011a14] border border-[#064e3f] rounded-xl p-1 shrink-0">
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="bg-transparent text-emerald-300 text-[10px] sm:text-[11px] font-mono font-bold focus:outline-none px-1 py-0.5 cursor-pointer max-w-[130px] sm:max-w-none"
                title="Select Alarm Tone to Preview"
              >
                {ALARM_TONES.map((t) => (
                  <option key={t} value={t} className="bg-[#02241d] text-white">
                    {t}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handlePreviewTone(selectedTone)}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isPlayingAudio 
                    ? 'bg-[#45D153] text-[#04352b] animate-pulse'
                    : 'bg-[#064e3f] hover:bg-[#086350] text-[#45D153]'
                }`}
                title="Play tone test"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
              {isIos && !isStandalone ? (
                <button
                  type="button"
                  onClick={() => setShowIosGuide(!showIosGuide)}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#02241d] hover:bg-[#064e3f] border-2 border-[#45D153] text-white hover:text-[#45D153] text-[11px] sm:text-xs font-black uppercase rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#45D153]" />
                  <span>{showIosGuide ? 'Hide Steps' : 'iPhone Setup'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  disabled={isRequesting}
                  className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[#45D153] hover:bg-[#3bc048] text-[#04352b] text-[11px] sm:text-xs font-black uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(69,209,83,0.4)] cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  <Bell className="w-3.5 h-3.5 font-black" />
                  <span>{isRequesting ? 'Connecting...' : 'Activate Alerts'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 sm:p-2 text-emerald-400/60 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* iOS Web Push Setup Instructions */}
        {showIosGuide && isIos && !isStandalone && (
          <div className="mt-3 pt-3 border-t border-[#064e3f] space-y-2 animate-in fade-in">
            <div className="p-3 bg-[#011a14] rounded-xl border border-[#064e3f] space-y-1.5">
              <p className="text-xs font-bold text-white uppercase font-sans flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#45D153]" />
                <span>Enable Lock Screen Alerts on iPhone / iPad:</span>
              </p>
              <ol className="text-[11px] text-emerald-200/90 space-y-1 list-decimal list-inside font-sans pl-1">
                <li>Tap Safari <strong>Share</strong> <Share2 className="inline w-3 h-3 text-[#45D153] mx-0.5" />.</li>
                <li>Tap <strong>"Add to Home Screen"</strong> <PlusSquare className="inline w-3 h-3 text-[#45D153] mx-0.5" />.</li>
                <li>Open from Home Screen and tap <strong>"Activate Alerts"</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Activation Success Banner */}
        {testSuccess && (
          <div className="mt-2.5 p-2.5 bg-[#45D153]/20 border border-[#45D153]/50 rounded-xl flex items-center gap-2 text-[#45D153] text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>Device connected! Real collection reminders will pop up on your lock screen.</span>
          </div>
        )}
      </div>
    </div>
  );
}
