import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Smartphone, 
  Check, 
  X, 
  Share2, 
  PlusSquare, 
  Volume2, 
  VolumeX,
  Play
} from 'lucide-react';
import { 
  requestPushNotificationPermission, 
  getNotificationPermissionState, 
  sendNativeDeviceNotification,
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
        // Play sample tone
        playSyntheticTone(selectedTone);

        // Send local native push notification test
        await sendNativeDeviceNotification(
          'SmartBinTag Alerts Activated! 🔔',
          'Your device is connected. You will receive collection pop-up reminders and audio alarms on your lock screen.',
          { 
            url: '/?view=my-bins',
            sound: true,
            tag: 'sbt-activation-test'
          }
        );

        if (userId) {
          await syncNotificationSettingsToNhost(userId, true);
        }

        setTestSuccess(true);
        setTimeout(() => setTestSuccess(false), 6000);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 select-none">
      <div className="bg-gradient-to-r from-[#02241d] via-[#04352b] to-[#011a14] border-2 border-[#45D153]/60 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#45D153]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#45D153]/20 border border-[#45D153]/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(69,209,83,0.3)] animate-pulse">
              <Bell className="w-6 h-6 text-[#45D153]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight font-sans">
                  Phone & Tablet Collection Pop-up Alerts
                </h4>
                <span className="px-2 py-0.5 rounded-md bg-[#45D153]/20 text-[#45D153] border border-[#45D153]/40 text-[10px] font-black uppercase font-mono tracking-wider">
                  Native Push & 13 Audio Tones
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-1 max-w-2xl font-sans">
                Enable native notifications to receive bin collection reminders (Evening Before & Collection Morning) and sound alerts directly on your device lock screen—<strong>even when the browser is closed</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap">
            {/* Quick Sound Preview Selector */}
            <div className="flex items-center gap-1 bg-[#011a14] border border-[#064e3f] rounded-xl p-1">
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="bg-transparent text-emerald-300 text-[11px] font-mono font-bold focus:outline-none px-1.5 py-1 cursor-pointer"
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

            {isIos && !isStandalone ? (
              <button
                type="button"
                onClick={() => setShowIosGuide(!showIosGuide)}
                className="w-full md:w-auto px-4 py-2.5 bg-[#02241d] hover:bg-[#064e3f] border-2 border-[#45D153] text-white hover:text-[#45D153] text-xs font-black uppercase rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-[#45D153]" />
                <span>{showIosGuide ? 'Hide iPhone Steps' : 'iPhone Setup (Add to Home)'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="w-full md:w-auto px-5 py-2.5 bg-[#45D153] hover:bg-[#3bc048] text-[#04352b] text-xs font-black uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(69,209,83,0.4)] cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bell className="w-4 h-4 font-black" />
                <span>{isRequesting ? 'Connecting...' : 'Activate Device Alerts'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 text-emerald-400/60 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* iOS Web Push Setup Instructions */}
        {showIosGuide && isIos && !isStandalone && (
          <div className="mt-4 pt-4 border-t border-[#064e3f] space-y-3 animate-in fade-in">
            <div className="p-3.5 bg-[#011a14] rounded-xl border border-[#064e3f] space-y-2">
              <p className="text-xs font-bold text-white uppercase font-sans flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#45D153]" />
                <span>How to enable Lockscreen Alerts on iPhone / iPad (iOS 16.4+):</span>
              </p>
              <ol className="text-xs text-emerald-200/90 space-y-1.5 list-decimal list-inside font-sans pl-1">
                <li>Tap the Safari <strong>Share button</strong> <Share2 className="inline w-3.5 h-3.5 text-[#45D153] mx-1" /> at the bottom of your screen.</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="inline w-3.5 h-3.5 text-[#45D153] mx-1" />.</li>
                <li>Open the <strong>SmartBinTag icon</strong> from your iPhone / iPad Home Screen.</li>
                <li>Tap <strong>"Activate Device Alerts"</strong> and select <strong>Allow</strong>.</li>
              </ol>
              <p className="text-[11px] text-[#45D153] font-mono pt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>SmartBinTag will then appear in your phone's <strong>Settings ➔ Notifications</strong> alongside all your apps!</span>
              </p>
            </div>
          </div>
        )}

        {/* Test Notification Banner */}
        {testSuccess && (
          <div className="mt-3 p-3 bg-[#45D153]/20 border border-[#45D153]/50 rounded-xl flex items-center gap-2.5 text-[#45D153] text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>Device notifications & audio tone verified! Test collection pop-up sent to your device lock screen.</span>
          </div>
        )}
      </div>
    </div>
  );
}
