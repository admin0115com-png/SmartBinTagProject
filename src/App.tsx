/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { mockDb } from './mockDb';
import { User, Bin, NotificationItem, BinReport, PrivateMessage, ReminderSchedule, BinTag, ActiveAlarmData } from './types';
import Navigation from './components/Navigation';
import NotificationCenter from './components/NotificationCenter';
import HeroSection from './components/HeroSection';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MyBins from './components/MyBins';
import RegisterBin from './components/RegisterBin';
import Reports from './components/Reports';
import AdminPanel from './components/AdminPanel';
import LegalDocuments from './components/LegalDocuments';
import CookieConsentBanner from './components/CookieConsentBanner';
import ContactSupportHub from './components/ContactSupportHub';
import PostcodeSelector from './components/PostcodeSelector';
import { lookupUkPostcodeArea, formatPostcode, PostcodeAreaInfo } from './data/ukPostcodeAreas';
import { Bell, Key, Settings, Sparkles, Mail, Check, AlertCircle, RefreshCw, X, ShieldAlert, CheckCircle, Smartphone, Volume2, Camera, User as UserIcon } from 'lucide-react';
import { PRELOADED_AVATARS } from './components/HeroSection';
import { registerServiceWorker, syncCollectionAlertToNhost, sendNativeDeviceNotification, syncNotificationSettingsToNhost, requestPushNotificationPermission } from './lib/pushNotifications';

const nhost = {
  sessionStorage: {
    onChange: () => () => {}
  },
  auth: {
    signOut: async () => {}
  }
};

