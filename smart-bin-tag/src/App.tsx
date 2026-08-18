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

// Import the configured Nhost client instance and helper utilities
import { nhost } from './lib/nhost';

import { registerServiceWorker, syncCollectionAlertToNhost, sendNativeDeviceNotification, syncNotificationSettingsToNhost, requestPushNotificationPermission } from './lib/pushNotifications';

interface RouteState {
  view: string;
  serialNumber?: string;
  action?: 'found' | 'damaged' | 'message';
}

export default function App() {
  // --- CORE STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [route, setRoute] = useState<RouteState>({ view: 'home' });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Global collection reminder alarms
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarmData | null>(null);
  const [activeAlarmBin, setActiveAlarmBin] = useState<Bin | null>(null);
  const [activeAlarmType, setActiveAlarmType] = useState<string | null>(null);
  const [dismissedAlarms, setDismissedAlarms] = useState<string[]>([]);
  const [snoozedAlarms, setSnoozedAlarms] = useState<Record<string, number>>({});

  // Database synced arrays
  const [users, setUsers] = useState<User[]>([]);
  const [bins, setBins] = useState<Bin[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reports, setReports] = useState<BinReport[]>([]);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [tags, setTags] = useState<BinTag[]>([]);

  // Launch Sequence States
  const [launchStep, setLaunchStep] = useState<1 | 2 | 3 | 4>(() => {
    const hasSession = !!localStorage.getItem('sbt_logged_in_uid');
    return hasSession ? 2 : 1;
  });
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const startStep = localStorage.getItem('sbt_logged_in_uid') ? 2 : 1;
    
    let t1: any;
    let t2: any;
    let t3: any;

    if (startStep === 1) {
      // Step 1: 2.5s (Displays black logo)
      t1 = setTimeout(() => {
        setLaunchStep(2);
      }, 2500);

      // Step 2: 2.5s (Displays green logo)
      t2 = setTimeout(() => {
        setLaunchStep(3);
      }, 5000);

      // Step 3: 2.5s (Displays Welcome container and progress bar)
      t3 = setTimeout(() => {
        setLaunchStep(4);
      }, 7500);
    } else {
      // Skip step 1: Step 2: 2.5s (Displays green logo)
      t2 = setTimeout(() => {
        setLaunchStep(3);
      }, 2500);

      // Step 3: 2.5s (Displays Welcome container and progress bar)
      t3 = setTimeout(() => {
        setLaunchStep(4);
      }, 5000);
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

  // Account Settings Profile states
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

  // Delete Account Modal States
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteReasons, setDeleteReasons] = useState<string[]>([]);
  const [deleteFeedback, setDeleteFeedback] = useState('');
  const [deleteConfirmedTick, setDeleteConfirmedTick] = useState(false);

  // Register Service Worker for native phone/tablet background notifications
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Update document title for browser tabs with brand pattern
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

  // --- NHOST AUTHENTICATION SUBSCRIPTION EXAMPLE ---
  useEffect(() => {
    // Automatically listen to user session events (login, logout, refresh) from Nhost
    const unsubscribe = nhost.sessionStorage.onChange((session) => {
      console.log('[Nhost Event] Session Changed:', session);
      if (session?.user) {
        // Here we dynamically update our user state from the Nhost active session
        const email = session.user.email || '';
        if (email) {
          console.log(`Logged into Nhost as: ${email}`);
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
            
            // Switch to home view automatically upon login/session detection as per instructions
            setRoute(prev => {
              return { view: 'home' };
            });
          }
        }
      } else {
        console.log('No active Nhost authentication session detected.');
      }
    });

    // Clean up subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // --- REFRESH DATABASE SYSTEM ---
  const syncLocalDatabaseState = () => {
    // Current logged in user
    const user = mockDb.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      // Sync personal records
      setBins(mockDb.getBins(user.uid));
      setNotifications(mockDb.getNotifications(user.uid));
      
      // Initialize profile settings forms
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

    // Always sync global admin visibility arrays
    setUsers(mockDb.getUsers());
    setReports(mockDb.getReports());
    setMessages(mockDb.getMessages());
    setTags(mockDb.getTags());
  };

  // Run on mount
  useEffect(() => {
    syncLocalDatabaseState();

    // Subscribe to Nhost Realtime-like mockDb subscriptions
    const unsubscribeDb = mockDb.subscribeToDb(() => {
      console.log('[Real-time Sync] Database change detected! Re-syncing applet state...');
      syncLocalDatabaseState();
    });
    
    // Check if deep linked via query parameter or simulated NFC scanning
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

    return () => {
      unsubscribeDb();
    };
  }, []);

  // --- AUDIO SYNTHESIZER ---
  const playSynthesizedAlarm = (toneName: string) => {
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
      } else { // Snooze Harmony
        osc.type = 'sine';
        osc.frequency.setValueAtTime(329.63, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.25);
      }
      
      // Set to high gain volume for clear, loud audible alarms
      gain.gain.setValueAtTime(0.85, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch (e) {
      console.warn("Audio Context blocked or failed:", e);
    }
  };

  // --- ALARM MONITOR EFFECT ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeAlarmBin) return; // If an alarm is showing, wait for user response

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentDateStrLocal = `${year}-${month}-${day}`; // "YYYY-MM-DD" in local time
      
      let currentDateStrUTC = '';
      try {
        currentDateStrUTC = now.toISOString().split('T')[0]; // "YYYY-MM-DD" in UTC
      } catch (err) {
        currentDateStrUTC = currentDateStrLocal;
      }

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 ? hours % 12 : 12;
      const currentTimeStr12 = `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`; // "hh:mm AM/PM"
      const currentTimeStr24 = `${String(hours).padStart(2, '0')}:${minutes}`; // "HH:MM"

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

      // Scan all bins registered to this account (fires whether a bin is selected or not)
      for (const bin of bins) {
        // 1. Before Collection Alarm Check
        if (bin.beforeCollectionEnabled && (bin.beforeCollectionDate === currentDateStrLocal || bin.beforeCollectionDate === currentDateStrUTC)) {
          if (checkTimeMatch(bin.beforeCollectionTime, currentTimeStr12, currentTimeStr24)) {
            const alarmId = `${bin.binId}-before-${currentMinuteKey}`;
            const snoozeKey = `${bin.binId}-before`;
            const isSnoozed = snoozedAlarms[snoozeKey] && Date.now() < snoozedAlarms[snoozeKey];

            if (!dismissedAlarms.includes(alarmId) && !isSnoozed) {
              const title = `🚨 BEFORE COLLECTION ALERT: ${bin.binType.toUpperCase()} BIN (${bin.serialNumber})`;
              const body = `Attention! Put out your ${bin.colorName} ${bin.binType} bin for collection at ${bin.address || 'your address'}. Alert set for ${bin.beforeCollectionTime}.`;
              
              const tone = bin.alarmTone || 'Chime Classic';
              setActiveAlarm({
                serialNumber: bin.serialNumber,
                label: 'Evening Before Collection Alarm',
                tone,
                time: bin.beforeCollectionTime || currentTimeStr12
              });

              if (currentUser) {
                // Dispatch native device push notification + in-app notification
                mockDb.addNotification(currentUser.uid, 'Collection Reminder', title, body, '/');
                // Sync to Nhost / Hasura backend collection_alerts table
                syncCollectionAlertToNhost(currentUser.uid, bin.binId, 'BEFORE_COLLECTION', title, body);
              }

              setDismissedAlarms(prev => [...prev, alarmId]);
            }
          }
        }

        // 2. Collection Day Alarm Check
        if (bin.collectionDayEnabled && (bin.collectionDayDate === currentDateStrLocal || bin.collectionDayDate === currentDateStrUTC)) {
          if (checkTimeMatch(bin.collectionDayTime, currentTimeStr12, currentTimeStr24)) {
            const alarmId = `${bin.binId}-day-${currentMinuteKey}`;
            const snoozeKey = `${bin.binId}-day`;
            const isSnoozed = snoozedAlarms[snoozeKey] && Date.now() < snoozedAlarms[snoozeKey];

            if (!dismissedAlarms.includes(alarmId) && !isSnoozed) {
              const title = `🔔 COLLECTION DAY ALERT: ${bin.binType.toUpperCase()} BIN (${bin.serialNumber})`;
              const body = `Reminder: Today is collection day for your ${bin.colorName} ${bin.binType} bin at ${bin.address || 'your address'}. Collection time: ${bin.collectionDayTime}.`;

              const tone = bin.alarmTone || 'Chime Classic';
              setActiveAlarm({
                serialNumber: bin.serialNumber,
                label: 'Collection Day Morning Alarm',
                tone,
                time: bin.collectionDayTime || currentTimeStr12
              });

              if (currentUser) {
                // Dispatch native device push notification + in-app notification
                mockDb.addNotification(currentUser.uid, 'Collection Reminder', title, body, '/');
                // Sync to Nhost / Hasura backend collection_alerts table
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
    
    // Snooze for requested duration (minutes)
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

  // --- ROUTING ACTIONS ---
  const handleSetView = (view: string, params?: Record<string, any>) => {
    setErrorBanner(null);
    setSettingsSuccess(null);
    setRoute({
      view,
      serialNumber: params?.serialNumber,
      action: params?.action
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- AUTH HOOKS ---
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

  // --- PUBLIC INTERACTIVE SHORTCUTS ---
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

  // --- NOTIFICATION HANDLERS ---
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

  // --- ACCOUNT PROFILE SUBMISSIONS ---
  const handleAutofillAddress = () => {
    const matched = lookupUkPostcodeArea(postcode || 'SW1A 1AA');
    if (matched) {
      if (!postcode) setPostcode(`${matched.code}1 1AA`);
      setHouseNumber('14');
      setStreet(matched.sampleStreet || 'High Street');
      alert(`📍 Address autofilled for ${matched.name} (${matched.county}, ${matched.country})!`);
    } else {
      if (!postcode) setPostcode('SW1A 1AA');
      setHouseNumber('14');
      setStreet('High Street');
      alert('📍 Address details autofilled based on UK postcode lookup!');
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
    } catch (err) {
      console.error('Failed to update avatar:', err);
    }
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
          console.error(err);
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
      } catch (err) {
        // Safe fallback
      }
      localStorage.removeItem('sbt_logged_in_uid');
      setCurrentUser(null);
      setShowDeleteAccountModal(false);
      setDeleteReasons([]);
      setDeleteFeedback('');
      setDeleteConfirmedTick(false);
      setRoute({ view: 'home' });
      alert('🔒 Your account, registered bin tags, collection alerts, support tickets, messages, and reports have been permanently deleted from the web app and Nhost / Hasura database.');
    } catch (err: any) {
      alert('Error deleting account: ' + (err?.message || 'Unknown error'));
    }
  };

  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  if (launchStep < 4) {
    return (
      <div className={`fixed inset-0 z-[9999] ${launchStep === 1 ? 'bg-black' : 'bg-[#04352b]'} flex flex-col items-center justify-center select-none font-sans overflow-hidden transition-colors duration-500`}>
        {/* Step 1: Black background with centered shining logo */}
        {launchStep === 1 && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] bg-gradient-to-tr from-[#0a5222] via-[#22a833] to-[#45D153] flex items-center justify-center shadow-[0_0_50px_rgba(69,209,83,0.6)] border border-[#45D153]/40 shrink-0">
              <span className="text-white text-3xl sm:text-4xl font-black tracking-tight font-sans">
                SBT
              </span>
            </div>
            <div className="text-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-black text-[#45D153] tracking-[0.15em] font-sans uppercase drop-shadow-[0_0_35px_rgba(69,209,83,0.5)]">
                SMARTBINTAGAPP
              </span>
              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#45D153] to-transparent mx-auto mt-3"></div>
            </div>
          </div>
        )}

        {/* Step 2: SBT visual brand logo with full solid white text wordmark (Moved from step 1) */}
        {launchStep === 2 && (
          <div className="flex flex-col items-center justify-center animate-pulse duration-1000">
            {/* SBT visual brand logo: Green gradient squircle + solid white wordmark */}
            <div className="flex items-center space-x-4 sm:space-x-6 scale-95 sm:scale-100">
              {/* SBT Rounded Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[24px] bg-gradient-to-tr from-[#12912a] via-[#33c944] to-[#45D153] flex items-center justify-center shadow-[0_0_40px_rgba(69,209,83,0.35)] border border-[#45D153]/20 shrink-0">
                <span className="text-white text-2xl sm:text-3xl font-black tracking-tight font-sans">
                  SBT
                </span>
              </div>
              {/* Full Solid White Wordmark */}
              <div className="flex flex-col justify-center">
                <span className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.05em] text-white select-none font-sans">
                  SMART BIN TAG
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Welcome Box with progress meter */}
        {launchStep === 3 && (
          <div className="w-full max-w-sm sm:max-w-md mx-4 p-8 bg-[#02241d]/90 border border-[#064e3f] rounded-3xl shadow-2xl space-y-6 text-center animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="space-y-2">
              <span className="text-[10px] text-[#45D153] font-mono tracking-[0.3em] font-bold uppercase block">
                DISTRICT PLATE SYSTEM
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight">
                Welcome to Smart Bin Tag
              </h2>
              <p className="text-xs text-emerald-300/60 font-sans max-w-xs mx-auto">
                Initializing local security databases & cloud profiles with real-time Nhost syncing...
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="space-y-2.5">
              <div className="w-full h-2.5 bg-[#011a14] border border-[#064e3f]/60 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#45D153] rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(69,209,83,0.4)]"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
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
      
      {/* Central Header Navigation */}
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

      {/* Global Slide-Over Notification Center drawer */}
      <NotificationCenter 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDelete={handleDeleteNotification}
        setView={handleSetView}
      />

      {/* --- CENTRAL VIEW ROUTING --- */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME PAGE */}
        {route.view === 'home' && (
          <HeroSection 
            setView={handleSetView}
            onEnterSerialDirectly={handleEnterSerialDirectly}
            currentUser={currentUser}
            bins={bins}
            onRefresh={syncLocalDatabaseState}
          />
        )}

        {/* VIEW 2: LOGIN SCREEN */}
        {route.view === 'login' && (
          <Auth 
            initialMode="login"
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => handleSetView('home')}
            setView={handleSetView}
          />
        )}

        {/* VIEW 3: REGISTER ACCOUNT SCREEN */}
        {route.view === 'register' && (
          <Auth 
            initialMode="register"
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => handleSetView('home')}
            setView={handleSetView}
          />
        )}

        {/* VIEW 4: SECURE OWNER DASHBOARD */}
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

        {/* VIEW 5: MY BINS MANAGEMENT & DETAIL MODALS */}
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

        {/* VIEW 6: REGISTER SMART BIN STICKER */}
        {currentUser && route.view === 'register-bin' && (
          <RegisterBin 
            ownerId={currentUser.uid}
            preFilledSerial={route.serialNumber}
            onSuccess={syncLocalDatabaseState}
            setView={handleSetView}
          />
        )}

        {/* VIEW 7: PUBLIC FOUND BIN REPORT PAGE */}
        {route.view === 'report-found' && (
          <Reports 
            initialAction="found"
            initialSerial={route.serialNumber}
            setView={handleSetView}
            onRefresh={syncLocalDatabaseState}
          />
        )}

        {/* VIEW 8: PUBLIC DAMAGE REPORT PAGE */}
        {route.view === 'report-damage' && (
          <Reports 
            initialAction="damaged"
            initialSerial={route.serialNumber}
            setView={handleSetView}
            onRefresh={syncLocalDatabaseState}
          />
        )}

        {/* VIEW 8B: PUBLIC REPORT PAGE (FALLBACK) */}
        {(route.view === 'report-message' || route.view === 'chat-feed') && (
          <Reports 
            initialAction="found"
            initialSerial={route.serialNumber}
            setView={handleSetView}
            onRefresh={syncLocalDatabaseState}
          />
        )}

        {/* VIEW 9: SECURE ADMIN AUDIT CENTRE */}
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

        {/* VIEW 10: USER PROFILE ACCOUNT SETTINGS */}
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
                {/* AVATAR PROFILE PICTURE SECTION */}
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

                  {/* Active Avatar Preview */}
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
                      <p className="text-[10px] text-emerald-400/70 font-mono">
                        Saves permanently across all your login sessions
                      </p>
                    </div>
                  </div>

                  {/* Expandable Avatar Selection Grid & Upload */}
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
                                className={`relative rounded-full aspect-square border-2 transition-all p-0.5 overflow-hidden hover:scale-105 active:scale-95 cursor-pointer bg-[#04352b] ${
                                  isSelected ? 'border-[#45D153] ring-2 ring-[#45D153]/30' : 'border-[#064e3f] hover:border-emerald-400/50'
                                }`}
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
                                  <span className="absolute bottom-0 right-0 bg-[#45D153] text-[#04352b] rounded-full p-0.5 border border-[#02241d]">
                                    <Check className="h-2.5 w-2.5 font-black" />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Device Upload */}
                      <div className="border-t border-[#064e3f]/40 pt-3 space-y-2">
                        <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold block">Upload Device Photo</span>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#064e3f] hover:border-[#45D153]/50 rounded-xl p-3 transition-colors relative bg-[#02241d]/50 group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUploadInSettings}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Camera className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span className="text-xs text-emerald-200 font-bold mt-1 font-sans">Click or Drop Image</span>
                          <span className="text-[9px] text-emerald-500/70 font-mono">PNG, JPG, WEBP (Max 2MB)</span>
                        </div>
                        {avatarUploadErr && (
                          <p className="text-rose-400 text-xs text-center font-sans">❌ {avatarUploadErr}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase mb-1.5 font-sans">First Name</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      className="px-3 w-full h-[46px] bg-[#011a14] border border-[#064e3f] rounded-lg text-sm text-emerald-100 outline-none focus:border-[#45D153] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase mb-1.5 font-sans">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="px-3 w-full h-[46px] bg-[#011a14] border border-[#064e3f] rounded-lg text-sm text-emerald-100 outline-none focus:border-[#45D153] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase mb-1.5 font-sans">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="px-3 w-full h-[46px] bg-[#011a14] border border-[#064e3f] rounded-lg text-sm text-emerald-100 outline-none focus:border-[#45D153] transition-all font-mono"
                  />
                </div>

                {/* ADDRESS WITH POSTCODE AT START & AUTOFILL */}
                <div className="pt-3 border-t border-[#064e3f] space-y-3">
                  <h3 className="text-[10px] font-black tracking-widest text-[#45D153] uppercase font-mono">Home Address</h3>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase font-sans">Postcode (First)</label>
                      <button
                        type="button"
                        onClick={handleAutofillAddress}
                        className="text-[10px] font-bold text-[#45D153] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer font-sans"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Autofill Address</span>
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={postcode} 
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setPostcode(val);
                        const matched = lookupUkPostcodeArea(val);
                        if (matched && !street) {
                          setHouseNumber('14');
                          setStreet(matched.sampleStreet || 'High Street');
                        }
                      }}
                      placeholder="e.g. SW1A 1AA or B1 1AA"
                      className="px-3 w-full h-[46px] bg-[#011a14] border border-[#064e3f] rounded-lg text-sm text-emerald-100 outline-none focus:border-[#45D153] transition-all font-mono font-bold uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase font-sans">Or Select UK District / Area (122 Areas)</label>
                    <PostcodeSelector
                      selectedCode={postcode ? postcode.substring(0, 2).trim() : undefined}
                      onSelectArea={(area) => {
                        const samplePc = `${area.code}1 1AA`;
                        setPostcode(samplePc);
                        setHouseNumber('14');
                        setStreet(area.sampleStreet || 'High Street');
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase mb-1.5 font-sans">House / Name</label>
                      <input 
                        type="text" 
                        value={houseNumber} 
                        onChange={(e) => setHouseNumber(e.target.value)}
                        placeholder="e.g. 14"
                        className="px-3 w-full h-[46px] bg-[#011a14] border border-[#064e3f] rounded-lg text-sm text-emerald-100 outline-none focus:border-[#45D153] transition-all font-sans"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black tracking-widest text-[#45D153] uppercase mb-1.5 font-sans">Street Address</label>
                      <input 
                        type="text" 
                        value={street} 
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="e.g. High Street"
                        className="px-3 w-full h-[46px] bg-[#011a14] border border-[#064e3f] rounded-lg text-sm text-emerald-100 outline-none focus:border-[#45D153] transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time Alarm Notification Delivery */}
                <div className="pt-4 border-t border-[#064e3f] space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black tracking-widest text-emerald-400 uppercase font-mono">Notification Delivery</h3>
                    <span className="text-[9px] font-bold text-[#45D153] bg-[#45D153]/10 border border-[#45D153]/30 px-2 py-0.5 rounded font-mono uppercase">
                      Connected to Alarms
                    </span>
                  </div>
                  
                  <label className="flex items-center space-x-3 text-xs text-emerald-100/80 font-medium select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={pushPref} 
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        setPushPref(checked);
                        if (checked) {
                          await requestPushNotificationPermission(currentUser?.uid);
                        } else if (currentUser) {
                          syncNotificationSettingsToNhost(currentUser.uid, false);
                        }
                      }}
                      className="rounded border-[#064e3f] bg-[#011a14] text-[#45D153] focus:ring-0 focus:ring-offset-0 h-4.5 w-4.5 cursor-pointer"
                    />
                    <span>Real-Time Push Notifications on Mobile/Tablet Home Screen (When App Closed or Minimized)</span>
                  </label>

                  <div className="pt-1">
                    <p className="text-[10px] text-emerald-100/60 font-mono">
                      Collection alerts pop up natively on your device home screen lockscreen via Service Worker & Nhost Hasura sync.
                    </p>
                  </div>

                  <label className="flex items-center space-x-3 text-xs text-emerald-100/80 font-medium select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={emailPref} 
                      onChange={(e) => setEmailPref(e.target.checked)}
                      className="rounded border-[#064e3f] bg-[#011a14] text-[#45D153] focus:ring-0 focus:ring-offset-0 h-4.5 w-4.5 cursor-pointer"
                    />
                    <span>Real-Time Email Notifications (Collection Reminders & Found Alerts)</span>
                  </label>

                  <label className="flex items-center space-x-3 text-xs text-emerald-100/80 font-medium select-none cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={inAppPref} 
                      onChange={(e) => setInAppPref(e.target.checked)}
                      className="rounded border-[#064e3f] bg-[#011a14] text-[#45D153] focus:ring-0 focus:ring-offset-0 h-4.5 w-4.5 cursor-pointer"
                    />
                    <span>Real-Time In-App Notifications & Audio Synthesizer Alarms</span>
                  </label>
                </div>

                <button 
                  type="submit"
                  className="w-full h-[52px] bg-[#45D153] hover:bg-[#5ce06a] text-white font-black tracking-widest uppercase rounded-xl text-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-4"
                >
                  <span className="text-white font-black">Save Profile Settings</span>
                </button>
              </form>

                {/* Legal & Compliance Links in Preferences */}
                <div className="pt-4 border-t border-[#064e3f] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-emerald-300">
                  <span className="text-emerald-400/80 font-bold uppercase text-[9px]">Legal Agreements:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSetView('eula')}
                      className="text-[#45D153] hover:underline font-bold cursor-pointer"
                    >
                      EULA (Licence)
                    </button>
                    <span className="text-emerald-600">&bull;</span>
                    <button
                      type="button"
                      onClick={() => handleSetView('privacy')}
                      className="text-[#45D153] hover:underline font-bold cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    <span className="text-emerald-600">&bull;</span>
                    <button
                      type="button"
                      onClick={() => handleSetView('terms')}
                      className="text-[#45D153] hover:underline font-bold cursor-pointer"
                    >
                      Terms of Service
                    </button>
                  </div>
                </div>

                {/* Danger Zone delete account */}
                <div className="pt-6 border-t border-[#064e3f] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Deactivate Profile</h4>
                    <p className="text-[10px] text-emerald-100/50 mt-0.5">Scrub all registered physical stickers.</p>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border border-rose-900/40 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 11: EULA & LEGAL COMPLIANCE PORTAL */}
          {(route.view === 'eula' || route.view === 'privacy' || route.view === 'terms' || route.view === 'cookie') && (
            <LegalDocuments 
              initialTab={route.view === 'privacy' ? 'privacy' : route.view === 'terms' ? 'terms' : route.view === 'cookie' ? 'cookie' : 'eula'}
              onBack={() => handleSetView(currentUser ? 'dashboard' : 'home')}
              setView={handleSetView}
            />
          )}

          {/* VIEW 12: CONTACT & SUPPORT HUB */}
          {(route.view === 'contact' || route.view === 'support') && (
            <ContactSupportHub
              currentUser={currentUser}
              bins={bins}
              onBack={() => handleSetView(currentUser ? 'dashboard' : 'home')}
              setView={handleSetView}
            />
          )}

        </main>

      {/* COLLECTION ALARM POPUP REMOVED AS REQUESTED */}

      {/* DELETE ACCOUNT QUESTIONNAIRE & CONFIRMATION POPUP MODAL */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
          <div className="max-w-md w-full bg-[#02241d] rounded-2xl border-2 border-rose-900/50 p-6 sm:p-8 text-white space-y-5 shadow-2xl animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-[#064e3f] pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Delete Account</h3>
                  <p className="text-[10px] text-rose-300/80 font-mono">Permanent Data & Tag Scrubbing</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeleteAccountModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#064e3f]/40 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-emerald-100/80 leading-relaxed font-sans">
                Why are you choosing to delete your Smart Bin Tag account? (Select all that apply)
              </p>

              <div className="space-y-2">
                {[
                  'No longer using Smart Bin Tag service',
                  'Moving to a new address / district',
                  'Privacy concerns or creating a new account',
                  'Technical issues or notification problems',
                  'Other reason'
                ].map((reason) => (
                  <label key={reason} className="flex items-center space-x-3 text-xs text-emerald-100/90 font-medium select-none cursor-pointer bg-[#011a14] p-2.5 rounded-xl border border-[#064e3f] hover:border-emerald-500/40 transition-colors">
                    <input 
                      type="checkbox"
                      checked={deleteReasons.includes(reason)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDeleteReasons([...deleteReasons, reason]);
                        } else {
                          setDeleteReasons(deleteReasons.filter(r => r !== reason));
                        }
                      }}
                      className="rounded border-[#064e3f] bg-[#02241d] text-rose-500 focus:ring-0 h-4.5 w-4.5 cursor-pointer"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-1 font-sans">
                  Tell us more (Optional)
                </label>
                <textarea 
                  value={deleteFeedback}
                  onChange={(e) => setDeleteFeedback(e.target.value)}
                  placeholder="Your feedback helps us improve Smart Bin Tag..."
                  rows={2}
                  className="w-full bg-[#011a14] border border-[#064e3f] rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500 transition-all font-sans"
                />
              </div>

              {/* Mandatory Confirmation Checkbox */}
              <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl space-y-2">
                <label className="flex items-start space-x-2.5 text-xs text-rose-200 font-semibold select-none cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={deleteConfirmedTick}
                    onChange={(e) => setDeleteConfirmedTick(e.target.checked)}
                    className="rounded border-rose-800 bg-[#011a14] text-rose-500 focus:ring-0 h-5 w-5 mt-0.5 flex-shrink-0 cursor-pointer"
                  />
                  <span className="leading-snug">
                    I confirm that I want to permanently delete my account. I understand that all my user information, user ID, tags, collection alerts, support tickets, messages, and reports will be permanently scrubbed from the web app and Nhost / Hasura database.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="w-1/2 py-3 rounded-xl border border-[#064e3f] hover:bg-[#064e3f]/40 text-emerald-300 font-bold uppercase tracking-wider text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!deleteConfirmedTick}
                onClick={confirmAndExecuteDeleteAccount}
                className={`w-1/2 py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all cursor-pointer flex items-center justify-center shadow-lg ${
                  deleteConfirmedTick 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer active:scale-95 shadow-rose-900/40' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                }`}
              >
                Confirm & Delete
              </button>
            </div>

          </div>
        </div>
      )}

      {/* GLOBAL COOKIE CONSENT POPUP BANNER */}
      <CookieConsentBanner 
        onNavigate={(targetView) => handleSetView(targetView)}
      />

    </div>
  );
}

interface AlarmPopupProps {
  bin: Bin;
  type: string;
  onSnooze: (minutes: number) => void;
  onOK: () => void;
  playTone: (tone: string) => void;
}

function AlarmPopup({ bin, type, onSnooze, onOK, playTone }: AlarmPopupProps) {
  const tone = bin.alarmTone || 'Chime Classic';

  useEffect(() => {
    // Play immediately on mount
    playTone(tone);

    // Continuous sound loop: repeat every 900ms until user acknowledges or snoozes
    const audioInterval = setInterval(() => {
      playTone(tone);
    }, 900);

    return () => clearInterval(audioInterval);
  }, [tone, playTone]);

  // Color helper
  const getBorderColor = (color: string) => {
    switch (color) {
      case 'Black': return 'border-slate-800';
      case 'Green': return 'border-emerald-500';
      case 'Blue': return 'border-blue-500';
      case 'Brown': return 'border-amber-700';
      case 'Purple': return 'border-purple-500';
      case 'Red': return 'border-rose-500';
      default: return 'border-orange-500';
    }
  };

  const getBgColor = (color: string) => {
    switch (color) {
      case 'Black': return 'bg-slate-950';
      case 'Green': return 'bg-emerald-950';
      case 'Blue': return 'bg-blue-950';
      case 'Brown': return 'bg-amber-950';
      case 'Purple': return 'bg-purple-950';
      case 'Red': return 'bg-rose-950';
      default: return 'bg-orange-950';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
      <div className={`max-w-md w-full bg-[#02241d] rounded-2xl border-2 ${getBorderColor(bin.binType)} p-6 text-center space-y-5 shadow-2xl animate-scale-up`}>
        
        {/* Animated icon bell container */}
        <div className="flex flex-col items-center">
          <div className={`h-16 w-16 rounded-full ${getBgColor(bin.binType)} border-2 ${getBorderColor(bin.binType)} text-white flex items-center justify-center animate-bounce mb-3`}>
            <Bell className="h-8 w-8 animate-pulse text-[#45D153]" />
          </div>
          <span className="text-[10px] font-black tracking-widest text-[#45D153] uppercase font-mono bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            {type} Alarm Fired!
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug">
            Your {bin.binType} Bin Requires Attention
          </h3>
          <p className="text-xs text-emerald-100/70 max-w-xs mx-auto leading-relaxed">
            Registered Tag ID: <strong className="text-white font-mono">{bin.serialNumber}</strong><br />
            Address: <span className="font-semibold text-emerald-300">{bin.propertyName ? `${bin.propertyName}, ` : ''}{bin.houseNumber} {bin.street}</span>
          </p>
        </div>

        {/* Ringtone name indicator */}
        <div className="py-2.5 bg-[#011a14] border border-[#064e3f] rounded-lg flex items-center justify-center gap-1.5 text-[10px] text-emerald-200 uppercase tracking-widest font-mono">
          <Volume2 className="h-3.5 w-3.5 text-[#45D153]" />
          Playing Tone: {tone}
        </div>

        {/* Snooze options (15 / 30 / 60 minutes) */}
        <div className="space-y-2 pt-1">
          <label className="block text-[10px] font-black tracking-widest text-emerald-400 uppercase font-mono text-center">
            Snooze Options
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSnooze(15)}
              className="py-2.5 rounded-xl border border-emerald-500/30 hover:bg-[#064e3f]/60 text-emerald-300 font-extrabold uppercase tracking-wider text-[11px] transition-all active:scale-95 cursor-pointer flex items-center justify-center bg-[#011a14]"
            >
              15 Mins
            </button>
            <button
              onClick={() => onSnooze(30)}
              className="py-2.5 rounded-xl border border-emerald-500/30 hover:bg-[#064e3f]/60 text-emerald-300 font-extrabold uppercase tracking-wider text-[11px] transition-all active:scale-95 cursor-pointer flex items-center justify-center bg-[#011a14]"
            >
              30 Mins
            </button>
            <button
              onClick={() => onSnooze(60)}
              className="py-2.5 rounded-xl border border-emerald-500/30 hover:bg-[#064e3f]/60 text-emerald-300 font-extrabold uppercase tracking-wider text-[11px] transition-all active:scale-95 cursor-pointer flex items-center justify-center bg-[#011a14]"
            >
              60 Mins
            </button>
          </div>
        </div>

        {/* OK / Dismiss */}
        <div className="pt-2">
          <button
            onClick={onOK}
            className="w-full h-[50px] rounded-xl bg-[#45D153] hover:bg-[#5ce06a] text-[#04352b] font-black uppercase tracking-widest text-xs shadow-lg shadow-[#45D153]/15 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            Acknowledge & Dismiss Alarm
          </button>
        </div>

      </div>
    </div>
  );
}
