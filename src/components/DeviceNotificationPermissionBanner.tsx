import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Check, X, Share2, PlusSquare } from 'lucide-react';
import { requestPushNotificationPermission, getNotificationPermissionState, sendNativeDeviceNotification } from '../lib/pushNotifications';

interface DeviceNotificationPermissionBannerProps {
  userId?: string;
}

export default function DeviceNotificationPermissionBanner({ userId }: DeviceNotificationPermissionBannerProps) {
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
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

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const result = await requestPushNotificationPermission(userId);
      setPermissionState(result);

      if (result === 'granted') {
        await sendNativeDeviceNotification(
          'SmartBinTag Alerts Activated! 🔔',
          'Your phone is now connected. You will receive collection pop-up reminders even when the app is closed.',
          { url: '/dashboard' }
        );
        setTestSuccess(true);
        setTimeout(() => setTestSuccess(false), 5000);
      } else if (result === 'denied') {
        alert('Notification permission was blocked. To receive alerts, please enable notifications in your phone Settings -> Apps -> SmartBinTag.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="bg-gradient-to-r from-[#02241d] via-[#04352b] to-[#011a14] border-2 border-[#45D153]/60 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
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
                  Native Push
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-1 max-w-2xl font-sans">
                Enable native notifications to receive collection reminders and sound alerts directly on your device lock screen—<strong>even when the browser is closed</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            {isIos && !isStandalone ? (
              <button
                type="button"
                onClick={() => setShowIosGuide(!showIosGuide)}
                className="w-full md:w-auto px-4 py-2.5 bg-[#02241d] hover:bg-[#064e3f] border-2 border-[#45D153] text-white hover:text-[#45D153] text-xs font-black uppercase rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-[#45D153]" />
                <span>{showIosGuide ? 'Hide iPhone Step' : 'iPhone Setup (Add to Home)'}</span>
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

        {showIosGuide && isIos && !isStandalone && (
          <div className="mt-4 pt-4 border-t border-[#064e3f] space-y-3 animate-in fade-in">
            <div className="p-3 bg-[#011a14] rounded-xl border border-[#064e3f] space-y-2">
              <p className="text-xs font-bold text-white uppercase font-sans flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#45D153]" />
                <span>How to enable Lockscreen Alerts on iPhone / iPad (iOS 16.4+):</span>
              </p>
              <ol className="text-xs text-emerald-200/90 space-y-1.5 list-decimal list-inside font-sans pl-1">
                <li>Tap the Safari <strong>Share button</strong> <Share2 className="inline w-3.5 h-3.5 text-[#45D153] mx-1" /> at the bottom.</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="inline w-3.5 h-3.5 text-[#45D153] mx-1" />.</li>
                <li>Open the <strong>SmartBinTag icon</strong> from your Home Screen.</li>
                <li>Tap <strong>"Activate Device Alerts"</strong> and tap <strong>Allow</strong>.</li>
              </ol>
              <p className="text-[11px] text-[#45D153] font-mono pt-1">
                ✓ SmartBinTag will then appear in your phone's <strong>Settings ➔ Notifications</strong> alongside all other apps!
              </p>
            </div>
          </div>
        )}

        {testSuccess && (
          <div className="mt-3 p-2.5 bg-[#45D153]/20 border border-[#45D153]/50 rounded-xl flex items-center gap-2 text-[#45D153] text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>Notification permission granted! Test notification sent to your device lock screen.</span>
          </div>
        )}
      </div>
    </div>
  );
}