interface RouteState {
  view: string;
  serialNumber?: string;
  action?: 'found' | 'damaged' | 'message';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [route, setRoute] = useState<RouteState>({ view: 'home' });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarmData | null>(null);
  const [activeAlarmBin, setActiveAlarmBin] = useState<Bin | null>(null);
  const [activeAlarmType, setActiveAlarmType] = useState<string | null>(null);
  const [dismissedAlarms, setDismissedAlarms] = useState<string[]>([]);
  const [snoozedAlarms, setSnoozedAlarms] = useState<Record<string, number>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [bins, setBins] = useState<Bin[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reports, setReports] = useState<BinReport[]>([]);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [tags, setTags] = useState<BinTag[]>([]);
  const [launchStep, setLaunchStep] = useState<1 | 2 | 3 | 4>(() => {
    const hasSession = !!localStorage.getItem('sbt_logged_in_uid');
    return hasSession ? 2 : 1;
  });
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const startStep = localStorage.getItem('sbt_logged_in_uid') ? 2 : 1;
    let t1: any, t2: any, t3: any;
    if (startStep === 1) {
      t1 = setTimeout(() => setLaunchStep(2), 2500);
      t2 = setTimeout(() => setLaunchStep(3), 5000);
      t3 = setTimeout(() => setLaunchStep(4), 7500);
    } else {
      t2 = setTimeout(() => setLaunchStep(3), 2500);
      t3 = setTimeout(() => setLaunchStep(4), 5000);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (launchStep === 3) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 4;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [launchStep]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [postcode, setPostcode] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [avatarUploadErr, setAvatarUploadErr] = useState<string | null>(null);
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [emailPref, setEmailPref] = useState(true);
  const [pushPref, setPushPref] = useState(true);
  const [inAppPref, setInAppPref] = useState(true);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteReasons, setDeleteReasons] = useState<string[]>([]);
  const [deleteFeedback, setDeleteFeedback] = useState('');
  const [deleteConfirmedTick, setDeleteConfirmedTick] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    const viewTitleMap: Record<string, string> = {
      home: 'LOGO',
      dashboard: 'Dashboard',
      scan: 'Scan Bin Tag',
      register: 'Sign Up',
      login: 'Login',
      report: 'Report Bin',
      admin: 'Admin Panel',
      contact: 'Support Hub',
      settings: 'Account Settings',
      'legal-terms': 'Terms of Service',
      'legal-privacy': 'Privacy Policy',
      'legal-cookies': 'Cookie Policy',
      'legal-acceptable-use': 'Acceptable Use',
      'legal-disclaimer': 'Legal Disclaimer',
      'legal-sla': 'Service Level Agreement',
    };
    const section = viewTitleMap[route.view] || 'LOGO';
    document.title = `${section} | SmartBinTag | Notify & Secure Your Bin | SBTAPP`;
  }, [route.view]);

  useEffect(() => {
    const unsubscribe = nhost.sessionStorage.onChange((session) => {
      if (session?.user) {
        const email = session.user.email || '';
        if (email) {
          const fullName = session.user.displayName || '';
          const nameParts = fullName.trim().split(/\s+/);
          const fName = nameParts[0] || 'Google';
          const lName = nameParts.slice(1).join(' ') || 'User';
          const res = mockDb.loginExternal(email, fName, lName);
          if (res.success && res.user) {
            localStorage.setItem('sbt_logged_in_uid', res.user.uid);
            setCurrentUser(res.user);
            setBins(mockDb.getBins(res.user.uid));
            setNotifications(mockDb.getNotifications(res.user.uid));
            setFirstName(res.user.firstName);
            setLastName(res.user.lastName);
            setPhoneNumber(res.user.phoneNumber || '');
            setPostcode(res.user.postcode || '');
            setEmailPref(res.user.notificationPreferences.emailEnabled);
            setPushPref(res.user.notificationPreferences.pushEnabled);
            setRoute({ view: 'home' });
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const syncLocalDatabaseState = () => {
    const user = mockDb.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setBins(mockDb.getBins(user.uid));
      setNotifications(mockDb.getNotifications(user.uid));
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhoneNumber(user.phoneNumber || '');
      setPostcode(user.postcode || '');
      setProfilePhoto(user.profilePhoto || '');
      setEmailPref(user.notificationPreferences.emailEnabled);
      setPushPref(user.notificationPreferences.pushEnabled);
    } else {
      setBins([]);
      setNotifications([]);
    }
    setUsers(mockDb.getUsers());
    setReports(mockDb.getReports());
    setMessages(mockDb.getMessages());
    setTags(mockDb.getTags());
  };

  useEffect(() => {
    syncLocalDatabaseState();
    const unsubscribeDb = mockDb.subscribeToDb(() => {
      syncLocalDatabaseState();
    });
    const urlParams = new URLSearchParams(window.location.search);
    const scannedSerial = urlParams.get('serial');
    const directAction = urlParams.get('action');
    const pathname = window.location.pathname;
    if (pathname === '/admin-dashboard' || pathname === '/admin-dashboard/') {
      setRoute({ view: 'admin' });
    } else if (pathname === '/dashboard' || pathname === '/dashboard/') {
      setRoute({ view: 'dashboard' });
    } else if (scannedSerial) {
      if (directAction === 'found') {
        setRoute({ view: 'report-found', serialNumber: scannedSerial, action: 'found' });
      } else if (directAction === 'damaged') {
        setRoute({ view: 'report-damage', serialNumber: scannedSerial, action: 'damaged' });
      } else {
        setRoute({ view: 'report-found', serialNumber: scannedSerial, action: 'found' });
      }
    }
    return () => unsubscribeDb();
  }, []);

  const playSynthesizedAlarm = (toneName: string) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      let ctx = (window as any).__sbtAudioCtx;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AudioContextClass();
        (window as any).__sbtAudioCtx = ctx;
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
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
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
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
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch (e) {}
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeAlarmBin) return;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentDateStrLocal = `${year}-${month}-${day}`;
      let currentDateStrUTC = '';
      try {
        currentDateStrUTC = now.toISOString().split('T')[0];
      } catch (err) {
        currentDateStrUTC = currentDateStrLocal;
      }
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 ? hours % 12 : 12;
      const currentTimeStr12 = `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;
      const currentTimeStr24 = `${String(hours).padStart(2, '0')}:${minutes}`;
      const currentMinuteKey = `${currentDateStrLocal}-${currentTimeStr12}`;

      const checkTimeMatch = (storedTime: string | undefined, current12hr: string, current24hr: string) => {
        if (!storedTime) return false;
        const s = storedTime.trim().replace(/\s+/g, '').toLowerCase();
        const c12 = current12hr.trim().replace(/\s+/g, '').toLowerCase();
        const c24 = current24hr.trim().replace(/\s+/g, '').toLowerCase();
        if (s === c12 || s === c24) return true;
        const getMins = (t: string) => {
          const isAp = t.includes('am') || t.includes('pm');
          if (isAp) {
            const m = t.match(/(\d+):(\d+)(am|pm)/);
            if (!m) return -1;
            let h = parseInt(m[1], 10);
            const mn = parseInt(m[2], 10);
            const ap = m[3];
            if (ap === 'pm' && h < 12) h += 12;
            if (ap === 'am' && h === 12) h = 0;
            return h * 60 + mn;
          } else {
            const m = t.match(/(\d+):(\d+)/);
            if (!m) return -1;
            const h = parseInt(m[1], 10);
            const mn = parseInt(m[2], 10);
            return h * 60 + mn;
          }
        };
        const sm = getMins(s);
        const cm12 = getMins(c12);
        const cm24 = getMins(c24);
        return sm !== -1 && (sm === cm12 || sm === cm24);
      };

      for (const bin of bins) {
        if (bin.beforeCollectionEnabled && (bin.beforeCollectionDate === currentDateStrLocal || bin.beforeCollectionDate === currentDateStrUTC)) {
          if (checkTimeMatch(bin.beforeCollectionTime, currentTimeStr12, currentTimeStr24)) {
            const alarmId = `${bin.binId}-before-${currentMinuteKey}`;
            const snoozeKey = `${bin.binId}-before`;
            const isSnoozed = snoozedAlarms[snoozeKey] && Date.now() < snoozedAlarms[snoozeKey];
            if (!dismissedAlarms.includes(alarmId) && !isSnoozed) {
              const title = `BEFORE COLLECTION ALERT: ${bin.binType.toUpperCase()} BIN (${bin.serialNumber})`;
              const body = `Attention! Put out your ${bin.colorName} ${bin.binType} bin for collection at ${bin.address || 'your address'}. Alert set for ${bin.beforeCollectionTime}.`;
              const tone = bin.alarmTone || 'Chime Classic';
              setActiveAlarm({
                serialNumber: bin.serialNumber,
                label: 'Evening Before Collection Alarm',
                tone,
                time: bin.beforeCollectionTime || currentTimeStr12
              });
              if (currentUser) {
                mockDb.addNotification(currentUser.uid, 'Collection Reminder', title, body, '/');
                syncCollectionAlertToNhost(currentUser.uid, bin.binId, 'BEFORE_COLLECTION', title, body);
              }
              setDismissedAlarms(prev => [...prev, alarmId]);
            }
          }
        }
        if (bin.collectionDayEnabled && (bin.collectionDayDate === currentDateStrLocal || bin.collectionDayDate === currentDateStrUTC)) {
          if (checkTimeMatch(bin.collectionDayTime, currentTimeStr12, currentTimeStr24)) {
            const alarmId = `${bin.binId}-day-${currentMinuteKey}`;
            const snoozeKey = `${bin.binId}-day`;
            const isSnoozed = snoozedAlarms[snoozeKey] && Date.now() < snoozedAlarms[snoozeKey];
            if (!dismissedAlarms.includes(alarmId) && !isSnoozed) {
              const title = `COLLECTION DAY ALERT: ${bin.binType.toUpperCase()} BIN (${bin.serialNumber})`;
              const body = `Reminder: Today is collection day for your ${bin.colorName} ${bin.binType} bin at ${bin.address || 'your address'}. Collection time: ${bin.collectionDayTime}.`;
              const tone = bin.alarmTone || 'Chime Classic';
              setActiveAlarm({
                serialNumber: bin.serialNumber,
                label: 'Collection Day Morning Alarm',
                tone,
                time: bin.collectionDayTime || currentTimeStr12
              });
              if (currentUser) {
                mockDb.addNotification(currentUser.uid, 'Collection Reminder', title, body, '/');
                syncCollectionAlertToNhost(currentUser.uid, bin.binId, 'COLLECTION_DAY', title, body);
              }
              setDismissedAlarms(prev => [...prev, alarmId]);
            }
          }
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [bins, activeAlarmBin, dismissedAlarms, snoozedAlarms]);

  const handleSnooze = (minutes: number = 15) => {
    if (!activeAlarmBin || !activeAlarmType) return;
    const typeKey = activeAlarmType === 'Before Collection' ? 'before' : 'day';
    const snoozeKey = `${activeAlarmBin.binId}-${typeKey}`;
    setSnoozedAlarms(prev => ({
      ...prev,
      [snoozeKey]: Date.now() + (minutes * 60 * 1000)
    }));
    setActiveAlarmBin(null);
    setActiveAlarmType(null);
  };

  const handleDismissAlarm = () => {
    if (!activeAlarmBin || !activeAlarmType) return;
    const typeKey = activeAlarmType === 'Before Collection' ? 'before' : 'day';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDateStr = `${year}-${month}-${day}`;
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const currentTimeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    const currentMinuteKey = `${currentDateStr}-${currentTimeStr}`;
    const alarmId = `${activeAlarmBin.binId}-${typeKey}-${currentMinuteKey}`;
    setDismissedAlarms(prev => [...prev, alarmId]);
    setActiveAlarmBin(null);
    setActiveAlarmType(null);
  };

  const handleSetView = (view: string, params?: Record<string, any>) => {
    setErrorBanner(null);
    setSettingsSuccess(null);
    setRoute({
      view,
      serialNumber: params?.serialNumber,
      action: params?.action
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: User) => {
    localStorage.setItem('sbt_logged_in_uid', user.uid);
    setCurrentUser(user);
    syncLocalDatabaseState();
    handleSetView('home');
  };

  const handleLogout = () => {
    mockDb.logout();
    localStorage.removeItem('sbt_logged_in_uid');
    setCurrentUser(null);
    syncLocalDatabaseState();
    handleSetView('home');
  };

  const handleEnterSerialDirectly = (actionType: 'found' | 'damaged' | 'register', providedSerial?: string) => {
    const serial = providedSerial || prompt("Scan Sticker / Enter 8-digit Serial Number (e.g. SBT-00000000):", "SBT-00000000");
    if (!serial) return;
    const normalized = serial.trim().toUpperCase();
    const validation = mockDb.validateSerialNumber(normalized);
    if (!validation.valid || !validation.tag) {
      alert(validation.error || "Invalid Serial format.");
      return;
    }
    const validSerial = validation.tag.serialNumber;
    if (actionType === 'register') {
      if (!currentUser) {
        alert("Verification successful! Please log in or create an account to complete your homeowner registration.");
        handleSetView('register', { serialNumber: validSerial });
      } else {
        handleSetView('register-bin', { serialNumber: validSerial });
      }
    } else if (actionType === 'found') {
      handleSetView('report-found', { serialNumber: validSerial, action: 'found' });
    } else if (actionType === 'damaged') {
      handleSetView('report-damage', { serialNumber: validSerial, action: 'damaged' });
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    mockDb.markNotificationRead(id);
    syncLocalDatabaseState();
  };

  const handleMarkAllNotificationsRead = () => {
    if (currentUser) {
      mockDb.markAllNotificationsRead(currentUser.uid);
      syncLocalDatabaseState();
    }
  };

  const handleDeleteNotification = (id: string) => {
    mockDb.deleteNotification(id);
    syncLocalDatabaseState();
  };

  const handleAutofillAddress = () => {
    const matched = lookupUkPostcodeArea(postcode || 'SW1A 1AA');
    if (matched) {
      if (!postcode) setPostcode(`${matched.code}1 1AA`);
      setHouseNumber('14');
      setStreet(matched.sampleStreet || 'High Street');
      alert(`Address autofilled for ${matched.name} (${matched.county}, ${matched.country})!`);
    } else {
      if (!postcode) setPostcode('SW1A 1AA');
      setHouseNumber('14');
      setStreet('High Street');
      alert('Address details autofilled based on UK postcode lookup!');
    }
  };

  const handleSelectAvatarInSettings = (url: string) => {
    if (!currentUser) return;
    setProfilePhoto(url);
    try {
      mockDb.updateUser(currentUser.uid, { profilePhoto: url });
      syncLocalDatabaseState();
      setSettingsSuccess('Avatar updated and saved to your profile.');
      setTimeout(() => setSettingsSuccess(null), 3000);
    } catch (err) {}
  };

  const handleAvatarUploadInSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarUploadErr('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarUploadErr('Image size must be less than 2MB.');
      return;
    }
    setAvatarUploadErr(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setProfilePhoto(dataUrl);
        try {
          mockDb.updateUser(currentUser.uid, { profilePhoto: dataUrl });
          syncLocalDatabaseState();
          setSettingsSuccess('Custom photo uploaded and saved to your profile.');
          setTimeout(() => setSettingsSuccess(null), 3000);
        } catch (err) {
          setAvatarUploadErr('Failed to save uploaded photo.');
        }
      }
    };
    reader.onerror = () => {
      setAvatarUploadErr('Failed to read file from your device.');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!firstName || !lastName) {
      alert('First and Last name are required.');
      return;
    }
    mockDb.updateUser(currentUser.uid, {
      firstName,
      lastName,
      phoneNumber: phoneNumber || undefined,
      postcode: postcode || undefined,
      profilePhoto: profilePhoto || currentUser.profilePhoto || undefined,
      notificationPreferences: {
        ...currentUser.notificationPreferences,
        emailEnabled: emailPref,
        pushEnabled: pushPref
      }
    });
    setSettingsSuccess('Account preferences synchronized successfully.');
    syncLocalDatabaseState();
    setTimeout(() => setSettingsSuccess(null), 3000);
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    setDeleteReasons([]);
    setDeleteFeedback('');
    setDeleteConfirmedTick(false);
    setShowDeleteAccountModal(true);
  };

  const confirmAndExecuteDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      mockDb.deleteUser(currentUser.uid);
      try {
        await nhost.auth.signOut({});
      } catch (err) {}
      localStorage.removeItem('sbt_logged_in_uid');
      setCurrentUser(null);
      setShowDeleteAccountModal(false);
      setDeleteReasons([]);
      setDeleteFeedback('');
      setDeleteConfirmedTick(false);
      setRoute({ view: 'home' });
      alert('Your account, registered bin tags, collection alerts, support tickets, messages, and reports have been permanently deleted from the web app and Nhost / Hasura database.');
    } catch (err: any) {
      alert('Error deleting account: ' + (err?.message || 'Unknown error'));
    }
  };

  if (launchStep < 4) {
    return (
      <div className={`fixed inset-0 z-[9999] ${launchStep === 1 ? 'bg-black' : 'bg-[#04352b]'} flex flex-col items-center justify-center select-none font-sans overflow-hidden transition-colors duration-500`}>
        {launchStep === 1 && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] bg-gradient-to-tr from-[#0a5222] via-[#22a833] to-[#45D153] flex items-center justify-center shadow-[0_0_50px_rgba(69,209,83,0.6)] border border-[#45D153]/40 shrink-0">
              <span className="text-white text-3xl sm:text-4xl font-black tracking-tight font-sans">SBT</span>
            </div>
            <div className="text-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-black text-[#45D153] tracking-[0.15em] font-sans uppercase drop-shadow-[0_0_35px_rgba(69,209,83,0.5)]">SMARTBINTAGAPP</span>
              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#45D153] to-transparent mx-auto mt-3"></div>
            </div>
          </div>
        )}
        {launchStep === 2 && (
          <div className="flex flex-col items-center justify-center animate-pulse duration-1000">
            <div className="flex items-center space-x-4 sm:space-x-6 scale-95 sm:scale-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[24px] bg-gradient-to-tr from-[#12912a] via-[#33c944] to-[#45D153] flex items-center justify-center shadow-[0_0_40px_rgba(69,209,83,0.35)] border border-[#45D153]/20 shrink-0">
                <span className="text-white text-2xl sm:text-3xl font-black tracking-tight font-sans">SBT</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.05em] text-white select-none font-sans">SMART BIN TAG</span>
              </div>
            </div>
          </div>
        )}
        {launchStep === 3 && (
          <div className="w-full max-w-sm sm:max-w-md mx-4 p-8 bg-[#02241d]/90 border border-[#064e3f] rounded-3xl shadow-2xl space-y-6 text-center animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="space-y-2">
              <span className="text-[10px] text-[#45D153] font-mono tracking-[0.3em] font-bold uppercase block">DISTRICT PLATE SYSTEM</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight">Welcome to Smart Bin Tag</h2>
              <p className="text-xs text-emerald-300/60 font-sans max-w-xs mx-auto">Initializing local security databases and cloud profiles with real-time Nhost syncing...</p>
            </div>
            <div className="space-y-2.5">
              <div className="w-full h-2.5 bg-[#011a14] border border-[#064e3f]/60 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-[#45D153] rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(69,209,83,0.4)]" style={{ width: `${loadingProgress}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-emerald-400 font-mono">
                <span>SYSTEM ONLINE</span>
                <span className="font-bold tracking-widest">{loadingProgress}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#04352b] pb-16 md:pb-0">
      <Navigation 
        currentUser={currentUser}
        currentView={route.view}
        setView={handleSetView}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onLogout={handleLogout}
        activeAlarm={activeAlarm}
        setActiveAlarm={setActiveAlarm}
      />
      <NotificationCenter 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDelete={handleDeleteNotification}
        setView={handleSetView}
      />
      <main className="flex-1">
        {route.view === 'home' && (
          <HeroSection 
            setView={handleSetView}
            onEnterSerialDirectly={handleEnterSerialDirectly}
            currentUser={currentUser}
            bins={bins}
            onRefresh={syncLocalDatabaseState}
          />
        )}
        {route.view === 'login' && (
          <Auth 
            initialMode="login"
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => handleSetView('home')}
            setView={handleSetView}
          />
        )}
        {route.view === 'register' && (
          <Auth 
            initialMode="register"
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => handleSetView('home')}
            setView={handleSetView}
          />
        )}
        {currentUser && route.view === 'dashboard' && (
          <Dashboard 
            currentUser={currentUser}
            bins={bins}
            notifications={notifications}
            reports={reports}
            setView={handleSetView}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />
        )}
        {currentUser && route.view === 'my-bins' && (
          <MyBins 
            ownerId={currentUser.uid}
            bins={bins}
            reports={reports}
            reminders={mockDb.getReminders(currentUser.uid)}
            onRefresh={syncLocalDatabaseState}
            setView={handleSetView}
            initialAction={route.action}
          />
        )}
        {currentUser && route.view === 'register-bin' && (
          <RegisterBin 
            ownerId={currentUser.uid}
            preFilledSerial={route.serialNumber}
            onSuccess={syncLocalDatabaseState}
            setView={handleSetView}
          />
        )}
        {route.view === 'report-found' && (
          <Reports 
            initialAction="found"
            initialSerial={route.serialNumber}
            setView={handleSetView}
            onRefresh={syncLocalDatabaseState}
          />
        )}
        {route.view === 'report-damage' && (
          <Reports 
            initialAction="damaged"
            initialSerial={route.serialNumber}
            setView={handleSetView}
            onRefresh={syncLocalDatabaseState}
          />
        )}
        {(route.view === 'report-message' || route.view === 'chat-feed') && (
          <Reports 
            initialAction="found"
            initialSerial={route.serialNumber}
            setView={handleSetView}
            onRefresh={syncLocalDatabaseState}
          />
        )}
        {currentUser && currentUser.accountType === 'admin' && route.view === 'admin' && (
          <AdminPanel 
            users={users}
            tags={tags}
            reports={reports}
            messages={messages}
            bins={bins}
            setView={handleSetView}
            onRefresh={syncLocalDatabaseState}
          />
        )}
        {currentUser && route.view === 'settings' && (
          <div className="max-w-xl mx-auto px-4 py-12 select-none">
            <div className="bg-[#02241d]/90 rounded-2xl border border-[#064e3f] shadow-2xl p-8 sm:p-10 space-y-6 text-white">
              <div className="border-b border-[#064e3f] pb-4">
                <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">Account Preferences</h2>
                <p className="text-xs text-emerald-100/70 mt-1">Configure profile details and customize collection reminder alerts.</p>
              </div>
              {settingsSuccess && (
                <div className="p-3.5 bg-[#45D153]/10 border border-[#45D153]/30 text-[#45D153] rounded-xl text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle className="h-4.5 w-4.5 text-[#45D153]" />
                  <span>{settingsSuccess}</span>
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="bg-[#011a14] border border-[#064e3f] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-[#45D153] uppercase font-mono block">Profile Avatar</span>
                      <p className="text-xs text-emerald-100/70">Select your cartoon avatar or upload a custom image.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAvatarPickerOpen(!isAvatarPickerOpen)}
                      className="px-3 py-1.5 bg-[#02241d] hover:bg-[#064e3f] border border-[#45D153]/50 text-[#45D153] hover:text-white rounded-lg text-xs font-black transition-all cursor-pointer shadow flex items-center gap-1.5"
                    >
                      <span>{isAvatarPickerOpen ? 'Hide Options' : 'Change Avatar'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="relative">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt="Current Avatar"
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#45D153] shadow-md bg-[#04352b]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#45D153] text-[#04352b] font-black text-lg flex items-center justify-center border-2 border-[#45D153]">
                          {firstName ? firstName[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 bg-[#45D153] text-[#04352b] rounded-full p-0.5 border border-[#011a14]" title="Active Avatar">
                        <Check className="h-3 w-3 font-bold" />
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase font-sans">
                        {currentUser.accountType === 'admin' ? 'Administrator Account Avatar' : 'Homeowner Profile Avatar'}
                      </p>
                      <p className="text-[10px] text-emerald-400/70 font-mono">Saves permanently across all your login sessions</p>
                    </div>
                  </div>
                  {isAvatarPickerOpen && (
                    <div className="pt-3 border-t border-[#064e3f]/60 space-y-4 animate-in fade-in duration-200">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold block mb-2">Preset Cartoon Avatars</span>
                        <div className="grid grid-cols-5 gap-2.5">
                          {PRELOADED_AVATARS.map((url, idx) => {
                            const isSelected = profilePhoto === url;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectAvatarInSettings(url)}
                                className={`relative rounded-full aspect-square border-2 transition-all p-0.5 overflow-hidden hover:scale-105 active:scale-95 cursor-pointer bg-[#04352b] ${isSelected ? 'border-[#45D153] ring-2 ring-[#45D153]/30' : 'border-[#064e3f] hover:border-emerald-400/50'}`}
                                title={`Preset ${idx + 1}`}
                              >
                                <img
                                  src={url}
                                  alt={`Preset ${idx + 1}`}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full rounded-full object-cover"
                                  loading="lazy"
                                />
                                {isSelected && (
                                  <span className="absolute inset-0 flex items-center justify-center bg-[#45D153]/40 rounded-full">
                                    <Check className="w-4 h-4 text-white font-bold" />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold block">Upload Custom Photo</span>
                        <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-[#064e3f] rounded-lg cursor-pointer hover:border-[#45D153]/50 transition-colors">
                          <Camera className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs text-emerald-300/80">Click to select image</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleAvatarUploadInSettings}
                            className="hidden"
                          />
                        </label>
                        {avatarUploadErr && (
                          <p className="text-xs text-red-400 font-mono">{avatarUploadErr}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-emerald-300/80 uppercase tracking-wide">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#011a14] border border-[#064e3f] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#45D153] focus:border-[#45D153]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-emerald-300/80 uppercase tracking-wide">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#011a14] border border-[#064e3f] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#45D153] focus:border-[#45D153]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-emerald-300/80 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#011a14] border border-[#064e3f] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#45D153] focus:border-[#45D153]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-emerald-300/80 uppercase tracking-wide">Postcode</label>
                    <button type="button" onClick={handleAutofillAddress} className="text-[10px] text-[#45D153] hover:text-white underline">Autofill Address</button>
                  </div>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#011a14] border border-[#064e3f] rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#45D153] focus:border-[#45D153]"
                  />
                </div>
                <div className="bg-[#011a14] border border-[#064e3f] rounded-xl p-4 space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-[#45D153] uppercase font-mono block">Notification Preferences</span>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-emerald-200/90">Email Notifications</span>
                      <input type="checkbox" checked={emailPref} onChange={(e) => setEmailPref(e.target.checked)} className="w-4 h-4 accent-[#45D153]" />
                                          </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-emerald-200/90">In-App Notifications</span>
                        <input type="checkbox" checked={inAppPref} onChange={(e) => setInAppPref(e.target.checked)} className="w-4 h-4 accent-[#45D153]" />
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-[#45D153] hover:bg-[#3bc048] text-[#04352b] font-black rounded-xl transition-all shadow-lg"
                  >
                    Save & Update Settings
                  </button>
                </form>
                <div className="border-t border-[#064e3f] pt-6 mt-6">
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-wide mb-3">Danger Zone</h3>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full px-4 py-3 bg-red-900/30 hover:bg-red-800/50 border border-red-500/50 text-red-300 font-bold rounded-xl transition-all"
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
        )}
        {route.view === 'legal-terms' && <LegalDocuments view="terms" setView={handleSetView} />}
        
        {route.view === 'legal-privacy' && <LegalDocuments view="privacy" setView={handleSetView} />}
        {route.view === 'legal-cookies' && <LegalDocuments view="cookies" setView={handleSetView} />}
        {route.view === 'legal-acceptable-use' && <LegalDocuments view="acceptable-use" setView={handleSetView} />}
        {route.view === 'legal-disclaimer' && <LegalDocuments view="disclaimer" setView={handleSetView} />}
        {route.view === 'legal-sla' && <LegalDocuments view="sla" setView={handleSetView} />}
        {route.view === 'contact' && <ContactSupportHub setView={handleSetView} currentUser={currentUser} />}
      </main>
      <CookieConsentBanner />
      {activeAlarm &&  (
        <div className="fixed inset-0 z-[9998] bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#02241d] border-2 border-[#45D153] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#45D153]/20 flex items-center justify-center animate-pulse">
                <Bell className="w-8 h-8 text-[#45D153]" />
              </div>
              <h3 className="text-xl font-black text-white">{activeAlarm.label}</h3>
              <p className="text-sm text-emerald-200/80">Serial: {activeAlarm.serialNumber}</p>
              <p className="text-lg font-bold text-[#45D153]">{activeAlarm.time}</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSnooze(15)}
                  className="flex-1 px-4 py-3 bg-[#064e3f] hover:bg-[#0a634f] text-white font-bold rounded-xl transition-all"
                >
                  Snooze 15m
                </button>
                <button
                  onClick={handleDismissAlarm}
                  className="flex-1 px-4 py-3 bg-[#45D153] hover:bg-[#3bc048] text-[#04352b] font-black rounded-xl transition-all"
                >
                  Dismiss
                </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {route.view === 'legal-terms' && <LegalDocuments view="terms" setView={handleSetView} />}
  {route.view === 'legal-privacy' && <LegalDocuments view="privacy" setView={handleSetView} />}
  {route.view === 'legal-cookies' && <LegalDocuments view="cookies" setView={handleSetView} />}
  {route.view === 'legal-acceptable-use' && <LegalDocuments view="acceptable-use" setView={handleSetView} />}
  {route.view === 'legal-disclaimer' && <LegalDocuments view="disclaimer" setView={handleSetView} />}
  {route.view === 'legal-sla' && <LegalDocuments view="sla" setView={handleSetView} />}
  {route.view === 'contact' && <ContactSupportHub setView={handleSetView} currentUser={currentUser} />}

      </div>
        </div>
      </div>
    </main>

<CookieConsentBanner />

{activeAlarm && (

  <div className="fixed inset-0 z-[9998] bg-black/85 flex items-center justify-center p-4">
    <div className="bg-[#02241d] border-2 border-[#45D153] rounded-2xl p-6 max-w-md w-full shadow-2xl">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#45D153]/20 flex items-center justify-center animate-pulse">
          <Bell className="w-8 h-8 text-[#45D153]" />
        </div>
        <h3 className="text-xl font-black text-white">{activeAlarm.label}</h3>
        <p className="text-sm text-emerald-200/80">Serial: {activeAlarm.serialNumber}</p>
        <p className="text-lg font-bold text-[#45D153]">{activeAlarm.time}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSnooze(15)}
            className="flex-1 px-4 py-3 bg-[#064e3f] hover:bg-[#0a634f] text-white font-bold rounded-xl transition-all"
          >
            Snooze 15m
          </button>
          <button
            onClick={handleDismissAlarm}
            className="flex-1 px-4 py-3 bg-[#45D153] hover:bg-[#3bc048] text-[#04352b] font-black rounded-xl transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  </div>
)}
{showDeleteAccountModal && (
  <div className="fixed inset-0 z-[9998] bg-black/85 flex items-center justify-center p-4">
    <div className="bg-[#02241d] border-2 border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
      <h3 className="text-xl font-black text-red-400 mb-4">Delete Your Account?</h3>
      <p className="text-sm text-gray-300 mb-4">This action is permanent and cannot be undone. All your data will be removed.</p>
      <div className="space-y-3 mb-6">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={deleteConfirmedTick}
            onChange={(e) => setDeleteConfirmedTick(e.target.checked)}
            className="mt-1 accent-red-500"
          />
          <span className="text-sm text-gray-300">I understand this will permanently delete my account and all associated data</span>
        </label>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setShowDeleteAccountModal(false)}
          className="flex-1 px-4 py-3 bg-[#064e3f] hover:bg-[#0a634f] text-white font-bold rounded-xl transition-all"
        >
          Cancel
        </button>
        <button
          onClick={confirmAndExecuteDeleteAccount}
          disabled={!deleteConfirmedTick}
          className="flex-1 px-4 py-3 bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all"
        >
          Delete Account
        </button>
      </div>
    </div>
  </div>
)}
</div>
);
}
           
